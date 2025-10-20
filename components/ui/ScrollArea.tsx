import { cn } from "@/lib/utils/cn";
import { forwardRef, HTMLAttributes } from "react";

interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

// Wrap the scrollable viewport in an overflow-hidden container so rounded corners
// cleanly clip the scrollbar at the edges.
export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("relative overflow-hidden bg-background", className)} {...props}>
      <div className={cn("h-full w-full overflow-y-auto scroll-area-viewport")}>{children}</div>
    </div>
  );
});

ScrollArea.displayName = "ScrollArea";
