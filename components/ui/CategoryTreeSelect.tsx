"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, Check } from "lucide-react";
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

    return (
      <div key={category.id}>
        <div
          className={cn(
            "relative flex items-center gap-2 px-3 py-2 rounded-md transition-colors",
            !viewOnly && "cursor-pointer hover:bg-accent",
            // Selected state: subtle bg + square left indicator (only in select mode)
            !viewOnly && isSelected && "bg-primary/10 rounded-r-md"
          )}
          style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
        >
          {!viewOnly && isSelected && <span aria-hidden className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(category.id);
              }}
              className="p-0.5 hover:bg-accent rounded"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <span className="w-5" />
          )}

          {viewOnly ? (
            // View-only mode: just display the name
            <span className="text-sm">{category.name}</span>
          ) : singleSelect ? (
            // Single select mode: radio-style indicator
            <div onClick={() => handleSelect(category.id, category)} className="flex items-center gap-2 flex-1">
              <div
                className={cn(
                  "w-4 h-4 border-2 rounded-full flex items-center justify-center transition-colors",
                  isSelected ? "border-primary" : "border-muted-foreground/30"
                )}
              >
                {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
              </div>

              <span className={cn("text-sm", isSelected && "font-medium text-primary")}>{category.name}</span>
            </div>
          ) : (
            // Multi select mode: checkbox-style indicator
            <div onClick={() => handleSelect(category.id, category)} className="flex items-center gap-2 flex-1">
              <div
                className={cn(
                  "w-4 h-4 border-2 rounded flex items-center justify-center transition-colors",
                  isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
                )}
              >
                {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
              </div>

              <span className={cn("text-sm", isSelected && "font-medium text-primary")}>{category.name}</span>
            </div>
          )}
        </div>

        {hasChildren && isExpanded && <div>{children.map((child) => renderCategory(child, level + 1))}</div>}
      </div>
    );
  };

  // Render tree content
  const renderTreeContent = () => (
    <>
      {parentCategories.length === 0 ? (
        <div className="px-3 py-2 text-sm text-muted-foreground">{mergedLabels.emptyText}</div>
      ) : (
        parentCategories.map((cat) => renderCategory(cat))
      )}
    </>
  );

  // View-only mode: render tree directly without interactivity
  if (viewOnly) {
    return <div className={cn("rounded-md border bg-background p-2", disabled && "opacity-50", className)}>{renderTreeContent()}</div>;
  }

  // Inline mode: render tree directly with selection capability
  if (inline) {
    return (
      <div className={cn("rounded-md border bg-background p-2", disabled && "opacity-50 pointer-events-none", className)}>{renderTreeContent()}</div>
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
          // Match Combobox trigger outline + focus styles
          "flex w-full items-center justify-between px-3 bg-background border border-input",
          "rounded-md h-10 py-2 text-sm",
          "hover:bg-accent/5 transition-colors hover:border-primary/40 focus:border-primary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          disabled && "opacity-50 cursor-not-allowed",
          isOpen && "border-primary"
        )}
      >
        <span className={cn("text-sm", selectedCount === 0 && "text-muted-foreground")}>{displayText}</span>
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "transform rotate-180")} />
      </button>

      {isOpen && !disabled && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div
            className={cn(
              "absolute z-20 mt-1 w-full max-h-80 overflow-auto",
              "rounded-md border bg-popover text-popover-foreground shadow-md",
              "backdrop-blur-sm bg-popover/95 border-border/60"
            )}
          >
            <div className="p-1">{renderTreeContent()}</div>
          </div>
        </>
      )}
    </div>
  );
}
