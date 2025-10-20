"use client";

import Button from "@/components/ui/Button";
import { Combobox } from "@/components/ui/Combobox";
import { DatePicker } from "@/components/ui/DatePicker";
import DropdownMenu, { DropdownMenuItem } from "@/components/ui/DropdownMenu";
import Input from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { Popover } from "@/components/ui/Popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { cn } from "@/lib/utils/cn";
import { Filter as FilterIcon } from "lucide-react";
import React from "react";
import { useTranslations } from "next-intl";

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
  onQueryChange?: (q: DataTableQuery) => void; // server-side
  caption?: React.ReactNode;
  toolbar?: React.ReactNode;
  enableColumnVisibilityToggle?: boolean;
  enableDensityToggle?: boolean;
  striped?: boolean; // Bật/tắt màu nền sẽn kẽ cho các dòng
  className?: string;
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
  onQueryChange,
  caption,
  toolbar,
  enableColumnVisibilityToggle = true,
  enableDensityToggle = true,
  striped = true, // Mặc định bật màu nền sẽn kẽ cho các dòng
  className,
}: DataTableProps<T>) {
  const t = useTranslations("Common");
  const [visibleCols, setVisibleCols] = React.useState<string[]>(() => columns.filter((c) => c.visible !== false).map((c) => c.key));
  const [filters, setFilters] = React.useState<Record<string, any>>({});
  const [sort, setSort] = React.useState<Sorter>(null);
  const [density, setDensity] = React.useState<"compact" | "normal" | "comfortable">("normal");
  const [curPage, setCurPage] = React.useState(page);
  const [curPageSize, setCurPageSize] = React.useState(pageSize);

  const debouncedFilters = useDebounced(filters, 350);

  // Emit query changes to parent (server-side mode)
  React.useEffect(() => {
    if (!onQueryChange) return;
    onQueryChange({ filters: debouncedFilters, sort, page: curPage, pageSize: curPageSize });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFilters, sort, curPage, curPageSize]);

  const densityRowClass = density === "compact" ? "h-9" : density === "comfortable" ? "h-14" : "h-12";
  const cellPadding = density === "compact" ? "py-1.5 px-3" : density === "comfortable" ? "py-3 px-4" : "py-2.5 px-4";

  const visibleColumns = columns.filter((c) => visibleCols.includes(c.key));

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
      {visibleColumns.map((col) => (
        <TableHead
          key={col.key}
          style={{ width: col.width }}
          className={cn(col.align === "right" && "text-right", col.align === "center" && "text-center") as string}
        >
          <div className="flex items-center justify-between gap-2 select-none min-h-[2.5rem]">
            <div className="flex items-center gap-1 min-w-0 flex-1">
              <span className="truncate font-medium text-sm">{col.title}</span>
              {col.sortable && (
                <button
                  className={cn(
                    "ml-1 p-1 rounded-sm transition-all duration-200 hover:bg-accent",
                    sort?.key === col.key ? "opacity-100 bg-accent" : "opacity-60 hover:opacity-100"
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
            {col.filter && (
              <Popover
                placement="bottom-start"
                trigger={
                  <button
                    className={cn(
                      "p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      filters[col.key] && "bg-accent text-foreground"
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
                      className="text-xs text-muted-foreground hover:text-foreground underline mt-1"
                    >
                      Clear filter
                    </button>
                  )}
                </div>
              </Popover>
            )}
          </div>
        </TableHead>
      ))}
    </TableRow>
  );

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
                  {t("density")}
                </Button>
              }
              items={[
                { label: t("compact") as string, onClick: () => setDensity("compact") },
                { label: t("normal") as string, onClick: () => setDensity("normal") },
                { label: t("comfortable") as string, onClick: () => setDensity("comfortable") },
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
                  {t("columns")}
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
                  <input type="checkbox" className="mr-2 rounded border-border" readOnly checked={visibleCols.includes(c.key)} />
                  <span className="truncate">{c.title as any}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenu>
          )}
          {toolbar}
        </div>
      </div>

      <div className={cn("relative rounded-lg border border-border/50 overflow-hidden", loading && "opacity-60 pointer-events-none")}>
        <Table
          containerClassName="border-0 rounded-none shadow-none"
          className="[&_thead]:sticky [&_thead]:top-0 [&_thead]:z-[5] [&_thead]:bg-background [&_thead]:backdrop-blur-sm"
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
                    <span className="text-sm">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : !data || data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length} className="text-center py-6 text-muted-foreground">
                  No data
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, idx) => (
                <TableRow key={getRowKey(row, idx)} className={cn(densityRowClass, striped && idx % 2 === 0 && "bg-muted/30")}>
                  {visibleColumns.map((col) => {
                    const value = col.dataIndex ? row[col.dataIndex as keyof T] : undefined;
                    return (
                      <TableCell
                        key={col.key}
                        className={
                          cn(
                            cellPadding,
                            col.align === "right" && "text-right",
                            col.align === "center" && "text-center",
                            idx === data.length - 1 && col === visibleColumns[0] && "rounded-bl-lg",
                            idx === data.length - 1 && col === visibleColumns[visibleColumns.length - 1] && "rounded-br-lg"
                          ) as string
                        }
                      >
                        {col.render ? col.render(value, row, idx) : String(value ?? "")}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {total > 0 && (
        <div className="border-t bg-muted/30 p-4 rounded-b-lg">
          <Pagination
            page={curPage}
            totalPages={Math.ceil(total / curPageSize)}
            onChange={(p) => setCurPage(p)}
            className=""
            showInfo
            totalItems={total}
            pageSize={curPageSize}
          />
        </div>
      )}
    </div>
  );
}

export default DataTable;
