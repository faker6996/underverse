"use client";

import * as React from "react";
import { Dot } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useLocale, useTranslations } from "@/lib/i18n/translation-adapter";
import { Sheet } from "../Sheet";
import { Tooltip } from "../Tooltip";
import Button from "../Button";
import type {
  CalendarTimelineEvent,
  CalendarTimelineGroup,
  CalendarTimelineLabels,
  CalendarTimelineProps,
  CalendarTimelineResource,
  CalendarTimelineView,
} from "./types";
import { addZonedDays, addZonedMonths, getDtf, getIsoWeekInfo, localeToBCP47, startOfZonedDay } from "./date";
import { binarySearchFirstGE, binarySearchLastLE, clamp, intervalPack } from "./layout";
import { useClientWidth, useHorizontalScrollSync, useVirtualVariableRows } from "./hooks";
import { getSizeConfig } from "./config";
import { defaultEventTime, defaultMonthTitle, defaultSlotHeader } from "./defaults";
import { buildRows, computeSlotStarts, eventsByResourceId, getGroupResourceCounts, normalizeEvents, resourcesById, type CalendarTimelineRow } from "./model";
import { CalendarTimelineHeader } from "./CalendarTimelineHeader";
import { DefaultGroupRow, ResourceRowCell } from "./CalendarTimelineRowCells";
import { Combobox } from "../Combobox";

type Slot = { start: Date; label: React.ReactNode; isToday: boolean };

