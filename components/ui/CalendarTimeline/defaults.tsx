import * as React from "react";
import type { CalendarTimelineView } from "./types";
import { getDtf, getIsoWeekInfo } from "./date";

export function defaultMonthTitle(date: Date, locale: string, timeZone: string) {
  return getDtf(locale, timeZone, { month: "long", year: "numeric" }).format(date);
}

export function defaultSlotHeader(slotStart: Date, view: CalendarTimelineView, locale: string, timeZone: string) {
  if (view === "day") {
    return getDtf(locale, timeZone, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(slotStart);
  }
  if (view === "sprint") {
    const { week } = getIsoWeekInfo(slotStart, timeZone);
    return (
      <span className="inline-flex flex-col items-center leading-tight">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">S</span>
        <span className="text-sm font-semibold text-foreground">{String(week).padStart(2, "0")}</span>
      </span>
    );
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

export function defaultEventTime(args: { start: Date; end: Date; locale: string; timeZone: string; view: CalendarTimelineView }) {
  const fmt = getDtf(args.locale, args.timeZone, { hour: "2-digit", minute: "2-digit" });
  if (args.view === "day") return `${fmt.format(args.start)} - ${fmt.format(args.end)}`;
  const df = getDtf(args.locale, args.timeZone, { month: "short", day: "numeric" });
  const inclusiveEnd = new Date(args.end.getTime() - 1);
  const a = df.format(args.start);
  const b = df.format(inclusiveEnd);
  return a === b ? a : `${a} - ${b}`;
}
