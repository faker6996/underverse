"use client";

import Button from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { DatePicker } from "@/components/ui/DatePicker";
import DropdownMenu, { DropdownMenuItem } from "@/components/ui/DropdownMenu";
import Input from "@/components/ui/Input";
import { Popover } from "@/components/ui/Popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { cn } from "@/lib/utils/cn";
import { Filter as FilterIcon } from "lucide-react";
import React from "react";
import { useTranslations } from "@/lib/i18n/translation-adapter";

type FilterType = "text" | "select" | "date";

export type DataTableColumn<T> = {
  key: string; // unique key
  title: React.ReactNode;
  dataIndex?: keyof T | string;
  width?: number | string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  filter?: { type: FilterType; options?: string[]; placeholder?: string };
  render?: (value: any, record: T, index: number) => React.ReactNode;
  visible?: boolean; // default true
  /** Cố định cột bên trái hoặc phải khi cuộn ngang */
  fixed?: "left" | "right";
};

export type Sorter = { key: string; order: "asc" | "desc" } | null;

export interface DataTableQuery {
  filters: Record<string, any>;
  sort?: Sorter;
  page: number;
  pageSize: number;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  rowKey?: ((row: T) => string | number) | keyof T;
  loading?: boolean;
  total?: number;
  page?: number;
  pageSize?: number;
  pageSizeOptions?: number[]; // show page size selector if provided
  onQueryChange?: (q: DataTableQuery) => void; // server-side
  caption?: React.ReactNode;
  toolbar?: React.ReactNode;
  enableColumnVisibilityToggle?: boolean;
  enableDensityToggle?: boolean;
  enableHeaderAlignToggle?: boolean;
  striped?: boolean; // Bật/tắt màu nền sẽn kẽ cho các dòng
  /** Hiển thị đường kẻ dọc ngăn cách giữa các cột */
  columnDividers?: boolean;
  className?: string;
  /** Key để lưu pageSize vào localStorage. Nếu không cung cấp, pageSize sẽ không được persist */
  storageKey?: string;
  /** Bật sticky header khi cuộn. Mặc định là false */
  stickyHeader?: boolean;
  /** Chiều cao tối đa của bảng khi bật stickyHeader (mặc định: 500px) */
  maxHeight?: number | string;
  labels?: {
    density?: string;
    columns?: string;
    compact?: string;
    normal?: string;
    comfortable?: string;
    headerAlign?: string;
    alignLeft?: string;
    alignCenter?: string;
    alignRight?: string;
  };
}

