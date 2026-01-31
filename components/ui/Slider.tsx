"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "size"> {
  mode?: "single" | "range";
  value?: number;
  defaultValue?: number;
  rangeValue?: [number, number];
  defaultRangeValue?: [number, number];
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  onValueChange?: (value: number) => void; // Alternative prop name for consistency
  onRangeChange?: (value: [number, number]) => void;
  onRangeValueChange?: (value: [number, number]) => void;
  onMouseUp?: () => void; // Called when mouse is released
  onTouchEnd?: () => void; // Called when touch ends
  label?: React.ReactNode;
  labelClassName?: string;
  containerClassName?: string;
  trackClassName?: string;
  thumbClassName?: string;
  showValue?: boolean;
  valueClassName?: string;
  formatValue?: (value: number) => string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
  noFocus?: boolean; // remove focus ring/outline styling
}

const SIZE_STYLES = {
  sm: {
    track: "h-1",
    thumb: "w-3 h-3",
    container: "py-1",
  },
  md: {
    track: "h-2",
    thumb: "w-4 h-4",
    container: "py-2",
  },
  lg: {
    track: "h-3",
    thumb: "w-5 h-5",
    container: "py-3",
  },
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      mode = "single",
      value,
      defaultValue = 0,
      rangeValue,
      defaultRangeValue,
      min = 0,
      max = 100,
      step = 1,
      onChange,
      onValueChange,
      onRangeChange,
      onRangeValueChange,
      onMouseUp,
      onTouchEnd,
      label,
      labelClassName,
      containerClassName,
      trackClassName,
      thumbClassName,
      showValue = false,
      valueClassName,
      formatValue,
      size = "md",
      disabled = false,
      orientation = "horizontal",
      noFocus = true,
      ...props
    },
    ref
  ) => {
    const isRange = mode === "range";
    const trackRef = React.useRef<HTMLDivElement>(null);
    const [internalValue, setInternalValue] = React.useState<number>(defaultValue);
    const [internalRange, setInternalRange] = React.useState<[number, number]>(() => {
      if (defaultRangeValue) return defaultRangeValue;
      const v = clamp(defaultValue, min, max);
      return [min, v];
    });
    const [activeThumb, setActiveThumb] = React.useState<"min" | "max" | null>(null);
    const dragRef = React.useRef<{ pointerId: number; thumb: "min" | "max" } | null>(null);

    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    const isRangeControlled = rangeValue !== undefined;
    const currentRange = isRangeControlled ? rangeValue : internalRange;
    const rangeMin = clamp(currentRange[0] ?? min, min, max);
    const rangeMax = clamp(currentRange[1] ?? max, min, max);
    const normalizedRange: [number, number] = rangeMin <= rangeMax ? [rangeMin, rangeMax] : [rangeMax, rangeMin];

    const handleSingleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = Number(e.target.value);

        if (!isControlled) {
          setInternalValue(newValue);
        }

        onChange?.(newValue);
        onValueChange?.(newValue);
      },
      [isControlled, onChange, onValueChange],
    );

    const emitRange = React.useCallback(
      (next: [number, number]) => {
        onRangeChange?.(next);
        onRangeValueChange?.(next);
      },
      [onRangeChange, onRangeValueChange],
    );

    const handleRangeChange = React.useCallback(
      (thumb: "min" | "max") => (e: React.ChangeEvent<HTMLInputElement>) => {
        const nextVal = Number(e.target.value);
        const [curMin, curMax] = normalizedRange;

        const next: [number, number] =
          thumb === "min" ? [Math.min(nextVal, curMax), curMax] : [curMin, Math.max(nextVal, curMin)];

        if (!isRangeControlled) setInternalRange(next);
        emitRange(next);
      },
      [emitRange, isRangeControlled, normalizedRange],
    );

    // Calculate the percentage for visual feedback
    const denom = Math.max(1e-9, max - min);
    const percentage = ((currentValue - min) / denom) * 100;
    const rangeStartPct = ((normalizedRange[0] - min) / denom) * 100;
    const rangeEndPct = ((normalizedRange[1] - min) / denom) * 100;

    const sizeStyles = SIZE_STYLES[size];

    const displayValue = React.useMemo(() => {
      if (isRange) {
        const a = formatValue ? formatValue(normalizedRange[0]) : normalizedRange[0].toString();
        const b = formatValue ? formatValue(normalizedRange[1]) : normalizedRange[1].toString();
        return `${a} – ${b}`;
      }
      return formatValue ? formatValue(currentValue) : currentValue.toString();
    }, [currentValue, formatValue, isRange, normalizedRange]);

    const quantize = React.useCallback(
      (v: number) => {
        const stepped = Math.round((v - min) / step) * step + min;
        // avoid floating point drift
        const fixed = Number(stepped.toFixed(10));
        return clamp(fixed, min, max);
      },
      [max, min, step],
    );

    const valueFromClientX = React.useCallback(
      (clientX: number) => {
        const el = trackRef.current;
        if (!el) return min;
        const rect = el.getBoundingClientRect();
        const x = clamp(clientX - rect.left, 0, rect.width);
        const ratio = rect.width <= 0 ? 0 : x / rect.width;
        return quantize(min + ratio * (max - min));
      },
      [max, min, quantize],
    );

    const startRangeDrag = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isRange) return;
      if (disabled) return;
      if (orientation !== "horizontal") return;
      if (e.button !== 0) return;
      const nextValue = valueFromClientX(e.clientX);
      const [curMin, curMax] = normalizedRange;
      const distToMin = Math.abs(nextValue - curMin);
      const distToMax = Math.abs(nextValue - curMax);
      const thumb: "min" | "max" = distToMin <= distToMax ? "min" : "max";

      setActiveThumb(thumb);
      dragRef.current = { pointerId: e.pointerId, thumb };
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }

      const next: [number, number] =
        thumb === "min" ? [Math.min(nextValue, curMax), curMax] : [curMin, Math.max(nextValue, curMin)];
      if (!isRangeControlled) setInternalRange(next);
      emitRange(next);
    };

    const moveRangeDrag = (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag) return;
      if (e.pointerId !== drag.pointerId) return;
      const nextValue = valueFromClientX(e.clientX);
      const [curMin, curMax] = normalizedRange;
      const next: [number, number] =
        drag.thumb === "min" ? [Math.min(nextValue, curMax), curMax] : [curMin, Math.max(nextValue, curMin)];
      if (!isRangeControlled) setInternalRange(next);
      emitRange(next);
    };

    const endRangeDrag = (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag) return;
      if (e.pointerId !== drag.pointerId) return;
      dragRef.current = null;
      onMouseUp?.();
      onTouchEnd?.();
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    };

    if (orientation === "vertical") {
      // Vertical slider implementation would go here
      // For now, defaulting to horizontal
    }

    return (
      <div className={cn("w-full space-y-2", containerClassName)}>
        {/* Label and value display */}
        {(label || showValue) && (
          <div className="flex items-center justify-between">
            {label && <label className={cn("text-sm font-medium text-foreground", labelClassName)}>{label}</label>}
            {showValue && <span className={cn("text-xs font-mono text-muted-foreground min-w-8 text-right", valueClassName)}>{displayValue}</span>}
          </div>
        )}

        {/* Slider container */}
        <div ref={trackRef} className={cn("relative flex items-center", sizeStyles.container)}>
          {/* Track background */}
          <div className={cn("w-full rounded-full bg-secondary relative overflow-hidden", sizeStyles.track, trackClassName)}>
            {/* Progress fill */}
            {isRange ? (
              <div
                className="absolute top-0 h-full bg-primary rounded-full"
                style={{ left: `${rangeStartPct}%`, width: `${Math.max(0, rangeEndPct - rangeStartPct)}%` }}
              />
            ) : (
              <div className="absolute left-0 top-0 h-full bg-primary rounded-full" style={{ width: `${percentage}%` }} />
            )}
          </div>

          {/* Actual input element */}
          {(() => {
            const baseInputClassName = cn(
              // Base styles
              "absolute w-full h-full appearance-none bg-transparent cursor-pointer",
              !noFocus && "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-full",
              noFocus && "outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none",

              // Webkit styles for thumb
              "[&::-webkit-slider-thumb]:appearance-none",
              "[&::-webkit-slider-thumb]:bg-primary",
              "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background",
              "[&::-webkit-slider-thumb]:rounded-full",
              "[&::-webkit-slider-thumb]:shadow-md",
              "[&::-webkit-slider-thumb]:cursor-pointer",
              "[&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-150",
              size === "sm" && "[&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3",
              size === "md" && "[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4",
              size === "lg" && "[&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5",

              // Firefox styles for thumb
              "[&::-moz-range-thumb]:bg-primary",
              "[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background",
              "[&::-moz-range-thumb]:rounded-full",
              "[&::-moz-range-thumb]:shadow-md",
              "[&::-moz-range-thumb]:cursor-pointer",
              "[&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:duration-150",
              size === "sm" && "[&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3",
              size === "md" && "[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4",
              size === "lg" && "[&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5",

              // Remove default track in Firefox
              "[&::-moz-range-track]:bg-transparent",
              "[&::-moz-range-track]:border-transparent",

              // Hover effects
              "hover:[&::-webkit-slider-thumb]:scale-110 hover:[&::-webkit-slider-thumb]:shadow-lg",
              "hover:[&::-moz-range-thumb]:scale-110 hover:[&::-moz-range-thumb]:shadow-lg",

              // Disabled styles
              disabled && [
                "cursor-not-allowed opacity-50",
                "[&::-webkit-slider-thumb]:cursor-not-allowed [&::-webkit-slider-thumb]:opacity-50",
                "[&::-moz-range-thumb]:cursor-not-allowed [&::-moz-range-thumb]:opacity-50",
              ],

              className,
              thumbClassName,
            );

            if (!isRange) {
              return (
                <input
                  ref={ref}
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={currentValue}
                  onChange={handleSingleChange}
                  onMouseUp={onMouseUp}
                  onTouchEnd={onTouchEnd}
                  disabled={disabled}
                  className={baseInputClassName}
                  {...props}
                />
              );
            }

            const minZ = activeThumb === "min" ? "z-20" : "z-10";
            const maxZ = activeThumb === "max" ? "z-20" : "z-10";

            return (
              <>
                {/* Pointer overlay for independent thumb dragging (mouse/touch) */}
                <div
                  className={cn("absolute inset-0 z-30", disabled ? "cursor-not-allowed" : "cursor-pointer")}
                  onPointerDown={startRangeDrag}
                  onPointerMove={moveRangeDrag}
                  onPointerUp={endRangeDrag}
                  onPointerCancel={endRangeDrag}
                />
                <input
                  ref={ref}
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={normalizedRange[0]}
                  onChange={handleRangeChange("min")}
                  onMouseUp={onMouseUp}
                  onTouchEnd={onTouchEnd}
                  disabled={disabled}
                  aria-label="Minimum value"
                  onPointerDown={() => setActiveThumb("min")}
                  onFocus={() => setActiveThumb("min")}
                  className={cn(baseInputClassName, minZ, "pointer-events-none")}
                  {...props}
                />
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={normalizedRange[1]}
                  onChange={handleRangeChange("max")}
                  onMouseUp={onMouseUp}
                  onTouchEnd={onTouchEnd}
                  disabled={disabled}
                  aria-label="Maximum value"
                  onPointerDown={() => setActiveThumb("max")}
                  onFocus={() => setActiveThumb("max")}
                  className={cn(baseInputClassName, maxZ, "pointer-events-none")}
                  {...props}
                />
              </>
            );
          })()}
        </div>
      </div>
    );
  }
);

Slider.displayName = "Slider";

export { Slider };
export type { SliderProps };
