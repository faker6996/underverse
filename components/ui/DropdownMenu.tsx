"use client";

import { cn } from "@/lib/utils/cn";
import { useShadCNAnimations } from "@/lib/utils/shadcn-animations";
import React, { useState } from "react";
import { createPortal } from "react-dom";

interface DropdownMenuProps {
  trigger: React.ReactElement;
  children?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  placement?: "top" | "bottom" | "left" | "right" | "top-start" | "bottom-start" | "top-end" | "bottom-end";
  closeOnSelect?: boolean;
  disabled?: boolean;
  // Alternative API props
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  items?: Array<{
    label: string;
    icon?: React.ComponentType<any>;
    onClick: () => void;
    disabled?: boolean;
    destructive?: boolean;
  }>;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  children,
  className,
  contentClassName,
  placement = "bottom-start",
  closeOnSelect = true,
  disabled = false,
  isOpen,
  onOpenChange,
  items,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = React.useRef<HTMLElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const itemsRef = React.useRef<HTMLButtonElement[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  // Inject ShadCN animations
  useShadCNAnimations();

  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  // Calculate position
  React.useEffect(() => {
    if (open && triggerRef.current && contentRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuRect = contentRef.current.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      const viewportHeight = window.innerHeight;

      let top = rect.bottom + scrollTop + 4;
      let left = rect.left + scrollLeft;

      // Auto-flip to top if dropdown would go below viewport
      if (rect.bottom + menuRect.height > viewportHeight && rect.top > menuRect.height) {
        top = rect.top + scrollTop - menuRect.height - 4;
      }

      switch (placement) {
        case "top":
        case "top-start":
          top = rect.top + scrollTop - menuRect.height - 4;
          break;
        case "top-end":
          top = rect.top + scrollTop - menuRect.height - 4;
          left = rect.right + scrollLeft - menuRect.width;
          break;
        case "bottom":
        case "bottom-start":
          // Auto-flip logic above already handles this
          break;
        case "bottom-end":
          left = rect.right + scrollLeft - menuRect.width;
          break;
        case "left":
          top = rect.top + scrollTop;
          left = rect.left + scrollLeft - menuRect.width - 4;
          break;
        case "right":
          top = rect.top + scrollTop;
          left = rect.right + scrollLeft + 4;
          break;
      }

      setPosition({ top, left });
    }
    // Reset keyboard focus index when opened
    if (open) setActiveIndex(-1);
  }, [open, placement]);

  // Handle clicks outside
  React.useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current && !triggerRef.current.contains(target)) {
        const dropdown = document.querySelector("[data-dropdown-menu]") as Element;
        if (dropdown && !dropdown.contains(target)) {
          setOpen(false);
        }
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    const handleKeyNav = (e: KeyboardEvent) => {
      if (!contentRef.current) return;
      const enabled = itemsRef.current.filter((el) => el && !el.disabled);
      if (enabled.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = (activeIndex + 1 + enabled.length) % enabled.length;
        setActiveIndex(next);
        enabled[next]?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = (activeIndex - 1 + enabled.length) % enabled.length;
        setActiveIndex(prev);
        enabled[prev]?.focus();
      } else if (e.key === "Home") {
        e.preventDefault();
        setActiveIndex(0);
        enabled[0]?.focus();
      } else if (e.key === "End") {
        e.preventDefault();
        setActiveIndex(enabled.length - 1);
        enabled[enabled.length - 1]?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyNav);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("keydown", handleKeyNav);
    };
  }, [open, setOpen, activeIndex]);

  const handleTriggerClick = () => {
    if (!disabled) {
      setOpen(!open);
    }
  };

  const handleItemClick = (itemOnClick: () => void) => {
    itemOnClick();
    if (closeOnSelect) {
      setOpen(false);
    }
  };

  const dropdownContent = open ? (
    <div
      data-dropdown-menu
      data-combobox-dropdown
      ref={contentRef}
      style={{
        position: "absolute",
        top: position?.top ?? -9999,
        left: position?.left ?? -9999,
        zIndex: 9999,
        visibility: position ? "visible" : "hidden",
        transformOrigin: "top center",
      }}
      data-state={open ? "open" : "closed"}
      role="menu"
      className={cn("z-9999 min-w-40", className)}
    >
      <div
        className={cn(
          "rounded-md border bg-popover text-popover-foreground shadow-md",
          "backdrop-blur-sm bg-popover/95 border-border/60 p-1",
          contentClassName
        )}
      >
        {items
          ? items.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={index}
                  ref={(el) => {
                    if (el) itemsRef.current[index] = el;
                  }}
                  onClick={() => handleItemClick(item.onClick)}
                  disabled={item.disabled}
                  role="menuitem"
                  tabIndex={-1}
                  style={{
                    animationDelay: open ? `${Math.min(index * 20, 200)}ms` : "0ms",
                  }}
                  className={cn(
                    "dropdown-item flex w-full items-center gap-2 px-2.5 py-1.5 text-sm rounded-sm",
                    "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus:bg-accent focus:text-accent-foreground",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    item.destructive && "text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
                  )}
                >
                  {IconComponent && <IconComponent className="h-4 w-4" />}
                  {item.label}
                </button>
              );
            })
          : children}
      </div>
    </div>
  ) : null;

  return (
    <>
      {React.cloneElement(trigger, {
        ref: triggerRef,
        onClick: handleTriggerClick,
        "aria-expanded": open,
        "aria-haspopup": "menu",
        className: cn(
          // keep original classes on trigger
          (trigger.props as any)?.className,
          // ensure focus-visible ring for trigger too
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md"
        ),
      } as any)}
      {dropdownContent && typeof window !== "undefined" && createPortal(dropdownContent, document.body)}
    </>
  );
};

// Additional components for backward compatibility
export const DropdownMenuItem: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  className?: string;
}> = ({ children, onClick, disabled, destructive, className }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "flex w-full items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
      "hover:bg-accent hover:text-accent-foreground",
      "focus:bg-accent focus:text-accent-foreground focus:outline-none",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      destructive && "text-destructive hover:bg-destructive/10 focus:bg-destructive/10",
      className
    )}
  >
    {children}
  </button>
);

export const DropdownMenuSeparator: React.FC<{ className?: string }> = ({ className }) => <div className={cn("h-px bg-border my-1", className)} />;

export const SelectDropdown: React.FC<{
  options: string[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}> = ({ options, value, onChange, placeholder = "Select...", className }) => (
  <DropdownMenu
    trigger={
      <button
        className={cn(
          "inline-flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-md border bg-background border-border/60",
          "hover:bg-accent/50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className
        )}
      >
        <span className="truncate max-w-64 text-foreground/90">{value || placeholder}</span>
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="opacity-70">
          <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    }
    items={options.map((option) => ({
      label: option,
      onClick: () => onChange(option),
    }))}
  />
);

export { DropdownMenu };
export default DropdownMenu;
