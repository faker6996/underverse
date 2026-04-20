"use client";
// components/ui/Card.tsx
import React from "react";
import { cn } from "../utils/cn";

// Helper to detect padding classes per direction
const getPaddingInfo = (className?: string) => {
  if (!className) return { hasAll: false, hasX: false, hasY: false };

  // All-direction padding: p-*, [breakpoint]:p-* (including max-* variants)
  const hasAll = /(?:^|\s)p-[\d[]/.test(className) || /(?:^|\s)(?:\w+:)?p-[\d[]/.test(className);

  // X-axis padding: px-, pl-, pr-, ps-, pe-
  const hasX = /\b(?:\w+:)?(?:px|pl|pr|ps|pe)-/.test(className);

  // Y-axis padding: py-, pt-, pb-
  const hasY = /\b(?:\w+:)?(?:py|pt|pb)-/.test(className);

  return { hasAll, hasX, hasY };
};

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  footerClassName?: string;
  children?: React.ReactNode;
  hoverable?: boolean;
  clickable?: boolean;
  innerClassName?: string;
  contentClassName?: string;
  noPadding?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      title,
      description,
      children,
      footer,
      className,
      headerClassName,
      footerClassName,
      hoverable = false,
      clickable = false,
      innerClassName,
      contentClassName,
      noPadding = false,
      onClick,
      onKeyDown,
      role,
      tabIndex,
      ...rest
    },
    ref,
  ) => {
    const isInteractive = clickable && typeof onClick === "function";

    const padding = getPaddingInfo(contentClassName);
    const skipAllPadding = noPadding || padding.hasAll;
    const defaultPaddingX = !skipAllPadding && !padding.hasX ? "px-4 md:px-6 max-md:px-3" : "";
    const defaultPaddingY = !skipAllPadding && !padding.hasY ? "pt-0 pb-4 md:pb-6 max-md:pb-3" : "";

    return (
      <div
        ref={ref}
        className={cn(
          "group rounded-2xl md:rounded-3xl bg-card text-card-foreground transition-[transform,box-shadow,border-color,background-color] duration-300 ease-soft max-md:rounded-xl",
          "border border-border/50 shadow-sm backdrop-blur-sm",
          hoverable && "md:hover:-translate-y-0.5 md:hover:border-primary/15 md:hover:shadow-md",
          clickable && "cursor-pointer active:translate-y-px active:bg-accent/5 md:hover:bg-accent/5 md:hover:shadow-md",
          className,
        )}
        onClick={onClick}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          if (e.defaultPrevented || !isInteractive) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.currentTarget.click();
          }
        }}
        role={isInteractive ? (role ?? "button") : role}
        tabIndex={isInteractive ? (tabIndex ?? 0) : tabIndex}
        {...rest}
      >
        <div className={cn("relative overflow-hidden rounded-2xl md:rounded-3xl max-md:rounded-xl", innerClassName)}>
          {(hoverable || clickable) && (
            <div
              className={cn(
                "pointer-events-none absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300",
                "group-hover:opacity-100",
              )}
            />
          )}

          {(title || description) && (
            <div className={cn("relative flex min-w-0 flex-col space-y-2 p-4 md:p-6 max-md:space-y-1.5 max-md:p-3", headerClassName)}>
              {title && (
                <h3
                  className={cn(
                    "min-w-0 text-base md:text-lg font-semibold leading-tight tracking-tight wrap-anywhere transition-colors duration-200 max-md:text-sm",
                    hoverable && "group-hover:text-primary",
                  )}
                >
                  {title}
                </h3>
              )}
              {description && (
                <p className="min-w-0 text-sm md:text-base text-muted-foreground leading-relaxed wrap-anywhere">
                  {description}
                </p>
              )}
            </div>
          )}

          {children && <div className={cn("relative", defaultPaddingX, defaultPaddingY, contentClassName)}>{children}</div>}

          {footer && (
            <div
              className={cn(
                "relative flex items-center p-4 md:p-6 pt-0 border-t border-border/50 mt-4 max-md:mt-3 max-md:p-3 max-md:pt-0",
                footerClassName,
              )}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    );
  },
);

Card.displayName = "Card";

export default Card;
