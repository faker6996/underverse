import { getColumnWidth } from "./columns.ts";
import { getLeafColumnsWithFixedInheritance } from "./headers.ts";
import type { DataTableColumn } from "../types.ts";

export type StickyPosition = { left?: number; right?: number };

export type StickyLayout = {
  positions: Record<string, StickyPosition>;
  leftBoundaryKey: string | null;
  rightBoundaryKey: string | null;
};

export function buildStickyLayout<T>(visibleColumns: DataTableColumn<T>[]): StickyLayout {
  const leafColumns = getLeafColumnsWithFixedInheritance(visibleColumns);
  const positions: Record<string, StickyPosition> = {};

  let leftOffset = 0;
  for (const column of leafColumns) {
    if (column.fixed !== "left") continue;
    positions[column.key] = { left: leftOffset };
    leftOffset += getColumnWidth(column);
  }

  let rightOffset = 0;
  for (let index = leafColumns.length - 1; index >= 0; index -= 1) {
    const column = leafColumns[index];
    if (column.fixed !== "right") continue;
    positions[column.key] = { right: rightOffset };
    rightOffset += getColumnWidth(column);
  }

  const leftFixed = leafColumns.filter((column) => column.fixed === "left");
  const rightFixed = leafColumns.filter((column) => column.fixed === "right");

  return {
    positions,
    leftBoundaryKey: leftFixed.length > 0 ? leftFixed[leftFixed.length - 1].key : null,
    rightBoundaryKey: rightFixed.length > 0 ? rightFixed[0].key : null,
  };
}

export function resolveStickyPosition<T>(
  column: DataTableColumn<T>,
  positions: Record<string, StickyPosition>,
): StickyPosition | undefined {
  if (!column.fixed) return undefined;
  return positions[column.key];
}

export function resolveGroupStickyPosition<T>(
  column: DataTableColumn<T>,
  positions: Record<string, StickyPosition>,
): StickyPosition | undefined {
  const stickyDescendants = getLeafColumnsWithFixedInheritance([column]).filter((descendant) => descendant.fixed);

  if (stickyDescendants.length === 0) return undefined;

  const firstSticky = stickyDescendants[0];
  const lastSticky = stickyDescendants[stickyDescendants.length - 1];

  if (firstSticky.fixed === "left") {
    return positions[firstSticky.key];
  }

  if (lastSticky.fixed === "right") {
    return positions[lastSticky.key];
  }

  return undefined;
}
