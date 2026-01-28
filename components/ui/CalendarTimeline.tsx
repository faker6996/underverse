"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import Button from "./Button";
import { ChevronLeft, ChevronRight, ChevronsUpDown } from "lucide-react";
import { useLocale, useTranslations } from "@/lib/i18n/translation-adapter";

export type CalendarTimelineView = "month" | "week" | "day";
export type CalendarTimelineDateInput = Date | string | number;

export interface CalendarTimelineGroup {
  id: string;
  label: React.ReactNode;
  collapsible?: boolean;
}

export interface CalendarTimelineResource<TMeta = unknown> {
  id: string;
  label: React.ReactNode;
  groupId?: string;
  meta?: TMeta;
  disabled?: boolean;
}

export interface CalendarTimelineEvent<TMeta = unknown> {
  id: string;
  resourceId: string;
  start: CalendarTimelineDateInput;
  end: CalendarTimelineDateInput; // end is exclusive
  title?: React.ReactNode;
  color?: string;
  className?: string;
  meta?: TMeta;
  draggable?: boolean;
  resizable?: boolean;
}

export interface CalendarTimelineLabels {
  today?: string;
  prev?: string;
  next?: string;
  month?: string;
  week?: string;
  day?: string;
  expandGroup?: string;
  collapseGroup?: string;
  more?: (n: number) => string;
}

export interface CalendarTimelineFormatters {
  monthTitle?: (date: Date, ctx: { locale: string; timeZone: string }) => string;
  slotHeader?: (slotStart: Date, ctx: { view: CalendarTimelineView; locale: string; timeZone: string }) => React.ReactNode;
  eventTime?: (args: { start: Date; end: Date; locale: string; timeZone: string; view: CalendarTimelineView }) => string;
  ariaEventLabel?: (event: CalendarTimelineEvent, ctx: { locale: string; timeZone: string }) => string;
  ariaSlotLabel?: (slotStart: Date, ctx: { view: CalendarTimelineView; locale: string; timeZone: string }) => string;
}

export interface CalendarTimelineInteractions {
  selectable?: boolean;
  creatable?: boolean;
  draggableEvents?: boolean;
  resizableEvents?: boolean;
}

export interface CalendarTimelineVirtualization {
  enabled?: boolean;
  overscan?: number;
}

export interface CalendarTimelineProps<TResourceMeta = unknown, TEventMeta = unknown>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  resources: CalendarTimelineResource<TResourceMeta>[];
  events: CalendarTimelineEvent<TEventMeta>[];

  // view/date
  view?: CalendarTimelineView;
  defaultView?: CalendarTimelineView;
  onViewChange?: (view: CalendarTimelineView) => void;

  date?: Date;
  defaultDate?: Date;
  onDateChange?: (date: Date) => void;

  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;

  // timezone + i18n
  locale?: string; // BCP47 like "vi-VN"
  timeZone?: string; // IANA TZ like "Asia/Ho_Chi_Minh"
  labels?: CalendarTimelineLabels;
  formatters?: CalendarTimelineFormatters;

  // grouping
  groups?: CalendarTimelineGroup[];
  groupCollapsed?: Record<string, boolean>;
  defaultGroupCollapsed?: Record<string, boolean>;
  onGroupCollapsedChange?: (next: Record<string, boolean>) => void;

  // layout
  resourceColumnWidth?: number | string;
  rowHeight?: number;
  slotMinWidth?: number; // min px per slot; timeline can overflow horizontally
  dayTimeStepMinutes?: number; // day view slot size
  maxLanesPerRow?: number;
  now?: Date;

  // rendering
  renderResource?: (resource: CalendarTimelineResource<TResourceMeta>) => React.ReactNode;
  renderGroup?: (group: CalendarTimelineGroup, args: { collapsed: boolean; toggle: () => void }) => React.ReactNode;
  renderEvent?: (event: CalendarTimelineEvent<TEventMeta>, layout: { left: number; width: number; lane: number }) => React.ReactNode;

  // interactions
  interactions?: CalendarTimelineInteractions;
  onRangeChange?: (range: { start: Date; end: Date }) => void;
  onEventClick?: (event: CalendarTimelineEvent<TEventMeta>) => void;
  onEventDoubleClick?: (event: CalendarTimelineEvent<TEventMeta>) => void;
  onCreateEvent?: (draft: { resourceId: string; start: Date; end: Date }) => void;
  onEventMove?: (args: { eventId: string; resourceId: string; start: Date; end: Date }) => void;
  onEventResize?: (args: { eventId: string; start: Date; end: Date }) => void;
  onMoreClick?: (args: { resourceId: string; hiddenEvents: CalendarTimelineEvent<TEventMeta>[] }) => void;

  virtualization?: CalendarTimelineVirtualization;
}

