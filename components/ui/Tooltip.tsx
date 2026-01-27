"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";

type Side = "top" | "right" | "bottom" | "left";
type TooltipPlacement = Side;

interface TooltipProps {
  children: React.ReactElement;
  content: React.ReactNode;
  placement?: TooltipPlacement;
  delay?: number | { open?: number; close?: number };
  className?: string;
  disabled?: boolean;
  variant?: "default" | "info" | "warning" | "error" | "success";
}

const variantStyles = {
  default: "bg-popover text-popover-foreground border-border",
  info: "bg-info text-info-foreground border-info/20",
  warning: "bg-warning text-warning-foreground border-warning/20",
  error: "bg-destructive text-destructive-foreground border-destructive/20",
  success: "bg-success text-success-foreground border-success/20",
};

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

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function getTransformOrigin(side: Side) {
  switch (side) {
    case "top":
      return "center bottom";
    case "bottom":
      return "center top";
    case "left":
      return "right center";
    case "right":
      return "left center";
  }
}

function computeTooltipPosition(args: {
  triggerRect: DOMRect;
  contentSize: { width: number; height: number };
  placement: TooltipPlacement;
  offset: number;
  padding: number;
  viewport: { width: number; height: number };
}): { top: number; left: number; side: Side } {
  const { triggerRect, contentSize, placement, offset, padding, viewport } = args;
  let side: Side = placement;

  const fitsTop = triggerRect.top - offset - contentSize.height >= padding;
  const fitsBottom = triggerRect.bottom + offset + contentSize.height <= viewport.height - padding;
  const fitsLeft = triggerRect.left - offset - contentSize.width >= padding;
  const fitsRight = triggerRect.right + offset + contentSize.width <= viewport.width - padding;

  if (side === "top" && !fitsTop && fitsBottom) side = "bottom";
  if (side === "bottom" && !fitsBottom && fitsTop) side = "top";
  if (side === "left" && !fitsLeft && fitsRight) side = "right";
  if (side === "right" && !fitsRight && fitsLeft) side = "left";

  const centerX = triggerRect.left + triggerRect.width / 2;
  const centerY = triggerRect.top + triggerRect.height / 2;

  let left = 0;
  let top = 0;

  if (side === "top") {
    top = triggerRect.top - offset - contentSize.height;
    left = centerX - contentSize.width / 2;
  } else if (side === "bottom") {
    top = triggerRect.bottom + offset;
    left = centerX - contentSize.width / 2;
  } else if (side === "left") {
    top = centerY - contentSize.height / 2;
    left = triggerRect.left - offset - contentSize.width;
  } else {
    top = centerY - contentSize.height / 2;
    left = triggerRect.right + offset;
  }

  left = clamp(left, padding, viewport.width - contentSize.width - padding);
  top = clamp(top, padding, viewport.height - contentSize.height - padding);

  return { top, left, side };
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  placement = "top",
  delay = { open: 200, close: 300 },
  className,
  disabled = false,
  variant = "default",
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  const triggerRef = React.useRef<HTMLElement>(null);
  const positionerRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);
  const lastAppliedRef = React.useRef<{ top: number; left: number; side: Side } | null>(null);

  // Ensure client-side only
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const delayOpen = typeof delay === "object" ? delay.open || 700 : delay;
  const delayClose = typeof delay === "object" ? delay.close || 300 : delay;

  const offset = 8;
  const padding = 8;

  const updatePosition = React.useCallback(() => {
    const triggerEl = triggerRef.current;
    const positionerEl = positionerRef.current;
    const panelEl = panelRef.current;
    if (!triggerEl || !positionerEl || !panelEl) return;

    const triggerRect = triggerEl.getBoundingClientRect();
    const measuredWidth = panelEl.offsetWidth;
    const measuredHeight = panelEl.offsetHeight;
    const rect = panelEl.getBoundingClientRect();

    const contentWidth = measuredWidth || rect.width;
    const contentHeight = measuredHeight || rect.height;

    const next = computeTooltipPosition({
      triggerRect,
      contentSize: { width: contentWidth, height: contentHeight },
      placement,
      offset,
      padding,
      viewport: { width: window.innerWidth, height: window.innerHeight },
    });

    const top = Math.round(next.top);
    const left = Math.round(next.left);

    const prev = lastAppliedRef.current;
    const same = prev && Math.abs(prev.top - top) < 0.5 && Math.abs(prev.left - left) < 0.5 && prev.side === next.side;
    if (same) return;

    lastAppliedRef.current = { top, left, side: next.side };
    positionerEl.style.transform = `translate3d(${left}px, ${top}px, 0)`;
    panelEl.style.transformOrigin = getTransformOrigin(next.side);
    if (positionerEl.style.visibility !== "visible") positionerEl.style.visibility = "visible";
  }, [placement]);

  const handleMouseEnter = () => {
    if (disabled) return;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, delayOpen);
  };

  const handleMouseLeave = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, delayClose);
  };

  const handleFocus = () => {
    if (disabled) return;
    setIsOpen(true);
  };

  const handleBlur = () => {
    setIsOpen(false);
  };

  React.useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  // Compute a stable position right after opening (before paint), then re-check a couple frames later.
  React.useLayoutEffect(() => {
    if (!isOpen) {
      lastAppliedRef.current = null;
      return;
    }
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

  React.useEffect(() => {
    if (!isOpen) return;
    let raf = 0;
    const handler = () => {
      cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(() => updatePosition());
    };
    handler();
    window.addEventListener("resize", handler);
    window.addEventListener("scroll", handler, true);
    document.addEventListener("scroll", handler, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, true);
      document.removeEventListener("scroll", handler, true);
    };
  }, [isOpen, updatePosition]);

  React.useEffect(() => {
    if (!isOpen) return;
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => updatePosition());
    if (triggerRef.current) ro.observe(triggerRef.current);
    if (panelRef.current) ro.observe(panelRef.current);
    return () => ro.disconnect();
  }, [isOpen, updatePosition]);

  if (disabled || !content) {
    return children;
  }

  return (
    <>
      {React.cloneElement(children, {
        ref: (node: HTMLElement | null) => {
          triggerRef.current = node;
          assignRef((children.props as any)?.ref, node);
        },
        onMouseEnter: (e: React.MouseEvent) => {
          handleMouseEnter();
          if (typeof (children.props as any)?.onMouseEnter === "function") (children.props as any).onMouseEnter(e);
        },
        onMouseLeave: (e: React.MouseEvent) => {
          handleMouseLeave();
          if (typeof (children.props as any)?.onMouseLeave === "function") (children.props as any).onMouseLeave(e);
        },
        onFocus: (e: React.FocusEvent) => {
          handleFocus();
          if (typeof (children.props as any)?.onFocus === "function") (children.props as any).onFocus(e);
        },
        onBlur: (e: React.FocusEvent) => {
          handleBlur();
          if (typeof (children.props as any)?.onBlur === "function") (children.props as any).onBlur(e);
        },
      } as any)}
      {isMounted &&
        isOpen &&
        createPortal(
          <div
            ref={positionerRef}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              transform: "translate3d(0, 0, 0)",
              zIndex: 99999,
              visibility: "hidden",
              pointerEvents: "none",
              willChange: "transform",
            }}
          >
            <div
              ref={panelRef}
              role="tooltip"
              style={{
                opacity: 1,
                transition: "opacity 150ms",
                transformOrigin: getTransformOrigin(placement),
              }}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-xl shadow-lg border",
                "max-w-xs wrap-break-word backdrop-blur-sm",
                variantStyles[variant],
                className,
              )}
            >
              {content}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};
