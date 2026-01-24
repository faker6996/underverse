import type { DataTableColumn } from "../types";

export function getColumnWidth<T>(col: DataTableColumn<T>, fallback = 150) {
  if (typeof col.width === "number") return col.width;
  const raw = col.width ? String(col.width) : String(fallback);
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

