"use client";
// components/ui/Card.tsx
import React, { useState } from "react";
import { cn } from "@/lib/utils/cn";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  hoverable?: boolean;
  clickable?: boolean;
  innerClassName?: string; // class for inner rounded wrapper
  contentClassName?: string; // class for content wrapper
  noPadding?: boolean; // remove default body padding
}

const Card = ({ title, description, children, footer, className, hoverable = false, clickable = false, innerClassName, contentClassName, noPadding = false, onClick, ...rest }: CardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        "rounded-lg md:rounded-xl bg-card text-card-foreground transition-all duration-300 ease-soft",
        "shadow-sm md:hover:shadow-md mx-2 md:mx-0 border border-border",
        hoverable && "md:hover:-translate-y-0.5 md:hover:border-primary/15",
        clickable && "cursor-pointer active:translate-y-px md:hover:bg-accent/5",
        "backdrop-blur-sm",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      {...rest}
    >
      <div className={cn("relative overflow-hidden rounded-xl", innerClassName)}>
        {(hoverable || clickable) && (
          <div
            className={cn(
              "absolute inset-0 bg-linear-to-br from-primary/5 to-transparent transition-opacity duration-300",
              isHovered ? "opacity-100" : "opacity-0"
            )}
          />
        )}

        {(title || description) && (
          <div className="relative flex flex-col space-y-2 p-4 md:p-6">
            {title && (
              <h3
                className={cn(
                  "text-base md:text-lg font-semibold leading-none tracking-tight transition-colors duration-200",
                  isHovered && hoverable && "text-primary"
                )}
              >
                {title}
              </h3>
            )}
            {description && <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{description}</p>}
          </div>
        )}

        {children && (
          <div className={cn("relative p-4 md:p-6 pt-0", noPadding && "p-0", contentClassName)}>
            {children}
          </div>
        )}

        {footer && <div className="relative flex items-center p-4 md:p-6 pt-0 border-t border-border mt-4">{footer}</div>}
      </div>
    </div>
  );
};

export default Card;
