"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { useVirtualizer, type VirtualItem } from "@tanstack/react-virtual";
import { ChevronRight, ChevronDown, FolderTree, Layers, Search, SearchX, X } from "lucide-react";
import { cn } from "../utils/cn";
import { useSmartTranslations } from "../hooks/useSmartTranslations";
import { useGlobalI18n } from "../contexts/GlobalI18nContext";
import { useOverlayScrollbarTarget } from "./OverlayScrollbarProvider";
import { Label } from "./label";
import { Popover } from "./Popover";
import { getBorderRadiusClass, type BorderMode } from "../utils/radius";
import { useUnderverseUIConfig } from "../contexts/UnderverseConfigContext";
import { formControlFixedClass, formControlSizeStyles, formControlValueClass } from "../constants/form-control-size";

export interface Category {
  /** Unique category id used for selection and tree relationships. */
  id: number;
  /** Visible label rendered for this node. */
  name: string;
  /** Parent category id. Omit or set `null` for a root node. */
  parent_id?: number | null;
  /** Optional custom icon rendered before the category label. */
  icon?: React.ReactNode;
}

/**
 * Override the built-in copy used by {@link CategoryTreeSelect}.
 * Useful for i18n or product-specific wording.
 */
export interface CategoryTreeSelectLabels {
  /** Text shown when no categories are available. */
  emptyText?: string;
  /** Text shown when categories are selected. Receives the selected count. */
  selectedText?: (count: number) => string;
  /** Placeholder text for the search input when search is enabled. */
  searchPlaceholder?: string;
  /** Text shown when search yields no results. */
  noResultsText?: string;
}

/**
 * Shared props for both single-select and multi-select modes.
 *
 * @remarks
 * Use `defaultExpanded`, `defaultExpandedIds`, or `expandToId` for initial
 * uncontrolled expand state. If you need to fully control the expanded tree
 * from the outside, use `expandedIds` together with `onExpandedChange`.
 */
