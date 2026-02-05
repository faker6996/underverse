"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";
import type { DataTableColumn, HeaderCell } from "../types";
import { getColumnWidth } from "../utils/columns";
import { filterVisibleColumns, getLeafColumns, getLeafColumnsWithFixedInheritance } from "../utils/headers";

export function useStickyColumns<T>(columns: DataTableColumn<T>[], visibleKeys: Set<string>) {
  const visibleColumns = React.useMemo(() => filterVisibleColumns(columns, visibleKeys), [columns, visibleKeys]);

  const leafColumns = React.useMemo(() => getLeafColumnsWithFixedInheritance(visibleColumns), [visibleColumns]);

  const stickyPositions = React.useMemo(() => {
    const positions: Record<string, { left?: number; right?: number }> = {};

    let leftOffset = 0;
    for (const col of leafColumns) {
      if (col.fixed === "left") {
        positions[col.key] = { left: leftOffset };
        leftOffset += getColumnWidth(col);
      }
    }

    let rightOffset = 0;
    for (let i = leafColumns.length - 1; i >= 0; i--) {
      const col = leafColumns[i];
      if (col.fixed === "right") {
        positions[col.key] = { right: rightOffset };
        rightOffset += getColumnWidth(col);
      }
    }

    return positions;
  }, [leafColumns]);

  const getStickyColumnStyle = React.useCallback(
    (col: DataTableColumn<T>): React.CSSProperties => {
      if (!col.fixed) return {};
      const pos = stickyPositions[col.key];
      return {
        ...(pos?.left !== undefined && { left: pos.left }),
        ...(pos?.right !== undefined && { right: pos.right }),
      };
    },
    [stickyPositions],
  );

  const getStickyHeaderClass = React.useCallback((col: DataTableColumn<T>) => {
    if (!col.fixed) return "";
    return cn(
      "sticky",
      col.fixed === "left" && "left-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)]",
      col.fixed === "right" && "right-0 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.15)]",
      "z-50 bg-muted!",
    );
  }, []);

  const getStickyCellClass = React.useCallback((col: DataTableColumn<T>, isStripedRow: boolean) => {
    if (!col.fixed) return "";
    return cn(
      "sticky z-10",
      col.fixed === "left" && "left-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)]",
      col.fixed === "right" && "right-0 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.15)]",
      isStripedRow ? "bg-muted/50!" : "bg-card!",
    );
  }, []);

  /**
   * Get sticky style for header cells (including group headers).
   * For group headers, uses the position of first/last sticky descendant.
   */
  const getStickyHeaderCellStyle = React.useCallback(
    (headerCell: HeaderCell<T>): React.CSSProperties => {
      const col = headerCell.column;

      // If leaf column, use existing logic
      if (headerCell.isLeaf) {
        return getStickyColumnStyle(col);
      }

      // If group column, check if any descendants are sticky
      const descendants = getLeafColumns([col]);
      const stickyDescendants = descendants.filter((d) => d.fixed);

      if (stickyDescendants.length === 0) return {};

      // Use first/last descendant's position
      const firstSticky = stickyDescendants[0];
      const lastSticky = stickyDescendants[stickyDescendants.length - 1];

      if (firstSticky.fixed === "left") {
        const pos = stickyPositions[firstSticky.key];
        return pos?.left !== undefined ? { left: pos.left } : {};
      }
      if (lastSticky.fixed === "right") {
        const pos = stickyPositions[lastSticky.key];
        return pos?.right !== undefined ? { right: pos.right } : {};
      }

      return {};
    },
    [stickyPositions, getStickyColumnStyle],
  );

  return {
    getStickyColumnStyle,
    getStickyHeaderClass,
    getStickyCellClass,
    getStickyHeaderCellStyle,
  };
}
