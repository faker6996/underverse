"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronRight, ChevronDown, FolderTree, Layers, Search, SearchX, X } from "lucide-react";
import { cn } from "../utils/cn";
import { useSmartTranslations } from "../hooks/useSmartTranslations";
import { useOverlayScrollbarTarget } from "./OverlayScrollbarProvider";
import { Label } from "./label";
import { Popover } from "./Popover";

export interface Category {
  id: number;
  name: string;
  parent_id?: number | null;
  icon?: React.ReactNode;
}

export interface CategoryTreeSelectLabels {
  /** Text shown when no categories available */
  emptyText?: string;
  /** Text shown when categories are selected, receives count as parameter */
  selectedText?: (count: number) => string;
  /** Placeholder text for search input (when enabled) */
  searchPlaceholder?: string;
  /** Text shown when search yields no results */
  noResultsText?: string;
}

// Base props shared between multi and single select
export interface CategoryTreeSelectBaseProps {
  id?: string;
  label?: string;
  labelClassName?: string;
  categories: Category[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost" | "filled";
  allowClear?: boolean;
  error?: string;
  helperText?: string;
  /** When true, renders as a read-only tree view without select functionality */
  viewOnly?: boolean;
  /** Default expanded state for all nodes */
  defaultExpanded?: boolean;
  /**
   * Enable search input for filtering categories.
   * Default: auto-enabled when `categories.length > 10` (similar to MultiCombobox).
   */
  enableSearch?: boolean;
  /** i18n labels for localization */
  labels?: CategoryTreeSelectLabels;
  /** When true, render tree directly without dropdown trigger */
  inline?: boolean;
  /** Callback when a node is clicked (useful for navigation) */
  onNodeClick?: (node: Category) => void;
  /** Custom class for the tree container */
  className?: string;
  /** Enable OverlayScrollbars for dropdown tree viewport. Default: false */
  useOverlayScrollbar?: boolean;
  /** When true, only leaf nodes can be selected; parent nodes only expand/collapse */
  leafOnlySelect?: boolean;
}

// Multi-select mode (default)
export interface CategoryTreeSelectMultiProps extends CategoryTreeSelectBaseProps {
  singleSelect?: false;
  value?: number[];
  onChange?: (selectedIds: number[]) => void;
}

// Single-select mode
export interface CategoryTreeSelectSingleProps extends CategoryTreeSelectBaseProps {
  singleSelect: true;
  value?: number | null;
  onChange?: (selectedId: number | null) => void;
}

export type CategoryTreeSelectProps = CategoryTreeSelectMultiProps | CategoryTreeSelectSingleProps;

const defaultLabels: Required<CategoryTreeSelectLabels> = {
  emptyText: "No categories",
  selectedText: (count) => `${count} selected`,
  searchPlaceholder: "Search...",
  noResultsText: "No results found",
};

const TREE_NODE_BASE_PADDING_REM = 0.75;
const TREE_NODE_INDENT_REM = 1;
const TREE_BRANCH_OFFSET_CLASS = "ml-1.5 pl-1.5";
const TREE_NODE_GAP_CLASS = "gap-1.5";
const TREE_EXPANDER_PLACEHOLDER_CLASS = "w-5";

function getInitialExpandedNodes(categories: Category[], defaultExpanded: boolean, viewOnly: boolean, inline: boolean) {
  if (!(viewOnly || inline) || !defaultExpanded) return new Set<number>();

  const parentIds = new Set<number>();
  for (const category of categories) {
    if (typeof category.parent_id === "number") {
      parentIds.add(category.parent_id);
    }
  }

  return parentIds;
}

export function CategoryTreeSelect(props: CategoryTreeSelectProps) {
  const tv = useSmartTranslations("ValidationInput");
  const {
    id,
    label,
    labelClassName,
    categories,
    placeholder = "Select category",
    disabled,
    required = false,
    size = "md",
    variant = "default",
    allowClear = false,
    error,
    helperText,
    viewOnly = false,
    defaultExpanded = false,
    enableSearch,
    labels,
    inline = false,
    onNodeClick,
    className,
    useOverlayScrollbar = false,
    leafOnlySelect = false,
    singleSelect = false,
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(() => getInitialExpandedNodes(categories, defaultExpanded, viewOnly, inline));
  const [query, setQuery] = useState("");
  const [localRequiredError, setLocalRequiredError] = useState<string | undefined>();
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const dropdownViewportRef = useRef<HTMLDivElement | null>(null);

  useOverlayScrollbarTarget(dropdownViewportRef, { enabled: useOverlayScrollbar });

  const autoId = useId();
  const resolvedId = id ? String(id) : `category-tree-select-${autoId}`;
  const labelId = label ? `${resolvedId}-label` : undefined;
  const effectiveError = error ?? localRequiredError;
  const helperId = helperText && !effectiveError ? `${resolvedId}-helper` : undefined;
  const errorId = effectiveError ? `${resolvedId}-error` : undefined;
  const describedBy = errorId || helperId;

  // Merge user labels with defaults
  const mergedLabels = { ...defaultLabels, ...labels };

  // Normalize value to array for internal use
  const valueArray = useMemo<number[]>(
    () => (singleSelect ? (props.value != null ? [props.value as number] : []) : ((props.value as number[] | undefined) ?? [])),
    [props.value, singleSelect],
  );
  const selectedIds = useMemo(() => new Set(valueArray), [valueArray]);

  const { parentCategories, childrenMap, byId } = useMemo(() => {
    const byId = new Map<number, Category>();
    const childrenMap = new Map<number, Category[]>();
    const parentCategories: Category[] = [];

    for (const cat of categories) byId.set(cat.id, cat);

    for (const cat of categories) {
      if (cat.parent_id == null) {
        parentCategories.push(cat);
        continue;
      }
      if (!childrenMap.has(cat.parent_id)) childrenMap.set(cat.parent_id, []);
      childrenMap.get(cat.parent_id)!.push(cat);
    }

    return { parentCategories, childrenMap, byId };
  }, [categories]);

  const isSearchEnabled = useMemo(() => enableSearch ?? categories.length > 10, [enableSearch, categories.length]);
  const normalizedQuery = useMemo(() => query.trim().toLowerCase(), [query]);
  const isSearchMode = isSearchEnabled && normalizedQuery.length > 0;

  const visibleIds = useMemo(() => {
    if (!isSearchMode) return null;

    const matches = categories.filter((c) => c.name.toLowerCase().includes(normalizedQuery));
    if (matches.length === 0) return new Set<number>();

    const visible = new Set<number>();

    const addAncestors = (cat: Category) => {
      let cur: Category | undefined = cat;
      let guard = 0;
      while (cur && cur.parent_id != null && guard++ < categories.length) {
        const pid = cur.parent_id;
        if (typeof pid !== "number") break;
        if (visible.has(pid)) {
          cur = byId.get(pid);
          continue;
        }
        visible.add(pid);
        cur = byId.get(pid);
      }
    };

    const addDescendants = (rootId: number) => {
      const stack: number[] = [rootId];
      let guard = 0;
      while (stack.length > 0 && guard++ < categories.length * 3) {
        const id = stack.pop()!;
        const children = childrenMap.get(id) ?? [];
        for (const child of children) {
          if (visible.has(child.id)) continue;
          visible.add(child.id);
          stack.push(child.id);
        }
      }
    };

    for (const m of matches) {
      visible.add(m.id);
      addAncestors(m);
      addDescendants(m.id);
    }

    return visible;
  }, [byId, categories, childrenMap, isSearchMode, normalizedQuery]);

  // Auto-focus search input when dropdown opens (when enabled)
  useEffect(() => {
    if (!isOpen) return;
    if (!isSearchEnabled) return;
    const t = setTimeout(() => searchInputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [isOpen, isSearchEnabled]);

  useEffect(() => {
    if (disabled || !required || valueArray.length > 0) {
      setLocalRequiredError(undefined);
    }
  }, [disabled, required, valueArray.length]);

  const toggleExpand = (id: number) => {
    if (isSearchMode) return;
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const handleSelect = (categoryId: number, category: Category) => {
    if (viewOnly) return;

    const hasChildren = (childrenMap.get(categoryId) ?? []).length > 0;

    // Call onNodeClick if provided
    onNodeClick?.(category);

    if (leafOnlySelect && hasChildren) {
      toggleExpand(categoryId);
      return;
    }

    setLocalRequiredError(undefined);

    // If no onChange, just handle the click callback
    if (!props.onChange) return;

    if (singleSelect) {
      // Single select mode
      const onChange = props.onChange as (id: number | null) => void;
      const currentValue = props.value as number | null | undefined;

      if (currentValue === categoryId) {
        // Deselect if clicking same item
        onChange(null);
      } else {
        onChange(categoryId);
      }
      // Close dropdown if not inline
      if (!inline) {
        handleOpenChange(false);
      }
    } else {
      // Multi select mode
      const onChange = props.onChange as (ids: number[]) => void;
      const newSelected = new Set(valueArray);

      if (newSelected.has(categoryId)) {
        // Unselect
        newSelected.delete(categoryId);

        // Also unselect children if it's a parent
        const children = childrenMap.get(categoryId) || [];
        children.forEach((child) => newSelected.delete(child.id));
      } else {
        // Select
        newSelected.add(categoryId);

        // Also select parent if this is a child
        if (category.parent_id) {
          newSelected.add(category.parent_id);
        }
      }

      onChange(Array.from(newSelected));
    }
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const children = effectiveChildrenMap.get(category.id) || [];
    const hasChildren = children.length > 0;
    const isExpanded = hasChildren && (isSearchMode || expandedNodes.has(category.id));
    const isSelected = selectedIds.has(category.id);
    const isSelectable = !viewOnly && (!leafOnlySelect || !hasChildren);

    return (
      <div
        key={category.id}
        className="min-w-0 animate-in fade-in-50 duration-200 [content-visibility:auto] [contain-intrinsic-size:44px]"
        style={{ animationDelay: `${level * 30}ms` }}
      >
        <div
          onClick={() => !viewOnly && handleSelect(category.id, category)}
          className={cn(
            "relative flex min-w-0 items-center px-3 py-2.5 min-h-11 transition-all duration-200 rounded-3xl",
            TREE_NODE_GAP_CLASS,
            !viewOnly && (isSelectable ? "cursor-pointer" : "cursor-default"),
            isSelectable && !isSelected && "hover:bg-accent/50",
            // Selected state - đồng bộ cho tất cả
            !viewOnly && isSelected && "bg-accent/40",
          )}
          style={{ paddingLeft: `${level * TREE_NODE_INDENT_REM + TREE_NODE_BASE_PADDING_REM}rem` }}
        >
          {/* Left indicator removed - using border instead */}

          {/* Expand/Collapse button */}
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(category.id);
              }}
              className={cn(
                "p-0.5 rounded-lg transition-all duration-200",
                "hover:scale-110 active:scale-95",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                isExpanded && "text-primary",
                isSearchMode && "opacity-60 cursor-not-allowed hover:scale-100 active:scale-100",
              )}
              disabled={isSearchMode}
            >
              <div className={cn("transition-transform duration-200", isExpanded && "rotate-90")}>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          ) : (
            <span className={TREE_EXPANDER_PLACEHOLDER_CLASS} />
          )}

          {viewOnly ? (
            // View-only mode: just display the name with folder icon
            <div className={cn("flex min-w-0 items-center", TREE_NODE_GAP_CLASS)}>
              {category.icon ? (
                <div className="h-4 w-4 shrink-0 flex items-center justify-center text-muted-foreground/60">{category.icon}</div>
              ) : hasChildren ? (
                <FolderTree className="h-4 w-4 shrink-0 text-muted-foreground/60" />
              ) : (
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/40" />
              )}
              <span className="min-w-0 text-sm font-medium leading-snug break-words [overflow-wrap:anywhere]">{category.name}</span>
            </div>
          ) : (
            // Single/Multi select mode: icon + text + badge
            <div className={cn("flex min-w-0 flex-1 items-center overflow-hidden", TREE_NODE_GAP_CLASS)}>
              {category.icon && <div className="h-4 w-4 shrink-0 flex items-center justify-center text-current">{category.icon}</div>}
              <span
                className={cn(
                  "min-w-0 flex-1 text-sm leading-snug break-words [overflow-wrap:anywhere] transition-all duration-200",
                  isSelected ? "font-semibold text-primary" : "text-foreground/80",
                  !isSelectable && "text-foreground",
                )}
              >
                {category.name}
              </span>
              {hasChildren && !isSelected && (
                <span className="ml-auto shrink-0 text-[10px] font-medium text-muted-foreground/50 bg-muted/50 px-1.5 py-0.5 rounded-md">
                  {children.length}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Children with animated container */}
        {hasChildren && isExpanded && (
          <div
            className={cn(
              TREE_BRANCH_OFFSET_CLASS,
              "border-l-2 border-dashed border-border/50",
              "animate-in slide-in-from-top-2 fade-in-50 duration-200",
            )}
          >
            {children.map((child) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderSearch = ({ sticky = true, className }: { sticky?: boolean; className?: string } = {}) => {
    if (!isSearchEnabled) return null;

    return (
      <div className={cn(sticky && "sticky top-0 z-10 pb-2", className)}>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 transition-colors peer-focus:text-primary" />
          <input
            ref={searchInputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={mergedLabels.searchPlaceholder}
            className={cn(
              "peer w-full rounded-full bg-background/90 py-2.5 pl-10 pr-10 text-sm shadow-sm",
              "border border-border/30",
              "focus:outline-none focus:bg-background focus:border-primary/30 focus:ring-2 focus:ring-primary/10",
              "transition-all duration-200",
              "placeholder:text-muted-foreground/50",
            )}
          />
          {query.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                searchInputRef.current?.focus();
              }}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full",
                "flex items-center justify-center",
                "text-muted-foreground/80 hover:text-foreground hover:bg-muted transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
              )}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  const effectiveParentCategories = useMemo(() => {
    if (!isSearchMode) return parentCategories;
    return parentCategories.filter((c) => visibleIds?.has(c.id));
  }, [isSearchMode, parentCategories, visibleIds]);

  let effectiveChildrenMap = childrenMap;
  if (isSearchMode && visibleIds) {
    effectiveChildrenMap = new Map<number, Category[]>();
    for (const [parentId, children] of childrenMap.entries()) {
      effectiveChildrenMap.set(
        parentId,
        children.filter((child) => visibleIds.has(child.id)),
      );
    }
  }

  // Render tree content
  const renderTreeContent = () => (
    <div className="space-y-0.5 overflow-x-hidden">
      {effectiveParentCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
            {isSearchMode ? <SearchX className="w-6 h-6 text-muted-foreground/50" /> : <Layers className="w-6 h-6 text-muted-foreground/50" />}
          </div>
          <span className="text-sm text-muted-foreground">{isSearchMode ? mergedLabels.noResultsText : mergedLabels.emptyText}</span>
        </div>
      ) : (
        effectiveParentCategories.map((cat) => renderCategory(cat))
      )}
    </div>
  );

  const renderLabel = () =>
    label ? (
      <div className="flex items-center justify-between">
        <Label
          id={labelId}
          htmlFor={resolvedId}
          className={cn(
            size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm",
            disabled ? "text-muted-foreground" : "text-foreground",
            effectiveError && "text-destructive",
            labelClassName,
          )}
        >
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </Label>
      </div>
    ) : null;

  const renderAssistiveText = () =>
    effectiveError ? (
      <p id={errorId} className="text-sm text-destructive">
        {effectiveError}
      </p>
    ) : helperText ? (
      <p id={helperId} className="text-sm text-muted-foreground">
        {helperText}
      </p>
    ) : null;

  // View-only mode: render tree directly without interactivity
  if (viewOnly) {
    return (
      <div className={cn("w-full space-y-2", className)}>
        {renderLabel()}
        <input
          tabIndex={-1}
          aria-hidden="true"
          value={valueArray.length > 0 ? "selected" : ""}
          onChange={() => {}}
          required={required}
          disabled={disabled}
          onInvalid={(e) => {
            e.preventDefault();
            setLocalRequiredError(tv("required"));
          }}
          className="pointer-events-none absolute h-0 w-0 opacity-0"
        />
        <div
          id={resolvedId}
          aria-labelledby={labelId}
          aria-describedby={describedBy}
          className={cn("rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-3 shadow-sm", disabled && "opacity-50")}
        >
          {renderSearch()}
          {renderTreeContent()}
        </div>
        {renderAssistiveText()}
      </div>
    );
  }

  // Inline mode: render tree directly with selection capability
  if (inline) {
    return (
      <div className={cn("w-full space-y-2", className)}>
        {renderLabel()}
        <input
          tabIndex={-1}
          aria-hidden="true"
          value={valueArray.length > 0 ? "selected" : ""}
          onChange={() => {}}
          required={required}
          disabled={disabled}
          onInvalid={(e) => {
            e.preventDefault();
            setLocalRequiredError(tv("required"));
          }}
          className="pointer-events-none absolute h-0 w-0 opacity-0"
        />
        <div
          id={resolvedId}
          aria-labelledby={labelId}
          aria-describedby={describedBy}
          className={cn("rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-3 shadow-sm", disabled && "opacity-50 pointer-events-none")}
        >
          {renderSearch()}
          {renderTreeContent()}
        </div>
        {renderAssistiveText()}
      </div>
    );
  }

  // Dropdown mode: render trigger + popup
  const selectedCount = valueArray.length;

  const triggerSizeStyles = {
    sm: {
      button: "h-8 px-3 py-1.5 text-sm md:h-7 md:text-xs",
      iconWrap: "p-1",
      icon: "w-3.5 h-3.5 md:w-3 md:h-3",
      text: "text-xs md:text-[11px]",
      badge: "px-1.5 py-0.5 text-[10px]",
      actionIcon: "w-3.5 h-3.5",
      clearIcon: "h-3 w-3",
    },
    md: {
      button: "h-10 px-3 py-2.5 text-sm",
      iconWrap: "p-1.5",
      icon: "w-4 h-4",
      text: "text-sm",
      badge: "px-2 py-0.5 text-xs",
      actionIcon: "w-4 h-4",
      clearIcon: "h-3.5 w-3.5",
    },
    lg: {
      button: "h-12 px-4 py-3 text-base",
      iconWrap: "p-1.5",
      icon: "w-5 h-5",
      text: "text-base",
      badge: "px-2.5 py-1 text-sm",
      actionIcon: "w-5 h-5",
      clearIcon: "h-4 w-4",
    },
  } as const;

  const triggerVariantStyles = {
    default: "border border-input bg-background shadow-sm hover:border-primary/50",
    outline: "border-2 border-input bg-transparent hover:border-primary",
    ghost: "border border-transparent bg-muted/50 hover:bg-muted",
    filled: "border border-transparent bg-muted/70 hover:bg-muted",
  } as const;

  const clearSelection = () => {
    if (!props.onChange) return;

    if (singleSelect) {
      (props.onChange as (selectedId: number | null) => void)(null);
      return;
    }

    (props.onChange as (selectedIds: number[]) => void)([]);
  };

  const handleClear = (event: React.MouseEvent | React.KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    clearSelection();
    handleOpenChange(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen);
    if (!nextOpen) {
      setQuery("");
    }
  };

  // Get display text based on selection
  let displayText: string;
  if (singleSelect) {
    // Single select: show selected name or placeholder
    displayText = selectedCount > 0 ? categories.find((c) => c.id === valueArray[0])?.name || placeholder : placeholder;
  } else {
    // Multi select: show names for 1-3 items, count for more
    if (selectedCount === 0) {
      displayText = placeholder;
    } else if (selectedCount <= 3) {
      // Show comma-separated names
      const selectedNames = valueArray
        .map((id) => categories.find((c) => c.id === id)?.name)
        .filter(Boolean)
        .join(", ");
      displayText = selectedNames || placeholder;
    } else {
      // Show count
      displayText = mergedLabels.selectedText(selectedCount);
    }
  }

  const dropdownBody = (
    <div className="flex max-h-80 flex-col overflow-hidden">
      {renderSearch({ sticky: false, className: "border-b border-border/30 p-2 pb-2" })}
      <div
        ref={dropdownViewportRef}
        id={`${resolvedId}-tree`}
        className={cn("min-h-0 flex-1 overflow-auto overflow-x-hidden p-2 pt-2")}
      >
        {renderTreeContent()}
      </div>
    </div>
  );

  return (
    <div className={cn("w-full space-y-2", className)}>
      {renderLabel()}
      <input
        tabIndex={-1}
        aria-hidden="true"
        value={valueArray.length > 0 ? "selected" : ""}
        onChange={() => {}}
        required={required}
        disabled={disabled}
        onInvalid={(e) => {
          e.preventDefault();
          setLocalRequiredError(tv("required"));
        }}
        className="pointer-events-none absolute h-0 w-0 opacity-0"
      />
      <Popover
        open={isOpen}
        onOpenChange={handleOpenChange}
        disabled={disabled}
        placement="bottom-start"
        matchTriggerWidth
        className="z-9999"
        contentClassName={cn(
          "p-0 overflow-hidden rounded-2xl md:rounded-3xl",
          "border-border/40 bg-popover/95 text-popover-foreground",
          "shadow-2xl backdrop-blur-xl",
        )}
        trigger={
          <button
            id={resolvedId}
            type="button"
            disabled={disabled}
            role="combobox"
            aria-haspopup="tree"
            aria-expanded={isOpen}
            aria-controls={`${resolvedId}-tree`}
            aria-labelledby={labelId}
            aria-describedby={describedBy}
            aria-required={required}
            aria-invalid={!!effectiveError}
            className={cn(
              "group flex w-full items-center justify-between rounded-full transition-all duration-200",
              "backdrop-blur-sm",
              triggerSizeStyles[size].button,
              triggerVariantStyles[variant],
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              disabled && "opacity-50 cursor-not-allowed hover:transform-none hover:shadow-none",
              isOpen && "ring-2 ring-primary/30 border-primary/50 shadow-lg shadow-primary/10",
              effectiveError && "border-destructive focus-visible:ring-destructive/30",
            )}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
              <div
                className={cn(
                  "shrink-0 flex items-center justify-center rounded-lg transition-all duration-300",
                  triggerSizeStyles[size].iconWrap,
                  isOpen ? "bg-primary/15 text-primary" : "bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
                )}
              >
                <FolderTree className={cn(triggerSizeStyles[size].icon, "transition-transform duration-300", isOpen && "scale-110")} />
              </div>
              <span
                className={cn(
                  "min-w-0 flex-1 truncate font-medium transition-colors duration-200",
                  triggerSizeStyles[size].text,
                  selectedCount === 0 ? "text-muted-foreground" : "text-foreground",
                )}
                title={displayText}
              >
                {displayText}
              </span>
            </div>
            <div className="ml-2 flex shrink-0 items-center gap-1.5">
              {allowClear && selectedCount > 0 && !disabled && (
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Clear selection"
                  onClick={handleClear}
                  onKeyDown={(event) => (event.key === "Enter" || event.key === " ") && handleClear(event)}
                  className={cn(
                    "opacity-0 group-hover:opacity-100 transition-all duration-200",
                    "p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                  )}
                >
                  <X className={triggerSizeStyles[size].clearIcon} />
                </div>
              )}
              {selectedCount > 0 && !singleSelect && (
                <span className={cn("rounded-full bg-primary/15 font-bold text-primary", triggerSizeStyles[size].badge)}>{selectedCount}</span>
              )}
              <span className={cn("transition-all duration-300 text-muted-foreground group-hover:text-foreground", isOpen && "rotate-180 text-primary")}>
                <ChevronDown className={triggerSizeStyles[size].actionIcon} />
              </span>
            </div>
          </button>
        }
      >
        {dropdownBody}
      </Popover>
      {renderAssistiveText()}
    </div>
  );
}
