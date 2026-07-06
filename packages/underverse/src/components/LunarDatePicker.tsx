"use client";

import { useSmartLocale, useSmartTranslations } from "../hooks/useSmartTranslations";
import { cn } from "../utils/cn";
import { useShadCNAnimations } from "../utils/animations";
import { Calendar, ChevronLeft, ChevronRight, Sparkles, X as XIcon } from "lucide-react";
import * as React from "react";
import { useId } from "react";
import { Popover } from "./Popover";
import { lunarToSolar, solarToLunar, type LunarDateValue } from "../utils/lunar";

export type LunarPickerValue = LunarDateValue;

export interface LunarDatePickerProps {
  id?: string;
  value?: LunarPickerValue;
  onChange: (date: LunarPickerValue | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string;
  /** Custom class for label */
  labelClassName?: string;
  required?: boolean;
  todayLabel?: string;
  clearLabel?: string;
  weekdayLabels?: string[];
  /** Disable selecting past dates (before today) */
  disablePastDates?: boolean;
  /** Minimum selectable date (inclusive). Compared by day in local timezone. */
  minDate?: LunarPickerValue;
  /** Maximum selectable date (inclusive). Compared by day in local timezone. */
  maxDate?: LunarPickerValue;
}

function toSolarDate(value: LunarPickerValue | undefined): Date | null {
  if (!value) return null;
  const solar = lunarToSolar({
    day: value.day,
    month: value.month,
    year: value.year,
    is_leap_month: value.is_leap_month,
  });
  if (!solar) return null;
  const date = new Date(solar + "T00:00:00");
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function isValidLunarDate(day: number, month: number, year: number, isLeapMonth: boolean): boolean {
  const solar = lunarToSolar({ day, month, year, is_leap_month: isLeapMonth });
  if (!solar) return false;
  const solarDate = new Date(`${solar}T00:00:00`);
  if (Number.isNaN(solarDate.getTime())) return false;
  const roundTrip = solarToLunar(solarDate);
  return roundTrip.day === day
    && roundTrip.month === month
    && roundTrip.year === year
    && roundTrip.is_leap_month === isLeapMonth;
}

function getValidDays(month: number, year: number, isLeapMonth: boolean): number[] {
  const days: number[] = [];
  for (let day = 1; day <= 30; day += 1) {
    if (isValidLunarDate(day, month, year, isLeapMonth)) {
      days.push(day);
    }
  }
  return days;
}

function getFirstWeekdayOfLunarMonth(month: number, year: number, isLeapMonth: boolean): number {
  const firstSolarDate = lunarToSolar({
    day: 1,
    month,
    year,
    is_leap_month: isLeapMonth,
  });

  if (!firstSolarDate) return 0;

  const solarDate = new Date(firstSolarDate + "T00:00:00");
  if (Number.isNaN(solarDate.getTime())) return 0;

  return solarDate.getDay();
}

function hasLeapVariant(month: number, year: number): boolean {
  return getValidDays(month, year, true).length > 0;
}

function getTodayLunarValue(): LunarDateValue {
  const today = new Date();
  const lunar = solarToLunar(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  return {
    day: lunar.day,
    month: lunar.month,
    year: lunar.year,
    is_leap_month: lunar.is_leap_month,
  };
}

function shiftMonth(month: number, year: number, delta: number) {
  const zeroBased = month - 1 + delta;
  const nextYear = year + Math.floor(zeroBased / 12);
  const normalizedMonth = ((zeroBased % 12) + 12) % 12 + 1;
  return { month: normalizedMonth, year: nextYear };
}

function parseLunarDateString(text: string): LunarPickerValue | undefined {
  if (!text) return undefined;
  const match = text.trim().match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})(?:\s*(L|Nhuận|Leap))?$/i);
  if (!match) return undefined;
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);
  const isLeap = !!match[4];

  if (isValidLunarDate(day, month, year, isLeap)) {
    return { day, month, year, is_leap_month: isLeap };
  }
  return undefined;
}

function formatLunarDateShort(value: LunarPickerValue, leapSuffix: string): string {
  if (!value) return "";
  const leapStr = value.is_leap_month ? ` ${leapSuffix}` : "";
  return `${String(value.day).padStart(2, "0")}/${String(value.month).padStart(2, "0")}/${value.year}${leapStr}`;
}

