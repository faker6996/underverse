"use client";

import * as React from "react";
import { useId } from "react";
import { cn } from "@/lib/utils/cn";
import { ChevronDown, Search, Check, SearchX, Loader2, X, Sparkles } from "lucide-react";
import { useShadCNAnimations } from "@/lib/utils/shadcn-animations";
import { Popover } from "./Popover";

export interface MultiComboboxOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  disabled?: boolean;
  group?: string;
}

export interface MultiComboboxProps {
  id?: string;
  options: Array<string | MultiComboboxOption>;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  maxSelected?: number;
  disabledOptions?: string[];
  showTags?: boolean;
  showClear?: boolean;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
  label?: string;
  title?: string;
  required?: boolean;
  displayFormat?: (option: MultiComboboxOption) => string;
  loading?: boolean;
  loadingText?: string;
  emptyText?: string;
  // New props
  showSelectedIcons?: boolean;
  maxHeight?: number;
  groupBy?: (option: MultiComboboxOption) => string;
  renderOption?: (option: MultiComboboxOption, isSelected: boolean) => React.ReactNode;
  renderTag?: (option: MultiComboboxOption, onRemove: () => void) => React.ReactNode;
  error?: string;
  helperText?: string;
  maxTagsVisible?: number;
}

// Helper functions
const getOptionIcon = (option: MultiComboboxOption | string): React.ReactNode | undefined => {
  return typeof option === "string" ? undefined : option.icon;
};

const getOptionDescription = (option: MultiComboboxOption | string): string | undefined => {
  return typeof option === "string" ? undefined : option.description;
};

const getOptionDisabled = (option: MultiComboboxOption | string): boolean => {
  return typeof option === "string" ? false : (option.disabled ?? false);
};

