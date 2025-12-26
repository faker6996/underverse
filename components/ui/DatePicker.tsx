"use client";

import * as React from "react";
import { useId } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";
import { Calendar, ChevronLeft, ChevronRight, X as XIcon } from "lucide-react";
import Button from "./Button";
import { useShadCNAnimations } from "@/lib/utils/shadcn-animations";
import { useTranslations, useLocale } from "next-intl";
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
}) => {
  const t = useTranslations("DatePicker");
  const locale = useLocale();
  const [isOpen, setIsOpen] = React.useState(false);
  const [dropdownPosition, setDropdownPosition] = React.useState<{ top: number; left: number; width: number } | null>(null);
  const [viewDate, setViewDate] = React.useState(value || new Date());
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Inject ShadCN animations
  useShadCNAnimations();

  // Calculate positioning synchronously on open to avoid flicker
  const calculatePosition = React.useCallback(() => {
    if (!triggerRef.current) return null;
    const rect = triggerRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    return {
      top: rect.bottom + scrollTop + 4,
      left: rect.left + scrollLeft,
      width: rect.width,
    };
  }, []);

  // Reposition on resize/scroll while open
  React.useEffect(() => {
    if (!isOpen) return;
    const handler = () => {
      const pos = calculatePosition();
      if (pos) setDropdownPosition(pos);
    };
    window.addEventListener("resize", handler);
    window.addEventListener("scroll", handler, true);
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, true);
    };
  }, [isOpen, calculatePosition]);

  // Keep calendar month synced with current value or today
  React.useEffect(() => {
    if (value) {
      setViewDate(value);
    } else {
      setViewDate(new Date());
    }
  }, [value]);

  // Handle clicks outside
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const trigger = triggerRef.current;
      const dropdown = dropdownRef.current;
      if (!trigger || !dropdown) return;
      const clickedOutsideTrigger = !trigger.contains(target);
      const clickedOutsideDropdown = !dropdown.contains(target);
      if (clickedOutsideTrigger && clickedOutsideDropdown) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleDateSelect = (date: Date) => {
    // Preserve time from existing value if it's not midnight; otherwise use current time
    let selectedDate: Date;
    if (value && (value.getHours() !== 0 || value.getMinutes() !== 0 || value.getSeconds() !== 0)) {
      selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), value.getHours(), value.getMinutes(), value.getSeconds());
    } else {
      const now = new Date();
      selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), now.getHours(), now.getMinutes(), now.getSeconds());
    }
    onChange(selectedDate);
    setIsOpen(false);
  };

  const formatDateDisplay = (date: Date): string => {
    // Always include time for clarity
    return formatDateUtil(date);
  };

  const getDaysInMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date): number => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setViewDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return newDate;
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(viewDate);
    const firstDayOfMonth = getFirstDayOfMonth(viewDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      const isSelected =
        value && date.getDate() === value.getDate() && date.getMonth() === value.getMonth() && date.getFullYear() === value.getFullYear();
      const isToday = date.toDateString() === new Date().toDateString();

      // Calculate which row this day is in (0-based)
      const totalDaysFromStart = firstDayOfMonth + day - 1;
      const rowIndex = Math.floor(totalDaysFromStart / 7);

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(date)}
          style={{
            animationDelay: isOpen ? `${rowIndex * 50}ms` : "0ms",
          }}
          className={cn(
            size === "sm" ? "w-7 h-7 text-[12px]" : "w-8 h-8 text-sm",
            "datepicker-day rounded-md focus:outline-none",
            "transition-colors",
            isSelected
              ? "!bg-primary text-primary-foreground font-bold ring-2 ring-primary-foreground/60 shadow-lg scale-105 z-10 hover:!bg-primary focus:!bg-primary focus:text-primary-foreground"
              : "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            isToday && !isSelected && "bg-accent text-accent-foreground font-semibold"
          )}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const datePickerContent =
    isOpen && dropdownPosition ? (
      <div
        data-datepicker
        style={{
          position: "absolute",
          top: dropdownPosition?.top || 0,
          left: dropdownPosition?.left || 0,
          width: size === "sm" ? dropdownPosition?.width || 224 : dropdownPosition?.width || 256,
          zIndex: 9999,
          pointerEvents: "none",
        }}
        data-state={isOpen ? "open" : "closed"}
        className={cn(
          "z-[9999]",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        )}
      >
        <div
          ref={dropdownRef}
          className={cn(
            "rounded-md border bg-popover text-popover-foreground shadow-md",
            "backdrop-blur-sm bg-popover/95 border-border/60",
            size === "sm" ? "p-3 w-56" : "p-4 w-64"
          )}
          style={{ pointerEvents: "auto" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="sm" onClick={() => navigateMonth("prev")} className="p-1 h-auto">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-semibold">{viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</div>
            <Button variant="ghost" size="sm" onClick={() => navigateMonth("next")} className="p-1 h-auto">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Weekday headers */}
          <div className={cn("grid grid-cols-7 gap-1", size === "sm" ? "mb-1" : "mb-2")}>
            {(weekdayLabels || ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]).map((day) => (
              <div key={day} className={cn("text-muted-foreground text-center font-medium", size === "sm" ? "text-[10px] py-0.5" : "text-xs py-1")}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
          <div className="flex items-center justify-end mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onChange(undefined);
                setIsOpen(false);
                setViewDate(new Date());
              }}
            >
              {clearLabel || t("clear")}
            </Button>
          </div>
        </div>
      </div>
    ) : null;

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
        <div className="flex items-center justify-between">
          <label
            id={labelId}
            onClick={() => triggerRef.current?.focus()}
            className={cn(
              labelSize,
              "font-medium transition-colors duration-200",
              disabled ? "text-muted-foreground" : "text-foreground group-focus-within:text-primary"
            )}
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        </div>
      )}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        id={resolvedId}
        aria-labelledby={labelId}
        onClick={() => {
          const next = !isOpen;
          if (next) {
            const pos = calculatePosition();
            if (pos) setDropdownPosition(pos);
          }
          setIsOpen(next);
        }}
        className={cn(
          cn(
            "flex w-full items-center justify-between border border-input bg-background",
            radiusClass,
            size === "sm" ? "px-2.5 py-1.5 text-sm h-8 md:h-7 md:text-xs md:py-1" : "px-3 py-2 text-sm h-10"
          ),
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "hover:bg-accent/5 transition-colors",
          className
        )}
      >
        <span className={cn("truncate", !value && "text-muted-foreground")}>
          {value ? formatDateDisplay(value) : placeholder || t("placeholder")}
        </span>
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
            className="absolute right-8 inline-flex items-center justify-center rounded-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors cursor-pointer"
            style={{ width: 20, height: 20 }}
          >
            <XIcon className="h-3.5 w-3.5" />
          </span>
        )}
        <Calendar className="h-4 w-4 text-muted-foreground ml-2" />
      </button>

      {isOpen && dropdownPosition && typeof window !== "undefined" && createPortal(datePickerContent, document.body)}
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
}> = ({ startDate, endDate, onChange, placeholder = "Select date range...", className }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [dropdownPosition, setDropdownPosition] = React.useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);

  // Use passed-in props as the source of truth, but manage a temporary state for selection.
  const [viewDate, setViewDate] = React.useState<Date>(startDate || new Date());
  const [tempStart, setTempStart] = React.useState<Date | null>(startDate || null);
  const [tempEnd, setTempEnd] = React.useState<Date | null>(endDate || null);
  const [hoveredDate, setHoveredDate] = React.useState<Date | null>(null);

  // Sync temp state with props
  React.useEffect(() => {
    setTempStart(startDate || null);
  }, [startDate]);

  React.useEffect(() => {
    setTempEnd(endDate || null);
  }, [endDate]);

  const calculatePosition = React.useCallback(() => {
    if (!triggerRef.current) return null;
    const rect = triggerRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    return { top: rect.bottom + scrollTop + 4, left: rect.left + scrollLeft, width: rect.width };
  }, []);

  // Reposition on resize/scroll
  React.useEffect(() => {
    if (!isOpen) return;
    const handler = () => {
      const pos = calculatePosition();
      if (pos) setDropdownPosition(pos);
    };
    window.addEventListener("resize", handler);
    window.addEventListener("scroll", handler, true);
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, true);
    };
  }, [isOpen, calculatePosition]);

  // Handle clicks outside to close
  React.useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const isSameDay = (a: Date | null, b: Date | null) => {
    if (!a || !b) return false;
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  };
  const inRange = (d: Date, s: Date, e: Date) => d > s && d < e;
  const getDaysInMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1).getDay();

  const handleSelect = (date: Date) => {
    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(date);
      setTempEnd(null);
      setHoveredDate(null);
    } else if (tempStart && !tempEnd) {
      if (date < tempStart) {
        setTempStart(date);
      } else {
        setTempEnd(date);
        onChange(tempStart, date);
        setIsOpen(false);
      }
    }
  };

  const renderGrid = () => {
    const nodes: React.ReactNode[] = [];
    const daysInMonth = getDaysInMonth(viewDate);
    const firstDay = getFirstDayOfMonth(viewDate);
    for (let i = 0; i < firstDay; i++) nodes.push(<div key={`e-${i}`} className="w-8 h-8" />);

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);

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
          onClick={() => handleSelect(date)}
          onMouseEnter={() => tempStart && !tempEnd && setHoveredDate(date)}
          onMouseLeave={() => tempStart && !tempEnd && setHoveredDate(null)}
          className={cn(
            "w-8 h-8 text-sm transition-all duration-200 focus:outline-none relative font-medium",
            // Default state
            !isInRange && !isRangeStart && !isRangeEnd && "hover:bg-accent hover:text-accent-foreground rounded-md",

            // Range selection styling - smooth continuous background
            isInRange && "bg-primary/15 text-foreground shadow-sm",
            (isRangeStart || isRangeEnd) && "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",

            // Only round the actual start and end of the range
            isRangeStart && !isRangeEnd && "rounded-l-md rounded-r-none",
            isRangeEnd && !isRangeStart && "rounded-r-md rounded-l-none",
            isRangeStart && isRangeEnd && "rounded-md", // Single day selection

            // Hover effects for range
            isInRange && "hover:bg-primary/25",

            "focus:bg-accent focus:text-accent-foreground focus:z-10 focus:shadow-md"
          )}
        >
          {d}
        </button>
      );
    }
    return nodes;
  };

  const panel =
    isOpen && dropdownPosition ? (
      <div
        style={{ position: "absolute", top: dropdownPosition.top, left: dropdownPosition.left, width: dropdownPosition.width || 256, zIndex: 9999 }}
        data-state={isOpen ? "open" : "closed"}
        className={cn(
          "z-[9999]",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        )}
      >
        <div
          ref={panelRef}
          className={cn("rounded-md border bg-popover text-popover-foreground shadow-md", "backdrop-blur-sm bg-popover/95 border-border/60 p-4 w-64")}
        >
          <div className="flex items-center justify-between mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
              className="p-1 h-auto"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-semibold">{viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
              className="p-1 h-auto"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div key={d} className="text-xs text-muted-foreground text-center py-1 font-medium">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">{renderGrid()}</div>
        </div>
      </div>
    ) : null;

  const displayFormat = (date: Date) => formatDateShort(date);

  const label =
    tempStart && tempEnd ? `${displayFormat(tempStart)} - ${displayFormat(tempEnd)}` : tempStart ? `${displayFormat(tempStart)} - ...` : placeholder;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          const next = !isOpen;
          if (next) {
            const pos = calculatePosition();
            if (pos) setDropdownPosition(pos);
          }
          setIsOpen(next);
        }}
        className={cn(
          "flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className
        )}
      >
        <span className={cn("truncate", !tempStart && !tempEnd && "text-muted-foreground")}>{label}</span>
        <Calendar className="h-4 w-4 text-muted-foreground ml-2" />
      </button>
      {isOpen && dropdownPosition && typeof window !== "undefined" && createPortal(panel, document.body)}
    </>
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
      className={cn("max-w-[14rem]", className)}
      placeholder="Date"
    />
  );
};
