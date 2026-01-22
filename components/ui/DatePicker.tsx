"use client";

import * as React from "react";
import { useId } from "react";
import { cn } from "@/lib/utils/cn";
import { Calendar, ChevronLeft, ChevronRight, X as XIcon, Sparkles } from "lucide-react";
import Button from "./Button";
import { Popover } from "./Popover";
import { useShadCNAnimations } from "@/lib/utils/shadcn-animations";
import { useTranslations, useLocale } from "@/lib/i18n/translation-adapter";
import { LOCALE } from "@/lib/constants/enum";
import { formatDate as formatDateUtil, formatDateShort } from "@/lib/utils/date";

export interface DatePickerProps {
  id?: string;
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  label?: string;
  required?: boolean;
  todayLabel?: string;
  clearLabel?: string;
  weekdayLabels?: string[];
  /** Disable selecting past dates (before today) */
  disablePastDates?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  id,
  value,
  onChange,
  placeholder,
  className,
  disabled = false,
  size = "md",
  label,
  required,
  todayLabel,
  clearLabel,
  weekdayLabels,
  disablePastDates = false,
}) => {
  const t = useTranslations("DatePicker");
  const locale = useLocale();
  const [isOpen, setIsOpen] = React.useState(false);
  const [viewDate, setViewDate] = React.useState(value || new Date());
  const [viewMode, setViewMode] = React.useState<"calendar" | "month" | "year">("calendar");
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const wheelContainerRef = React.useRef<HTMLDivElement>(null);
  const wheelDeltaRef = React.useRef(0);

  // Inject ShadCN animations
  useShadCNAnimations();

  // Keep calendar month synced with current value or today
  React.useEffect(() => {
    if (value) {
      setViewDate(value);
    } else {
      setViewDate(new Date());
    }
  }, [value]);

  // Reset view mode when popover closes
  React.useEffect(() => {
    if (!isOpen) {
      setViewMode("calendar");
    }
  }, [isOpen]);

  const handleDateSelect = (date: Date) => {
    // Create date in local timezone, not UTC
    // Preserve time from existing value if it's not midnight; otherwise use current time
    let selectedDate: Date;
    if (value && (value.getHours() !== 0 || value.getMinutes() !== 0 || value.getSeconds() !== 0)) {
      // Preserve existing time
      selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), value.getHours(), value.getMinutes(), value.getSeconds());
    } else {
      // Use current time
      const now = new Date();
      selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
    }
    onChange(selectedDate);
    setIsOpen(false);
  };

  const formatDateDisplay = (date: Date): string => {
    // Use locale for date formatting
    return date.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = React.useCallback((direction: "prev" | "next") => {
    setViewDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newDate;
    });
  }, []);

  const isElementVerticallyScrollable = (el: Element) => {
    const style = window.getComputedStyle(el);
    const overflowY = style.overflowY;
    if (overflowY !== "auto" && overflowY !== "scroll") return false;
    const node = el as HTMLElement;
    return node.scrollHeight > node.clientHeight + 1;
  };

  // Mouse wheel UX similar to Combobox: keep the page from scrolling while hovering the popover.
  // If the popover itself is scrollable (small viewports), allow normal scrolling; otherwise use the wheel to navigate months.
  React.useEffect(() => {
    if (!isOpen) return;
    const container = wheelContainerRef.current;
    if (!container) return;

    const onWheel = (event: WheelEvent) => {
      if (!container.contains(event.target as Node)) return;
      if (event.ctrlKey) return;

      // If the wheel originates from a scrollable element inside the popover, don't hijack it.
      let node: Element | null = event.target as Element | null;
      while (node && node !== container) {
        if (isElementVerticallyScrollable(node)) return;
        node = node.parentElement;
      }
      if (isElementVerticallyScrollable(container)) return;

      event.preventDefault();
      event.stopPropagation();

      wheelDeltaRef.current += event.deltaY;
      const threshold = 70;
      if (Math.abs(wheelDeltaRef.current) < threshold) return;

      const steps = Math.trunc(wheelDeltaRef.current / threshold);
      wheelDeltaRef.current -= steps * threshold;

      const direction: "prev" | "next" = steps > 0 ? "next" : "prev";
      for (let i = 0; i < Math.abs(steps); i++) navigateMonth(direction);
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, [isOpen, navigateMonth]);

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(viewDate);
    const firstDayOfMonth = getFirstDayOfMonth(viewDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className={size === "sm" ? "w-7 h-7" : "w-8 h-8"} />);
    }

    // Days of the month
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      const isSelected =
        value && date.getDate() === value.getDate() && date.getMonth() === value.getMonth() && date.getFullYear() === value.getFullYear();
      const isToday = date.toDateString() === new Date().toDateString();

      // Check if date is in the past (before today)
      const isPastDate = disablePastDates && date < today;

      // Calculate which row this day is in (0-based)
      const totalDaysFromStart = firstDayOfMonth + day - 1;
      const rowIndex = Math.floor(totalDaysFromStart / 7);

      days.push(
        <button
          key={day}
          onClick={() => !isPastDate && handleDateSelect(date)}
          disabled={isPastDate}
          style={{
            animationDelay: isOpen ? `${rowIndex * 40}ms` : "0ms",
          }}
          className={cn(
            size === "sm" ? "w-7 h-7 text-[12px]" : "w-8 h-8 text-sm",
            "datepicker-day rounded-lg focus:outline-none relative",
            "transition-all duration-200 font-medium",
            isPastDate && "opacity-30 cursor-not-allowed text-muted-foreground",
            isSelected
              ? "bg-linear-to-br from-primary to-primary/80 text-primary-foreground font-bold shadow-lg shadow-primary/30 scale-110 z-10 hover:from-primary hover:to-primary/70"
              : !isPastDate && "hover:bg-accent/80 hover:text-accent-foreground hover:scale-105 focus:bg-accent focus:text-accent-foreground",
            isToday && !isSelected && "bg-primary/15 text-primary font-bold ring-2 ring-primary/30",
          )}
        >
          {day}
          {isToday && !isSelected && <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />}
        </button>,
      );
    }

    return days;
  };

  // Render month selector grid
  const renderMonthSelector = () => {
    const months =
      locale === "vi"
        ? ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"]
        : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return (
      <div className="grid grid-cols-3 gap-2 p-2">
        {months.map((month, idx) => {
          const isSelected = viewDate.getMonth() === idx;
          return (
            <button
              key={month}
              type="button"
              onClick={() => {
                setViewDate(new Date(viewDate.getFullYear(), idx, 1));
                setViewMode("calendar");
              }}
              className={cn(
                "py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200",
                isSelected ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-accent/80 text-foreground hover:scale-105",
              )}
            >
              {month}
            </button>
          );
        })}
      </div>
    );
  };

  // Render year selector grid
  const renderYearSelector = () => {
    const currentYear = viewDate.getFullYear();
    const startYear = Math.floor(currentYear / 12) * 12;
    const years = Array.from({ length: 12 }, (_, i) => startYear + i);

    return (
      <div className="grid grid-cols-3 gap-2 p-2">
        {years.map((year) => {
          const isSelected = viewDate.getFullYear() === year;
          return (
            <button
              key={year}
              type="button"
              onClick={() => {
                setViewDate(new Date(year, viewDate.getMonth(), 1));
                setViewMode("month");
              }}
              className={cn(
                "py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200",
                isSelected ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-accent/80 text-foreground hover:scale-105",
              )}
            >
              {year}
            </button>
          );
        })}
      </div>
    );
  };

  // Navigate year range for year selector
  const navigateYearRange = (direction: "prev" | "next") => {
    const currentYear = viewDate.getFullYear();
    const offset = direction === "next" ? 12 : -12;
    setViewDate(new Date(currentYear + offset, viewDate.getMonth(), 1));
  };

  const datePickerContent = (
    <div ref={wheelContainerRef} data-datepicker className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          type="button"
          onClick={() => (viewMode === "year" ? navigateYearRange("prev") : navigateMonth("prev"))}
          className={cn(
            "p-2 rounded-xl transition-all duration-200",
            "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground",
            "hover:scale-110 active:scale-95 hover:shadow-md",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewMode(viewMode === "month" ? "calendar" : "month")}
            className={cn(
              "text-sm font-bold transition-all duration-200 px-2 py-1 rounded-lg",
              viewMode === "month" ? "bg-primary/15 text-primary" : "text-foreground hover:bg-accent/50",
            )}
          >
            {viewDate.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", { month: "long" })}
          </button>
          <button
            type="button"
            onClick={() => setViewMode(viewMode === "year" ? "calendar" : "year")}
            className={cn(
              "text-sm font-bold transition-all duration-200 px-2 py-1 rounded-lg",
              viewMode === "year" ? "bg-primary/15 text-primary" : "text-foreground hover:bg-accent/50",
            )}
          >
            {viewDate.getFullYear()}
          </button>
        </div>
        <button
          type="button"
          onClick={() => (viewMode === "year" ? navigateYearRange("next") : navigateMonth("next"))}
          className={cn(
            "p-2 rounded-xl transition-all duration-200",
            "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground",
            "hover:scale-110 active:scale-95 hover:shadow-md",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Content based on view mode */}
      {viewMode === "calendar" && (
        <>
          {/* Weekday headers */}
          <div className={cn("grid grid-cols-7 gap-1 mb-2 px-0.5")}>
            {(weekdayLabels || (locale === "vi" ? ["CN", "T2", "T3", "T4", "T5", "T6", "T7"] : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"])).map(
              (day, idx) => (
                <div
                  key={day}
                  className={cn(
                    "text-center font-bold uppercase tracking-wide",
                    size === "sm" ? "text-[9px] py-1" : "text-[10px] py-1.5",
                    idx === 0 || idx === 6 ? "text-primary/70" : "text-muted-foreground/60",
                  )}
                >
                  {day}
                </div>
              ),
            )}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1 p-1 rounded-xl bg-muted/20">{renderCalendar()}</div>
        </>
      )}

      {viewMode === "month" && renderMonthSelector()}
      {viewMode === "year" && renderYearSelector()}

      {/* Footer actions */}
      <div className={cn("flex items-center gap-2 mt-4 pt-3 border-t border-border/50", size === "sm" && "mt-3 pt-2 gap-1.5")}>
        <button
          type="button"
          onClick={() => {
            const today = new Date();
            handleDateSelect(today);
          }}
          className={cn(
            "flex-1 font-semibold rounded-xl",
            "bg-linear-to-r from-primary/10 to-primary/5 border border-primary/30",
            "text-primary hover:from-primary/20 hover:to-primary/10 hover:border-primary/50",
            "transition-all duration-300 flex items-center justify-center",
            "hover:scale-[1.02] active:scale-[0.98] hover:shadow-md hover:shadow-primary/10",
            size === "sm" ? "px-2 py-1 text-[10px] gap-1" : "px-3 py-2 text-xs gap-2",
          )}
        >
          <Sparkles className={size === "sm" ? "w-2.5 h-2.5" : "w-3.5 h-3.5"} />
          {todayLabel || t("today")}
        </button>
        <button
          type="button"
          onClick={() => {
            onChange(undefined);
            setIsOpen(false);
            setViewDate(new Date());
          }}
          className={cn(
            "flex-1 font-semibold rounded-xl",
            "bg-linear-to-r from-destructive/10 to-destructive/5 border border-destructive/30",
            "text-destructive hover:from-destructive/20 hover:to-destructive/10 hover:border-destructive/50",
            "transition-all duration-300 flex items-center justify-center",
            "hover:scale-[1.02] active:scale-[0.98] hover:shadow-md hover:shadow-destructive/10",
            size === "sm" ? "px-2 py-1 text-[10px] gap-1" : "px-3 py-2 text-xs gap-2",
          )}
        >
          <XIcon className={size === "sm" ? "w-2.5 h-2.5" : "w-3.5 h-3.5"} />
          {clearLabel || t("clear")}
        </button>
      </div>
    </div>
  );

  const autoId = useId();
  const resolvedId = id ? String(id) : `datepicker-${autoId}`;
  const labelId = label ? `${resolvedId}-label` : undefined;
  const labelSize = size === "sm" ? "text-xs" : "text-sm";

  // Radius consistent with Input: sm => rounded-md, md => rounded-lg
  const radiusClass = size === "sm" ? "rounded-md" : "rounded-lg";
  const verticalGap = size === "sm" ? "space-y-1.5" : "space-y-2";

  return (
    <div className={cn("w-full group", verticalGap)}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label
            id={labelId}
            htmlFor={resolvedId}
            onClick={() => triggerRef.current?.focus()}
            className={cn(
              labelSize,
              "font-semibold transition-colors duration-300 cursor-pointer",
              disabled ? "text-muted-foreground" : "text-foreground group-focus-within:text-primary hover:text-primary",
            )}
          >
            {label}
            {required && <span className="text-destructive ml-1 animate-pulse">*</span>}
          </label>
        </div>
      )}
      <Popover
        open={isOpen}
        onOpenChange={setIsOpen}
        placement="bottom-start"
        disabled={disabled}
        contentWidth={size === "sm" ? 240 : 280}
        contentClassName={cn(
          "p-0",
          "backdrop-blur-xl bg-popover/95 border-border/40 shadow-2xl",
          "rounded-2xl",
          // Keep usable on small viewports (wheel scroll should stay within the popover if it overflows)
          "max-w-[calc(100vw-1rem)] max-h-[calc(100vh-6rem)] overflow-auto overscroll-contain",
          size === "sm" ? "p-4" : "p-5",
          "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-300",
        )}
        trigger={
          <button
            ref={triggerRef}
            type="button"
            disabled={disabled}
            id={resolvedId}
            aria-labelledby={labelId}
            className={cn(
              "group flex w-full items-center justify-between border bg-background/80 backdrop-blur-sm",
              size === "sm" ? "rounded-full" : "rounded-full",
              size === "sm" ? "px-2.5 py-1.5 text-sm h-8 md:h-7 md:text-xs md:py-1" : "px-3 py-2.5 text-sm h-11",
              "border-border/60 hover:border-primary/40",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "hover:bg-accent/10 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5",
              "transition-all duration-300 ease-out",
              isOpen && "ring-2 ring-primary/30 border-primary/50 shadow-lg shadow-primary/10",
              className,
            )}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "flex items-center justify-center rounded-lg p-1.5 transition-all duration-300",
                  isOpen ? "bg-primary/15 text-primary" : "bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
                )}
              >
                <Calendar className={cn(size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4", "transition-transform duration-300", isOpen && "scale-110")} />
              </div>
              <span
                className={cn("truncate font-medium transition-colors duration-200", !value && "text-muted-foreground", value && "text-foreground")}
              >
                {value ? formatDateDisplay(value) : placeholder || t("placeholder")}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {value && (
                <span
                  role="button"
                  aria-label={clearLabel || t("clear")}
                  tabIndex={0}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange(undefined);
                    setViewDate(new Date());
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      onChange(undefined);
                      setViewDate(new Date());
                    }
                  }}
                  className={cn(
                    "inline-flex items-center justify-center rounded-lg p-1",
                    "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                    "transition-all duration-200 cursor-pointer hover:scale-110",
                  )}
                >
                  <XIcon className="h-3.5 w-3.5" />
                </span>
              )}
              <span
                className={cn("transition-all duration-300 text-muted-foreground group-hover:text-foreground", isOpen && "rotate-180 text-primary")}
              >
                <svg className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
          </button>
        }
      >
        {datePickerContent}
      </Popover>
    </div>
  );
};

