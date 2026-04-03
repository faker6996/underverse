"use client";

import React from "react";
import { Filter as FilterIcon } from "lucide-react";
import { Combobox } from "../../Combobox";
import { DatePicker } from "../../DatePicker";
import Input from "../../Input";
import { Popover } from "../../Popover";
import { TableHead, TableRow } from "../../Table";
import { Tooltip } from "../../Tooltip";
import { cn } from "../../../utils/cn";
import type { DataTableColumn, HeaderRow, Sorter, DataTableSize } from "../types";

export function DataTableHeader<T extends Record<string, any>>({
  headerRows,
  headerAlign,
  headerTitleClass,
  headerMinHeightClass,
  sortIconClass,
  size,
  filters,
  sort,
  columnDividers,
  setCurPage,
  setFilters,
  setSort,
  onAutoFitColumn,
  enableHeaderAutoFit,
  getStickyHeaderClass,
  getStickyHeaderCellStyle,
  t,
}: {
  headerRows: HeaderRow<T>[];
  headerAlign: "left" | "center" | "right";
  headerTitleClass: string;
  headerMinHeightClass: string;
  sortIconClass: string;
  size: DataTableSize;
  filters: Record<string, any>;
  sort: Sorter;
  columnDividers: boolean;
  setCurPage: React.Dispatch<React.SetStateAction<number>>;
  setFilters: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  setSort: React.Dispatch<React.SetStateAction<Sorter>>;
  onAutoFitColumn?: (columnKey: string) => void;
  enableHeaderAutoFit?: boolean;
  getStickyHeaderClass: (col: DataTableColumn<T>) => string;
  getStickyHeaderCellStyle: (headerCell: HeaderRow<T>[number]) => React.CSSProperties;
  t: (key: string) => string;
}) {
  const renderFilterControl = React.useCallback(
    (col: DataTableColumn<T>) => {
      if (!col.filter) return null;
      const key = col.key;
      const commonProps = { className: "w-full", size } as const;

      if (col.filter.type === "text") {
        return (
          <Input
            {...commonProps}
            placeholder={col.filter.placeholder || `Search ${String(col.title)}`}
            value={filters[key] || ""}
            onChange={(e) => {
              setCurPage(1);
              setFilters((prev) => ({ ...prev, [key]: e.target.value }));
            }}
          />
        );
      }

      if (col.filter.type === "select") {
        return (
          <Combobox
            options={["", ...(col.filter.options || [])]}
            size={size}
            className="w-full"
            value={filters[key] ?? ""}
            onChange={(value) => {
              setCurPage(1);
              setFilters((prev) => ({ ...prev, [key]: value || undefined }));
            }}
            placeholder={col.filter.placeholder || `Select ${String(col.title)}`}
          />
        );
      }

      if (col.filter.type === "date") {
        return (
          <DatePicker
            size={size}
            placeholder={col.filter.placeholder || `Select ${String(col.title)}`}
            value={filters[key] || null}
            onChange={(date) => {
              setCurPage(1);
              setFilters((prev) => ({ ...prev, [key]: date ? (date as any) : undefined }));
            }}
          />
        );
      }

      return null;
    },
    [filters, setCurPage, setFilters, size],
  );

  const renderHeaderContent = React.useCallback(
    (col: DataTableColumn<T>, isLeaf: boolean) => {
      if (!isLeaf) {
        return (
          <div
            className={cn(
              "flex items-center gap-1",
              headerMinHeightClass,
              col.align === "right" && "justify-end",
              col.align === "center" && "justify-center",
              !col.align && "justify-start",
            )}
          >
            <span className={cn("font-medium whitespace-nowrap select-text", headerTitleClass)}>{col.title}</span>
          </div>
        );
      }

      const isRightAlign = col.align === "right" || (!col.align && headerAlign === "right");
      const isCenterAlign = col.align === "center" || (!col.align && headerAlign === "center");

      const titleContent = (
        <div className="flex items-center gap-1">
          <span className={cn("font-medium whitespace-nowrap select-text", headerTitleClass)}>{col.title}</span>
          {col.sortable && (
            <button
              className={cn(
                "p-1 rounded-lg transition-all duration-200 hover:bg-accent",
                sort?.key === col.key ? "opacity-100 bg-accent" : "opacity-60 hover:opacity-100",
              )}
              onClick={() => {
                setCurPage(1);
                setSort((current) => {
                  if (!current || current.key !== col.key) return { key: col.key, order: "asc" };
                  if (current.order === "asc") return { key: col.key, order: "desc" };
                  return null;
                });
              }}
              aria-label="Sort"
              title={`Sort by ${String(col.title)}`}
            >
              <svg viewBox="0 0 20 20" fill="none" className={cn("inline-block", sortIconClass)}>
                <path
                  d="M7 8l3-3 3 3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={sort?.key === col.key && sort.order === "asc" ? 1 : 0.4}
                />
                <path
                  d="M7 12l3 3 3-3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={sort?.key === col.key && sort.order === "desc" ? 1 : 0.4}
                />
              </svg>
            </button>
          )}
        </div>
      );

      const filterContent = col.filter ? (
        <Popover
          placement="bottom-start"
          trigger={
            <button
              className={cn(
                "p-1.5 rounded-lg transition-all duration-200 hover:bg-accent",
                filters[col.key] ? "bg-accent text-primary" : "text-muted-foreground",
              )}
              aria-label="Filter"
              title={`Filter by ${String(col.title)}`}
            >
              <FilterIcon className="w-4 h-4" />
            </button>
          }
        >
          <div className="p-3 w-64 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">{col.title}</div>
              {filters[col.key] !== undefined && filters[col.key] !== null && filters[col.key] !== "" && (
                <button
                  onClick={() => {
                    setCurPage(1);
                    setFilters((prev) => ({ ...prev, [col.key]: undefined }));
                  }}
                  className="text-xs text-destructive hover:underline"
                >
                  {t("clearFilter")}
                </button>
              )}
            </div>
            {renderFilterControl(col)}
          </div>
        </Popover>
      ) : null;

      return (
        <div
          className={cn(
            "flex items-center gap-2",
            headerMinHeightClass,
            isRightAlign && "justify-end",
            isCenterAlign && "justify-center",
            !isRightAlign && !isCenterAlign && "justify-start",
          )}
        >
          {isRightAlign ? (
            <>
              {filterContent}
              {titleContent}
            </>
          ) : (
            <>
              {titleContent}
              {filterContent}
            </>
          )}
        </div>
      );
    },
    [
      filters,
      headerAlign,
      headerMinHeightClass,
      headerTitleClass,
      renderFilterControl,
      setCurPage,
      setFilters,
      setSort,
      sort,
      sortIconClass,
      t,
    ],
  );

  return (
    <>
      {headerRows.map((row, rowIndex) => (
        <TableRow key={`header-row-${rowIndex}`}>
          {row.map((headerCell, cellIndex) => {
            const { column: col, colSpan, rowSpan, isLeaf } = headerCell;
            const prevCell = cellIndex > 0 ? row[cellIndex - 1] : null;
            const prevCol = prevCell?.column;
            const isAfterFixedLeft = prevCol?.fixed === "left";
            const showBorderLeft = columnDividers && cellIndex > 0 && !isAfterFixedLeft && !col.fixed;

            return (
              <TableHead
                key={col.key}
                colSpan={colSpan}
                rowSpan={rowSpan}
                data-underverse-column-key={isLeaf ? col.key : undefined}
                style={{
                  width: col.width,
                  ...getStickyHeaderCellStyle(headerCell),
                }}
                className={cn(
                  "relative",
                  (col.align === "right" || (!col.align && headerAlign === "right")) && "text-right",
                  (col.align === "center" || (!col.align && headerAlign === "center")) && "text-center",
                  showBorderLeft && "border-l border-border/60",
                  getStickyHeaderClass(col),
                )}
              >
                {renderHeaderContent(col, isLeaf)}
                {isLeaf && enableHeaderAutoFit && (
                  <Tooltip
                    placement="top"
                    content={<span className="text-xs font-medium">Double click to auto-fit</span>}
                  >
                    <button
                      type="button"
                      aria-label={`Auto fit ${String(col.title)}`}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                      }}
                      onDoubleClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onAutoFitColumn?.(col.key);
                      }}
                      className={cn(
                        "absolute inset-y-0 right-0 z-10 w-3 -mr-1",
                        "cursor-col-resize select-none bg-transparent",
                        "after:absolute after:inset-y-2 after:right-[3px] after:w-px after:bg-border/0 after:transition-colors",
                        "hover:after:bg-primary/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
                      )}
                    />
                  </Tooltip>
                )}
              </TableHead>
            );
          })}
        </TableRow>
      ))}
    </>
  );
}