function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

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
  striped = true, // Mặc định bật màu nền sẽn kẽ cho các dòng
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

  // Track if component has mounted to prevent initial onQueryChange trigger
  const hasMounted = React.useRef(false);

  // Track if we loaded from localStorage to prevent prop override
  const loadedFromStorage = React.useRef(false);

  // Đọc pageSize từ localStorage nếu có storageKey (lazy state initialization)
  const [curPageSize, setCurPageSize] = React.useState(() => {
    if (typeof window === "undefined" || !storageKey) return pageSize;
    try {
      const saved = localStorage.getItem(`datatable_${storageKey}_pageSize`);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed > 0) {
          loadedFromStorage.current = true;
          return parsed;
        }
      }
    } catch {
      // localStorage không khả dụng
    }
    return pageSize;
  });

  // Lưu pageSize vào localStorage khi thay đổi (chỉ sau khi đã mount)
  React.useEffect(() => {
    if (typeof window === "undefined" || !storageKey) return;
    if (!hasMounted.current) return; // Không lưu khi mount lần đầu
    try {
      localStorage.setItem(`datatable_${storageKey}_pageSize`, String(curPageSize));
    } catch {
      // localStorage không khả dụng
    }
  }, [curPageSize, storageKey]);

  React.useEffect(() => {
    const newColKeys = columns.filter((c) => c.visible !== false).map((c) => c.key);
    setVisibleCols((prev) => {
      const uniqueKeys = new Set([...prev, ...newColKeys]);
      return [...uniqueKeys].filter((k) => columns.some((c) => c.key === k));
    });
  }, [columns]);

  const debouncedFilters = useDebounced(filters, 350);

  // Keep internal state in sync when parent controls page/pageSize
  React.useEffect(() => {
    setCurPage(page);
  }, [page]);

  // Chỉ sync pageSize từ parent nếu KHÔNG có storageKey hoặc chưa load từ localStorage
  React.useEffect(() => {
    if (storageKey && loadedFromStorage.current) {
      // Đã load từ localStorage, không ghi đè bằng prop
      return;
    }
    setCurPageSize(pageSize);
  }, [pageSize, storageKey]);

  // Emit query changes to parent (server-side mode)
  // Sử dụng hasMounted để tránh trigger onQueryChange khi mount lần đầu với giá trị từ localStorage
  React.useEffect(() => {
    if (!onQueryChange) return;

    // Không trigger onQueryChange lần đầu nếu đang dùng localStorage
    // để tránh infinite loop khi parent re-render
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    onQueryChange({ filters: debouncedFilters, sort, page: curPage, pageSize: curPageSize });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFilters, sort, curPage, curPageSize]);

  const densityRowClass = density === "compact" ? "h-9" : density === "comfortable" ? "h-14" : "h-12";
  const cellPadding = density === "compact" ? "py-1.5 px-3" : density === "comfortable" ? "py-3 px-4" : "py-2.5 px-4";

  // Use Set for O(1) lookup instead of O(n) includes
  const visibleColsSet = React.useMemo(() => new Set(visibleCols), [visibleCols]);
  const visibleColumns = columns.filter((c) => visibleColsSet.has(c.key));

  // Tính tổng width của tất cả các cột để set min-width cho table
  const totalColumnsWidth = React.useMemo(() => {
    return visibleColumns.reduce((sum, col) => {
      const colWidth = typeof col.width === "number" ? col.width : parseInt(String(col.width) || "150", 10);
      return sum + colWidth;
    }, 0);
  }, [visibleColumns]);

  // Tính toán vị trí sticky cho các cột cố định
  const stickyPositions = React.useMemo(() => {
    const positions: Record<string, { left?: number; right?: number }> = {};

    // Tính left position cho các cột fixed="left"
    let leftOffset = 0;
    for (const col of visibleColumns) {
      if (col.fixed === "left") {
        positions[col.key] = { left: leftOffset };
        const colWidth = typeof col.width === "number" ? col.width : parseInt(String(col.width) || "150", 10);
        leftOffset += colWidth;
      }
    }

    // Tính right position cho các cột fixed="right" (từ phải sang trái)
    let rightOffset = 0;
    for (let i = visibleColumns.length - 1; i >= 0; i--) {
      const col = visibleColumns[i];
      if (col.fixed === "right") {
        positions[col.key] = { right: rightOffset };
        const colWidth = typeof col.width === "number" ? col.width : parseInt(String(col.width) || "150", 10);
        rightOffset += colWidth;
      }
    }

    return positions;
  }, [visibleColumns]);

  // Helper function để lấy class cho cột cố định
  const getStickyColumnClass = (col: DataTableColumn<T>, isHeader = false) => {
    if (!col.fixed) return "";
    return cn(
      "sticky",
      col.fixed === "left" && "left-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)]",
      col.fixed === "right" && "right-0 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.15)]",
      // Header fixed column cần z-index cao hơn thead (z-30) để không bị che
      isHeader ? "z-50 bg-muted!" : "z-10 bg-card!",
    );
  };

  // Helper function để lấy style cho cột cố định
  const getStickyColumnStyle = (col: DataTableColumn<T>): React.CSSProperties => {
    if (!col.fixed) return {};
    const pos = stickyPositions[col.key];
    return {
      ...(pos?.left !== undefined && { left: pos.left }),
      ...(pos?.right !== undefined && { right: pos.right }),
    };
  };

  const getRowKey = (row: T, idx: number) => {
    if (!rowKey) return String(idx);
    if (typeof rowKey === "function") return String(rowKey(row));
    return String(row[rowKey as keyof T]);
  };

  const renderFilterControl = (col: DataTableColumn<T>) => {
    if (!col.filter) return null;
    const k = col.key;
    const commonProps = {
      className: "h-8 w-full text-sm",
    } as any;
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

  const renderHeader = (
    <TableRow>
      {visibleColumns.map((col, colIdx) => {
        // Kiểm tra xem cột trước đó có phải là cột fixed left không
        const prevCol = colIdx > 0 ? visibleColumns[colIdx - 1] : null;
        const isAfterFixedLeft = prevCol?.fixed === "left";
        // Không thêm border-l cho cột ngay sau cột fixed left hoặc cột fixed
        const showBorderLeft = columnDividers && colIdx > 0 && !isAfterFixedLeft && !col.fixed;

        return (
          <TableHead
            key={col.key}
            style={{ width: col.width, ...getStickyColumnStyle(col) }}
            className={
              cn(
                // Use column-specific align if defined, otherwise use global headerAlign
                (col.align === "right" || (!col.align && headerAlign === "right")) && "text-right",
                (col.align === "center" || (!col.align && headerAlign === "center")) && "text-center",
                showBorderLeft && "border-l border-border/60",
                getStickyColumnClass(col, true),
              ) as string
            }
          >
            {(() => {
              const isRightAlign = col.align === "right" || (!col.align && headerAlign === "right");
              const isCenterAlign = col.align === "center" || (!col.align && headerAlign === "center");

              const titleContent = (
                <div
                  className={cn(
                    "flex items-center gap-1",
                    // Cột fixed không cần shrink vì đã có width cố định
                    !col.fixed && "min-w-0 shrink",
                  )}
                >
                  <span className={cn("font-medium text-sm", !col.fixed && "truncate")}>{col.title}</span>
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

              const filterContent = col.filter && (
                <Popover
                  placement={isRightAlign ? "bottom-end" : "bottom-start"}
                  trigger={
                    <button
                      className={cn(
                        "p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                        filters[col.key] && "bg-accent text-foreground",
                      )}
                      aria-label="Filter"
                      title="Filter"
                    >
                      <FilterIcon className="h-4 w-4" />
                    </button>
                  }
                >
                  <div className="w-48 p-2 space-y-2">
                    <div className="text-xs font-medium text-muted-foreground mb-2">Filter {col.title}</div>
                    {renderFilterControl(col)}
                    {filters[col.key] && (
                      <button
                        onClick={() => {
                          setCurPage(1);
                          setFilters((f) => {
                            const newFilters = { ...f };
                            delete newFilters[col.key];
                            return newFilters;
                          });
                        }}
                        className="text-xs text-destructive hover:underline"
                      >
                        {t("clearFilter")}
                      </button>
                    )}
                  </div>
                </Popover>
              );

              return (
                <div
                  className={cn(
                    "flex items-center gap-2 select-none min-h-10",
                    isRightAlign && "justify-end",
                    isCenterAlign && "justify-center",
                    !isRightAlign && !isCenterAlign && "justify-start",
                  )}
                >
                  {/* Khi căn phải: filter trước, title sau (đối xứng với căn trái) */}
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
            })()}
          </TableHead>
        );
      })}
    </TableRow>
  );

  const isServerMode = Boolean(onQueryChange);

  const processedData = React.useMemo(() => {
    if (isServerMode) return data;

    let result = [...data];

    // 1. Filter
    if (Object.keys(filters).length > 0) {
      result = result.filter((row) => {
        return Object.entries(filters).every(([key, value]) => {
          if (value === undefined || value === null || value === "") return true;

          const col = columns.find((c) => c.key === key);
          const rowValue = col?.dataIndex ? row[col.dataIndex as keyof T] : row[key];

          // Handle Date objects or specific types if needed
          if (col?.filter?.type === "date" && value instanceof Date) {
            // Simple date comparison (ignoring time for now or exact match)
            // For now, let's convert both to string or use a specific comparator
            // This is a basic implementation
            return new Date(rowValue).toDateString() === value.toDateString();
          }

          return String(rowValue ?? "")
            .toLowerCase()
            .includes(String(value).toLowerCase());
        });
      });
    }

    // 2. Sort
    if (sort) {
      result.sort((a, b) => {
        const col = columns.find((c) => c.key === sort.key);
        const aValue = col?.dataIndex ? a[col.dataIndex as keyof T] : a[sort.key];
        const bValue = col?.dataIndex ? b[col.dataIndex as keyof T] : b[sort.key];

        if (aValue === bValue) return 0;

        // Handle numbers
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sort.order === "asc" ? aValue - bValue : bValue - aValue;
        }

        // Handle strings
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
        // Ensure we don't slice out of bounds if page is too high for filtered results
        if (start >= processedData.length && curPage > 1) {
          // This effect will be handled by the pagination component or we should reset page here?
          // Ideally setCurPage(1) should happen when filter changes, which is already done in renderFilterControl
        }
        return processedData.slice(start, start + curPageSize);
      }, [processedData, curPage, curPageSize]);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between gap-4 mb-1">
        <div className="text-sm text-muted-foreground">{caption}</div>
        <div className="flex items-center gap-2">
          {enableDensityToggle && (
            <DropdownMenu
              trigger={
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  {labels?.density || t("density")}
                </Button>
              }
              items={[
                { label: (labels?.compact || t("compact")) as string, onClick: () => setDensity("compact") },
                { label: (labels?.normal || t("normal")) as string, onClick: () => setDensity("normal") },
                { label: (labels?.comfortable || t("comfortable")) as string, onClick: () => setDensity("comfortable") },
              ]}
            />
          )}
          {enableColumnVisibilityToggle && (
            <DropdownMenu
              trigger={
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                    />
                  </svg>
                  {labels?.columns || t("columns")}
                </Button>
              }
            >
              {columns.map((c) => (
                <DropdownMenuItem
                  key={c.key}
                  onClick={() => {
                    setVisibleCols((prev) => (prev.includes(c.key) ? prev.filter((k) => k !== c.key) : [...prev, c.key]));
                  }}
                >
                  <input type="checkbox" className="mr-2 rounded-md border-border" readOnly checked={visibleCols.includes(c.key)} />
                  <span className="truncate">{c.title as any}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenu>
          )}
          {enableHeaderAlignToggle && (
            <DropdownMenu
              trigger={
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
                  </svg>
                  {labels?.headerAlign || t("headerAlign")}
                </Button>
              }
              items={[
                { label: (labels?.alignLeft || t("alignLeft")) as string, onClick: () => setHeaderAlign("left") },
                { label: (labels?.alignCenter || t("alignCenter")) as string, onClick: () => setHeaderAlign("center") },
                { label: (labels?.alignRight || t("alignRight")) as string, onClick: () => setHeaderAlign("right") },
              ]}
            />
          )}
          {toolbar}
        </div>
      </div>

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
                <TableCell colSpan={visibleColumns.length} className="text-center py-8">
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
                <TableCell colSpan={visibleColumns.length} className="text-center py-6 text-muted-foreground">
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
                      // content-visibility: auto for rendering performance (skip off-screen rows)
                      contentVisibility: "auto",
                      containIntrinsicSize: density === "compact" ? "0 36px" : density === "comfortable" ? "0 56px" : "0 48px",
                    }}
                  >
                    {visibleColumns.map((col, colIdx) => {
                      const value = col.dataIndex ? row[col.dataIndex as keyof T] : undefined;
                      const isStripedRow = striped && idx % 2 === 0;
                      // Kiểm tra xem cột trước đó có phải là cột fixed left không
                      const prevCol = colIdx > 0 ? visibleColumns[colIdx - 1] : null;
                      const isAfterFixedLeft = prevCol?.fixed === "left";
                      // Không thêm border-l cho cột ngay sau cột fixed left hoặc cột fixed
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
                              isLastRow && col === visibleColumns[0] && "rounded-bl-2xl md:rounded-bl-3xl",
                              isLastRow && col === visibleColumns[visibleColumns.length - 1] && "rounded-br-2xl md:rounded-br-3xl",
                              // Cột cố định cần solid background
                              col.fixed
                                ? cn(
                                    "sticky z-10",
                                    col.fixed === "left" && "left-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.15)]",
                                    col.fixed === "right" && "right-0 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.15)]",
                                    isStripedRow ? "bg-muted!" : "bg-card!",
                                  )
                                : isStripedRow && "bg-muted/50",
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

      {totalItems > 0 && Math.ceil(totalItems / curPageSize) > 1 && (
        <div className="flex items-center justify-between gap-2 px-1 pt-3 text-xs text-muted-foreground">
          {/* Left: Compact info */}
          <div className="tabular-nums">
            {(curPage - 1) * curPageSize + 1}-{Math.min(curPage * curPageSize, totalItems)}/{totalItems}
          </div>

          {/* Center: Page numbers with prev/next */}
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 rounded-full"
              onClick={() => setCurPage(Math.max(1, curPage - 1))}
              disabled={curPage === 1}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>

            {(() => {
              const totalPages = Math.ceil(totalItems / curPageSize);
              const pages: (number | "...")[] = [];

              if (totalPages <= 5) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else {
                pages.push(1);
                if (curPage > 3) pages.push("...");

                const start = Math.max(2, curPage - 1);
                const end = Math.min(totalPages - 1, curPage + 1);
                for (let i = start; i <= end; i++) pages.push(i);

                if (curPage < totalPages - 2) pages.push("...");
                pages.push(totalPages);
              }

              return pages.map((p, i) =>
                p === "..." ? (
                  <span key={`dots-${i}`} className="px-1 text-muted-foreground/60">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurPage(p)}
                    className={cn(
                      "h-7 min-w-7 px-2 rounded-full text-xs font-medium transition-colors",
                      curPage === p ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground",
                    )}
                  >
                    {p}
                  </button>
                ),
              );
            })()}

            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 rounded-full"
              onClick={() => setCurPage(Math.min(Math.ceil(totalItems / curPageSize), curPage + 1))}
              disabled={curPage === Math.ceil(totalItems / curPageSize)}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>

          {/* Right: Page size */}
          {pageSizeOptions && (
            <Combobox
              options={pageSizeOptions.map(String)}
              value={String(curPageSize)}
              onChange={(v) => {
                setCurPage(1);
                setCurPageSize(Number(v));
              }}
              size="sm"
              className="w-20"
            />
          )}
        </div>
      )}
    </div>
  );
}

export default DataTable;
