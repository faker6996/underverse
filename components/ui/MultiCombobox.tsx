"use client";

import * as React from "react";
import { useId } from "react";
// Removed floating-ui dependencies
import { cn } from "@/lib/utils/cn";
import { ChevronDown, Search, Check, SearchX, Loader2 } from "lucide-react";
import { useShadCNAnimations } from "@/lib/utils/shadcn-animations";
import { Popover } from "./Popover";

export interface MultiComboboxOption {
  value: string;
  label: string;
}

export interface MultiComboboxProps {
  id?: string;
  options: Array<string | MultiComboboxOption>;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  maxSelected?: number;
  disabledOptions?: string[];
  showTags?: boolean;
  showClear?: boolean;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string;
  title?: string;
  required?: boolean;
  displayFormat?: (option: MultiComboboxOption) => string;
  loading?: boolean;
  loadingText?: string;
  emptyText?: string;
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
  size = "md",
  label,
  title,
  required,
  displayFormat = (option) => option.label,
  loading = false,
  loadingText = "Loading...",
  emptyText = "No results found",
}) => {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<Array<HTMLElement | null>>([]);

  const triggerRef = React.useRef<HTMLButtonElement>(null);

  // Inject ShadCN animations
  useShadCNAnimations();

  // Normalize options to objects { value, label } to support both string[] and object[] APIs
  const normalizedOptions = React.useMemo<MultiComboboxOption[]>(
    () => options.map((o) => (typeof o === "string" ? { value: o, label: o } : { value: o.value, label: o.label })),
    [options],
  );

  // Enable search only if options.length > 10
  const enableSearch = normalizedOptions.length > 10;

  const filtered = React.useMemo(
    () => (enableSearch ? normalizedOptions.filter((opt) => opt.label.toLowerCase().includes(query.toLowerCase())) : normalizedOptions),
    [normalizedOptions, query, enableSearch],
  );

  const toggleSelect = (optionValue: string) => {
    if (disabledOptions.includes(optionValue)) return;
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      if (!maxSelected || value.length < maxSelected) {
        onChange([...value, optionValue]);
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
        toggleSelect(filtered[activeIndex].value);
      }
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  // Auto-focus input when dropdown opens (only if search is enabled)
  React.useEffect(() => {
    if (open && enableSearch) {
      // Focus input after dropdown is positioned
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open, enableSearch]);

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
  const labelSize = size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm";
  const listboxId = `${resolvedId}-listbox`;

  const dropdownBody = (
    <div data-combobox-dropdown data-state={open ? "open" : "closed"} className="w-full">
      {/* Clear all button in dropdown */}
      {showClear && value.length > 0 && (
        <div className="px-3 py-2 border-b border-border/60 flex justify-end">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClearAll();
            }}
            className="text-xs text-muted-foreground hover:underline cursor-pointer"
          >
            Clear all
          </button>
        </div>
      )}

      {enableSearch && (
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
            className={cn("w-full rounded-t-xl bg-transparent focus:outline-none cursor-text", sizeStyles[size].search)}
          />
        </div>
      )}

      <ul
        id={listboxId}
        role="listbox"
        className={cn("max-h-60 overflow-y-auto p-1", size === "lg" ? "text-base" : size === "sm" ? "text-xs" : "text-sm")}
      >
        {loading ? (
          <li className="px-3 py-8 text-center">
            <div className="flex flex-col items-center gap-2 animate-in fade-in-0 zoom-in-95 duration-300">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-muted-foreground">{loadingText}</span>
            </div>
          </li>
        ) : filtered.length ? (
          filtered.map((item, index) => {
            const isSelected = value.includes(item.value);
            const isDisabled = disabledOptions.includes(item.value);

            return (
              <li
                key={item.value}
                ref={(node) => {
                  listRef.current[index] = node;
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleSelect(item.value);
                  inputRef.current?.focus();
                }}
                style={{
                  animationDelay: open ? `${Math.min(index * 20, 200)}ms` : "0ms",
                }}
                className={cn(
                  "dropdown-item flex cursor-pointer items-center justify-between rounded-lg transition-colors",
                  sizeStyles[size].item,
                  "hover:bg-accent hover:text-accent-foreground",
                  index === activeIndex && "bg-accent text-accent-foreground",
                  isDisabled && "opacity-50 cursor-not-allowed pointer-events-none",
                )}
              >
                {item.label}
                {isSelected && <Check className={sizeStyles[size].icon} />}
              </li>
            );
          })
        ) : (
          <li className={cn("px-3 py-8 text-center text-muted-foreground", size === "lg" ? "text-base" : size === "sm" ? "text-xs" : "text-sm")}>
            <div className="flex flex-col items-center gap-2 animate-in fade-in-0 zoom-in-95 duration-300">
              <SearchX className="h-8 w-8 opacity-40 text-muted-foreground" />
              <span>{emptyText}</span>
              {query && (
                <button type="button" onClick={() => setQuery("")} className="text-xs text-primary hover:underline">
                  Clear search
                </button>
              )}
            </div>
          </li>
        )}
      </ul>
    </div>
  );

  const triggerButton = (
    <button
      ref={triggerRef}
      type="button"
      disabled={disabled}
      id={resolvedId}
      aria-labelledby={labelId}
      role="combobox"
      aria-haspopup="listbox"
      aria-expanded={open}
      aria-controls={listboxId}
      className={cn(
        "flex w-full items-center gap-2 rounded-2xl border border-input bg-background shadow-sm min-h-10",
        "px-3 py-2",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:cursor-not-allowed disabled:opacity-50",
      )}
    >
      <div className="flex items-center gap-1 flex-wrap min-h-6 flex-1">
        {value.length > 0 ? (
          showTags ? (
            value.map((itemValue) => {
              const option = normalizedOptions.find((o) => o.value === itemValue);
              return (
                <span key={itemValue} className="inline-flex items-center gap-1 bg-accent text-accent-foreground rounded-lg px-2 py-1 text-xs">
                  <span className="truncate max-w-30">{option ? displayFormat(option) : itemValue}</span>
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={`Remove ${option ? displayFormat(option) : itemValue}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemove(itemValue);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemove(itemValue);
                      }
                    }}
                    className="hover:text-destructive transition-colors cursor-pointer select-none"
                  >
                    ×
                  </span>
                </span>
              );
            })
          ) : (
            <span className="truncate text-sm">{value.length} selected</span>
          )
        ) : (
          <span className="text-muted-foreground">{placeholder || "Select..."}</span>
        )}
      </div>
      <ChevronDown
        className={cn("opacity-50 transition-all duration-200", sizeStyles[size].icon, open && "rotate-180 scale-110 text-primary opacity-100")}
      />
    </button>
  );

  return (
    <div className={cn("w-full space-y-2 group", className)}>
      {/* Title */}
      {title && (
        <div className="flex items-center justify-between">
          <label
            className={cn(
              size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm",
              "font-medium transition-colors duration-200",
              disabled ? "text-muted-foreground" : "text-foreground group-focus-within:text-primary",
            )}
          >
            {title}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        </div>
      )}

      {/* Label */}
      {label && (
        <label
          id={labelId}
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
      )}

      <Popover
        open={open}
        onOpenChange={setOpen}
        trigger={triggerButton}
        placement="bottom-start"
        matchTriggerWidth
        className="z-9999"
        contentClassName="p-0"
      >
        {dropdownBody}
      </Popover>
    </div>
  );
};
