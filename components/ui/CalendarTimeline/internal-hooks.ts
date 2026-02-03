"use client";

import * as React from "react";
import type {
  CalendarTimelineAdaptiveSlotWidths,
  CalendarTimelineDayRangeMode,
  CalendarTimelineEvent,
  CalendarTimelineFormatters,
  CalendarTimelineResource,
  CalendarTimelineView,
} from "./types";
import { addZonedDays, getZonedWeekday, startOfZonedDay as startOfZonedDayTz } from "./date";
import { binarySearchFirstGE, binarySearchLastLE, clamp, intervalPack } from "./layout";
import { computeSlotStarts, eventsByResourceId, normalizeEvents, resourcesById, type NormalizedEvent } from "./model";
import { defaultSlotHeader } from "./defaults";

type Slot = { start: Date; label: React.ReactNode; isToday: boolean; isWeekend: boolean };

export function useTimelineSlots(args: {
  activeView: CalendarTimelineView;
  activeDate: Date;
  resolvedTimeZone: string;
  resolvedLocale: string;
  weekStartsOn: number;
  dayTimeStepMinutes: number;
  dayRangeMode?: CalendarTimelineDayRangeMode;
  workHours?: { startHour: number; endHour: number };
  resolvedNow: Date;
  formatters?: Pick<CalendarTimelineFormatters, "slotHeader">;
}) {
  const {
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
  } = args;

  const { slots, range } = React.useMemo((): { slots: Slot[]; range: { start: Date; end: Date } } => {
    const { start, end, slotStarts } = computeSlotStarts({
      view: activeView,
      date: activeDate,
      timeZone: resolvedTimeZone,
      weekStartsOn,
      dayTimeStepMinutes,
      dayRangeMode,
      workHours,
    });

    const todayStart = startOfZonedDayTz(resolvedNow, resolvedTimeZone).getTime();
    const nowMs = resolvedNow.getTime();
    const slotItems: Slot[] = slotStarts.map((s) => ({
      start: s,
      label:
        formatters?.slotHeader?.(s, { view: activeView, locale: resolvedLocale, timeZone: resolvedTimeZone }) ??
        defaultSlotHeader(s, activeView, resolvedLocale, resolvedTimeZone),
      isToday:
        activeView === "sprint"
          ? nowMs >= s.getTime() && nowMs < addZonedDays(s, 7, resolvedTimeZone).getTime()
          : startOfZonedDayTz(s, resolvedTimeZone).getTime() === todayStart,
      isWeekend: activeView === "day" || activeView === "sprint" ? false : (() => {
        const wd = getZonedWeekday(s, resolvedTimeZone);
        return wd === 0 || wd === 6;
      })(),
    }));

    return { slots: slotItems, range: { start, end } };
  }, [activeView, activeDate, dayRangeMode, dayTimeStepMinutes, formatters, resolvedLocale, resolvedNow, resolvedTimeZone, weekStartsOn, workHours]);

  const slotStarts = React.useMemo(() => slots.map((s) => s.start), [slots]);
  const todaySlotIdx = React.useMemo(() => slots.findIndex((s) => s.isToday), [slots]);
  const weekendSlotIdxs = React.useMemo(() => {
    const out: number[] = [];
    for (let i = 0; i < slots.length; i++) if (slots[i]?.isWeekend) out.push(i);
    return out;
  }, [slots]);

  return { slots, range, slotStarts, todaySlotIdx, weekendSlotIdxs };
}

export function useNormalizedEvents<TResourceMeta, TEventMeta>(args: {
  events: CalendarTimelineEvent<TEventMeta>[];
  range: { start: Date; end: Date };
  activeView: CalendarTimelineView;
  resolvedTimeZone: string;
  resources: Array<CalendarTimelineResource<TResourceMeta>>;
}) {
  const { events, range, activeView, resolvedTimeZone, resources } = args;

  const normalizedEvents = React.useMemo(() => {
    return normalizeEvents({ events: events as CalendarTimelineEvent<TEventMeta>[], range, view: activeView, timeZone: resolvedTimeZone });
  }, [activeView, events, range, resolvedTimeZone]);

  const eventsByResource = React.useMemo(() => eventsByResourceId(normalizedEvents), [normalizedEvents]);
  const resourceById = React.useMemo(() => resourcesById(resources), [resources]);

  return { normalizedEvents, eventsByResource, resourceById };
}

