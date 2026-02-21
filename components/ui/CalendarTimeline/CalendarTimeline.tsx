"use client";

import * as React from "react";
import { Plus } from "lucide-react";
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
import { addZonedDays, addZonedMonths, addZonedYears, getDtf, getIsoWeekInfo, localeToBCP47, startOfZonedDay, toDate } from "./date";
import { binarySearchFirstGE, binarySearchLastLE, clamp, intervalPack } from "./layout";
import { useClientWidth, useHorizontalScrollSync, useVirtualVariableRows } from "./hooks";
import { getSizeConfig } from "./config";
import { defaultEventTime, defaultMonthTitle, defaultSlotHeader } from "./defaults";
import { buildRows, getGroupResourceCounts, type CalendarTimelineRow } from "./model";
import { CalendarTimelineHeader } from "./CalendarTimelineHeader";
import { DefaultGroupRow, ResourceRowCell } from "./CalendarTimelineRowCells";
import { CalendarTimelineGridOverlay } from "./CalendarTimelineGridOverlay";
import { CalendarTimelineSlotHeaderCell } from "./CalendarTimelineSlotHeaderCell";
import {
  useDayHeaderMarks,
  useLayoutsByResource,
  useNormalizedEvents,
  useSlotMetrics,
  useTimelineSlots,
  useVisibleSlotRange,
} from "./internal-hooks";
import { Combobox } from "../Combobox";

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
  onlyView,
  view,
  defaultView = "month",
  onViewChange,
  dueDateSprint,
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
  hideResourceColumn,
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
  autoRowHeight,
  enableLayoutResize,
  slotMinWidth,
  adaptiveSlotWidths,
  dayEventStyle = "span",
  dayEventMaxWidth,
  monthEventStyle = "span",
  monthEventMaxWidth,
  dayTimeStepMinutes = 60,
  enableEventTooltips = true,
  dayHeaderMode = "full",
  daySlotCompression = false,
  columnVirtualization,
  dayRangeMode,
  workHours,
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

  const showResourceColumn = !hideResourceColumn;

  const sizeConfig = React.useMemo(() => getSizeConfig(size), [size]);
  const densityClass = sizeConfig.densityClass;
  const eventHeight = sizeConfig.eventHeight;
  const laneGap = sizeConfig.laneGap;
  const lanePaddingY = sizeConfig.lanePaddingY;

  const canResizeColumn = React.useMemo(() => {
    const cfg = enableLayoutResize;
    if (!cfg) return false;
    if (isViewOnly) return false;
    if (!showResourceColumn) return false;
    if (cfg === true) return true;
    return cfg.column !== false;
  }, [enableLayoutResize, isViewOnly, showResourceColumn]);

  const canResizeRow = React.useMemo(() => {
    const cfg = enableLayoutResize;
    if (!cfg) return false;
    if (isViewOnly) return false;
    if (!showResourceColumn) return false;
    if (cfg === true) return true;
    return cfg.row !== false;
  }, [enableLayoutResize, isViewOnly, showResourceColumn]);

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

  const effectiveResourceColumnWidth: number | string = showResourceColumn
    ? (isControlledResourceColumnWidth ? (resourceColumnWidth as any) : internalResourceColumnWidth)
    : 0;

  const isControlledRowHeight = rowHeight !== undefined;
  const [internalRowHeight, setInternalRowHeight] = React.useState<number>(() => defaultRowHeight ?? sizeConfig.rowHeight);

  React.useEffect(() => {
    if (isControlledRowHeight) return;
    if (defaultRowHeight == null) return;
    setInternalRowHeight(defaultRowHeight);
  }, [defaultRowHeight, isControlledRowHeight]);

  const effectiveRowHeight = isControlledRowHeight ? (rowHeight as number) : internalRowHeight;
  const baseSlotMinWidth = slotMinWidth ?? sizeConfig.slotMinWidth;

  const colMin = minResourceColumnWidth ?? 160;
  const colMax = maxResourceColumnWidth ?? 520;
  const rowMin = minRowHeight ?? 36;
  const rowMax = maxRowHeight ?? 120;

  const viewList = React.useMemo(() => (Array.isArray(view) ? view : undefined), [view]);

  const availableViews = React.useMemo(() => {
    if (onlyView) return [onlyView];
    if (viewList?.length) return viewList;
    return ["month", "week", "day", "sprint"] as CalendarTimelineView[];
  }, [onlyView, viewList]);

  const isControlledView = view !== undefined && !Array.isArray(view);
  const [internalView, setInternalView] = React.useState<CalendarTimelineView>(() => {
    if (onlyView) return onlyView;
    if (viewList?.length) {
      if (defaultView && viewList.includes(defaultView)) return defaultView;
      return viewList[0] ?? defaultView ?? "month";
    }
    return defaultView ?? "month";
  });
  const activeView = onlyView ? onlyView : isControlledView ? (view as CalendarTimelineView) : internalView;

  React.useEffect(() => {
    if (onlyView || isControlledView) return;
    if (!availableViews.includes(internalView)) {
      setInternalView(availableViews[0] ?? "month");
    }
  }, [availableViews, internalView, isControlledView, onlyView]);

  const effectiveSlotMinWidth = React.useMemo(() => {
    if (slotMinWidth == null) {
      // Month view: "compact" events feel odd if each day column stays very wide.
      if (activeView === "month" && monthEventStyle === "compact") {
        return clamp(Math.round(sizeConfig.slotMinWidth * 0.55), 32, sizeConfig.slotMinWidth);
      }
      // Sprint-year view: many columns, so default to a smaller width.
      if (activeView === "sprint") {
        return clamp(Math.round(sizeConfig.slotMinWidth * 0.4), 18, 48);
      }
    }
    return baseSlotMinWidth;
  }, [activeView, baseSlotMinWidth, monthEventStyle, sizeConfig.slotMinWidth, slotMinWidth]);

  const isControlledDate = date !== undefined;
  const [internalDate, setInternalDate] = React.useState<Date>(() => defaultDate ?? new Date());
  const activeDate = isControlledDate ? (date as Date) : internalDate;

  const resolvedNow = React.useMemo(() => now ?? new Date(), [now]);

  const l: Required<CalendarTimelineLabels> = React.useMemo(
    () => ({
      today: labels?.today ?? t("today"),
      prev: labels?.prev ?? t("prev"),
      next: labels?.next ?? t("next"),
      month: labels?.month ?? t("month"),
      week: labels?.week ?? t("week"),
      day: labels?.day ?? t("day"),
      sprint: labels?.sprint ?? t("sprint"),
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
      if (onlyView) return;
      if (!availableViews.includes(next)) return;
      if (!isControlledView) setInternalView(next);
      onViewChange?.(next);
    },
    [availableViews, isControlledView, onViewChange, onlyView],
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
      if (activeView === "sprint") {
        setDate(addZonedYears(base, dir, resolvedTimeZone));
        return;
      }
      setDate(addZonedDays(base, dir, resolvedTimeZone));
    },
    [activeDate, activeView, resolvedTimeZone, setDate],
  );

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

  const { slots, range, slotStarts, todaySlotIdx, weekendSlotIdxs } = useTimelineSlots({
    activeView,
    activeDate,
    resolvedTimeZone,
    resolvedLocale,
    weekStartsOn,
    dayTimeStepMinutes,
    dayRangeMode,
    workHours,
    resolvedNow,
    formatters,
    dueDateSprint,
  });

  React.useEffect(() => {
    onRangeChange?.(range);
  }, [range.start, range.end, onRangeChange]);

  const leftRef = React.useRef<HTMLDivElement>(null);
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const headerRef = React.useRef<HTMLDivElement>(null);
  const bodyClientWidth = useClientWidth(bodyRef);

  const { normalizedEvents, eventsByResource, resourceById } = useNormalizedEvents<TResourceMeta, TEventMeta>({
    events: events as CalendarTimelineEvent<TEventMeta>[],
    range,
    activeView,
    resolvedTimeZone,
    resources,
  });

  const dayHeaderSmart = activeView === "day" && dayHeaderMode === "smart";
  const dayHeaderMarks = useDayHeaderMarks({ enabled: dayHeaderSmart, activeView, normalizedEvents, slotStarts, slotCount: slots.length });

  const { fixedSlotWidth, slotWidths, slotLefts, slotHasEvent, gridWidth, xToSlotIdx } = useSlotMetrics({
    activeView,
    slotsLength: slots.length,
    slotStarts,
    normalizedEvents,
    effectiveSlotMinWidth,
    bodyClientWidth,
    adaptiveSlotWidths,
    dayHeaderMarks,
    dayHeaderSmart,
    daySlotCompression,
  });

  const colVirtEnabled = Boolean(columnVirtualization) && activeView === "day";
  const colVirtOverscan = typeof columnVirtualization === "object" ? (columnVirtualization.overscan ?? 6) : 6;
  const visibleSlots = useVisibleSlotRange({
    enabled: colVirtEnabled,
    overscan: colVirtOverscan,
    scrollRef: bodyRef,
    slotLefts,
    slotCount: slots.length,
  });

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
      }) ??
      defaultEventTime({ start: selectedEvent._start, end: selectedEvent._end, locale: resolvedLocale, timeZone: resolvedTimeZone, view: activeView })
    );
  }, [activeView, formatters, resolvedLocale, resolvedTimeZone, selectedEvent]);

  React.useEffect(() => {
    if (!effectiveEnableEventSheet) return;
    if (activeEventSheetOpen && activeSelectedEventId && !selectedEvent) {
      setEventSheetOpen(false);
    }
  }, [activeEventSheetOpen, activeSelectedEventId, effectiveEnableEventSheet, selectedEvent, setEventSheetOpen]);

  useHorizontalScrollSync({ bodyRef, headerRef, leftRef: showResourceColumn ? leftRef : undefined });

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

  const autoRowHeightCfg = React.useMemo(() => {
    if (!autoRowHeight) return null;
    return autoRowHeight === true ? {} : autoRowHeight;
  }, [autoRowHeight]);

  const effectiveMaxLanesPerRow = React.useMemo(() => {
    if (!autoRowHeightCfg) return maxLanesPerRow;
    const maxLanes = autoRowHeightCfg.maxLanesPerRow;
    if (typeof maxLanes === "number" && Number.isFinite(maxLanes) && maxLanes > 0) return Math.floor(maxLanes);
    return Number.POSITIVE_INFINITY;
  }, [autoRowHeightCfg, maxLanesPerRow]);

  const autoRowHeightsByResource = React.useMemo(() => {
    if (!autoRowHeightCfg) return null;
    const maxRowHeight = autoRowHeightCfg.maxRowHeight;
    const out = new Map<string, number>();

    for (const [resourceId, list] of eventsByResource.entries()) {
      const mapped = list.map((ev) => {
        const startIdx = binarySearchLastLE(slotStarts, ev._start);
        const endIdx = clamp(binarySearchFirstGE(slotStarts, ev._end), startIdx + 1, slots.length);
        return { startIdx, endIdx };
      });
      const { laneCount } = intervalPack(mapped);
      const lanesToFit = Number.isFinite(effectiveMaxLanesPerRow)
        ? Math.max(1, Math.min(laneCount, effectiveMaxLanesPerRow))
        : Math.max(1, laneCount);
      const needed = lanePaddingY * 2 + lanesToFit * eventHeight + laneGap * Math.max(0, lanesToFit - 1);
      const next = typeof maxRowHeight === "number" && Number.isFinite(maxRowHeight) && maxRowHeight > 0 ? Math.min(needed, maxRowHeight) : needed;
      out.set(resourceId, next);
    }

    return out;
  }, [autoRowHeightCfg, eventHeight, eventsByResource, laneGap, lanePaddingY, slotStarts, slots.length, effectiveMaxLanesPerRow]);

  const getResourceRowHeight = React.useCallback(
    (resourceId: string) => {
      const h = activeRowHeights[resourceId];
      const base = typeof h === "number" && Number.isFinite(h) && h > 0 ? h : effectiveRowHeight;
      const auto = autoRowHeightsByResource?.get(resourceId);
      if (typeof auto === "number" && Number.isFinite(auto) && auto > 0) return Math.max(base, auto);
      return base;
    },
    [activeRowHeights, autoRowHeightsByResource, effectiveRowHeight],
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
  const renderedRowsHeight = React.useMemo(() => {
    let h = 0;
    for (let i = startRow; i < endRow; i++) h += rowHeightsArray[i] ?? effectiveRowHeight;
    return h;
  }, [effectiveRowHeight, endRow, rowHeightsArray, startRow]);

  const resizeRef = React.useRef<null | {
    mode: "column" | "row";
    pointerId: number;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    resourceId?: string;
  }>(null);

  const setResourceColumnWidth = React.useCallback(
    (next: number) => {
      const clamped = clamp(Math.round(next), colMin, colMax);
      if (!isControlledResourceColumnWidth) setInternalResourceColumnWidth(clamped);
      onResourceColumnWidthChange?.(clamped);
    },
    [colMax, colMin, isControlledResourceColumnWidth, onResourceColumnWidthChange],
  );

  const startResize = React.useCallback(
    (mode: "column" | "row", e: React.PointerEvent, args: { startWidth: number; startHeight: number; resourceId?: string }) => {
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

    if (activeView === "sprint") {
      const fmtYear = getDtf(resolvedLocale, resolvedTimeZone, { year: "numeric" });
      const yearText = fmtYear.format(activeDate);
      const count = Math.max(0, slots.length);
      return `${l.sprint} • ${yearText} • ${t("sprints", { n: count })}`;
    }

    // day
    const fmt = getDtf(resolvedLocale, resolvedTimeZone, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    return fmt.format(range.start);
  }, [activeDate, activeView, formatters, l.sprint, l.week, range.end, range.start, resolvedLocale, resolvedTimeZone, slots.length, t]);

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

  const formatCreateBoundaryLabel = React.useMemo(() => {
    const timeFmt = getDtf(resolvedLocale, resolvedTimeZone, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
    const dayFmt = getDtf(resolvedLocale, resolvedTimeZone, { weekday: "short", month: "short", day: "numeric" });
    const yearFmt = getDtf(resolvedLocale, resolvedTimeZone, { year: "numeric" });

    const sprintDefs = (() => {
      if (!dueDateSprint) return [];
      const out: Array<{ startMs: number; endMs: number; title: React.ReactNode }> = [];
      for (const v of Object.values(dueDateSprint)) {
        const startInput = v.range_date?.start;
        const endInput = v.range_date?.end;
        if (startInput == null || endInput == null) continue;
        const startRaw = toDate(startInput);
        const endRaw = toDate(endInput);
        if (Number.isNaN(startRaw.getTime()) || Number.isNaN(endRaw.getTime())) continue;
        const startMs = startOfZonedDay(startRaw, resolvedTimeZone).getTime();
        const endMs = startOfZonedDay(endRaw, resolvedTimeZone).getTime();
        if (endMs <= startMs) continue;
        out.push({ startMs, endMs, title: v.title });
      }
      out.sort((a, b) => a.startMs - b.startMs);
      return out;
    })();

    const sprintTitleForStart = (slotStart: Date, idx: number) => {
      if (activeView !== "sprint") return null;
      if (sprintDefs.length === 0) return null;
      const sMs = startOfZonedDay(slotStart, resolvedTimeZone).getTime();
      const match = sprintDefs.find((d) => sMs >= d.startMs && sMs < d.endMs) ?? sprintDefs[idx] ?? null;
      if (!match) return null;
      return typeof match.title === "string" || typeof match.title === "number" ? String(match.title) : null;
    };

    return (d: Date, opts?: { kind: "start" | "end"; boundaryIdx?: number }) => {
      if (activeView === "day") return timeFmt.format(d);

      if (activeView === "sprint") {
        const y = yearFmt.format(d);
        const idx = opts?.boundaryIdx;
        if (typeof idx === "number") {
          const slotStart = slotStarts[clamp(idx, 0, Math.max(0, slotStarts.length - 1))] ?? d;
          const dynamicTitle = sprintTitleForStart(slotStart, idx);
          if (dynamicTitle) return `${dynamicTitle} • ${dayFmt.format(d)}, ${y}`;

          // Start boundaries use slotStarts[idx] (start of sprint idx+1)
          // End boundaries use either slotStarts[idx] or range.end (idx === slotStarts.length)
          const sprintNumber = opts?.kind === "start" ? idx + 1 : Math.min(idx + 1, Math.max(1, slotStarts.length));
          const sprintText = `${l.sprint} ${String(sprintNumber).padStart(2, "0")}`;
          const dateText = dayFmt.format(d);
          return `${sprintText} • ${dateText}, ${y}`;
        }
      }

      return dayFmt.format(d);
    };
  }, [activeView, dueDateSprint, l.sprint, resolvedLocale, resolvedTimeZone, slotStarts, slotStarts.length]);

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
  }, [
    activeDate,
    activeEventSheetOpen,
    activeView,
    canCreate,
    range.end,
    range.start,
    resolvedNow,
    resolvedTimeZone,
    resources,
    setEventSheetOpen,
    slotStarts,
    slots.length,
  ]);

  React.useEffect(() => {
    setCreateEndIdx((prev) => Math.min(slots.length, Math.max(prev, createStartIdx + 1)));
  }, [createStartIdx, slots.length]);

  const createStartOptions = React.useMemo(() => {
    return slotStarts.map((d, idx) => ({ label: formatCreateBoundaryLabel(d, { kind: "start", boundaryIdx: idx }), value: idx }));
  }, [formatCreateBoundaryLabel, slotStarts]);

  const createEndOptions = React.useMemo(() => {
    const out: Array<{ label: string; value: number }> = [];
    for (let idx = createStartIdx + 1; idx <= slotStarts.length; idx++) {
      const boundary = idx >= slotStarts.length ? range.end : slotStarts[idx]!;
      out.push({ label: formatCreateBoundaryLabel(boundary, { kind: "end", boundaryIdx: idx }), value: idx });
    }
    return out;
  }, [createStartIdx, formatCreateBoundaryLabel, range.end, slotStarts]);

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
  const [hoverCell, setHoverCell] = React.useState<null | { resourceId: string; slotIdx: number; y: number }>(null);
  const autoScrollStateRef = React.useRef<{ dir: -1 | 0 | 1; speed: number; lastClientX: number; lastClientY: number }>({
    dir: 0,
    speed: 0,
    lastClientX: 0,
    lastClientY: 0,
  });
  const autoScrollRafRef = React.useRef<number | null>(null);

  const stopAutoScroll = React.useCallback(() => {
    if (autoScrollRafRef.current != null) cancelAnimationFrame(autoScrollRafRef.current);
    autoScrollRafRef.current = null;
    autoScrollStateRef.current.dir = 0;
    autoScrollStateRef.current.speed = 0;
  }, []);

  const getPointerContext = React.useCallback(
    (clientX: number, clientY: number, opts?: { biasLeft?: boolean; fallbackResourceId?: string }) => {
      const body = bodyRef.current;
      if (!body) return null;
      const bodyRect = body.getBoundingClientRect();
      const probeX = clamp(clientX, bodyRect.left + 1, bodyRect.right - 1);
      const probeY = clamp(clientY, bodyRect.top + 1, bodyRect.bottom - 1);
      const el = document.elementFromPoint(probeX, probeY) as HTMLElement | null;

      // The grid lives inside `bodyRef` (the right pane). Derive the x position
      // from the scroll container to avoid double-counting scrollLeft.
      const x = probeX - bodyRect.left + body.scrollLeft;
      // When creating events, users often drag to an hour boundary. If the pointer is
      // exactly on the boundary, bias to the left so a "04→06" drag doesn't become "04→07".
      const epsilon = opts?.biasLeft ? 0.01 : 0;
      const slotIdx = xToSlotIdx(x - epsilon);
      const rowEl = el && body.contains(el) ? ((el.closest?.("[data-uv-ct-row]") as HTMLElement | null) ?? null) : null;
      const rid = rowEl?.dataset?.uvCtRow ?? opts?.fallbackResourceId ?? null;
      if (!rid) return null;
      return { slotIdx, resourceId: rid, x };
    },
    [xToSlotIdx],
  );

  const slotToDate = React.useCallback(
    (slotIdx: number) => {
      const start = slotStarts[clamp(slotIdx, 0, slotStarts.length - 1)]!;
      if (activeView === "day") {
        const stepMs = Math.trunc(Math.max(5, Math.min(240, Math.trunc(dayTimeStepMinutes))) * 60_000);
        return { start, end: new Date(start.getTime() + stepMs) };
      }
      if (activeView === "sprint") {
        return { start, end: addZonedDays(start, 7, resolvedTimeZone) };
      }
      return { start, end: addZonedDays(start, 1, resolvedTimeZone) };
    },
    [activeView, dayTimeStepMinutes, resolvedTimeZone, slotStarts],
  );

  const updateDragPreview = React.useCallback(
    (clientX: number, clientY: number) => {
      const drag = dragRef.current;
      if (!drag) return;
      const ctx = getPointerContext(
        clientX,
        clientY,
        drag.mode === "create" ? { biasLeft: true, fallbackResourceId: drag.resourceId } : { fallbackResourceId: drag.resourceId },
      );
      if (!ctx) return;
      const { slotIdx } = ctx;

      const movedEnough =
        Math.abs(clientX - drag.startClientX) > 3 ||
        Math.abs(clientY - drag.startClientY) > 3 ||
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
    },
    [getPointerContext, range.end, range.start, slotToDate, slots.length],
  );

  const autoScrollTick = React.useCallback(() => {
    const drag = dragRef.current;
    const body = bodyRef.current;
    const st = autoScrollStateRef.current;
    if (!drag || !body || st.dir === 0) {
      stopAutoScroll();
      return;
    }

    const maxScrollLeft = Math.max(0, body.scrollWidth - body.clientWidth);
    const prevLeft = body.scrollLeft;
    const nextLeft = clamp(prevLeft + st.dir * st.speed, 0, maxScrollLeft);
    if (nextLeft === prevLeft) {
      stopAutoScroll();
      return;
    }
    body.scrollLeft = nextLeft;

    updateDragPreview(st.lastClientX, st.lastClientY);
    autoScrollRafRef.current = requestAnimationFrame(autoScrollTick);
  }, [stopAutoScroll, updateDragPreview]);

  const updateAutoScrollFromPointer = React.useCallback(
    (clientX: number, clientY: number) => {
      const body = bodyRef.current;
      if (!body) return;
      const rect = body.getBoundingClientRect();

      const edge = 56;
      let dir: -1 | 0 | 1 = 0;
      let speed = 0;

      if (clientX < rect.left + edge) {
        dir = -1;
        const dist = clientX - rect.left;
        const t = clamp(1 - dist / edge, 0, 1);
        speed = 8 + t * 28;
      } else if (clientX > rect.right - edge) {
        dir = 1;
        const dist = rect.right - clientX;
        const t = clamp(1 - dist / edge, 0, 1);
        speed = 8 + t * 28;
      }

      autoScrollStateRef.current.lastClientX = clientX;
      autoScrollStateRef.current.lastClientY = clientY;
      autoScrollStateRef.current.dir = dir;
      autoScrollStateRef.current.speed = speed;

      if (dir === 0) {
        stopAutoScroll();
        return;
      }
      if (autoScrollRafRef.current == null) autoScrollRafRef.current = requestAnimationFrame(autoScrollTick);
    },
    [autoScrollTick, stopAutoScroll],
  );

  React.useEffect(() => stopAutoScroll, [stopAutoScroll]);

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
    // When moving an event, keep the "grabbed point" under the pointer by basing
    // the delta on the slot under the pointer at drag start (not the event start).
    const pointerCtx = getPointerContext(e.clientX, e.clientY, { fallbackResourceId: ev.resourceId });
    const grabSlotIdx = pointerCtx?.slotIdx ?? startIdx;
    dragRef.current = {
      mode,
      eventId: ev.id,
      resourceId: ev.resourceId,
      originStart: ev._start,
      originEnd: ev._end,
      durationMs: ev._end.getTime() - ev._start.getTime(),
      pointerId: e.pointerId,
      startSlotIdx: grabSlotIdx,
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
    if (!drag) {
      if (isViewOnly) return;
      if (!(interactions?.creatable ?? false)) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest?.("[data-uv-ct-event]")) {
        if (hoverCell) setHoverCell(null);
        return;
      }
      const ctx = getPointerContext(e.clientX, e.clientY);
      if (!ctx) {
        if (hoverCell) setHoverCell(null);
        return;
      }
      const rowEl = target?.closest?.("[data-uv-ct-row]") as HTMLElement | null;
      if (!rowEl) {
        if (hoverCell) setHoverCell(null);
        return;
      }
      const rect = rowEl.getBoundingClientRect();
      const y = clamp(e.clientY - rect.top, 0, rect.height);
      if (!hoverCell || hoverCell.resourceId !== ctx.resourceId || hoverCell.slotIdx !== ctx.slotIdx || Math.abs(hoverCell.y - y) > 0.5) {
        setHoverCell({ resourceId: ctx.resourceId, slotIdx: ctx.slotIdx, y });
      }
      return;
    }
    if (drag.pointerId !== e.pointerId) return;
    updateAutoScrollFromPointer(e.clientX, e.clientY);
    updateDragPreview(e.clientX, e.clientY);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragRef.current = null;
    stopAutoScroll();
    setHoverCell(null);

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

  const slotHeaderNodes = React.useMemo(() => {
    const startIdx = colVirtEnabled ? visibleSlots.startIdx : 0;
    const endIdx = colVirtEnabled ? visibleSlots.endIdx : slots.length;
    const leftSpacer = startIdx > 0 ? (slotLefts[startIdx] ?? 0) : 0;
    const rightSpacer = gridWidth - (slotLefts[endIdx] ?? gridWidth);

    return (
      <div
        className="flex"
        style={{
          width: gridWidth,
          minWidth: gridWidth,
        }}
      >
        {leftSpacer > 0 ? <div style={{ width: leftSpacer, minWidth: leftSpacer }} /> : null}
        {slots.slice(startIdx, endIdx).map((s, j) => {
          const idx = startIdx + j;
          const borderClassName =
            activeView === "day" && dayHeaderMarks?.anchor
              ? dayHeaderMarks.anchor[idx]
                ? "border-border/30"
                : "border-border/10"
              : "border-border/30";
          return (
            <CalendarTimelineSlotHeaderCell
              key={`${s.start.toISOString()}_${idx}`}
              slotKey={`${s.start.toISOString()}_${idx}`}
              idx={idx}
              width={slotWidths[idx] ?? 0}
              activeView={activeView}
              isToday={s.isToday}
              label={s.label}
              ariaLabel={formatters?.ariaSlotLabel?.(s.start, { view: activeView, locale: resolvedLocale, timeZone: resolvedTimeZone })}
              borderClassName={borderClassName}
              className={cn(
                sizeConfig.slotHeaderClass,
                activeView !== "day" && s.isToday && "bg-primary/8 border-l-primary/40",
                activeView !== "day" && !s.isToday && s.isWeekend && "bg-muted/25",
              )}
              dayHeaderMarks={dayHeaderMarks}
            />
          );
        })}
        {rightSpacer > 0 ? <div style={{ width: rightSpacer, minWidth: rightSpacer }} /> : null}
      </div>
    );
  }, [
    activeView,
    colVirtEnabled,
    dayHeaderMarks,
    formatters,
    gridWidth,
    resolvedLocale,
    resolvedTimeZone,
    sizeConfig.slotHeaderClass,
    slotLefts,
    slotWidths,
    slots,
    visibleSlots.endIdx,
    visibleSlots.startIdx,
  ]);

  const Header = (
    <CalendarTimelineHeader
      title={title}
      resourcesHeaderLabel={t("resourcesHeader")}
      labels={{ today: l.today, prev: l.prev, next: l.next, month: l.month, week: l.week, day: l.day, sprint: l.sprint }}
      newEventLabel={l.newEvent}
      newEventDisabled={isViewOnly || !canCreate || resources.length === 0}
      onNewEventClick={isViewOnly ? undefined : openCreate}
      activeView={activeView}
      availableViews={availableViews}
      showResourceColumn={showResourceColumn}
      sizeConfig={sizeConfig}
      navigate={navigate}
      now={resolvedNow}
      onApplyDateTime={setDate}
      setView={setView}
      effectiveResourceColumnWidth={effectiveResourceColumnWidth}
      canResizeColumn={canResizeColumn}
      beginResizeColumn={beginResizeColumn}
      headerRef={headerRef}
      slotHeaderNodes={slotHeaderNodes}
    />
  );

  const layoutsByResource = useLayoutsByResource<TEventMeta>({
    eventsByResource,
    preview,
    slotStarts,
    slotsLength: slots.length,
    slotLefts,
    getResourceRowHeight,
    laneGap,
    lanePaddingY,
    effectiveMaxLanesPerRow,
    eventHeight,
  });

  return (
    <div
      className={cn(
        "rounded-2xl md:rounded-3xl overflow-hidden bg-card text-card-foreground backdrop-blur-sm",
        "border border-border shadow-sm md:hover:shadow-md",
        "transition-[transform,box-shadow,border-color,background-color] duration-300 ease-soft",
        densityClass,
        className,
      )}
      {...rest}
    >
      {Header}
      <div className="flex min-h-0">
        {/* Left column (resources / groups): vertical scroll sync with body */}
        {showResourceColumn ? (
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
        ) : null}

        {/* Right grid: main scroll container (both axes) */}
        <div
          ref={bodyRef}
          className="relative flex-1 overflow-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={() => setHoverCell(null)}
        >
          <div style={{ height: topSpacer }} />
          {gridWidth > 0 && renderedRowsHeight > 0 ? (
            <div className="pointer-events-none absolute left-0 z-0" style={{ top: topSpacer, width: gridWidth, height: renderedRowsHeight }}>
              <CalendarTimelineGridOverlay
                gridWidth={gridWidth}
                height={renderedRowsHeight}
                slotLefts={slotLefts}
                slotWidths={slotWidths}
                activeView={activeView}
                todaySlotIdx={todaySlotIdx}
                dayAnchor={activeView === "day" ? dayHeaderMarks?.anchor : null}
                weekendSlotIdxs={weekendSlotIdxs}
                visibleStartIdx={colVirtEnabled ? visibleSlots.startIdx : undefined}
                visibleEndIdx={colVirtEnabled ? visibleSlots.endIdx : undefined}
              />
            </div>
          ) : null}
          {rows.slice(startRow, endRow).map((row, idx) => {
            const rowIndex = startRow + idx;
            const h = rowHeightsArray[rowIndex] ?? effectiveRowHeight;
            if (row.kind === "group") {
              return (
                <div key={`rg_${row.group.id}_${rowIndex}`} className="flex" style={{ height: h }}>
                  <div
                    className="relative z-10 border-b border-border/30 bg-linear-to-r from-muted/15 to-muted/5"
                    style={{ width: gridWidth, minWidth: gridWidth }}
                  />
                </div>
              );
            }

            const r = row.resource;
            const layout = layoutsByResource.get(r.id) ?? { visible: [], hidden: [], baseTop: lanePaddingY, eventHeight };
            const canMore = layout.hidden.length > 0 && !!onMoreClick;
            const showCreateHint = !isViewOnly && (interactions?.creatable ?? false) && !preview && hoverCell?.resourceId === r.id;

            return (
              <div
                key={`rr_${r.id}_${rowIndex}`}
                className="group/row hover:bg-muted/5 transition-colors duration-150"
                style={{ height: h }}
                data-uv-ct-row={r.id}
              >
                <div className="relative z-10 shrink-0" style={{ width: gridWidth, minWidth: gridWidth, height: "100%" }}>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-border/25" />
                  <div className="absolute inset-0" onPointerDown={onPointerDownCell} onClick={onClickCell} data-uv-ct-timeline>
                    {hoverCell && hoverCell.resourceId === r.id ? (
                      <div
                        className="pointer-events-none absolute top-0 h-full bg-muted/10"
                        style={{
                          left: slotLefts[hoverCell.slotIdx] ?? 0,
                          width: slotWidths[hoverCell.slotIdx] ?? fixedSlotWidth,
                        }}
                        aria-hidden
                      />
                    ) : null}
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
                      }) ??
                      defaultEventTime({ start: ev._start, end: ev._end, locale: resolvedLocale, timeZone: resolvedTimeZone, view: activeView });

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
                                className={cn("text-xs font-semibold leading-snug min-w-0 overflow-hidden", isPlainTitle ? "wrap-break-word" : "")}
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

                    const shouldCompact =
                      (activeView === "day" && dayEventStyle === "compact") || (activeView === "month" && monthEventStyle === "compact");
                    const eventInsetX = 2;
                    const leftInset = left + eventInsetX;
                    const widthInset = Math.max(1, width - eventInsetX * 2);

                    const defaultMaxVisual = (() => {
                      if (activeView === "month") return clamp(Math.round(fixedSlotWidth * 2.5), 72, 360);
                      return clamp(Math.round(fixedSlotWidth * 1.2), 160, 360);
                    })();
                    const maxVisual = clamp(
                      Math.round(activeView === "month" ? (monthEventMaxWidth ?? defaultMaxVisual) : (dayEventMaxWidth ?? defaultMaxVisual)),
                      48,
                      1200,
                    );
                    const visualWidth = shouldCompact ? Math.min(widthInset, maxVisual) : widthInset;
                    const isClipped = shouldCompact && widthInset > visualWidth + 1;

                    const block = (
                      <div
                        className={cn("absolute select-none cursor-pointer", isPreview && "z-10")}
                        data-uv-ct-event
                        style={{ left: leftInset, top, width: widthInset, height: layout.eventHeight }}
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
                          <div
                          className={cn(
                            "relative h-full rounded-lg border overflow-hidden",
                            "shadow-sm hover:shadow-md hover:scale-[1.02]",
                            "transition-all duration-150 ease-out",
                            "backdrop-blur-sm",
                            ev.className,
                            isPreview && "ring-2 ring-primary/50 ring-offset-1 ring-offset-card scale-[1.02]",
                          )}
                          style={{
                            width: visualWidth,
                            maxWidth: "100%",
                            height: "100%",
                            background: bg,
                            borderColor: border,
                            borderLeftWidth: 3,
                          }}
                        >
                          {node}
                          {isClipped ? (
                            <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-card/50 to-transparent flex items-center justify-end pr-2">
                              <span className="text-xs text-muted-foreground/80">…</span>
                            </div>
                          ) : null}
                        </div>

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
                      </div>
                    );

                    if (!enableEventTooltips) return <React.Fragment key={ev.id}>{block}</React.Fragment>;

                    const tooltipContent = (
                      <div className="flex flex-col gap-0.5">
                        <div className="font-semibold">{tooltipTitle}</div>
                        <div className="text-xs opacity-80">{timeText}</div>
                        {resource?.label ? <div className="text-xs opacity-70">{resource.label}</div> : null}
                      </div>
                    );

                    return (
                      <Tooltip key={ev.id} content={tooltipContent} placement="top" delay={{ open: 250, close: 0 }}>
                        {block}
                      </Tooltip>
                    );
                  })}

                  {preview && preview.resourceId === r.id && !preview.eventId
                    ? (() => {
                        const startIdx = binarySearchLastLE(slotStarts, preview.start);
                        const endIdx = clamp(binarySearchFirstGE(slotStarts, preview.end), startIdx + 1, slots.length);
                        const left = slotLefts[startIdx] ?? 0;
                        const width = Math.max(1, (slotLefts[endIdx] ?? 0) - (slotLefts[startIdx] ?? 0));
                        const eventInsetX = 2;
                        return (
                          <div
                            className="absolute rounded-lg border-2 border-dashed border-primary/60 bg-primary/10 backdrop-blur-sm animate-pulse"
                            style={{
                              left: left + eventInsetX,
                              top: layout.baseTop,
                              width: Math.max(1, width - eventInsetX * 2),
                              height: layout.eventHeight,
                            }}
                          />
                        );
                      })()
                    : null}

                  {showCreateHint ? (
                    <div
                      className={cn(
                        "pointer-events-none absolute z-20",
                        "h-5 w-5 rounded-full",
                        "bg-card/80 backdrop-blur-sm",
                        "border border-border/60 shadow-xs",
                        "flex items-center justify-center",
                      )}
                      style={{
                        left: (slotLefts[hoverCell!.slotIdx] ?? 0) + (slotWidths[hoverCell!.slotIdx] ?? fixedSlotWidth) / 2 - 10,
                        top: clamp(Math.round(hoverCell!.y - 10), 6, Math.max(6, h - 26)),
                      }}
                      aria-hidden
                    >
                      <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  ) : null}

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
          {renderEventSheet ? (
            renderEventSheet({
              event: selectedEvent,
              resource: selectedResource,
              close: () => setEventSheetOpen(false),
              locale: resolvedLocale,
              timeZone: resolvedTimeZone,
              view: activeView,
            })
          ) : (
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
                <Combobox options={createStartOptions} value={createStartIdx} onChange={(v) => setCreateStartIdx(Number(v))} placeholder={l.start} />
              </div>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">{l.end}</div>
                <Combobox options={createEndOptions} value={createEndIdx} onChange={(v) => setCreateEndIdx(Number(v))} placeholder={l.end} />
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
