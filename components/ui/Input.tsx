// components/ui/Input.tsx
"use client";

import React, { forwardRef, InputHTMLAttributes, useId, useState } from "react";
import { useTranslations } from "@/lib/i18n/translation-adapter";
import { cn } from "@/lib/utils/cn";
import { Eye, EyeOff, Search, X, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  description?: string;
  variant?: "default" | "filled" | "outlined" | "minimal";
  size?: "sm" | "md" | "lg";
  leftIcon?: React.ComponentType<{ className?: string }>;
  rightIcon?: React.ComponentType<{ className?: string }>;
  clearable?: boolean;
  loading?: boolean;
  success?: boolean;
  onClear?: () => void;
  hint?: string;
  counter?: boolean;
  maxLength?: number;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      description,
      className,
      required,
      variant = "default",
      size = "md",
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      clearable = false,
      loading = false,
      success = false,
      onClear,
      hint,
      counter = false,
      type = "text",
      value,
      maxLength,
      ...rest
    },
    ref,
  ) => {
    const [localError, setLocalError] = useState<string | undefined>(error);
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const tv = useTranslations("ValidationInput");
    const autoId = useId();
    // Only attach a generated id when we need to reference it (label/description/error)
    const needsId = !!(label || description || hint || error);
    const resolvedId = (rest.id as string) || (needsId ? `input-${autoId}` : undefined);

    const errMsg = error || localError;
    const hasValue = value !== undefined && value !== null && value !== "";
    const charCount = typeof value === "string" ? value.length : 0;
    const errorId = errMsg && resolvedId ? `${resolvedId}-error` : undefined;
    const descId = !errMsg && (description || hint) && resolvedId ? `${resolvedId}-desc` : undefined;
    const containerSpacing = size === "sm" ? "space-y-1.5" : "space-y-2";

    // Variant styles
    const variantStyles = {
      default: {
        container: "bg-background border border-input hover:border-accent-foreground/20",
        focus:
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background focus-visible:border-transparent",
        error:
          "border-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-destructive focus-visible:ring-offset-1 focus-visible:ring-offset-background focus-visible:border-transparent",
      },
      filled: {
        container: "bg-muted/50 border border-transparent hover:bg-muted/70",
        focus:
          "focus-visible:outline-none focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background focus-visible:border-transparent",
        error:
          "bg-destructive/10 border-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-destructive focus-visible:ring-offset-1 focus-visible:ring-offset-background focus-visible:border-transparent",
      },
      outlined: {
        container: "bg-transparent border border-border hover:border-accent-foreground/30",
        focus:
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background focus-visible:border-transparent",
        error:
          "border-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-destructive focus-visible:ring-offset-1 focus-visible:ring-offset-background focus-visible:border-transparent",
      },
      minimal: {
        container: "bg-transparent border-0 border-b border-border hover:border-accent-foreground/30",
        focus: "focus-visible:outline-none focus-visible:border-ring focus-visible:ring-0 rounded-none",
        error: "border-destructive focus-visible:outline-none focus-visible:border-destructive",
      },
    };

    // Size styles
    const sizeStyles = {
      sm: {
        input: "px-3 py-1.5 text-sm h-8 md:h-7 md:py-1 md:text-xs",
        icon: "w-4 h-4",
        button: "h-7 w-7",
      },
      md: {
        input: "px-4 py-2 text-sm h-10",
        icon: "w-5 h-5",
        button: "h-8 w-8",
      },
      lg: {
        input: "px-5 py-4 text-base h-12",
        icon: "w-6 h-6",
        button: "h-10 w-10",
      },
    };

    const getErrorKey = (v: ValidityState) => {
      if (v.valueMissing) return "required";
      if (v.typeMismatch) return "typeMismatch";
      if (v.patternMismatch) return "pattern";
      if (v.tooShort) return "tooShort";
      if (v.tooLong) return "tooLong";
      if (v.rangeUnderflow) return "rangeUnderflow";
      if (v.rangeOverflow) return "rangeOverflow";
      if (v.stepMismatch) return "stepMismatch";
      if (v.badInput) return "badInput";
      return "invalid";
    };

    // Status icon
    const getStatusIcon = () => {
      if (loading) return <Loader2 className={cn("animate-spin text-muted-foreground", sizeStyles[size].icon)} />;
      if (success) return <CheckCircle className={cn("text-success", sizeStyles[size].icon)} />;
      if (errMsg) return <AlertCircle className={cn("text-destructive", sizeStyles[size].icon)} />;
      return null;
    };

    // Password toggle for password inputs
    const showPasswordToggle = type === "password";
    const actualType = showPasswordToggle && showPassword ? "text" : type;

    // Extract handlers and disabled state
    const { onFocus: onFocusProp, onBlur: onBlurProp, disabled } = rest;

    // Filter out custom props to create clean HTML attributes
    const {
      label: _label,
      error: _error,
      description: _description,
      variant: _variant,
      size: _size,
      leftIcon: _leftIcon,
      rightIcon: _rightIcon,
      clearable: _clearable,
      loading: _loading,
      success: _success,
      onClear: _onClear,
      hint: _hint,
      counter: _counter,
      ...restInput
    } = rest as any;

    const handleFocus: React.FocusEventHandler<HTMLInputElement> = (e) => {
      setIsFocused(true);
      onFocusProp?.(e);
    };

    const handleBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
      setIsFocused(false);
      onBlurProp?.(e);
    };

    // Radius by size for visual consistency with Combobox/DatePicker
    const radiusClass = size === "sm" ? "rounded-lg" : "rounded-xl";

    return (
      <div className={cn("w-full group", containerSpacing)}>
        {/* Label */}
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={resolvedId}
              className={cn(
                // Label size follows input size
                size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm",
                "font-medium transition-colors duration-200",
                // default color and highlight while any descendant focused
                disabled ? "text-muted-foreground" : cn("text-foreground group-focus-within:text-primary", success && "text-primary"),
                errMsg && "text-destructive",
              )}
            >
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </label>

            {counter && maxLength && (
              <span
                className={cn(
                  "text-xs transition-colors duration-200",
                  charCount > maxLength * 0.9 ? "text-warning" : "text-muted-foreground",
                  charCount >= maxLength && "text-destructive",
                )}
              >
                {charCount}/{maxLength}
              </span>
            )}
          </div>
        )}

        {/* Input Container */}
        <div className="relative group">
          {/* Left Icon */}
          {LeftIcon && (
            <div
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 z-10",
                "text-muted-foreground transition-colors duration-200",
                // highlight icon when input (or controls) focused
                "group-focus-within:text-primary",
              )}
            >
              <LeftIcon className={sizeStyles[size].icon} />
            </div>
          )}

          <input
            ref={ref}
            type={actualType}
            // NOTE: Only controlled when `value` prop is provided.
            {...(value !== undefined ? { value } : {})}
            maxLength={maxLength}
            required={required}
            id={resolvedId}
            autoComplete={type === "password" ? "current-password" : type === "email" ? "email" : rest.autoComplete}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onInvalid={(e) => {
              e.preventDefault();
              const key = getErrorKey(e.currentTarget.validity);
              setLocalError(tv(key));
            }}
            onInput={() => setLocalError(undefined)}
            aria-invalid={!!errMsg}
            aria-describedby={[errorId, descId].filter(Boolean).join(" ") || undefined}
            className={cn(
              "w-full text-foreground transition-all duration-200 ease-out",
              "placeholder:text-muted-foreground focus:outline-none focus-visible:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",

              // Size styles
              sizeStyles[size].input,
              radiusClass,

              // Icon padding adjustments
              LeftIcon && "pl-10",
              (RightIcon || showPasswordToggle || clearable || loading || success || errMsg) && "pr-10",

              // Variant styles
              variantStyles[variant].container,
              errMsg ? variantStyles[variant].error : variantStyles[variant].focus,

              // Reduce visual weight for sm: no default drop shadows
              size !== "sm" && variant !== "minimal" && "shadow-sm",
              size !== "sm" && isFocused && "shadow-md",

              className,
            )}
            disabled={disabled}
            {...restInput}
          />

          {/* Right Icons */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {/* Status Icon */}
            {getStatusIcon()}

            {/* Custom Right Icon */}
            {RightIcon && !loading && !success && !errMsg && <RightIcon className={cn("text-muted-foreground", sizeStyles[size].icon)} />}

            {/* Clear Button */}
            {clearable && hasValue && !loading && (
              <button
                type="button"
                onClick={() => {
                  if (onClear) return onClear();
                  (rest.onChange as any)?.({ target: { value: "" } });
                }}
                className={cn(
                  "flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-sm",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  "active:bg-accent active:text-accent-foreground",
                  sizeStyles[size].button,
                )}
                tabIndex={0}
                aria-label="Clear input"
              >
                <X className={sizeStyles[size].icon} />
              </button>
            )}

            {/* Password Toggle */}
            {showPasswordToggle && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={cn(
                  "flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors rounded-full",
                  "focus:outline-none focus-visible:ring-1 focus-visible:ring-ring/40",
                  "active:bg-accent/50 active:text-accent-foreground",
                  sizeStyles[size].button,
                )}
                tabIndex={0}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className={sizeStyles[size].icon} /> : <Eye className={sizeStyles[size].icon} />}
              </button>
            )}
          </div>

          {/* Focus Indicator for minimal variant */}
          {variant === "minimal" && (
            <div
              className={cn(
                "absolute bottom-0 left-0 h-0.5 bg-linear-to-r from-primary to-primary/60 transition-all duration-300",
                // default hidden
                "w-0 opacity-0",
                // expand underline when focused within input container
                "group-focus-within:w-full group-focus-within:opacity-100",
              )}
            />
          )}
        </div>

        {/* Error Message */}
        {errMsg ? (
          <div id={errorId} className="flex items-center gap-2 text-sm text-destructive animate-in slide-in-from-top-1 duration-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errMsg}</span>
          </div>
        ) : null}

        {/* Description/Hint */}
        {(description || hint) && !errMsg && (
          <p
            id={descId}
            className={cn(
              "text-xs transition-colors duration-200",
              // follow focus state of the whole field area
              "text-muted-foreground group-focus-within:text-primary/70",
            )}
          >
            {hint || description}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

// Search Input - specialized for search functionality
interface SearchInputProps extends Omit<InputProps, "leftIcon" | "type"> {
  onSearch?: (value: string) => void;
  searchDelay?: number;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, searchDelay = 300, placeholder = "Search…", ...props }, ref) => {
    const [searchValue, setSearchValue] = useState(props.value || "");

    // Debounced search
    React.useEffect(() => {
      if (!onSearch) return;

      const timer = setTimeout(() => {
        onSearch(searchValue as string);
      }, searchDelay);

      return () => clearTimeout(timer);
    }, [searchValue, onSearch, searchDelay]);

    return (
      <Input
        ref={ref}
        type="search"
        leftIcon={Search}
        placeholder={placeholder}
        clearable
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onClear={() => setSearchValue("")}
        {...props}
      />
    );
  },
);

