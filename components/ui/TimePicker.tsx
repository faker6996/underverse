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
}

type Parts = { h: number; m: number; s: number; p?: "AM" | "PM" };

const pad = (n: number) => n.toString().padStart(2, "0");

function parseTime(input?: string, fmt: TimeFormat = "24", includeSeconds?: boolean): Parts | null {
  if (!input) return null;
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

  React.useEffect(() => {
    if (isControlled) {
      const parsed = parseTime(value, format, includeSeconds);
      if (parsed) setParts(parsed);
    }
  }, [value, isControlled, format, includeSeconds]);

  const emit = (next: Parts | undefined) => {
    onChange?.(next ? formatTime(next, format, includeSeconds) : undefined);
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
      className={cn(
        "flex w-full items-center justify-between border border-input bg-background",
        sz.height,
        sz.padding,
        sz.text,
        radiusClass,
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "hover:bg-accent/5 transition-colors",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Clock className={cn(sz.icon, "text-muted-foreground")} />
        <span className={cn("truncate", !value && !defaultValue && "text-muted-foreground")}>
          {value || defaultValue ? display : placeholder}
        </span>
      </div>
      <span className={cn("ml-2 transition-transform", open && "rotate-180")}>
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
              className="px-2 py-1.5 text-xs rounded-md border border-border hover:bg-accent/10 capitalize transition-colors"
              onClick={() => setPreset(preset as keyof typeof PRESETS)}
            >
              {preset}
            </button>
          ))}
        </div>
      )}

      {/* Time Selector */}
      <div className="flex gap-2">
        {/* Hours */}
        <div className="flex-1 min-w-[60px]">
          <div className="text-xs font-medium text-muted-foreground mb-1.5">Hour</div>
          <div className="max-h-48 overflow-y-auto pr-1 space-y-1 scrollbar-thin">
            {hours.map((h) => (
              <button
                key={h}
                type="button"
                className={cn(
                  "w-full text-center px-2 py-1.5 rounded-md hover:bg-accent transition-colors text-sm",
                  ((format === "24" && parts.h === h) || (format === "12" && (parts.h % 12 || 12) === (h % 12 || 12))) &&
                    "bg-primary text-primary-foreground font-semibold"
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
            ))}
          </div>
        </div>

        {/* Minutes */}
        <div className="flex-1 min-w-[60px]">
          <div className="text-xs font-medium text-muted-foreground mb-1.5">Min</div>
          <div className="max-h-48 overflow-y-auto pr-1 space-y-1 scrollbar-thin">
            {minutes.map((m) => (
              <button
                key={m}
                type="button"
                className={cn(
                  "w-full text-center px-2 py-1.5 rounded-md hover:bg-accent transition-colors text-sm",
                  parts.m === m && "bg-primary text-primary-foreground font-semibold"
                )}
                onClick={() => {
                  const next = { ...parts, m };
                  setParts(next);
                  emit(next);
                }}
              >
                {pad(m)}
              </button>
            ))}
          </div>
        </div>

        {/* Seconds */}
        {includeSeconds && (
          <div className="flex-1 min-w-[60px]">
            <div className="text-xs font-medium text-muted-foreground mb-1.5">Sec</div>
            <div className="max-h-48 overflow-y-auto pr-1 space-y-1 scrollbar-thin">
              {seconds.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={cn(
                    "w-full text-center px-2 py-1.5 rounded-md hover:bg-accent transition-colors text-sm",
                    parts.s === s && "bg-primary text-primary-foreground font-semibold"
                  )}
                  onClick={() => {
                    const next = { ...parts, s };
                    setParts(next);
                    emit(next);
                  }}
                >
                  {pad(s)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* AM/PM */}
        {format === "12" && (
          <div className="w-20">
            <div className="text-xs font-medium text-muted-foreground mb-1.5">Period</div>
            <div className="flex flex-col gap-1.5">
              {["AM", "PM"].map((p) => (
                <button
                  key={p}
                  type="button"
                  className={cn(
                    "px-3 py-2 rounded-md hover:bg-accent transition-colors text-sm font-medium",
                    parts.p === p && "bg-primary text-primary-foreground"
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
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {(showNow || clearable) && (
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
          {showNow && (
            <button
              type="button"
              className="px-3 py-1.5 text-xs rounded-md border border-border hover:bg-accent/10 transition-colors flex items-center gap-1.5"
              onClick={() => {
                setNow();
                if (variant === "compact") setOpen(false);
              }}
            >
              <Clock className="w-3 h-3" />
              Now
            </button>
          )}
          <div className="flex-1" />
          {clearable && (
            <button
              type="button"
              className="px-3 py-1.5 text-xs rounded-md border border-border hover:bg-destructive/10 transition-colors flex items-center gap-1.5"
              onClick={() => {
                setParts(initial);
                emit(undefined);
                setOpen(false);
              }}
            >
              <X className="w-3 h-3" />
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
          <label className={cn(sz.label, "font-medium", disabled ? "text-muted-foreground" : "text-foreground")} onClick={() => !disabled && setOpen(true)}>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        </div>
      )}

      <Popover
        trigger={trigger!}
        open={open}
        onOpenChange={(o) => setOpen(o)}
        placement="bottom-start"
        matchTriggerWidth={variant === "compact"}
        contentWidth={contentWidth}
        contentClassName={cn("p-3 rounded-lg border border-border bg-popover shadow-lg backdrop-blur-sm bg-popover/95")}
      >
        {timePickerContent}
      </Popover>
    </div>
  );
}

