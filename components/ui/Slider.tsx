"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "size"> {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  onValueChange?: (value: number) => void; // Alternative prop name for consistency
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

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      value,
      defaultValue = 0,
      min = 0,
      max = 100,
      step = 1,
      onChange,
      onValueChange,
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
      noFocus = false,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = React.useState<number>(defaultValue);

    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value);

      if (!isControlled) {
        setInternalValue(newValue);
      }

      onChange?.(newValue);
      onValueChange?.(newValue);
    };

    // Calculate the percentage for visual feedback
    const percentage = ((currentValue - min) / (max - min)) * 100;

    const sizeStyles = SIZE_STYLES[size];

    const displayValue = formatValue ? formatValue(currentValue) : currentValue.toString();

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
            {showValue && (
              <span className={cn("text-xs font-mono text-muted-foreground min-w-[2rem] text-right", valueClassName)}>{displayValue}</span>
            )}
          </div>
        )}

        {/* Slider container */}
        <div className={cn("relative flex items-center", sizeStyles.container)}>
          {/* Track background */}
          <div className={cn("w-full rounded-full bg-secondary relative overflow-hidden", sizeStyles.track, trackClassName)}>
            {/* Progress fill */}
            <div
              className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-150 ease-out"
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Actual input element */}
          <input
            ref={ref}
            type="range"
            min={min}
            max={max}
            step={step}
            value={currentValue}
            onChange={handleChange}
            disabled={disabled}
            className={cn(
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
              thumbClassName
            )}
            {...props}
          />
        </div>
      </div>
    );
  }
);

Slider.displayName = "Slider";

export { Slider };
export type { SliderProps };