SearchInput.displayName = "SearchInput";

// Password Input - enhanced password field
interface PasswordInputProps extends Omit<InputProps, "type"> {
  showStrength?: boolean;
  strengthLabels?: string[];
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showStrength = false, strengthLabels = ["Weak", "Fair", "Good", "Strong"], ...props }, ref) => {
    const getPasswordStrength = (password: string): number => {
      let score = 0;
      if (password.length >= 8) score++;
      if (/[a-z]/.test(password)) score++;
      if (/[A-Z]/.test(password)) score++;
      if (/[0-9]/.test(password)) score++;
      if (/[^A-Za-z0-9]/.test(password)) score++;
      return Math.min(score, 4);
    };

    const strength = showStrength && typeof props.value === "string" ? getPasswordStrength(props.value) : 0;
    const strengthColors = ["bg-destructive", "bg-warning", "bg-warning", "bg-success"];
    const strengthLabel = strengthLabels[strength - 1];

    return (
      <div className="space-y-2">
        <Input ref={ref} type="password" {...props} />

        {showStrength && props.value && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors duration-300",
                    level <= strength ? strengthColors[strength - 1] : "bg-muted",
                  )}
                />
              ))}
            </div>
            {strengthLabel && (
              <p
                className={cn(
                  "text-xs font-medium",
                  strength <= 1 ? "text-destructive" : strength <= 2 ? "text-warning" : strength <= 3 ? "text-warning" : "text-success",
                )}
              >
                {strengthLabel}
              </p>
            )}
          </div>
        )}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

