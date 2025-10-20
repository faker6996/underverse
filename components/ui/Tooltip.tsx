"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";

interface TooltipProps {
  children: React.ReactElement;
  content: React.ReactNode;
  placement?: "top" | "right" | "bottom" | "left";
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

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  placement = "top",
  delay = { open: 700, close: 300 },
  className,
  disabled = false,
  variant = "default",
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [position, setPosition] = React.useState<{ top: number; left: number } | null>(null);
  const [isMounted, setIsMounted] = React.useState(false);
  const triggerRef = React.useRef<HTMLElement>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

  // Ensure client-side only
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const delayOpen = typeof delay === "object" ? delay.open || 700 : delay;
  const delayClose = typeof delay === "object" ? delay.close || 300 : delay;

  const calculatePosition = () => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();

    let top = rect.top;
    let left = rect.left;

    const OFFSET = 8;

    switch (placement) {
      case "top":
        top = rect.top - OFFSET;
        left = rect.left + rect.width / 2;
        break;
      case "bottom":
        top = rect.bottom + OFFSET;
        left = rect.left + rect.width / 2;
        break;
      case "left":
        top = rect.top + rect.height / 2;
        left = rect.left - OFFSET;
        break;
      case "right":
        top = rect.top + rect.height / 2;
        left = rect.right + OFFSET;
        break;
    }

    // Ensure tooltip stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // For horizontal centering, ensure it doesn't go off-screen
    if (placement === "top" || placement === "bottom") {
      const tooltipWidth = 200; // approximate width
      const minLeft = tooltipWidth / 2;
      const maxLeft = viewportWidth - tooltipWidth / 2;
      left = Math.max(minLeft, Math.min(left, maxLeft));
    }

    setPosition({ top, left });
  };

  const handleMouseEnter = () => {
    if (disabled) return;
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      calculatePosition();
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
    calculatePosition();
    setIsOpen(true);
  };

  const handleBlur = () => {
    setIsOpen(false);
  };

  if (disabled || !content) {
    return children;
  }

  return (
    <>
      {React.cloneElement(children, {
        ref: triggerRef,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onFocus: handleFocus,
        onBlur: handleBlur,
      } as any)}
      {isMounted &&
        isOpen &&
        position &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              transform:
                placement === "top"
                  ? "translate(-50%, -100%)"
                  : placement === "bottom"
                  ? "translateX(-50%)"
                  : placement === "left"
                  ? "translate(-100%, -50%)"
                  : placement === "right"
                  ? "translateY(-50%)"
                  : "none",
              zIndex: 99999,
              opacity: 1,
              transition: "opacity 150ms",
              pointerEvents: "none",
            }}
            className={cn(
              "px-3 py-2 text-sm font-medium rounded-lg shadow-lg border",
              "max-w-xs break-words backdrop-blur-sm",
              variantStyles[variant],
              className
            )}
          >
            {content}
          </div>,
          document.body
        )}
    </>
  );
};
