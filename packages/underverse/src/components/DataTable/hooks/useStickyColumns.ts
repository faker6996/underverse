"use client";

import React from "react";
import { cn } from "../../../utils/cn";
import type { DataTableColumn, HeaderCell } from "../types";
import { buildStickyLayout, resolveGroupStickyPosition, resolveStickyPosition } from "../utils/sticky";

export function useStickyColumns<T>(visibleColumns: DataTableColumn<T>[]) {
  const { positions, leftBoundaryKey, rightBoundaryKey } = React.useMemo(() => buildStickyLayout(visibleColumns), [visibleColumns]);

  const getStickyColumnStyle = React.useCallback(
    (col: DataTableColumn<T>): React.CSSProperties => {
      const pos = resolveStickyPosition(col, positions);
      if (!pos) return {};
      return {
        ...(pos?.left !== undefined && { left: pos.left }),
        ...(pos?.right !== undefined && { right: pos.right }),
      };
    },
    [positions],
  );

  const getBoundaryShadowClass = React.useCallback(
    (col: DataTableColumn<T>) => {
      if (col.fixed === "left" && col.key === leftBoundaryKey) {
        return "border-r border-border/80 shadow-[10px_0_16px_-10px_rgba(0,0,0,0.55)]";
      }
      if (col.fixed === "right" && col.key === rightBoundaryKey) {
        return "border-l border-border/80 shadow-[-10px_0_16px_-10px_rgba(0,0,0,0.55)]";
      }
      return "";
    },
    [leftBoundaryKey, rightBoundaryKey],
  );

  const getStickyHeaderClass = React.useCallback(
    (col: DataTableColumn<T>) => {
      if (!col.fixed) return "";
      return cn("sticky", col.fixed === "left" && "left-0", col.fixed === "right" && "right-0", getBoundaryShadowClass(col), "z-50 !bg-muted");
    },
    [getBoundaryShadowClass],
  );

  const getStickyCellClass = React.useCallback(
    (col: DataTableColumn<T>, isStripedRow: boolean) => {
      if (!col.fixed) return "";
      return cn(
        "sticky z-10",
        col.fixed === "left" && "left-0",
        col.fixed === "right" && "right-0",
        getBoundaryShadowClass(col),
        isStripedRow ? "!bg-surface-1" : "!bg-surface-0",
      );
    },
    [getBoundaryShadowClass],
  );

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

      const pos = resolveGroupStickyPosition(col, positions);
      if (!pos) return {};
      return {
        ...(pos.left !== undefined && { left: pos.left }),
        ...(pos.right !== undefined && { right: pos.right }),
      };
    },
    [positions, getStickyColumnStyle],
  );

  return {
    getStickyColumnStyle,
    getStickyHeaderClass,
    getStickyCellClass,
    getStickyHeaderCellStyle,
  };
}