export const MultiCombobox: React.FC<MultiComboboxProps> = ({
  id,
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  maxSelected,
  disabledOptions = [],
  showTags = true,
  showClear = true,
  className,
  disabled = false,
  size = "md",
  variant = "default",
  label,
  title,
  required,
  displayFormat = (option) => option.label,
  loading = false,
  loadingText = "Loading...",
  emptyText = "No results found",
  showSelectedIcons = true,
  maxHeight = 280,
  groupBy,
  renderOption,
  renderTag,
  error,
  helperText,
  maxTagsVisible = 3,
}) => {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<Array<HTMLElement | null>>([]);

  const triggerRef = React.useRef<HTMLButtonElement>(null);

  // Inject ShadCN animations
  useShadCNAnimations();

  // Normalize options to objects with all properties
  const normalizedOptions = React.useMemo<MultiComboboxOption[]>(
    () =>
      options.map((o) =>
        typeof o === "string"
          ? { value: o, label: o }
          : { value: o.value, label: o.label, icon: o.icon, description: o.description, disabled: o.disabled, group: o.group },
      ),
    [options],
  );

  // Enable search only if options.length > 10
  const enableSearch = normalizedOptions.length > 10;

  const filtered = React.useMemo(
    () =>
      enableSearch
        ? normalizedOptions.filter(
            (opt) => opt.label.toLowerCase().includes(query.toLowerCase()) || opt.description?.toLowerCase().includes(query.toLowerCase()),
          )
        : normalizedOptions,
    [normalizedOptions, query, enableSearch],
  );

  // Group options if groupBy is provided
  const groupedOptions = React.useMemo(() => {
    if (!groupBy) return null;
    const groups = new Map<string, MultiComboboxOption[]>();
    filtered.forEach((opt) => {
      const group = groupBy(opt);
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group)!.push(opt);
    });
    return groups;
  }, [filtered, groupBy]);

  const toggleSelect = (optionValue: string) => {
    const option = normalizedOptions.find((o) => o.value === optionValue);
    if (option?.disabled || disabledOptions.includes(optionValue)) return;
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
      search: "px-10 py-2 text-sm",
      item: "text-sm px-3 py-2",
      tag: "px-2 py-1 text-xs",
    },
    lg: {
      trigger: "h-12 px-5 py-3 text-base",
      icon: "h-5 w-5",
      search: "px-10 py-3 text-base",
      item: "text-base px-3 py-3",
      tag: "px-2.5 py-1 text-sm",
    },
  } as const;

  const variantStyles = {
    default: "border border-input bg-background shadow-sm hover:border-primary/50",
    outline: "border-2 border-input bg-transparent hover:border-primary",
    ghost: "border border-transparent bg-muted/50 hover:bg-muted",
  } as const;

  const autoId = useId();
  const resolvedId = id ? String(id) : `multicombobox-${autoId}`;
  const labelId = label ? `${resolvedId}-label` : undefined;
  const labelSize = size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm";
  const listboxId = `${resolvedId}-listbox`;

  // Render a single option
  const renderOptionItem = (item: MultiComboboxOption, index: number) => {
    const isSelected = value.includes(item.value);
    const isDisabled = item.disabled || disabledOptions.includes(item.value);
    const optionIcon = item.icon;
    const optionDesc = item.description;
    const isEven = index % 2 === 0;

    if (renderOption) {
      return (
        <li
          key={item.value}
          ref={(node) => {
            listRef.current[index] = node;
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isDisabled) toggleSelect(item.value);
            inputRef.current?.focus();
          }}
          style={{ animationDelay: open ? `${Math.min(index * 20, 200)}ms` : "0ms" }}
          className={cn("dropdown-item", isEven && "bg-muted/25", isDisabled && "opacity-50 cursor-not-allowed pointer-events-none")}
        >
          {renderOption(item, isSelected)}
        </li>
      );
    }

    return (
      <li
        key={item.value}
        ref={(node) => {
          listRef.current[index] = node;
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!isDisabled) toggleSelect(item.value);
          inputRef.current?.focus();
        }}
        style={{ animationDelay: open ? `${Math.min(index * 20, 200)}ms` : "0ms" }}
        className={cn(
          "dropdown-item flex cursor-pointer items-center gap-3 rounded-lg transition-all duration-200",
          sizeStyles[size].item,
          isEven && "bg-muted/25",
          "hover:bg-accent/70 hover:shadow-sm",
          index === activeIndex && "bg-accent/60",
          isSelected && "bg-primary/10 text-primary font-medium",
          isDisabled && "opacity-40 cursor-not-allowed pointer-events-none",
        )}
      >
        {/* Checkbox indicator */}
        <span
          className={cn(
            "shrink-0 w-5 h-5 flex items-center justify-center rounded-md border-2 transition-all duration-200",
            isSelected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30 bg-transparent",
          )}
        >
          {isSelected && <Check className="w-3 h-3" />}
        </span>

        {/* Icon if exists */}
        {optionIcon && <span className="shrink-0 w-5 h-5 flex items-center justify-center text-muted-foreground">{optionIcon}</span>}

        {/* Label and description */}
        <div className="flex-1 min-w-0">
          <div className={cn("truncate", isSelected && "font-medium text-primary")}>{item.label}</div>
          {optionDesc && <div className="text-xs text-muted-foreground truncate mt-0.5">{optionDesc}</div>}
        </div>
      </li>
    );
  };

  const dropdownBody = (
    <div data-combobox-dropdown data-state={open ? "open" : "closed"} className="w-full rounded-2xl md:rounded-3xl overflow-hidden">
      {/* Header with selected count and clear */}
      {value.length > 0 && (
        <div className="px-3 py-2 border-b border-border/40 flex items-center justify-between bg-muted/30">
          <span className="text-xs font-medium text-muted-foreground">
            {value.length} selected{maxSelected && ` / ${maxSelected} max`}
          </span>
          {showClear && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleClearAll();
              }}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors cursor-pointer flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Search input */}
      {enableSearch && (
        <div className="relative border-b border-border/40">
          <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground", sizeStyles[size].icon)} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder={searchPlaceholder}
            className={cn("w-full bg-transparent focus:outline-none cursor-text placeholder:text-muted-foreground/60", sizeStyles[size].search)}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Options list */}
      <ul
        id={listboxId}
        role="listbox"
        aria-multiselectable="true"
        style={{ maxHeight }}
        className={cn("overflow-y-auto p-1.5", size === "lg" ? "text-base" : size === "sm" ? "text-xs" : "text-sm")}
      >
        {loading ? (
          <li className="px-3 py-8 text-center">
            <div className="flex flex-col items-center gap-3 animate-in fade-in-0 zoom-in-95 duration-300">
              <div className="relative">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <Sparkles className="h-4 w-4 text-primary/60 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <span className="text-muted-foreground font-medium">{loadingText}</span>
            </div>
          </li>
        ) : filtered.length ? (
          groupedOptions ? (
            // Render grouped options
            Array.from(groupedOptions.entries()).map(([group, items]) => (
              <li key={group} className="mb-2">
                <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider sticky top-0 bg-popover/95 backdrop-blur-sm">
                  {group}
                </div>
                <ul>{items.map((item) => renderOptionItem(item, filtered.indexOf(item)))}</ul>
              </li>
            ))
          ) : (
            // Render flat options
            filtered.map((item, index) => renderOptionItem(item, index))
          )
        ) : (
          <li className={cn("px-3 py-8 text-center text-muted-foreground")}>
            <div className="flex flex-col items-center gap-3 animate-in fade-in-0 zoom-in-95 duration-300">
              <SearchX className="h-10 w-10 opacity-30 text-muted-foreground" />
              <div className="space-y-1">
                <span className="font-medium block">{emptyText}</span>
                {query && <span className="text-xs opacity-60">Try a different search term</span>}
              </div>
              {query && (
                <button type="button" onClick={() => setQuery("")} className="text-xs text-primary hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" />
                  Clear search
                </button>
              )}
            </div>
          </li>
        )}
      </ul>
    </div>
  );

  // Selected options for rendering tags
  const selectedOptions = value.map((v) => normalizedOptions.find((o) => o.value === v)).filter(Boolean) as MultiComboboxOption[];
  const visibleTags = maxTagsVisible ? selectedOptions.slice(0, maxTagsVisible) : selectedOptions;
  const hiddenCount = maxTagsVisible ? Math.max(0, selectedOptions.length - maxTagsVisible) : 0;

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
      aria-invalid={!!error}
      className={cn(
        "group flex w-full items-center gap-2 rounded-full min-h-10 transition-all duration-200",
        "px-3 py-2",
        variantStyles[variant],
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        open && "ring-2 ring-primary/20 border-primary",
        !!error && "border-destructive focus-visible:ring-destructive/30",
      )}
    >
      <div className="flex items-center gap-1.5 flex-wrap min-h-6 flex-1">
        {value.length > 0 ? (
          showTags ? (
            <>
              {visibleTags.map((option) => {
                if (renderTag) {
                  return <React.Fragment key={option.value}>{renderTag(option, () => handleRemove(option.value))}</React.Fragment>;
                }
                return (
                  <span
                    key={option.value}
                    className={cn(
                      "inline-flex items-center gap-1.5 bg-primary/10 text-primary rounded-lg transition-all duration-200",
                      "hover:bg-primary/20",
                      sizeStyles[size].tag,
                    )}
                  >
                    {showSelectedIcons && option.icon && <span className="shrink-0 w-3.5 h-3.5 flex items-center justify-center">{option.icon}</span>}
                    <span className="truncate max-w-24">{displayFormat(option)}</span>
                    <span
                      role="button"
                      tabIndex={0}
                      aria-label={`Remove ${displayFormat(option)}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemove(option.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemove(option.value);
                        }
                      }}
                      className="hover:text-destructive transition-colors cursor-pointer select-none hover:bg-destructive/10 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </span>
                  </span>
                );
              })}
              {hiddenCount > 0 && (
                <span className={cn("inline-flex items-center bg-muted text-muted-foreground rounded-lg", sizeStyles[size].tag)}>
                  +{hiddenCount} more
                </span>
              )}
            </>
          ) : (
            <span className="truncate text-sm font-medium">
              {value.length} item{value.length > 1 ? "s" : ""} selected
            </span>
          )
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {showClear && value.length > 0 && (
          <div
            role="button"
            tabIndex={0}
            aria-label="Clear all"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClearAll();
            }}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleClearAll()}
            className="opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
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
        contentClassName="p-0 overflow-hidden rounded-2xl md:rounded-3xl"
      >
        {dropdownBody}
      </Popover>

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
