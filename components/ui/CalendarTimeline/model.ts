import type { CalendarTimelineDayRangeMode, CalendarTimelineEvent, CalendarTimelineGroup, CalendarTimelineResource, CalendarTimelineView } from "./types";
import {
  addZonedDays,
  addZonedMonths,
  startOfZonedDay,
  startOfZonedMonth,
  startOfZonedWeek,
  startOfZonedYear,
  toDate,
  zonedDateAtTime,
} from "./date";
import { clamp } from "./layout";

export type CalendarTimelineRow<TResourceMeta = unknown> =
  | { kind: "group"; group: CalendarTimelineGroup }
  | { kind: "resource"; resource: CalendarTimelineResource<TResourceMeta> };

export function buildRows<TResourceMeta>(args: {
  resources: CalendarTimelineResource<TResourceMeta>[];
  groups?: CalendarTimelineGroup[];
  collapsed: Record<string, boolean>;
}): CalendarTimelineRow<TResourceMeta>[] {
  const { resources, groups, collapsed } = args;

  if (!groups || groups.length === 0) return resources.map((resource) => ({ kind: "resource" as const, resource }));

  const byGroup = new Map<string, CalendarTimelineResource<TResourceMeta>[]>();
  for (const r of resources) {
    const gid = r.groupId ?? "__ungrouped__";
    if (!byGroup.has(gid)) byGroup.set(gid, []);
    byGroup.get(gid)!.push(r);
  }

  const out: CalendarTimelineRow<TResourceMeta>[] = [];
  const seen = new Set<string>();

  for (const g of groups) {
    out.push({ kind: "group", group: g });
    seen.add(g.id);
    if (collapsed[g.id]) continue;
    for (const r of byGroup.get(g.id) ?? []) out.push({ kind: "resource", resource: r });
  }

  // Unknown groups that appear in resources but not in `groups`.
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
}

export function getGroupResourceCounts<TResourceMeta>(resources: CalendarTimelineResource<TResourceMeta>[]) {
  const counts = new Map<string, number>();
  for (const r of resources) {
    if (!r.groupId) continue;
    counts.set(r.groupId, (counts.get(r.groupId) ?? 0) + 1);
  }
  return counts;
}

export function computeSlotStarts(args: {
  view: CalendarTimelineView;
  date: Date;
  timeZone: string;
  weekStartsOn: number;
  dayTimeStepMinutes: number;
  dayRangeMode?: CalendarTimelineDayRangeMode;
  workHours?: { startHour: number; endHour: number };
}) {
  const { view, date, timeZone, weekStartsOn, dayTimeStepMinutes, dayRangeMode, workHours } = args;

  const baseDayStart = startOfZonedDay(date, timeZone);
  const start =
    view === "month"
      ? startOfZonedMonth(date, timeZone)
      : view === "week"
        ? startOfZonedWeek(date, weekStartsOn, timeZone)
        : view === "sprint"
          ? (() => {
              const yearStart = startOfZonedYear(date, timeZone);
              return startOfZonedWeek(yearStart, weekStartsOn, timeZone);
            })()
          : baseDayStart;

  if (view === "day") {
    const step = Math.max(5, Math.min(240, Math.trunc(dayTimeStepMinutes)));
    const stepMs = step * 60_000;
    const hours = workHours ?? { startHour: 8, endHour: 17 };
    const boundedStartHour = clamp(Math.trunc(hours.startHour), 0, 23);
    const boundedEndHour = clamp(Math.trunc(hours.endHour), 1, 24);
    const isWork = dayRangeMode === "work";
    const start2 = isWork ? zonedDateAtTime(baseDayStart, timeZone, { hour: boundedStartHour }) : start;
    const end2 = isWork
      ? boundedEndHour === 24
        ? addZonedDays(baseDayStart, 1, timeZone)
        : zonedDateAtTime(baseDayStart, timeZone, { hour: clamp(boundedEndHour, 0, 23) })
      : addZonedDays(start, 1, timeZone);
    const end = end2.getTime() > start2.getTime() ? end2 : addZonedDays(start2, 1, timeZone);
    const slotStarts: Date[] = [];
    for (let cur = start2.getTime(), guard = 0; cur < end.getTime() && guard++ < 2000; cur += stepMs) {
      slotStarts.push(new Date(cur));
    }
    return { start: start2, end, slotStarts };
  }

  if (view === "sprint") {
    const yearStart = startOfZonedYear(date, timeZone);
    const nextYearStart = startOfZonedYear(addZonedMonths(yearStart, 12, timeZone), timeZone);
    const lastDayOfYear = addZonedDays(nextYearStart, -1, timeZone);
    const lastSlotStart = startOfZonedWeek(lastDayOfYear, weekStartsOn, timeZone);
    const end = addZonedDays(lastSlotStart, 7, timeZone);
    const slotStarts: Date[] = [];
    let cur = start;
    let guard = 0;
    while (cur.getTime() < end.getTime() && guard++ < 60) {
      slotStarts.push(cur);
      cur = addZonedDays(cur, 7, timeZone);
    }
    return { start, end, slotStarts };
  }

  const end = view === "month" ? startOfZonedMonth(addZonedMonths(start, 1, timeZone), timeZone) : addZonedDays(start, 7, timeZone);
  const slotStarts: Date[] = [];
  let cur = start;
  let guard = 0;
  while (cur.getTime() < end.getTime() && guard++ < 60) {
    slotStarts.push(cur);
    cur = addZonedDays(cur, 1, timeZone);
  }
  return { start, end, slotStarts };
}

export type NormalizedEvent<TEventMeta = unknown> = CalendarTimelineEvent<TEventMeta> & { _start: Date; _end: Date };

export function normalizeEvents<TEventMeta>(args: {
  events: CalendarTimelineEvent<TEventMeta>[];
  range: { start: Date; end: Date };
  view: CalendarTimelineView;
  timeZone: string;
}): NormalizedEvent<TEventMeta>[] {
  const { events, range, view, timeZone } = args;
  const rangeStart = range.start.getTime();
  const rangeEnd = range.end.getTime();

  return events
    .map((e) => {
      const start = toDate(e.start);
      const end = toDate(e.end);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;

      const ns = view === "day" ? start : startOfZonedDay(start, timeZone);
      let ne = view === "day" ? end : startOfZonedDay(end, timeZone);

      // Ensure end is always after start (end is exclusive in input).
      if (ne.getTime() <= ns.getTime()) ne = view === "day" ? new Date(ns.getTime() + 60_000) : addZonedDays(ns, 1, timeZone);

      const cs = new Date(clamp(ns.getTime(), rangeStart, rangeEnd));
      const ce = new Date(clamp(ne.getTime(), rangeStart, rangeEnd));
      if (ce.getTime() <= rangeStart || cs.getTime() >= rangeEnd) return null;

      return { ...e, _start: cs, _end: ce };
    })
    .filter(Boolean) as NormalizedEvent<TEventMeta>[];
}

export function eventsByResourceId<TEventMeta>(events: NormalizedEvent<TEventMeta>[]) {
  const map = new Map<string, NormalizedEvent<TEventMeta>[]>();
  for (const e of events) {
    if (!map.has(e.resourceId)) map.set(e.resourceId, []);
    map.get(e.resourceId)!.push(e);
  }
  return map;
}

export function resourcesById<TResourceMeta>(resources: CalendarTimelineResource<TResourceMeta>[]) {
  const map = new Map<string, CalendarTimelineResource<TResourceMeta>>();
  for (const r of resources) map.set(r.id, r);
  return map;
}
