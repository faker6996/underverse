"use client";

import * as React from "react";
import { useId } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";
import { ChevronDown, Search, Check, X } from "lucide-react";
import { useShadCNAnimations } from "@/lib/utils/shadcn-animations";

// --- PROPS ---
export type ComboboxOption = string | { label: string; value: any };

export interface ComboboxProps {
  id?: string;
  options: ComboboxOption[];
  value?: any;
  onChange: (value: any) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
  allowClear?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  usePortal?: boolean;
  label?: string;
  required?: boolean;
  fontBold?: boolean;
}

// Helper functions
const getOptionLabel = (option: ComboboxOption): string => {
  return typeof option === "string" ? option : option.label;
};

const getOptionValue = (option: ComboboxOption): any => {
  return typeof option === "string" ? option : option.value;
};

const findOptionByValue = (options: ComboboxOption[], value: any): ComboboxOption | undefined => {
  return options.find((opt) => getOptionValue(opt) === value);
};

// --- MAIN COMPONENT ---
export const Combobox: React.FC<ComboboxProps> = ({
  id,
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyText = "No results found",
  className,
  disabled = false,
  size = "md",
  allowClear = false,
  usePortal = true,
  label,
  required,
  fontBold = false
}) => {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);

  // Inject ShadCN animations
  useShadCNAnimations();

  const listRef = React.useRef<(HTMLLIElement | null)[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Stable ids for accessibility
  const autoId = useId();
  const resolvedId = id ? String(id) : `combobox-${autoId}`;
  const labelId = label ? `${resolvedId}-label` : undefined;

  // Enable search only when options length > 10
  const enableSearch = options.length > 10;

  // Filter options based on query (only when search enabled)
  const filteredOptions = React.useMemo(
    () => (enableSearch ? options.filter((o) => getOptionLabel(o).toLowerCase().includes(query.toLowerCase())) : options),
    [options, query, enableSearch]
  );

  // Manual positioning
  const [dropdownPosition, setDropdownPosition] = React.useState<{ top: number; left: number; width: number } | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

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
    window.addEventListener("resize", handler);
    window.addEventListener("scroll", handler, true);
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, true);
    };
  }, [open, calculatePosition]);

  // Handle clicks outside
  React.useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (triggerRef.current && !triggerRef.current.contains(target)) {
        const dropdown = document.querySelector("[data-combobox-dropdown]") as Element;
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

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  // Event Handlers
  const handleSelect = (option: ComboboxOption) => {
    const val = getOptionValue(option);
    if (val !== undefined && val !== null) {
      onChange(val);
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setOpen(false);
  };

  // Reset state when dropdown closes và focus input khi mở
  React.useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveIndex(null);
    } else if (enableSearch) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open, enableSearch]);

  // Get display value
  const selectedOption = findOptionByValue(options, value);
  const displayValue = selectedOption ? getOptionLabel(selectedOption) : "";

  const dropdownContent = (
    <div
      data-combobox-dropdown
      style={{
        position: "absolute",
        top: dropdownPosition?.top || 0,
        left: dropdownPosition?.left || 0,
        width: dropdownPosition?.width || 200,
        zIndex: 9999,
      }}
      data-state={open ? "open" : "closed"}
      role="listbox"
      id={`${resolvedId}-listbox`}
      className={cn(
        "z-[9999]",
        "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
      )}
    >
      <div className={cn("rounded-md border bg-popover text-popover-foreground shadow-md", "backdrop-blur-sm bg-popover/95 border-border/60")}>
        {/* Search Input (only when many options) */}
        {enableSearch && (
          <div className="relative p-3 border-b border-border/50 bg-muted/20">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActiveIndex((prev) => {
                    const next = prev === null ? 0 : prev + 1;
                    return next >= filteredOptions.length ? 0 : next;
                  });
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActiveIndex((prev) => {
                    const next = prev === null ? filteredOptions.length - 1 : prev - 1;
                    return next < 0 ? filteredOptions.length - 1 : next;
                  });
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  if (activeIndex !== null && filteredOptions[activeIndex]) {
                    handleSelect(filteredOptions[activeIndex]);
                  }
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  setOpen(false);
                }
              }}
              placeholder={searchPlaceholder}
              className="w-full rounded-md bg-background/50 py-2 pl-8 pr-3 text-sm border-0 focus:outline-none focus:bg-background/80 transition-colors placeholder:text-muted-foreground/60"
              aria-autocomplete="list"
              aria-activedescendant={activeIndex != null ? `combobox-item-${activeIndex}` : undefined}
            />
          </div>
        )}

        {/* Options List */}
        <div className="max-h-64 overflow-y-auto overscroll-contain">
          <ul className="p-1 space-y-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((item, index) => {
                const itemValue = getOptionValue(item);
                const itemLabel = getOptionLabel(item);
                const isSelected = itemValue === value;

                return (
                  <li
                    key={`${itemValue}-${index}`}
                    ref={(node) => {
                      listRef.current[index] = node;
                    }}
                    id={`combobox-item-${index}`}
                    role="option"
                    tabIndex={-1}
                    aria-selected={isSelected}
                    onClick={() => handleSelect(item)}
                    style={{
                      animationDelay: open ? `${index * 25}ms` : "0ms",
                    }}
                    className={cn(
                      "dropdown-item group flex cursor-pointer items-center justify-between rounded-sm px-2.5 py-1.5 text-sm",
                      "outline-none focus:outline-none focus-visible:outline-none",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus:bg-accent focus:text-accent-foreground",
                      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                      index === activeIndex && "bg-accent text-accent-foreground",
                      isSelected && "bg-accent text-accent-foreground"
                    )}
                  >
                    <span className="truncate">{itemLabel}</span>
                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                  </li>
                );
              })
            ) : (
              <li className="px-3 py-8 text-center text-muted-foreground text-sm">
                <div className="flex flex-col items-center gap-2">
                  <Search className="h-6 w-6 opacity-50" />
                  <span>{emptyText}</span>
                </div>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );

  // Size styles for trigger
  const sizeStyles = {
    // Keep consistent with Input size heights
    sm: "h-8 py-1.5 text-sm md:h-7 md:text-xs",
    md: "h-10 py-2 text-sm",
    lg: "h-12 py-3 text-base",
  } as const;

  const labelSize = size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm";

  // Radius consistent with Input: sm => rounded-md, md/lg => rounded-lg
  const radiusClass = size === "sm" ? "rounded-md" : "rounded-lg";

  const verticalGap = size === "sm" ? "space-y-1.5" : "space-y-2";

  return (
    <div className={cn("w-full group", verticalGap)}>
      {label && (
        <div className="flex items-center justify-between">
          <label
            id={labelId}
            // Clicking the label should focus/open the trigger
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
        </div>
      )}
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${resolvedId}-listbox`}
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
          "flex w-full items-center justify-between border border-input bg-background px-3",
          radiusClass,
          sizeStyles[size],
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "hover:bg-accent/5 transition-colors hover:border-primary/40 focus:border-primary",
          className
        )}
      >
        <span className={cn("truncate", !displayValue && "text-muted-foreground", fontBold && "font-bold")}>{displayValue || placeholder}</span>

        <div className="flex items-center gap-1 ml-2">
          {allowClear && value && !disabled && (
            // FIX: Use a div instead of a nested button
            <div
              role="button"
              tabIndex={0}
              aria-label="Clear selection"
              onClick={handleClear}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleClear(e as any)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </div>
          )}
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", open && "rotate-180")} />
        </div>
      </button>

      {/* Dropdown Portal or Inline */}
      {usePortal
        ? open && dropdownPosition && typeof window !== "undefined" && createPortal(dropdownContent, document.body)
        : open && dropdownPosition && dropdownContent}
    </div>
  );
};
