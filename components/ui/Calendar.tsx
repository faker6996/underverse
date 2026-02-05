"use client";

import { cn } from "@/lib/utils/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";
import * as React from "react";
import { Sheet } from "./Sheet";

type SelectMode = "single" | "multiple" | "range";
type Variant = "default" | "bordered" | "card" | "minimal";
type DisplayMode = "month" | "week" | "year";
type CellMode = "compact" | "events";

export interface CalendarEvent {
  date: Date | string;
  id?: string | number;
  title?: string;
  color?: string; // dot color
  badge?: string; // badge text
}

type CalendarSelectedEventRef = {
  dayKey: string;
  eventId?: string | number;
  index?: number;
};

export interface CalendarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "value" | "onSelect"> {
  month?: Date; // visible month
  defaultMonth?: Date;
  onMonthChange?: (next: Date) => void;
  value?: Date | Date[] | { start?: Date; end?: Date };
  defaultValue?: Date | Date[] | { start?: Date; end?: Date };
  onSelect?: (value: Date | Date[] | { start?: Date; end?: Date }) => void;
  selectMode?: SelectMode;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sun
  showWeekdays?: boolean;
  showHeader?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: Variant;
  events?: CalendarEvent[];
  renderDay?: (args: { date: Date; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean; events: CalendarEvent[] }) => React.ReactNode;
  labels?: { weekdays?: string[]; month?: (date: Date) => string; prev?: string; next?: string; today?: string; clear?: string };
  /** Display mode: month grid, single week, or year */
  display?: DisplayMode;
  /** Number of months to render side-by-side (month mode only) */
  months?: number;
  /** Show "Today" button */
  showToday?: boolean;
  /** Show "Clear" button */
  showClear?: boolean;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Disabled dates */
  disabledDates?: Date[] | ((date: Date) => boolean);
  /** Dense mode with less padding */
  dense?: boolean;
  /** Animate transitions */
  animate?: boolean;
  /** Show event badges */
  showEventBadges?: boolean;
  /** Highlight weekends */
  highlightWeekends?: boolean;
  /** Render mode for each day cell (compact dots vs large cell with event list) */
  cellMode?: CellMode;
  /** Max events shown per day (events cell mode) */
  maxEventsPerDay?: number;
  /** Fired when clicking an event in a day cell (events cell mode) */
  onEventClick?: (event: CalendarEvent, date: Date) => void;
  /** Customize event rendering (events cell mode) */
  renderEvent?: (args: { event: CalendarEvent; date: Date }) => React.ReactNode;
  /** Open a right-side Sheet when clicking an event */
  enableEventSheet?: boolean;
  /** Sheet size (right side) */
  eventSheetSize?: "sm" | "md" | "lg" | "xl" | "full";
  /** Custom sheet content renderer */
  renderEventSheet?: (args: { event: CalendarEvent; date: Date; close: () => void }) => React.ReactNode;
  /** Controlled selected event id (recommended to provide `event.id`) */
  selectedEventId?: string | number;
  /** Controlled open state for the event sheet */
  eventSheetOpen?: boolean;
  /** Controlled open state handler */
  onEventSheetOpenChange?: (open: boolean) => void;
  /** Controlled selected event handler */
  onSelectedEventIdChange?: (id: string | number | undefined) => void;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}
