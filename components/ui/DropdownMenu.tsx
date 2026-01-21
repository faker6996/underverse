"use client";

import { cn } from "@/lib/utils/cn";
import { useShadCNAnimations } from "@/lib/utils/shadcn-animations";
import React, { useState } from "react";
import { Popover } from "./Popover";

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
  const triggerRef = React.useRef<HTMLElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const itemsRef = React.useRef<HTMLButtonElement[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  // Inject ShadCN animations
  useShadCNAnimations();

  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  // Reset keyboard focus index when opened
  React.useEffect(() => {
    if (open) setActiveIndex(-1);
  }, [open]);

  // Keyboard navigation inside the menu (Arrow keys/Home/End)
  React.useEffect(() => {
    if (!open) return;

    const handleKeyNav = (e: KeyboardEvent) => {
      const active = document.activeElement as Node | null;
      const triggerEl = triggerRef.current;
      const menuEl = menuRef.current;
      if (!active || !triggerEl || !menuEl) return;
      const isInMenu = menuEl.contains(active);
      const isOnTrigger = triggerEl.contains(active);
      if (!isInMenu && !isOnTrigger) return;

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
      document.removeEventListener("keydown", handleKeyNav);
    };
  }, [open, activeIndex]);

  const handleItemClick = (itemOnClick: () => void) => {
    itemOnClick();
    if (closeOnSelect) {
      setOpen(false);
    }
  };

  const menuBody = (
    <div ref={menuRef} data-dropdown-menu data-state={open ? "open" : "closed"} role="menu" className={cn("min-w-40", className)}>
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
                  "dropdown-item flex w-full items-center gap-2 px-2.5 py-1.5 text-sm rounded-lg",
                  "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  "hover:bg-accent hover:text-accent-foreground",
                  "focus:bg-accent focus:text-accent-foreground",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  item.destructive && "text-destructive hover:bg-destructive/10 focus:bg-destructive/10",
                )}
              >
                {IconComponent && <IconComponent className="h-4 w-4" />}
                {item.label}
              </button>
            );
          })
        : children}
    </div>
  );

  const enhancedTrigger = React.cloneElement(trigger, {
    ref: triggerRef,
    "aria-haspopup": "menu",
    "aria-expanded": open,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
        requestAnimationFrame(() => itemsRef.current.find((el) => el && !el.disabled)?.focus());
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setOpen(true);
        requestAnimationFrame(() => {
          const enabled = itemsRef.current.filter((el) => el && !el.disabled);
          enabled[enabled.length - 1]?.focus();
        });
      } else if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
      if (typeof (trigger.props as any)?.onKeyDown === "function") {
        (trigger.props as any).onKeyDown(e);
      }
    },
    className: cn(
      (trigger.props as any)?.className,
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    ),
  } as any);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger={enhancedTrigger}
      placement={placement}
      disabled={disabled}
      contentClassName={cn("p-1", contentClassName)}
    >
      {menuBody}
    </Popover>
  );
};

// ========== Enhanced Dropdown Menu Item ==========
export interface DropdownMenuItemProps {
  children?: React.ReactNode;
  label?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  active?: boolean;
  shortcut?: string;
  className?: string;
}

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  children,
  label,
  description,
  icon: Icon,
  onClick,
  disabled,
  destructive,
  active,
  shortcut,
  className,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    onMouseDown={(e) => e.preventDefault()}
    className={cn(
      "flex w-full items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors group",
      "hover:bg-accent hover:text-accent-foreground",
      "focus:bg-accent focus:text-accent-foreground focus:outline-none",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      destructive && "text-destructive hover:bg-destructive/10 focus:bg-destructive/10",
      active && "bg-primary/10 text-primary",
      className,
    )}
  >
    {Icon && <Icon className={cn("w-4 h-4 shrink-0", active ? "text-primary" : "opacity-60 group-hover:opacity-100")} />}
    <div className="flex-1 text-left">
      {label && <div className={cn("font-medium", description && "leading-tight")}>{label}</div>}
      {description && <div className="text-xs text-muted-foreground">{description}</div>}
      {children}
    </div>
    {shortcut && <span className="ml-2 text-xs text-muted-foreground opacity-60">{shortcut}</span>}
    {active && (
      <svg className="w-4 h-4 text-primary shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )}
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
          "inline-flex items-center justify-between gap-2 px-3 py-2 text-sm rounded-2xl border bg-background border-border/60",
          "hover:bg-accent/50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className,
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