type Row<TResourceMeta = unknown> =
  | { kind: "group"; group: CalendarTimelineGroup }
  | { kind: "resource"; resource: CalendarTimelineResource<TResourceMeta> };

type Slot = { start: Date; label: React.ReactNode; isToday: boolean };

function toDate(input: CalendarTimelineDateInput): Date {
  return input instanceof Date ? input : new Date(input);
}

const localeToBCP47 = (l: string) => {
  if (l === "vi") return "vi-VN";
  if (l === "en") return "en-US";
  if (l === "ko") return "ko-KR";
  if (l === "ja") return "ja-JP";
  return l;
};

const dtfCache = new Map<string, Intl.DateTimeFormat>();
function getDtf(locale: string, timeZone: string, options: Intl.DateTimeFormatOptions) {
  const key = `${locale}__${timeZone}__${JSON.stringify(options)}`;
  const cached = dtfCache.get(key);
  if (cached) return cached;
  const dtf = new Intl.DateTimeFormat(locale, { timeZone, ...options });
  dtfCache.set(key, dtf);
  return dtf;
}

function getZonedParts(date: Date, timeZone: string) {
  const dtf = getDtf("en-US", timeZone, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = dtf.formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? "0");
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

function partsToUtcMs(p: { year: number; month: number; day: number; hour: number; minute: number; second: number }) {
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
}

function zonedTimeToUtcMs(args: { year: number; month: number; day: number; hour: number; minute: number; second: number }, timeZone: string) {
  let utc = partsToUtcMs(args);
  // Iteratively converge in case TZ offset/DST shifts the guess.
  for (let i = 0; i < 3; i++) {
    const actual = getZonedParts(new Date(utc), timeZone);
    const diff = partsToUtcMs(args) - partsToUtcMs(actual);
    if (diff === 0) break;
    utc += diff;
  }
  return utc;
}

function startOfZonedDay(date: Date, timeZone: string) {
  const p = getZonedParts(date, timeZone);
  return new Date(zonedTimeToUtcMs({ ...p, hour: 0, minute: 0, second: 0 }, timeZone));
}

function startOfZonedMonth(date: Date, timeZone: string) {
  const p = getZonedParts(date, timeZone);
  return new Date(zonedTimeToUtcMs({ year: p.year, month: p.month, day: 1, hour: 0, minute: 0, second: 0 }, timeZone));
}

function addZonedDays(date: Date, days: number, timeZone: string) {
  const p = getZonedParts(date, timeZone);
  return new Date(zonedTimeToUtcMs({ ...p, day: p.day + days }, timeZone));
}

function addZonedMonths(date: Date, months: number, timeZone: string) {
  const p = getZonedParts(date, timeZone);
  // Use UTC date math on the calendar components, then convert back.
  const base = new Date(Date.UTC(p.year, p.month - 1 + months, 1, p.hour, p.minute, p.second));
  const next = getZonedParts(base, "UTC");
  // Clamp day to days-in-month.
  const daysInTargetMonth = new Date(Date.UTC(next.year, next.month, 0)).getUTCDate();
  const clampedDay = Math.min(p.day, daysInTargetMonth);
  return new Date(zonedTimeToUtcMs({ year: next.year, month: next.month, day: clampedDay, hour: p.hour, minute: p.minute, second: p.second }, timeZone));
}

function startOfZonedWeek(date: Date, weekStartsOn: number, timeZone: string) {
  const p = getZonedParts(date, timeZone);
  const weekday = new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay();
  const diff = (weekday - weekStartsOn + 7) % 7;
  return new Date(zonedTimeToUtcMs({ year: p.year, month: p.month, day: p.day - diff, hour: 0, minute: 0, second: 0 }, timeZone));
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function binarySearchFirstGE(arr: Date[], target: Date) {
  let lo = 0;
  let hi = arr.length;
  const t = target.getTime();
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid]!.getTime() < t) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function binarySearchLastLE(arr: Date[], target: Date) {
  const idx = binarySearchFirstGE(arr, target);
  if (idx === 0) return 0;
  if (idx >= arr.length) return arr.length - 1;
  const t = target.getTime();
  if (arr[idx]!.getTime() === t) return idx;
  return idx - 1;
}

function intervalPack<T extends { startIdx: number; endIdx: number }>(items: T[]) {
  const sorted = [...items].sort((a, b) => a.startIdx - b.startIdx || a.endIdx - b.endIdx);
  const lanes: { endIdx: number }[] = [];
  const out: Array<T & { lane: number }> = [];
  for (const it of sorted) {
    let lane = -1;
    for (let i = 0; i < lanes.length; i++) {
      if (lanes[i]!.endIdx <= it.startIdx) {
        lane = i;
        break;
      }
    }
    if (lane === -1) {
      lane = lanes.length;
      lanes.push({ endIdx: it.endIdx });
    } else {
      lanes[lane]!.endIdx = it.endIdx;
    }
    out.push({ ...it, lane });
  }
  return { packed: out, laneCount: lanes.length };
}

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
    <span className="inline-flex flex-col leading-tight">
      <span className="text-[11px] text-muted-foreground">{weekday}</span>
      <span className="text-[12px] font-medium">{day}</span>
    </span>
  );
}

