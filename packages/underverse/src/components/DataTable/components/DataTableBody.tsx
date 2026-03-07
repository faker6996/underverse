"use client";

import React from "react";
import { TableBody, TableCell, TableRow } from "../../Table";
import { cn } from "../../../utils/cn";
import type { DataTableColumn, DataTableDensity } from "../types";

export function DataTableBodyRows<T extends Record<string, any>>({
  leafColumns,
  displayedData,
  loading,
  striped,
  density,
  densityRowClass,
  cellPadding,
  columnDividers,
  getRowKey,
  getStickyColumnStyle,
  getStickyCellClass,
  t,
}: {
  leafColumns: DataTableColumn<T>[];
  displayedData: T[];
  loading?: boolean;
  striped: boolean;
  density: DataTableDensity;
  densityRowClass: string;
  cellPadding: string;
  columnDividers: boolean;
  getRowKey: (row: T, idx: number) => string;
  getStickyColumnStyle: (col: DataTableColumn<T>) => React.CSSProperties;
  getStickyCellClass: (col: DataTableColumn<T>, isStripedRow: boolean) => string;
  t: (key: string) => string;
}) {
  return (
    <TableBody>
      {loading ? (
        <TableRow>
          <TableCell colSpan={leafColumns.length} className="text-center py-8">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-sm">{t("loading")}…</span>
            </div>
          </TableCell>
        </TableRow>
      ) : displayedData.length === 0 ? (
        <TableRow>
          <TableCell colSpan={leafColumns.length} className="text-center py-6 text-muted-foreground">
            {t("noData")}
          </TableCell>
        </TableRow>
      ) : (
        displayedData.map((row, idx) => {
          const isStripedRow = striped && idx % 2 === 0;

          return (
            <TableRow
              key={getRowKey(row, idx)}
              className={cn(densityRowClass, isStripedRow ? "bg-surface-1" : "bg-surface-0")}
              style={{
                contentVisibility: "auto",
                containIntrinsicSize: density === "compact" ? "0 36px" : density === "comfortable" ? "0 56px" : "0 48px",
              }}
            >
              {leafColumns.map((col, colIdx) => {
                const value = col.dataIndex ? row[col.dataIndex as keyof T] : undefined;
                const prevCol = colIdx > 0 ? leafColumns[colIdx - 1] : null;
                const isAfterFixedLeft = prevCol?.fixed === "left";
                const showBorderLeft = columnDividers && colIdx > 0 && !isAfterFixedLeft && !col.fixed;

                return (
                  <TableCell
                    key={col.key}
                    style={getStickyColumnStyle(col)}
                    className={cn(
                      cellPadding,
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                      showBorderLeft && "border-l border-border/60",
                      getStickyCellClass(col, isStripedRow),
                    )}
                  >
                    {col.render ? col.render(value, row, idx) : String(value ?? "")}
                  </TableCell>
                );
              })}
            </TableRow>
          );
        })
      )}
    </TableBody>
  );
}
