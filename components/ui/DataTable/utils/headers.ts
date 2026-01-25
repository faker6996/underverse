import type { DataTableColumn, HeaderCell, HeaderRow } from "../types";

/**
 * Check if a column is a leaf (has no children)
 */
export function isLeafColumn<T>(col: DataTableColumn<T>): boolean {
  return !col.children || col.children.length === 0;
}

/**
 * Get all leaf columns from a hierarchical column structure.
 * Leaf columns are the ones that actually render data (no children).
 * Used for body rendering.
 */
export function getLeafColumns<T>(columns: DataTableColumn<T>[]): DataTableColumn<T>[] {
  const leaves: DataTableColumn<T>[] = [];

  function traverse(cols: DataTableColumn<T>[]) {
    for (const col of cols) {
      if (isLeafColumn(col)) {
        leaves.push(col);
      } else if (col.children) {
        traverse(col.children);
      }
    }
  }

  traverse(columns);
  return leaves;
}

/**
 * Calculate the maximum depth of the column tree.
 * Returns the number of header rows needed.
 */
export function getHeaderDepth<T>(columns: DataTableColumn<T>[]): number {
  function getDepth(cols: DataTableColumn<T>[]): number {
    if (!cols || cols.length === 0) return 0;

    let maxDepth = 1;
    for (const col of cols) {
      if (col.children && col.children.length > 0) {
        maxDepth = Math.max(maxDepth, 1 + getDepth(col.children));
      }
    }
    return maxDepth;
  }

  return getDepth(columns);
}

/**
 * Calculate colspan for a column (number of leaf descendants).
 * Can be overridden via col.colSpan.
 */
export function getColSpan<T>(col: DataTableColumn<T>): number {
  // Use explicit colSpan if provided
  if (col.colSpan !== undefined) return col.colSpan;

  // Leaf columns have colspan 1
  if (isLeafColumn(col)) return 1;

  // Group columns: sum of children colspans
  return col.children!.reduce((sum, child) => sum + getColSpan(child), 0);
}

/**
 * Calculate rowspan for a column (depth from this node to deepest leaf).
 * Can be overridden via col.rowSpan.
 *
 * @param col - The column to calculate rowspan for
 * @param maxDepth - Total depth of the header (number of rows)
 * @param currentDepth - Current row index (1-based)
 */
export function getRowSpan<T>(col: DataTableColumn<T>, maxDepth: number, currentDepth: number): number {
  // Use explicit rowSpan if provided
  if (col.rowSpan !== undefined) return col.rowSpan;

  // Leaf columns span remaining rows
  if (isLeafColumn(col)) {
    return maxDepth - currentDepth + 1;
  }

  // Group columns only occupy their own row
  return 1;
}

/**
 * Build the header row structure for rendering.
 * Converts hierarchical columns into a 2D grid of header cells.
 *
 * Algorithm:
 * 1. Calculate maxDepth (number of header rows needed)
 * 2. Initialize empty rows
 * 3. Recursively build cells with auto-calculated colspan/rowspan
 * 4. Return 2D array of HeaderCell objects
 *
 * Time Complexity: O(n) where n = total number of columns (all levels)
 */
export function buildHeaderRows<T>(columns: DataTableColumn<T>[]): HeaderRow<T>[] {
  const maxDepth = getHeaderDepth(columns);
  const rows: HeaderRow<T>[] = Array.from({ length: maxDepth }, () => []);

  function buildCell(col: DataTableColumn<T>, rowIndex: number, colIndex: number): number {
    const colSpan = getColSpan(col);
    const rowSpan = getRowSpan(col, maxDepth, rowIndex + 1);
    const isLeaf = isLeafColumn(col);

    rows[rowIndex].push({
      column: col,
      colSpan,
      rowSpan,
      isLeaf,
      rowIndex,
      colIndex,
    });

    // Recursively build children in the next row
    if (col.children && col.children.length > 0) {
      let childColIndex = colIndex;
      for (const child of col.children) {
        childColIndex = buildCell(child, rowIndex + 1, childColIndex);
      }
    }

    return colIndex + colSpan;
  }

  let currentColIndex = 0;
  for (const col of columns) {
    currentColIndex = buildCell(col, 0, currentColIndex);
  }

  return rows;
}

/**
 * Filter visible columns recursively.
 * Groups are visible if at least one child is visible.
 *
 * @param columns - Column definitions (can be nested)
 * @param visibleKeys - Set of visible column keys
 * @returns Filtered column structure
 */
export function filterVisibleColumns<T>(
  columns: DataTableColumn<T>[],
  visibleKeys: Set<string>,
): DataTableColumn<T>[] {
  return columns
    .map((col) => {
      // If column has children, filter children recursively
      if (col.children) {
        const visibleChildren = filterVisibleColumns(col.children, visibleKeys);

        // Only include group if it has visible children
        if (visibleChildren.length > 0) {
          return { ...col, children: visibleChildren };
        }
        return null;
      }

      // Leaf column: include if visible
      return visibleKeys.has(col.key) ? col : null;
    })
    .filter((col): col is DataTableColumn<T> => col !== null);
}

/**
 * Get leaf columns with sticky (fixed) inheritance from parent groups.
 * If a parent has fixed="left", children inherit it unless they specify their own.
 *
 * Used for calculating sticky positions when groups have fixed positioning.
 *
 * @param columns - Column definitions (can be nested)
 * @param inheritedFixed - Fixed positioning inherited from parent
 * @returns Flat array of leaf columns with resolved fixed values
 */
export function getLeafColumnsWithFixedInheritance<T>(
  columns: DataTableColumn<T>[],
  inheritedFixed?: "left" | "right",
): DataTableColumn<T>[] {
  const leaves: DataTableColumn<T>[] = [];

  for (const col of columns) {
    const effectiveFixed = col.fixed ?? inheritedFixed;

    if (isLeafColumn(col)) {
      leaves.push({ ...col, fixed: effectiveFixed });
    } else if (col.children) {
      leaves.push(...getLeafColumnsWithFixedInheritance(col.children, effectiveFixed));
    }
  }

  return leaves;
}
