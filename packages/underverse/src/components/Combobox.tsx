"use client";

import * as React from "react";
import { useId } from "react";
import { useVirtualizer, type VirtualItem } from "@tanstack/react-virtual";
import { cn } from "../utils/cn";
import { useSmartTranslations } from "../hooks/useSmartTranslations";
import { useGlobalI18n } from "../contexts/GlobalI18nContext";
import { ChevronDown, Search, SearchX, Check, X } from "lucide-react";
import { useShadCNAnimations } from "../utils/animations";
import { Popover } from "./Popover";
import { useOverlayScrollbarTarget } from "./OverlayScrollbarProvider";
import { getBorderRadiusClass, getPanelBorderRadiusClass, type BorderMode } from "../utils/radius";
import { useUnderverseUIConfig } from "../contexts/UnderverseConfigContext";
import { formControlFixedClass, formControlSizeStyles, formControlValueClass } from "./form-control-size";

// --- PROPS ---
export type ComboboxOption = string | { label: string; value: any; icon?: React.ReactNode; description?: string; disabled?: boolean };

/** Public props for the `Combobox` component. */
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
  /** Custom class for label */
  labelClassName?: string;
  required?: boolean;
  fontBold?: boolean;
  loading?: boolean;
  loadingText?: string;
  // New props
  borderMode?: BorderMode;
  showSelectedIcon?: boolean;
  maxHeight?: number;
  groupBy?: (option: ComboboxOption) => string;
  renderOption?: (option: ComboboxOption, isSelected: boolean) => React.ReactNode;
  renderValue?: (option: ComboboxOption) => React.ReactNode;
  /** Selected option fallback for manual/server search when options does not contain the current value. */
  selectedOption?: ComboboxOption;
  error?: string;
  helperText?: string;
  /** Enable OverlayScrollbars on dropdown options list. Default: true when not virtualized */
  useOverlayScrollbar?: boolean;
  /** Virtualize large flat option lists. Grouped lists fall back to normal rendering. Default: false */
  virtualized?: boolean;
  /** Estimated option row height used by virtualized rendering. Default: 44 */
  estimatedItemHeight?: number;
  /** Number of extra rows rendered above and below the visible range. Default: 8 */
  overscan?: number;
  /** Use "manual" to let callers provide server-filtered options via onSearchChange. Default: "auto" */
  searchMode?: "auto" | "manual";
  /** Called whenever the search query changes. Required for manual/server search. */
  onSearchChange?: (query: string) => void;
  /** Debounce delay for onSearchChange. Default: 0 */
  searchDebounceMs?: number;
  /** Minimum query length before showing options in manual/search-prompt mode. Default: 0 */
  minSearchLength?: number;
  /** Limit the number of rendered options before the user types a query. */
  maxInitialOptions?: number;
  /** Show a prompt instead of options while the query is shorter than minSearchLength. Default: false */
  showSearchPromptWhenEmptyQuery?: boolean;
  /** Match dropdown background to the computed background of the combobox trigger. Default: false */
  matchTriggerBackground?: boolean;
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

const comboboxScrollClassName = [
  "scrollbar-thin",
  "[scrollbar-width:thin]",
  "[scrollbar-color:color-mix(in_oklch,var(--muted-foreground)_28%,transparent)_transparent]",
  "[&::-webkit-scrollbar]:w-2",
  "[&::-webkit-scrollbar-track]:bg-transparent",
  "[&::-webkit-scrollbar-thumb]:rounded-full",
  "[&::-webkit-scrollbar-thumb]:border-2",
  "[&::-webkit-scrollbar-thumb]:border-solid",
  "[&::-webkit-scrollbar-thumb]:border-transparent",
  "[&::-webkit-scrollbar-thumb]:bg-clip-padding",
  "[&::-webkit-scrollbar-thumb]:bg-muted-foreground/25",
  "[&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/45",
].join(" ");

