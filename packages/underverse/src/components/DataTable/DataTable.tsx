"use client";

import { Table, TableHeader } from "../Table";
import { useOverlayScrollbarTarget } from "../OverlayScrollbarProvider";
import { cn } from "../../utils/cn";
import { useSmartTranslations } from "../../hooks/useSmartTranslations";
import React from "react";
import { DataTableBodyRows } from "./components/DataTableBody";
import { DataTableHeader } from "./components/DataTableHeader";
import { DataTablePagination } from "./components/Pagination";
import { DataTableToolbar } from "./components/Toolbar";
import { useDebounced } from "./hooks/useDebounced";
import { useDataTableModel } from "./hooks/useDataTableModel";
import { useDataTableState } from "./hooks/useDataTableState";
import { useStickyColumns } from "./hooks/useStickyColumns";
import { validateColumns } from "./utils/validation";
import type { DataTableProps } from "./types";

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  rowKey,
  loading,
  total = 0,
  page = 1,
  pageSize = 20,
  pageSizeOptions,
  onQueryChange,
  caption,
  toolbar,
  size = "md",
  enableColumnVisibilityToggle = true,
  enableDensityToggle = true,
  enableHeaderAlignToggle = false,
  striped = true,
  columnDividers = false,
  className,
  storageKey,
  stickyHeader = true,
  maxHeight = 500,
  useOverlayScrollbar = false,
  labels,
}: DataTableProps<T>) {
  const t = useSmartTranslations("Common");
  const {
    headerAlign,
    setHeaderAlign,
    visibleCols,
    setVisibleCols,
    filters,
    setFilters,
    sort,
    setSort,
    density,
    setDensity,
    curPage,
    setCurPage,
    curPageSize,
    setCurPageSize,
  } = useDataTableState({
    columns,
    page,
    pageSize,
    size,
    storageKey,
  });

  // Validate columns in development mode
  React.useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const warnings = validateColumns(columns);
      warnings.forEach((w) => console.warn(`[DataTable] ${w}`));
    }
  }, [columns]);

  const debouncedFilters = useDebounced(filters, 350);

  const isServerMode = Boolean(onQueryChange);
  const hasEmittedQuery = React.useRef(false);
  React.useEffect(() => {
    if (!onQueryChange) return;
    if (!hasEmittedQuery.current) {
      hasEmittedQuery.current = true;
      return;
    }
    onQueryChange({ filters: debouncedFilters, sort, page: curPage, pageSize: curPageSize });
  }, [debouncedFilters, sort, curPage, curPageSize, onQueryChange]);

  React.useEffect(() => {
    if (process.env.NODE_ENV !== "development" || rowKey) return;
    const hasQueryFeatures = columns.some((column) => column.sortable || column.filter) || Boolean(pageSizeOptions?.length) || isServerMode;
    if (!hasQueryFeatures) return;
    console.warn("[DataTable] `rowKey` should be provided when using sort/filter/pagination to keep row identity stable.");
  }, [columns, isServerMode, pageSizeOptions, rowKey]);

  const densityRowClass = density === "compact" ? "h-9" : density === "comfortable" ? "h-14" : "h-12";
  const cellPadding = density === "compact" ? "py-1.5 px-3" : density === "comfortable" ? "py-3 px-4" : "py-2.5 px-4";
  const headerTitleClass = size === "sm" ? "text-xs" : size === "lg" ? "text-[15px]" : "text-sm";
  const headerMinHeightClass = size === "sm" ? "min-h-9" : size === "lg" ? "min-h-11" : "min-h-10";
  const sortIconClass = size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-4 h-4" : "w-3.5 h-3.5";

  const { visibleColumns, leafColumns, headerRows, totalColumnsWidth, totalItems, displayedData } = useDataTableModel({
    columns,
    data,
    visibleCols,
    filters,
    sort,
    curPage,
    curPageSize,
    isServerMode,
    total,
  });

  const { getStickyCellClass, getStickyColumnStyle, getStickyHeaderClass, getStickyHeaderCellStyle } = useStickyColumns(visibleColumns);

  const getRowKey = (row: T, idx: number) => {
    if (!rowKey) return String(idx);
    if (typeof rowKey === "function") return String(rowKey(row));
    return String(row[rowKey as keyof T]);
  };

  const viewportRef = React.useRef<HTMLDivElement>(null);
  useOverlayScrollbarTarget(viewportRef, { enabled: useOverlayScrollbar });

  return (
    <div className={cn("space-y-2", className)}>
      <DataTableToolbar
        caption={caption}
        toolbar={toolbar}
        columns={columns}
        visibleCols={visibleCols}
        setVisibleCols={setVisibleCols}
        enableDensityToggle={enableDensityToggle}
        enableColumnVisibilityToggle={enableColumnVisibilityToggle}
        enableHeaderAlignToggle={enableHeaderAlignToggle}
        size={size}
        density={density}
        setDensity={setDensity}
        setHeaderAlign={setHeaderAlign}
        labels={labels}
        t={t}
      />

      <div
        className={cn(
          "relative rounded-2xl md:rounded-3xl border border-border/50 bg-card overflow-hidden",
          loading && "opacity-60 pointer-events-none",
        )}
      >
        <div
          ref={viewportRef}
          className={cn("w-full overflow-x-auto", stickyHeader && "overflow-y-auto")}
          style={stickyHeader ? { maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight } : undefined}
        >
          <Table
            disableContainer
            className={cn(
              "table-fixed",
              stickyHeader && ["[&_thead]:sticky", "[&_thead]:top-0", "[&_thead]:z-20", "[&_thead]:shadow-[0_1px_3px_rgba(0,0,0,0.1)]"],
            )}
            style={{ minWidth: totalColumnsWidth > 0 ? `${totalColumnsWidth}px` : undefined }}
          >
            <TableHeader>
              <DataTableHeader
                headerRows={headerRows}
                headerAlign={headerAlign}
                headerTitleClass={headerTitleClass}
                headerMinHeightClass={headerMinHeightClass}
                sortIconClass={sortIconClass}
                size={size}
                filters={filters}
                sort={sort}
                columnDividers={columnDividers}
                setCurPage={setCurPage}
                setFilters={setFilters}
                setSort={setSort}
                getStickyHeaderClass={getStickyHeaderClass}
                getStickyHeaderCellStyle={getStickyHeaderCellStyle}
                t={t}
              />
            </TableHeader>
            <DataTableBodyRows
              leafColumns={leafColumns}
              displayedData={displayedData}
              loading={loading}
              striped={striped}
              density={density}
              densityRowClass={densityRowClass}
              cellPadding={cellPadding}
              columnDividers={columnDividers}
              getRowKey={getRowKey}
              getStickyColumnStyle={getStickyColumnStyle}
              getStickyCellClass={getStickyCellClass}
              t={t}
            />
          </Table>
        </div>
      </div>
      <DataTablePagination
        totalItems={totalItems}
        curPage={curPage}
        curPageSize={curPageSize}
        setCurPage={setCurPage}
        pageSizeOptions={pageSizeOptions}
        setCurPageSize={setCurPageSize}
        size={size}
      />
    </div>
  );
}

export default DataTable;
