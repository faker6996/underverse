"use client";

import { cn } from "../utils/cn";
import { useShadCNAnimations } from "../utils/animations";
import React, { useState } from "react";
import { chainEventHandlers, mergeRefs } from "../utils/react-compose";
import { Popover } from "./Popover";
import { ChevronRight } from "lucide-react";

type DropdownMenuContextValue = {
  closeMenu: () => void;
  closeOnSelect: boolean;
};

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

export function useDropdownMenuClose() {
  return React.useContext(DropdownMenuContext)?.closeMenu ?? (() => {});
}

/** Public props for the `DropdownMenu` component. */
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

function useResettingIndex(resetToken: unknown) {
  const [state, setState] = React.useState<{ resetToken: unknown; index: number }>({ resetToken, index: -1 });
  const activeIndex = Object.is(state.resetToken, resetToken) ? state.index : -1;

  const setActiveIndex = React.useCallback((nextIndex: React.SetStateAction<number>) => {
    setState((prev) => {
      const prevIndex = Object.is(prev.resetToken, resetToken) ? prev.index : -1;
      return {
        resetToken,
        index: typeof nextIndex === "function" ? (nextIndex as (value: number) => number)(prevIndex) : nextIndex,
      };
    });
  }, [resetToken]);

  return [activeIndex, setActiveIndex] as const;
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
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const triggerRef = React.useRef<HTMLElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const itemsRef = React.useRef<HTMLButtonElement[]>([]);
  const [activeIndex, setActiveIndex] = useResettingIndex(open);
  const parentMenu = React.useContext(DropdownMenuContext);

  const closeMenu = React.useCallback(() => {
    setOpen(false);
    parentMenu?.closeMenu();
  }, [parentMenu, setOpen]);

  const getEnabledMenuItems = React.useCallback(() => {
    const menuEl = menuRef.current;
    if (!menuEl) return [];

    return Array.from(menuEl.querySelectorAll<HTMLButtonElement>("[data-dropdown-menu-item]")).filter((el) => !el.disabled);
  }, []);

  const focusMenuItem = React.useCallback((index: number) => {
    const enabled = getEnabledMenuItems();
    const item = enabled[index];
    if (!item) return;
    setActiveIndex(index);
    item.focus();
    item.scrollIntoView({ block: "nearest" });
  }, [getEnabledMenuItems, setActiveIndex]);

  // Inject ShadCN animations
  useShadCNAnimations();

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

      const enabled = getEnabledMenuItems();
      if (enabled.length === 0) return;
      const currentIndex = enabled.findIndex((el) => el === active);
      const baseIndex = currentIndex >= 0 ? currentIndex : activeIndex;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const next = (baseIndex + 1 + enabled.length) % enabled.length;
        focusMenuItem(next);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        const prev = (baseIndex - 1 + enabled.length) % enabled.length;
        focusMenuItem(prev);
      } else if (e.key === "Home") {
        e.preventDefault();
        focusMenuItem(0);
      } else if (e.key === "End") {
        e.preventDefault();
        focusMenuItem(enabled.length - 1);
      } else if (e.key === "Escape" && (isInMenu || isOnTrigger)) {
        e.preventDefault();
        closeMenu();
      }
    };

    document.addEventListener("keydown", handleKeyNav, true);
    return () => {
      document.removeEventListener("keydown", handleKeyNav, true);
    };
  }, [open, activeIndex, closeMenu, focusMenuItem, getEnabledMenuItems]);

  const menuContext = React.useMemo<DropdownMenuContextValue>(
    () => ({
      closeMenu,
      closeOnSelect,
    }),
    [closeMenu, closeOnSelect],
  );

  const handleItemClick = (itemOnClick: () => void) => {
    itemOnClick();
    if (closeOnSelect) {
      closeMenu();
    }
  };

  const menuBody = (
    <DropdownMenuContext.Provider value={menuContext}>
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
                  data-dropdown-menu-item=""
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
    </DropdownMenuContext.Provider>
  );

  const triggerProps = trigger.props as React.HTMLAttributes<HTMLElement> & { ref?: React.Ref<HTMLElement> };
  const childRef = triggerProps.ref;
  const enhancedTrigger = React.cloneElement(trigger as React.ReactElement<any>, {
    ...triggerProps,
    ref: mergeRefs<HTMLElement>(childRef, (node) => {
      triggerRef.current = node;
    }),
    "aria-haspopup": "menu",
    "aria-expanded": open,
    onKeyDown: chainEventHandlers<React.KeyboardEvent<HTMLElement>>((e) => {
      triggerRef.current = e.currentTarget as HTMLElement;
      if (!disabled) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setOpen(true);
          requestAnimationFrame(() => focusMenuItem(0));
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setOpen(true);
          requestAnimationFrame(() => {
            const enabled = getEnabledMenuItems();
            focusMenuItem(enabled.length - 1);
          });
        } else if (e.key === "Escape") {
          e.preventDefault();
          setOpen(false);
        }
      }
    }, triggerProps.onKeyDown),
    onFocus: chainEventHandlers<React.FocusEvent<HTMLElement>>((e) => {
      triggerRef.current = e.currentTarget as HTMLElement;
    }, triggerProps.onFocus),
  });

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

/** Public props for the `DropdownMenuItem` component. */
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
  closeOnSelect?: boolean;
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
  closeOnSelect,
}) => {
  const menu = React.useContext(DropdownMenuContext);
  const shouldCloseOnSelect = closeOnSelect ?? menu?.closeOnSelect ?? false;

  return (
    <button
      onClick={() => {
        onClick?.();
        if (shouldCloseOnSelect) {
          menu?.closeMenu();
        }
      }}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      data-dropdown-menu-item=""
      tabIndex={-1}
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors group cursor-pointer",
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
};

export const DropdownMenuSeparator: React.FC<{ className?: string }> = ({ className }) => <div className={cn("h-px bg-border my-1", className)} />;

export const DropdownMenuSub: React.FC<{
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  children: React.ReactNode;
}> = ({ label, icon: Icon, disabled, children }) => (
  <DropdownMenu
    trigger={
      <button
        type="button"
        disabled={disabled}
        onMouseDown={(e) => e.preventDefault()}
        className={cn(
          "flex w-full items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer",
          "hover:bg-accent hover:text-accent-foreground",
          "focus:bg-accent focus:text-accent-foreground focus:outline-none",
          "disabled:opacity-50 disabled:cursor-not-allowed",
        )}
      >
        {Icon && <Icon className="w-4 h-4 shrink-0 opacity-60" />}
        <span className="flex-1 text-left">{label}</span>
        <ChevronRight className="w-3 h-3 opacity-50" />
      </button>
    }
    placement="right"
  >
    {children}
  </DropdownMenu>
);

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