export function useDayHeaderMarks(args: {
  enabled: boolean;
  activeView: CalendarTimelineView;
  normalizedEvents: Array<NormalizedEvent<any>>;
  slotStarts: Date[];
  slotCount: number;
}) {
  const { enabled, activeView, normalizedEvents, slotStarts, slotCount } = args;

  return React.useMemo(() => {
    if (!enabled) return null;
    if (activeView !== "day") return null;
    const n = slotCount;
    const showTime = new Array<boolean>(n).fill(false);
    const showEllipsis = new Array<boolean>(n).fill(false);

    for (const ev of normalizedEvents) {
      const startIdx = binarySearchLastLE(slotStarts, ev._start);
      const endIdxRaw = binarySearchFirstGE(slotStarts, ev._end);
      const endIdx = clamp(endIdxRaw, 0, n - 1);

      if (startIdx >= 0 && startIdx < n) showTime[startIdx] = true;
      if (endIdx >= 0 && endIdx < n) showTime[endIdx] = true;

      const span = endIdx - startIdx;
      if (span >= 3) {
        const mid = clamp(Math.floor((startIdx + endIdx) / 2), 0, n - 1);
        if (!showTime[mid]) showEllipsis[mid] = true;
      }
    }

    const anchor = showTime.map((v, i) => v || showEllipsis[i]!);
    return { showTime, showEllipsis, anchor };
  }, [activeView, enabled, normalizedEvents, slotCount, slotStarts]);
}

