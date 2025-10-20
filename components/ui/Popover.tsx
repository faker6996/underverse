"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";
import { useShadCNAnimations } from "@/lib/utils/shadcn-animations";

interface PopoverProps {
  trigger: React.ReactElement;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  placement?: "top" | "bottom" | "left" | "right" | "top-start" | "bottom-start" | "top-end" | "bottom-end";
  modal?: boolean;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  matchTriggerWidth?: boolean;
  contentWidth?: number; // optional fixed width
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
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [dropdownPosition, setDropdownPosition] = React.useState<{top: number, left: number, width?: number, alignEnd?: boolean} | null>(null);
  const triggerRef = React.useRef<HTMLElement>(null);

  // Inject ShadCN animations
  useShadCNAnimations();
  
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  // Calculate positioning synchronously on open to avoid flicker
  const calculatePosition = React.useCallback(() => {
    if (!triggerRef.current) return null;
    const rect = triggerRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    let top = rect.bottom + scrollTop + 4;
    let left = rect.left + scrollLeft;
    let alignEnd = false;
    const width = matchTriggerWidth ? rect.width : contentWidth;

    switch (placement) {
      case 'top':
      case 'top-start':
        top = rect.top + scrollTop - 4;
        break;
      case 'top-end':
        top = rect.top + scrollTop - 4;
        left = rect.right + scrollLeft;
        alignEnd = true;
        break;
      case 'bottom':
      case 'bottom-start':
        top = rect.bottom + scrollTop + 4;
        break;
      case 'bottom-end':
        top = rect.bottom + scrollTop + 4;
        left = rect.right + scrollLeft;
        alignEnd = true;
        break;
      case 'left':
        top = rect.top + scrollTop;
        left = rect.left + scrollLeft - 4;
        break;
      case 'right':
        top = rect.top + scrollTop;
        left = rect.right + scrollLeft + 4;
        break;
    }

    return {
      top,
      left,
      width,
      alignEnd,
    };
  }, [placement, matchTriggerWidth, contentWidth]);

  // Reposition on resize/scroll while open
  React.useEffect(() => {
    if (!isOpen) return;
    const handler = () => {
      const pos = calculatePosition();
      if (pos) setDropdownPosition(pos);
    };
    window.addEventListener('resize', handler);
    // With absolute positioning, scrolling the page moves the popover along.
    // Still, listen to scroll to adjust for nested scrolling containers.
    window.addEventListener('scroll', handler, true);
    return () => {
      window.removeEventListener('resize', handler);
      window.removeEventListener('scroll', handler, true);
    };
  }, [isOpen, calculatePosition]);

  // Handle clicks outside
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current && !triggerRef.current.contains(target)) {
        const dropdown = document.querySelector('[data-popover]') as Element;
        if (dropdown && !dropdown.contains(target)) {
          setIsOpen(false);
        }
      }
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
        const pos = calculatePosition();
        if (pos) setDropdownPosition(pos);
      }
      setIsOpen(next);
    }
  };

  const popoverContent = isOpen && dropdownPosition ? (
    <div
      data-popover
      style={{
        position: 'absolute',
        top: dropdownPosition?.top || 0,
        left: dropdownPosition?.left || 0,
        width: dropdownPosition?.width || undefined,
        transform: dropdownPosition?.alignEnd ? 'translateX(-100%)' : undefined,
        zIndex: 9999,
      }}
      data-state="open"
      role="dialog"
      aria-modal={modal || undefined}
      className={cn(
        "z-[9999]",
        // shadcn-like enter animation
        "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
        className
      )}
    >
      <div
        className={cn(
          "rounded-md border bg-popover text-popover-foreground shadow-md",
          "backdrop-blur-sm bg-popover/95 border-border/60 p-4",
          contentClassName
        )}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>
  ) : null;

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
      {isOpen && dropdownPosition && typeof window !== 'undefined' && createPortal(popoverContent, document.body)}
    </>
  );
};
