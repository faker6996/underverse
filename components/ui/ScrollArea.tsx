import { cn } from "@/lib/utils/cn";
import { forwardRef, HTMLAttributes } from "react";

interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  /** Content area class name */
  contentClassName?: string;
  variant?: "default" | "muted" | "primary" | "accent";
  spacing?: "none" | "sm" | "md" | "lg" | "xl";
  /** Full width mode (no container constraints) */
  fullWidth?: boolean;
  /** Show thin border like Card */
  outlined?: boolean;
}

const variantClasses = {
  default: "bg-background",
  muted: "bg-muted/30",
  primary: "bg-primary/5",
  accent: "bg-accent/10",
};

const spacingClasses = {
  none: "",
  sm: "p-2",
  md: "p-4",
  lg: "p-6",
  xl: "p-8",
};

// Wrap the scrollable viewport in an overflow-hidden container so rounded corners
// cleanly clip the scrollbar at the edges.
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, contentClassName, children, variant = "default", spacing = "none", fullWidth = true, outlined = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("relative overflow-hidden", variantClasses[variant], outlined && "rounded-lg border border-border/60", className)}
        {...props}
      >
        <div
          className={cn(
            "h-full w-full overflow-y-auto scroll-area-viewport",
            spacingClasses[spacing],
            !fullWidth && "container mx-auto px-4 md:px-6",
            contentClassName,
          )}
        >
          {children}
        </div>
      </div>
    );
  },
);

ScrollArea.displayName = "ScrollArea";
