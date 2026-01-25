import type { DataTableColumn } from "../types";

export function getColumnWidth<T>(col: DataTableColumn<T>, fallback = 150): number {
  // If explicit width provided, use it
  if (typeof col.width === "number") return col.width;
  if (col.width) {
    const raw = String(col.width);
    const parsed = parseInt(raw, 10);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }

  // If group column (has children), sum children widths
  if (col.children && col.children.length > 0) {
    return col.children.reduce((sum, child) => sum + getColumnWidth(child, fallback), 0);
  }

  // Fallback for leaf without width
  return fallback;
}