function defaultEventTime(args: { start: Date; end: Date; locale: string; timeZone: string; view: CalendarTimelineView }) {
  const fmt = getDtf(args.locale, args.timeZone, { hour: "2-digit", minute: "2-digit" });
  if (args.view === "day") return `${fmt.format(args.start)} - ${fmt.format(args.end)}`;
  // month/week: treat as all-day in the view (still display date range if spans)
  const df = getDtf(args.locale, args.timeZone, { month: "short", day: "numeric" });
  const inclusiveEnd = new Date(args.end.getTime() - 1);
  const a = df.format(args.start);
  const b = df.format(inclusiveEnd);
  return a === b ? a : `${a} - ${b}`;
}

export default function CalendarTimeline<TResourceMeta = unknown, TEventMeta = unknown>({
  resources,
  events,
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
  resourceColumnWidth = 220,
  rowHeight = 48,
  slotMinWidth = 56,
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

  const resolvedLocale = React.useMemo(() => locale ?? localeToBCP47(detectedLocale), [locale, detectedLocale]);
  const resolvedTimeZone = React.useMemo(
    () => timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC",
    [timeZone],
  );

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

  const setView = (next: CalendarTimelineView) => {
    if (!isControlledView) setInternalView(next);
    onViewChange?.(next);
  };
  const setDate = (next: Date) => {
    if (!isControlledDate) setInternalDate(next);
    onDateChange?.(next);
  };

  const navigate = (dir: -1 | 1) => {
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
  };

  const goToday = () => setDate(resolvedNow);

  const [internalCollapsed, setInternalCollapsed] = React.useState<Record<string, boolean>>(() => defaultGroupCollapsed ?? {});
  const collapsed = groupCollapsed ?? internalCollapsed;
  const setCollapsed = (next: Record<string, boolean>) => {
    if (!groupCollapsed) setInternalCollapsed(next);
    onGroupCollapsedChange?.(next);
  };

  const groupById = React.useMemo(() => {
    const map = new Map<string, CalendarTimelineGroup>();
    for (const g of groups ?? []) map.set(g.id, g);
    return map;
  }, [groups]);

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
    // Any groups not declared in `groups` but referenced by resources.
    for (const gid of byGroup.keys()) {
      if (gid === "__ungrouped__") continue;
      if (seen.has(gid)) continue;
      out.push({ kind: "group", group: { id: gid, label: gid, collapsible: true } });
      if (collapsed[gid]) continue;
      for (const r of byGroup.get(gid) ?? []) out.push({ kind: "resource", resource: r });
    }
    // Any resources without a matching group go last.
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
        label: formatters?.slotHeader?.(s, { view: activeView, locale: resolvedLocale, timeZone: resolvedTimeZone }) ?? defaultSlotHeader(s, activeView, resolvedLocale, resolvedTimeZone),
        isToday: startOfZonedDay(s, resolvedTimeZone).getTime() === todayStart,
      }));
      return { slots: slotItems, range: { start, end } };
    }

    const end = activeView === "month" ? startOfZonedMonth(addZonedMonths(start, 1, resolvedTimeZone), resolvedTimeZone) : addZonedDays(start, 7, resolvedTimeZone);
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
      label: formatters?.slotHeader?.(s, { view: activeView, locale: resolvedLocale, timeZone: resolvedTimeZone }) ?? defaultSlotHeader(s, activeView, resolvedLocale, resolvedTimeZone),
      isToday: startOfZonedDay(s, resolvedTimeZone).getTime() === todayStart,
    }));

    return { slots: slotItems, range: { start, end } };
  }, [activeView, activeDate, resolvedTimeZone, resolvedLocale, weekStartsOn, dayTimeStepMinutes, resolvedNow, formatters]);

  React.useEffect(() => {
    onRangeChange?.(range);
  }, [range.start, range.end, onRangeChange]);

  const slotStarts = React.useMemo(() => slots.map((s) => s.start), [slots]);
  const slotWidth = slotMinWidth;
  const gridWidth = slots.length * slotWidth;

  const normalizedEvents = React.useMemo(() => {
    const rangeStart = range.start.getTime();
    const rangeEnd = range.end.getTime();
    return (events as CalendarTimelineEvent<TEventMeta>[])
      .map((e) => {
        const start = toDate(e.start);
        const end = toDate(e.end);
        // Guard invalid dates
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
        // Normalize for month/week as day-based blocks.
        const ns = activeView === "day" ? start : startOfZonedDay(start, resolvedTimeZone);
        let ne = activeView === "day" ? end : startOfZonedDay(end, resolvedTimeZone);
        if (ne.getTime() <= ns.getTime()) ne = activeView === "day" ? new Date(ns.getTime() + 60_000) : addZonedDays(ns, 1, resolvedTimeZone);
        // Clamp to visible range
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

  React.useEffect(() => {
    const body = bodyRef.current;
    const header = headerRef.current;
    if (!body || !header) return;
    let raf = 0;
    let syncing = false;
    const syncHeader = () => {
      if (syncing) return;
      syncing = true;
      header.scrollLeft = body.scrollLeft;
      syncing = false;
    };
    const syncBody = () => {
      if (syncing) return;
      syncing = true;
      body.scrollLeft = header.scrollLeft;
      syncing = false;
    };
    const onBodyScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(syncHeader);
    };
    const onHeaderScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(syncBody);
    };
    body.addEventListener("scroll", onBodyScroll, { passive: true });
    header.addEventListener("scroll", onHeaderScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      body.removeEventListener("scroll", onBodyScroll);
      header.removeEventListener("scroll", onHeaderScroll);
    };
  }, []);

  const title = React.useMemo(() => {
    return (
      formatters?.monthTitle?.(activeDate, { locale: resolvedLocale, timeZone: resolvedTimeZone }) ??
      defaultMonthTitle(activeDate, resolvedLocale, resolvedTimeZone)
    );
  }, [activeDate, formatters, resolvedLocale, resolvedTimeZone]);

  const densityClass = "text-sm";
  const eventHeight = 18;
  const laneGap = 4;
  const lanePaddingY = 6;

  const virt = virtualization?.enabled;
  const overscan = virtualization?.overscan ?? 8;
  const [viewportHeight, setViewportHeight] = React.useState(0);
  const [scrollTop, setScrollTop] = React.useState(0);
  React.useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const update = () => setViewportHeight(el.clientHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  React.useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const onScroll = () => setScrollTop(el.scrollTop);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const totalRows = rows.length;
  const startRow = virt ? clamp(Math.floor(scrollTop / rowHeight) - overscan, 0, totalRows) : 0;
  const endRow = virt ? clamp(Math.ceil((scrollTop + viewportHeight) / rowHeight) + overscan, 0, totalRows) : totalRows;
  const topSpacer = startRow * rowHeight;
  const bottomSpacer = (totalRows - endRow) * rowHeight;

  type DragMode = "move" | "resize-start" | "resize-end" | "create";
  const dragRef = React.useRef<
    | null
    | {
        mode: DragMode;
        eventId?: string;
        resourceId: string;
        originStart: Date;
        originEnd: Date;
        durationMs: number;
        pointerId: number;
        startSlotIdx: number;
        startRowResourceId: string;
      }
  >(null);
  const [preview, setPreview] = React.useState<{ eventId?: string; resourceId: string; start: Date; end: Date } | null>(null);

  const getPointerContext = (clientX: number, clientY: number) => {
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
  };

  const slotToDate = (slotIdx: number) => {
    const start = slotStarts[clamp(slotIdx, 0, slotStarts.length - 1)]!;
    if (activeView === "day") {
      const stepMs = Math.trunc((Math.max(5, Math.min(240, Math.trunc(dayTimeStepMinutes))) * 60_000));
      return { start, end: new Date(start.getTime() + stepMs) };
    }
    return { start, end: addZonedDays(start, 1, resolvedTimeZone) };
  };

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
          "w-full h-full flex items-center gap-2 px-3 text-left",
          "bg-muted/30 border-b border-border/60",
          canToggle ? "cursor-pointer hover:bg-muted/50" : "cursor-default",
        )}
        aria-label={isCollapsed ? l.expandGroup : l.collapseGroup}
      >
        <span className={cn("inline-flex transition-transform", isCollapsed ? "" : "rotate-180")}>
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
        </span>
        <span className="font-semibold">{g.label}</span>
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
            "flex-shrink-0 border-l border-border/60 px-2 py-2",
            s.isToday && "bg-primary/5",
          )}
          style={{ width: slotWidth, minWidth: slotWidth }}
          aria-label={formatters?.ariaSlotLabel?.(s.start, { view: activeView, locale: resolvedLocale, timeZone: resolvedTimeZone })}
        >
          {s.label}
        </div>
      ))}
    </div>
  );

  const Header = (
    <div className="sticky top-0 z-30 bg-background border-b border-border/60">
      <div className="flex items-center justify-between gap-3 px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} aria-label={l.prev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToday}>
            {l.today}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate(1)} aria-label={l.next}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="ml-2 font-semibold truncate">{title}</div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant={activeView === "month" ? "default" : "ghost"} size="sm" onClick={() => setView("month")}>
            {l.month}
          </Button>
          <Button variant={activeView === "week" ? "default" : "ghost"} size="sm" onClick={() => setView("week")}>
            {l.week}
          </Button>
          <Button variant={activeView === "day" ? "default" : "ghost"} size="sm" onClick={() => setView("day")}>
            {l.day}
          </Button>
        </div>
      </div>
      <div className="flex">
        <div
          className="flex-shrink-0 border-r border-border/60 bg-background"
          style={{ width: resourceColumnWidth, minWidth: resourceColumnWidth }}
        />
        <div ref={headerRef} className="overflow-x-auto overflow-y-hidden">
          {slotHeaderNodes}
        </div>
      </div>
    </div>
  );

  const ResourceCell = (r: CalendarTimelineResource<TResourceMeta>) => (
    <div className="h-full w-full flex items-center px-3 border-b border-border/60 bg-background">
      <div className={cn("truncate", r.disabled && "opacity-50")}>{renderResource ? renderResource(r) : r.label}</div>
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
      className={cn("border border-border/60 rounded-2xl overflow-hidden bg-background", densityClass, className)}
      {...rest}
    >
      {Header}
      <div
        ref={bodyRef}
        className="relative overflow-auto"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div style={{ height: topSpacer }} />
        {rows.slice(startRow, endRow).map((row, idx) => {
          const rowIndex = startRow + idx;
          if (row.kind === "group") {
            return (
              <div key={`g_${row.group.id}_${rowIndex}`} className="flex" style={{ height: rowHeight }}>
                <div
                  className="flex-shrink-0 sticky left-0 z-20"
                  style={{ width: resourceColumnWidth, minWidth: resourceColumnWidth }}
                >
                  {renderGroupRow(row.group)}
                </div>
                <div className="flex-1 border-b border-border/60 bg-muted/20" style={{ minWidth: gridWidth }} />
              </div>
            );
          }

          const r = row.resource;
          const layout = layoutsByResource.get(r.id) ?? { visible: [], hidden: [] };
          const canMore = layout.hidden.length > 0 && !!onMoreClick;

          return (
            <div
              key={`r_${r.id}_${rowIndex}`}
              className="flex"
              style={{ height: rowHeight }}
              data-uv-ct-row={r.id}
            >
              <div
                className="flex-shrink-0 sticky left-0 z-20 border-r border-border/60"
                style={{ width: resourceColumnWidth, minWidth: resourceColumnWidth }}
              >
                {ResourceCell(r)}
              </div>
              <div
                className="relative flex-shrink-0"
                style={{ width: gridWidth, minWidth: gridWidth }}
              >
                <div
                  className="absolute inset-0"
                  onPointerDown={onPointerDownCell}
                  data-uv-ct-timeline
                >
                  <div className="absolute inset-0 flex">
                    {slots.map((s, i2) => (
                      <div
                        key={`${r.id}_${i2}`}
                        className={cn("h-full border-l border-border/60", s.isToday && "bg-primary/5")}
                        style={{ width: slotWidth, minWidth: slotWidth }}
                      />
                    ))}
                  </div>
                </div>

                {layout.visible.map(({ ev, left, width, lane }) => {
                  const top = lanePaddingY + lane * (eventHeight + laneGap);
                  const isPreview = preview?.eventId === ev.id;
                  const bg = ev.color ? ev.color : "var(--primary-soft)";
                  const border = ev.color ? ev.color : "var(--primary)";
                  const aria =
                    formatters?.ariaEventLabel?.(ev, { locale: resolvedLocale, timeZone: resolvedTimeZone }) ??
                    (typeof ev.title === "string" ? ev.title : "Event");
                  const timeText =
                    formatters?.eventTime?.({ start: ev._start, end: ev._end, locale: resolvedLocale, timeZone: resolvedTimeZone, view: activeView }) ??
                    defaultEventTime({ start: ev._start, end: ev._end, locale: resolvedLocale, timeZone: resolvedTimeZone, view: activeView });

                  const node =
                    renderEvent?.(ev, { left, width, lane }) ?? (
                      <div className="px-2 py-[2px] truncate text-[11px] leading-tight">
                        {ev.title ? <div className="font-semibold truncate">{ev.title}</div> : null}
                        <div className="text-[10px] opacity-80 truncate">{timeText}</div>
                      </div>
                    );

                  return (
                    <div
                      key={ev.id}
                      className={cn(
                        "absolute rounded-md border shadow-sm select-none",
                        "hover:shadow transition-shadow",
                        ev.className,
                        isPreview && "ring-2 ring-primary/40",
                      )}
                      style={{
                        left,
                        top,
                        width,
                        height: eventHeight,
                        background: bg,
                        borderColor: border,
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
                            className="absolute left-0 top-0 h-full w-2 cursor-ew-resize"
                            onPointerDown={(e) => onPointerDownEvent(e, ev, "resize-start")}
                          />
                          <div
                            className="absolute right-0 top-0 h-full w-2 cursor-ew-resize"
                            onPointerDown={(e) => onPointerDownEvent(e, ev, "resize-end")}
                          />
                        </>
                      ) : null}
                      {node}
                    </div>
                  );
                })}

                {preview && preview.resourceId === r.id && !preview.eventId ? (
                  (() => {
                    const startIdx = binarySearchLastLE(slotStarts, preview.start);
                    const endIdx = clamp(binarySearchFirstGE(slotStarts, preview.end), startIdx + 1, slots.length);
                    const left = startIdx * slotWidth;
                    const width = Math.max(1, (endIdx - startIdx) * slotWidth);
                    return (
                      <div
                        className="absolute rounded-md border border-primary/60 bg-primary/20"
                        style={{ left, top: lanePaddingY, width, height: eventHeight }}
                      />
                    );
                  })()
                ) : null}

                {canMore ? (
                  <button
                    type="button"
                    className="absolute right-2 bottom-1 text-[11px] text-primary hover:underline"
                    onClick={() => onMoreClick?.({ resourceId: r.id, hiddenEvents: layout.hidden })}
                  >
                    {l.more(layout.hidden.length)}
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
