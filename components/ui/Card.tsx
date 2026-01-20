"use client";
// components/ui/Card.tsx
import React, { useState } from "react";
import { cn } from "@/lib/utils/cn";

// Helper to detect padding classes per direction
const getPaddingInfo = (className?: string) => {
  if (!className) return { hasAll: false, hasX: false, hasY: false };

  // Check for all-direction padding (p-)
  const hasAll = /\b(p)-\d+|\b(p)-\[/.test(className) || /\bmd:p-|lg:p-|sm:p-|xl:p-/.test(className);

  // Check for X-axis padding (px-, pl-, pr-, ps-, pe-)
  const hasX = /\b(px|pl|pr|ps|pe)-/.test(className);

  // Check for Y-axis padding (py-, pt-, pb-)
  const hasY = /\b(py|pt|pb)-/.test(className);

  return { hasAll, hasX, hasY };
};

interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  hoverable?: boolean;
  clickable?: boolean;
  innerClassName?: string; // class for inner rounded wrapper
  contentClassName?: string; // class for content wrapper (if padding class provided, overrides default)
  noPadding?: boolean; // remove default body padding
}

const Card = ({
  title,
  description,
  children,
  footer,
  className,
  hoverable = false,
  clickable = false,
  innerClassName,
  contentClassName,
  noPadding = false,
  onClick,
  ...rest
}: CardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        "rounded-2xl md:rounded-3xl bg-card text-card-foreground transition-[transform,box-shadow,border-color,background-color] duration-300 ease-soft",
        "shadow-sm md:hover:shadow-md mx-2 md:mx-0 border border-border",
        hoverable && "md:hover:-translate-y-0.5 md:hover:border-primary/15",
        clickable && "cursor-pointer active:translate-y-px md:hover:bg-accent/5",
        "backdrop-blur-sm",
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      {...rest}
    >
      <div className={cn("relative overflow-hidden rounded-2xl md:rounded-3xl", innerClassName)}>
        {(hoverable || clickable) && (
          <div
            className={cn(
              "absolute inset-0 bg-linear-to-br from-primary/5 to-transparent transition-opacity duration-300",
              isHovered ? "opacity-100" : "opacity-0",
            )}
          />
        )}

        {(title || description) && (
          <div className="relative flex flex-col space-y-2 p-4 md:p-6">
            {title && (
              <h3
                className={cn(
                  "text-base md:text-lg font-semibold leading-none tracking-tight transition-colors duration-200",
                  isHovered && hoverable && "text-primary",
                )}
              >
                {title}
              </h3>
            )}
            {description && <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{description}</p>}
          </div>
        )}

        {children &&
          (() => {
            const padding = getPaddingInfo(contentClassName);
            const skipAllPadding = noPadding || padding.hasAll;
            // Default X: px-4 md:px-6, Default Y: pt-0 pb-4 md:pb-6
            const defaultPaddingX = !skipAllPadding && !padding.hasX ? "px-4 md:px-6" : "";
            const defaultPaddingY = !skipAllPadding && !padding.hasY ? "pt-0 pb-4 md:pb-6" : "";

            return <div className={cn("relative", defaultPaddingX, defaultPaddingY, contentClassName)}>{children}</div>;
          })()}
        {footer && <div className="relative flex items-center p-4 md:p-6 pt-0 border-t border-border mt-4">{footer}</div>}
      </div>
    </div>
  );
};

export default Card;
