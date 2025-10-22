"use client";

import * as React from "react";
import { useId } from "react";
import { createPortal } from "react-dom";
// Removed floating-ui dependencies
import { cn } from "@/lib/utils/cn";
import { ChevronDown, Search, Check } from "lucide-react";
import { useShadCNAnimations } from "@/lib/utils/shadcn-animations";

export interface MultiComboboxProps {
  id?: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  maxSelected?: number;
  disabledOptions?: string[];
  showTags?: boolean;
  showClear?: boolean;
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  required?: boolean;
}

export const MultiCombobox: React.FC<MultiComboboxProps> = ({
  id,
  options,
  value,
  onChange,
  placeholder = "Search...",
  maxSelected,
  disabledOptions = [],
  showTags = true,
  showClear = true,
  className,
  disabled = false,
  size = 'md',
  label,
  required,
}) => {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<Array<HTMLElement | null>>([]);

  // Manual positioning
  const [dropdownPosition, setDropdownPosition] = React.useState<{top: number, left: number, width: number} | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  // Inject ShadCN animations
  useShadCNAnimations();

  // Calculate positioning synchronously on open to avoid flicker
  const calculatePosition = React.useCallback(() => {
    if (!triggerRef.current) return null;
    const rect = triggerRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
    return {
      top: rect.bottom + scrollTop + 4,
      left: rect.left + scrollLeft,
      width: rect.width,
    };
  }, []);

  // Reposition on resize/scroll while open
  React.useEffect(() => {
    if (!open) return;
    const handler = () => {
      const pos = calculatePosition();
      if (pos) setDropdownPosition(pos);
    };
    window.addEventListener('resize', handler);
    window.addEventListener('scroll', handler, true);
    return () => {
      window.removeEventListener('resize', handler);
      window.removeEventListener('scroll', handler, true);
    };
  }, [open, calculatePosition]);

  // Handle clicks outside
  React.useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current && !triggerRef.current.contains(target)) {
        const dropdown = document.querySelector('[data-dropdown="multicombobox"]') as Element;
        if (dropdown && !dropdown.contains(target)) {
          setOpen(false);
        }
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const filtered = options.filter((o) => o.toLowerCase().includes(query.toLowerCase()));

  const toggleSelect = (val: string) => {
    if (disabledOptions.includes(val)) return;
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      if (!maxSelected || value.length < maxSelected) {
        onChange([...value, val]);
      }
    }
  };

  const handleRemove = (val: string) => {
    onChange(value.filter((v) => v !== val));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) setOpen(true);

    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex !== null && filtered[activeIndex]) {
        toggleSelect(filtered[activeIndex]);
      }
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  // Auto-focus input when dropdown opens
  React.useEffect(() => {
    if (open) {
      // Focus input after dropdown is positioned
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Size styles to align with Input defaults
  const sizeStyles = {
    sm: {
      trigger: "h-8 px-3 py-1.5 text-sm md:h-7 md:text-xs",
      icon: "h-4 w-4",
      search: "px-8 py-1.5 text-xs",
      item: "text-xs px-3 py-1.5",
      tag: "px-2 py-0.5 text-[10px]",
    },
    md: {
      trigger: "h-10 px-4 py-2 text-sm",
      icon: "h-4 w-4",
      search: "px-8 py-2 text-sm",
      item: "text-sm px-3 py-2",
      tag: "px-2 py-1 text-xs",
    },
    lg: {
      trigger: "h-12 px-5 py-3 text-base",
      icon: "h-5 w-5",
      search: "px-8 py-3 text-base",
      item: "text-base px-3 py-3",
      tag: "px-2.5 py-1 text-sm",
    },
  } as const;

  const autoId = useId();
  const resolvedId = id ? String(id) : `multicombobox-${autoId}`;
  const labelId = label ? `${resolvedId}-label` : undefined;
  const labelSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm';

  return (
    <div className={cn("w-full space-y-2 group", className)}>
      {label && (
        <label
          id={labelId}
          onClick={() => triggerRef.current?.focus()}
          className={cn(
            labelSize,
            "font-medium transition-colors duration-200",
            disabled ? "text-muted-foreground" : "text-foreground group-focus-within:text-primary"
          )}
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      <div className="relative w-full">
        <div className="flex flex-wrap gap-1">
          {showTags &&
            value.map((item) => (
            <span key={item} className={cn("flex items-center gap-1 rounded bg-accent text-accent-foreground", sizeStyles[size].tag)}>
              {item}
              <button 
                type="button" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemove(item);
                }} 
                className="text-xs hover:text-destructive"
              >
                ×
              </button>
            </span>
          ))}
        {showClear && value.length > 0 && (
          <button 
            type="button" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClearAll();
            }} 
            className="ml-auto text-xs text-muted-foreground hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        id={resolvedId}
        aria-labelledby={labelId}
        onClick={() => {
          const next = !open;
          if (next) {
            const pos = calculatePosition();
            if (pos) setDropdownPosition(pos);
          }
          setOpen(next);
        }}
        className={cn(
          "flex w-full items-center justify-between rounded-lg border border-input bg-background shadow-sm",
          sizeStyles[size].trigger,
          "outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        <span className="truncate">{value.length ? `${value.length} selected` : (placeholder || "Select...")}</span>
        <ChevronDown className={cn("opacity-50 transition-transform", sizeStyles[size].icon, open && "rotate-180")} />
      </button>

      {open && dropdownPosition && typeof window !== 'undefined' && createPortal(
        <div
          data-dropdown="multicombobox"
          style={{
            position: 'absolute',
            top: dropdownPosition?.top || 0,
            left: dropdownPosition?.left || 0,
            width: dropdownPosition?.width || 200,
            zIndex: 9999,
          }}
          data-state={open ? 'open' : 'closed'}
          className={cn(
            "z-[9999]",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          )}
        >
          <div
            className={cn(
              "rounded-md border bg-popover text-popover-foreground shadow-md",
              "backdrop-blur-sm bg-popover/95 border-border/60"
            )}
          >
          <div className="relative border-b border-border/60">
            <Search className={cn("absolute left-2 top-2.5 text-muted-foreground", sizeStyles[size].icon)} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={cn("w-full rounded-t-md bg-transparent focus:outline-none", sizeStyles[size].search)}
            />
          </div>
          <ul className={cn("max-h-60 overflow-y-auto p-1", size === 'lg' ? 'text-base' : size === 'sm' ? 'text-xs' : 'text-sm')}>
            {filtered.length ? (
              filtered.map((item, index) => {
                const isSelected = value.includes(item);
                const isDisabled = disabledOptions.includes(item);

                return (
                  <li
                    key={item}
                    ref={(node) => {
                      listRef.current[index] = node;
                    }}
                    onClick={() => {
                      toggleSelect(item);
                      inputRef.current?.focus();
                    }}
                    style={{
                      animationDelay: open ? `${index * 25}ms` : '0ms',
                    }}
                    className={cn(
                      "dropdown-item flex cursor-pointer items-center justify-between rounded-sm transition-colors",
                      sizeStyles[size].item,
                      "hover:bg-accent hover:text-accent-foreground",
                      index === activeIndex && "bg-accent text-accent-foreground",
                      isDisabled && "opacity-50 cursor-not-allowed pointer-events-none"
                    )}
                  >
                    {item}
                    {isSelected && <Check className={sizeStyles[size].icon} />}
                  </li>
                );
              })
            ) : (
              <li className={cn("px-3 py-2 text-muted-foreground", size === 'lg' ? 'text-base' : size === 'sm' ? 'text-xs' : 'text-sm')}>No result.</li>
            )}
          </ul>
          </div>
        </div>,
        document.body
      )}
      </div>
    </div>
  );
};
