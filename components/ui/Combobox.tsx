"use client";

import * as React from "react";
import { useId } from "react";
import { cn } from "@/lib/utils/cn";
import { ChevronDown, Search, SearchX, Check, X, Loader2 } from "lucide-react";
import { useShadCNAnimations } from "@/lib/utils/shadcn-animations";
import { Popover } from "./Popover";

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
  loading?: boolean;
  loadingText?: string;
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
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyText = "No results found",
  className,
  disabled = false,
  size = "md",
  allowClear = false,
  usePortal = true,
  label,
  required,
  fontBold = false,
  loading = false,
  loadingText = "Loading...",
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
    [options, query, enableSearch],
  );

  const triggerRef = React.useRef<HTMLButtonElement>(null);

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

  const dropdownBody = (
    <div data-combobox-dropdown data-state={open ? "open" : "closed"} role="listbox" id={`${resolvedId}-listbox`} className="w-full">
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
            className="w-full rounded-xl bg-background/50 py-2 pl-8 pr-3 text-sm border-0 focus:outline-none focus:bg-background/80 transition-colors placeholder:text-muted-foreground/60"
            aria-autocomplete="list"
            aria-activedescendant={activeIndex != null ? `combobox-item-${activeIndex}` : undefined}
          />
        </div>
      )}

      {/* Options List */}
      <div className="max-h-64 overflow-y-auto overscroll-contain">
        <ul className="p-1 space-y-1">
          {loading ? (
            <li className="px-3 py-8 text-center">
              <div className="flex flex-col items-center gap-2 animate-in fade-in-0 zoom-in-95 duration-300">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">{loadingText || "Loading…"}</span>
              </div>
            </li>
          ) : filteredOptions.length > 0 ? (
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
                    animationDelay: open ? `${Math.min(index * 20, 200)}ms` : "0ms",
                  }}
                  className={cn(
                    "dropdown-item group flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-sm",
                    "outline-none focus:outline-none focus-visible:outline-none",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus:bg-accent focus:text-accent-foreground",
                    "data-disabled:pointer-events-none data-disabled:opacity-50",
                    index === activeIndex && "bg-accent text-accent-foreground",
                    isSelected && "bg-accent text-accent-foreground",
                  )}
                >
                  <span className="truncate">{itemLabel}</span>
                  {isSelected && <Check className="h-4 w-4 text-primary" />}
                </li>
              );
            })
          ) : (
            <li className="px-3 py-8 text-center text-muted-foreground text-sm">
              <div className="flex flex-col items-center gap-2 animate-in fade-in-0 zoom-in-95 duration-300">
                <SearchX className="h-8 w-8 opacity-40 text-muted-foreground" />
                <span className="text-sm">{emptyText}</span>
                {query && (
                  <button type="button" onClick={() => setQuery("")} className="text-xs text-primary hover:underline">
                    Clear
                  </button>
                )}
              </div>
            </li>
          )}
        </ul>
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
  const radiusClass = size === "sm" ? "rounded-lg" : "rounded-xl";

  const verticalGap = size === "sm" ? "space-y-1.5" : "space-y-2";

  const triggerButtonBaseProps = {
    ref: triggerRef,
    type: "button" as const,
    disabled,
    role: "combobox" as const,
    "aria-haspopup": "listbox" as const,
    "aria-expanded": open,
    "aria-controls": `${resolvedId}-listbox`,
    id: resolvedId,
    "aria-labelledby": labelId,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    },
    className: cn(
      "flex w-full items-center justify-between border border-input bg-background px-3",
      radiusClass,
      sizeStyles[size],
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "hover:bg-accent/5 transition-colors hover:border-primary/40 focus:border-primary",
      className,
    ),
  };

  const triggerContents = (
    <>
      <span className={cn("truncate", !displayValue && "text-muted-foreground", fontBold && "font-bold")}>{displayValue || placeholder}</span>

      <div className="flex items-center gap-1 ml-2">
        {allowClear && value && !disabled && (
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
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-all duration-200", open && "rotate-180 scale-110 text-primary")} />
      </div>
    </>
  );

  const triggerButtonForPopover = <button {...triggerButtonBaseProps}>{triggerContents}</button>;

  const triggerButtonInline = (
    <button
      {...triggerButtonBaseProps}
      onClick={() => {
        if (disabled) return;
        setOpen((prev) => !prev);
      }}
    >
      {triggerContents}
    </button>
  );

  return (
    <div className={cn("w-full group", verticalGap)}>
      {label && (
        <div className="flex items-center justify-between">
          <label
            id={labelId}
            htmlFor={resolvedId}
            // Clicking the label should focus/open the trigger
            onClick={() => triggerRef.current?.focus()}
            className={cn(
              labelSize,
              "font-medium transition-colors duration-200",
              disabled ? "text-muted-foreground" : "text-foreground group-focus-within:text-primary",
            )}
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        </div>
      )}
      {usePortal ? (
        <Popover
          open={open}
          onOpenChange={setOpen}
          trigger={triggerButtonForPopover}
          placement="bottom-start"
          matchTriggerWidth
          className="z-9999"
          contentClassName="p-0"
        >
          {dropdownBody}
        </Popover>
      ) : (
        <div className="relative">
          {triggerButtonInline}
          {open && (
            <div className="absolute left-0 top-full mt-1 z-50 w-full">
              <div className="rounded-xl border bg-popover text-popover-foreground shadow-md backdrop-blur-sm bg-popover/95 border-border/60">
                {dropdownBody}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