export const LunarDatePicker: React.FC<LunarDatePickerProps> = ({
  id,
  value,
  onChange,
  placeholder,
  className,
  disabled = false,
  size = "md",
  label,
  labelClassName,
  required,
  todayLabel,
  clearLabel,
  weekdayLabels,
  disablePastDates = false,
  minDate,
  maxDate,
}) => {
  const t = useSmartTranslations("DatePicker");
  const tv = useSmartTranslations("ValidationInput");
  const locale = useSmartLocale();
  const [isOpen, setIsOpen] = React.useState(false);

  const todayLunar = React.useMemo(() => getTodayLunarValue(), []);

  const [viewMonth, setViewMonth] = React.useState(value ? value.month : todayLunar.month);
  const [viewYear, setViewYear] = React.useState(value ? value.year : todayLunar.year);
  const [viewLeapMonth, setViewLeapMonth] = React.useState(value ? value.is_leap_month : todayLunar.is_leap_month);

  const [viewMode, setViewMode] = React.useState<"calendar" | "month" | "year">("calendar");
  const [localRequiredError, setLocalRequiredError] = React.useState<string | undefined>();
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const wheelContainerRef = React.useRef<HTMLDivElement>(null);
  const wheelDeltaRef = React.useRef(0);

  // Focus and typing state
  const [isFocused, setIsFocused] = React.useState(false);
  const [inputValue, setInputValue] = React.useState<string>("");

  React.useEffect(() => {
    if (value) {
      const parsed = parseLunarDateString(inputValue);
      const isSame = parsed && parsed.day === value.day && parsed.month === value.month && parsed.year === value.year && parsed.is_leap_month === value.is_leap_month;
      if (!isSame) {
        setInputValue(formatLunarDateShort(value, locale));
      }
    } else if (!isFocused) {
      setInputValue("");
    }
  }, [value, locale, isFocused, inputValue]);

  const isDateDisabled = React.useCallback(
    (lunarDate: LunarPickerValue) => {
      if (!lunarDate) return false;
      const dayDate = toSolarDate(lunarDate);
      if (!dayDate) return false;

      if (disablePastDates) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (dayDate < today) return true;
      }

      const minDay = toSolarDate(minDate);
      if (minDay && dayDate < minDay) return true;
      const maxDay = toSolarDate(maxDate);
      if (maxDay && dayDate > maxDay) return true;
      return false;
    },
    [disablePastDates, maxDate, minDate],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputValue(text);
    const parsedDate = parseLunarDateString(text);
    if (parsedDate) {
      if (!isDateDisabled(parsedDate)) {
        onChange(parsedDate);
        setViewMonth(parsedDate.month);
        setViewYear(parsedDate.year);
        setViewLeapMonth(parsedDate.is_leap_month);
        setLocalRequiredError(undefined);
      }
    }
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    if (!inputValue.trim()) {
      if (required) {
        setLocalRequiredError(tv("required"));
      } else {
        onChange(undefined);
        setLocalRequiredError(undefined);
      }
    } else {
      const parsedDate = parseLunarDateString(inputValue);
      if (parsedDate && !isDateDisabled(parsedDate)) {
        onChange(parsedDate);
        setInputValue(formatLunarDateShort(parsedDate, locale));
        setLocalRequiredError(undefined);
      } else {
        if (value) {
          setInputValue(formatLunarDateShort(value, locale));
          setLocalRequiredError(undefined);
        } else {
          setInputValue("");
          if (required) {
            setLocalRequiredError(tv("required"));
          }
        }
      }
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const parsedDate = parseLunarDateString(inputValue);
      if (parsedDate && !isDateDisabled(parsedDate)) {
        onChange(parsedDate);
        setInputValue(formatLunarDateShort(parsedDate, locale));
        setViewMonth(parsedDate.month);
        setViewYear(parsedDate.year);
        setViewLeapMonth(parsedDate.is_leap_month);
        setIsOpen(false);
        setLocalRequiredError(undefined);
      } else if (!inputValue.trim() && !required) {
        onChange(undefined);
        setIsOpen(false);
        setLocalRequiredError(undefined);
      } else {
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Inject ShadCN animations
  useShadCNAnimations();

  // Size styles for consistent sizing across all elements
  const sizeStyles = {
    sm: {
      trigger: "px-2.5 py-1.5 text-sm h-8 md:h-7 md:text-xs md:py-1",
      dayCell: "w-7 h-7 text-xs",
      monthCell: "w-6 h-6 text-xs",
      navButton: "p-1.5",
      navIcon: "h-3 w-3",
      calendarIcon: "h-3.5 w-3.5",
      clearIcon: "w-2.5 h-2.5",
      actionButton: "px-2 py-1 text-[10px] gap-1",
      actionIcon: "w-2.5 h-2.5",
      contentWidth: 240,
      contentPadding: "p-4",
      label: "text-xs",
      weekdayLabel: "text-[9px] py-1",
      headerMargin: "mb-2",
      footerMargin: "mt-3 pt-2 gap-1.5",
    },
    md: {
      trigger: "px-3 py-2.5 text-sm h-10",
      dayCell: "w-8 h-8 text-sm",
      monthCell: "w-8 h-8 text-sm",
      navButton: "p-2",
      navIcon: "h-4 w-4",
      calendarIcon: "h-4 w-4",
      clearIcon: "w-3.5 h-3.5",
      actionButton: "px-3 py-2 text-xs gap-2",
      actionIcon: "w-3.5 h-3.5",
      contentWidth: 280,
      contentPadding: "p-5",
      label: "text-sm",
      weekdayLabel: "text-[10px] py-1.5",
      headerMargin: "mb-4",
      footerMargin: "mt-4 pt-3 gap-2",
    },
    lg: {
      trigger: "px-4 py-3 text-base h-12",
      dayCell: "w-10 h-10 text-base",
      monthCell: "w-10 h-10 text-base",
      navButton: "p-2.5",
      navIcon: "h-5 w-5",
      calendarIcon: "h-5 w-5",
      clearIcon: "w-4 h-4",
      actionButton: "px-4 py-2.5 text-sm gap-2",
      actionIcon: "w-4 h-4",
      contentWidth: 340,
      contentPadding: "p-6",
      label: "text-base",
      weekdayLabel: "text-xs py-2",
      headerMargin: "mb-5",
      footerMargin: "mt-5 pt-4 gap-2.5",
    },
  } as const;

  // Keep calendar month synced with current value or today
  React.useEffect(() => {
    if (value) {
      setViewMonth(value.month);
      setViewYear(value.year);
      setViewLeapMonth(value.is_leap_month);
    } else {
      const today = getTodayLunarValue();
      setViewMonth(today.month);
      setViewYear(today.year);
      setViewLeapMonth(today.is_leap_month);
    }
  }, [value]);

  React.useEffect(() => {
    if (disabled || !required || value) {
      setLocalRequiredError(undefined);
    }
  }, [disabled, required, value]);

  // Reset view mode when popover closes
  React.useEffect(() => {
    if (!isOpen) {
      setViewMode("calendar");
    }
  }, [isOpen]);

  const handleDateSelect = (date: LunarPickerValue) => {
    if (!date) return;
    onChange(date);
    setLocalRequiredError(undefined);
    setIsOpen(false);
  };

  const formatDateDisplay = (date: LunarPickerValue | undefined): string => {
    if (!date) return "";
    const formatStr = date.is_leap_month ? t("lunarLeapFormat") : t("lunarFormat");
    return formatStr.replace("{day}", String(date.day)).replace("{month}", String(date.month)).replace("{year}", String(date.year));
  };

  const navigateMonth = React.useCallback((direction: "prev" | "next") => {
    const shifted = shiftMonth(viewMonth, viewYear, direction === "next" ? 1 : -1);
    setViewMonth(shifted.month);
    setViewYear(shifted.year);
    setViewLeapMonth(false);
  }, [viewMonth, viewYear]);

  const isElementVerticallyScrollable = (el: Element) => {
    const style = window.getComputedStyle(el);
    const overflowY = style.overflowY;
    if (overflowY !== "auto" && overflowY !== "scroll") return false;
    const node = el as HTMLElement;
    return node.scrollHeight > node.clientHeight + 1;
  };

  // Mouse wheel UX similar to Combobox
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

  const canUseLeapMonth = React.useMemo(() => hasLeapVariant(viewMonth, viewYear), [viewMonth, viewYear]);
  const effectiveLeapMonth = canUseLeapMonth ? viewLeapMonth : false;

  const renderCalendar = () => {
    const validDays = getValidDays(viewMonth, viewYear, effectiveLeapMonth);
    const firstDayOfMonth = getFirstWeekdayOfLunarMonth(viewMonth, viewYear, effectiveLeapMonth);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className={sizeStyles[size].dayCell.split(" ").slice(0, 2).join(" ")} />);
    }

    const todayLunarKey = formatLunarDateShort(todayLunar, "vi"); // use generic format for comparison

    // Days of the month
    validDays.forEach((day) => {
      const date: LunarPickerValue = { day, month: viewMonth, year: viewYear, is_leap_month: effectiveLeapMonth };
      const isSelected =
        value && date.day === value.day && date.month === value.month && date.year === value.year && date.is_leap_month === value.is_leap_month;

      const isToday = formatLunarDateShort(date, "vi") === todayLunarKey;
      const isDisabled = isDateDisabled(date);

      // Calculate which row this day is in (0-based)
      const totalDaysFromStart = firstDayOfMonth + day - 1;
      const rowIndex = Math.floor(totalDaysFromStart / 7);

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => !isDisabled && handleDateSelect(date)}
          disabled={isDisabled}
          style={{
            animationDelay: isOpen ? `${rowIndex * 40}ms` : "0ms",
          }}
          className={cn(
            sizeStyles[size].dayCell,
            "datepicker-day rounded-lg focus:outline-none relative cursor-pointer",
            "transition-all duration-200 font-medium",
            isDisabled && "opacity-30 cursor-not-allowed text-muted-foreground",
            isSelected
              ? "bg-linear-to-br from-primary to-primary/80 text-primary-foreground font-bold shadow-lg shadow-primary/30 scale-110 z-10 hover:from-primary hover:to-primary/70"
              : !isDisabled && "hover:bg-accent/80 hover:text-accent-foreground hover:scale-105 focus:bg-accent focus:text-accent-foreground",
            isToday && !isSelected && "bg-primary/15 text-primary font-bold ring-2 ring-primary/30",
          )}
        >
          {day}
          {isToday && !isSelected && <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />}
        </button>,
      );
    });

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
          const isSelected = viewMonth === idx + 1;
          return (
            <button
              key={month}
              type="button"
              onClick={() => {
                setViewMonth(idx + 1);
                setViewLeapMonth(false);
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
    const currentYear = viewYear;
    const startYear = Math.floor(currentYear / 12) * 12;
    const years = Array.from({ length: 12 }, (_, i) => startYear + i);

    return (
      <div className="grid grid-cols-3 gap-2 p-2">
        {years.map((year) => {
          const isSelected = viewYear === year;
          return (
            <button
              key={year}
              type="button"
              onClick={() => {
                setViewYear(year);
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
    const offset = direction === "next" ? 12 : -12;
    setViewYear(viewYear + offset);
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
            {t("lunarMonth").replace("{month}", String(viewMonth))}
          </button>
          <button
            type="button"
            onClick={() => setViewMode(viewMode === "year" ? "calendar" : "year")}
            className={cn(
              "text-sm font-bold transition-all duration-200 px-2 py-1 rounded-lg",
              viewMode === "year" ? "bg-primary/15 text-primary" : "text-foreground hover:bg-accent/50",
            )}
          >
            {viewYear}
          </button>
          {canUseLeapMonth && viewMode === "calendar" ? (
            <button
              type="button"
              onClick={() => setViewLeapMonth((prev) => !prev)}
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-semibold transition ml-1",
                effectiveLeapMonth
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              {t("lunarLeap")}
            </button>
          ) : null}
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
                    sizeStyles[size].weekdayLabel,
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
      <div className={cn("flex items-center border-t border-border/50", sizeStyles[size].footerMargin)}>
        <button
          type="button"
          onClick={() => {
            const today = getTodayLunarValue();
            if (isDateDisabled(today)) return;
            handleDateSelect(today);
          }}
          disabled={isDateDisabled(todayLunar)}
          className={cn(
            "flex-1 font-semibold rounded-xl",
            "bg-linear-to-r from-primary/10 to-primary/5 border border-primary/30",
            "text-primary hover:from-primary/20 hover:to-primary/10 hover:border-primary/50",
            "transition-all duration-300 flex items-center justify-center",
            "hover:scale-[1.02] active:scale-[0.98] hover:shadow-md hover:shadow-primary/10",
            sizeStyles[size].actionButton,
            isDateDisabled(todayLunar) && "opacity-50 cursor-not-allowed hover:scale-100 active:scale-100",
          )}
        >
          <Sparkles className={sizeStyles[size].actionIcon} />
          {todayLabel || t("today")}
        </button>
        <button
          type="button"
          onClick={() => {
            onChange(undefined);
            setIsOpen(false);
            const today = getTodayLunarValue();
            setViewMonth(today.month);
            setViewYear(today.year);
            setViewLeapMonth(today.is_leap_month);
          }}
          className={cn(
            "flex-1 font-semibold rounded-xl",
            "bg-linear-to-r from-destructive/10 to-destructive/5 border border-destructive/30",
            "text-destructive hover:from-destructive/20 hover:to-destructive/10 hover:border-destructive/50",
            "transition-all duration-300 flex items-center justify-center",
            "hover:scale-[1.02] active:scale-[0.98] hover:shadow-md hover:shadow-destructive/10",
            sizeStyles[size].actionButton,
          )}
        >
          <XIcon className={sizeStyles[size].actionIcon} />
          {clearLabel || t("clear")}
        </button>
      </div>
    </div>
  );

  const autoId = useId();
  const resolvedId = id ? String(id) : `lunar-datepicker-${autoId}`;
  const labelId = label ? `${resolvedId}-label` : undefined;
  const labelSize = sizeStyles[size].label;

  const verticalGap = size === "sm" ? "space-y-1.5" : size === "lg" ? "space-y-2.5" : "space-y-2";
  const effectiveError = localRequiredError;

  return (
    <div className={cn("w-full group", verticalGap)}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <label
            id={labelId}
            htmlFor={resolvedId}
            onClick={() => inputRef.current?.focus()}
            className={cn(
              labelSize,
              "font-semibold transition-colors duration-300 cursor-pointer",
              disabled ? "text-muted-foreground" : "text-foreground group-focus-within:text-primary hover:text-primary",
              effectiveError && "text-destructive",
              labelClassName,
            )}
          >
            {label}
            {required && <span className="text-destructive ml-1 animate-pulse">*</span>}
          </label>
        </div>
      )}
      <input
        tabIndex={-1}
        aria-hidden="true"
        value={value ? "selected" : ""}
        onChange={() => { }}
        required={required}
        disabled={disabled}
        onInvalid={(e) => {
          e.preventDefault();
          setLocalRequiredError(tv("required"));
        }}
        className="pointer-events-none absolute h-0 w-0 opacity-0"
      />
      <Popover
        open={isOpen}
        onOpenChange={setIsOpen}
        placement="bottom-start"
        disabled={disabled}
        contentWidth={sizeStyles[size].contentWidth}
        contentClassName={cn(
          "p-0",
          "backdrop-blur-xl bg-popover/95 border-border/40 shadow-2xl",
          "rounded-2xl md:rounded-3xl",
          // Keep usable on small viewports (wheel scroll should stay within the popover if it overflows)
          "max-w-[calc(100vw-1rem)] max-h-[calc(100vh-6rem)] overflow-auto overscroll-contain",
          sizeStyles[size].contentPadding,
          "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-300",
        )}
        trigger={
          <div
            ref={triggerRef}
            id={resolvedId}
            role="button"
            aria-label={value ? formatDateDisplay(value) : (placeholder || t("placeholder"))}
            aria-labelledby={labelId}
            aria-required={required}
            aria-invalid={!!effectiveError}
            className={cn(
              "group flex w-full items-center justify-between border bg-background/80 backdrop-blur-sm",
              "rounded-full",
              sizeStyles[size].trigger,
              disabled
                ? "border-border/40 opacity-50 cursor-not-allowed"
                : [
                  "border-border/60 hover:border-primary/40",
                  "focus-within:ring-2 focus-within:ring-primary/50 focus-within:ring-offset-2 focus-within:ring-offset-background focus-within:border-transparent focus-within:hover:border-transparent",
                  "hover:bg-accent/10 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5",
                ],
              "transition-all duration-300 ease-out",
              isOpen && !isFocused && "ring-2 ring-primary/30 border-primary/50 shadow-lg shadow-primary/10",
              effectiveError && "border-destructive/60 focus-within:ring-destructive/50 bg-destructive/5",
              className,
            )}
          >
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div
                className={cn(
                  "flex items-center justify-center transition-colors duration-300",
                  isOpen ? "text-primary" : "text-muted-foreground group-hover:text-primary",
                )}
              >
                <Calendar className={cn(sizeStyles[size].calendarIcon, "transition-transform duration-300", isOpen && "scale-110")} />
              </div>
              <input
                ref={inputRef}
                type="text"
                aria-label={value ? formatDateDisplay(value) : (placeholder || t("placeholder"))}
                disabled={disabled}
                placeholder={placeholder || t("placeholder")}
                value={isFocused ? inputValue : (value ? formatDateDisplay(value) : "")}
                onChange={handleInputChange}
                onFocus={() => {
                  setIsFocused(true);
                  if (!disabled) setIsOpen(true);
                }}
                onBlur={handleInputBlur}
                onKeyDown={handleInputKeyDown}
                onClick={(e) => {
                  if (isOpen) {
                    e.stopPropagation();
                  }
                }}
                className="w-full bg-transparent border-none outline-none focus:outline-none p-0 text-foreground font-medium placeholder-muted-foreground/60 min-w-0"
              />
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {value && (
                <span
                  role="button"
                  aria-label={clearLabel || t("clear")}
                  tabIndex={0}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange(undefined);
                    const today = getTodayLunarValue();
                    setViewMonth(today.month);
                    setViewYear(today.year);
                    setViewLeapMonth(today.is_leap_month);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      e.stopPropagation();
                      onChange(undefined);
                      setLocalRequiredError(undefined);
                      const today = getTodayLunarValue();
                      setViewMonth(today.month);
                      setViewYear(today.year);
                      setViewLeapMonth(today.is_leap_month);
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
                <svg className={sizeStyles[size].calendarIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </div>
          </div>
        }
      >
        {datePickerContent}
      </Popover>
      {effectiveError && <div className="text-xs text-destructive">{effectiveError}</div>}
    </div>
  );
};
export interface LunarDateRangePickerProps {
  id?: string;
  startDate?: LunarPickerValue;
  endDate?: LunarPickerValue | null;
  onChange: (start: LunarPickerValue | undefined, end: LunarPickerValue | null | undefined) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  labelClassName?: string;
  required?: boolean;
  disablePastDates?: boolean;
  minDate?: LunarPickerValue;
  maxDate?: LunarPickerValue;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

export const LunarDateRangePicker: React.FC<LunarDateRangePickerProps> = ({
  id,
  startDate,
  endDate,
  onChange,
  placeholder = "Select lunar date range...",
  className,
  label,
  labelClassName,
  required = false,
  disablePastDates = false,
  minDate,
  maxDate,
  size = "md",
  disabled = false,
}) => {
  const locale = useSmartLocale();
  const t = useSmartTranslations("DatePicker");
  const tv = useSmartTranslations("ValidationInput");
  const [isOpen, setIsOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<"calendar" | "month" | "year">("calendar");
  const [localRequiredError, setLocalRequiredError] = React.useState<string | undefined>();
  const wheelContainerRef = React.useRef<HTMLDivElement>(null);
  const wheelDeltaRef = React.useRef(0);

  const sizeStyles = {
    sm: {
      trigger: "px-2.5 py-1.5 text-sm h-8 md:h-7 md:text-xs md:py-1",
      dayCell: "w-7 h-7 text-xs",
      monthCell: "w-6 h-6 text-xs",
      navButton: "p-1.5",
      navIcon: "h-3 w-3",
      calendarIcon: "h-3.5 w-3.5",
      clearIcon: "w-2.5 h-2.5",
      actionButton: "px-2 py-1 text-[10px] gap-1",
      actionIcon: "w-2.5 h-2.5",
      contentWidth: 240,
      contentPadding: "p-4",
      label: "text-xs",
      weekdayLabel: "text-[9px] py-1",
      headerMargin: "mb-2",
      footerMargin: "mt-3 pt-2 gap-1.5",
    },
    md: {
      trigger: "px-3 py-2.5 text-sm h-10",
      dayCell: "w-8 h-8 text-sm",
      monthCell: "w-8 h-8 text-sm",
      navButton: "p-2",
      navIcon: "h-4 w-4",
      calendarIcon: "h-4 w-4",
      clearIcon: "w-3.5 h-3.5",
      actionButton: "px-3 py-2 text-xs gap-2",
      actionIcon: "w-3.5 h-3.5",
      contentWidth: 280,
      contentPadding: "p-5",
      label: "text-sm",
      weekdayLabel: "text-[10px] py-1.5",
      headerMargin: "mb-4",
      footerMargin: "mt-4 pt-3 gap-2",
    },
    lg: {
      trigger: "px-4 py-3 text-base h-12",
      dayCell: "w-10 h-10 text-base",
      monthCell: "w-10 h-10 text-base",
      navButton: "p-2.5",
      navIcon: "h-5 w-5",
      calendarIcon: "h-5 w-5",
      clearIcon: "w-4 h-4",
      actionButton: "px-4 py-2.5 text-sm gap-2",
      actionIcon: "w-4 h-4",
      contentWidth: 340,
      contentPadding: "p-6",
      label: "text-base",
      weekdayLabel: "text-xs py-2",
      headerMargin: "mb-5",
      footerMargin: "mt-5 pt-4 gap-2.5",
    },
  } as const;

  const triggerRef = React.useRef<HTMLDivElement>(null);

  const [todayLunar] = React.useState<LunarPickerValue>(() => solarToLunar(new Date()));

  // Internal selection state
  const [tempStart, setTempStart] = React.useState<LunarPickerValue | null>(startDate || null);
  const [tempEnd, setTempEnd] = React.useState<LunarPickerValue | null>(endDate || null);
  const [hoveredDate, setHoveredDate] = React.useState<LunarPickerValue | null>(null);

  // View state
  const [viewMonth, setViewMonth] = React.useState(startDate ? startDate.month : todayLunar.month);
  const [viewYear, setViewYear] = React.useState(startDate ? startDate.year : todayLunar.year);
  const [viewLeapMonth, setViewLeapMonth] = React.useState(startDate ? startDate.is_leap_month : todayLunar.is_leap_month);

  // Sync state when props change
  React.useEffect(() => {
    setTempStart(startDate || null);
  }, [startDate]);

  React.useEffect(() => {
    setTempEnd(endDate || null);
  }, [endDate]);

  React.useEffect(() => {
    if (!isOpen) {
      setViewMode("calendar");
    }
  }, [isOpen]);

  React.useEffect(() => {
    if (!required || (startDate && endDate)) {
      setLocalRequiredError(undefined);
    }
  }, [endDate, required, startDate]);

  const getLunarTime = React.useCallback((d: LunarPickerValue | null | undefined) => {
    if (!d) return 0;
    const solarStr = lunarToSolar(d);
    return new Date(solarStr).getTime();
  }, []);

  const isSameDay = (a: LunarPickerValue | null, b: LunarPickerValue | null) => {
    if (!a || !b) return false;
    return a.day === b.day && a.month === b.month && a.year === b.year && a.is_leap_month === b.is_leap_month;
  };

  const inRange = (d: LunarPickerValue, s: LunarPickerValue, e: LunarPickerValue) => {
    const dTime = getLunarTime(d);
    return dTime > getLunarTime(s) && dTime < getLunarTime(e);
  };

  const isDateDisabled = (date: LunarPickerValue) => {
    const dateTime = getLunarTime(date);
    if (disablePastDates) {
      const todayTime = new Date().setHours(0, 0, 0, 0);
      if (dateTime < todayTime) return true;
    }
    if (minDate && dateTime < getLunarTime(minDate)) return true;
    if (maxDate && dateTime > getLunarTime(maxDate)) return true;
    return false;
  };

  const navigateMonth = React.useCallback((direction: "prev" | "next") => {
    const shifted = shiftMonth(viewMonth, viewYear, direction === "next" ? 1 : -1);
    setViewMonth(shifted.month);
    setViewYear(shifted.year);
    setViewLeapMonth(false);
  }, [viewMonth, viewYear]);

  const navigateYearRange = React.useCallback((direction: "prev" | "next") => {
    setViewYear(viewYear + (direction === "next" ? 12 : -12));
  }, [viewYear]);

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

  const handleSelect = (date: LunarPickerValue) => {
    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(date);
      setTempEnd(null);
      setHoveredDate(null);
      onChange(date, null);
    } else if (tempStart && !tempEnd) {
      if (getLunarTime(date) < getLunarTime(tempStart)) {
        setTempStart(date);
        onChange(date, null);
      } else {
        setTempEnd(date);
        setLocalRequiredError(undefined);
        onChange(tempStart, date);
        setIsOpen(false);
      }
    }
  };

  const handleSelectToday = () => {
    const today = solarToLunar(new Date());
    if (isDateDisabled(today)) return;

    setTempStart(today);
    setTempEnd(today);
    setHoveredDate(null);
    setLocalRequiredError(undefined);
    onChange(today, today);
    setIsOpen(false);
  };

  const handleClear = () => {
    setTempStart(null);
    setTempEnd(null);
    setHoveredDate(null);
    onChange(undefined, undefined);
    setIsOpen(false);
  };

  const canUseLeapMonth = React.useMemo(() => hasLeapVariant(viewMonth, viewYear), [viewMonth, viewYear]);
  const effectiveLeapMonth = canUseLeapMonth ? viewLeapMonth : false;

  const renderGrid = () => {
    const validDays = getValidDays(viewMonth, viewYear, effectiveLeapMonth);
    const firstDayOfMonth = getFirstWeekdayOfLunarMonth(viewMonth, viewYear, effectiveLeapMonth);
    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className={sizeStyles[size].dayCell.split(" ").slice(0, 2).join(" ")} />);
    }

    validDays.forEach((day) => {
      const date: LunarPickerValue = { day, month: viewMonth, year: viewYear, is_leap_month: effectiveLeapMonth };
      const isDisabled = isDateDisabled(date);
      const isSelectedStart = isSameDay(date, tempStart);
      const isSelectedEnd = isSameDay(date, tempEnd);
      const isHovering = hoveredDate && tempStart && !tempEnd;

      let isInRangeCheck = false;
      let isRangeStartCheck = false;
      let isRangeEndCheck = false;

      if (tempStart && tempEnd) {
        if (isSelectedStart) isRangeStartCheck = true;
        if (isSelectedEnd) isRangeEndCheck = true;
        if (inRange(date, tempStart, tempEnd)) isInRangeCheck = true;
      } else if (isHovering && tempStart && hoveredDate) {
        if (getLunarTime(hoveredDate) > getLunarTime(tempStart)) {
          if (isSelectedStart) isRangeStartCheck = true;
          if (isSameDay(date, hoveredDate)) isRangeEndCheck = true;
          if (inRange(date, tempStart, hoveredDate)) isInRangeCheck = true;
        } else {
          if (isSameDay(date, hoveredDate)) isRangeStartCheck = true;
          if (isSelectedStart) isRangeEndCheck = true;
          if (inRange(date, hoveredDate, tempStart)) isInRangeCheck = true;
        }
      }

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => !isDisabled && handleSelect(date)}
          disabled={isDisabled}
          onMouseEnter={() => !isDisabled && tempStart && !tempEnd && setHoveredDate(date)}
          onMouseLeave={() => tempStart && !tempEnd && setHoveredDate(null)}
          className={cn(
            "transition-all duration-200 focus:outline-none relative font-medium cursor-pointer",
            sizeStyles[size].dayCell,
            isDisabled && "opacity-30 cursor-not-allowed text-muted-foreground",
            !isDisabled && !isInRangeCheck && !isRangeStartCheck && !isRangeEndCheck && "hover:bg-accent/80 hover:text-accent-foreground hover:scale-105 rounded-lg",
            isInRangeCheck && "bg-primary/15 text-foreground",
            (isRangeStartCheck || isRangeEndCheck) && "bg-linear-to-br from-primary to-primary/80 text-primary-foreground hover:from-primary hover:to-primary/70 shadow-lg shadow-primary/25",
            isRangeStartCheck && !isRangeEndCheck && "rounded-l-lg rounded-r-none",
            isRangeEndCheck && !isRangeStartCheck && "rounded-r-lg rounded-l-none",
            isRangeStartCheck && isRangeEndCheck && "rounded-lg",
            isInRangeCheck && !isDisabled && "hover:bg-primary/25",
            !isDisabled && "focus:bg-accent focus:text-accent-foreground focus:z-10 focus:shadow-md",
          )}
        >
          {day}
        </button>,
      );
    });

    return days;
  };

  const renderMonthSelector = () => {
    const months = locale === "vi"
      ? ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"]
      : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return (
      <div className="grid grid-cols-3 gap-2 p-2">
        {months.map((month, idx) => {
          const isSelected = viewMonth === idx + 1;
          return (
            <button
              key={month}
              type="button"
              onClick={() => {
                setViewMonth(idx + 1);
                setViewLeapMonth(false);
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

  const renderYearSelector = () => {
    const startYear = Math.floor(viewYear / 12) * 12;
    const years = Array.from({ length: 12 }, (_, i) => startYear + i);

    return (
      <div className="grid grid-cols-3 gap-2 p-2">
        {years.map((year) => {
          const isSelected = viewYear === year;
          return (
            <button
              key={year}
              type="button"
              onClick={() => {
                setViewYear(year);
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

  const isTodayUnavailable = isDateDisabled(todayLunar);

  const panel = (
    <div ref={wheelContainerRef} className="w-full">
      <div className={cn("flex items-center justify-between px-1", sizeStyles[size].headerMargin)}>
        <button
          type="button"
          onClick={() => (viewMode === "year" ? navigateYearRange("prev") : navigateMonth("prev"))}
          className={cn(
            "rounded-xl transition-all duration-200",
            sizeStyles[size].navButton,
            "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground",
            "hover:scale-110 active:scale-95 hover:shadow-md",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
          )}
        >
          <ChevronLeft className={sizeStyles[size].navIcon} />
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewMode(viewMode === "month" ? "calendar" : "month")}
            className={cn(
              "rounded-lg px-2 py-0.5 font-bold transition-colors duration-200",
              size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm",
              viewMode === "month" ? "bg-primary/15 text-primary" : "text-foreground hover:bg-accent/50",
            )}
          >
            {t("lunarMonth").replace("{month}", String(viewMonth))}
          </button>
          <button
            type="button"
            onClick={() => setViewMode(viewMode === "year" ? "calendar" : "year")}
            className={cn(
              "rounded-lg px-2 py-0.5 font-bold transition-colors duration-200",
              size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm",
              viewMode === "year" ? "bg-primary/15 text-primary" : "text-foreground hover:bg-accent/50",
            )}
          >
            {viewYear}
          </button>
          {canUseLeapMonth && viewMode === "calendar" ? (
            <button
              type="button"
              onClick={() => setViewLeapMonth((prev) => !prev)}
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-semibold transition ml-1",
                effectiveLeapMonth
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              {t("lunarLeap")}
            </button>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => (viewMode === "year" ? navigateYearRange("next") : navigateMonth("next"))}
          className={cn(
            "rounded-xl transition-all duration-200",
            sizeStyles[size].navButton,
            "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground",
            "hover:scale-110 active:scale-95 hover:shadow-md",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
          )}
        >
          <ChevronRight className={sizeStyles[size].navIcon} />
        </button>
      </div>
      {viewMode === "calendar" && (
        <>
          <div className={cn("grid grid-cols-7 gap-1 px-0.5", size === "sm" ? "mb-1" : size === "lg" ? "mb-3" : "mb-2")}>
            {(locale === "vi" ? ["CN", "T2", "T3", "T4", "T5", "T6", "T7"] : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]).map((d, idx) => (
              <div
                key={d}
                className={cn(
                  "text-center font-bold uppercase tracking-wide",
                  sizeStyles[size].weekdayLabel,
                  idx === 0 || idx === 6 ? "text-primary/70" : "text-muted-foreground/60",
                )}
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0.5 p-1 rounded-xl bg-muted/20">{renderGrid()}</div>
        </>
      )}
      {viewMode === "month" && renderMonthSelector()}
      {viewMode === "year" && renderYearSelector()}

      <div className={cn("flex items-center border-t border-border/50", sizeStyles[size].footerMargin)}>
        <button
          type="button"
          onClick={handleSelectToday}
          disabled={isTodayUnavailable}
          className={cn(
            "flex-1 font-semibold rounded-xl",
            "bg-linear-to-r from-primary/10 to-primary/5 border border-primary/30",
            "text-primary hover:from-primary/20 hover:to-primary/10 hover:border-primary/50",
            "transition-all duration-300 flex items-center justify-center",
            "hover:scale-[1.02] active:scale-[0.98] hover:shadow-md hover:shadow-primary/10",
            sizeStyles[size].actionButton,
            isTodayUnavailable && "opacity-50 cursor-not-allowed hover:scale-100 active:scale-100",
          )}
        >
          <Sparkles className={sizeStyles[size].actionIcon} />
          {t("today")}
        </button>
        <button
          type="button"
          onClick={handleClear}
          className={cn(
            "flex-1 font-semibold rounded-xl",
            "bg-linear-to-r from-destructive/10 to-destructive/5 border border-destructive/30",
            "text-destructive hover:from-destructive/20 hover:to-destructive/10 hover:border-destructive/50",
            "transition-all duration-300 flex items-center justify-center",
            "hover:scale-[1.02] active:scale-[0.98] hover:shadow-md hover:shadow-destructive/10",
            sizeStyles[size].actionButton,
          )}
        >
          <XIcon className={sizeStyles[size].actionIcon} />
          {t("clear")}
        </button>
      </div>
    </div>
  );

  const displayFormat = (date: LunarPickerValue) => {
    const formatStr = date.is_leap_month ? t("lunarLeapFormat") : t("lunarFormat");
    return formatStr.replace("{day}", String(date.day)).replace("{month}", String(date.month)).replace("{year}", String(date.year));
  };

  const displayLabel = tempStart && tempEnd
    ? `${displayFormat(tempStart)} - ${displayFormat(tempEnd)}`
    : tempStart ? `${displayFormat(tempStart)} - ...`
      : placeholder;

  const effectiveError = localRequiredError;
  const autoId = useId();
  const resolvedId = id ? String(id) : `lunardaterangepicker-${autoId}`;
  const labelId = label ? `${resolvedId}-label` : undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label
          id={labelId}
          htmlFor={resolvedId}
          onClick={() => setIsOpen(true)}
          className={cn(
            size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm",
            "font-medium transition-colors duration-300",
            disabled ? "text-muted-foreground cursor-not-allowed" : "text-foreground group-focus-within:text-primary hover:text-primary cursor-pointer",
            effectiveError && "text-destructive",
            labelClassName
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      <input
        tabIndex={-1}
        aria-hidden="true"
        value={startDate && endDate ? "selected" : ""}
        onChange={() => { }}
        required={required}
        disabled={disabled}
        onInvalid={(e) => {
          e.preventDefault();
          setLocalRequiredError(tv("required"));
        }}
        className="pointer-events-none absolute h-0 w-0 opacity-0"
      />
      <Popover
        open={isOpen}
        onOpenChange={setIsOpen}
        placement="bottom-start"
        disabled={disabled}
        contentWidth={sizeStyles[size].contentWidth}
        contentClassName={cn(
          "p-0",
          "backdrop-blur-xl bg-popover/95 border-border/40 shadow-2xl",
          "rounded-2xl md:rounded-3xl",
          "max-w-[calc(100vw-1rem)] max-h-[calc(100vh-6rem)] overflow-auto overscroll-contain",
          sizeStyles[size].contentPadding,
          "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-300",
        )}
        trigger={
          <div ref={triggerRef} id={resolvedId} role="button"
            aria-label={tempStart ? displayLabel : placeholder}
            aria-labelledby={labelId}
            aria-required={required}
            aria-invalid={!!effectiveError}
            className={cn(
              "group flex w-full items-center justify-between rounded-full border bg-background/80 backdrop-blur-sm",
              sizeStyles[size].trigger,
              disabled
                ? "border-border/40 opacity-50 cursor-not-allowed"
                : [
                  "border-border/60 hover:border-primary/40",
                  "focus-within:ring-2 focus-within:ring-primary/50 focus-within:ring-offset-2 focus-within:ring-offset-background focus-within:border-transparent focus-within:hover:border-transparent",
                  "hover:bg-accent/10 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5",
                ],
              "transition-all duration-300 ease-out text-left",
              isOpen && "ring-2 ring-primary/30 border-primary/50 shadow-lg shadow-primary/10",
              effectiveError && "border-destructive/60 focus-within:ring-destructive/50 bg-destructive/5",
            )}
          >
            <div className={cn("flex items-center flex-1 min-w-0", size === "sm" ? "gap-1.5" : "gap-2.5")}>
              <div
                className={cn(
                  "flex items-center justify-center transition-colors duration-300",
                  effectiveError ? "text-destructive" : isOpen ? "text-primary" : "text-muted-foreground group-hover:text-primary",
                )}
              >
                <Calendar className={cn("transition-transform duration-300", sizeStyles[size].calendarIcon, isOpen && "scale-110")} />
              </div>
              <span className={cn("w-full truncate font-medium", !tempStart && "text-muted-foreground/60")}>
                {tempStart ? displayLabel : placeholder}
              </span>
            </div>
            <span className={cn("transition-all duration-300 text-muted-foreground group-hover:text-foreground", isOpen && "rotate-180 text-primary")}>
              <svg className={cn(sizeStyles[size].navIcon)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>}> {panel} </Popover>
      {effectiveError && <div className="text-xs text-destructive">{effectiveError}</div>}
    </div>
  );
};


