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
import type { DataTableColumn, DataTableProps } from "./types";

function applyColumnWidthOverrides<T>(
  columns: DataTableColumn<T>[],
  widthOverrides: Record<string, number>,
): DataTableColumn<T>[] {
  return columns.map((column) => {
    if (column.children?.length) {
      return {
        ...column,
        children: applyColumnWidthOverrides(column.children, widthOverrides),
      };
    }

    const nextWidth = widthOverrides[column.key];
    if (nextWidth == null) {
      return column;
    }

    return {
      ...column,
      width: nextWidth,
    };
  });
}

function measureNaturalContentWidth(node: HTMLElement): number {
  if (typeof document === "undefined") return 0;

  const measurementRoot = document.createElement("div");
  measurementRoot.style.position = "absolute";
  measurementRoot.style.left = "-99999px";
  measurementRoot.style.top = "0";
  measurementRoot.style.visibility = "hidden";
  measurementRoot.style.pointerEvents = "none";
  measurementRoot.style.whiteSpace = "nowrap";
  measurementRoot.style.width = "max-content";
  measurementRoot.style.maxWidth = "none";
  measurementRoot.style.minWidth = "0";
  measurementRoot.style.overflow = "visible";

  const clone = (node.firstElementChild instanceof HTMLElement ? node.firstElementChild : node).cloneNode(true);
  if (!(clone instanceof HTMLElement)) {
    return 0;
  }

  const sourceStyle = window.getComputedStyle(node);
  const cloneStyle = window.getComputedStyle(clone);

  clone.style.width = "max-content";
  clone.style.maxWidth = "none";
  clone.style.minWidth = "0";
  clone.style.overflow = "visible";
  clone.style.textOverflow = "clip";
  clone.style.whiteSpace = cloneStyle.whiteSpace === "normal" ? "pre-wrap" : "nowrap";

  measurementRoot.appendChild(clone);
  document.body.appendChild(measurementRoot);

  const horizontalPadding = parseFloat(sourceStyle.paddingLeft || "0") + parseFloat(sourceStyle.paddingRight || "0");
  const horizontalBorder = parseFloat(sourceStyle.borderLeftWidth || "0") + parseFloat(sourceStyle.borderRightWidth || "0");
  const cloneRectWidth = clone.getBoundingClientRect().width;
  const cloneScrollWidth = clone.scrollWidth;
  const sourceScrollWidth = node.scrollWidth;
  const measuredContentWidth = Math.max(cloneRectWidth, cloneScrollWidth) || sourceScrollWidth;
  const measured = Math.ceil(measuredContentWidth + horizontalPadding + horizontalBorder);

  document.body.removeChild(measurementRoot);
  return measured;
}

function isNodeOverflowing(node: HTMLElement): boolean {
  const contentNode = node.firstElementChild instanceof HTMLElement ? node.firstElementChild : node;
  return (
    node.scrollWidth > node.clientWidth + 1
    || contentNode.scrollWidth > contentNode.clientWidth + 1
  );
}

const AUTO_FIT_BUFFER_PX = 8;

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
  overflowHidden = true,
  useOverlayScrollbar = false,
  enableHeaderAutoFit = true,
  labels,
}: DataTableProps<T>) {
  const t = useSmartTranslations("Common");
  const [columnWidthOverrides, setColumnWidthOverrides] = React.useState<Record<string, number>>({});
  const columnsWithWidthOverrides = React.useMemo(
    () => applyColumnWidthOverrides(columns, columnWidthOverrides),
    [columnWidthOverrides, columns],
  );
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
    columns: columnsWithWidthOverrides,
    page,
    pageSize,
    size,
    storageKey,
  });

  // Validate columns in development mode
  React.useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const warnings = validateColumns(columnsWithWidthOverrides);
      warnings.forEach((w) => console.warn(`[DataTable] ${w}`));
    }
  }, [columnsWithWidthOverrides]);

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
    columns: columnsWithWidthOverrides,
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
  const tableRef = React.useRef<HTMLTableElement>(null);
  useOverlayScrollbarTarget(viewportRef, { enabled: useOverlayScrollbar });

  const autoFitColumn = React.useCallback((columnKey: string) => {
    const tableElement = tableRef.current;
    if (!tableElement) return;

    const nodes = Array.from(
      tableElement.querySelectorAll<HTMLElement>(`[data-underverse-column-key="${columnKey}"]`),
    );

    if (nodes.length === 0) return;

    const hasOverflow = nodes.some((node) => isNodeOverflowing(node));
    if (!hasOverflow) return;

    const measuredWidth = nodes.reduce((maxWidth, node) => {
      const nextWidth = measureNaturalContentWidth(node);
      return Math.max(maxWidth, nextWidth);
    }, 0);
    const currentRenderedWidth = nodes.reduce((maxWidth, node) => {
      const nextWidth = Math.max(
        Math.ceil(node.getBoundingClientRect().width || 0),
        node.offsetWidth || 0,
        node.clientWidth || 0,
      );
      return Math.max(maxWidth, nextWidth);
    }, 0);

    if (measuredWidth <= 0) return;
    if (currentRenderedWidth > 0 && measuredWidth <= currentRenderedWidth + AUTO_FIT_BUFFER_PX) return;

    const nextWidth = Math.max(80, measuredWidth + AUTO_FIT_BUFFER_PX);
    setColumnWidthOverrides((prev) => {
      if (prev[columnKey] === nextWidth) return prev;
      return { ...prev, [columnKey]: nextWidth };
    });
  }, []);

  return (
    <div className={cn("space-y-2", className)}>
      <DataTableToolbar
        caption={caption}
        toolbar={toolbar}
        columns={columnsWithWidthOverrides}
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
          "relative rounded-2xl md:rounded-3xl border border-border/50 bg-card",
          overflowHidden && "overflow-hidden",
          loading && "opacity-60 pointer-events-none",
        )}
      >
        <div
          ref={viewportRef}
          className={cn("w-full overflow-x-auto", stickyHeader && "overflow-y-auto")}
          style={stickyHeader ? { maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight } : undefined}
        >
          <Table
            ref={tableRef}
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
                onAutoFitColumn={autoFitColumn}
                enableHeaderAutoFit={enableHeaderAutoFit}
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