export interface CategoryTreeSelectBaseProps {
  id?: string;
  /** Optional field label rendered above the control. */
  label?: string;
  /** Extra classes for the label element. */
  labelClassName?: string;
  /** Flat category list. Parent/child relationships are resolved via `parent_id`. */
  categories: Category[];
  /** Placeholder text when no category is selected. */
  placeholder?: string;
  /** Disables interaction and fades the control. */
  disabled?: boolean;
  /** Participate in form-required validation. */
  required?: boolean;
  /** Visual size of the trigger. */
  size?: "sm" | "md" | "lg";
  /** Visual style of the trigger. */
  variant?: "default" | "outline" | "ghost" | "filled";
  /** Show a clear button when a selection exists. */
  allowClear?: boolean;
  /** External error message. Takes precedence over helper text. */
  error?: string;
  /** Helper text shown below the field when there is no error. */
  helperText?: string;
  /** When true, renders as a read-only tree view without selection behavior. */
  viewOnly?: boolean;
  /**
   * Expand every parent node by default.
   *
   * @remarks
   * This applies to `inline` and `viewOnly` trees. In dropdown mode, branches
   * still start collapsed unless expanded by other props.
   */
  defaultExpanded?: boolean;
  /** Explicit branch ids that should start expanded in uncontrolled mode. */
  defaultExpandedIds?: number[];
  /**
   * Expand the ancestor path so a specific node is visible by default.
   *
   * @remarks
   * The node id itself is also added to the expanded set, which is useful when
   * `expandToId` points to a parent category.
   */
  expandToId?: number | null;
  /** Controlled expanded branch ids. */
  expandedIds?: number[];
  /** Called whenever expand/collapse changes the expanded branch ids. */
  onExpandedChange?: (expandedIds: number[]) => void;
  /**
   * Enable search input for filtering categories.
   * Default: auto-enabled when `categories.length > 10` (similar to MultiCombobox).
   */
  enableSearch?: boolean;
  /** Replace built-in labels for localization or custom wording. */
  labels?: CategoryTreeSelectLabels;
  /** Render the tree directly instead of inside a dropdown trigger. */
  inline?: boolean;
  /** Called when a node row is clicked. Useful for navigation flows. */
  onNodeClick?: (node: Category) => void;
  /** Custom class for the outer tree container. */
  className?: string;
  /** Enable OverlayScrollbars for the dropdown tree viewport. Default: `false`. */
  useOverlayScrollbar?: boolean;
  /** When true, only leaf nodes can be selected; parent nodes only expand/collapse. */
  leafOnlySelect?: boolean;
  /** Virtualize the dropdown tree by rendering only visible rows. Inline/view-only trees keep recursive rendering. */
  virtualized?: boolean;
  /** Estimated tree row height used by virtualized rendering. Default: `44`. */
  estimatedItemHeight?: number;
  /** Number of extra rows rendered above and below the visible range. Default: `8`. */
  overscan?: number;
  /** Limit the number of rendered rows before the user types a query. */
  maxInitialOptions?: number;
  /** Use `"manual"` to let callers provide server-filtered categories via `onSearchChange`. Default: `"auto"`. */
  searchMode?: "auto" | "manual";
  /** Called whenever the search query changes. Useful for manual/server search. */
  onSearchChange?: (query: string) => void;
  /** Debounce delay for `onSearchChange`. Default: `0`. */
  searchDebounceMs?: number;
  /** Minimum query length before showing options in manual/search-prompt mode. Default: `0`. */
  minSearchLength?: number;
  /** Show a prompt instead of options while the query is shorter than `minSearchLength`. Default: `false`. */
  showSearchPromptWhenEmptyQuery?: boolean;
  /**
   * Render custom actions at the trailing edge of each tree row.
   *
   * @remarks
   * The returned node is placed inside the row flex container, after the label/content area.
   * Click events on the returned node are stopped from propagating to the row, so action buttons
   * do not accidentally trigger selection or expansion.
   *
   * @example
   * <CategoryTreeSelect
   *   renderItemActions={(category) => (
   *     <button onClick={() => handleEdit(category)}>Edit</button>
   *   )}
   * />
   */
  renderItemActions?: (category: Category) => React.ReactNode;
  /**
   * Base left padding in rem applied to every node regardless of depth. Default: `0.75`.
   *
   * @remarks
   * Combined with `indentSize`, the final padding of a node at a given depth is:
   * `paddingLeft = level * indentSize + baseIndent` rem.
   *
   * @example
   * // Compact sidebar tree
   * <CategoryTreeSelect baseIndent={0.25} indentSize={0.75} />
   */
  baseIndent?: number;
  /**
   * Additional left padding in rem added per depth level. Default: `1`.
   *
   * @remarks
   * Set to a smaller value (e.g. `0.75`) to reduce the visual gap between
   * parent and child nodes without touching DOM styles.
   *
   * @example
   * // Compact sidebar tree
   * <CategoryTreeSelect baseIndent={0.25} indentSize={0.75} />
   */
  indentSize?: number;
  borderMode?: BorderMode;
}

/** Multi-select mode. This is the default when `singleSelect` is omitted. */
export interface CategoryTreeSelectMultiProps extends CategoryTreeSelectBaseProps {
  singleSelect?: false;
  /** Selected category ids. */
  value?: number[];
  /** Called with the full selected id list. */
  onChange?: (selectedIds: number[]) => void;
}

/** Single-select mode. */
export interface CategoryTreeSelectSingleProps extends CategoryTreeSelectBaseProps {
  singleSelect: true;
  /** Selected category id or `null` when nothing is selected. */
  value?: number | null;
  /** Called with the selected id or `null`. */
  onChange?: (selectedId: number | null) => void;
}

/** Union of the single-select and multi-select prop shapes. */
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
const CATEGORY_TREE_DROPDOWN_MAX_HEIGHT = 320;

type FlattenedCategoryRow = {
  category: Category;
  level: number;
};

export function getAncestorPathIds(categories: Category[], targetId: number) {
  const byId = new Map(categories.map((category) => [category.id, category] as const));
  const expanded = new Set<number>();
  let current = byId.get(targetId);
  let guard = 0;

  while (current && guard++ < categories.length) {
    expanded.add(current.id);
    if (typeof current.parent_id !== "number") break;
    current = byId.get(current.parent_id);
  }

  return expanded;
}

