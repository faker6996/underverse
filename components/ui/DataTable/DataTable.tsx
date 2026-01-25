"use client";

import { Combobox } from "@/components/ui/Combobox";
import { DatePicker } from "@/components/ui/DatePicker";
import Input from "@/components/ui/Input";
import { Popover } from "@/components/ui/Popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { cn } from "@/lib/utils/cn";
import { useTranslations } from "@/lib/i18n/translation-adapter";
import { Filter as FilterIcon } from "lucide-react";
import React from "react";
import { DataTablePagination } from "./components/Pagination";
import { DataTableToolbar } from "./components/Toolbar";
import { useDebounced } from "./hooks/useDebounced";
import { usePageSizeStorage } from "./hooks/usePageSizeStorage";
import { useStickyColumns } from "./hooks/useStickyColumns";
import { getColumnWidth } from "./utils/columns";
import { buildHeaderRows, getLeafColumns, filterVisibleColumns } from "./utils/headers";
import { validateColumns } from "./utils/validation";
import type { DataTableColumn, DataTableProps, Sorter } from "./types";

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
  enableColumnVisibilityToggle = true,
  enableDensityToggle = true,
  enableHeaderAlignToggle = false,
  striped = true,
  columnDividers = false,
  className,
  storageKey,
  stickyHeader = true,
  maxHeight = 500,
  labels,
}: DataTableProps<T>) {
  const t = useTranslations("Common");
  const [headerAlign, setHeaderAlign] = React.useState<"left" | "center" | "right">("left");
  const [visibleCols, setVisibleCols] = React.useState<string[]>(() => columns.filter((c) => c.visible !== false).map((c) => c.key));
  const [filters, setFilters] = React.useState<Record<string, any>>({});
  const [sort, setSort] = React.useState<Sorter>(null);
  const [density, setDensity] = React.useState<"compact" | "normal" | "comfortable">("normal");
  const [curPage, setCurPage] = React.useState(page);

  const { curPageSize, setCurPageSize } = usePageSizeStorage({ pageSize, storageKey });

  // Validate columns in development mode
  React.useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const warnings = validateColumns(columns);
      warnings.forEach((w) => console.warn(`[DataTable] ${w}`));
    }
  }, [columns]);

  React.useEffect(() => {
    const newColKeys = columns.filter((c) => c.visible !== false).map((c) => c.key);
    setVisibleCols((prev) => {
      const uniqueKeys = new Set([...prev, ...newColKeys]);
      return [...uniqueKeys].filter((k) => columns.some((c) => c.key === k));
    });
  }, [columns]);

  const debouncedFilters = useDebounced(filters, 350);

  React.useEffect(() => {
    setCurPage(page);
  }, [page]);

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

  const densityRowClass = density === "compact" ? "h-9" : density === "comfortable" ? "h-14" : "h-12";
  const cellPadding = density === "compact" ? "py-1.5 px-3" : density === "comfortable" ? "py-3 px-4" : "py-2.5 px-4";

  const visibleColsSet = React.useMemo(() => new Set(visibleCols), [visibleCols]);

  // NEW: Filter columns with hierarchy support
  const visibleColumns = React.useMemo(() => {
    return filterVisibleColumns(columns, visibleColsSet);
  }, [columns, visibleColsSet]);

  // NEW: Get leaf columns for body rendering
  const leafColumns = React.useMemo(() => {
    return getLeafColumns(visibleColumns);
  }, [visibleColumns]);

  const totalColumnsWidth = React.useMemo(() => {
    return leafColumns.reduce((sum, col) => sum + getColumnWidth(col), 0);
  }, [leafColumns]);

  const { getStickyCellClass, getStickyColumnStyle, getStickyHeaderClass, getStickyHeaderCellStyle } = useStickyColumns(
    columns,
    visibleColsSet,
  );

  const getRowKey = (row: T, idx: number) => {
    if (!rowKey) return String(idx);
    if (typeof rowKey === "function") return String(rowKey(row));
    return String(row[rowKey as keyof T]);
  };

  const renderFilterControl = (col: DataTableColumn<T>) => {
    if (!col.filter) return null;
    const k = col.key;
    const commonProps = { className: "h-8 w-full text-sm" } as any;

    if (col.filter.type === "text") {
      return (
        <Input
          {...commonProps}
          placeholder={col.filter.placeholder || `Search ${String(col.title)}`}
          value={filters[k] || ""}
          onChange={(e) => {
            setCurPage(1);
            setFilters((f) => ({ ...f, [k]: e.target.value }));
          }}
        />
      );
    }

    if (col.filter.type === "select") {
      const options = col.filter.options || [];
      return (
        <Combobox
          options={["", ...options]}
          size="sm"
          className="w-full"
          value={filters[k] ?? ""}
          onChange={(v) => {
            setCurPage(1);
            setFilters((f) => ({ ...f, [k]: v || undefined }));
          }}
          placeholder={col.filter.placeholder || `Select ${String(col.title)}`}
        />
      );
    }

    if (col.filter.type === "date") {
      return (
        <DatePicker
          placeholder={col.filter.placeholder || `Select ${String(col.title)}`}
          value={filters[k] || null}
          onChange={(d) => {
            setCurPage(1);
            setFilters((f) => ({ ...f, [k]: d ? (d as any) : undefined }));
          }}
        />
      );
    }

    return null;
  };

  // NEW: Build multi-row header structure
  const headerRows = React.useMemo(() => buildHeaderRows(visibleColumns), [visibleColumns]);

  // Helper to render header content (group vs leaf)
  const renderHeaderContent = (col: DataTableColumn<T>, isLeaf: boolean) => {
    // Group columns: only show title (no sort/filter)
    if (!isLeaf) {
      return (
        <div
          className={cn(
            "flex items-center gap-1 min-h-10",
            col.align === "right" && "justify-end",
            col.align === "center" && "justify-center",
            !col.align && "justify-start",
          )}
        >
          <span className="font-medium text-sm whitespace-nowrap">{col.title}</span>
        </div>
      );
    }

    // Leaf columns: show title + sort + filter
    const isRightAlign = col.align === "right" || (!col.align && headerAlign === "right");
    const isCenterAlign = col.align === "center" || (!col.align && headerAlign === "center");

    const titleContent = (
      <div className="flex items-center gap-1">
        <span className="font-medium text-sm whitespace-nowrap">{col.title}</span>
        {col.sortable && (
          <button
            className={cn(
              "p-1 rounded-lg transition-all duration-200 hover:bg-accent",
              sort?.key === col.key ? "opacity-100 bg-accent" : "opacity-60 hover:opacity-100",
            )}
            onClick={() => {
              setCurPage(1);
              setSort((s) => {
                if (!s || s.key !== col.key) return { key: col.key, order: "asc" };
                if (s.order === "asc") return { key: col.key, order: "desc" };
                return null;
              });
            }}
            aria-label="Sort"
            title={`Sort by ${String(col.title)}`}
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className="inline-block">
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
                  setFilters((f) => ({ ...f, [col.key]: undefined }));
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
          "flex items-center gap-2 select-none min-h-10",
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
  };

  const renderHeader = (
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
                style={{
                  width: col.width,
                  ...getStickyHeaderCellStyle(headerCell),
                }}
                className={cn(
                  (col.align === "right" || (!col.align && headerAlign === "right")) && "text-right",
                  (col.align === "center" || (!col.align && headerAlign === "center")) && "text-center",
                  showBorderLeft && "border-l border-border/60",
                  getStickyHeaderClass(col),
                )}
              >
                {renderHeaderContent(col, isLeaf)}
              </TableHead>
            );
          })}
        </TableRow>
      ))}
    </>
  );

  const processedData = React.useMemo(() => {
    if (isServerMode) return data;

    let result = [...data];

    if (Object.keys(filters).length > 0) {
      result = result.filter((row) =>
        Object.entries(filters).every(([key, value]) => {
          if (value === undefined || value === null || value === "") return true;

          const col = columns.find((c) => c.key === key);
          const rowValue = col?.dataIndex ? row[col.dataIndex as keyof T] : row[key];

          if (col?.filter?.type === "date" && value instanceof Date) {
            return new Date(rowValue).toDateString() === value.toDateString();
          }

          return String(rowValue ?? "")
            .toLowerCase()
            .includes(String(value).toLowerCase());
        }),
      );
    }

    if (sort) {
      result.sort((a, b) => {
        const col = columns.find((c) => c.key === sort.key);
        const aValue = col?.dataIndex ? a[col.dataIndex as keyof T] : a[sort.key];
        const bValue = col?.dataIndex ? b[col.dataIndex as keyof T] : b[sort.key];

        if (aValue === bValue) return 0;

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sort.order === "asc" ? aValue - bValue : bValue - aValue;
        }

        const compare = String(aValue).localeCompare(String(bValue));
        return sort.order === "asc" ? compare : -compare;
      });
    }

    return result;
  }, [data, isServerMode, filters, sort, columns]);

  const totalItems = isServerMode ? total : processedData.length;
  const displayedData = isServerMode
    ? data
    : React.useMemo(() => {
        const start = (curPage - 1) * curPageSize;
        return processedData.slice(start, start + curPageSize);
      }, [processedData, curPage, curPageSize]);

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
        density={density}
        setDensity={setDensity}
        setHeaderAlign={setHeaderAlign}
        labels={labels}
        t={t}
      />

      <div
        className={cn("relative rounded-2xl md:rounded-3xl border border-border/50", loading && "opacity-60 pointer-events-none")}
        style={
          stickyHeader
            ? {
                maxHeight: typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight,
                overflowY: "auto",
                overflowX: "auto",
              }
            : { overflowX: "auto" }
        }
      >
        <Table
          containerClassName={cn("border-0 md:border-0 rounded-none md:rounded-none shadow-none bg-transparent", "overflow-visible")}
          className={cn(
            "table-fixed",
            stickyHeader && ["[&_thead]:sticky", "[&_thead]:top-0", "[&_thead]:z-20", "[&_thead]:shadow-[0_1px_3px_rgba(0,0,0,0.1)]"],
          )}
          style={{ minWidth: totalColumnsWidth > 0 ? `${totalColumnsWidth}px` : undefined }}
        >
          <TableHeader>{renderHeader}</TableHeader>
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
            ) : !displayedData || displayedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={leafColumns.length} className="text-center py-6 text-muted-foreground">
                  {t("noData")}
                </TableCell>
              </TableRow>
            ) : (
              displayedData.map((row, idx) => {
                const isLastRow = idx === displayedData.length - 1;
                return (
                  <TableRow
                    key={getRowKey(row, idx)}
                    className={cn(densityRowClass)}
                    style={{
                      contentVisibility: "auto",
                      containIntrinsicSize: density === "compact" ? "0 36px" : density === "comfortable" ? "0 56px" : "0 48px",
                    }}
                  >
                    {leafColumns.map((col, colIdx) => {
                      const value = col.dataIndex ? row[col.dataIndex as keyof T] : undefined;
                      const isStripedRow = striped && idx % 2 === 0;
                      const prevCol = colIdx > 0 ? leafColumns[colIdx - 1] : null;
                      const isAfterFixedLeft = prevCol?.fixed === "left";
                      const showBorderLeft = columnDividers && colIdx > 0 && !isAfterFixedLeft && !col.fixed;

                      return (
                        <TableCell
                          key={col.key}
                          style={getStickyColumnStyle(col)}
                          className={
                            cn(
                              cellPadding,
                              col.align === "right" && "text-right",
                              col.align === "center" && "text-center",
                              showBorderLeft && "border-l border-border/60",
                              isLastRow && col === leafColumns[0] && "rounded-bl-2xl md:rounded-bl-3xl",
                              isLastRow && col === leafColumns[leafColumns.length - 1] && "rounded-br-2xl md:rounded-br-3xl",
                              getStickyCellClass(col, isStripedRow),
                              !col.fixed && isStripedRow && "bg-muted/50",
                            ) as string
                          }
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
        </Table>
      </div>

      <DataTablePagination
        totalItems={totalItems}
        curPage={curPage}
        curPageSize={curPageSize}
        setCurPage={setCurPage}
        pageSizeOptions={pageSizeOptions}
        setCurPageSize={setCurPageSize}
      />
    </div>
  );
}

export default DataTable;