// Number Input - enhanced numeric input
interface NumberInputProps extends Omit<InputProps, "type" | "value" | "onChange"> {
  min?: number;
  max?: number;
  step?: number;
  showSteppers?: boolean;
  onIncrement?: () => void;
  onDecrement?: () => void;
  formatThousands?: boolean;
  locale?: string;
  value?: number | string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    { min, max, step = 1, showSteppers = true, onIncrement, onDecrement, formatThousands = false, locale = "vi-VN", value, onChange, ...props },
    ref,
  ) => {
    const toNumber = (v: any): number => {
      if (v === "" || v === undefined || v === null) return 0;
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    const format = React.useCallback((n: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(n), [locale]);

    const parse = (s: string) => {
      // Remove all non-digits; treat empty as NaN
      const digits = (s || "").replace(/\D+/g, "");
      return digits ? Number(digits) : NaN;
    };

    const [displayValue, setDisplayValue] = React.useState<string>(
      formatThousands ? (value !== undefined && value !== null && value !== "" ? format(toNumber(value)) : "") : String(value ?? ""),
    );

    const currentValue = toNumber(value);

    React.useEffect(() => {
      if (formatThousands) {
        const next = value === "" || value === undefined || value === null ? "" : format(toNumber(value));
        setDisplayValue((prev) => (prev === next ? prev : next));
      } else {
        const next = String(value ?? "");
        setDisplayValue((prev) => (prev === next ? prev : next));
      }
    }, [value, formatThousands, locale, format]);

    const handleIncrement = () => {
      if (onIncrement) {
        onIncrement();
      } else if (onChange) {
        const newValue = Math.min(currentValue + step, max ?? Infinity);
        if (formatThousands) setDisplayValue(format(newValue));
        onChange({ target: { value: newValue.toString() } } as any);
      }
    };

    const handleDecrement = () => {
      if (onDecrement) {
        onDecrement();
      } else if (onChange) {
        const newValue = Math.max(currentValue - step, min ?? -Infinity);
        if (formatThousands) setDisplayValue(format(newValue));
        onChange({ target: { value: newValue.toString() } } as any);
      }
    };

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={formatThousands ? "text" : "number"}
          min={min}
          max={max}
          step={step}
          rightIcon={showSteppers ? undefined : props.rightIcon}
          value={displayValue}
          onChange={(e) => {
            if (!onChange) return;
            if (!formatThousands) return onChange(e);
            const raw = e.target.value;
            const parsed = parse(raw);
            if (Number.isNaN(parsed)) {
              setDisplayValue("");
              onChange({ target: { value: "" } } as any);
            } else {
              const bounded = Math.min(Math.max(parsed, min ?? -Infinity), max ?? Infinity);
              setDisplayValue(format(bounded));
              onChange({ target: { value: bounded.toString() } } as any);
            }
          }}
          {...props}
          className={cn(
            showSteppers && [
              "pr-12",
              // Hide native browser steppers
              "[&::-webkit-outer-spin-button]:appearance-none",
              "[&::-webkit-inner-spin-button]:appearance-none",
              "[&::-webkit-inner-spin-button]:m-0",
              "appearance-none",
            ],
            props.className,
          )}
        />
        {showSteppers && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
            <button
              type="button"
              onClick={handleIncrement}
              disabled={max !== undefined && currentValue >= max}
              className={cn(
                "flex items-center justify-center w-4 h-4 rounded-sm transition-colors",
                "hover:bg-accent focus:outline-none focus:bg-accent",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent",
                "text-muted-foreground hover:text-foreground",
              )}
              aria-label="Increase value"
            >
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="shrink-0">
                <path d="M4 2L6 6H2L4 2Z" fill="currentColor" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleDecrement}
              disabled={min !== undefined && currentValue <= min}
              className={cn(
                "flex items-center justify-center w-4 h-4 rounded-sm transition-colors",
                "hover:bg-accent focus:outline-none focus:bg-accent",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent",
                "text-muted-foreground hover:text-foreground",
              )}
              aria-label="Decrease value"
            >
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" className="shrink-0">
                <path d="M4 6L2 2H6L4 6Z" fill="currentColor" />
              </svg>
            </button>
          </div>
        )}
      </div>
    );
  },
);

