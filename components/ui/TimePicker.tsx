"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Popover } from "./Popover";
import { Clock, X, Check } from "lucide-react";
import Input from "./Input";

type TimeFormat = "24" | "12";
type TimePickerVariant = "default" | "compact" | "inline";

export interface TimePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: string; // e.g. "14:05" or "02:05 PM"
  defaultValue?: string;
  onChange?: (value: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string;
  required?: boolean;
  format?: TimeFormat; // 24 or 12
  includeSeconds?: boolean;
  minuteStep?: number; // default 5
  secondStep?: number; // default 5
  clearable?: boolean;
  /** Visual variant of the picker */
  variant?: TimePickerVariant;
  /** Show "Now" button */
  showNow?: boolean;
  /** Show time presets (Morning, Afternoon, Evening) */
  showPresets?: boolean;
  /** Enable manual input */
  allowManualInput?: boolean;
  /** Custom presets with labels and times */
  customPresets?: Array<{ label: string; time: string }>;
  /** Minimum allowed time (e.g., "09:00") */
  minTime?: string;
  /** Maximum allowed time (e.g., "18:00") */
  maxTime?: string;
  /** Disabled times function or array */
  disabledTimes?: ((time: string) => boolean) | string[];
  /** Show validation feedback */
  error?: string;
  /** Success state */
  success?: boolean;
  /** Helper text */
  helperText?: string;
  /** Enable smooth animations */
  animate?: boolean;
  /** Callback when popover opens */
  onOpen?: () => void;
  /** Callback when popover closes */
  onClose?: () => void;
}

type Parts = { h: number; m: number; s: number; p?: "AM" | "PM" };

const pad = (n: number) => n.toString().padStart(2, "0");

function parseTime(input?: string, fmt: TimeFormat = "24", includeSeconds?: boolean): Parts | null {
  if (!input) return null;
  try {
    const s = input.trim().toUpperCase();
    const ampm = s.endsWith("AM") || s.endsWith("PM");
    const clean = s.replace(/\s*(AM|PM)\s*$/, "");
    const segs = clean.split(":");
    const h = Number(segs[0]);
    const m = Number(segs[1] ?? 0);
    const sec = Number(segs[2] ?? 0);
    if (Number.isNaN(h) || Number.isNaN(m) || Number.isNaN(sec)) return null;
    if (fmt === "12" || ampm) {
      const p = s.endsWith("PM") ? "PM" : "AM";
      return { h: Math.max(1, Math.min(12, h)), m: Math.max(0, Math.min(59, m)), s: Math.max(0, Math.min(59, sec)), p };
    }
    return { h: Math.max(0, Math.min(23, h)), m: Math.max(0, Math.min(59, m)), s: Math.max(0, Math.min(59, sec)) };
  } catch (error) {
    console.error("Error parsing time:", error);
    return null;
  }
}

function formatTime({ h, m, s, p }: Parts, fmt: TimeFormat, includeSeconds?: boolean): string {
  if (fmt === "12") {
    const period = p || (h >= 12 ? "PM" : "AM");
    const hr12 = h % 12 === 0 ? 12 : h % 12;
    const base = `${pad(hr12)}:${pad(m)}`;
    return includeSeconds ? `${base}:${pad(s)} ${period}` : `${base} ${period}`;
  }
  const base = `${pad(h)}:${pad(m)}`;
  return includeSeconds ? `${base}:${pad(s)}` : base;
}

// Time presets
const PRESETS = {
  morning: { h: 9, m: 0, s: 0 },
  afternoon: { h: 14, m: 0, s: 0 },
  evening: { h: 18, m: 0, s: 0 },
  night: { h: 21, m: 0, s: 0 },
};

