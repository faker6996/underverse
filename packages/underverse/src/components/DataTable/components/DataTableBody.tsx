"use client";

import React from "react";
import { TableBody, TableCell, TableRow } from "../../Table";
import { Tooltip } from "../../Tooltip";
import { cn } from "../../../utils/cn";
import type { DataTableColumn, DataTableDensity } from "../types";

function DataTableOverflowText({
  text,
  align,
}: {
  text: string;
  align?: DataTableColumn<Record<string, any>>["align"];
}) {
  const triggerId = React.useId();
  const [isOverflowing, setIsOverflowing] = React.useState(false);

  const alignClass = align === "right"
    ? "text-right"
    : align === "center"
      ? "text-center"
      : "text-left";

  const measureOverflow = React.useCallback(() => {
    if (typeof document === "undefined") return;
    const element = document.querySelector<HTMLElement>(`[data-underverse-datatable-cell="${triggerId}"]`);
    if (!element) return;

    setIsOverflowing(
      element.scrollWidth - element.clientWidth > 1
      || element.scrollHeight - element.clientHeight > 1,
    );
  }, [triggerId]);

  React.useLayoutEffect(() => {
    measureOverflow();
  }, [measureOverflow, text]);

  React.useEffect(() => {
    if (typeof document === "undefined") return;
    const element = document.querySelector<HTMLElement>(`[data-underverse-datatable-cell="${triggerId}"]`);
    if (!element) return;

    if (typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      measureOverflow();
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [measureOverflow, triggerId]);

  const trigger = (
    <button
      type="button"
      data-underverse-datatable-cell={triggerId}
      onMouseEnter={measureOverflow}
      onFocus={measureOverflow}
      className={cn(
        "block w-full truncate bg-transparent p-0 font-inherit text-inherit select-text",
        "cursor-text",
        alignClass,
      )}
    >
      {text}
    </button>
  );

  return (
    <Tooltip
      disabled={!isOverflowing}
      placement="top"
      content={(
        <div className={cn("max-w-[min(40rem,calc(100vw-2rem))] whitespace-pre-wrap break-all select-text", alignClass)}>
          {text}
        </div>
      )}
    >
      {trigger}
    </Tooltip>
  );
}

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
  labels,
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
  labels?: { noData?: string };
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
            {labels?.noData || t("noData")}
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
                    data-underverse-column-key={col.key}
                    style={getStickyColumnStyle(col)}
                    className={cn(
                      cellPadding,
                      col.align === "right" && "text-right",
                      col.align === "center" && "text-center",
                      showBorderLeft && "border-l border-border/60",
                      getStickyCellClass(col, isStripedRow),
                    )}
                  >
                    {col.render
                      ? col.render(value, row, idx)
                      : <DataTableOverflowText text={String(value ?? "")} align={col.align} />}
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
