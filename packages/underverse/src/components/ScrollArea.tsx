"use client";

import { forwardRef, type HTMLAttributes, useRef } from "react";
import { cn } from "../utils/cn";
import { useOverlayScrollbarTarget } from "./OverlayScrollbarProvider";

export interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  contentClassName?: string;
  variant?: "default" | "muted" | "primary" | "accent";
  outlined?: boolean;
  overflowHidden?: boolean;
  useOverlayScrollbar?: boolean;
}

const variantClasses = {
  default: "bg-background",
  muted: "bg-muted/30",
  primary: "bg-primary/5",
  accent: "bg-accent/10",
};

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  (
    {
      className,
      contentClassName,
      children,
      variant = "default",
      outlined = false,
      overflowHidden = true,
      useOverlayScrollbar = false,
      ...props
    },
    ref,
  ) => {
    const viewportRef = useRef<HTMLDivElement>(null);

    useOverlayScrollbarTarget(viewportRef, { enabled: useOverlayScrollbar });

    return (
      <div
        ref={ref}
        className={cn("relative", variantClasses[variant], outlined && "border border-border/60", overflowHidden && "overflow-hidden", className)}
        {...props}
      >
        <div ref={viewportRef} className={cn("h-full w-full overflow-y-auto scroll-area-viewport", contentClassName)}>
          {children}
        </div>
      </div>
    );
  },
);

ScrollArea.displayName = "ScrollArea";
