"use client";

import * as React from "react";
import { useId } from "react";
import { cn } from "@/lib/utils/cn";
import { ChevronDown, Search, SearchX, Check, X, Loader2, Sparkles } from "lucide-react";
import { useShadCNAnimations } from "@/lib/utils/shadcn-animations";
import { Popover } from "./Popover";

// --- PROPS ---
export type ComboboxOption = string | { label: string; value: any; icon?: React.ReactNode; description?: string; disabled?: boolean };

export interface ComboboxProps {
  id?: string;
  options: ComboboxOption[];
  value?: any;
  onChange: (value: any) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost" | "filled";
  allowClear?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  usePortal?: boolean;
  label?: string;
  required?: boolean;
  fontBold?: boolean;
  loading?: boolean;
  loadingText?: string;
  // New props
  showSelectedIcon?: boolean;
  maxHeight?: number;
  groupBy?: (option: ComboboxOption) => string;
  renderOption?: (option: ComboboxOption, isSelected: boolean) => React.ReactNode;
  renderValue?: (option: ComboboxOption) => React.ReactNode;
  error?: string;
  helperText?: string;
}

// Helper functions
const getOptionLabel = (option: ComboboxOption): string => {
  return typeof option === "string" ? option : option.label;
};

const getOptionValue = (option: ComboboxOption): any => {
  return typeof option === "string" ? option : option.value;
};

const getOptionIcon = (option: ComboboxOption): React.ReactNode | undefined => {
  return typeof option === "string" ? undefined : option.icon;
};

const getOptionDescription = (option: ComboboxOption): string | undefined => {
  return typeof option === "string" ? undefined : option.description;
};