NumberInput.displayName = "NumberInput";

// Textarea - multi-line text input
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  description?: string;
  variant?: "default" | "filled" | "outlined" | "minimal";
  resize?: "none" | "vertical" | "horizontal" | "both";
  counter?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, error, description, variant = "default", resize = "vertical", counter = false, className, required, value, maxLength, ...props },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const charCount = typeof value === "string" ? value.length : 0;

    const variantStyles = {
      default:
        "bg-background border border-input hover:border-accent-foreground/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background focus-visible:border-transparent",
      filled:
        "bg-muted/50 border border-transparent hover:bg-muted/70 focus-visible:outline-none focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background focus-visible:border-transparent",
      outlined:
        "bg-transparent border border-border hover:border-accent-foreground/30 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background focus-visible:border-transparent",
      minimal:
        "bg-transparent border-0 border-b border-border hover:border-accent-foreground/30 focus-visible:outline-none focus-visible:border-ring focus-visible:ring-0 rounded-none",
    };

    const resizeClasses = {
      none: "resize-none",
      vertical: "resize-y",
      horizontal: "resize-x",
      both: "resize",
    };

    return (
      <div className="w-full space-y-2">
        {/* Label */}
        {label && (
          <div className="flex items-center justify-between">
            <label
              className={cn(
                "text-sm font-medium transition-colors duration-200",
                isFocused ? "text-primary" : "text-foreground",
                error && "text-destructive",
              )}
            >
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </label>

            {counter && maxLength && (
              <span
                className={cn(
                  "text-xs transition-colors duration-200",
                  charCount > maxLength * 0.9 ? "text-warning" : "text-muted-foreground",
                  charCount >= maxLength && "text-destructive",
                )}
              >
                {charCount}/{maxLength}
              </span>
            )}
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={ref}
          value={value}
          maxLength={maxLength}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "w-full rounded-xl px-4 py-3 text-sm text-foreground transition-all duration-200",
            "placeholder:text-muted-foreground focus:outline-none min-h-20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            variantStyles[variant],
            // DÒNG NÀY ĐÃ ĐƯỢC CẬP NHẬT:
            error &&
              "border-destructive focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-destructive focus-visible:ring-offset-1 focus-visible:ring-offset-background focus-visible:border-transparent",
            resizeClasses[resize],
            isFocused && "shadow-md",
            variant !== "minimal" && "shadow-sm",
            className,
          )}
          {...props}
        />

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive animate-in slide-in-from-top-1 duration-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Description */}
        {description && !error && (
          <p className={cn("text-xs transition-colors duration-200", isFocused ? "text-primary/70" : "text-muted-foreground")}>{description}</p>
        )}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export default Input;
