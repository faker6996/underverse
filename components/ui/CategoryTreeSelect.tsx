"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, Check, FolderTree, Layers } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Category {
  id: number;
  name: string;
  parent_id?: number | null;
}

interface CategoryTreeSelectLabels {
  /** Text shown when no categories available */
  emptyText?: string;
  /** Text shown when categories are selected, receives count as parameter */
  selectedText?: (count: number) => string;
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
};

export function CategoryTreeSelect(props: CategoryTreeSelectProps) {
  const {
    categories,
    placeholder = "Select category",
    disabled,
    viewOnly = false,
    defaultExpanded = false,
    labels,
    inline = false,
    onNodeClick,
    className,
    singleSelect = false,
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  // Merge user labels with defaults
  const mergedLabels = { ...defaultLabels, ...labels };

  // Normalize value to array for internal use
  const valueArray: number[] = singleSelect ? (props.value != null ? [props.value as number] : []) : (props.value as number[] | undefined) || [];

  // Build tree structure
  const parentCategories = categories.filter((c) => !c.parent_id);
  const childrenMap = new Map<number, Category[]>();

  categories.forEach((cat) => {
    if (cat.parent_id) {
      if (!childrenMap.has(cat.parent_id)) {
        childrenMap.set(cat.parent_id, []);
      }
      childrenMap.get(cat.parent_id)!.push(cat);
    }
  });

  // Initialize expanded nodes
  useEffect(() => {
    if ((viewOnly || inline) && defaultExpanded) {
      const allParentIds = categories.filter((c) => childrenMap.has(c.id)).map((c) => c.id);
      setExpandedNodes(new Set(allParentIds));
    }
  }, [viewOnly, inline, defaultExpanded, categories]);

  const toggleExpand = (id: number) => {
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
    const children = childrenMap.get(category.id) || [];
    const hasChildren = children.length > 0;
    const isExpanded = expandedNodes.has(category.id);
    const isSelected = valueArray.includes(category.id);
    const isParent = level === 0;

    return (
      <div key={category.id} className="animate-in fade-in-50 duration-200" style={{ animationDelay: `${level * 30}ms` }}>
        <div
          className={cn(
            "relative flex items-center gap-2.5 px-3 py-2.5 transition-all duration-200",
            "border-l-4 border-l-transparent",
            // Parent level styling
            isParent && "bg-muted/25 font-medium",
            !viewOnly && "cursor-pointer",
            !viewOnly && !isSelected && "hover:bg-accent/60 hover:shadow-sm",
            // Selected state
            !viewOnly && isSelected && "bg-accent/30 border-l-primary shadow-sm",
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
                "hover:bg-accent hover:scale-110 active:scale-95",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                isExpanded && "bg-accent/50 text-primary",
              )}
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
              {hasChildren ? (
                <FolderTree className="w-4 h-4 text-muted-foreground/60" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
              )}
              <span className="text-sm font-medium">{category.name}</span>
            </div>
          ) : singleSelect ? (
            // Single select mode: radio-style indicator
            <div onClick={() => handleSelect(category.id, category)} className="flex items-center gap-2.5 flex-1">
              <div
                className={cn(
                  "w-5 h-5 border-2 rounded-full flex items-center justify-center transition-all duration-200",
                  isSelected ? "border-primary bg-primary/10 shadow-sm shadow-primary/20" : "border-muted-foreground/30 hover:border-primary/50",
                )}
              >
                {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-linear-to-br from-primary to-primary/80 shadow-sm" />}
              </div>
              <span
                className={cn(
                  "text-sm transition-all duration-200",
                  isSelected ? "font-semibold text-primary" : "text-foreground/80 hover:text-foreground",
                )}
              >
                {category.name}
              </span>
              {hasChildren && !isSelected && (
                <span className="ml-auto text-[10px] font-medium text-muted-foreground/50 bg-muted/50 px-1.5 py-0.5 rounded-md">
                  {children.length}
                </span>
              )}
            </div>
          ) : (
            // Multi select mode: checkbox-style indicator
            <div onClick={() => handleSelect(category.id, category)} className="flex items-center gap-2.5 flex-1">
              <div
                className={cn(
                  "w-5 h-5 border-2 rounded-lg flex items-center justify-center transition-all duration-200",
                  isSelected
                    ? "bg-linear-to-br from-primary to-primary/80 border-primary shadow-sm shadow-primary/25"
                    : "border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5",
                )}
              >
                {isSelected && <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />}
              </div>
              <span
                className={cn(
                  "text-sm transition-all duration-200",
                  isSelected ? "font-semibold text-primary" : "text-foreground/80 hover:text-foreground",
                )}
              >
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

  // Render tree content
  const renderTreeContent = () => (
    <div className="space-y-0.5">
      {parentCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
            <Layers className="w-6 h-6 text-muted-foreground/50" />
          </div>
          <span className="text-sm text-muted-foreground">{mergedLabels.emptyText}</span>
        </div>
      ) : (
        parentCategories.map((cat) => renderCategory(cat))
      )}
    </div>
  );

  // View-only mode: render tree directly without interactivity
  if (viewOnly) {
    return (
      <div className={cn("rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-3 shadow-sm", disabled && "opacity-50", className)}>
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
        {renderTreeContent()}
      </div>
    );
  }

  // Dropdown mode: render trigger + popup
  const selectedCount = valueArray.length;
  const displayText = singleSelect
    ? selectedCount > 0
      ? categories.find((c) => c.id === valueArray[0])?.name || placeholder
      : placeholder
    : selectedCount > 0
      ? mergedLabels.selectedText(selectedCount)
      : placeholder;

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
          "rounded-2xl h-11 text-sm",
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
              "absolute z-20 mt-2 w-full max-h-80 overflow-auto",
              "rounded-2xl border border-border/40 bg-popover/95 text-popover-foreground",
              "shadow-2xl backdrop-blur-xl",
              "p-2",
              "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-300",
            )}
          >
            {renderTreeContent()}
          </div>
        </>
      )}
    </div>
  );
}
