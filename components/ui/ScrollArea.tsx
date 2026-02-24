"use client";

import { cn } from "@/lib/utils/cn";
import { forwardRef, type HTMLAttributes, useRef } from "react";
import { useOverlayScrollbarTarget } from "@/components/ui/OverlayScrollbarProvider";

interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  /** Content area class name */
  contentClassName?: string;
  variant?: "default" | "muted" | "primary" | "accent";
  /** Show thin border like Card */
  outlined?: boolean;
  /** Enable OverlayScrollbars for this scroll viewport. Default: false */
  useOverlayScrollbar?: boolean;
}

const variantClasses = {
  default: "bg-background",
  muted: "bg-muted/30",
  primary: "bg-primary/5",
  accent: "bg-accent/10",
};

// Wrap the scrollable viewport in an overflow-hidden container so rounded corners
// cleanly clip the scrollbar at the edges.
// Note: No default padding - use className or contentClassName to add padding as needed.
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, contentClassName, children, variant = "default", outlined = false, useOverlayScrollbar = false, ...props }, ref) => {
    const viewportRef = useRef<HTMLDivElement>(null);

    useOverlayScrollbarTarget(viewportRef, { enabled: useOverlayScrollbar });

    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-2xl md:rounded-3xl",
          variantClasses[variant],
          outlined && "border border-border/60",
          className,
        )}
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