export function useSlotMetrics(args: {
  activeView: CalendarTimelineView;
  slotsLength: number;
  slotStarts: Date[];
  normalizedEvents: Array<NormalizedEvent<any>>;
  effectiveSlotMinWidth: number;
  bodyClientWidth: number;
  adaptiveSlotWidths: CalendarTimelineAdaptiveSlotWidths | undefined;
  dayHeaderMarks: { anchor: boolean[] } | null;
  dayHeaderSmart: boolean;
  daySlotCompression: boolean;
}) {
  const {
    activeView,
    slotsLength,
    slotStarts,
    normalizedEvents,
    effectiveSlotMinWidth,
    bodyClientWidth,
    adaptiveSlotWidths,
    dayHeaderMarks,
    dayHeaderSmart,
    daySlotCompression,
  } = args;

  const fixedSlotWidth = React.useMemo(() => {
    const baseSlotWidth = activeView === "month" || activeView === "day" ? effectiveSlotMinWidth * 3 : effectiveSlotMinWidth;
    if (activeView !== "week") return baseSlotWidth;
    if (bodyClientWidth <= 0) return baseSlotWidth;
    if (slotsLength <= 0) return baseSlotWidth;
    return Math.max(baseSlotWidth, bodyClientWidth / slotsLength);
  }, [activeView, bodyClientWidth, effectiveSlotMinWidth, slotsLength]);

  const slotMetrics = React.useMemo(() => {
    const n = slotsLength;
    const widths = new Array<number>(n).fill(fixedSlotWidth);

    const isAdaptiveView = activeView === "month" || activeView === "day";
    const adaptiveCfg = adaptiveSlotWidths;
    const adaptiveEnabled = Boolean(adaptiveCfg) && isAdaptiveView;

    if (!adaptiveEnabled || n === 0) {
      const lefts = new Array<number>(n + 1);
      lefts[0] = 0;
      for (let i = 0; i < n; i++) lefts[i + 1] = lefts[i]! + widths[i]!;
      const gridWidth = lefts[n] ?? 0;
      const xToSlotIdx = (x: number) => clamp(Math.floor(x / Math.max(1, fixedSlotWidth)), 0, Math.max(0, n - 1));
      return { slotWidths: widths, slotLefts: lefts, slotHasEvent: null as boolean[] | null, gridWidth, xToSlotIdx };
    }

    const cfg = typeof adaptiveCfg === "object" ? adaptiveCfg : {};
    const mode = cfg.mode ?? "shrink";
    const fillContainer = activeView === "day" && cfg.fillContainer === true && bodyClientWidth > 0;
    const fillDistribute = cfg.fillDistribute ?? "event";
    const defaultEmptySlotWidth = Math.max(18, Math.round(effectiveSlotMinWidth * 0.6));
    const minEmptySlotWidth =
      activeView === "month"
        ? Math.max(24, Math.round(effectiveSlotMinWidth * 0.45))
        : activeView === "day"
          ? dayHeaderSmart
            ? 12
            : 44
          : 12;
    const emptySlotWidth = Math.max(minEmptySlotWidth, Math.min(fixedSlotWidth, cfg.emptySlotWidth ?? defaultEmptySlotWidth));

    const dayAnchorCompression = daySlotCompression && activeView === "day" && Boolean(dayHeaderMarks?.anchor);

    const maybeFillToContainer = (mask: boolean[] | null) => {
      if (!fillContainer) return;
      const total = widths.reduce((acc, w) => acc + w, 0);
      if (total <= 0 || total >= bodyClientWidth) return;
      const extra = bodyClientWidth - total;
      const recipients =
        fillDistribute === "all"
          ? widths.map((w) => w > 0)
          : mask
            ? mask
            : widths.map((w) => w > 0);
      const count = recipients.reduce((acc, v) => acc + (v ? 1 : 0), 0);
      if (count <= 0) return;
      const add = extra / count;
      for (let i = 0; i < widths.length; i++) {
        if (recipients[i]) widths[i] = (widths[i] ?? 0) + add;
      }
    };

    // Day view special: compress long spans by keeping only anchor columns (start, …, end) wide.
    if (dayAnchorCompression) {
      const hasEvent = (dayHeaderMarks!.anchor as boolean[]).slice(0, n);
      const compressedEmptySlotWidth = clamp(emptySlotWidth, 12, 20);
      for (let i = 0; i < n; i++) widths[i] = hasEvent[i] ? fixedSlotWidth : compressedEmptySlotWidth;

      maybeFillToContainer(hasEvent);

      const lefts = new Array<number>(n + 1);
      lefts[0] = 0;
      for (let i = 0; i < n; i++) lefts[i + 1] = lefts[i]! + widths[i]!;
      const gridWidth = lefts[n] ?? 0;

      const xToSlotIdx = (x: number) => {
        const xc = clamp(x, 0, Math.max(0, gridWidth - 0.001));
        let lo = 0;
        let hi = n - 1;
        while (lo <= hi) {
          const mid = (lo + hi) >> 1;
          const left = lefts[mid] ?? 0;
          const right = lefts[mid + 1] ?? gridWidth;
          if (xc < left) hi = mid - 1;
          else if (xc >= right) lo = mid + 1;
          else return mid;
        }
        return clamp(lo, 0, Math.max(0, n - 1));
      };

      return { slotWidths: widths, slotLefts: lefts, slotHasEvent: hasEvent, gridWidth, xToSlotIdx };
    }

    // Mark which slots are covered by at least one event (any resource).
    const diff = new Array<number>(n + 1).fill(0);
    for (const ev of normalizedEvents) {
      const startIdx = binarySearchLastLE(slotStarts, ev._start);
      const endIdx = clamp(binarySearchFirstGE(slotStarts, ev._end), startIdx + 1, n);
      diff[startIdx] = (diff[startIdx] ?? 0) + 1;
      diff[endIdx] = (diff[endIdx] ?? 0) - 1;
    }

    const hasEvent = new Array<boolean>(n);
    let running = 0;
    let eventCount = 0;
    for (let i = 0; i < n; i++) {
      running += diff[i] ?? 0;
      const covered = running > 0;
      hasEvent[i] = covered;
      if (covered) eventCount++;
    }

    // If everything is covered (or nothing is), keep the fixed layout.
    if (eventCount === 0 || eventCount === n) {
      const lefts = new Array<number>(n + 1);
      lefts[0] = 0;
      for (let i = 0; i < n; i++) lefts[i + 1] = lefts[i]! + widths[i]!;
      const gridWidth = lefts[n] ?? 0;
      const xToSlotIdx = (x: number) => clamp(Math.floor(x / Math.max(1, fixedSlotWidth)), 0, Math.max(0, n - 1));
      return { slotWidths: widths, slotLefts: lefts, slotHasEvent: null as boolean[] | null, gridWidth, xToSlotIdx };
    }

    const emptyCount = n - eventCount;
    let eventSlotWidth = fixedSlotWidth;

    if (mode === "redistribute") {
      const targetTotal = n * fixedSlotWidth;
      const remaining = Math.max(0, targetTotal - emptyCount * emptySlotWidth);
      const raw = remaining / Math.max(1, eventCount);
      const maxEventSlotWidth = cfg.maxEventSlotWidth ?? fixedSlotWidth * 2.5;
      eventSlotWidth = clamp(raw, fixedSlotWidth, Math.max(fixedSlotWidth, maxEventSlotWidth));
    }

    for (let i = 0; i < n; i++) widths[i] = hasEvent[i] ? eventSlotWidth : emptySlotWidth;

    maybeFillToContainer(hasEvent);

    const lefts = new Array<number>(n + 1);
    lefts[0] = 0;
    for (let i = 0; i < n; i++) lefts[i + 1] = lefts[i]! + widths[i]!;
    const gridWidth = lefts[n] ?? 0;

    const xToSlotIdx = (x: number) => {
      const xc = clamp(x, 0, Math.max(0, gridWidth - 0.001));
      let lo = 0;
      let hi = n - 1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const left = lefts[mid] ?? 0;
        const right = lefts[mid + 1] ?? gridWidth;
        if (xc < left) hi = mid - 1;
        else if (xc >= right) lo = mid + 1;
        else return mid;
      }
      return clamp(lo, 0, Math.max(0, n - 1));
    };

    return { slotWidths: widths, slotLefts: lefts, slotHasEvent: hasEvent, gridWidth, xToSlotIdx };
  }, [
    activeView,
    adaptiveSlotWidths,
    dayHeaderMarks,
    dayHeaderSmart,
    daySlotCompression,
    effectiveSlotMinWidth,
    fixedSlotWidth,
    normalizedEvents,
    slotStarts,
    slotsLength,
  ]);

  return { fixedSlotWidth, ...slotMetrics };
}