export function getInitialExpandedNodes(
  categories: Category[],
  {
    defaultExpanded,
    defaultExpandedIds,
    expandToId,
    viewOnly,
    inline,
  }: Pick<CategoryTreeSelectBaseProps, "defaultExpanded" | "defaultExpandedIds" | "expandToId" | "viewOnly" | "inline">,
) {
  const expanded = new Set<number>();

  if ((viewOnly || inline) && defaultExpanded) {
    for (const category of categories) {
      if (typeof category.parent_id === "number") {
        expanded.add(category.parent_id);
      }
    }
  }

  for (const id of defaultExpandedIds ?? []) {
    if (typeof id === "number") {
      expanded.add(id);
    }
  }

  if (typeof expandToId === "number") {
    for (const id of getAncestorPathIds(categories, expandToId)) {
      expanded.add(id);
    }
  }

  return expanded;
}

export function getExpandedNodesState(expandedIds: number[] | undefined, uncontrolledExpandedNodes: Set<number>) {
  return expandedIds !== undefined ? new Set(expandedIds) : uncontrolledExpandedNodes;
}

function collectAncestorIds(categories: Category[], categoryId: number) {
  const ancestorIds = getAncestorPathIds(categories, categoryId);
  ancestorIds.delete(categoryId);
  return ancestorIds;
}

function collectDescendantIds(childrenMap: Map<number, Category[]>, categoryId: number) {
  const descendants = new Set<number>();
  const stack = [categoryId];

  while (stack.length > 0) {
    const currentId = stack.pop()!;
    for (const child of childrenMap.get(currentId) ?? []) {
      if (descendants.has(child.id)) continue;
      descendants.add(child.id);
      stack.push(child.id);
    }
  }

  return descendants;
}

function pruneAncestorSelection(categories: Category[], childrenMap: Map<number, Category[]>, selected: Set<number>, fromCategoryId: number) {
  const byId = new Map(categories.map((category) => [category.id, category] as const));
  let current = byId.get(fromCategoryId);
  let guard = 0;

  while (current && typeof current.parent_id === "number" && guard++ < categories.length) {
    const parent = byId.get(current.parent_id);
    if (!parent) break;

    const descendantIds = collectDescendantIds(childrenMap, parent.id);
    const hasSelectedDescendant = Array.from(descendantIds).some((id) => selected.has(id));

    if (!hasSelectedDescendant) {
      selected.delete(parent.id);
    }

    current = parent;
  }
}

function toCategoryOrderSelection(categories: Category[], selected: Set<number>) {
  return categories
    .map((category) => category.id)
    .filter((categoryId) => selected.has(categoryId));
}

function flattenVisibleCategories(
  roots: Category[],
  childrenMap: Map<number, Category[]>,
  expandedNodes: Set<number>,
  expandAllVisibleBranches: boolean,
) {
  const rows: FlattenedCategoryRow[] = [];
  const stack = roots.map((category) => ({ category, level: 0, path: new Set<number>() })).reverse();

  while (stack.length > 0) {
    const { category, level, path } = stack.pop()!;
    if (path.has(category.id)) continue;

    rows.push({ category, level });

    const children = childrenMap.get(category.id) ?? [];
    const isExpanded = children.length > 0 && (expandAllVisibleBranches || expandedNodes.has(category.id));
    if (!isExpanded) continue;

    const nextPath = new Set(path);
    nextPath.add(category.id);

    for (let index = children.length - 1; index >= 0; index -= 1) {
      stack.push({ category: children[index], level: level + 1, path: nextPath });
    }
  }

  return rows;
}

/**
 * Tree-based category picker with single-select, multi-select, inline, and
 * read-only modes.
 *
 * @example
 * ```tsx
 * <CategoryTreeSelect
 *   categories={categories}
 *   value={selectedIds}
 *   onChange={setSelectedIds}
 *   label="Categories"
 *   allowClear
 * />
 * ```
 */