// Additional components for backward compatibility
export const DateRangePicker: React.FC<{
  startDate?: Date;
  endDate?: Date;
  onChange: (start: Date, end: Date) => void;
  placeholder?: string;
  className?: string;
  /** Disable selecting past dates (before today) */
  disablePastDates?: boolean;
  /** Size variant */
  size?: "sm" | "md";
}> = ({ startDate, endDate, onChange, placeholder = "Select date range...", className, disablePastDates = false, size = "md" }) => {
  const locale = useLocale();
  const t = useTranslations("DatePicker");
  const [isOpen, setIsOpen] = React.useState(false);
  const wheelContainerRef = React.useRef<HTMLDivElement>(null);
  const wheelDeltaRef = React.useRef(0);

  // Helper to normalize date to local timezone (avoid UTC offset issues)
  const normalizeToLocal = (date: Date | undefined | null): Date | null => {
    if (!date) return null;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  // Use passed-in props as the source of truth, but manage a temporary state for selection.
  const [viewDate, setViewDate] = React.useState<Date>(startDate || new Date());
  const [tempStart, setTempStart] = React.useState<Date | null>(normalizeToLocal(startDate));
  const [tempEnd, setTempEnd] = React.useState<Date | null>(normalizeToLocal(endDate));
  const [hoveredDate, setHoveredDate] = React.useState<Date | null>(null);

  // Sync temp state with props (normalize to avoid timezone issues)
  React.useEffect(() => {
    setTempStart(normalizeToLocal(startDate));
  }, [startDate]);

  React.useEffect(() => {
    setTempEnd(normalizeToLocal(endDate));
  }, [endDate]);

  const isSameDay = (a: Date | null, b: Date | null) => {
    if (!a || !b) return false;
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  };
  const inRange = (d: Date, s: Date, e: Date) => d > s && d < e;
  const getDaysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1).getDay();

  const navigateMonth = React.useCallback((direction: "prev" | "next") => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + (direction === "next" ? 1 : -1), 1));
  }, []);

  const isElementVerticallyScrollable = (el: Element) => {
    const style = window.getComputedStyle(el);
    const overflowY = style.overflowY;
    if (overflowY !== "auto" && overflowY !== "scroll") return false;
    const node = el as HTMLElement;
    return node.scrollHeight > node.clientHeight + 1;
  };

  React.useEffect(() => {
    if (!isOpen) return;
    const container = wheelContainerRef.current;
    if (!container) return;

    const onWheel = (event: WheelEvent) => {
      if (!container.contains(event.target as Node)) return;
      if (event.ctrlKey) return;

      let node: Element | null = event.target as Element | null;
      while (node && node !== container) {
        if (isElementVerticallyScrollable(node)) return;
        node = node.parentElement;
      }
      if (isElementVerticallyScrollable(container)) return;

      event.preventDefault();
      event.stopPropagation();

      wheelDeltaRef.current += event.deltaY;
      const threshold = 70;
      if (Math.abs(wheelDeltaRef.current) < threshold) return;

      const steps = Math.trunc(wheelDeltaRef.current / threshold);
      wheelDeltaRef.current -= steps * threshold;

      const direction: "prev" | "next" = steps > 0 ? "next" : "prev";
      for (let i = 0; i < Math.abs(steps); i++) navigateMonth(direction);
    };

    container.addEventListener("wheel", onWheel, { passive: false });
    return () => container.removeEventListener("wheel", onWheel);
  }, [isOpen, navigateMonth]);

  const handleSelect = (date: Date) => {
    // Create date object with local timezone to avoid UTC offset issues
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(localDate);
      setTempEnd(null);
      setHoveredDate(null);
    } else if (tempStart && !tempEnd) {
      if (localDate < tempStart) {
        setTempStart(localDate);
      } else {
        setTempEnd(localDate);
        onChange(tempStart, localDate);
        setIsOpen(false);
      }
    }
  };

  const renderGrid = () => {
    const nodes: React.ReactNode[] = [];
    const daysInMonth = getDaysInMonth(viewDate);
    const firstDay = getFirstDayOfMonth(viewDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < firstDay; i++) nodes.push(<div key={`e-${i}`} className="w-8 h-8" />);

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);

      // Check if date is in the past (before today)
      const isPastDate = disablePastDates && date < today;

      const isSelectedStart = isSameDay(date, tempStart);
      const isSelectedEnd = isSameDay(date, tempEnd);

      const isHovering = hoveredDate && tempStart && !tempEnd;

      let isInRange = false;
      let isRangeStart = false;
      let isRangeEnd = false;

      if (tempStart && tempEnd) {
        if (isSameDay(date, tempStart)) isRangeStart = true;
        if (isSameDay(date, tempEnd)) isRangeEnd = true;
        if (inRange(date, tempStart, tempEnd)) isInRange = true;
      } else if (isHovering) {
        if (hoveredDate > tempStart) {
          if (isSameDay(date, tempStart)) isRangeStart = true;
          if (isSameDay(date, hoveredDate)) isRangeEnd = true;
          if (inRange(date, tempStart, hoveredDate)) isInRange = true;
        } else {
          if (isSameDay(date, hoveredDate)) isRangeStart = true;
          if (isSameDay(date, tempStart)) isRangeEnd = true;
          if (inRange(date, hoveredDate, tempStart)) isInRange = true;
        }
      }

      nodes.push(
        <button
          key={d}
          onClick={() => !isPastDate && handleSelect(date)}
          disabled={isPastDate}
          onMouseEnter={() => !isPastDate && tempStart && !tempEnd && setHoveredDate(date)}
          onMouseLeave={() => tempStart && !tempEnd && setHoveredDate(null)}
          className={cn(
            "transition-all duration-200 focus:outline-none relative font-medium",
            size === "sm" ? "w-6 h-6 text-xs" : "w-8 h-8 text-sm",
            // Disabled/past date state
            isPastDate && "opacity-30 cursor-not-allowed text-muted-foreground",
            // Default state
            !isPastDate && !isInRange && !isRangeStart && !isRangeEnd && "hover:bg-accent/80 hover:text-accent-foreground hover:scale-105 rounded-lg",

            // Range selection styling - smooth continuous background with gradient
            isInRange && "bg-primary/15 text-foreground",
            (isRangeStart || isRangeEnd) &&
              "bg-linear-to-br from-primary to-primary/80 text-primary-foreground hover:from-primary hover:to-primary/70 shadow-lg shadow-primary/25",

            // Only round the actual start and end of the range
            isRangeStart && !isRangeEnd && "rounded-l-lg rounded-r-none",
            isRangeEnd && !isRangeStart && "rounded-r-lg rounded-l-none",
            isRangeStart && isRangeEnd && "rounded-lg", // Single day selection

            // Hover effects for range
            isInRange && !isPastDate && "hover:bg-primary/25",

            !isPastDate && "focus:bg-accent focus:text-accent-foreground focus:z-10 focus:shadow-md",
          )}
        >
          {d}
        </button>,
      );
    }
    return nodes;
  };

  const panel = (
    <div ref={wheelContainerRef} className="w-full">
      {/* Header */}
      <div className={cn("flex items-center justify-between px-1", size === "sm" ? "mb-2" : "mb-4")}>
        <button
          type="button"
          onClick={() => navigateMonth("prev")}
          className={cn(
            "rounded-xl transition-all duration-200",
            size === "sm" ? "p-1.5" : "p-2",
            "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground",
            "hover:scale-110 active:scale-95 hover:shadow-md",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
          )}
        >
          <ChevronLeft className={cn(size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
        </button>
        <div className="flex flex-col items-center">
          <span className={cn("font-bold text-foreground", size === "sm" ? "text-xs" : "text-sm")}>
            {viewDate.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", { month: "long" })}
          </span>
          <span className={cn("text-muted-foreground font-medium", size === "sm" ? "text-[10px]" : "text-xs")}>{viewDate.getFullYear()}</span>
        </div>
        <button
          type="button"
          onClick={() => navigateMonth("next")}
          className={cn(
            "rounded-xl transition-all duration-200",
            size === "sm" ? "p-1.5" : "p-2",
            "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground",
            "hover:scale-110 active:scale-95 hover:shadow-md",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
          )}
        >
          <ChevronRight className={cn(size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
        </button>
      </div>
      {/* Weekday headers */}
      <div className={cn("grid grid-cols-7 gap-1 px-0.5", size === "sm" ? "mb-1" : "mb-2")}>
        {(locale === "vi" ? ["CN", "T2", "T3", "T4", "T5", "T6", "T7"] : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]).map((d, idx) => (
          <div
            key={d}
            className={cn(
              "text-center font-bold uppercase tracking-wide",
              size === "sm" ? "text-[8px] py-1" : "text-[10px] py-1.5",
              idx === 0 || idx === 6 ? "text-primary/70" : "text-muted-foreground/60",
            )}
          >
            {d}
          </div>
        ))}
      </div>
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-0.5 p-1 rounded-xl bg-muted/20">{renderGrid()}</div>
    </div>
  );

  const displayFormat = (date: Date) => formatDateShort(date);

  const label =
    tempStart && tempEnd ? `${displayFormat(tempStart)} - ${displayFormat(tempEnd)}` : tempStart ? `${displayFormat(tempStart)} - ...` : placeholder;

  return (
    <Popover
      open={isOpen}
      onOpenChange={setIsOpen}
      placement="bottom-start"
      contentWidth={size === "sm" ? 240 : 280}
      contentClassName={cn(
        "p-0",
        "backdrop-blur-xl bg-popover/95 border-border/40 shadow-2xl",
        "rounded-2xl",
        "max-w-[calc(100vw-1rem)] max-h-[calc(100vh-6rem)] overflow-auto overscroll-contain",
        size === "sm" ? "p-3" : "p-5",
        "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-300",
      )}
      trigger={
        <button
          type="button"
          className={cn(
            "group flex w-full items-center justify-between rounded-full border bg-background/80 backdrop-blur-sm",
            size === "sm" ? "px-2 py-1.5 text-xs" : "px-3 py-2.5 text-sm",
            "border-border/60 hover:border-primary/40",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "hover:bg-accent/10 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5",
            "transition-all duration-300 ease-out",
            isOpen && "ring-2 ring-primary/30 border-primary/50 shadow-lg shadow-primary/10",
            className,
          )}
        >
          <div className={cn("flex items-center", size === "sm" ? "gap-1.5" : "gap-2.5")}>
            <div
              className={cn(
                "flex items-center justify-center rounded-lg transition-all duration-300",
                size === "sm" ? "p-1" : "p-1.5",
                isOpen ? "bg-primary/15 text-primary" : "bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
              )}
            >
              <Calendar className={cn("transition-transform duration-300", size === "sm" ? "h-3 w-3" : "h-4 w-4", isOpen && "scale-110")} />
            </div>
            <span
              className={cn(
                "truncate font-medium transition-colors duration-200",
                !tempStart && !tempEnd && "text-muted-foreground",
                (tempStart || tempEnd) && "text-foreground",
              )}
            >
              {label}
            </span>
          </div>
          <span className={cn("transition-all duration-300 text-muted-foreground group-hover:text-foreground", isOpen && "rotate-180 text-primary")}>
            <svg className={cn(size === "sm" ? "h-3 w-3" : "h-4 w-4")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </button>
      }
    >
      {panel}
    </Popover>
  );
};

export const CompactDatePicker: React.FC<{
  value?: Date;
  onChange: (date?: Date) => void;
  className?: string;
}> = ({ value, onChange, className }) => {
  return (
    <DatePicker
      value={value}
      onChange={onChange as (d: Date | undefined) => void}
      size="sm"
      className={cn("max-w-56", className)}
      placeholder="Date"
    />
  );
};
