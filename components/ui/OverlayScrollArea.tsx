"use client";

import React, { forwardRef, useRef } from "react";
import { cn } from "@/lib/utils/cn";
import { useOverlayScrollbarTarget, type UseOverlayScrollbarTargetOptions } from "@/components/ui/OverlayScrollbarProvider";

export interface OverlayScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  viewportClassName?: string;
  viewportProps?: React.HTMLAttributes<HTMLDivElement>;
  enabled?: boolean;
  overlayScrollbarOptions?: Omit<UseOverlayScrollbarTargetOptions, "enabled">;
}

export const OverlayScrollArea = forwardRef<HTMLDivElement, OverlayScrollAreaProps>(
  ({ className, viewportClassName, viewportProps, enabled = true, overlayScrollbarOptions, children, ...props }, ref) => {
    const viewportRef = useRef<HTMLDivElement>(null);

    useOverlayScrollbarTarget(viewportRef, {
      enabled,
      ...overlayScrollbarOptions,
    });

    return (
      <div ref={ref} className={cn("relative overflow-hidden", className)} {...props}>
        <div
          ref={viewportRef}
          {...viewportProps}
          className={cn("h-full w-full overflow-auto", viewportClassName, viewportProps?.className)}
        >
          {children}
        </div>
      </div>
    );
  },
);

OverlayScrollArea.displayName = "OverlayScrollArea";

export default OverlayScrollArea;
