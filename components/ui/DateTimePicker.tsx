"use client";

import * as React from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Popover } from "./Popover";
import Button from "./Button";
import Calendar from "./Calendar";
import TimePicker from "./TimePicker";
import { useLocale, useTranslations } from "@/lib/i18n/translation-adapter";

export interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  /** 12 or 24 hour format */
  format?: "12" | "24";
  includeSeconds?: boolean;
  label?: string;
  /** Custom class for label */
  labelClassName?: string;
  required?: boolean;
  /** Label for the "Done" button */
  doneLabel?: string;
  /** Label for the "Clear" button */
  clearLabel?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  placeholder,
  className,
  disabled = false,
  minDate,
  maxDate,
  format = "24",
  includeSeconds = false,
  label,
  labelClassName,
  required,
  doneLabel,
  clearLabel,
  size = "md",
}) => {
  const t = useTranslations("DateTimePicker");
  const locale = useLocale();

  const [open, setOpen] = React.useState(false);

  // Size styles for consistent sizing
  const sizeStyles = {
    sm: {
      trigger: "h-8 px-2.5 py-1.5 text-sm md:h-7 md:text-xs",
      icon: "h-3.5 w-3.5",
      label: "text-xs",
      buttonSize: "sm" as const,
      calendarSize: "sm" as const,
      timePickerSize: "sm" as const,
      padding: "p-2",
      gap: "gap-2",
    },
    md: {
      trigger: "h-10 px-3 py-2 text-sm",
      icon: "h-4 w-4",
      label: "text-sm",
      buttonSize: "sm" as const,
      calendarSize: "md" as const,
      timePickerSize: "md" as const,
      padding: "p-3",
      gap: "gap-3",
    },
    lg: {
      trigger: "h-12 px-4 py-3 text-base",
      icon: "h-5 w-5",
      label: "text-base",
      buttonSize: "md" as const,
      calendarSize: "lg" as const,
      timePickerSize: "lg" as const,
      padding: "p-4",
      gap: "gap-4",
    },
  } as const;

  // Internal state for the popover interaction
  const [tempDate, setTempDate] = React.useState<Date | undefined>(value);
  const [calendarMonth, setCalendarMonth] = React.useState<Date>(() => value ?? new Date());

  React.useEffect(() => {
    setTempDate(value);
    setCalendarMonth(value ?? new Date());
  }, [value, open]);

  // Helper to get time string from date
  const getTimeString = (date?: Date) => {
    if (!date) return "";
    const h = date.getHours();
    const m = date.getMinutes();
    const s = date.getSeconds();
    if (format === "12") {
      const p = h >= 12 ? "PM" : "AM";
      const h12 = h % 12 || 12;
      return includeSeconds
        ? `${h12.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")} ${p}`
        : `${h12.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${p}`;
    }
    return includeSeconds
      ? `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
      : `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  const handleDateSelect = (date: Date | Date[] | { start?: Date; end?: Date }) => {
    // Single mode, so safely cast to Date
    if (date instanceof Date) {
      setTempDate((prev) => {
        const newDate = new Date(date);
        if (prev) {
          // Preserve time
          newDate.setHours(prev.getHours(), prev.getMinutes(), prev.getSeconds());
        } else {
          // Default to current time if no prev time
          const now = new Date();
          newDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
        }
        return newDate;
      });
      setCalendarMonth(date);
    }
  };

  const handleTimeChange = (timeStr: string | undefined) => {
    if (!timeStr) return; // Should handle clear? TimePicker mostly returns string.

    // Parse time string back to hours/mins
    // Helper parsing (simplified version of what TimePicker does, relying on its output format)
    let h = 0,
      m = 0,
      s = 0;

    try {
      if (format === "12") {
        const [time, period] = timeStr.split(" ");
        const [hStr, mStr, sStr] = time.split(":");
        h = parseInt(hStr, 10);
        m = parseInt(mStr, 10);
        s = sStr ? parseInt(sStr, 10) : 0;
        if (period === "PM" && h < 12) h += 12;
        if (period === "AM" && h === 12) h = 0;
      } else {
        const [hStr, mStr, sStr] = timeStr.split(":");
        h = parseInt(hStr, 10);
        m = parseInt(mStr, 10);
        s = sStr ? parseInt(sStr, 10) : 0;
      }

      setTempDate((prev) => {
        const newDate = prev ? new Date(prev) : new Date();
        newDate.setHours(h, m, s);
        return newDate;
      });
    } catch (e) {
      console.error("Failed to parse time string in DateTimePicker", e);
    }
  };

  const handleApply = () => {
    onChange(tempDate);
    setOpen(false);
  };

  const handleClear = () => {
    onChange(undefined);
    setTempDate(undefined);
    setOpen(false);
  };

  // formatting display
  const displayValue = value
    ? value.toLocaleString(locale === "vi" ? "vi-VN" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: includeSeconds ? "numeric" : undefined,
        hour12: format === "12",
      })
    : "";

  const monthLabel = (date: Date) => {
    return date.toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const getWeekdays = (loc: string) => {
    switch (loc) {
      case "vi":
        return ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
      case "ko":
        return ["일", "월", "화", "수", "목", "금", "토"];
      case "ja":
        return ["日", "月", "火", "水", "木", "金", "土"];
      default:
        return ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    }
  };

  const weekdays = getWeekdays(locale);

  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className={cn(sizeStyles[size].label, "font-medium text-foreground flex items-center gap-1", labelClassName)}>
          {label} {required && <span className="text-destructive">*</span>}
        </label>
      )}

      <Popover
        open={open}
        onOpenChange={setOpen}
        trigger={
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "flex w-full items-center justify-between rounded-full border border-input bg-background",
              sizeStyles[size].trigger,
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              disabled && "opacity-50 cursor-not-allowed",
              !displayValue && "text-muted-foreground",
            )}
          >
            <span className="truncate">{displayValue || placeholder || "Select date & time"}</span>
            <div className="flex items-center gap-2 text-muted-foreground">
              {value && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(undefined);
                  }}
                  className="hover:text-foreground p-0.5 rounded-md hover:bg-accent"
                >
                  <X className={sizeStyles[size].icon} />
                </span>
              )}
              <CalendarIcon className={sizeStyles[size].icon} />
            </div>
          </button>
        }
        contentClassName={cn(
          "w-auto p-0 rounded-2xl md:rounded-3xl",
          // Keep the popover usable on small viewports
          "max-w-[calc(100vw-1rem)] max-h-[calc(100vh-6rem)] overflow-auto",
        )}
        contentScrollable
        placement="bottom-end"
      >
        <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-border">
          {/* Calendar Section */}
          <div className={sizeStyles[size].padding}>
            <Calendar
              value={tempDate}
              onSelect={handleDateSelect}
              selectMode="single"
              month={calendarMonth}
              onMonthChange={setCalendarMonth}
              minDate={minDate}
              maxDate={maxDate}
              className="border-0 shadow-none w-auto"
              size={sizeStyles[size].calendarSize}
              labels={{
                month: monthLabel,
                weekdays: weekdays,
              }}
            />
          </div>

          {/* Time Picker Section */}
          <div className={cn(sizeStyles[size].padding, "flex flex-col", sizeStyles[size].gap)}>
            <div className={cn(sizeStyles[size].label, "font-semibold text-muted-foreground text-center")}>{t?.("time") || "Time"}</div>
            <TimePicker
              variant="inline"
              value={getTimeString(tempDate)}
              onChange={handleTimeChange}
              format={format}
              includeSeconds={includeSeconds}
              clearable={false}
              className="border-0 shadow-none p-0 bg-transparent rounded-none"
              size={sizeStyles[size].timePickerSize}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className={cn(sizeStyles[size].padding, "border-t border-border flex justify-between items-center bg-muted/20")}>
          <Button variant="ghost" size={sizeStyles[size].buttonSize} onClick={handleClear} className="text-muted-foreground hover:text-foreground">
            {clearLabel || t?.("clear") || "Clear"}
          </Button>
          <Button size={sizeStyles[size].buttonSize} onClick={handleApply}>
            {doneLabel || t?.("done") || "Done"}
          </Button>
        </div>
      </Popover>
    </div>
  );
};
