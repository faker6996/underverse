"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";
import type { DataTableColumn } from "../types";
import { getColumnWidth } from "../utils/columns";

export function useStickyColumns<T>(visibleColumns: DataTableColumn<T>[]) {
  const stickyPositions = React.useMemo(() => {
    const positions: Record<string, { left?: number; right?: number }> = {};

    let leftOffset = 0;
    for (const col of visibleColumns) {
      if (col.fixed === "left") {
        positions[col.key] = { left: leftOffset };
        leftOffset += getColumnWidth(col);
      }
    }

    let rightOffset = 0;
    for (let i = visibleColumns.length - 1; i >= 0; i--) {
      const col = visibleColumns[i];
      if (col.fixed === "right") {
        positions[col.key] = { right: rightOffset };
        rightOffset += getColumnWidth(col);
      }
    }

    return positions;
  }, [visibleColumns]);

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
      isStripedRow ? "bg-muted!" : "bg-card!",
    );
  }, []);

  return { getStickyColumnStyle, getStickyHeaderClass, getStickyCellClass };
}

