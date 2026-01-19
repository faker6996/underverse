"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";
import { useShadCNAnimations } from "@/lib/utils/shadcn-animations";

type PopoverPlacement = "top" | "bottom" | "left" | "right" | "top-start" | "bottom-start" | "top-end" | "bottom-end";

interface PopoverProps {
  trigger: React.ReactElement;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  placement?: PopoverPlacement;
  modal?: boolean;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  matchTriggerWidth?: boolean;
  contentWidth?: number; // optional fixed width
}

type Side = "top" | "bottom" | "left" | "right";
type Align = "start" | "end";

function normalizePlacement(placement: PopoverPlacement): { side: Side; align: Align } {
  switch (placement) {
    case "top":
      return { side: "top", align: "start" };
    case "bottom":
      return { side: "bottom", align: "start" };
    case "left":
      return { side: "left", align: "start" };
    case "right":
      return { side: "right", align: "start" };
    default: {
      const [side, align] = placement.split("-") as [Side, Align];
      return { side, align };
    }
  }
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function overflowAmount(left: number, width: number, viewportWidth: number, padding: number) {
  const min = padding;
  const max = viewportWidth - padding;
  const overflowLeft = Math.max(0, min - left);
  const overflowRight = Math.max(0, left + width - max);
  return overflowLeft + overflowRight;
}

function computePopoverPosition(args: {
  triggerRect: DOMRect;
  contentSize: { width: number; height: number };
  placement: PopoverPlacement;
  offset: number;
  padding: number;
  viewport: { width: number; height: number };
}): { top: number; left: number; side: Side; align: Align } {
  const { triggerRect, contentSize, placement, offset, padding, viewport } = args;
  let { side, align } = normalizePlacement(placement);

  // Flip side if the preferred side doesn't fit.
  if (side === "bottom") {
    const bottomTop = triggerRect.bottom + offset;
    const overflowsBottom = bottomTop + contentSize.height > viewport.height - padding;
    const topTop = triggerRect.top - offset - contentSize.height;
    const fitsTop = topTop >= padding;
    if (overflowsBottom && fitsTop) side = "top";
  } else if (side === "top") {
    const topTop = triggerRect.top - offset - contentSize.height;
    const overflowsTop = topTop < padding;
    const bottomTop = triggerRect.bottom + offset;
    const fitsBottom = bottomTop + contentSize.height <= viewport.height - padding;
    if (overflowsTop && fitsBottom) side = "bottom";
  } else if (side === "right") {
    const rightLeft = triggerRect.right + offset;
    const overflowsRight = rightLeft + contentSize.width > viewport.width - padding;
    const leftLeft = triggerRect.left - offset - contentSize.width;
    const fitsLeft = leftLeft >= padding;
    if (overflowsRight && fitsLeft) side = "left";
  } else if (side === "left") {
    const leftLeft = triggerRect.left - offset - contentSize.width;
    const overflowsLeft = leftLeft < padding;
    const rightLeft = triggerRect.right + offset;
    const fitsRight = rightLeft + contentSize.width <= viewport.width - padding;
    if (overflowsLeft && fitsRight) side = "right";
  }

  let top = 0;
  let left = 0;

  if (side === "top" || side === "bottom") {
    const leftStart = triggerRect.left;
    const leftEnd = triggerRect.right - contentSize.width;

    // If requested align overflows, choose the alternative align if it fits better.
    const startOverflow = overflowAmount(leftStart, contentSize.width, viewport.width, padding);
    const endOverflow = overflowAmount(leftEnd, contentSize.width, viewport.width, padding);
    if (align === "start" && startOverflow > 0 && endOverflow < startOverflow) align = "end";
    if (align === "end" && endOverflow > 0 && startOverflow < endOverflow) align = "start";

    left = align === "end" ? leftEnd : leftStart;
    top = side === "top" ? triggerRect.top - offset - contentSize.height : triggerRect.bottom + offset;

    left = clamp(left, padding, viewport.width - contentSize.width - padding);
    top = clamp(top, padding, viewport.height - contentSize.height - padding);

    return { top, left, side, align };
  }

  // Left/right placements: align to trigger top by default and clamp to viewport.
  top = triggerRect.top;
  left = side === "left" ? triggerRect.left - offset - contentSize.width : triggerRect.right + offset;
  left = clamp(left, padding, viewport.width - contentSize.width - padding);
  top = clamp(top, padding, viewport.height - contentSize.height - padding);

  return { top, left, side, align };
}

export const Popover: React.FC<PopoverProps> = ({
  trigger,
  children, 
  className,
  contentClassName,
  placement = "bottom",
  modal = false,
  disabled = false,
  open,
  onOpenChange,
  matchTriggerWidth = false,
  contentWidth
}) => {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [dropdownPosition, setDropdownPosition] = React.useState<{ top: number; left: number; side: Side; align: Align } | null>(null);
  const [lastTriggerRect, setLastTriggerRect] = React.useState<Pick<DOMRect, "width"> | null>(null);
  const triggerRef = React.useRef<HTMLElement>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  // Inject ShadCN animations
  useShadCNAnimations();

  const isOpen = isControlled ? (open as boolean) : internalOpen;
  const setIsOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const offset = 4;
  const padding = 8;

  const renderedWidth = matchTriggerWidth ? lastTriggerRect?.width : contentWidth;

  const updatePosition = React.useCallback(() => {
    const triggerEl = triggerRef.current;
    const popoverEl = popoverRef.current;
    if (!triggerEl || !popoverEl) return;

    const triggerRect = triggerEl.getBoundingClientRect();
    // Use offset sizes to avoid transform-based measurement jitter during open animations.
    const measuredWidth = popoverEl.offsetWidth;
    const measuredHeight = popoverEl.offsetHeight;
    const contentRect = popoverEl.getBoundingClientRect();
    const contentWidth = measuredWidth || contentRect.width;
    const contentHeight = measuredHeight || contentRect.height;

    const next = computePopoverPosition({
      triggerRect,
      contentSize: { width: contentWidth, height: contentHeight },
      placement,
      offset,
      padding,
      viewport: { width: window.innerWidth, height: window.innerHeight },
    });

    setDropdownPosition(next);
  }, [placement]);

  // Compute a stable position before the first paint when opening.
  React.useLayoutEffect(() => {
    if (!isOpen) return;
    updatePosition();
    let raf1 = 0;
    let raf2 = 0;
    raf1 = window.requestAnimationFrame(() => {
      updatePosition();
      raf2 = window.requestAnimationFrame(() => updatePosition());
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [isOpen, updatePosition, renderedWidth]);

  // Reposition on resize/scroll while open
  React.useEffect(() => {
    if (!isOpen) return;
    let raf = 0;
    const handler = () => {
      cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(() => updatePosition());
    };
    handler();
    window.addEventListener("resize", handler);
    // Listen to scroll in capture phase to support nested scrolling containers.
    window.addEventListener("scroll", handler, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, true);
    };
  }, [isOpen, updatePosition]);

  // Track content size changes to avoid late "jump" after first render.
  React.useEffect(() => {
    if (!isOpen) return;
    if (!popoverRef.current) return;
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => updatePosition());
    ro.observe(popoverRef.current);
    return () => ro.disconnect();
  }, [isOpen, updatePosition]);

  // Reset position on open/close and snapshot trigger width early.
  React.useLayoutEffect(() => {
    if (!isOpen) {
      setDropdownPosition(null);
      return;
    }
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) setLastTriggerRect({ width: rect.width });
  }, [isOpen]);

  // Handle clicks outside
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const triggerEl = triggerRef.current;
      const popoverEl = popoverRef.current;
      if (!triggerEl || !popoverEl) return;
      if (triggerEl.contains(target)) return;
      if (popoverEl.contains(target)) return;
      setIsOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, setIsOpen]);

  const handleTriggerClick = () => {
    if (!disabled) {
      const next = !isOpen;
      if (next) {
        const rect = triggerRef.current?.getBoundingClientRect();
        if (rect) setLastTriggerRect({ width: rect.width });
        setDropdownPosition(null);
      }
      setIsOpen(next);
    }
  };

  const popoverContent =
    isOpen && typeof window !== "undefined"
      ? createPortal(
          <div
            ref={popoverRef}
            data-popover
            style={{
              position: "fixed",
              top: dropdownPosition?.top ?? 0,
              left: dropdownPosition?.left ?? 0,
              width: renderedWidth ?? undefined,
              zIndex: 9999,
              visibility: dropdownPosition ? "visible" : "hidden",
              pointerEvents: dropdownPosition ? "auto" : "none",
              transformOrigin: (() => {
                const { side, align } = dropdownPosition ?? normalizePlacement(placement);
                if (side === "top") return `${align === "end" ? "right" : "left"} bottom`;
                if (side === "bottom") return `${align === "end" ? "right" : "left"} top`;
                if (side === "left") return "right top";
                return "left top";
              })(),
            }}
            data-state="open"
            role="dialog"
            aria-modal={modal || undefined}
            className={cn(
              "z-9999",
              // shadcn-like enter animation
              "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
              className,
            )}
          >
            <div
              className={cn(
                "rounded-md border bg-popover text-popover-foreground shadow-md",
                "backdrop-blur-sm bg-popover/95 border-border/60 p-4",
                contentClassName,
              )}
              tabIndex={-1}
            >
              {children}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      {(() => {
        const triggerEl = trigger as React.ReactElement<any>;
        return React.cloneElement(triggerEl, {
          ref: triggerRef,
          onClick: (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          handleTriggerClick();
          // Call original onClick if exists
          if (triggerEl.props && typeof triggerEl.props.onClick === 'function') {
            triggerEl.props.onClick(e);
          }
          },
          'aria-expanded': isOpen,
          'aria-haspopup': 'dialog',
          className: cn(
            triggerEl.props?.className,
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md'
          )
        } as any);
      })()}
      {popoverContent}
    </>
  );
};