export function useLayoutsByResource<TEventMeta>(args: {
  eventsByResource: Map<string, NormalizedEvent<TEventMeta>[]>;
  preview: { eventId?: string; resourceId: string; start: Date; end: Date } | null;
  slotStarts: Date[];
  slotsLength: number;
  slotLefts: number[];
  getResourceRowHeight: (resourceId: string) => number;
  laneGap: number;
  lanePaddingY: number;
  effectiveMaxLanesPerRow: number;
  eventHeight: number;
}) {
  const { eventsByResource, preview, slotStarts, slotsLength, slotLefts, getResourceRowHeight, laneGap, lanePaddingY, effectiveMaxLanesPerRow, eventHeight } = args;

  return React.useMemo(() => {
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
        const s = isPreview ? preview!.start : (ev as any)._start;
        const e = isPreview ? preview!.end : (ev as any)._end;
        const startIdx = binarySearchLastLE(slotStarts, s);
        const endIdx = clamp(binarySearchFirstGE(slotStarts, e), startIdx + 1, slotsLength);
        return { ev: { ...(ev as any), _start: s, _end: e }, startIdx, endIdx };
      });

      const { packed, laneCount } = intervalPack(mapped);
      const visible = packed.filter((p) => p.lane < effectiveMaxLanesPerRow);
      const hidden = packed.filter((p) => p.lane >= effectiveMaxLanesPerRow);

      const rowHeightPx = getResourceRowHeight(resourceId);
      const visibleLaneCount = Math.max(1, Math.min(laneCount, effectiveMaxLanesPerRow));
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
          left: slotLefts[p.startIdx] ?? 0,
          width: Math.max(1, (slotLefts[p.endIdx] ?? 0) - (slotLefts[p.startIdx] ?? 0)),
        })),
        hidden: hidden.map((h) => h.ev),
      });
    }

    return map;
  }, [effectiveMaxLanesPerRow, eventHeight, eventsByResource, getResourceRowHeight, laneGap, lanePaddingY, preview, slotLefts, slotStarts, slotsLength]);
}

function lowerBound(arr: number[], target: number) {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if ((arr[mid] ?? 0) < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

export function useVisibleSlotRange(args: {
  enabled: boolean;
  overscan: number;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  slotLefts: number[];
  slotCount: number;
}) {
  const { enabled, overscan, scrollRef, slotLefts, slotCount } = args;
  const [scrollLeft, setScrollLeft] = React.useState(0);
  const [viewportWidth, setViewportWidth] = React.useState(0);

  React.useEffect(() => {
    if (!enabled) return;
    const el = scrollRef.current;
    if (!el) return;

    const updateWidth = () => setViewportWidth(el.clientWidth);
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(el);

    const onScroll = () => setScrollLeft(el.scrollLeft);
    el.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", onScroll);
    };
  }, [enabled, scrollRef]);

  return React.useMemo(() => {
    if (!enabled) return { startIdx: 0, endIdx: slotCount };
    if (slotCount <= 0) return { startIdx: 0, endIdx: 0 };
    if (viewportWidth <= 0) return { startIdx: 0, endIdx: slotCount };

    const startPos = Math.max(0, scrollLeft);
    const endPos = Math.max(0, scrollLeft + viewportWidth);

    let startIdx = Math.max(0, lowerBound(slotLefts, startPos) - 1);
    let endIdx = Math.min(slotCount, lowerBound(slotLefts, endPos) + 1);

    startIdx = clamp(startIdx - overscan, 0, slotCount);
    endIdx = clamp(endIdx + overscan, 0, slotCount);

    if (endIdx <= startIdx) endIdx = Math.min(slotCount, startIdx + 1);
    return { startIdx, endIdx };
  }, [enabled, overscan, scrollLeft, slotCount, slotLefts, viewportWidth]);
}