const getOptionDisabled = (option: ComboboxOption): boolean => {
  return typeof option === "string" ? false : (option.disabled ?? false);
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
  variant = "default",
  allowClear = false,
  usePortal = true,
  label,
  required,
  fontBold = false,
  loading = false,
  loadingText = "Loading...",
  showSelectedIcon = true,
  maxHeight = 280,
  groupBy,
  renderOption,
  renderValue,
  error,
  helperText,
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
    if (getOptionDisabled(option)) return;
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
  const selectedIcon = selectedOption ? getOptionIcon(selectedOption) : undefined;

  // Group options if groupBy is provided
  const groupedOptions = React.useMemo(() => {
    if (!groupBy) return null;
    const groups: Record<string, ComboboxOption[]> = {};
    filteredOptions.forEach((opt) => {
      const group = groupBy(opt);
      if (!groups[group]) groups[group] = [];
      groups[group].push(opt);
    });
    return groups;
  }, [filteredOptions, groupBy]);

  // Render single option
  const renderOptionItem = (item: ComboboxOption, index: number) => {
    const itemValue = getOptionValue(item);
    const itemLabel = getOptionLabel(item);
    const itemIcon = getOptionIcon(item);
    const itemDescription = getOptionDescription(item);
    const itemDisabled = getOptionDisabled(item);
    const isSelected = itemValue === value;
    const isEven = index % 2 === 0;

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
        aria-disabled={itemDisabled}
        onClick={() => !itemDisabled && handleSelect(item)}
        style={{
          animationDelay: open ? `${Math.min(index * 15, 150)}ms` : "0ms",
        }}
        className={cn(
          "dropdown-item group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm",
          "outline-none focus:outline-none focus-visible:outline-none",
          "transition-all duration-150",
          isEven && "bg-muted/40",
          !itemDisabled && "hover:bg-accent/70 hover:shadow-sm",
          !itemDisabled && "focus:bg-accent/80 focus:text-accent-foreground",
          index === activeIndex && !itemDisabled && "bg-accent/60",
          isSelected && "bg-primary/10 text-primary font-medium",
          itemDisabled && "opacity-50 cursor-not-allowed",
        )}
      >
        {/* Icon */}
        {itemIcon && (
          <span className={cn("shrink-0 w-5 h-5 flex items-center justify-center", isSelected ? "text-primary" : "text-muted-foreground")}>
            {itemIcon}
          </span>
        )}

        {/* Custom render or default */}
        {renderOption ? (
          <div className="flex-1 min-w-0">{renderOption(item, isSelected)}</div>
        ) : (
          <div className="flex-1 min-w-0">
            <span className="block truncate">{itemLabel}</span>
            {itemDescription && <span className="block text-xs text-muted-foreground truncate mt-0.5">{itemDescription}</span>}
          </div>
        )}

        {/* Selected indicator */}
        {isSelected && showSelectedIcon && (
          <span className="shrink-0 ml-auto">
            <Check className="h-4 w-4 text-primary" />
          </span>
        )}
      </li>
    );
  };

  const dropdownBody = (
    <div data-combobox-dropdown data-state={open ? "open" : "closed"} role="listbox" id={`${resolvedId}-listbox`} className="w-full">
      {/* Search Input (only when many options) */}
      {enableSearch && (
        <div className="relative p-2.5 border-b border-border/30">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 transition-colors peer-focus:text-primary" />
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
                  if (activeIndex !== null && filteredOptions[activeIndex] && !getOptionDisabled(filteredOptions[activeIndex])) {
                    handleSelect(filteredOptions[activeIndex]);
                  }
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  setOpen(false);
                }
              }}
              placeholder={searchPlaceholder}
              className={cn(
                "peer w-full rounded-xl bg-muted/40 py-2.5 pl-9 pr-3 text-sm",
                "border border-transparent",
                "focus:outline-none focus:bg-background focus:border-primary/30 focus:ring-2 focus:ring-primary/10",
                "transition-all duration-200",
                "placeholder:text-muted-foreground/50",
              )}
              aria-autocomplete="list"
              aria-activedescendant={activeIndex != null ? `combobox-item-${activeIndex}` : undefined}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Options List */}
      <div className="overflow-y-auto overscroll-contain" style={{ maxHeight }}>
        <div className="p-1.5">
          {loading ? (
            <div className="px-3 py-10 text-center">
              <div className="flex flex-col items-center gap-3 animate-in fade-in-0 zoom-in-95 duration-300">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                </div>
                <span className="text-sm text-muted-foreground">{loadingText}</span>
              </div>
            </div>
          ) : filteredOptions.length > 0 ? (
            groupedOptions ? (
              // Render grouped options with global index tracking
              (() => {
                let globalIndex = 0;
                return Object.entries(groupedOptions).map(([group, items]) => (
                  <div key={group} className={cn(globalIndex > 0 && "mt-2 pt-2 border-t border-border/30")}>
                    <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{group}</div>
                    <ul className="space-y-0.5">
                      {items.map((item) => {
                        const index = globalIndex++;
                        return renderOptionItem(item, index);
                      })}
                    </ul>
                  </div>
                ));
              })()
            ) : (
              // Render flat options
              <ul className="space-y-0.5">{filteredOptions.map((item, index) => renderOptionItem(item, index))}</ul>
            )
          ) : (
            <div className="px-3 py-10 text-center">
              <div className="flex flex-col items-center gap-3 animate-in fade-in-0 zoom-in-95 duration-300">
                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                  <SearchX className="h-6 w-6 text-muted-foreground/60" />
                </div>
                <div className="space-y-1">
                  <span className="block text-sm font-medium text-foreground">{emptyText}</span>
                  {query && <span className="block text-xs text-muted-foreground">Try a different search term</span>}
                </div>
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors"
                  >
                    Clear search
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Size styles for trigger
  const sizeStyles = {
    sm: "h-8 py-1.5 text-sm md:h-7 md:text-xs",
    md: "h-10 py-2 text-sm",
    lg: "h-12 py-3 text-base",
  } as const;

  // Variant styles
  const variantStyles = {
    default: "border border-input bg-background hover:bg-accent/5 hover:border-primary/40",
    outline: "border-2 border-input bg-transparent hover:border-primary/60",
    ghost: "border-0 bg-transparent hover:bg-accent/50",
    filled: "border-0 bg-muted/50 hover:bg-muted/80",
  } as const;

  const labelSize = size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm";

  // Radius based on size
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
    "aria-invalid": !!error,
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
      "group flex w-full items-center justify-between px-3 transition-all duration-200",
      radiusClass,
      sizeStyles[size],
      variantStyles[variant],
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary",
      "disabled:cursor-not-allowed disabled:opacity-50",
      open && "ring-2 ring-primary/20 border-primary",
      !!error && "border-destructive focus-visible:ring-destructive/30",
      className,
    ),
  };

  const triggerContents = (
    <>
      {/* Selected icon if exists */}
      {selectedIcon && <span className="shrink-0 w-5 h-5 mr-2 flex items-center justify-center text-primary">{selectedIcon}</span>}

      {/* Value display */}
      <span className={cn("flex-1 truncate text-left", !displayValue && "text-muted-foreground", fontBold && "font-semibold")}>
        {renderValue && selectedOption ? renderValue(selectedOption) : displayValue || placeholder}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1.5 ml-2 shrink-0">
        {allowClear && value && !disabled && (
          <div
            role="button"
            tabIndex={0}
            aria-label="Clear selection"
            onClick={handleClear}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleClear(e as any)}
            className={cn(
              "opacity-0 group-hover:opacity-100 transition-all duration-200",
              "p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive",
            )}
          >
            <X className="h-3.5 w-3.5" />
          </div>
        )}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-all duration-300 ease-out",
            open && "rotate-180 text-primary",
            !open && "group-hover:text-foreground",
          )}
        />
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
              <div className="rounded-2xl border text-popover-foreground shadow-md backdrop-blur-sm bg-popover/95 border-border/60">
                {dropdownBody}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Helper text / Error message */}
      {(helperText || error) && (
        <p className={cn("text-xs transition-colors duration-200 flex items-center gap-1.5", error ? "text-destructive" : "text-muted-foreground")}>
          {error && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {error || helperText}
        </p>
      )}
    </div>
  );
};