export default function TimePicker({
  value,
  defaultValue,
  onChange,
  placeholder = "Select time",
  disabled = false,
  size = "md",
  label,
  required,
  format = "24",
  includeSeconds = false,
  minuteStep = 5,
  secondStep = 5,
  clearable = true,
  variant = "default",
  showNow = false,
  showPresets = false,
  allowManualInput = false,
  customPresets = [],
  minTime,
  maxTime,
  disabledTimes,
  error,
  success,
  helperText,
  animate = true,
  onOpen,
  onClose,
  className,
  ...rest
}: TimePickerProps) {
  const isControlled = value !== undefined;
  const now = new Date();
  const initial: Parts =
    parseTime(isControlled ? value : defaultValue, format, includeSeconds) ||
    (format === "12"
      ? { h: ((now.getHours() % 12) || 12), m: now.getMinutes(), s: now.getSeconds(), p: now.getHours() >= 12 ? "PM" : "AM" }
      : { h: now.getHours(), m: now.getMinutes(), s: now.getSeconds() });

  const [open, setOpen] = React.useState(false);
  const [parts, setParts] = React.useState<Parts>(initial);
  const [manualInput, setManualInput] = React.useState("");
  const [focusedColumn, setFocusedColumn] = React.useState<"hour" | "minute" | "second" | "period" | null>(null);

  const hourScrollRef = React.useRef<HTMLDivElement>(null);
  const minuteScrollRef = React.useRef<HTMLDivElement>(null);
  const secondScrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isControlled) {
      const parsed = parseTime(value, format, includeSeconds);
      if (parsed) setParts(parsed);
    }
  }, [value, isControlled, format, includeSeconds]);

  // Smooth scroll to selected time
  React.useEffect(() => {
    if (!open) return;
    const scrollToSelected = (ref: React.RefObject<HTMLDivElement>, targetValue: number, step: number) => {
      if (!ref.current) return;
      const buttons = ref.current.querySelectorAll("button");
      const targetIndex = Math.floor(targetValue / step);
      const targetButton = buttons[targetIndex];
      if (targetButton) {
        targetButton.scrollIntoView({ behavior: animate ? "smooth" : "auto", block: "center" });
      }
    };

    setTimeout(() => {
      scrollToSelected(hourScrollRef, parts.h, 1);
      scrollToSelected(minuteScrollRef, parts.m, minuteStep);
      if (includeSeconds) scrollToSelected(secondScrollRef, parts.s, secondStep);
    }, 50);
  }, [open, parts.h, parts.m, parts.s, minuteStep, secondStep, includeSeconds, animate]);

  // Check if time is disabled
  const isTimeDisabled = React.useCallback((timeStr: string): boolean => {
    if (!disabledTimes) return false;
    if (typeof disabledTimes === "function") return disabledTimes(timeStr);
    return disabledTimes.includes(timeStr);
  }, [disabledTimes]);

  // Check if time is within range
  const isTimeInRange = React.useCallback((timeStr: string): boolean => {
    if (!minTime && !maxTime) return true;
    const parsed = parseTime(timeStr, format, includeSeconds);
    if (!parsed) return true;

    if (minTime) {
      const min = parseTime(minTime, format, includeSeconds);
      if (min) {
        const currentMinutes = parsed.h * 60 + parsed.m;
        const minMinutes = min.h * 60 + min.m;
        if (currentMinutes < minMinutes) return false;
      }
    }

    if (maxTime) {
      const max = parseTime(maxTime, format, includeSeconds);
      if (max) {
        const currentMinutes = parsed.h * 60 + parsed.m;
        const maxMinutes = max.h * 60 + max.m;
        if (currentMinutes > maxMinutes) return false;
      }
    }

    return true;
  }, [minTime, maxTime, format, includeSeconds]);

  const emit = (next: Parts | undefined) => {
    const timeStr = next ? formatTime(next, format, includeSeconds) : undefined;
    if (timeStr && !isTimeInRange(timeStr)) return;
    if (timeStr && isTimeDisabled(timeStr)) return;
    onChange?.(timeStr);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      onOpen?.();
    } else {
      onClose?.();
      setFocusedColumn(null);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, column: "hour" | "minute" | "second" | "period") => {
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End", "PageUp", "PageDown"].includes(e.key)) return;
    e.preventDefault();

    let newParts = { ...parts };

    switch (column) {
      case "hour":
        if (e.key === "ArrowUp") newParts.h = format === "24" ? (parts.h + 1) % 24 : (parts.h % 12) + 1;
        if (e.key === "ArrowDown") newParts.h = format === "24" ? (parts.h - 1 + 24) % 24 : ((parts.h - 2 + 12) % 12) + 1;
        if (e.key === "Home") newParts.h = format === "24" ? 0 : 1;
        if (e.key === "End") newParts.h = format === "24" ? 23 : 12;
        if (e.key === "PageUp") newParts.h = format === "24" ? (parts.h + 6) % 24 : (parts.h % 12) + 3;
        if (e.key === "PageDown") newParts.h = format === "24" ? (parts.h - 6 + 24) % 24 : ((parts.h - 4 + 12) % 12) + 1;
        if (e.key === "ArrowRight") setFocusedColumn("minute");
        break;
      case "minute":
        if (e.key === "ArrowUp") newParts.m = (parts.m + minuteStep) % 60;
        if (e.key === "ArrowDown") newParts.m = (parts.m - minuteStep + 60) % 60;
        if (e.key === "Home") newParts.m = 0;
        if (e.key === "End") newParts.m = 59 - (59 % minuteStep);
        if (e.key === "PageUp") newParts.m = (parts.m + minuteStep * 3) % 60;
        if (e.key === "PageDown") newParts.m = (parts.m - minuteStep * 3 + 60) % 60;
        if (e.key === "ArrowLeft") setFocusedColumn("hour");
        if (e.key === "ArrowRight") setFocusedColumn(includeSeconds ? "second" : format === "12" ? "period" : null);
        break;
      case "second":
        if (e.key === "ArrowUp") newParts.s = (parts.s + secondStep) % 60;
        if (e.key === "ArrowDown") newParts.s = (parts.s - secondStep + 60) % 60;
        if (e.key === "Home") newParts.s = 0;
        if (e.key === "End") newParts.s = 59 - (59 % secondStep);
        if (e.key === "PageUp") newParts.s = (parts.s + secondStep * 3) % 60;
        if (e.key === "PageDown") newParts.s = (parts.s - secondStep * 3 + 60) % 60;
        if (e.key === "ArrowLeft") setFocusedColumn("minute");
        if (e.key === "ArrowRight" && format === "12") setFocusedColumn("period");
        break;
      case "period":
        if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "Home" || e.key === "End") {
          newParts.p = newParts.p === "AM" ? "PM" : "AM";
        }
        if (e.key === "ArrowLeft") setFocusedColumn(includeSeconds ? "second" : "minute");
        break;
    }

    setParts(newParts);
    emit(newParts);
  };

  const setNow = () => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();
    let next: Parts;
    if (format === "12") {
      next = { h: h % 12 || 12, m, s, p: h >= 12 ? "PM" : "AM" };
    } else {
      next = { h, m, s };
    }
    setParts(next);
    emit(next);
  };

  const setPreset = (preset: keyof typeof PRESETS) => {
    const { h, m, s } = PRESETS[preset];
    let next: Parts;
    if (format === "12") {
      next = { h: h % 12 || 12, m, s, p: h >= 12 ? "PM" : "AM" };
    } else {
      next = { h, m, s };
    }
    setParts(next);
    emit(next);
  };

  const handleManualInput = (input: string) => {
    setManualInput(input);
    const parsed = parseTime(input, format, includeSeconds);
    if (parsed) {
      const timeStr = formatTime(parsed, format, includeSeconds);
      if (isTimeInRange(timeStr) && !isTimeDisabled(timeStr)) {
        setParts(parsed);
        emit(parsed);
      }
    }
  };

  const handleCustomPreset = (time: string) => {
    const parsed = parseTime(time, format, includeSeconds);
    if (parsed) {
      setParts(parsed);
      emit(parsed);
    }
  };

  const hours: number[] = format === "24" ? Array.from({ length: 24 }, (_, i) => i) : Array.from({ length: 12 }, (_, i) => (i + 1));
  const minutes: number[] = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => Math.min(59, i * minuteStep));
  const seconds: number[] = Array.from({ length: Math.ceil(60 / secondStep) }, (_, i) => Math.min(59, i * secondStep));

  const sizeClasses = {
    sm: { label: "text-xs", height: "h-8", padding: "px-2.5 py-1.5", text: "text-xs", icon: "w-3.5 h-3.5" },
    md: { label: "text-sm", height: "h-10", padding: "px-3 py-2", text: "text-sm", icon: "w-4 h-4" },
    lg: { label: "text-base", height: "h-12", padding: "px-4 py-3", text: "text-base", icon: "w-5 h-5" },
  };

  const sz = sizeClasses[size];
  const radiusClass = size === "sm" ? "rounded-md" : "rounded-lg";

  const display = formatTime(parts, format, includeSeconds);

  const trigger = variant === "inline" ? null : (
    <button
      type="button"
      disabled={disabled}
      aria-label="Select time"
      aria-haspopup="dialog"
      aria-expanded={open}
      className={cn(
        "flex w-full items-center justify-between border bg-background",
        sz.height,
        sz.padding,
        sz.text,
        radiusClass,
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "transition-all duration-200",
        error && "border-destructive focus-visible:ring-destructive",
        success && "border-green-500 focus-visible:ring-green-500",
        !error && !success && "border-input hover:bg-accent/5",
        animate && !disabled && "hover:shadow-md",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Clock className={cn(sz.icon, error ? "text-destructive" : success ? "text-green-500" : "text-muted-foreground")} />
        <span className={cn("truncate", !value && !defaultValue && "text-muted-foreground")}>
          {value || defaultValue ? display : placeholder}
        </span>
      </div>
      <span className={cn("ml-2 transition-transform duration-200", open && "rotate-180")}>
        <svg className={sz.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </button>
  );

  const contentWidth = variant === "compact" ? 240 : variant === "inline" ? 320 : includeSeconds ? 340 : 300;

  const timePickerContent = (
    <div className="space-y-3">
      {/* Manual Input */}
      {allowManualInput && (
        <div>
          <Input
            placeholder={format === "12" ? "02:30 PM" : "14:30"}
            value={manualInput || display}
            onChange={(e) => handleManualInput(e.target.value)}
            size="sm"
            variant="outlined"
          />
        </div>
      )}

      {/* Presets */}
      {showPresets && (
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(PRESETS).map((preset) => (
            <button
              key={preset}
              type="button"
              className={cn(
                "px-2 py-1.5 text-xs rounded-md border border-border hover:bg-accent/10 capitalize transition-all",
                animate && "hover:scale-105 active:scale-95"
              )}
              onClick={() => setPreset(preset as keyof typeof PRESETS)}
              aria-label={`Set time to ${preset}`}
            >
              {preset}
            </button>
          ))}
        </div>
      )}

      {/* Custom Presets */}
      {customPresets && customPresets.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {customPresets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              className={cn(
                "px-2 py-1.5 text-xs rounded-md border border-border hover:bg-accent/10 transition-all",
                animate && "hover:scale-105 active:scale-95"
              )}
              onClick={() => handleCustomPreset(preset.time)}
              aria-label={`Set time to ${preset.label}`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {/* Time Selector */}
      <div className="flex gap-3">
        {/* Hours */}
        <div className="flex-1 min-w-[70px]">
          <div className="text-xs font-semibold text-muted-foreground mb-2 text-center">Hour</div>
          <div
            ref={hourScrollRef}
            className="max-h-48 overflow-y-auto pr-1 space-y-1 scrollbar-thin scroll-smooth"
            role="listbox"
            aria-label="Select hour"
            tabIndex={focusedColumn === "hour" ? 0 : -1}
            onKeyDown={(e) => handleKeyDown(e, "hour")}
            onFocus={() => setFocusedColumn("hour")}
          >
            {hours.map((h) => {
              const isSelected = (format === "24" && parts.h === h) || (format === "12" && (parts.h % 12 || 12) === (h % 12 || 12));
              return (
                <button
                  key={h}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    "w-full text-center px-3 py-2 rounded-md transition-all text-sm font-medium",
                    "hover:bg-accent hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                    isSelected && "bg-primary text-primary-foreground shadow-md",
                    !isSelected && "text-foreground/80",
                    animate && "transition-transform duration-150"
                  )}
                  onClick={() => {
                    const nextH = format === "24" ? h : ((parts.p === "PM" ? (h % 12) + 12 : (h % 12))) % 24;
                    const next = { ...parts, h: format === "24" ? h : (nextH === 0 && parts.p === "AM" ? 0 : nextH || (parts.p === "PM" ? 12 : 0)) };
                    setParts(next);
                    emit(next);
                  }}
                >
                  {pad(h)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Visual separator */}
        <div className="w-px bg-border/50 self-stretch my-8" />

        {/* Minutes */}
        <div className="flex-1 min-w-[70px]">
          <div className="text-xs font-semibold text-muted-foreground mb-2 text-center">Min</div>
          <div
            ref={minuteScrollRef}
            className="max-h-48 overflow-y-auto pr-1 space-y-1 scrollbar-thin scroll-smooth"
            role="listbox"
            aria-label="Select minute"
            tabIndex={focusedColumn === "minute" ? 0 : -1}
            onKeyDown={(e) => handleKeyDown(e, "minute")}
            onFocus={() => setFocusedColumn("minute")}
          >
            {minutes.map((m) => {
              const isSelected = parts.m === m;
              return (
                <button
                  key={m}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    "w-full text-center px-3 py-2 rounded-md transition-all text-sm font-medium",
                    "hover:bg-accent hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                    isSelected && "bg-primary text-primary-foreground shadow-md",
                    !isSelected && "text-foreground/80",
                    animate && "transition-transform duration-150"
                  )}
                  onClick={() => {
                    const next = { ...parts, m };
                    setParts(next);
                    emit(next);
                  }}
                >
                  {pad(m)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Visual separator */}
        <div className="w-px bg-border/50 self-stretch my-8" />

        {/* Seconds */}
        {includeSeconds && (
          <>
            <div className="flex-1 min-w-[70px]">
              <div className="text-xs font-semibold text-muted-foreground mb-2 text-center">Sec</div>
              <div
                ref={secondScrollRef}
                className="max-h-48 overflow-y-auto pr-1 space-y-1 scrollbar-thin scroll-smooth"
                role="listbox"
                aria-label="Select second"
                tabIndex={focusedColumn === "second" ? 0 : -1}
                onKeyDown={(e) => handleKeyDown(e, "second")}
                onFocus={() => setFocusedColumn("second")}
              >
                {seconds.map((s) => {
                  const isSelected = parts.s === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={cn(
                        "w-full text-center px-3 py-2 rounded-md transition-all text-sm font-medium",
                        "hover:bg-accent hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                        isSelected && "bg-primary text-primary-foreground shadow-md",
                        !isSelected && "text-foreground/80",
                        animate && "transition-transform duration-150"
                      )}
                      onClick={() => {
                        const next = { ...parts, s };
                        setParts(next);
                        emit(next);
                      }}
                    >
                      {pad(s)}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Visual separator */}
            <div className="w-px bg-border/50 self-stretch my-8" />
          </>
        )}

        {/* AM/PM */}
        {format === "12" && (
          <div className="w-20">
            <div className="text-xs font-semibold text-muted-foreground mb-2 text-center">Period</div>
            <div
              className="flex flex-col gap-2"
              role="radiogroup"
              aria-label="Select AM or PM"
              tabIndex={focusedColumn === "period" ? 0 : -1}
              onKeyDown={(e) => handleKeyDown(e, "period")}
              onFocus={() => setFocusedColumn("period")}
            >
              {["AM", "PM"].map((p) => {
                const isSelected = parts.p === p;
                return (
                  <button
                    key={p}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={cn(
                      "px-4 py-3 rounded-md transition-all text-sm font-semibold",
                      "hover:bg-accent hover:scale-105 active:scale-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                      isSelected && "bg-primary text-primary-foreground shadow-md",
                      !isSelected && "text-foreground/80 border border-border",
                      animate && "transition-transform duration-150"
                    )}
                    onClick={() => {
                      const pVal = p as "AM" | "PM";
                      let hour = parts.h;
                      if (pVal === "AM" && hour >= 12) hour -= 12;
                      if (pVal === "PM" && hour < 12) hour += 12;
                      const next = { ...parts, p: pVal, h: hour };
                      setParts(next);
                      emit(next);
                    }}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {(showNow || clearable) && (
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
          {showNow && (
            <button
              type="button"
              className={cn(
                "px-3 py-2 text-xs rounded-md border border-border hover:bg-accent/10 transition-all flex items-center gap-2 font-medium",
                animate && "hover:scale-105 active:scale-95"
              )}
              onClick={() => {
                setNow();
                if (variant === "compact") handleOpenChange(false);
              }}
              aria-label="Set current time"
            >
              <Clock className="w-3.5 h-3.5" />
              Now
            </button>
          )}
          <div className="flex-1" />
          {clearable && (
            <button
              type="button"
              className={cn(
                "px-3 py-2 text-xs rounded-md border border-border hover:bg-destructive/10 hover:text-destructive transition-all flex items-center gap-2 font-medium",
                animate && "hover:scale-105 active:scale-95"
              )}
              onClick={() => {
                setParts(initial);
                emit(undefined);
                handleOpenChange(false);
              }}
              aria-label="Clear selected time"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );

  // Inline variant renders content directly without popover
  if (variant === "inline") {
    return (
      <div className="w-full" {...rest}>
        {label && (
          <div className="flex items-center justify-between mb-2">
            <label className={cn(sz.label, "font-medium", disabled ? "text-muted-foreground" : "text-foreground")}>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </label>
          </div>
        )}
        <div className={cn("p-3 rounded-lg border border-border bg-card shadow-sm", className)}>{timePickerContent}</div>
      </div>
    );
  }

  return (
    <div className="w-full" {...rest}>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label
            className={cn(sz.label, "font-medium", disabled ? "text-muted-foreground" : "text-foreground", "cursor-pointer")}
            onClick={() => !disabled && handleOpenChange(true)}
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        </div>
      )}

      <Popover
        trigger={trigger!}
        open={open}
        onOpenChange={handleOpenChange}
        placement="bottom-start"
        matchTriggerWidth={variant === "compact"}
        contentWidth={contentWidth}
        contentClassName={cn(
          "p-4 rounded-lg border bg-popover shadow-xl backdrop-blur-md",
          error && "border-destructive",
          success && "border-green-500",
          !error && !success && "border-border",
          animate && "animate-in fade-in-0 zoom-in-95 duration-200"
        )}
      >
        {timePickerContent}
      </Popover>

      {/* Validation and Helper Text */}
      {(error || success || helperText) && (
        <div className={cn("mt-1.5 flex items-start gap-1.5", sz.label)}>
          {error && (
            <div className="flex items-center gap-1.5 text-destructive">
              <X className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && !error && (
            <div className="flex items-center gap-1.5 text-green-600">
              <Check className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Valid time selected</span>
            </div>
          )}
          {helperText && !error && !success && <span className="text-muted-foreground">{helperText}</span>}
        </div>
      )}
    </div>
  );
}