function addMonths(d: Date, n: number) {
  const nd = new Date(d);
  nd.setMonth(d.getMonth() + n);
  return nd;
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function toDate(x: Date | string) {
  return x instanceof Date ? x : new Date(x);
}
function addDays(d: Date, n: number) {
  const nd = new Date(d);
  nd.setDate(d.getDate() + n);
  return nd;
}
function startOfWeek(d: Date, weekStartsOn: number) {
  const day = d.getDay();
  const diff = (day - weekStartsOn + 7) % 7;
  const s = new Date(d);
  s.setDate(d.getDate() - diff);
  return new Date(s.getFullYear(), s.getMonth(), s.getDate());
}

function getMonthGrid(view: Date, weekStartsOn: number) {
  const start = startOfMonth(view);
  const end = endOfMonth(view);
  const startDay = (start.getDay() - weekStartsOn + 7) % 7; // 0..6 offset
  const days: Date[] = [];
  // Fill leading days from previous month
  for (let i = 0; i < startDay; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() - (startDay - i));
    days.push(d);
  }
  // Current month
  for (let d = 1; d <= end.getDate(); d++) {
    days.push(new Date(view.getFullYear(), view.getMonth(), d));
  }
  // Trailing days to complete weeks (6 rows max)
  while (days.length % 7 !== 0) {
    const last = days[days.length - 1];
    const next = new Date(last);
    next.setDate(last.getDate() + 1);
    days.push(next);
  }
  return days;
}

