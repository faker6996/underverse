import type { ColumnColorGroup, DataTableColumn } from "../types";

/**
 * Parse a CSS color string (hex, rgb, rgba) to [r, g, b].
 * Returns null if parsing fails.
 */
export function parseColor(color: string): [number, number, number] | null {
  if (!color) return null;
  const c = color.trim().toLowerCase();

  // Hex (#RGB or #RRGGBB)
  if (c.startsWith("#")) {
    let hex = c.substring(1);
    if (hex.length === 3) {
      hex = hex.split("").map((char) => char + char).join("");
    }
    if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
        return [r, g, b];
      }
    }
    return null;
  }

  // rgb(r, g, b) or rgba(r, g, b, a)
  if (c.startsWith("rgb")) {
    const match = c.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (match) {
      const r = parseInt(match[1], 10);
      const g = parseInt(match[2], 10);
      const b = parseInt(match[3], 10);
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
        return [r, g, b];
      }
    }
    return null;
  }

  return null;
}

export function toRgba(r: number, g: number, b: number, alpha: number): string {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Get header background color (darker tint, ~25% opacity) */
export function getHeaderBgColor(colorTag: string): string | undefined {
  const rgb = parseColor(colorTag);
  if (!rgb) return colorTag; // Fallback to raw string (e.g., for CSS variables)
  return toRgba(rgb[0], rgb[1], rgb[2], 1);
}

/** Get body cell background color (lighter tint, ~8% opacity) */
export function getCellBgColor(colorTag: string): string | undefined {
  const rgb = parseColor(colorTag);
  if (!rgb) return colorTag; // Fallback to raw string
  return toRgba(rgb[0], rgb[1], rgb[2], 0.25);
}

export type GroupedColumns<T> = {
  groups: Array<{ colorTag: string; label: string; columns: DataTableColumn<T>[] }>;
  ungrouped: DataTableColumn<T>[];
};

/** Group leaf columns by their colorTag */
export function groupColumnsByColorTag<T>(
  leafCols: DataTableColumn<T>[],
  colorGroups?: Record<string, ColumnColorGroup>,
): GroupedColumns<T> {
  const groupsMap = new Map<string, DataTableColumn<T>[]>();
  const ungrouped: DataTableColumn<T>[] = [];

  for (const col of leafCols) {
    if (col.colorTag && colorGroups && colorGroups[col.colorTag]) {
      const tag = col.colorTag;
      if (!groupsMap.has(tag)) {
        groupsMap.set(tag, []);
      }
      groupsMap.get(tag)!.push(col);
    } else {
      ungrouped.push(col);
    }
  }

  const groups: GroupedColumns<T>["groups"] = [];
  if (colorGroups) {
    // Keep the order of colors as defined in colorGroups
    for (const [tag, groupConfig] of Object.entries(colorGroups)) {
      if (groupsMap.has(tag)) {
        groups.push({
          colorTag: tag,
          label: groupConfig.label,
          columns: groupsMap.get(tag)!,
        });
      }
    }
  }

  return { groups, ungrouped };
}
