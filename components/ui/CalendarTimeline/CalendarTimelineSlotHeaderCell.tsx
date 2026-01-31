"use client";

import * as React from "react";
import { Dot } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { CalendarTimelineView } from "./types";

export const CalendarTimelineSlotHeaderCell = React.memo(function CalendarTimelineSlotHeaderCell(props: {
  slotKey: string;
  width: number;
  activeView: CalendarTimelineView;
  isToday: boolean;
  label: React.ReactNode;
  ariaLabel?: string;
  borderClassName: string;
  dayHeaderMarks?: { showTime: boolean[]; showEllipsis: boolean[] } | null;
  idx: number;
  className?: string;
}) {
  const { width, activeView, isToday, label, ariaLabel, borderClassName, dayHeaderMarks, idx, className } = props;

  const content = React.useMemo(() => {
    if (activeView === "day" && dayHeaderMarks) {
      if (dayHeaderMarks.showEllipsis[idx]) return <span className="text-xs text-muted-foreground/70 select-none">…</span>;
      if (!dayHeaderMarks.showTime[idx]) return null;
    }

    const normalizedLabel =
      typeof label === "string" || typeof label === "number" ? <span className="truncate whitespace-nowrap">{label}</span> : label;

    return (
      <div className={cn("flex flex-col items-center min-w-0 overflow-hidden", activeView !== "day" && isToday && "relative")}>
        {activeView !== "day" && isToday ? <Dot className="absolute -top-2.5 h-4 w-4 text-primary animate-pulse" /> : null}
        {normalizedLabel}
      </div>
    );
  }, [activeView, dayHeaderMarks, idx, isToday, label]);

  return (
    <div
      className={cn("shrink-0 border-l flex items-center justify-center transition-colors duration-150 overflow-hidden", borderClassName, className)}
      style={{ width, minWidth: width }}
      aria-label={ariaLabel}
    >
      {content}
    </div>
  );
});

