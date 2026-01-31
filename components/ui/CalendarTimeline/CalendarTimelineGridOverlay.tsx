"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import type { CalendarTimelineView } from "./types";

export const CalendarTimelineGridOverlay = React.memo(function CalendarTimelineGridOverlay(props: {
  gridWidth: number;
  height: number;
  slotLefts: number[];
  slotWidths: number[];
  activeView: CalendarTimelineView;
  todaySlotIdx: number;
  dayAnchor?: boolean[] | null;
  weekendSlotIdxs?: number[];
  visibleStartIdx?: number;
  visibleEndIdx?: number;
  className?: string;
}) {
  const { gridWidth, height, slotLefts, slotWidths, activeView, todaySlotIdx, dayAnchor, weekendSlotIdxs, visibleStartIdx, visibleEndIdx, className } =
    props;
  const startIdx = Math.max(0, visibleStartIdx ?? 0);
  const endIdx = Math.min(slotWidths.length, visibleEndIdx ?? slotWidths.length);

  // In day view, we intentionally avoid the "today" column highlight because the entire view is a single day.
  const showToday = activeView !== "day" && todaySlotIdx >= 0 && todaySlotIdx < slotWidths.length;
  const todayLeft = showToday ? (slotLefts[todaySlotIdx] ?? 0) : 0;
  const todayWidth = showToday ? (slotWidths[todaySlotIdx] ?? 0) : 0;

  return (
    <div className={cn("pointer-events-none absolute left-0 top-0", className)} style={{ width: gridWidth, height }}>
      {/* Weekend backgrounds (month/week views). */}
      {activeView !== "day" && weekendSlotIdxs?.length
        ? weekendSlotIdxs.map((idx) => {
            if (idx < startIdx || idx >= endIdx) return null;
            if (showToday && idx === todaySlotIdx) return null;
            const left = slotLefts[idx] ?? 0;
            const width = slotWidths[idx] ?? 0;
            return <div key={`we_${idx}`} className="absolute top-0 h-full bg-muted/10" style={{ left, width }} aria-hidden />;
          })
        : null}

      {showToday ? (
        <div
          className="absolute top-0 h-full bg-primary/5"
          style={{
            left: todayLeft,
            width: todayWidth,
          }}
          aria-hidden
        />
      ) : null}

      {/* Vertical slot dividers */}
      {slotLefts.slice(startIdx, endIdx).map((left, j) => {
        const i = startIdx + j;
        const isAnchor = dayAnchor ? Boolean(dayAnchor[i]) : true;
        const opacityClass = activeView === "day" && dayAnchor ? (isAnchor ? "bg-border/35" : "bg-border/15") : "bg-border/30";
        return <div key={i} className={cn("absolute top-0 h-full w-px", opacityClass)} style={{ left }} aria-hidden />;
      })}
    </div>
  );
});
