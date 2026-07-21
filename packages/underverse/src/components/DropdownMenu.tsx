"use client";

import { cn } from "../utils/cn";
import { useShadCNAnimations } from "../utils/animations";
import React, { useState } from "react";
import { setRefValue } from "../utils/react-compose";
import { Popover } from "./Popover";
import { ChevronRight } from "lucide-react";
import { getBorderRadiusClass, type BorderMode } from "../utils/radius";
import { useUnderverseUIConfig } from "../contexts/UnderverseConfigContext";
import { formControlFixedClass, formControlSizeStyles, formControlValueClass, type FormControlSize } from "../constants/form-control-size";

type DropdownMenuContextValue = {
  closeMenu: () => void;
  closeOnSelect: boolean;
  cancelHoverClose: () => void;
  scheduleHoverClose: () => void;
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
  openOnHover?: boolean;
  hoverCloseDelay?: number;
  items?: Array<{
    label: string;
    icon?: React.ComponentType<any>;
    onClick: () => void;
    disabled?: boolean;
    destructive?: boolean;
  }>;
  borderMode?: BorderMode;
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
  openOnHover = false,
  hoverCloseDelay = 120,
  items,
  borderMode,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      if (isOpen === undefined) {
        setInternalOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isOpen, onOpenChange]
  );
  const triggerRef = React.useRef<HTMLElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const itemsRef = React.useRef<HTMLButtonElement[]>([]);
  const [activeIndex, setActiveIndex] = useResettingIndex(open);
  const parentMenu = React.useContext(DropdownMenuContext);
  const hoverCloseTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelHoverClose = React.useCallback(() => {
    if (hoverCloseTimeoutRef.current === null) return;
    clearTimeout(hoverCloseTimeoutRef.current);
    hoverCloseTimeoutRef.current = null;
  }, []);

  const scheduleHoverClose = React.useCallback(() => {
    if (!openOnHover) return;
    cancelHoverClose();
    hoverCloseTimeoutRef.current = setTimeout(() => {
      hoverCloseTimeoutRef.current = null;
      setOpen(false);
    }, hoverCloseDelay);
  }, [cancelHoverClose, hoverCloseDelay, openOnHover, setOpen]);

  React.useEffect(() => () => cancelHoverClose(), [cancelHoverClose]);

  const closeMenu = React.useCallback(() => {
    cancelHoverClose();
    setOpen(false);
    parentMenu?.closeMenu();
  }, [cancelHoverClose, parentMenu, setOpen]);

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

  const globalConfig = useUnderverseUIConfig();
  const resolvedBorderMode = borderMode ?? globalConfig.dropdownMenu?.borderMode ?? globalConfig.borderMode;

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
      cancelHoverClose,
      scheduleHoverClose,
    }),
    [cancelHoverClose, closeMenu, closeOnSelect, scheduleHoverClose],
  );

  const handleItemClick = (itemOnClick: () => void) => {
    itemOnClick();
    if (closeOnSelect) {
      closeMenu();
    }
  };

  const menuBody = (
    <DropdownMenuContext.Provider value={menuContext}>
      <div
        ref={menuRef}
        data-dropdown-menu
        data-state={open ? "open" : "closed"}
        role="menu"
        className={cn("min-w-40", className)}
        onMouseEnter={openOnHover ? () => {
          cancelHoverClose();
          parentMenu?.cancelHoverClose();
        } : undefined}
        onMouseLeave={openOnHover ? () => {
          scheduleHoverClose();
          parentMenu?.scheduleHoverClose();
        } : undefined}
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
                  data-dropdown-menu-item=""
                  tabIndex={-1}
                  style={{
                    animationDelay: open ? `${Math.min(index * 20, 200)}ms` : "0ms",
                  }}
                  className={cn(
                    "dropdown-item flex w-full items-center gap-2 px-2.5 py-1.5 text-sm",
                    resolvedBorderMode ? getBorderRadiusClass(resolvedBorderMode) : "rounded-lg",
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
  const {
    ref: childRef,
    onKeyDown: triggerOnKeyDown,
    onClick: triggerOnClick,
    onMouseEnter: triggerOnMouseEnter,
    onMouseLeave: triggerOnMouseLeave,
  } = triggerProps;
  const setTriggerNode = React.useCallback((node: HTMLElement | null) => {
    setRefValue(childRef, node);
    triggerRef.current = node;
  }, [childRef]);
  const handleTriggerKeyDown = React.useCallback((event: React.KeyboardEvent<HTMLElement>) => {
    if (!disabled) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setOpen(true);
        requestAnimationFrame(() => focusMenuItem(0));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setOpen(true);
        requestAnimationFrame(() => {
          const enabled = getEnabledMenuItems();
          focusMenuItem(enabled.length - 1);
        });
      } else if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
      }
    }
    triggerOnKeyDown?.(event);
  }, [disabled, focusMenuItem, getEnabledMenuItems, setOpen, triggerOnKeyDown]);
  const handleTriggerClick = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
    if (openOnHover && !disabled) {
      cancelHoverClose();
      setOpen(true);
    }
    triggerOnClick?.(event);
  }, [cancelHoverClose, disabled, openOnHover, setOpen, triggerOnClick]);
  const handleTriggerMouseEnter = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
    if (openOnHover && !disabled) {
      cancelHoverClose();
      parentMenu?.cancelHoverClose();
      setOpen(true);
    }
    triggerOnMouseEnter?.(event);
  }, [cancelHoverClose, disabled, openOnHover, parentMenu, setOpen, triggerOnMouseEnter]);
  const handleTriggerMouseLeave = React.useCallback((event: React.MouseEvent<HTMLElement>) => {
    scheduleHoverClose();
    triggerOnMouseLeave?.(event);
  }, [scheduleHoverClose, triggerOnMouseLeave]);

  // React invokes these ref/event callbacks after render; cloneElement only forwards them to the trigger.
  // eslint-disable-next-line react-hooks/refs
  const enhancedTrigger = React.cloneElement(trigger as React.ReactElement<any>, {
    ...triggerProps,
    ref: setTriggerNode,
    "aria-haspopup": "menu",
    "aria-expanded": open,
    onKeyDown: handleTriggerKeyDown,
    onClick: handleTriggerClick,
    onMouseEnter: handleTriggerMouseEnter,
    onMouseLeave: handleTriggerMouseLeave,
  });

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger={enhancedTrigger}
      placement={placement}
      disabled={disabled}
      borderMode={resolvedBorderMode}
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
  borderMode?: BorderMode;
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
  borderMode,
}) => {
  const menu = React.useContext(DropdownMenuContext);
  const shouldCloseOnSelect = closeOnSelect ?? menu?.closeOnSelect ?? false;
  
  const globalConfig = useUnderverseUIConfig();
  const resolvedBorderMode = borderMode ?? globalConfig.dropdownMenu?.borderMode ?? globalConfig.borderMode;

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
        "flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors group cursor-pointer",
        resolvedBorderMode ? getBorderRadiusClass(resolvedBorderMode) : "rounded-lg",
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
  borderMode?: BorderMode;
  children: React.ReactNode;
}> = ({ label, icon: Icon, disabled, borderMode, children }) => {
  const globalConfig = useUnderverseUIConfig();
  const resolvedBorderMode = borderMode ?? globalConfig.dropdownMenu?.borderMode ?? globalConfig.borderMode;

  return (
    <DropdownMenu
    trigger={
      <button
        type="button"
        disabled={disabled}
        onMouseDown={(e) => e.preventDefault()}
        className={cn(
          "flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors cursor-pointer",
          resolvedBorderMode ? getBorderRadiusClass(resolvedBorderMode) : "rounded-lg",
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
    openOnHover
  >
    {children}
  </DropdownMenu>
  );
};

export const SelectDropdown: React.FC<{
  options: string[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  borderMode?: BorderMode;
  size?: FormControlSize;
}> = ({ options, value, onChange, placeholder = "Select...", className, borderMode, size = "md" }) => {
  const globalConfig = useUnderverseUIConfig();
  const resolvedBorderMode = borderMode ?? globalConfig.dropdownMenu?.borderMode ?? globalConfig.borderMode;
  
  return (
    <DropdownMenu
    trigger={
      <button
        className={cn(
          "inline-flex items-center justify-between gap-2 border bg-background border-border/60",
          resolvedBorderMode ? getBorderRadiusClass(resolvedBorderMode) : "rounded-2xl",
          formControlFixedClass,
          formControlSizeStyles[size].control,
          "hover:bg-accent/50",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className,
        )}
      >
        <span className={cn(formControlValueClass, "max-w-64 text-foreground/90")}>{value || placeholder}</span>
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="shrink-0 opacity-70">
          <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    }
    items={options.map((option) => ({
      label: option,
      onClick: () => onChange(option),
    }))}
    borderMode={resolvedBorderMode}
  />
  );
};

export { DropdownMenu };
export default DropdownMenu;