// --- MAIN COMPONENT ---
export const Combobox: React.FC<ComboboxProps> = ({
  id,
  options,
  value,
  onChange,
  placeholder: placeholderProp,
  searchPlaceholder: searchPlaceholderProp,
  emptyText: emptyTextProp,
  className,
  disabled = false,
  size = "md",
  variant = "default",
  allowClear = false,
  usePortal = true,
  label,
  labelClassName,
  required,
  fontBold = false,
  loading = false,
  loadingText: loadingTextProp,
  borderMode,
  showSelectedIcon = true,
  maxHeight = 280,
  groupBy,
  renderOption,
  renderValue,
  selectedOption: selectedOptionProp,
  error,
  helperText,
  useOverlayScrollbar = true,
  virtualized = false,
  estimatedItemHeight = 44,
  overscan = 8,
  searchMode = "auto",
  onSearchChange,
  searchDebounceMs = 0,
  minSearchLength = 0,
  maxInitialOptions,
  showSearchPromptWhenEmptyQuery = false,
  matchTriggerBackground = false,
}) => {
  const globalConfig = useUnderverseUIConfig();
  const resolvedBorderMode = borderMode ?? globalConfig.borderMode ?? "full";
  const radiusClass = getBorderRadiusClass(resolvedBorderMode);
  const tv = useSmartTranslations("ValidationInput");
  const gi18n = useGlobalI18n();
  const placeholder = placeholderProp ?? gi18n.selectPlaceholder ?? "Select…";
  const searchPlaceholder = searchPlaceholderProp ?? gi18n.searchPlaceholder ?? "Search…";
  const emptyText = emptyTextProp ?? gi18n.noResults ?? "No results found";
  const loadingText = loadingTextProp ?? gi18n.loading ?? "Loading...";
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [localRequiredError, setLocalRequiredError] = React.useState<string | undefined>();
  const [triggerBackgroundColor, setTriggerBackgroundColor] = React.useState<string>();

  // Inject ShadCN animations
  useShadCNAnimations();

  const inputRef = React.useRef<HTMLInputElement>(null);
  const optionsViewportRef = React.useRef<HTMLDivElement>(null);

  useOverlayScrollbarTarget(optionsViewportRef, { enabled: open && useOverlayScrollbar && !virtualized });

  // Stable ids for accessibility
  const autoId = useId();
  const resolvedId = id ? String(id) : `combobox-${autoId}`;
  const labelId = label ? `${resolvedId}-label` : undefined;

  // Enable search only when useful, or when controlled by server/manual mode.
  const enableSearch = options.length > 10 || searchMode === "manual" || minSearchLength > 0 || !!onSearchChange;
  const trimmedQuery = query.trim();
  const queryMeetsMinimum = trimmedQuery.length >= minSearchLength;
  const shouldPromptForSearch = minSearchLength > 0 && !queryMeetsMinimum && (searchMode === "manual" || showSearchPromptWhenEmptyQuery);

  // Filter options based on query (only when search enabled)
  const filteredOptions = React.useMemo(
    () => {
      if (shouldPromptForSearch) return [];
      if (!enableSearch || searchMode === "manual") return options;

      const normalizedQuery = trimmedQuery.toLowerCase();
      if (!normalizedQuery) return options;
      return options.filter((o) => getOptionLabel(o).toLowerCase().includes(normalizedQuery));
    },
    [enableSearch, options, searchMode, shouldPromptForSearch, trimmedQuery],
  );

  const renderLimitedOptions = React.useMemo(
    () => {
      if (trimmedQuery || maxInitialOptions === undefined || maxInitialOptions < 1) {
        return filteredOptions;
      }
      return filteredOptions.slice(0, maxInitialOptions);
    },
    [filteredOptions, maxInitialOptions, trimmedQuery],
  );

  const canVirtualize = virtualized && !groupBy;
  const optionVirtualizer = useVirtualizer({
    count: canVirtualize ? renderLimitedOptions.length : 0,
    getScrollElement: () => optionsViewportRef.current,
    estimateSize: () => estimatedItemHeight,
    initialRect: { width: 0, height: maxHeight },
    overscan,
    enabled: canVirtualize,
  });
  const virtualItems = canVirtualize ? optionVirtualizer.getVirtualItems() : [];

  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const updateTriggerBackgroundColor = React.useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const backgroundColor = window.getComputedStyle(trigger).backgroundColor;
    setTriggerBackgroundColor((current) => (current === backgroundColor ? current : backgroundColor));
  }, []);

  const scrollVirtualListToIndex = React.useCallback((index: number) => {
    if (!canVirtualize || renderLimitedOptions.length === 0) return;
    optionVirtualizer.scrollToIndex(index, { align: "auto" });
  }, [canVirtualize, optionVirtualizer, renderLimitedOptions.length]);

  const scrollVirtualListToStart = React.useCallback(() => {
    scrollVirtualListToIndex(0);
  }, [scrollVirtualListToIndex]);

  const moveActiveIndex = React.useCallback((direction: 1 | -1) => {
    if (renderLimitedOptions.length === 0) return;

    const next = activeIndex === null
      ? direction === 1 ? 0 : renderLimitedOptions.length - 1
      : (activeIndex + direction + renderLimitedOptions.length) % renderLimitedOptions.length;

    setActiveIndex(next);
    scrollVirtualListToIndex(next);
  }, [activeIndex, renderLimitedOptions.length, scrollVirtualListToIndex]);

  // Event Handlers
  const handleSelect = (option: ComboboxOption) => {
    if (getOptionDisabled(option)) return;
    const val = getOptionValue(option);
    if (val !== undefined && val !== null) {
      setLocalRequiredError(undefined);
      onChange(val);
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearValue();
  };

  const clearValue = () => {
    onChange(null);
    setOpen(false);
  };

  // Reset state when dropdown closes và focus input khi mở
  React.useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveIndex(null);
      scrollVirtualListToStart();
    } else if (enableSearch) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [enableSearch, open, scrollVirtualListToStart]);

  React.useEffect(() => {
    if (!onSearchChange) return undefined;
    const timeoutId = window.setTimeout(() => onSearchChange(query), searchDebounceMs);
    return () => window.clearTimeout(timeoutId);
  }, [onSearchChange, query, searchDebounceMs]);

  React.useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" &&
      options.length > 300 &&
      !virtualized &&
      searchMode !== "manual" &&
      maxInitialOptions === undefined
    ) {
      console.warn(
        "[Underverse UI] Combobox received more than 300 options without virtualization, manual search, or maxInitialOptions. Use virtualized, searchMode=\"manual\", or maxInitialOptions to avoid rendering a large dropdown.",
      );
    }
  }, [maxInitialOptions, options.length, searchMode, virtualized]);

  React.useLayoutEffect(() => {
    if (!open || !matchTriggerBackground) {
      setTriggerBackgroundColor(undefined);
      return undefined;
    }

    let raf = 0;
    const tick = () => {
      updateTriggerBackgroundColor();
      raf = window.requestAnimationFrame(tick);
    };
    tick();

    return () => window.cancelAnimationFrame(raf);
  }, [matchTriggerBackground, open, updateTriggerBackgroundColor]);

  // Get display values
  const selectedOption =
    findOptionByValue(options, value) ??
    (selectedOptionProp && getOptionValue(selectedOptionProp) === value ? selectedOptionProp : undefined);
  const displayValue = selectedOption ? getOptionLabel(selectedOption) : "";
  const selectedIcon = selectedOption ? getOptionIcon(selectedOption) : undefined;
  const hasValue = value !== undefined && value !== null && value !== "";
  const effectiveError = error ?? localRequiredError;

  React.useEffect(() => {
    if (disabled || !required || hasValue) {
      setLocalRequiredError(undefined);
    }
  }, [disabled, hasValue, required]);

  // Group options if groupBy is provided
  const groupedOptions = React.useMemo(() => {
    if (!groupBy) return null;
    const groups: Record<string, ComboboxOption[]> = {};
    renderLimitedOptions.forEach((opt) => {
      const group = groupBy(opt);
      if (!groups[group]) groups[group] = [];
      groups[group].push(opt);
    });
    return groups;
  }, [renderLimitedOptions, groupBy]);

  // Size styles for dropdown items
  const itemSizeStyles = {
    sm: "px-2.5 py-1.5 text-xs gap-2",
    md: "px-3 py-2.5 text-sm gap-3",
    lg: "px-4 py-3 text-base gap-3",
  } as const;

  const iconSizeStyles = {
    sm: formControlSizeStyles.sm.icon,
    md: formControlSizeStyles.md.icon,
    lg: formControlSizeStyles.lg.icon,
  } as const;

  const checkIconSizeStyles = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  } as const;

  // Render single option
  const renderOptionItem = (item: ComboboxOption, index: number, virtualItem?: VirtualItem) => {
    const itemValue = getOptionValue(item);
    const itemLabel = getOptionLabel(item);
    const itemIcon = getOptionIcon(item);
    const itemDescription = getOptionDescription(item);
    const itemDisabled = getOptionDisabled(item);
    const isSelected = itemValue === value;

    return (
      <li
        key={`${itemValue}-${index}`}
        ref={virtualItem ? optionVirtualizer.measureElement : undefined}
        data-index={virtualItem?.index}
        className="list-none"
        style={virtualItem ? {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          transform: `translateY(${virtualItem.start}px)`,
        } : undefined}
      >
        <button
          id={`${resolvedId}-item-${index}`}
          type="button"
          role="option"
          tabIndex={-1}
          disabled={itemDisabled}
          aria-selected={isSelected}
          onClick={() => handleSelect(item)}
          style={{
            animationDelay: open ? `${Math.min(index * 15, 150)}ms` : "0ms",
          }}
          className={cn(
            "dropdown-item group flex w-full items-center rounded-full text-left",
            itemSizeStyles[size],
            "outline-none focus:outline-none focus-visible:outline-none",
            "transition-all duration-150",
            !itemDisabled && "cursor-pointer hover:bg-accent/70 hover:shadow-sm",
            !itemDisabled && "focus:bg-accent/80 focus:text-accent-foreground",
            index === activeIndex && !itemDisabled && "bg-accent/60",
            isSelected && "bg-primary/10 text-primary font-medium",
            itemDisabled && "opacity-50 cursor-not-allowed",
          )}
        >
          {itemIcon && (
            <span
              className={cn("shrink-0 flex items-center justify-center", iconSizeStyles[size], isSelected ? "text-primary" : "text-muted-foreground")}
            >
              {itemIcon}
            </span>
          )}

          {renderOption ? (
            <div className="flex-1 min-w-0">{renderOption(item, isSelected)}</div>
          ) : (
            <div className="flex-1 min-w-0">
              <span className="block truncate">{itemLabel}</span>
              {itemDescription && (
                <span className={cn("block text-muted-foreground truncate mt-0.5", size === "sm" ? "text-[10px]" : "text-xs")}>
                  {itemDescription}
                </span>
              )}
            </div>
          )}

          {isSelected && showSelectedIcon && (
            <span className="shrink-0 ml-auto">
              <Check className={cn(checkIconSizeStyles[size], "text-primary")} />
            </span>
          )}
        </button>
      </li>
    );
  };

  const dropdownBody = (
    <div
      data-combobox-dropdown
      data-state={open ? "open" : "closed"}
      className={cn("w-full overflow-hidden", getPanelBorderRadiusClass(resolvedBorderMode))}
    >
      {/* Search Input (only when many options) */}
      {enableSearch && (
        <div className={cn("relative border-b border-border/30", size === "sm" ? "p-2" : size === "lg" ? "p-3" : "p-2.5")}>
          <div className="relative">
            <Search
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors peer-focus:text-primary",
                size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-5 w-5" : "h-4 w-4",
              )}
            />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(null);
                scrollVirtualListToStart();
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  moveActiveIndex(1);
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  moveActiveIndex(-1);
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  if (activeIndex !== null && renderLimitedOptions[activeIndex] && !getOptionDisabled(renderLimitedOptions[activeIndex])) {
                    handleSelect(renderLimitedOptions[activeIndex]);
                  }
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  setOpen(false);
                }
              }}
              placeholder={searchPlaceholder}
              className={cn(
                "peer w-full rounded-xl bg-muted/40 pr-3",
                size === "sm" ? "py-1.5 pl-8 text-xs" : size === "lg" ? "py-3 pl-10 text-base" : "py-2.5 pl-9 text-sm",
                "border border-transparent",
                "focus:outline-none focus:bg-background focus:border-primary/30 focus:ring-2 focus:ring-primary/10",
                "transition-all duration-200",
                "placeholder:text-muted-foreground/50",
              )}
              aria-autocomplete="list"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  scrollVirtualListToStart();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className={cn(size === "sm" ? "h-3 w-3" : size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5")} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Options List */}
      <div
        ref={optionsViewportRef}
        id={`${resolvedId}-listbox`}
        role="listbox"
        aria-labelledby={labelId}
        data-os-ignore={virtualized ? "" : undefined}
        className={cn("overflow-y-auto overscroll-contain", (!useOverlayScrollbar || virtualized) && comboboxScrollClassName)}
        style={{ maxHeight }}
      >
        <div className={cn(size === "sm" ? "p-1" : size === "lg" ? "p-2" : "p-1.5")}>
          {loading ? (
            <div className="px-3 py-10 text-center">
              <div className="flex flex-col items-center gap-3 animate-in fade-in-0 zoom-in-95 duration-300">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                </div>
                <span className="text-sm text-muted-foreground">{loadingText}</span>
              </div>
            </div>
          ) : shouldPromptForSearch ? (
            <div className="px-3 py-10 text-center">
              <div className="flex flex-col items-center gap-3 animate-in fade-in-0 zoom-in-95 duration-300">
                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                  <Search className="h-6 w-6 text-muted-foreground/60" />
                </div>
                <div className="space-y-1">
                  <span className="block text-sm font-medium text-foreground">Type at least {minSearchLength} characters to search</span>
                </div>
              </div>
            </div>
          ) : renderLimitedOptions.length > 0 ? (
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
              <ul
                className="space-y-0.5"
                style={canVirtualize ? { height: `${optionVirtualizer.getTotalSize()}px`, position: "relative" } : undefined}
              >
                {canVirtualize
                  ? virtualItems.map((virtualItem) => renderOptionItem(renderLimitedOptions[virtualItem.index], virtualItem.index, virtualItem))
                  : renderLimitedOptions.map((item, index) => renderOptionItem(item, index))}
              </ul>
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
                    onClick={() => {
                      setQuery("");
                      scrollVirtualListToStart();
                    }}
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
    sm: formControlSizeStyles.sm.control,
    md: formControlSizeStyles.md.control,
    lg: formControlSizeStyles.lg.control,
  } as const;

  // Variant styles
  const variantStyles = {
    default: "border border-input bg-background hover:bg-accent/5 hover:border-primary/40",
    outline: "border-2 border-input bg-transparent hover:border-primary/60",
    ghost: "border-0 bg-transparent hover:bg-accent/50",
    filled: "border-0 bg-muted/50 hover:bg-muted/80",
  } as const;

  const labelSize = formControlSizeStyles[size].label;

  const verticalGap = size === "sm" ? "space-y-1.5" : "space-y-2";
  const dropdownBackgroundStyle =
    matchTriggerBackground && triggerBackgroundColor
      ? ({ backgroundColor: triggerBackgroundColor } satisfies React.CSSProperties)
      : undefined;

  const triggerButtonBaseProps = {
    ref: triggerRef,
    type: "button" as const,
    disabled,
    role: "combobox" as const,
    "aria-haspopup": "listbox" as const,
    "aria-expanded": open,
    "aria-controls": `${resolvedId}-listbox`,
    "aria-required": required,
    "aria-invalid": !!effectiveError,
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
      "group flex w-full items-center justify-between transition-all duration-200",
      formControlFixedClass,
      radiusClass,
      sizeStyles[size],
      variantStyles[variant],
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary",
      "disabled:cursor-not-allowed disabled:opacity-50",
      open && "ring-2 ring-primary/20 border-primary",
      !!effectiveError && "border-destructive focus-visible:ring-destructive/30",
      className,
    ),
  };

  const triggerContents = (
    <>
      {/* Selected icon if exists */}
      {selectedIcon && <span className={cn("mr-2 flex shrink-0 items-center justify-center overflow-hidden text-primary", formControlSizeStyles[size].icon)}>{selectedIcon}</span>}

      {/* Value display */}
      <span className={cn(formControlValueClass, "text-left", !displayValue && "text-muted-foreground", fontBold && "font-semibold")}>
        {renderValue && selectedOption ? renderValue(selectedOption) : displayValue || placeholder}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1.5 ml-2 shrink-0">
        {allowClear && value && !disabled && (
          <div
            role="button"
            tabIndex={0}
            aria-label={gi18n.clearSelection ?? "Clear selection"}
            onClick={handleClear}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                clearValue();
              }
            }}
            className={cn(
              "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all duration-200",
              "p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50 focus-visible:ring-offset-1",
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
              effectiveError && "text-destructive",
              labelClassName,
            )}
          >
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        </div>
      )}
      <input
        tabIndex={-1}
        aria-hidden="true"
        value={hasValue ? "selected" : ""}
        onChange={() => {}}
        required={required}
        disabled={disabled}
        onInvalid={(e) => {
          e.preventDefault();
          setLocalRequiredError(tv("required"));
        }}
        className="pointer-events-none absolute h-0 w-0 opacity-0"
      />
      {usePortal ? (
        <Popover
          open={open}
          onOpenChange={setOpen}
          trigger={triggerButtonForPopover}
          placement="bottom-start"
          matchTriggerWidth
          className="z-50"
          borderMode={resolvedBorderMode}
          contentClassName="p-0 overflow-hidden"
          contentProps={{ style: dropdownBackgroundStyle }}
        >
          {dropdownBody}
        </Popover>
      ) : (
        <div className="relative">
          {triggerButtonInline}
          {open && (
            <div className="absolute left-0 top-full mt-1 z-50 w-full">
              <div
                style={dropdownBackgroundStyle}
                className={cn("overflow-hidden border text-popover-foreground shadow-md backdrop-blur-sm bg-popover/95 border-border/60", getPanelBorderRadiusClass(resolvedBorderMode))}
              >
                {dropdownBody}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Helper text / Error message */}
      {(helperText || effectiveError) && (
        <p
          className={cn(
            "text-xs transition-colors duration-200 flex items-center gap-1.5",
            effectiveError ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {effectiveError && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {effectiveError || helperText}
        </p>
      )}
    </div>
  );
};
