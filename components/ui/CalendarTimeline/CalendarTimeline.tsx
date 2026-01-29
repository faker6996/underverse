"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronsUpDown, Calendar, CalendarDays, CalendarRange, ChevronDown, Dot, GripVertical, Plus } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useLocale, useTranslations } from "@/lib/i18n/translation-adapter";
import Button from "../Button";
import type {
  CalendarTimelineEvent,
  CalendarTimelineGroup,
  CalendarTimelineLabels,
  CalendarTimelineProps,
  CalendarTimelineResource,
  CalendarTimelineSize,
  CalendarTimelineView,
} from "./types";
import { addZonedDays, addZonedMonths, getDtf, localeToBCP47, startOfZonedDay, startOfZonedMonth, startOfZonedWeek, toDate } from "./date";
import { binarySearchFirstGE, binarySearchLastLE, clamp, intervalPack } from "./layout";
import { useHorizontalScrollSync, useVirtualRows } from "./hooks";

type Row<TResourceMeta = unknown> =
  | { kind: "group"; group: CalendarTimelineGroup }
  | { kind: "resource"; resource: CalendarTimelineResource<TResourceMeta> };

type Slot = { start: Date; label: React.ReactNode; isToday: boolean };

function defaultMonthTitle(date: Date, locale: string, timeZone: string) {
  return getDtf(locale, timeZone, { month: "long", year: "numeric" }).format(date);
}

