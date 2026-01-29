"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import Button from "./Button";

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
    sm: { cell: dense ? "min-h-20 p-1.5" : "min-h-24 p-2", day: "text-[12px]" },
    md: { cell: dense ? "min-h-28 p-2" : "min-h-32 p-2.5", day: "text-sm" },
    lg: { cell: dense ? "min-h-36 p-2.5" : "min-h-40 p-3", day: "text-base" },
    xl: { cell: dense ? "min-h-44 p-3" : "min-h-52 p-3.5", day: "text-lg" },
  } as const;
  const cellSz = CELL_EVENT_STYLES[size];

  const VARIANT_STYLES = {
    default: "border border-border rounded-2xl bg-card",
    bordered: "border-2 border-border rounded-2xl bg-card shadow-sm",
    card: "border border-border rounded-3xl bg-card shadow-lg",
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
          <div className={cn("grid grid-cols-7", sz.grid, "mb-1 text-center text-muted-foreground font-medium")}>
            {weekdays.map((w) => (
              <div key={`${monthLabel}-${w}`} className={cn(sz.head)}>
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
                    "rounded-xl border border-border/50 bg-background/40 overflow-hidden",
                    "transition-colors duration-150",
                    animate && "will-change-transform",
                    cellSz.cell,
                    !inMonth && "opacity-60",
                    disabled && "opacity-40",
                    highlightWeekends && isWeekend && "bg-accent/10",
                    isToday && !selectedDay && "ring-1 ring-primary/40",
                    selectedDay && "border-primary/50 bg-primary/10",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => !disabled && handleClickDay(d)}
                      disabled={disabled}
                      className={cn(
                        "inline-flex items-center justify-center rounded-lg px-2 py-1",
                        "transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                        cellSz.day,
                        selectedDay ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground",
                        disabled && "cursor-not-allowed hover:bg-transparent",
                      )}
                      title={d.toDateString()}
                    >
                      {d.getDate()}
                    </button>
                    {dayEvents.length > 0 && <span className="text-[11px] text-muted-foreground tabular-nums">{dayEvents.length}</span>}
                  </div>

                  <div className={cn("mt-2 space-y-1", dense ? "mt-1.5" : "mt-2")}>
                    {visibleEvents.map((e, i) => {
                      const key = e.id ?? `${k}-${i}`;
                      const node = renderEvent?.({ event: e, date: d });
                      if (node) return <div key={String(key)}>{node}</div>;
                      return (
                        <button
                          key={String(key)}
                          type="button"
                          onClick={() => onEventClick?.(e, d)}
                          className={cn(
                            "w-full text-left rounded-lg px-2 py-1",
                            "transition-colors duration-150 hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                            "text-xs flex items-center gap-2",
                          )}
                          title={e.title}
                        >
                          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: e.color || "hsl(var(--primary))" }} />
                          <span className="truncate flex-1">{e.title ?? "Event"}</span>
                          {showEventBadges && e.badge && (
                            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{e.badge}</span>
                          )}
                        </button>
                      );
                    })}
                    {hiddenCount > 0 && <div className="px-2 text-[11px] text-muted-foreground">+{hiddenCount} more</div>}
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
                  "rounded-lg flex items-center justify-center relative cursor-pointer",
                  sz.day,
                  !inMonth && "text-muted-foreground/60",
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
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => goByView(-1)}
            disabled={prevDisabled}
            className={cn("p-1 rounded-lg hover:bg-accent", prevDisabled && "opacity-40 cursor-not-allowed hover:bg-transparent")}
            aria-label={labels?.prev || (display === "week" ? "Previous week" : "Previous month")}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-sm font-semibold">
            {display === "week"
              ? `${labels?.month ? labels.month(weekDays[0]) : weekDays[0].toLocaleDateString("en-US", { month: "short" })} ${weekDays[0].getDate()} – ${labels?.month ? labels.month(weekDays[6]) : weekDays[6].toLocaleDateString("en-US", { month: "short" })} ${weekDays[6].getDate()}`
              : labels?.month
                ? labels.month(view)
                : view.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </div>
          <button
            onClick={() => goByView(1)}
            disabled={nextDisabled}
            className={cn("p-1 rounded-lg hover:bg-accent", nextDisabled && "opacity-40 cursor-not-allowed hover:bg-transparent")}
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
                      "rounded-xl border border-border/50 bg-background/40 overflow-hidden",
                      "transition-colors duration-150",
                      cellSz.cell,
                      disabled && "opacity-40",
                      highlightWeekends && isWeekend && "bg-accent/10",
                      isToday && !selectedDay && "ring-1 ring-primary/40",
                      selectedDay && "border-primary/50 bg-primary/10",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => !disabled && handleClickDay(d)}
                        disabled={disabled}
                        className={cn(
                          "inline-flex items-center justify-center rounded-lg px-2 py-1",
                          "transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                          cellSz.day,
                          selectedDay ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground",
                          disabled && "cursor-not-allowed hover:bg-transparent",
                        )}
                        title={d.toDateString()}
                      >
                        {d.getDate()}
                      </button>
                      {dayEvents.length > 0 && <span className="text-[11px] text-muted-foreground tabular-nums">{dayEvents.length}</span>}
                    </div>

                    <div className={cn("mt-2 space-y-1", dense ? "mt-1.5" : "mt-2")}>
                      {visibleEvents.map((e, i) => {
                        const key = e.id ?? `${k}-${i}`;
                        const node = renderEvent?.({ event: e, date: d });
                        if (node) return <div key={String(key)}>{node}</div>;
                        return (
                          <button
                            key={String(key)}
                            type="button"
                            onClick={() => onEventClick?.(e, d)}
                            className={cn(
                              "w-full text-left rounded-lg px-2 py-1",
                              "transition-colors duration-150 hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                              "text-xs flex items-center gap-2",
                            )}
                            title={e.title}
                          >
                            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: e.color || "hsl(var(--primary))" }} />
                            <span className="truncate flex-1">{e.title ?? "Event"}</span>
                            {showEventBadges && e.badge && (
                              <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{e.badge}</span>
                            )}
                          </button>
                        );
                      })}
                      {hiddenCount > 0 && <div className="px-2 text-[11px] text-muted-foreground">+{hiddenCount} more</div>}
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
                        <span key={String(e.id ?? i)} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: e.color || "hsl(var(--primary))" }} />
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
    </div>
  );
}

// types exported above
