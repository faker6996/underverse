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

function assignRef<T>(ref: React.Ref<T> | undefined, value: T) {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(value);
    return;
  }
  try {
    (ref as React.MutableRefObject<T>).current = value;
  } catch {
    // ignore
  }
}

function getTransformOrigin(side: Side, align: Align) {
  if (side === "top") return `${align === "end" ? "right" : "left"} bottom`;
  if (side === "bottom") return `${align === "end" ? "right" : "left"} top`;
  if (side === "left") return "right top";
  return "left top";
}

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
  contentWidth,
}) => {
  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLElement>(null);
  const positionerRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const lastAppliedRef = React.useRef<{
    top: number;
    left: number;
    side: Side;
    align: Align;
    width?: number;
  } | null>(null);

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

  const initialPlacement = React.useMemo(() => normalizePlacement(placement), [placement]);

  const updatePosition = React.useCallback(() => {
    const triggerEl = triggerRef.current;
    const positionerEl = positionerRef.current;
    const panelEl = panelRef.current;
    if (!triggerEl || !positionerEl || !panelEl) return;

    const triggerRect = triggerEl.getBoundingClientRect();

    const widthWanted = matchTriggerWidth ? triggerRect.width : contentWidth;
    const widthPx = widthWanted == null ? undefined : Math.max(0, Math.round(widthWanted));

    if (widthPx == null) {
      if (positionerEl.style.width) positionerEl.style.width = "";
    } else if (positionerEl.style.width !== `${widthPx}px`) {
      positionerEl.style.width = `${widthPx}px`;
    }

    // Use offset sizes to avoid transform-based measurement jitter during open animations.
    const prevApplied = lastAppliedRef.current;
    const measuredWidth = positionerEl.offsetWidth;
    const measuredHeight = positionerEl.offsetHeight;
    const contentRect = positionerEl.getBoundingClientRect();
    const contentBoxWidth = measuredWidth || contentRect.width;
    const contentBoxHeight = measuredHeight || contentRect.height;

    const next = computePopoverPosition({
      triggerRect,
      contentSize: { width: contentBoxWidth, height: contentBoxHeight },
      placement,
      offset,
      padding,
      viewport: { width: window.innerWidth, height: window.innerHeight },
    });

    const top = Math.round(next.top);
    const left = Math.round(next.left);

    const applied =
      prevApplied &&
      Math.abs(prevApplied.top - top) < 0.5 &&
      Math.abs(prevApplied.left - left) < 0.5 &&
      prevApplied.side === next.side &&
      prevApplied.align === next.align &&
      prevApplied.width === widthPx;
    if (applied) return;

    lastAppliedRef.current = { top, left, side: next.side, align: next.align, width: widthPx };

    positionerEl.style.transform = `translate3d(${left}px, ${top}px, 0)`;
    panelEl.style.transformOrigin = getTransformOrigin(next.side, next.align);
    if (positionerEl.style.visibility !== "visible") positionerEl.style.visibility = "visible";
    if (positionerEl.style.pointerEvents !== "auto") positionerEl.style.pointerEvents = "auto";
  }, [placement, matchTriggerWidth, contentWidth]);

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
  }, [isOpen, updatePosition]);

  // Follow trigger movement even when the page uses transform-based scrolling (no scroll events).
  React.useEffect(() => {
    if (!isOpen) return;
    let raf = 0;
    const tick = () => {
      updatePosition();
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [isOpen, updatePosition]);

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
    // Listen to scroll in capture phase to support both window scrolling and nested scrolling containers.
    window.addEventListener("scroll", handler, true);
    document.addEventListener("scroll", handler, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, true);
      document.removeEventListener("scroll", handler, true);
    };
  }, [isOpen, updatePosition]);

  // Track content size changes to avoid late "jump" after first render.
  React.useEffect(() => {
    if (!isOpen) return;
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => updatePosition());
    if (positionerRef.current) ro.observe(positionerRef.current);
    if (triggerRef.current) ro.observe(triggerRef.current);
    return () => ro.disconnect();
  }, [isOpen, updatePosition]);

  // Reset last applied state on open/close.
  React.useLayoutEffect(() => {
    if (!isOpen) {
      lastAppliedRef.current = null;
      return;
    }
  }, [isOpen]);

  // Handle clicks outside
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const triggerEl = triggerRef.current;
      const popoverEl = positionerRef.current;
      if (!triggerEl || !popoverEl) return;
      if (triggerEl.contains(target)) return;
      if (popoverEl.contains(target)) return;
      setIsOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (typeof document !== "undefined") {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isOpen, setIsOpen]);

  const handleTriggerClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const popoverContent =
    isOpen && typeof window !== "undefined"
      ? createPortal(
          <div
            ref={positionerRef}
            data-popover
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              transform: "translate3d(0, 0, 0)",
              zIndex: 9999,
              visibility: "hidden",
              pointerEvents: "none",
              willChange: "transform",
            }}
            className="z-9999"
          >
            <div
              ref={panelRef}
              data-state="open"
              role="dialog"
              aria-modal={modal || undefined}
              style={{
                transformOrigin: getTransformOrigin(initialPlacement.side, initialPlacement.align),
              }}
              className={cn(
                // shadcn-like enter animation
                "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
                className,
              )}
            >
              <div
                className={cn(
                  "rounded-2xl md:rounded-3xl border bg-popover text-popover-foreground shadow-md",
                  "backdrop-blur-sm bg-popover/95 border-border/60 p-4",
                  contentClassName,
                )}
                tabIndex={-1}
              >
                {children}
              </div>
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
          ref: (node: HTMLElement | null) => {
            triggerRef.current = node;
            // React 19: `ref` is a regular prop (access via props).
            assignRef((triggerEl.props as any)?.ref, node);
          },
          onClick: (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            handleTriggerClick();
            // Call original onClick if exists
            if (triggerEl.props && typeof triggerEl.props.onClick === "function") {
              triggerEl.props.onClick(e);
            }
          },
          "aria-expanded": isOpen,
          "aria-haspopup": triggerEl.props?.["aria-haspopup"] ?? "dialog",
          className: cn(
            triggerEl.props?.className,
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          ),
        } as any);
      })()}
      {popoverContent}
    </>
  );
};