function defaultSlotHeader(slotStart: Date, view: CalendarTimelineView, locale: string, timeZone: string) {
  if (view === "day") {
    return getDtf(locale, timeZone, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(slotStart);
  }
  const weekday = getDtf(locale, timeZone, { weekday: "short" }).format(slotStart);
  const day = getDtf(locale, timeZone, { day: "numeric" }).format(slotStart);
  return (
    <span className="inline-flex flex-col items-center leading-tight">
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">{weekday}</span>
      <span className="text-sm font-semibold text-foreground">{day}</span>
    </span>
  );
}

function defaultEventTime(args: { start: Date; end: Date; locale: string; timeZone: string; view: CalendarTimelineView }) {
  const fmt = getDtf(args.locale, args.timeZone, { hour: "2-digit", minute: "2-digit" });
  if (args.view === "day") return `${fmt.format(args.start)} - ${fmt.format(args.end)}`;
  const df = getDtf(args.locale, args.timeZone, { month: "short", day: "numeric" });
  const inclusiveEnd = new Date(args.end.getTime() - 1);
  const a = df.format(args.start);
  const b = df.format(inclusiveEnd);
  return a === b ? a : `${a} - ${b}`;
}

export default function CalendarTimeline<TResourceMeta = unknown, TEventMeta = unknown>({
  resources,
  events,
  size = "md",
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
  rowHeight,
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
  onCreateEvent,
  onEventMove,
  onEventResize,
  onMoreClick,
  virtualization,
  className,
  ...rest
}: CalendarTimelineProps<TResourceMeta, TEventMeta>) {
  const t = useTranslations("CalendarTimeline");
  const detectedLocale = useLocale();

  const resolvedLocale = React.useMemo(() => localeToBCP47(locale ?? detectedLocale), [locale, detectedLocale]);
  const resolvedTimeZone = React.useMemo(() => timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC", [timeZone]);

  const sizeConfig = React.useMemo(() => {
    const cfgBySize: Record<
      CalendarTimelineSize,
      {
        resourceColumnWidth: number;
        rowHeight: number;
        slotMinWidth: number;
        eventHeight: number;
        laneGap: number;
        lanePaddingY: number;
        densityClass: string;
        headerPaddingClass: string;
        titleClass: string;
        resourceRowClass: string;
        groupRowClass: string;
        slotHeaderClass: string;
        controlButtonIconClass: string;
        controlButtonTextClass: string;
      }
    > = {
      sm: {
        resourceColumnWidth: 200,
        rowHeight: 44,
        slotMinWidth: 52,
        eventHeight: 16,
        laneGap: 3,
        lanePaddingY: 5,
        densityClass: "text-xs",
        headerPaddingClass: "px-3 py-2",
        titleClass: "text-base",
        resourceRowClass: "gap-2 px-3",
        groupRowClass: "gap-2 px-3",
        slotHeaderClass: "px-1 py-2",
        controlButtonIconClass: "h-7 w-7",
        controlButtonTextClass: "h-7 px-2 text-xs",
      },
      md: {
        resourceColumnWidth: 240,
        rowHeight: 52,
        slotMinWidth: 64,
        eventHeight: 18,
        laneGap: 4,
        lanePaddingY: 6,
        densityClass: "text-sm",
        headerPaddingClass: "px-4 py-3",
        titleClass: "text-lg",
        resourceRowClass: "gap-3 px-4",
        groupRowClass: "gap-3 px-4",
        slotHeaderClass: "px-1 py-3",
        controlButtonIconClass: "h-8 w-8",
        controlButtonTextClass: "h-8 px-3",
      },
      xl: {
        resourceColumnWidth: 280,
        rowHeight: 60,
        slotMinWidth: 76,
        eventHeight: 20,
        laneGap: 5,
        lanePaddingY: 8,
        densityClass: "text-base",
        headerPaddingClass: "px-5 py-4",
        titleClass: "text-xl",
        resourceRowClass: "gap-4 px-5",
        groupRowClass: "gap-4 px-5",
        slotHeaderClass: "px-2 py-4",
        controlButtonIconClass: "h-9 w-9",
        controlButtonTextClass: "h-9 px-4 text-sm",
      },
    };
    return cfgBySize[size];
  }, [size]);

  const effectiveResourceColumnWidth = resourceColumnWidth ?? sizeConfig.resourceColumnWidth;
  const effectiveRowHeight = rowHeight ?? sizeConfig.rowHeight;
  const effectiveSlotMinWidth = slotMinWidth ?? sizeConfig.slotMinWidth;

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
      expandGroup: labels?.expandGroup ?? t("expandGroup"),
      collapseGroup: labels?.collapseGroup ?? t("collapseGroup"),
      more: labels?.more ?? ((n) => t("more", { n })),
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

  const rows: Row<TResourceMeta>[] = React.useMemo(() => {
    if (!groups || groups.length === 0) return resources.map((resource) => ({ kind: "resource", resource }));
    const byGroup = new Map<string, CalendarTimelineResource<TResourceMeta>[]>();
    for (const r of resources) {
      const gid = r.groupId ?? "__ungrouped__";
      if (!byGroup.has(gid)) byGroup.set(gid, []);
      byGroup.get(gid)!.push(r);
    }
    const out: Row<TResourceMeta>[] = [];
    const seen = new Set<string>();
    for (const g of groups) {
      out.push({ kind: "group", group: g });
      seen.add(g.id);
      if (collapsed[g.id]) continue;
      const children = byGroup.get(g.id) ?? [];
      for (const r of children) out.push({ kind: "resource", resource: r });
    }
    for (const gid of byGroup.keys()) {
      if (gid === "__ungrouped__") continue;
      if (seen.has(gid)) continue;
      out.push({ kind: "group", group: { id: gid, label: gid, collapsible: true } });
      if (collapsed[gid]) continue;
      for (const r of byGroup.get(gid) ?? []) out.push({ kind: "resource", resource: r });
    }
    const ungrouped = byGroup.get("__ungrouped__") ?? [];
    if (ungrouped.length) {
      out.push({ kind: "group", group: { id: "__ungrouped__", label: "", collapsible: true } });
      for (const r of ungrouped) out.push({ kind: "resource", resource: r });
    }
    return out;
  }, [resources, groups, collapsed]);

  const { slots, range } = React.useMemo((): { slots: Slot[]; range: { start: Date; end: Date } } => {
    const start =
      activeView === "month"
        ? startOfZonedMonth(activeDate, resolvedTimeZone)
        : activeView === "week"
          ? startOfZonedWeek(activeDate, weekStartsOn, resolvedTimeZone)
          : startOfZonedDay(activeDate, resolvedTimeZone);

    if (activeView === "day") {
      const step = Math.max(5, Math.min(240, Math.trunc(dayTimeStepMinutes)));
      const stepMs = step * 60_000;
      const end = addZonedDays(start, 1, resolvedTimeZone);
      const slotStarts: Date[] = [];
      for (let cur = start.getTime(), guard = 0; cur < end.getTime() && guard++ < 2000; cur += stepMs) {
        slotStarts.push(new Date(cur));
      }
      const todayStart = startOfZonedDay(resolvedNow, resolvedTimeZone).getTime();
      const slotItems: Slot[] = slotStarts.map((s) => ({
        start: s,
        label:
          formatters?.slotHeader?.(s, { view: activeView, locale: resolvedLocale, timeZone: resolvedTimeZone }) ??
          defaultSlotHeader(s, activeView, resolvedLocale, resolvedTimeZone),
        isToday: startOfZonedDay(s, resolvedTimeZone).getTime() === todayStart,
      }));
      return { slots: slotItems, range: { start, end } };
    }

    const end =
      activeView === "month"
        ? startOfZonedMonth(addZonedMonths(start, 1, resolvedTimeZone), resolvedTimeZone)
        : addZonedDays(start, 7, resolvedTimeZone);
    const slotStarts: Date[] = [];
    let cur = start;
    let guard = 0;
    while (cur.getTime() < end.getTime() && guard++ < 60) {
      slotStarts.push(cur);
      cur = addZonedDays(cur, 1, resolvedTimeZone);
    }

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

  const slotStarts = React.useMemo(() => slots.map((s) => s.start), [slots]);
  const slotWidth = effectiveSlotMinWidth;
  const gridWidth = slots.length * slotWidth;

  const normalizedEvents = React.useMemo(() => {
    const rangeStart = range.start.getTime();
    const rangeEnd = range.end.getTime();
    return (events as CalendarTimelineEvent<TEventMeta>[])
      .map((e) => {
        const start = toDate(e.start);
        const end = toDate(e.end);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
        const ns = activeView === "day" ? start : startOfZonedDay(start, resolvedTimeZone);
        let ne = activeView === "day" ? end : startOfZonedDay(end, resolvedTimeZone);
        if (ne.getTime() <= ns.getTime()) ne = activeView === "day" ? new Date(ns.getTime() + 60_000) : addZonedDays(ns, 1, resolvedTimeZone);
        const cs = new Date(clamp(ns.getTime(), rangeStart, rangeEnd));
        const ce = new Date(clamp(ne.getTime(), rangeStart, rangeEnd));
        if (ce.getTime() <= rangeStart || cs.getTime() >= rangeEnd) return null;
        return { ...e, _start: cs, _end: ce };
      })
      .filter(Boolean) as Array<CalendarTimelineEvent<TEventMeta> & { _start: Date; _end: Date }>;
  }, [events, range.start, range.end, activeView, resolvedTimeZone]);

  const eventsByResource = React.useMemo(() => {
    const map = new Map<string, Array<CalendarTimelineEvent<TEventMeta> & { _start: Date; _end: Date }>>();
    for (const e of normalizedEvents) {
      if (!map.has(e.resourceId)) map.set(e.resourceId, []);
      map.get(e.resourceId)!.push(e);
    }
    return map;
  }, [normalizedEvents]);

  const bodyRef = React.useRef<HTMLDivElement>(null);
  const headerRef = React.useRef<HTMLDivElement>(null);

  useHorizontalScrollSync({ bodyRef, headerRef });

  const title = React.useMemo(() => {
    return (
      formatters?.monthTitle?.(activeDate, { locale: resolvedLocale, timeZone: resolvedTimeZone }) ??
      defaultMonthTitle(activeDate, resolvedLocale, resolvedTimeZone)
    );
  }, [activeDate, formatters, resolvedLocale, resolvedTimeZone]);

  const densityClass = sizeConfig.densityClass;
  const eventHeight = sizeConfig.eventHeight;
  const laneGap = sizeConfig.laneGap;
  const lanePaddingY = sizeConfig.lanePaddingY;

  const virt = virtualization?.enabled;
  const overscan = virtualization?.overscan ?? 8;
  const {
    startIndex: startRow,
    endIndex: endRow,
    topSpacer,
    bottomSpacer,
  } = useVirtualRows({
    enabled: virt,
    overscan,
    rowHeight: effectiveRowHeight,
    itemCount: rows.length,
    scrollRef: bodyRef,
  });

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
  }>(null);
  const [preview, setPreview] = React.useState<{ eventId?: string; resourceId: string; start: Date; end: Date } | null>(null);

  const getPointerContext = React.useCallback(
    (clientX: number, clientY: number) => {
      const body = bodyRef.current;
      if (!body) return null;
      const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
      const timelineEl = el?.closest?.("[data-uv-ct-timeline]") as HTMLElement | null;
      if (!timelineEl) return null;
      const timelineRect = timelineEl.getBoundingClientRect();
    const x = clientX - timelineRect.left + body.scrollLeft;
    const slotIdx = clamp(Math.floor(x / slotWidth), 0, Math.max(0, slots.length - 1));
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
    if (ev.resourceId == null) return;
    const allowDrag = interactions?.draggableEvents ?? true;
    const allowResize = interactions?.resizableEvents ?? true;
    if (mode === "move" && (!allowDrag || ev.draggable === false)) return;
    if ((mode === "resize-start" || mode === "resize-end") && (!allowResize || ev.resizable === false)) return;

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
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
    e.stopPropagation();
  };

  const onPointerDownCell = (e: React.PointerEvent) => {
    if (!(interactions?.creatable ?? false) || !onCreateEvent) return;
    const ctx = getPointerContext(e.clientX, e.clientY);
    if (!ctx?.resourceId) return;
    const { start } = slotToDate(ctx.slotIdx);
    const { end } = slotToDate(ctx.slotIdx + 1 >= slots.length ? ctx.slotIdx : ctx.slotIdx + 1);
    dragRef.current = {
      mode: "create",
      resourceId: ctx.resourceId,
      originStart: start,
      originEnd: end,
      durationMs: end.getTime() - start.getTime(),
      pointerId: e.pointerId,
      startSlotIdx: ctx.slotIdx,
      startRowResourceId: ctx.resourceId,
    };
    setPreview({ resourceId: ctx.resourceId, start, end });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const ctx = getPointerContext(e.clientX, e.clientY);
    if (!ctx || !ctx.resourceId) return;
    const { slotIdx } = ctx;
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
    return (
      <button
        type="button"
        onClick={canToggle ? toggle : undefined}
        className={cn(
          "w-full h-full flex items-center text-left",
          sizeConfig.groupRowClass,
          "bg-linear-to-r from-muted/40 to-muted/20 border-b border-border/40",
          "backdrop-blur-sm",
          canToggle ? "cursor-pointer hover:from-muted/60 hover:to-muted/30 transition-all duration-200" : "cursor-default",
        )}
        aria-label={isCollapsed ? l.expandGroup : l.collapseGroup}
      >
        <span
          className={cn(
            "inline-flex items-center justify-center w-5 h-5 rounded-md bg-background/60 transition-transform duration-200",
            isCollapsed ? "" : "rotate-180",
          )}
        >
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </span>
        <span className="font-semibold text-foreground/90">{g.label}</span>
        <span className="ml-auto text-xs text-muted-foreground/60 font-medium">{resources.filter((r) => r.groupId === g.id).length} items</span>
      </button>
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

  const viewIcons = {
    month: <CalendarRange className="h-4 w-4" />,
    week: <CalendarDays className="h-4 w-4" />,
    day: <Calendar className="h-4 w-4" />,
  };

  const Header = (
    <div className="sticky top-0 z-30 bg-linear-to-b from-background via-background to-background/95 border-b border-border/40 backdrop-blur-xl">
      <div className={cn("flex items-center justify-between gap-4", sizeConfig.headerPaddingClass)}>
        {/* Navigation Controls */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="flex items-center bg-muted/40 rounded-xl p-1 gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              aria-label={l.prev}
              className={cn(sizeConfig.controlButtonIconClass, "rounded-lg hover:bg-background/80 transition-all duration-200")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToday}
              className={cn(sizeConfig.controlButtonTextClass, "rounded-lg hover:bg-background/80 font-medium transition-all duration-200")}
            >
              {l.today}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(1)}
              aria-label={l.next}
              className={cn(sizeConfig.controlButtonIconClass, "rounded-lg hover:bg-background/80 transition-all duration-200")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className={cn("ml-3 font-semibold tracking-tight truncate text-foreground", sizeConfig.titleClass)}>{title}</h2>
        </div>

        {/* View Switcher */}
        <div className="flex items-center bg-muted/40 rounded-xl p-1 gap-0.5">
          {(["month", "week", "day"] as CalendarTimelineView[]).map((v) => (
            <Button
              key={v}
              variant={activeView === v ? "default" : "ghost"}
              size="sm"
              onClick={() => setView(v)}
              className={cn(
                sizeConfig.controlButtonTextClass,
                "rounded-lg font-medium transition-all duration-200 gap-1.5",
                activeView === v
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                  : "hover:bg-background/80 text-muted-foreground hover:text-foreground",
              )}
            >
              {viewIcons[v]}
              <span className="hidden sm:inline">{l[v]}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Slot Headers */}
      <div className="flex border-t border-border/20">
        <div
          className="shrink-0 border-r border-border/30 bg-muted/20 flex items-center justify-center"
          style={{ width: effectiveResourceColumnWidth, minWidth: effectiveResourceColumnWidth }}
        >
          <span className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider">
            {t("resourcesHeader")}
          </span>
        </div>
        <div ref={headerRef} className="overflow-x-auto overflow-y-hidden scrollbar-none">
          {slotHeaderNodes}
        </div>
      </div>
    </div>
  );

  const ResourceCell = (r: CalendarTimelineResource<TResourceMeta>) => (
    <div
      className={cn(
        "h-full w-full flex items-center border-b border-border/30 bg-linear-to-r from-background to-background/95",
        sizeConfig.resourceRowClass,
        "hover:from-muted/30 hover:to-muted/10 transition-all duration-200 group",
      )}
    >
      <div className="shrink-0 opacity-0 group-hover:opacity-60 transition-opacity cursor-grab">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className={cn("flex-1 min-w-0", r.disabled && "opacity-50")}>
        {renderResource ? renderResource(r) : <span className="font-medium text-sm truncate block">{r.label}</span>}
      </div>
    </div>
  );

  const layoutsByResource = React.useMemo(() => {
    const map = new Map<
      string,
      {
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

      const { packed } = intervalPack(mapped.map((m) => ({ ...m, startIdx: m.startIdx, endIdx: m.endIdx })));
      const visible = packed.filter((p) => p.lane < maxLanesPerRow);
      const hidden = packed.filter((p) => p.lane >= maxLanesPerRow);
      map.set(resourceId, {
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
  }, [eventsByResource, slotStarts, slots.length, slotWidth, maxLanesPerRow, preview]);

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
      <div
        ref={bodyRef}
        className="relative overflow-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div style={{ height: topSpacer }} />
        {rows.slice(startRow, endRow).map((row, idx) => {
          const rowIndex = startRow + idx;
          if (row.kind === "group") {
            return (
              <div key={`g_${row.group.id}_${rowIndex}`} className="flex" style={{ height: effectiveRowHeight }}>
                <div
                  className="shrink-0 sticky left-0 z-20"
                  style={{ width: effectiveResourceColumnWidth, minWidth: effectiveResourceColumnWidth }}
                >
                  {renderGroupRow(row.group)}
                </div>
                <div className="flex-1 border-b border-border/30 bg-linear-to-r from-muted/15 to-muted/5" style={{ minWidth: gridWidth }} />
              </div>
            );
          }

          const r = row.resource;
          const layout = layoutsByResource.get(r.id) ?? { visible: [], hidden: [] };
          const canMore = layout.hidden.length > 0 && !!onMoreClick;

          return (
            <div
              key={`r_${r.id}_${rowIndex}`}
              className="flex group/row hover:bg-muted/5 transition-colors duration-150"
              style={{ height: effectiveRowHeight }}
              data-uv-ct-row={r.id}
            >
              <div
                className="shrink-0 sticky left-0 z-20 border-r border-border/30"
                style={{ width: effectiveResourceColumnWidth, minWidth: effectiveResourceColumnWidth }}
              >
                {ResourceCell(r)}
              </div>
              <div className="relative shrink-0" style={{ width: gridWidth, minWidth: gridWidth }}>
                <div className="absolute inset-0" onPointerDown={onPointerDownCell} data-uv-ct-timeline>
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
                  const top = lanePaddingY + lane * (eventHeight + laneGap);
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

                  const node = renderEvent?.(ev, { left, width, lane }) ?? (
                    <div className="px-2.5 py-1 truncate flex items-center gap-1.5">
                      {ev.title ? <span className="font-semibold text-[11px] truncate leading-tight">{ev.title}</span> : null}
                      <span className="text-[10px] opacity-70 truncate ml-auto">{timeText}</span>
                    </div>
                  );

                  return (
                    <div
                      key={ev.id}
                      className={cn(
                        "absolute rounded-lg border select-none cursor-pointer",
                        "shadow-sm hover:shadow-md hover:scale-[1.02] hover:z-10",
                        "transition-all duration-150 ease-out",
                        "backdrop-blur-sm",
                        ev.className,
                        isPreview && "ring-2 ring-primary/50 ring-offset-1 ring-offset-background scale-[1.02] z-10",
                      )}
                      style={{
                        left,
                        top,
                        width,
                        height: eventHeight,
                        background: bg,
                        borderColor: border,
                        borderLeftWidth: 3,
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={aria}
                      onClick={() => onEventClick?.(ev)}
                      onDoubleClick={() => onEventDoubleClick?.(ev)}
                      onPointerDown={(e) => onPointerDownEvent(e, ev, "move")}
                    >
                      {(interactions?.resizableEvents ?? true) && ev.resizable !== false ? (
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
                          style={{ left, top: lanePaddingY, width, height: eventHeight }}
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
  );
}