export default function Calendar({
  month,
  defaultMonth,
  onMonthChange,
  value,
  defaultValue,
  onSelect,
  selectMode = "single",
  weekStartsOn = 0,
  showWeekdays = true,
  showHeader = true,
  size = "md",
  variant = "default",
  events = [],
  renderDay,
  labels,
  className,
  display = "month",
  months = 1,
  showToday = false,
  showClear = false,
  minDate,
  maxDate,
  disabledDates,
  dense = false,
  animate = false,
  showEventBadges = false,
  highlightWeekends = false,
  cellMode = "compact",
  maxEventsPerDay = 3,
  onEventClick,
  renderEvent,
  enableEventSheet,
  eventSheetSize = "md",
  renderEventSheet,
  selectedEventId,
  eventSheetOpen,
  onEventSheetOpenChange,
  onSelectedEventIdChange,
  ...rest
}: CalendarProps) {
  const isControlledMonth = month != null;
  const [view, setView] = React.useState<Date>(() => month ?? defaultMonth ?? new Date());
  React.useEffect(() => {
    if (isControlledMonth && month) setView(month);
  }, [isControlledMonth, month]);

  const isControlledValue = value !== undefined;
  const [internal, setInternal] = React.useState<CalendarProps["value"] | undefined>(defaultValue);
  const selected = isControlledValue ? value : internal;

  const goByView = (delta: number) => {
    const next = display === "week" ? addDays(view, delta * 7) : addMonths(view, delta);
    if (!isControlledMonth) setView(next);
    if (display === "month") onMonthChange?.(next);
  };

  const weekNames = labels?.weekdays ?? ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  const rotate = (arr: string[], n: number) => arr.slice(n).concat(arr.slice(0, n));
  const weekdays = rotate(weekNames, weekStartsOn);

  const days = getMonthGrid(view, weekStartsOn);
  const today = new Date();

  const byDay = React.useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of events) {
      const d = toDate(e.date);
      const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(e);
    }
    return map;
  }, [events]);

  const effectiveEnableEventSheet = enableEventSheet ?? !!renderEventSheet;
  const isEventSheetOpenControlled = eventSheetOpen !== undefined;
  const [internalEventSheetOpen, setInternalEventSheetOpen] = React.useState(false);
  const activeEventSheetOpen = isEventSheetOpenControlled ? !!eventSheetOpen : internalEventSheetOpen;

  const isSelectedEventControlled = selectedEventId !== undefined;
  const [internalSelectedEventRef, setInternalSelectedEventRef] = React.useState<CalendarSelectedEventRef | null>(null);

  const setEventSheetOpen = React.useCallback(
    (open: boolean) => {
      if (!isEventSheetOpenControlled) setInternalEventSheetOpen(open);
      onEventSheetOpenChange?.(open);
      if (!open) {
        // Clear selection when closing (uncontrolled)
        if (!isSelectedEventControlled) setInternalSelectedEventRef(null);
        onSelectedEventIdChange?.(undefined);
      }
    },
    [isEventSheetOpenControlled, isSelectedEventControlled, onEventSheetOpenChange, onSelectedEventIdChange],
  );

  const selectedEventRef: CalendarSelectedEventRef | null = React.useMemo(() => {
    if (isSelectedEventControlled && selectedEventId != null) {
      const ev = events.find((e) => e.id === selectedEventId);
      if (!ev) return null;
      const d = toDate(ev.date);
      const dayKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      return { dayKey, eventId: selectedEventId };
    }
    return internalSelectedEventRef;
  }, [events, internalSelectedEventRef, isSelectedEventControlled, selectedEventId]);

  const selectedEvent = React.useMemo(() => {
    if (!selectedEventRef) return null;
    const list = byDay.get(selectedEventRef.dayKey) || [];
    if (selectedEventRef.eventId != null) {
      return list.find((e) => e.id === selectedEventRef.eventId) || null;
    }
    const idx = selectedEventRef.index ?? -1;
    return idx >= 0 && idx < list.length ? list[idx] : null;
  }, [byDay, selectedEventRef]);

  const selectedEventDate = React.useMemo(() => {
    if (!selectedEventRef) return null;
    const [y, m, d] = selectedEventRef.dayKey.split("-").map((x) => Number(x));
    if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
    return new Date(y, m, d);
  }, [selectedEventRef]);

  const handleEventActivate = React.useCallback(
    (event: CalendarEvent, date: Date, dayKey: string, index?: number) => {
      onEventClick?.(event, date);
      onSelectedEventIdChange?.(event.id ?? undefined);
      if (!effectiveEnableEventSheet) return;
      if (!isSelectedEventControlled) {
        setInternalSelectedEventRef({ dayKey, eventId: event.id, index });
      }
      setEventSheetOpen(true);
    },
    [effectiveEnableEventSheet, isSelectedEventControlled, onEventClick, onSelectedEventIdChange, setEventSheetOpen],
  );

  const isSelected = (d: Date): boolean => {
    if (!selected) return false;
    if (selectMode === "single" && selected instanceof Date) return isSameDay(selected, d);
    if (selectMode === "multiple" && Array.isArray(selected)) return selected.some((x) => isSameDay(x as Date, d));
    if (selectMode === "range" && !Array.isArray(selected) && typeof selected === "object") {
      const s = (selected as any).start as Date | undefined;
      const e = (selected as any).end as Date | undefined;
      if (s && e) return d >= new Date(s.getFullYear(), s.getMonth(), s.getDate()) && d <= new Date(e.getFullYear(), e.getMonth(), e.getDate());
      if (s) return isSameDay(s, d);
      if (e) return isSameDay(e, d);
    }
    return false;
  };

  const commit = (next: CalendarProps["value"]) => {
    if (!isControlledValue) setInternal(next);
    onSelect?.(next!);
  };

  const handleClickDay = (d: Date) => {
    if (selectMode === "single") {
      commit(d);
      return;
    }
    if (selectMode === "multiple") {
      const arr = Array.isArray(selected) ? (selected as Date[]) : [];
      const exists = arr.some((x) => isSameDay(x, d));
      const next = exists ? arr.filter((x) => !isSameDay(x, d)) : [...arr, d];
      commit(next);
      return;
    }
    if (selectMode === "range") {
      const cur = !Array.isArray(selected) && typeof selected === "object" ? (selected as any) : {};
      const s = cur.start as Date | undefined;
      const e = cur.end as Date | undefined;
      if (!s || (s && e)) {
        commit({ start: d, end: undefined });
      } else if (s && !e) {
        if (d < s) commit({ start: d, end: s });
        else commit({ start: s, end: d });
      }
    }
  };

  const isDateDisabled = React.useCallback(
    (d: Date): boolean => {
      if (minDate && d < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) return true;
      if (maxDate && d > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())) return true;
      if (Array.isArray(disabledDates)) {
        return disabledDates.some((dd) => isSameDay(dd, d));
      }
      if (typeof disabledDates === "function") {
        return disabledDates(d);
      }
      return false;
    },
    [minDate, maxDate, disabledDates],
  );

  const SIZE_STYLES = {
    sm: { day: "w-8 h-8 text-[12px]", grid: dense ? "gap-0.5" : "gap-1", head: "text-[11px]", header: "text-sm" },
    md: { day: "w-9 h-9 text-sm", grid: dense ? "gap-1" : "gap-1.5", head: "text-xs", header: "text-sm" },
    lg: { day: "w-11 h-11 text-base", grid: dense ? "gap-1.5" : "gap-2", head: "text-sm", header: "text-base" },
    xl: { day: "w-14 h-14 text-lg", grid: dense ? "gap-2" : "gap-2.5", head: "text-base", header: "text-lg" },
  };
  const sz = SIZE_STYLES[size];

  const CELL_EVENT_STYLES = {
    sm: { cell: dense ? "min-h-24" : "min-h-28", day: "text-sm" },
    md: { cell: dense ? "min-h-32" : "min-h-36", day: "text-base" },
    lg: { cell: dense ? "min-h-40" : "min-h-44", day: "text-lg" },
    xl: { cell: dense ? "min-h-48" : "min-h-52", day: "text-xl" },
  } as const;
  const cellSz = CELL_EVENT_STYLES[size];

  const VARIANT_STYLES = {
    default: "border border-border/60 rounded-2xl md:rounded-3xl bg-linear-to-br from-card via-card to-card/95 shadow-sm backdrop-blur-sm",
    bordered:
      "border-2 border-border/70 rounded-2xl md:rounded-3xl bg-linear-to-br from-card via-card to-card/95 shadow-md hover:shadow-lg transition-shadow duration-300",
    card: "border border-border/50 rounded-3xl bg-linear-to-br from-card via-background/95 to-card shadow-lg hover:shadow-xl transition-shadow duration-300 backdrop-blur-md",
    minimal: "bg-transparent",
  };

  const weekDays = React.useMemo(() => {
    const s = startOfWeek(view, weekStartsOn);
    return Array.from({ length: 7 }, (_, i) => addDays(s, i));
  }, [view, weekStartsOn]);

  const renderMonth = (monthDate: Date) => {
    const monthDays = getMonthGrid(monthDate, weekStartsOn);
    const monthLabel = labels?.month ? labels.month(monthDate) : monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    return (
      <div>
        {months > 1 && <div className="flex items-center justify-center mb-2 text-sm font-semibold">{monthLabel}</div>}
        {showWeekdays && (
          <div className={cn("grid grid-cols-7", sz.grid, "mb-2 text-center text-muted-foreground/70 font-semibold uppercase tracking-wider")}>
            {weekdays.map((w) => (
              <div key={`${monthLabel}-${w}`} className={cn(sz.head, "transition-colors duration-200 hover:text-foreground")}>
                {w}
              </div>
            ))}
          </div>
        )}
        <div className={cn("grid grid-cols-7", sz.grid)}>
          {monthDays.map((d, idx) => {
            const inMonth = d.getMonth() === monthDate.getMonth();
            const isToday = isSameDay(d, today);
            const selectedDay = isSelected(d);
            const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            const dayEvents = byDay.get(k) || [];
            const disabled = isDateDisabled(d);
            const isWeekend = d.getDay() === 0 || d.getDay() === 6;

            const customDay = renderDay?.({ date: d, isCurrentMonth: inMonth, isToday, isSelected: selectedDay, events: dayEvents });
            if (customDay) return <React.Fragment key={`${monthLabel}-${idx}`}>{customDay}</React.Fragment>;

            if (cellMode === "events") {
              const limit = Math.max(0, maxEventsPerDay);
              const visibleEvents = dayEvents.slice(0, limit);
              const hiddenCount = Math.max(0, dayEvents.length - visibleEvents.length);
              return (
                <div
                  key={`${monthLabel}-${idx}`}
                  className={cn(
                    "rounded-2xl border border-border/40 overflow-hidden",
                    "bg-card/50 backdrop-blur-sm",
                    "transition-all duration-200",
                    "hover:border-border/60 hover:shadow-sm",
                    cellSz.cell,
                    !inMonth && "opacity-40",
                    disabled && "opacity-30 cursor-not-allowed",
                    highlightWeekends && isWeekend && "bg-destructive/5",
                    isToday && !selectedDay && "ring-2 ring-primary/40 border-primary/50",
                    selectedDay && "border-primary/60 bg-primary/5",
                  )}
                >
                  <div className="flex items-center justify-between px-2.5 py-1.5">
                    <span
                      className={cn(
                        "font-semibold tabular-nums",
                        cellSz.day,
                        isToday && "text-primary",
                        selectedDay && "text-primary",
                        !inMonth && "text-muted-foreground/50",
                      )}
                    >
                      {d.getDate()}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted/60 text-muted-foreground font-medium">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 px-2 pb-2">
                    {visibleEvents.map((e, i) => {
                      const key = e.id ?? `${k}-${i}`;
                      const node = renderEvent?.({ event: e, date: d });
                      if (node) return <div key={String(key)}>{node}</div>;
                      return (
                        <button
                          key={String(key)}
                          type="button"
                          onClick={() => handleEventActivate(e, d, k, i)}
                          className={cn(
                            "group w-full text-left rounded-lg px-2.5 py-1.5",
                            "transition-all duration-150",
                            "hover:bg-accent/50 hover:shadow-sm hover:-translate-y-0.5",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                            "text-sm font-medium",
                            "border-l-[3px] bg-card/80",
                          )}
                          style={{ borderLeftColor: e.color || "hsl(var(--primary))" }}
                          title={e.title}
                        >
                          <div className="flex items-center gap-2">
                            <span className="truncate flex-1">{e.title ?? "Event"}</span>
                            {showEventBadges && e.badge && (
                              <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">
                                {e.badge}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                    {hiddenCount > 0 && (
                      <div className="px-2.5 py-1 text-[11px] text-muted-foreground/70 font-medium flex items-center gap-1.5">
                        <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />+{hiddenCount} more
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            return (
              <button
                key={`${monthLabel}-${idx}`}
                onClick={() => handleClickDay(d)}
                disabled={disabled}
                className={cn(
                  "rounded-xl flex items-center justify-center relative cursor-pointer",
                  "transition-all duration-200 font-medium",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                  sz.day,
                  !inMonth && "text-muted-foreground/50",
                  disabled && "opacity-40 cursor-not-allowed",
                  highlightWeekends && isWeekend && "bg-destructive/5",
                  isToday && !selectedDay && "ring-2 ring-primary/60 bg-primary/5 font-bold",
                  selectedDay && "bg-linear-to-br from-primary to-primary/90 text-primary-foreground shadow-md hover:shadow-lg hover:scale-105",
                  !selectedDay && !disabled && "hover:bg-accent hover:text-accent-foreground hover:scale-105 active:scale-95",
                )}
                title={d.toDateString()}
              >
                {d.getDate()}
                {dayEvents.length > 0 && (
                  <span className="absolute -bottom-1 inline-flex gap-0.5">
                    {dayEvents.slice(0, 3).map((e, i) => (
                      <span
                        key={String(e.id ?? i)}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: e.color || "hsl(var(--primary))" }}
                      />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Navigation bounds
  const minBound = React.useMemo(() => (minDate ? new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()) : undefined), [minDate]);
  const maxBound = React.useMemo(() => (maxDate ? new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate()) : undefined), [maxDate]);
  const prevDisabled = React.useMemo(() => {
    if (!minBound) return false;
    if (display === "week") {
      const start = startOfWeek(view, weekStartsOn);
      const prevEnd = addDays(start, -1);
      return prevEnd < minBound;
    }
    const prevEnd = endOfMonth(addMonths(view, -1));
    return prevEnd < minBound;
  }, [display, view, weekStartsOn, minBound]);
  const nextDisabled = React.useMemo(() => {
    if (!maxBound) return false;
    if (display === "week") {
      const start = startOfWeek(view, weekStartsOn);
      const nextStart = addDays(start, 7);
      return nextStart > maxBound;
    }
    const nextStart = startOfMonth(addMonths(view, 1));
    return nextStart > maxBound;
  }, [display, view, weekStartsOn, maxBound]);

  return (
    <div className={cn("w-full", className)} {...rest}>
      {showHeader && (
        <div className="flex items-center justify-between mb-3 px-1">
          <button
            onClick={() => goByView(-1)}
            disabled={prevDisabled}
            className={cn(
              "p-2 rounded-full transition-all duration-200",
              "hover:bg-accent hover:shadow-sm active:scale-95",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
              prevDisabled && "opacity-40 cursor-not-allowed hover:bg-transparent hover:shadow-none active:scale-100",
            )}
            aria-label={labels?.prev || (display === "week" ? "Previous week" : "Previous month")}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-sm font-semibold tracking-tight bg-linear-to-r from-foreground to-foreground/80 bg-clip-text">
            {display === "week"
              ? `${labels?.month ? labels.month(weekDays[0]) : weekDays[0].toLocaleDateString("en-US", { month: "short" })} ${weekDays[0].getDate()} – ${labels?.month ? labels.month(weekDays[6]) : weekDays[6].toLocaleDateString("en-US", { month: "short" })} ${weekDays[6].getDate()}`
              : labels?.month
                ? labels.month(view)
                : view.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </div>
          <button
            onClick={() => goByView(1)}
            disabled={nextDisabled}
            className={cn(
              "p-2 rounded-full transition-all duration-200",
              "hover:bg-accent hover:shadow-sm active:scale-95",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
              nextDisabled && "opacity-40 cursor-not-allowed hover:bg-transparent hover:shadow-none active:scale-100",
            )}
            aria-label={labels?.next || (display === "week" ? "Next week" : "Next month")}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {display === "week" ? (
        <>
          {showWeekdays && (
            <div className={cn("grid grid-cols-7", sz.grid, "mb-1 text-center text-muted-foreground font-medium")}>
              {weekdays.map((w) => (
                <div key={`w-${w}`} className={cn(sz.head)}>
                  {w}
                </div>
              ))}
            </div>
          )}
          <div className={cn("grid grid-cols-7", sz.grid)}>
            {weekDays.map((d, idx) => {
              const inMonth = true; // week mode emphasizes the 7-day window, no dimming
              const isToday = isSameDay(d, today);
              const selectedDay = isSelected(d);
              const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
              const dayEvents = byDay.get(k) || [];
              const disabled = isDateDisabled(d);
              const isWeekend = d.getDay() === 0 || d.getDay() === 6;

              const customDay = renderDay?.({ date: d, isCurrentMonth: inMonth, isToday, isSelected: selectedDay, events: dayEvents });
              if (customDay) return <React.Fragment key={`wd-${idx}`}>{customDay}</React.Fragment>;

              if (cellMode === "events") {
                const limit = Math.max(0, maxEventsPerDay);
                const visibleEvents = dayEvents.slice(0, limit);
                const hiddenCount = Math.max(0, dayEvents.length - visibleEvents.length);
                return (
                  <div
                    key={`wd-${idx}`}
                    className={cn(
                      "rounded-2xl border border-border/40 overflow-hidden",
                      "bg-card/50 backdrop-blur-sm",
                      "transition-all duration-200",
                      "hover:border-border/60 hover:shadow-sm",
                      cellSz.cell,
                      disabled && "opacity-30 cursor-not-allowed",
                      highlightWeekends && isWeekend && "bg-destructive/5",
                      isToday && !selectedDay && "ring-2 ring-primary/40 border-primary/50",
                      selectedDay && "border-primary/60 bg-primary/5",
                    )}
                  >
                    <div className="flex items-center justify-between px-2.5 py-1.5">
                      <span
                        className={cn(
                          "font-semibold tabular-nums",
                          cellSz.day,
                          isToday && "text-primary",
                          selectedDay && "text-primary",
                        )}
                      >
                        {d.getDate()}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted/60 text-muted-foreground font-medium">
                          {dayEvents.length}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 px-2 pb-2">
                      {visibleEvents.map((e, i) => {
                        const key = e.id ?? `${k}-${i}`;
                        const node = renderEvent?.({ event: e, date: d });
                        if (node) return <div key={String(key)}>{node}</div>;
                        return (
                          <button
                            key={String(key)}
                            type="button"
                            onClick={() => handleEventActivate(e, d, k, i)}
                            className={cn(
                              "group w-full text-left rounded-lg px-2.5 py-1.5",
                              "transition-all duration-150",
                              "hover:bg-accent/50 hover:shadow-sm hover:-translate-y-0.5",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                              "text-sm font-medium",
                              "border-l-[3px] bg-card/80",
                            )}
                            style={{ borderLeftColor: e.color || "hsl(var(--primary))" }}
                            title={e.title}
                          >
                            <div className="flex items-center gap-2">
                              <span className="truncate flex-1">{e.title ?? "Event"}</span>
                              {showEventBadges && e.badge && (
                                <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">
                                  {e.badge}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                      {hiddenCount > 0 && (
                        <div className="px-2.5 py-1 text-[11px] text-muted-foreground/70 font-medium flex items-center gap-1.5">
                          <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />+{hiddenCount} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
              return (
                <button
                  key={`wd-${idx}`}
                  onClick={() => handleClickDay(d)}
                  disabled={disabled}
                  className={cn(
                    "rounded-lg flex items-center justify-center relative cursor-pointer",
                    sz.day,
                    disabled && "opacity-40 cursor-not-allowed",
                    highlightWeekends && isWeekend && "bg-accent/10",
                    isToday && !selectedDay && "ring-1 ring-primary/50",
                    selectedDay && "bg-primary text-primary-foreground hover:bg-primary/90",
                    !selectedDay && "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                  )}
                  title={d.toDateString()}
                >
                  {d.getDate()}
                  {dayEvents.length > 0 && (
                    <span className="absolute -bottom-1 inline-flex gap-0.5">
                      {dayEvents.slice(0, 3).map((e, i) => (
                        <span
                          key={String(e.id ?? i)}
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: e.color || "hsl(var(--primary))" }}
                        />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div className={cn(months > 1 ? "grid md:grid-cols-2 lg:grid-cols-3 gap-4" : "")}>
          {Array.from({ length: Math.max(1, months) }, (_, i) => (
            <React.Fragment key={`cal-month-${view.getFullYear()}-${view.getMonth()}-${i}`}>{renderMonth(addMonths(view, i))}</React.Fragment>
          ))}
        </div>
      )}

      {effectiveEnableEventSheet && selectedEvent && selectedEventDate ? (
        <Sheet
          open={activeEventSheetOpen}
          onOpenChange={setEventSheetOpen}
          side="right"
          size={eventSheetSize}
          title={selectedEvent.title ?? "Event"}
          description={selectedEventDate.toDateString()}
        >
          {renderEventSheet ? (
            renderEventSheet({ event: selectedEvent, date: selectedEventDate, close: () => setEventSheetOpen(false) })
          ) : (
            <div className="space-y-3">
              {selectedEvent.id != null ? (
                <div>
                  <div className="text-xs text-muted-foreground">ID</div>
                  <div className="font-mono text-xs break-all">{String(selectedEvent.id)}</div>
                </div>
              ) : null}
              {selectedEvent.badge ? (
                <div>
                  <div className="text-xs text-muted-foreground">Badge</div>
                  <div className="text-sm">{selectedEvent.badge}</div>
                </div>
              ) : null}
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: selectedEvent.color || "hsl(var(--primary))" }} />
                <span className="text-sm text-muted-foreground">Color</span>
              </div>
            </div>
          )}
        </Sheet>
      ) : null}
    </div>
  );
}

// types exported above
