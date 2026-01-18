"use client";

import React, { forwardRef, useCallback, useRef, useState } from "react";
import { VARIANT_STYLES_BTN, SIZE_STYLES_BTN } from "@/lib/constants/constants-ui/button";
import { cn } from "@/lib/utils/cn";
import { Activity } from "lucide-react";

// Khai báo kiểu cho props
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children?: React.ReactNode;
  type?: "button" | "submit" | "reset";
  icon?: React.ComponentType<{ className?: string }>;
  iconRight?: React.ComponentType<{ className?: string }>;
  variant?: keyof typeof VARIANT_STYLES_BTN;
  size?: keyof typeof SIZE_STYLES_BTN;
  className?: string;
  iConClassName?: string;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  title?: string;
  // Nâng cấp: tuỳ biến spinner & UX khi loading
  spinner?: React.ComponentType<{ className?: string }>;
  loadingText?: React.ReactNode;
  preserveChildrenOnLoading?: boolean; // giữ nguyên children khi loading
  // Chống double-click vô ý
  preventDoubleClick?: boolean;
  lockMs?: number; // thời gian khóa nếu onClick không trả Promise
  // Layout flexibility
  asContainer?: boolean; // cho phép children tự do layout (không force items-center)
  // Ngăn xuống dòng khiến icon nằm trên, text nằm dưới
  noWrap?: boolean; // mặc định: true
  // Tắt overlay gradient hover mặc định
  noHoverOverlay?: boolean;
  // Bật nền gradient (alias cho variant="gradient")
  gradient?: boolean;
}

// Sử dụng forwardRef để chuyển tiếp ref
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      onClick,
      children,
      type = "button",
      icon: Icon,
      iconRight: IconRight,
      variant = "default",
      size = "md",
      className = "",
      iConClassName = "",
      disabled = false,
      loading = false,
      fullWidth = false,
      title,
      spinner: Spinner,
      loadingText,
      preserveChildrenOnLoading = false,
      // custom behavior props (do not forward to DOM)
      preventDoubleClick = false,
      lockMs = 600,
      asContainer = false,
      noWrap = true,
      noHoverOverlay = false,
      gradient = false,
      ...rest
    },
    ref,
  ) => {
    const baseStyles = asContainer
      ? "relative inline-flex justify-center rounded-md font-medium transition-colors duration-150 ease-soft outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px"
      : "relative inline-flex items-center justify-center gap-2 rounded-md font-medium overflow-hidden transition-colors duration-150 ease-soft outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px";

    const finalVariant = gradient ? "gradient" : variant;
    const variantStyle = VARIANT_STYLES_BTN[finalVariant] || VARIANT_STYLES_BTN.default;
    const sizeStyle = SIZE_STYLES_BTN[size] || SIZE_STYLES_BTN.md;

    const SpinnerIcon = Spinner ?? Activity;
    const [locked, setLocked] = useState(false);
    const lockTimer = useRef<NodeJS.Timeout | null>(null);

    const handleClick = useCallback(
      async (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled || loading) return;

        if (preventDoubleClick) {
          if (locked) return;
          setLocked(true);
          try {
            const result = onClick?.(e) as unknown;
            if (result && typeof (result as any) === "object" && typeof (result as any).then === "function") {
              await (result as any);
              setLocked(false);
            } else {
              const ms = lockMs ?? 600;
              if (lockTimer.current) clearTimeout(lockTimer.current);
              lockTimer.current = setTimeout(() => setLocked(false), ms);
            }
          } catch (err) {
            setLocked(false);
            throw err;
          }
        } else {
          onClick?.(e);
        }
      },
      [disabled, loading, onClick, locked, preventDoubleClick, lockMs],
    );

    const computedDisabled = disabled || loading || (preventDoubleClick ? locked : false);

    return (
      <button
        ref={ref}
        type={type}
        onClick={handleClick}
        title={title}
        className={cn(
          baseStyles,
          variantStyle,
          sizeStyle,
          "group",
          noWrap && "whitespace-nowrap",
          {
            "cursor-pointer hover:opacity-95": !computedDisabled,
            "opacity-50 cursor-not-allowed": computedDisabled,
            "w-full": fullWidth,
          },
          className,
        )}
        disabled={computedDisabled}
        aria-disabled={computedDisabled}
        aria-busy={loading}
        data-variant={variant}
        data-size={size}
        data-locked={preventDoubleClick ? (locked ? "true" : "false") : undefined}
        aria-label={(rest as any)["aria-label"] || title}
        {...rest}
      >
        {!noHoverOverlay ? (
          <span className="absolute inset-0 bg-linear-to-r from-primary-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 dark:hidden" />
        ) : null}
        {loading ? (
          <>
            <SpinnerIcon className="w-4 h-4 animate-spin" aria-hidden="true" />
            {loadingText ? (
              <span className="ml-2" aria-live="polite">
                {loadingText}
              </span>
            ) : null}
            {preserveChildrenOnLoading && !loadingText ? (
              <span className="ml-2 opacity-70" aria-hidden>
                {children}
              </span>
            ) : null}
          </>
        ) : (
          <>
            {Icon ? <Icon className={cn("transition-transform duration-200", iConClassName ? iConClassName : "w-5 h-5")} /> : null}
            {children}
            {IconRight ? <IconRight className="w-4 h-4 transition-transform duration-200" /> : null}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