export function CategoryTreeSelect(props: CategoryTreeSelectProps) {
  const tv = useSmartTranslations("ValidationInput");
  const gi18n = useGlobalI18n();
  const {
    id,
    label,
    labelClassName,
    categories,
    placeholder: placeholderProp,
    disabled,
    required = false,
    size = "md",
    variant = "default",
    allowClear = false,
    error,
    helperText,
    viewOnly = false,
    defaultExpanded = false,
    defaultExpandedIds,
    expandToId = null,
    expandedIds,
    onExpandedChange,
    enableSearch,
    labels,
    inline = false,
    onNodeClick,
    className,
    useOverlayScrollbar = false,
    leafOnlySelect = false,
    virtualized = false,
    estimatedItemHeight = 44,
    overscan = 8,
    maxInitialOptions,
    searchMode = "auto",
    onSearchChange,
    searchDebounceMs = 0,
    minSearchLength = 0,
    showSearchPromptWhenEmptyQuery = false,
    baseIndent = TREE_NODE_BASE_PADDING_REM,
    indentSize = TREE_NODE_INDENT_REM,
    renderItemActions,
    singleSelect = false,
    borderMode,
  } = props;

  const globalConfig = useUnderverseUIConfig();
  const resolvedBorderMode = borderMode ?? globalConfig.input?.borderMode ?? globalConfig.borderMode ?? "full";

  const [isOpen, setIsOpen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(() =>
    getInitialExpandedNodes(categories, { defaultExpanded, defaultExpandedIds, expandToId, viewOnly, inline }),
  );
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [localRequiredError, setLocalRequiredError] = useState<string | undefined>();
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const dropdownViewportRef = useRef<HTMLDivElement | null>(null);

  useOverlayScrollbarTarget(dropdownViewportRef, {
    enabled: isOpen && useOverlayScrollbar && !virtualized && !inline && !viewOnly,
  });

  const autoId = useId();
  const resolvedId = id ? String(id) : `category-tree-select-${autoId}`;
  const labelId = label ? `${resolvedId}-label` : undefined;
  const effectiveError = error ?? localRequiredError;
  const helperId = helperText && !effectiveError ? `${resolvedId}-helper` : undefined;
  const errorId = effectiveError ? `${resolvedId}-error` : undefined;
  const describedBy = errorId || helperId;

  const placeholder = placeholderProp ?? gi18n.selectCategoryPlaceholder ?? gi18n.selectPlaceholder ?? "Select category";

  // Merge: hardcoded defaults ← gi18n global config ← per-instance labels prop
  const gi18nLabels: Required<CategoryTreeSelectLabels> = {
    emptyText: gi18n.noCategories ?? defaultLabels.emptyText,
    selectedText: gi18n.selectedCount ?? defaultLabels.selectedText,
    searchPlaceholder: gi18n.searchPlaceholder ?? defaultLabels.searchPlaceholder,
    noResultsText: gi18n.noResults ?? defaultLabels.noResultsText,
  };
  const mergedLabels = { ...gi18nLabels, ...labels };

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
      if (cat.parent_id == null || !byId.has(cat.parent_id)) {
        parentCategories.push(cat);
        continue;
      }
      if (!childrenMap.has(cat.parent_id)) childrenMap.set(cat.parent_id, []);
      childrenMap.get(cat.parent_id)!.push(cat);
    }

    return { parentCategories, childrenMap, byId };
  }, [categories]);

  const isSearchEnabled = useMemo(
    () => enableSearch ?? (categories.length > 10 || searchMode === "manual" || minSearchLength > 0 || !!onSearchChange),
    [categories.length, enableSearch, minSearchLength, onSearchChange, searchMode],
  );
  const trimmedQuery = useMemo(() => query.trim(), [query]);
  const normalizedQuery = useMemo(() => trimmedQuery.toLowerCase(), [trimmedQuery]);
  const queryMeetsMinimum = trimmedQuery.length >= minSearchLength;
  const shouldPromptForSearch = minSearchLength > 0 && !queryMeetsMinimum && (searchMode === "manual" || showSearchPromptWhenEmptyQuery);
  const isSearchMode = isSearchEnabled && normalizedQuery.length > 0;
  const shouldAutoExpandSearchResults = searchMode === "auto" && isSearchMode;
  const effectiveExpandedNodes = useMemo(() => getExpandedNodesState(expandedIds, expandedNodes), [expandedIds, expandedNodes]);

  const visibleIds = useMemo(() => {
    if (shouldPromptForSearch || !isSearchMode || searchMode === "manual") return null;

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
  }, [byId, categories, childrenMap, isSearchMode, normalizedQuery, searchMode, shouldPromptForSearch]);

  useEffect(() => {
    if (!onSearchChange) return;

    const timeoutId = window.setTimeout(() => {
      onSearchChange(trimmedQuery);
    }, Math.max(0, searchDebounceMs));

    return () => window.clearTimeout(timeoutId);
  }, [onSearchChange, searchDebounceMs, trimmedQuery]);

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
    if (shouldAutoExpandSearchResults) return;
    const newExpanded = new Set(effectiveExpandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    if (expandedIds === undefined) {
      setExpandedNodes(newExpanded);
    }
    onExpandedChange?.(Array.from(newExpanded));
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

        for (const descendantId of collectDescendantIds(childrenMap, categoryId)) {
          newSelected.delete(descendantId);
        }

        pruneAncestorSelection(categories, childrenMap, newSelected, categoryId);
      } else {
        // Select
        newSelected.add(categoryId);

        for (const ancestorId of collectAncestorIds(categories, categoryId)) {
          newSelected.add(ancestorId);
        }
      }

      onChange(toCategoryOrderSelection(categories, newSelected));
    }
  };

  const effectiveParentCategories = useMemo(() => {
    if (shouldPromptForSearch) return [];
    if (!isSearchMode || searchMode === "manual") return parentCategories;
    return parentCategories.filter((c) => visibleIds?.has(c.id));
  }, [isSearchMode, parentCategories, searchMode, shouldPromptForSearch, visibleIds]);

  const effectiveChildrenMap = useMemo(() => {
    if (shouldPromptForSearch || !isSearchMode || !visibleIds || searchMode === "manual") return childrenMap;

    const nextChildrenMap = new Map<number, Category[]>();
    for (const [parentId, children] of childrenMap.entries()) {
      nextChildrenMap.set(
        parentId,
        children.filter((child) => visibleIds.has(child.id)),
      );
    }
    return nextChildrenMap;
  }, [childrenMap, isSearchMode, searchMode, shouldPromptForSearch, visibleIds]);

  const flattenedRows = useMemo(() => {
    if (shouldPromptForSearch) return [];

    const rows = flattenVisibleCategories(effectiveParentCategories, effectiveChildrenMap, effectiveExpandedNodes, shouldAutoExpandSearchResults);
    if (trimmedQuery || maxInitialOptions === undefined || maxInitialOptions < 1) {
      return rows;
    }

    const limitedRows = rows.slice(0, maxInitialOptions);
    const includedIds = new Set(limitedRows.map((row) => row.category.id));
    const pinnedIds = new Set<number>();

    for (const selectedId of selectedIds) {
      for (const ancestorId of getAncestorPathIds(categories, selectedId)) {
        pinnedIds.add(ancestorId);
      }
    }

    if (typeof expandToId === "number") {
      for (const ancestorId of getAncestorPathIds(categories, expandToId)) {
        pinnedIds.add(ancestorId);
      }
    }

    for (const row of rows) {
      if (!pinnedIds.has(row.category.id) || includedIds.has(row.category.id)) continue;
      limitedRows.push(row);
      includedIds.add(row.category.id);
    }

    return limitedRows;
  }, [
    categories,
    effectiveChildrenMap,
    effectiveExpandedNodes,
    effectiveParentCategories,
    expandToId,
    maxInitialOptions,
    selectedIds,
    shouldAutoExpandSearchResults,
    shouldPromptForSearch,
    trimmedQuery,
  ]);

  const canVirtualize = virtualized && !inline && !viewOnly;
  const treeVirtualizer = useVirtualizer({
    count: canVirtualize ? flattenedRows.length : 0,
    getScrollElement: () => dropdownViewportRef.current,
    estimateSize: () => estimatedItemHeight,
    initialRect: { width: 0, height: CATEGORY_TREE_DROPDOWN_MAX_HEIGHT },
    overscan,
    enabled: canVirtualize,
  });
  const virtualRows = canVirtualize ? treeVirtualizer.getVirtualItems() : [];

  const scrollVirtualTreeToStart = () => {
    if (!canVirtualize || flattenedRows.length === 0) return;
    treeVirtualizer.scrollToIndex(0, { align: "start" });
  };

  const moveActiveVirtualRow = (direction: 1 | -1) => {
    if (!canVirtualize || flattenedRows.length === 0) return;
    const nextIndex = activeIndex === null
      ? direction === 1 ? 0 : flattenedRows.length - 1
      : (activeIndex + direction + flattenedRows.length) % flattenedRows.length;
    setActiveIndex(nextIndex);
    treeVirtualizer.scrollToIndex(nextIndex, { align: "auto" });
  };

  const handleVirtualTreeKeyDown = (event: React.KeyboardEvent) => {
    if (!canVirtualize) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveActiveVirtualRow(1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveActiveVirtualRow(-1);
      return;
    }

    if (event.key === "Enter" && activeIndex !== null) {
      const row = flattenedRows[activeIndex];
      if (!row) return;
      event.preventDefault();
      handleSelect(row.category.id, row.category);
    }
  };

  useEffect(() => {
    setActiveIndex(null);
  }, [flattenedRows]);

  const renderCategoryRow = (category: Category, level: number = 0, virtualItem?: VirtualItem) => {
    const children = effectiveChildrenMap.get(category.id) || [];
    const hasChildren = children.length > 0;
    const isExpanded = hasChildren && (shouldAutoExpandSearchResults || effectiveExpandedNodes.has(category.id));
    const isSelected = selectedIds.has(category.id);
    const isSelectable = !viewOnly && (!leafOnlySelect || !hasChildren);
    const isActive = virtualItem?.index === activeIndex;
    const rowStyle = virtualItem
      ? {
          position: "absolute" as const,
          top: 0,
          left: 0,
          width: "100%",
          transform: `translateY(${virtualItem.start}px)`,
        }
      : undefined;

    return (
      <div
        key={category.id}
        ref={virtualItem ? treeVirtualizer.measureElement : undefined}
        data-index={virtualItem?.index}
        className={cn("min-w-0 [content-visibility:auto] [contain-intrinsic-size:44px]", !virtualItem && "animate-in fade-in-50 duration-200")}
        style={{ animationDelay: virtualItem ? undefined : `${level * 30}ms`, ...rowStyle }}
      >
        <div
          role="treeitem"
          aria-level={level + 1}
          aria-expanded={hasChildren ? isExpanded : undefined}
          aria-selected={viewOnly ? undefined : isSelected}
          onClick={() => !viewOnly && handleSelect(category.id, category)}
          className={cn(
            "relative flex min-w-0 items-center px-3 py-2.5 min-h-11 transition-all duration-200 rounded-3xl",
            TREE_NODE_GAP_CLASS,
            !viewOnly && (isSelectable ? "cursor-pointer" : "cursor-default"),
            isSelectable && !isSelected && "hover:bg-accent/50",
            canVirtualize && isActive && "bg-accent/50",
            // Selected state - đồng bộ cho tất cả
            !viewOnly && isSelected && "bg-accent/40",
          )}
          style={{ paddingLeft: `${level * indentSize + baseIndent}rem` }}
        >
          {/* Left indicator removed - using border instead */}

          {/* Expand/Collapse button */}
          {hasChildren ? (
            <button
              type="button"
              aria-label={gi18n.toggleCategory ? gi18n.toggleCategory(category.name, isExpanded) : isExpanded ? `Collapse ${category.name}` : `Expand ${category.name}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(category.id);
              }}
              className={cn(
                "p-0.5 rounded-lg transition-all duration-200",
                "hover:scale-110 active:scale-95",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                isExpanded && "text-primary",
                shouldAutoExpandSearchResults && "opacity-60 cursor-not-allowed hover:scale-100 active:scale-100",
              )}
              disabled={shouldAutoExpandSearchResults}
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
              <span className="min-w-0 text-sm font-medium leading-snug wrap-anywhere">{category.name}</span>
            </div>
          ) : (
            // Single/Multi select mode: icon + text + badge
            <div className={cn("flex min-w-0 flex-1 items-center overflow-hidden", TREE_NODE_GAP_CLASS)}>
              {category.icon && <div className="h-4 w-4 shrink-0 flex items-center justify-center text-current">{category.icon}</div>}
              <span
                className={cn(
                  "min-w-0 flex-1 text-sm leading-snug wrap-anywhere transition-all duration-200",
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
          {renderItemActions && (
            <div className="shrink-0 ml-auto" onClick={(e) => e.stopPropagation()}>
              {renderItemActions(category)}
            </div>
          )}
        </div>

        {/* Children with animated container */}
        {!virtualItem && hasChildren && isExpanded && (
          <div
            role="group"
            className={cn(
              TREE_BRANCH_OFFSET_CLASS,
              "border-l-2 border-dashed border-border/50",
              "animate-in slide-in-from-top-2 fade-in-50 duration-200",
            )}
          >
            {children.map((child) => renderCategoryRow(child, level + 1))}
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
            onChange={(e) => {
              setQuery(e.target.value);
              scrollVirtualTreeToStart();
            }}
            onKeyDown={handleVirtualTreeKeyDown}
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
                scrollVirtualTreeToStart();
                searchInputRef.current?.focus();
              }}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full",
                "flex items-center justify-center",
                "text-muted-foreground/80 hover:text-foreground hover:bg-muted transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
              )}
              aria-label={gi18n.clearSearch ?? "Clear search"}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  // Render tree content
  const renderTreeContent = () => (
    <div className="space-y-0.5 overflow-x-hidden">
      {shouldPromptForSearch ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
            <Search className="w-6 h-6 text-muted-foreground/50" />
          </div>
          <span className="text-sm text-muted-foreground">Type at least {minSearchLength} characters to search</span>
        </div>
      ) : effectiveParentCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
            {isSearchMode ? <SearchX className="w-6 h-6 text-muted-foreground/50" /> : <Layers className="w-6 h-6 text-muted-foreground/50" />}
          </div>
          <span className="text-sm text-muted-foreground">{isSearchMode ? mergedLabels.noResultsText : mergedLabels.emptyText}</span>
        </div>
      ) : (
        effectiveParentCategories.map((cat) => renderCategoryRow(cat))
      )}
    </div>
  );

  const renderVirtualTreeContent = () => {
    if (shouldPromptForSearch) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
            <Search className="w-6 h-6 text-muted-foreground/50" />
          </div>
          <span className="text-sm text-muted-foreground">Type at least {minSearchLength} characters to search</span>
        </div>
      );
    }

    if (flattenedRows.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
            {isSearchMode ? <SearchX className="w-6 h-6 text-muted-foreground/50" /> : <Layers className="w-6 h-6 text-muted-foreground/50" />}
          </div>
          <span className="text-sm text-muted-foreground">{isSearchMode ? mergedLabels.noResultsText : mergedLabels.emptyText}</span>
        </div>
      );
    }

    return (
      <div className="relative overflow-x-hidden" style={{ height: `${treeVirtualizer.getTotalSize()}px` }}>
        {virtualRows.map((virtualRow) => {
          const row = flattenedRows[virtualRow.index];
          if (!row) return null;
          return renderCategoryRow(row.category, row.level, virtualRow);
        })}
      </div>
    );
  };

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
          role="tree"
          aria-labelledby={labelId}
          aria-describedby={describedBy}
          aria-multiselectable={singleSelect ? undefined : true}
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
          role="tree"
          aria-labelledby={labelId}
          aria-describedby={describedBy}
          aria-multiselectable={singleSelect ? undefined : true}
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
      button: formControlSizeStyles.sm.control,
      iconWrap: "p-1",
      icon: formControlSizeStyles.sm.icon,
      text: formControlSizeStyles.sm.label,
      badge: formControlSizeStyles.sm.tag,
      actionIcon: formControlSizeStyles.sm.icon,
      clearIcon: "h-3 w-3",
    },
    md: {
      button: formControlSizeStyles.md.control,
      iconWrap: "p-1.5",
      icon: "w-4 h-4",
      text: formControlSizeStyles.md.label,
      badge: formControlSizeStyles.md.tag,
      actionIcon: "w-4 h-4",
      clearIcon: "h-3.5 w-3.5",
    },
    lg: {
      button: formControlSizeStyles.lg.control,
      iconWrap: "p-1.5",
      icon: "w-5 h-5",
      text: formControlSizeStyles.lg.label,
      badge: formControlSizeStyles.lg.tag,
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
      scrollVirtualTreeToStart();
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
    <div className="flex flex-col overflow-hidden" style={{ maxHeight: CATEGORY_TREE_DROPDOWN_MAX_HEIGHT }}>
      {renderSearch({ sticky: false, className: "border-b border-border/30 p-2 pb-2" })}
      <div
        ref={dropdownViewportRef}
        id={`${resolvedId}-tree`}
        role="tree"
        aria-multiselectable={singleSelect ? undefined : true}
        data-os-ignore={virtualized ? "" : undefined}
        tabIndex={canVirtualize ? 0 : undefined}
        onKeyDown={handleVirtualTreeKeyDown}
        className={cn("min-h-0 flex-1 overflow-auto overflow-x-hidden p-2 pt-2")}
      >
        {canVirtualize ? renderVirtualTreeContent() : renderTreeContent()}
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
          "p-0 overflow-hidden",
          "border-border/40 bg-popover/95 text-popover-foreground",
          "shadow-2xl backdrop-blur-xl",
        )}
        borderMode={resolvedBorderMode}
        trigger={
          <div
            id={resolvedId}
            tabIndex={disabled ? -1 : 0}
            role="combobox"
            aria-haspopup="tree"
            aria-expanded={isOpen}
            aria-controls={`${resolvedId}-tree`}
            aria-labelledby={labelId}
            aria-describedby={describedBy}
            aria-required={required}
            aria-invalid={!!effectiveError}
            onKeyDown={(event) => {
              if (disabled) return;
              if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
                event.preventDefault();
                handleOpenChange(!isOpen);
                if (event.key === "ArrowDown" && canVirtualize && flattenedRows.length > 0) {
                  setActiveIndex(0);
                  treeVirtualizer.scrollToIndex(0, { align: "start" });
                }
              }
            }}
            className={cn(
              "group flex w-full items-center justify-between transition-all duration-200",
              formControlFixedClass,
              getBorderRadiusClass(resolvedBorderMode ?? "full"),
              "backdrop-blur-sm",
              triggerSizeStyles[size].button,
              triggerVariantStyles[variant],
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              disabled && "opacity-50 cursor-not-allowed hover:transform-none hover:shadow-none",
              isOpen && "ring-2 ring-primary/30 border-primary/50 shadow-lg shadow-primary/10",
              effectiveError && "border-destructive focus-visible:ring-destructive/30",
            )}
          >
            <div className="flex min-h-0 min-w-0 flex-1 items-center gap-2.5 overflow-hidden text-left">
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
                  formControlValueClass,
                  "font-medium transition-colors duration-200",
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
                <button
                  type="button"
                  aria-label={gi18n.clearSelection ?? "Clear selection"}
                  onClick={handleClear}
                  className={cn(
                    "opacity-0 group-hover:opacity-100 transition-all duration-200",
                    "p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                  )}
                >
                  <X className={triggerSizeStyles[size].clearIcon} />
                </button>
              )}
              {selectedCount > 0 && !singleSelect && (
                <span className={cn("inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 font-bold text-primary", triggerSizeStyles[size].badge)}>{selectedCount}</span>
              )}
              <span className={cn("transition-all duration-300 text-muted-foreground group-hover:text-foreground", isOpen && "rotate-180 text-primary")}>
                <ChevronDown className={triggerSizeStyles[size].actionIcon} />
              </span>
            </div>
          </div>
        }
      >
        {dropdownBody}
      </Popover>
      {renderAssistiveText()}
    </div>
  );
}
