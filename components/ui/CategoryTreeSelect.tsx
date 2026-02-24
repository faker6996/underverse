"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight, ChevronDown, FolderTree, Layers, Search, SearchX, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Category {
  id: number;
  name: string;
  parent_id?: number | null;
  icon?: React.ReactNode;
}

interface CategoryTreeSelectLabels {
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
interface CategoryTreeSelectBaseProps {
  categories: Category[];
  placeholder?: string;
  disabled?: boolean;
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
}

// Multi-select mode (default)
interface CategoryTreeSelectMultiProps extends CategoryTreeSelectBaseProps {
  singleSelect?: false;
  value?: number[];
  onChange?: (selectedIds: number[]) => void;
}

// Single-select mode
interface CategoryTreeSelectSingleProps extends CategoryTreeSelectBaseProps {
  singleSelect: true;
  value?: number | null;
  onChange?: (selectedId: number | null) => void;
}

type CategoryTreeSelectProps = CategoryTreeSelectMultiProps | CategoryTreeSelectSingleProps;

const defaultLabels: Required<CategoryTreeSelectLabels> = {
  emptyText: "No categories",
  selectedText: (count) => `${count} selected`,
  searchPlaceholder: "Search...",
  noResultsText: "No results found",
};

export function CategoryTreeSelect(props: CategoryTreeSelectProps) {
  const {
    categories,
    placeholder = "Select category",
    disabled,
    viewOnly = false,
    defaultExpanded = false,
    enableSearch,
    labels,
    inline = false,
    onNodeClick,
    className,
    singleSelect = false,
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [query, setQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Merge user labels with defaults
  const mergedLabels = { ...defaultLabels, ...labels };

  // Normalize value to array for internal use
  const valueArray: number[] = singleSelect ? (props.value != null ? [props.value as number] : []) : (props.value as number[] | undefined) || [];

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

  // Clear search query when dropdown closes (keeps inline/viewOnly mode persistent)
  useEffect(() => {
    if (!isOpen) setQuery("");
  }, [isOpen]);

  // Auto-focus search input when dropdown opens (when enabled)
  useEffect(() => {
    if (!isOpen) return;
    if (!isSearchEnabled) return;
    const t = setTimeout(() => searchInputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [isOpen, isSearchEnabled]);

  // Initialize expanded nodes
  useEffect(() => {
    if ((viewOnly || inline) && defaultExpanded) {
      const allParentIds = categories.filter((c) => childrenMap.has(c.id)).map((c) => c.id);
      setExpandedNodes(new Set(allParentIds));
    }
  }, [viewOnly, inline, defaultExpanded, categories]);

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

    // Call onNodeClick if provided
    onNodeClick?.(category);

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
        setIsOpen(false);
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
    const allChildren = childrenMap.get(category.id) || [];
    const children = isSearchMode ? allChildren.filter((c) => visibleIds?.has(c.id)) : allChildren;
    const hasChildren = children.length > 0;
    const isExpanded = hasChildren && (isSearchMode || expandedNodes.has(category.id));
    const isSelected = valueArray.includes(category.id);
    const isParent = level === 0;

    return (
      <div key={category.id} className="animate-in fade-in-50 duration-200" style={{ animationDelay: `${level * 30}ms` }}>
        <div
          onClick={() => !viewOnly && handleSelect(category.id, category)}
          className={cn(
            "relative flex items-center gap-2.5 px-3 py-2.5 min-h-11 transition-all duration-200 rounded-full",
            // Không phân biệt parent/child - đồng bộ màu
            !viewOnly && "cursor-pointer",
            !viewOnly && !isSelected && "hover:bg-accent/50",
            // Selected state - đồng bộ cho tất cả
            !viewOnly && isSelected && "bg-accent/40",
          )}
          style={{ paddingLeft: `${level * 1.25 + 0.75}rem` }}
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
                "p-1.5 rounded-lg transition-all duration-200",
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
            <span className="w-7" />
          )}

          {viewOnly ? (
            // View-only mode: just display the name with folder icon
            <div className="flex items-center gap-2.5">
              {category.icon ? (
                <div className="w-4 h-4 flex items-center justify-center text-muted-foreground/60">{category.icon}</div>
              ) : hasChildren ? (
                <FolderTree className="w-4 h-4 text-muted-foreground/60" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
              )}
              <span className="text-sm font-medium">{category.name}</span>
            </div>
          ) : (
            // Single/Multi select mode: icon + text + badge
            <div className="flex items-center gap-2.5 flex-1">
              {category.icon && <div className="w-4 h-4 flex items-center justify-center text-current">{category.icon}</div>}
              <span className={cn("text-sm transition-all duration-200", isSelected ? "font-semibold text-primary" : "text-foreground/80")}>
                {category.name}
              </span>
              {hasChildren && !isSelected && (
                <span className="ml-auto text-[10px] font-medium text-muted-foreground/50 bg-muted/50 px-1.5 py-0.5 rounded-md">
                  {children.length}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Children with animated container */}
        {hasChildren && isExpanded && (
          <div className={cn("ml-2 pl-2 border-l-2 border-dashed border-border/50", "animate-in slide-in-from-top-2 fade-in-50 duration-200")}>
            {children.map((child) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderSearch = () => {
    if (!isSearchEnabled) return null;

    return (
      <div className="sticky top-0 z-10 bg-popover/85 backdrop-blur-xl pb-2">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 transition-colors peer-focus:text-primary" />
          <input
            ref={searchInputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={mergedLabels.searchPlaceholder}
            className={cn(
              "peer w-full rounded-full bg-muted/40 py-2.5 pl-10 pr-10 text-sm",
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

  // Render tree content
  const renderTreeContent = () => (
    <div className="space-y-0.5">
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

  // View-only mode: render tree directly without interactivity
  if (viewOnly) {
    return (
      <div className={cn("rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-3 shadow-sm", disabled && "opacity-50", className)}>
        {renderSearch()}
        {renderTreeContent()}
      </div>
    );
  }

  // Inline mode: render tree directly with selection capability
  if (inline) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-3 shadow-sm",
          disabled && "opacity-50 pointer-events-none",
          className,
        )}
      >
        {renderSearch()}
        {renderTreeContent()}
      </div>
    );
  }

  // Dropdown mode: render trigger + popup
  const selectedCount = valueArray.length;

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

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          // Modern trigger button styling
          "group flex w-full items-center justify-between px-3 py-2.5",
          "bg-background/80 backdrop-blur-sm border border-border/60",
          "rounded-full h-11 text-sm",
          "hover:bg-accent/10 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5",
          "transition-all duration-300 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          disabled && "opacity-50 cursor-not-allowed hover:transform-none hover:shadow-none",
          isOpen && "ring-2 ring-primary/30 border-primary/50 shadow-lg shadow-primary/10",
        )}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex items-center justify-center rounded-lg p-1.5 transition-all duration-300",
              isOpen ? "bg-primary/15 text-primary" : "bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
            )}
          >
            <FolderTree className={cn("w-4 h-4 transition-transform duration-300", isOpen && "scale-110")} />
          </div>
          <span className={cn("font-medium transition-colors duration-200", selectedCount === 0 ? "text-muted-foreground" : "text-foreground")}>
            {displayText}
          </span>
          {selectedCount > 0 && !singleSelect && (
            <span className="ml-1 px-2 py-0.5 text-xs font-bold rounded-full bg-primary/15 text-primary">{selectedCount}</span>
          )}
        </div>
        <span className={cn("transition-all duration-300 text-muted-foreground group-hover:text-foreground", isOpen && "rotate-180 text-primary")}>
          <ChevronDown className="w-4 h-4" />
        </span>
      </button>

      {isOpen && !disabled && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div
            className={cn(
              "absolute z-20 mt-2 w-full max-h-80 overflow-auto custom-scrollbar",
              "rounded-2xl md:rounded-3xl border border-border/40 bg-popover/95 text-popover-foreground",
              "shadow-2xl backdrop-blur-xl",
              "p-2",
              "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-300",
            )}
           
          >
            {renderSearch()}
            {renderTreeContent()}
          </div>
        </>
      )}
    </div>
  );
}