export default function CalendarTimeline<TResourceMeta = unknown, TEventMeta = unknown>({
  resources,
  events,
  size = "md",
  enableEventSheet,
  eventSheetSize = "md",
  renderEventSheet,
  selectedEventId,
  defaultSelectedEventId,
  onSelectedEventIdChange,
  eventSheetOpen,
  defaultEventSheetOpen,
  onEventSheetOpenChange,
  view,
  defaultView = "month",
  onViewChange,
  date,
  defaultDate,
  onDateChange,
  weekStartsOn = 1,
  locale,
  timeZone,
  labels,
  formatters,
  groups,
  groupCollapsed,
  defaultGroupCollapsed,
  onGroupCollapsedChange,
  resourceColumnWidth,
  defaultResourceColumnWidth,
  onResourceColumnWidthChange,
  minResourceColumnWidth,
  maxResourceColumnWidth,
  rowHeight,
  defaultRowHeight,
  onRowHeightChange,
  minRowHeight,
  maxRowHeight,
  rowHeights,
  defaultRowHeights,
  onRowHeightsChange,
  enableLayoutResize,
  slotMinWidth,
  dayTimeStepMinutes = 60,
  maxLanesPerRow = 3,
  now,
  renderResource,
  renderGroup,
  renderEvent,
  interactions,
  onRangeChange,
  onEventClick,
  onEventDoubleClick,
  onCreateEventClick,
  onCreateEvent,
  onEventMove,
  onEventResize,
  onEventDelete,
  onMoreClick,
  virtualization,
  className,
  ...rest
}: CalendarTimelineProps<TResourceMeta, TEventMeta>) {
  const t = useTranslations("CalendarTimeline");
  const detectedLocale = useLocale();

  const resolvedLocale = React.useMemo(() => localeToBCP47(locale ?? detectedLocale), [locale, detectedLocale]);
  const resolvedTimeZone = React.useMemo(() => timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC", [timeZone]);

  const effectiveEnableEventSheet = enableEventSheet ?? Boolean(renderEventSheet);
  const isViewOnly = interactions?.mode === "view";
  const isControlledSelectedEventId = selectedEventId !== undefined;
  const [internalSelectedEventId, setInternalSelectedEventId] = React.useState<string | null>(defaultSelectedEventId ?? null);
  const activeSelectedEventId = isControlledSelectedEventId ? (selectedEventId as string | null) : internalSelectedEventId;
  const setSelectedEventId = React.useCallback(
    (next: string | null) => {
      if (!isControlledSelectedEventId) setInternalSelectedEventId(next);
      onSelectedEventIdChange?.(next);
    },
    [isControlledSelectedEventId, onSelectedEventIdChange],
  );

  const isControlledEventSheetOpen = eventSheetOpen !== undefined;
  const [internalEventSheetOpen, setInternalEventSheetOpen] = React.useState<boolean>(defaultEventSheetOpen ?? false);
  const activeEventSheetOpen = isControlledEventSheetOpen ? Boolean(eventSheetOpen) : internalEventSheetOpen;
  const setEventSheetOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlledEventSheetOpen) setInternalEventSheetOpen(next);
      onEventSheetOpenChange?.(next);
      if (!next) setSelectedEventId(null);
    },
    [isControlledEventSheetOpen, onEventSheetOpenChange, setSelectedEventId],
  );

  const sizeConfig = React.useMemo(() => getSizeConfig(size), [size]);

  const canResizeColumn = React.useMemo(() => {
    const cfg = enableLayoutResize;
    if (!cfg) return false;
    if (isViewOnly) return false;
    if (cfg === true) return true;
    return cfg.column !== false;
  }, [enableLayoutResize, isViewOnly]);

  const canResizeRow = React.useMemo(() => {
    const cfg = enableLayoutResize;
    if (!cfg) return false;
    if (isViewOnly) return false;
    if (cfg === true) return true;
    return cfg.row !== false;
  }, [enableLayoutResize, isViewOnly]);

  const isControlledResourceColumnWidth = resourceColumnWidth !== undefined;
  const [internalResourceColumnWidth, setInternalResourceColumnWidth] = React.useState<number>(() => {
    const init = defaultResourceColumnWidth ?? sizeConfig.resourceColumnWidth;
    return typeof init === "number" ? init : sizeConfig.resourceColumnWidth;
  });

  React.useEffect(() => {
    if (isControlledResourceColumnWidth) return;
    if (defaultResourceColumnWidth == null) return;
    setInternalResourceColumnWidth(defaultResourceColumnWidth);
  }, [defaultResourceColumnWidth, isControlledResourceColumnWidth]);

  const effectiveResourceColumnWidth: number | string = isControlledResourceColumnWidth ? (resourceColumnWidth as any) : internalResourceColumnWidth;

  const isControlledRowHeight = rowHeight !== undefined;
  const [internalRowHeight, setInternalRowHeight] = React.useState<number>(() => defaultRowHeight ?? sizeConfig.rowHeight);

  React.useEffect(() => {
    if (isControlledRowHeight) return;
    if (defaultRowHeight == null) return;
    setInternalRowHeight(defaultRowHeight);
  }, [defaultRowHeight, isControlledRowHeight]);

  const effectiveRowHeight = isControlledRowHeight ? (rowHeight as number) : internalRowHeight;
  const effectiveSlotMinWidth = slotMinWidth ?? sizeConfig.slotMinWidth;

  const colMin = minResourceColumnWidth ?? 160;
  const colMax = maxResourceColumnWidth ?? 520;
  const rowMin = minRowHeight ?? 36;
  const rowMax = maxRowHeight ?? 120;

  const isControlledView = view !== undefined;
  const [internalView, setInternalView] = React.useState<CalendarTimelineView>(defaultView);
  const activeView = isControlledView ? (view as CalendarTimelineView) : internalView;

  const isControlledDate = date !== undefined;
  const [internalDate, setInternalDate] = React.useState<Date>(() => defaultDate ?? new Date());
  const activeDate = isControlledDate ? (date as Date) : internalDate;

  const resolvedNow = now ?? new Date();

  const l: Required<CalendarTimelineLabels> = React.useMemo(
    () => ({
      today: labels?.today ?? t("today"),
      prev: labels?.prev ?? t("prev"),
      next: labels?.next ?? t("next"),
      month: labels?.month ?? t("month"),
      week: labels?.week ?? t("week"),
      day: labels?.day ?? t("day"),
      newEvent: labels?.newEvent ?? t("newEvent"),
      createEventTitle: labels?.createEventTitle ?? t("createEventTitle"),
      create: labels?.create ?? t("create"),
      cancel: labels?.cancel ?? t("cancel"),
      resource: labels?.resource ?? t("resource"),
      start: labels?.start ?? t("start"),
      end: labels?.end ?? t("end"),
      expandGroup: labels?.expandGroup ?? t("expandGroup"),
      collapseGroup: labels?.collapseGroup ?? t("collapseGroup"),
      more: labels?.more ?? ((n) => t("more", { n })),
      deleteConfirm: labels?.deleteConfirm ?? t("deleteConfirm"),
    }),
    [labels, t],
  );

  const setView = React.useCallback(
    (next: CalendarTimelineView) => {
      if (!isControlledView) setInternalView(next);
      onViewChange?.(next);
    },
    [isControlledView, onViewChange],
  );

  const setDate = React.useCallback(
    (next: Date) => {
      if (!isControlledDate) setInternalDate(next);
      onDateChange?.(next);
    },
    [isControlledDate, onDateChange],
  );

  const navigate = React.useCallback(
    (dir: -1 | 1) => {
      const base = activeDate;
      if (activeView === "month") {
        setDate(addZonedMonths(base, dir, resolvedTimeZone));
        return;
      }
      if (activeView === "week") {
        setDate(addZonedDays(base, dir * 7, resolvedTimeZone));
        return;
      }
      setDate(addZonedDays(base, dir, resolvedTimeZone));
    },
    [activeDate, activeView, resolvedTimeZone, setDate],
  );

  const goToday = React.useCallback(() => setDate(resolvedNow), [resolvedNow, setDate]);

  const [internalCollapsed, setInternalCollapsed] = React.useState<Record<string, boolean>>(() => defaultGroupCollapsed ?? {});
  const collapsed = groupCollapsed ?? internalCollapsed;
  const setCollapsed = React.useCallback(
    (next: Record<string, boolean>) => {
      if (!groupCollapsed) setInternalCollapsed(next);
      onGroupCollapsedChange?.(next);
    },
    [groupCollapsed, onGroupCollapsedChange],
  );

  const rows: CalendarTimelineRow<TResourceMeta>[] = React.useMemo(() => buildRows({ resources, groups, collapsed }), [resources, groups, collapsed]);

  const groupResourceCounts = React.useMemo(() => getGroupResourceCounts(resources), [resources]);

  const { slots, range } = React.useMemo((): { slots: Slot[]; range: { start: Date; end: Date } } => {
    const { start, end, slotStarts } = computeSlotStarts({
      view: activeView,
      date: activeDate,
      timeZone: resolvedTimeZone,
      weekStartsOn,
      dayTimeStepMinutes,
    });
    const todayStart = startOfZonedDay(resolvedNow, resolvedTimeZone).getTime();
    const slotItems: Slot[] = slotStarts.map((s) => ({
      start: s,
      label:
        formatters?.slotHeader?.(s, { view: activeView, locale: resolvedLocale, timeZone: resolvedTimeZone }) ??
        defaultSlotHeader(s, activeView, resolvedLocale, resolvedTimeZone),
      isToday: startOfZonedDay(s, resolvedTimeZone).getTime() === todayStart,
    }));

    return { slots: slotItems, range: { start, end } };
  }, [activeView, activeDate, resolvedTimeZone, resolvedLocale, weekStartsOn, dayTimeStepMinutes, resolvedNow, formatters]);

  React.useEffect(() => {
    onRangeChange?.(range);
  }, [range.start, range.end, onRangeChange]);

  const leftRef = React.useRef<HTMLDivElement>(null);
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const headerRef = React.useRef<HTMLDivElement>(null);
  const bodyClientWidth = useClientWidth(bodyRef);

  const slotStarts = React.useMemo(() => slots.map((s) => s.start), [slots]);
  const slotWidth = React.useMemo(() => {
    const baseSlotWidth = activeView === "month" ? effectiveSlotMinWidth * 3 : effectiveSlotMinWidth;

    if (activeView !== "week") return baseSlotWidth;
    if (bodyClientWidth <= 0) return baseSlotWidth;
    if (slots.length <= 0) return baseSlotWidth;
    return Math.max(baseSlotWidth, bodyClientWidth / slots.length);
  }, [activeView, bodyClientWidth, effectiveSlotMinWidth, slots.length]);
  const gridWidth = slots.length * slotWidth;

  const normalizedEvents = React.useMemo(() => {
    return normalizeEvents({ events: events as CalendarTimelineEvent<TEventMeta>[], range, view: activeView, timeZone: resolvedTimeZone });
  }, [events, range, activeView, resolvedTimeZone]);

  const eventsByResource = React.useMemo(() => {
    return eventsByResourceId(normalizedEvents);
  }, [normalizedEvents]);

  const resourceById = React.useMemo(() => {
    return resourcesById(resources);
  }, [resources]);

  const selectedEvent = React.useMemo(() => {
    if (!activeSelectedEventId) return null;
    const found = normalizedEvents.find((e) => e.id === activeSelectedEventId);
    return found ?? null;
  }, [activeSelectedEventId, normalizedEvents]);

  const selectedResource = React.useMemo(() => {
    if (!selectedEvent) return undefined;
    return resourceById.get(selectedEvent.resourceId);
  }, [resourceById, selectedEvent]);

  const selectedTimeText = React.useMemo(() => {
    if (!selectedEvent) return "";
    return (
      formatters?.eventTime?.({
        start: selectedEvent._start,
        end: selectedEvent._end,
        locale: resolvedLocale,
        timeZone: resolvedTimeZone,
        view: activeView,
      }) ?? defaultEventTime({ start: selectedEvent._start, end: selectedEvent._end, locale: resolvedLocale, timeZone: resolvedTimeZone, view: activeView })
    );
  }, [activeView, formatters, resolvedLocale, resolvedTimeZone, selectedEvent]);

  React.useEffect(() => {
    if (!effectiveEnableEventSheet) return;
    if (activeEventSheetOpen && activeSelectedEventId && !selectedEvent) {
      setEventSheetOpen(false);
    }
  }, [activeEventSheetOpen, activeSelectedEventId, effectiveEnableEventSheet, selectedEvent, setEventSheetOpen]);

  useHorizontalScrollSync({ bodyRef, headerRef, leftRef });

  const virt = virtualization?.enabled;
  const overscan = virtualization?.overscan ?? 8;

  const isControlledRowHeights = rowHeights !== undefined;
  const [internalRowHeights, setInternalRowHeights] = React.useState<Record<string, number>>(() => defaultRowHeights ?? {});
  React.useEffect(() => {
    if (isControlledRowHeights) return;
    if (!defaultRowHeights) return;
    setInternalRowHeights(defaultRowHeights);
  }, [defaultRowHeights, isControlledRowHeights]);

  const activeRowHeights = isControlledRowHeights ? (rowHeights as Record<string, number>) : internalRowHeights;

  const getResourceRowHeight = React.useCallback(
    (resourceId: string) => {
      const h = activeRowHeights[resourceId];
      if (typeof h === "number" && Number.isFinite(h) && h > 0) return h;
      return effectiveRowHeight;
    },
    [activeRowHeights, effectiveRowHeight],
  );

  const setRowHeightForResource = React.useCallback(
    (resourceId: string, height: number) => {
      const clamped = clamp(Math.round(height), rowMin, rowMax);
      onRowHeightChange?.(clamped);
      if (isControlledRowHeights) {
        const next = { ...(activeRowHeights ?? {}), [resourceId]: clamped };
        onRowHeightsChange?.(next);
        return;
      }
      setInternalRowHeights((prev) => {
        const next = { ...prev, [resourceId]: clamped };
        onRowHeightsChange?.(next);
        return next;
      });
    },
    [activeRowHeights, isControlledRowHeights, onRowHeightChange, onRowHeightsChange, rowMax, rowMin],
  );

  const rowHeightsArray = React.useMemo(() => {
    return rows.map((r) => {
      if (r.kind === "resource") return getResourceRowHeight(r.resource.id);
      return sizeConfig.groupRowHeight;
    });
  }, [getResourceRowHeight, rows, sizeConfig.groupRowHeight]);

  const virtualResult = useVirtualVariableRows({
    enabled: virt,
    overscan,
    rowHeights: rowHeightsArray,
    scrollRef: bodyRef,
  });

  const startRow = virt ? virtualResult.startIndex : 0;
  const endRow = virt ? virtualResult.endIndex : rows.length;
  const topSpacer = virt ? virtualResult.topSpacer : 0;
  const bottomSpacer = virt ? virtualResult.bottomSpacer : 0;

  const resizeRef = React.useRef<
    | null
    | {
        mode: "column" | "row";
        pointerId: number;
        startX: number;
        startY: number;
        startWidth: number;
        startHeight: number;
        resourceId?: string;
      }
  >(null);

  const setResourceColumnWidth = React.useCallback(
    (next: number) => {
      const clamped = clamp(Math.round(next), colMin, colMax);
      if (!isControlledResourceColumnWidth) setInternalResourceColumnWidth(clamped);
      onResourceColumnWidthChange?.(clamped);
    },
    [colMax, colMin, isControlledResourceColumnWidth, onResourceColumnWidthChange],
  );

  const startResize = React.useCallback(
    (
      mode: "column" | "row",
      e: React.PointerEvent,
      args: { startWidth: number; startHeight: number; resourceId?: string },
    ) => {
      if (e.button !== 0 || e.ctrlKey) return;
      resizeRef.current = {
        mode,
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        startWidth: args.startWidth,
        startHeight: args.startHeight,
        resourceId: args.resourceId,
      };

      document.body.style.cursor = mode === "column" ? "col-resize" : "row-resize";
      document.body.style.userSelect = "none";

      const onMove = (ev: PointerEvent) => {
        const st = resizeRef.current;
        if (!st) return;
        if (ev.pointerId !== st.pointerId) return;
        if (st.mode === "column") {
          setResourceColumnWidth(st.startWidth + (ev.clientX - st.startX));
        } else {
          if (!st.resourceId) return;
          setRowHeightForResource(st.resourceId, st.startHeight + (ev.clientY - st.startY));
        }
      };

      const onUp = (ev: PointerEvent) => {
        const st = resizeRef.current;
        if (!st) return;
        if (ev.pointerId !== st.pointerId) return;
        resizeRef.current = null;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      e.preventDefault();
      e.stopPropagation();
    },
    [setResourceColumnWidth, setRowHeightForResource],
  );

  React.useEffect(() => {
    return () => {
      if (!resizeRef.current) return;
      resizeRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, []);

  const beginResizeColumn = React.useCallback(
    (e: React.PointerEvent) => {
      if (!canResizeColumn) return;
      if (typeof effectiveResourceColumnWidth !== "number") return;
      startResize("column", e, { startWidth: effectiveResourceColumnWidth, startHeight: effectiveRowHeight });
    },
    [canResizeColumn, effectiveResourceColumnWidth, effectiveRowHeight, startResize],
  );

  const beginResizeResourceRow = React.useCallback(
    (resourceId: string) => (e: React.PointerEvent) => {
      if (!canResizeRow) return;
      startResize("row", e, {
        startWidth: typeof effectiveResourceColumnWidth === "number" ? effectiveResourceColumnWidth : 0,
        startHeight: getResourceRowHeight(resourceId),
        resourceId,
      });
    },
    [canResizeRow, effectiveResourceColumnWidth, getResourceRowHeight, startResize],
  );

  const title = React.useMemo(() => {
    if (activeView === "month") {
      return (
        formatters?.monthTitle?.(activeDate, { locale: resolvedLocale, timeZone: resolvedTimeZone }) ??
        defaultMonthTitle(activeDate, resolvedLocale, resolvedTimeZone)
      );
    }

    if (activeView === "week") {
      const { week } = getIsoWeekInfo(range.start, resolvedTimeZone);
      const fmt = getDtf(resolvedLocale, resolvedTimeZone, { month: "short", day: "numeric" });
      const fmtYear = getDtf(resolvedLocale, resolvedTimeZone, { year: "numeric" });
      const endInclusive = new Date(range.end.getTime() - 1);

      const a = fmt.format(range.start);
      const b = fmt.format(endInclusive);
      const ya = fmtYear.format(range.start);
      const yb = fmtYear.format(endInclusive);

      const rangeText = ya === yb ? `${a} – ${b}, ${ya}` : `${a}, ${ya} – ${b}, ${yb}`;
      return `${l.week} ${week} • ${rangeText}`;
    }

    // day
    const fmt = getDtf(resolvedLocale, resolvedTimeZone, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    return fmt.format(range.start);
  }, [activeDate, activeView, formatters, l.week, range.end, range.start, resolvedLocale, resolvedTimeZone]);

  const densityClass = sizeConfig.densityClass;
  const eventHeight = sizeConfig.eventHeight;
  const laneGap = sizeConfig.laneGap;
  const lanePaddingY = sizeConfig.lanePaddingY;

  const createMode = interactions?.createMode ?? "drag";
  const canCreate = !isViewOnly && (interactions?.creatable ?? false) && !!onCreateEvent;
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createResourceId, setCreateResourceId] = React.useState<string | null>(null);
  const [createStartIdx, setCreateStartIdx] = React.useState(0);
  const [createEndIdx, setCreateEndIdx] = React.useState(1);

  const resourceOptions = React.useMemo(() => {
    return resources.map((r) => ({
      label: typeof r.label === "string" ? r.label : r.id,
      value: r.id,
      description: r.groupId ? String(r.groupId) : undefined,
      disabled: r.disabled ?? false,
    }));
  }, [resources]);

  const slotPickerLabel = React.useMemo(() => {
    const timeFmt = getDtf(resolvedLocale, resolvedTimeZone, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
    const dayFmt = getDtf(resolvedLocale, resolvedTimeZone, { weekday: "short", month: "short", day: "numeric" });
    return (d: Date) => (activeView === "day" ? timeFmt.format(d) : dayFmt.format(d));
  }, [activeView, resolvedLocale, resolvedTimeZone]);

  const openCreate = React.useCallback(() => {
    if (!canCreate) return;

    // Avoid two sheets at once.
    if (activeEventSheetOpen) setEventSheetOpen(false);

    const firstResource = resources.find((r) => !r.disabled)?.id ?? resources[0]?.id ?? null;
    setCreateResourceId(firstResource ?? null);

    let startIdx = 0;
    if (slots.length > 0) {
      if (activeView === "day") {
        const inRange = resolvedNow.getTime() >= range.start.getTime() && resolvedNow.getTime() < range.end.getTime();
        startIdx = clamp(inRange ? binarySearchFirstGE(slotStarts, resolvedNow) : 0, 0, slots.length - 1);
      } else {
        const dayStart = startOfZonedDay(activeDate, resolvedTimeZone);
        startIdx = clamp(binarySearchLastLE(slotStarts, dayStart), 0, slots.length - 1);
      }
    }

    setCreateStartIdx(startIdx);
    setCreateEndIdx(Math.min(slots.length, startIdx + 1));
    setCreateOpen(true);
  }, [activeDate, activeEventSheetOpen, activeView, canCreate, range.end, range.start, resolvedNow, resolvedTimeZone, resources, setEventSheetOpen, slotStarts, slots.length]);

  React.useEffect(() => {
    setCreateEndIdx((prev) => Math.min(slots.length, Math.max(prev, createStartIdx + 1)));
  }, [createStartIdx, slots.length]);

  const createStartOptions = React.useMemo(() => {
    return slotStarts.map((d, idx) => ({ label: slotPickerLabel(d), value: idx }));
  }, [slotStarts, slotPickerLabel]);

  const createEndOptions = React.useMemo(() => {
    const out: Array<{ label: string; value: number }> = [];
    for (let idx = createStartIdx + 1; idx <= slotStarts.length; idx++) {
      const boundary = idx >= slotStarts.length ? range.end : slotStarts[idx]!;
      out.push({ label: slotPickerLabel(boundary), value: idx });
    }
    return out;
  }, [createStartIdx, range.end, slotPickerLabel, slotStarts]);

  const commitCreate = React.useCallback(() => {
    if (!onCreateEvent) return;
    if (!createResourceId) return;
    const start = slotStarts[clamp(createStartIdx, 0, Math.max(0, slotStarts.length - 1))];
    if (!start) return;
    const endBoundary = createEndIdx >= slotStarts.length ? range.end : slotStarts[createEndIdx];
    if (!endBoundary) return;
    if (endBoundary.getTime() <= start.getTime()) return;
    onCreateEvent({ resourceId: createResourceId, start, end: endBoundary });
    setCreateOpen(false);
  }, [createEndIdx, createResourceId, createStartIdx, onCreateEvent, range.end, slotStarts]);

  type DragMode = "move" | "resize-start" | "resize-end" | "create";
  const dragRef = React.useRef<null | {
    mode: DragMode;
    eventId?: string;
    resourceId: string;
    originStart: Date;
    originEnd: Date;
    durationMs: number;
    pointerId: number;
    startSlotIdx: number;
    startRowResourceId: string;
    startClientX: number;
    startClientY: number;
  }>(null);
  const [preview, setPreview] = React.useState<{ eventId?: string; resourceId: string; start: Date; end: Date } | null>(null);
  const suppressNextEventClickRef = React.useRef(false);

  const getPointerContext = React.useCallback(
    (clientX: number, clientY: number, opts?: { biasLeft?: boolean }) => {
      const body = bodyRef.current;
      if (!body) return null;
      const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
      if (!el || !body.contains(el)) return null;

      // The grid lives inside `bodyRef` (the right pane). Derive the x position
      // from the scroll container to avoid double-counting scrollLeft.
      const bodyRect = body.getBoundingClientRect();
      const x = clientX - bodyRect.left + body.scrollLeft;
      // When creating events, users often drag to an hour boundary. If the pointer is
      // exactly on the boundary, bias to the left so a "04→06" drag doesn't become "04→07".
      const epsilon = opts?.biasLeft ? 0.01 : 0;
      const slotIdx = clamp(Math.floor((x - epsilon) / slotWidth), 0, Math.max(0, slots.length - 1));
      const rowEl = el?.closest?.("[data-uv-ct-row]") as HTMLElement | null;
      const rid = rowEl?.dataset?.uvCtRow ?? null;
      return { slotIdx, resourceId: rid, x };
    },
    [slotWidth, slots.length],
  );

  const slotToDate = React.useCallback(
    (slotIdx: number) => {
      const start = slotStarts[clamp(slotIdx, 0, slotStarts.length - 1)]!;
      if (activeView === "day") {
        const stepMs = Math.trunc(Math.max(5, Math.min(240, Math.trunc(dayTimeStepMinutes))) * 60_000);
        return { start, end: new Date(start.getTime() + stepMs) };
      }
      return { start, end: addZonedDays(start, 1, resolvedTimeZone) };
    },
    [activeView, dayTimeStepMinutes, resolvedTimeZone, slotStarts],
  );

  const onPointerDownEvent = (e: React.PointerEvent, ev: CalendarTimelineEvent<TEventMeta> & { _start: Date; _end: Date }, mode: DragMode) => {
    if (e.button !== 0 || e.ctrlKey) return;
    if (isViewOnly) return;
    if (ev.resourceId == null) return;
    const allowDrag = interactions?.draggableEvents ?? true;
    const allowResize = interactions?.resizableEvents ?? true;
    if (mode === "move" && (!allowDrag || ev.draggable === false)) return;
    if ((mode === "resize-start" || mode === "resize-end") && (!allowResize || ev.resizable === false)) return;

    suppressNextEventClickRef.current = false;
    const startIdx = binarySearchLastLE(slotStarts, ev._start);
    const endIdx = binarySearchFirstGE(slotStarts, ev._end);
    dragRef.current = {
      mode,
      eventId: ev.id,
      resourceId: ev.resourceId,
      originStart: ev._start,
      originEnd: ev._end,
      durationMs: ev._end.getTime() - ev._start.getTime(),
      pointerId: e.pointerId,
      startSlotIdx: startIdx,
      startRowResourceId: ev.resourceId,
      startClientX: e.clientX,
      startClientY: e.clientY,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
    e.stopPropagation();
  };

  const onPointerDownCell = (e: React.PointerEvent) => {
    if (e.button !== 0 || e.ctrlKey) return;
    if (isViewOnly) return;
    if (!(interactions?.creatable ?? false) || !onCreateEvent) return;
    if (createMode === "click") return;
    const ctx = getPointerContext(e.clientX, e.clientY, { biasLeft: true });
    if (!ctx?.resourceId) return;
    const { start } = slotToDate(ctx.slotIdx);
    const end = ctx.slotIdx + 1 >= slots.length ? range.end : slotToDate(ctx.slotIdx + 1).start;
    dragRef.current = {
      mode: "create",
      resourceId: ctx.resourceId,
      originStart: start,
      originEnd: end,
      durationMs: end.getTime() - start.getTime(),
      pointerId: e.pointerId,
      startSlotIdx: ctx.slotIdx,
      startRowResourceId: ctx.resourceId,
      startClientX: e.clientX,
      startClientY: e.clientY,
    };
    setPreview({ resourceId: ctx.resourceId, start, end });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const onClickCell = (e: React.MouseEvent) => {
    if (e.button !== 0 || e.ctrlKey) return;
    if (isViewOnly) return;
    if (!(interactions?.creatable ?? false)) return;
    if (createMode !== "click") return;
    if (!onCreateEventClick) return;
    const ctx = getPointerContext(e.clientX, e.clientY, { biasLeft: true });
    if (!ctx?.resourceId) return;
    const { start, end } = slotToDate(ctx.slotIdx);
    onCreateEventClick({
      resourceId: ctx.resourceId,
      start,
      end: ctx.slotIdx + 1 >= slots.length ? range.end : end,
      slotIdx: ctx.slotIdx,
      view: activeView,
      locale: resolvedLocale,
      timeZone: resolvedTimeZone,
    });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const ctx = getPointerContext(e.clientX, e.clientY, drag.mode === "create" ? { biasLeft: true } : undefined);
    if (!ctx || !ctx.resourceId) return;
    const { slotIdx } = ctx;

    const movedEnough =
      Math.abs(e.clientX - drag.startClientX) > 3 ||
      Math.abs(e.clientY - drag.startClientY) > 3 ||
      slotIdx !== drag.startSlotIdx ||
      ctx.resourceId !== drag.startRowResourceId;
    if (movedEnough) suppressNextEventClickRef.current = true;

    if (drag.mode === "create") {
      const a = Math.min(drag.startSlotIdx, slotIdx);
      const b = Math.max(drag.startSlotIdx, slotIdx) + 1;
      const s = slotToDate(a).start;
      const e2 = b >= slots.length ? range.end : slotToDate(b).start;
      setPreview({ resourceId: drag.resourceId, start: s, end: e2 });
      return;
    }

    const targetSlotStart = slotToDate(slotIdx).start;
    const originSlotStart = slotToDate(drag.startSlotIdx).start;
    const deltaMs = targetSlotStart.getTime() - originSlotStart.getTime();

    if (drag.mode === "move") {
      const nextStart = new Date(drag.originStart.getTime() + deltaMs);
      const nextEnd = new Date(drag.originEnd.getTime() + deltaMs);
      setPreview({ eventId: drag.eventId, resourceId: ctx.resourceId, start: nextStart, end: nextEnd });
      drag.resourceId = ctx.resourceId;
      return;
    }
    if (drag.mode === "resize-start") {
      const nextStart = new Date(clamp(targetSlotStart.getTime(), range.start.getTime(), drag.originEnd.getTime() - 60_000));
      setPreview({ eventId: drag.eventId, resourceId: drag.resourceId, start: nextStart, end: drag.originEnd });
      return;
    }
    if (drag.mode === "resize-end") {
      const nextEnd = new Date(clamp(targetSlotStart.getTime(), drag.originStart.getTime() + 60_000, range.end.getTime()));
      setPreview({ eventId: drag.eventId, resourceId: drag.resourceId, start: drag.originStart, end: nextEnd });
      return;
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragRef.current = null;

    if (!preview) {
      setPreview(null);
      return;
    }

    if (drag.mode === "create" && onCreateEvent) {
      onCreateEvent({ resourceId: preview.resourceId, start: preview.start, end: preview.end });
      setPreview(null);
      return;
    }

    if (drag.mode === "move" && preview.eventId && onEventMove) {
      onEventMove({ eventId: preview.eventId, resourceId: preview.resourceId, start: preview.start, end: preview.end });
      setPreview(null);
      return;
    }

    if ((drag.mode === "resize-start" || drag.mode === "resize-end") && preview.eventId && onEventResize) {
      onEventResize({ eventId: preview.eventId, start: preview.start, end: preview.end });
      setPreview(null);
      return;
    }

    setPreview(null);
  };

  const renderGroupRow = (g: CalendarTimelineGroup) => {
    const isCollapsed = !!collapsed[g.id];
    const toggle = () => setCollapsed({ ...collapsed, [g.id]: !isCollapsed });
    if (renderGroup) return renderGroup(g, { collapsed: isCollapsed, toggle });
    const canToggle = g.collapsible ?? true;
    const itemCount = groupResourceCounts.get(g.id) ?? 0;
    return (
      <DefaultGroupRow
        group={g}
        collapsed={isCollapsed}
        toggle={toggle}
        canToggle={canToggle}
        ariaLabel={isCollapsed ? l.expandGroup : l.collapseGroup}
        itemCount={itemCount}
        sizeConfig={sizeConfig}
      />
    );
  };

  const slotHeaderNodes = (
    <div
      className="flex"
      style={{
        width: gridWidth,
        minWidth: gridWidth,
      }}
    >
      {slots.map((s, idx) => (
        <div
          key={`${s.start.toISOString()}_${idx}`}
          className={cn(
            "shrink-0 border-l border-border/30 flex items-center justify-center transition-colors duration-150",
            sizeConfig.slotHeaderClass,
            s.isToday && "bg-primary/8 border-l-primary/40",
          )}
          style={{ width: slotWidth, minWidth: slotWidth }}
          aria-label={formatters?.ariaSlotLabel?.(s.start, { view: activeView, locale: resolvedLocale, timeZone: resolvedTimeZone })}
        >
          <div className={cn("flex flex-col items-center", s.isToday && "relative")}>
            {s.isToday && <Dot className="absolute -top-2.5 h-4 w-4 text-primary animate-pulse" />}
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );

  const Header = (
    <CalendarTimelineHeader
      title={title}
      resourcesHeaderLabel={t("resourcesHeader")}
      labels={{ today: l.today, prev: l.prev, next: l.next, month: l.month, week: l.week, day: l.day }}
      newEventLabel={l.newEvent}
      newEventDisabled={isViewOnly || !canCreate || resources.length === 0}
      onNewEventClick={isViewOnly ? undefined : openCreate}
      activeView={activeView}
      sizeConfig={sizeConfig}
      navigate={navigate}
      goToday={goToday}
      setView={setView}
      effectiveResourceColumnWidth={effectiveResourceColumnWidth}
      canResizeColumn={canResizeColumn}
      beginResizeColumn={beginResizeColumn}
      headerRef={headerRef}
      slotHeaderNodes={slotHeaderNodes}
    />
  );

  const layoutsByResource = React.useMemo(() => {
    const map = new Map<
      string,
      {
        baseTop: number;
        eventHeight: number;
        visible: Array<{ ev: CalendarTimelineEvent<TEventMeta> & { _start: Date; _end: Date }; left: number; width: number; lane: number }>;
        hidden: Array<CalendarTimelineEvent<TEventMeta>>;
      }
    >();

    for (const [resourceId, list] of eventsByResource.entries()) {
      const mapped = list.map((ev) => {
        const isPreview = preview?.eventId === ev.id && preview.resourceId === resourceId;
        const s = isPreview ? preview!.start : ev._start;
        const e = isPreview ? preview!.end : ev._end;
        const startIdx = binarySearchLastLE(slotStarts, s);
        const endIdx = clamp(binarySearchFirstGE(slotStarts, e), startIdx + 1, slots.length);
        return { ev: { ...ev, _start: s, _end: e }, startIdx, endIdx };
      });

      const { packed, laneCount } = intervalPack(mapped);
      const visible = packed.filter((p) => p.lane < maxLanesPerRow);
      const hidden = packed.filter((p) => p.lane >= maxLanesPerRow);

      const rowHeightPx = getResourceRowHeight(resourceId);
      const visibleLaneCount = Math.max(1, Math.min(laneCount, maxLanesPerRow));
      const available = Math.max(0, rowHeightPx - lanePaddingY * 2 - laneGap * Math.max(0, visibleLaneCount - 1));
      const fitPerLane = visibleLaneCount > 0 ? Math.floor(available / visibleLaneCount) : eventHeight;
      const perLaneHeight = Math.max(9, Math.min(eventHeight, fitPerLane || eventHeight));
      const baseTop = visibleLaneCount === 1 ? Math.max(0, Math.round((rowHeightPx - perLaneHeight) / 2)) : lanePaddingY;

      map.set(resourceId, {
        baseTop,
        eventHeight: perLaneHeight,
        visible: visible.map((p) => ({
          ev: p.ev,
          lane: p.lane,
          left: p.startIdx * slotWidth,
          width: Math.max(1, (p.endIdx - p.startIdx) * slotWidth),
        })),
        hidden: hidden.map((h) => h.ev),
      });
    }

    return map;
  }, [eventsByResource, getResourceRowHeight, laneGap, lanePaddingY, slotStarts, slots.length, slotWidth, maxLanesPerRow, preview, eventHeight]);

  return (
    <div
      className={cn(
        "border border-border/40 rounded-2xl overflow-hidden bg-background/95 backdrop-blur-sm",
        "shadow-sm hover:shadow-md transition-shadow duration-300",
        densityClass,
        className,
      )}
      {...rest}
    >
      {Header}
      <div className="flex min-h-0">
        {/* Left column (resources / groups): vertical scroll sync with body */}
        <div
          ref={leftRef}
          className="shrink-0 overflow-y-auto overflow-x-hidden scrollbar-none"
          style={{ width: effectiveResourceColumnWidth, minWidth: effectiveResourceColumnWidth }}
        >
          <div style={{ height: topSpacer }} />
          {rows.slice(startRow, endRow).map((row, idx) => {
            const rowIndex = startRow + idx;
            const h = rowHeightsArray[rowIndex] ?? effectiveRowHeight;
            if (row.kind === "group") {
              return (
                <div key={`lg_${row.group.id}_${rowIndex}`} style={{ height: h }}>
                  {renderGroupRow(row.group)}
                </div>
              );
            }
            const r = row.resource;
            return (
              <div key={`lr_${r.id}_${rowIndex}`} style={{ height: h }}>
                <ResourceRowCell
                  resource={r}
                  sizeConfig={sizeConfig}
                  canResizeRow={canResizeRow}
                  beginResizeResourceRow={beginResizeResourceRow}
                  renderResource={renderResource}
                />
              </div>
            );
          })}
          <div style={{ height: bottomSpacer }} />
        </div>

        {/* Right grid: main scroll container (both axes) */}
        <div
          ref={bodyRef}
          className="relative flex-1 overflow-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <div style={{ height: topSpacer }} />
          {rows.slice(startRow, endRow).map((row, idx) => {
            const rowIndex = startRow + idx;
            const h = rowHeightsArray[rowIndex] ?? effectiveRowHeight;
            if (row.kind === "group") {
              return (
                <div key={`rg_${row.group.id}_${rowIndex}`} className="flex" style={{ height: h }}>
                  <div className="border-b border-border/30 bg-linear-to-r from-muted/15 to-muted/5" style={{ width: gridWidth, minWidth: gridWidth }} />
                </div>
              );
            }

            const r = row.resource;
            const layout = layoutsByResource.get(r.id) ?? { visible: [], hidden: [], baseTop: lanePaddingY, eventHeight };
            const canMore = layout.hidden.length > 0 && !!onMoreClick;

            return (
              <div
                key={`rr_${r.id}_${rowIndex}`}
                className="group/row hover:bg-muted/5 transition-colors duration-150"
                style={{ height: h }}
                data-uv-ct-row={r.id}
              >
                <div className="relative shrink-0" style={{ width: gridWidth, minWidth: gridWidth, height: "100%" }}>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-border/25" />
                  <div className="absolute inset-0" onPointerDown={onPointerDownCell} onClick={onClickCell} data-uv-ct-timeline>
                    <div className="absolute inset-0 flex">
                      {slots.map((s, i2) => (
                        <div
                          key={`${r.id}_${i2}`}
                          className={cn(
                            "h-full border-l border-border/20 transition-colors duration-100",
                            s.isToday && "bg-primary/5 border-l-primary/30",
                            "hover:bg-muted/10",
                          )}
                          style={{ width: slotWidth, minWidth: slotWidth }}
                        />
                      ))}
                    </div>
                  </div>

                  {layout.visible.map(({ ev, left, width, lane }) => {
                    const top = layout.baseTop + lane * (layout.eventHeight + laneGap);
                    const isPreview = preview?.eventId === ev.id;
                    const bg = ev.color ? ev.color : "hsl(var(--primary) / 0.15)";
                    const border = ev.color ? ev.color : "hsl(var(--primary))";
                    const aria =
                      formatters?.ariaEventLabel?.(ev, { locale: resolvedLocale, timeZone: resolvedTimeZone }) ??
                      (typeof ev.title === "string" ? ev.title : "Event");
                  const timeText =
                    formatters?.eventTime?.({
                      start: ev._start,
                      end: ev._end,
                      locale: resolvedLocale,
                      timeZone: resolvedTimeZone,
                      view: activeView,
                    }) ?? defaultEventTime({ start: ev._start, end: ev._end, locale: resolvedLocale, timeZone: resolvedTimeZone, view: activeView });

                  const node =
                    renderEvent?.(ev, { left, width, lane, height: layout.eventHeight, timeText }) ??
                    (() => {
                      const showTime = layout.eventHeight >= 24;
                      const titleMaxLines = showTime ? (layout.eventHeight >= 34 ? 2 : 1) : 1;
                      const isPlainTitle = typeof ev.title === "string" || typeof ev.title === "number";

                      return (
                        <div className="h-full px-2.5 flex items-center min-w-0 overflow-hidden">
                          <div className="w-full grid grid-cols-[1fr_auto] gap-x-2 items-start min-w-0 overflow-hidden">
                            <div
                              className={cn("text-xs font-semibold leading-snug min-w-0 overflow-hidden", isPlainTitle ? "break-words" : "")}
                              style={
                                isPlainTitle
                                  ? {
                                      display: "-webkit-box",
                                      WebkitBoxOrient: "vertical",
                                      WebkitLineClamp: titleMaxLines as any,
                                    }
                                  : undefined
                              }
                            >
                              {ev.title ?? null}
                            </div>
                            {showTime ? <div className="text-[11px] opacity-70 leading-snug whitespace-nowrap">{timeText}</div> : null}
                          </div>
                        </div>
                      );
                    })();

                  const resource = resourceById.get(ev.resourceId);
                  const tooltipTitle = ev.title || ev.id;
                  const tooltipContent = (
                    <div className="flex flex-col gap-0.5">
                      <div className="font-semibold">{tooltipTitle}</div>
                      <div className="text-xs opacity-80">{timeText}</div>
                      {resource?.label ? <div className="text-xs opacity-70">{resource.label}</div> : null}
                    </div>
                  );

                  return (
                    <Tooltip key={ev.id} content={tooltipContent} placement="top" delay={{ open: 250, close: 0 }}>
                      <div
                        className={cn(
                          "absolute rounded-lg border select-none cursor-pointer",
                          "shadow-sm hover:shadow-md hover:scale-[1.02] hover:z-10",
                          "transition-all duration-150 ease-out",
                          "backdrop-blur-sm",
                          "overflow-hidden",
                          ev.className,
                          isPreview && "ring-2 ring-primary/50 ring-offset-1 ring-offset-background scale-[1.02] z-10",
                        )}
                        style={{
                          left,
                          top,
                          width,
                          height: layout.eventHeight,
                          background: bg,
                          borderColor: border,
                          borderLeftWidth: 3,
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label={aria}
                        onContextMenu={(e) => {
                          if (isViewOnly) return;
                          if (!onEventDelete) return;
                          if (interactions?.deletableEvents === false) return;
                          e.preventDefault();
                          e.stopPropagation();
                          const ok = window.confirm(l.deleteConfirm);
                          if (!ok) return;
                          onEventDelete({ eventId: ev.id });
                        }}
                        onClick={() => {
                          if (suppressNextEventClickRef.current) {
                            suppressNextEventClickRef.current = false;
                            return;
                          }
                          onEventClick?.(ev);
                          if (effectiveEnableEventSheet) {
                            setSelectedEventId(ev.id);
                            setEventSheetOpen(true);
                          }
                        }}
                        onDoubleClick={() => onEventDoubleClick?.(ev)}
                        onPointerDown={(e) => onPointerDownEvent(e, ev, "move")}
                      >
                        {!isViewOnly && (interactions?.resizableEvents ?? true) && ev.resizable !== false ? (
                          <>
                            <div
                              className="absolute left-0 top-0 h-full w-2 cursor-ew-resize opacity-0 hover:opacity-100 bg-primary/20 rounded-l-lg transition-opacity"
                              onPointerDown={(e) => onPointerDownEvent(e, ev, "resize-start")}
                            />
                            <div
                              className="absolute right-0 top-0 h-full w-2 cursor-ew-resize opacity-0 hover:opacity-100 bg-primary/20 rounded-r-lg transition-opacity"
                              onPointerDown={(e) => onPointerDownEvent(e, ev, "resize-end")}
                            />
                          </>
                        ) : null}
                        {node}
                      </div>
                    </Tooltip>
                  );
                })}

                  {preview && preview.resourceId === r.id && !preview.eventId
                    ? (() => {
                        const startIdx = binarySearchLastLE(slotStarts, preview.start);
                        const endIdx = clamp(binarySearchFirstGE(slotStarts, preview.end), startIdx + 1, slots.length);
                        const left = startIdx * slotWidth;
                        const width = Math.max(1, (endIdx - startIdx) * slotWidth);
                        return (
                          <div
                            className="absolute rounded-lg border-2 border-dashed border-primary/60 bg-primary/10 backdrop-blur-sm animate-pulse"
                            style={{ left, top: layout.baseTop, width, height: layout.eventHeight }}
                          />
                        );
                      })()
                    : null}

                  {canMore ? (
                    <button
                      type="button"
                      className={cn(
                        "absolute right-2 bottom-1.5 text-[10px] font-semibold",
                        "px-2 py-0.5 rounded-full",
                        "bg-primary/10 text-primary hover:bg-primary/20",
                        "transition-all duration-200 hover:scale-105",
                      )}
                      onClick={() => onMoreClick?.({ resourceId: r.id, hiddenEvents: layout.hidden })}
                    >
                      +{layout.hidden.length} {l.more(layout.hidden.length).replace(/^\+?\d+\s*/, "")}
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
          <div style={{ height: bottomSpacer }} />
        </div>
      </div>

      {effectiveEnableEventSheet && selectedEvent ? (
        <Sheet
          open={activeEventSheetOpen}
          onOpenChange={setEventSheetOpen}
          side="right"
          size={eventSheetSize}
          title={selectedEvent.title ?? "Event"}
          description={selectedTimeText || undefined}
        >
          {renderEventSheet
            ? renderEventSheet({
                event: selectedEvent,
                resource: selectedResource,
                close: () => setEventSheetOpen(false),
                locale: resolvedLocale,
                timeZone: resolvedTimeZone,
                view: activeView,
              })
            : (
                <div className="space-y-3">
                  {selectedResource?.label ? (
                    <div>
                      <div className="text-xs text-muted-foreground">{t("resourcesHeader")}</div>
                      <div className="font-medium">{selectedResource.label}</div>
                    </div>
                  ) : null}
                  <div>
                    <div className="text-xs text-muted-foreground">ID</div>
                    <div className="font-mono text-xs break-all">{selectedEvent.id}</div>
                  </div>
                </div>
              )}
        </Sheet>
      ) : null}

      {canCreate ? (
        <Sheet
          open={createOpen}
          onOpenChange={setCreateOpen}
          side="right"
          size="md"
          title={l.createEventTitle}
          description={activeView === "day" ? l.day : activeView === "week" ? l.week : l.month}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">{l.resource}</div>
              <Combobox
                options={resourceOptions}
                value={createResourceId}
                onChange={(v) => setCreateResourceId(v as string)}
                placeholder={l.resource}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">{l.start}</div>
                <Combobox
                  options={createStartOptions}
                  value={createStartIdx}
                  onChange={(v) => setCreateStartIdx(Number(v))}
                  placeholder={l.start}
                />
              </div>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">{l.end}</div>
                <Combobox
                  options={createEndOptions}
                  value={createEndIdx}
                  onChange={(v) => setCreateEndIdx(Number(v))}
                  placeholder={l.end}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setCreateOpen(false)}>
                {l.cancel}
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={commitCreate}
                disabled={!createResourceId || createEndIdx <= createStartIdx || createStartOptions.length === 0}
              >
                {l.create}
              </Button>
            </div>
          </div>
        </Sheet>
      ) : null}
    </div>
  );
}
