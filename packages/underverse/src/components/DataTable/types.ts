import type React from "react";

export type FilterType = "text" | "select" | "date";
export type DataTableSize = "sm" | "md" | "lg";
export type DataTableDensity = "compact" | "normal" | "comfortable";

export type DataTableColumn<T> = {
  key: string; // unique key
  title: React.ReactNode;

  /** Multi-row header support: Columns can be grouped by defining children.
   * Group columns (with children) are header-only and don't render data.
   * Leaf columns (without children) render data and support sort/filter/render.
   */
  children?: DataTableColumn<T>[];

  // Leaf-only properties (ignored if children exists)
  dataIndex?: keyof T | string;
  sortable?: boolean;
  filter?: { type: FilterType; options?: string[]; placeholder?: string };
  render?: (value: any, record: T, index: number) => React.ReactNode;

  // Common properties
  width?: number | string;
  align?: "left" | "center" | "right";
  visible?: boolean; // default true
  /** Cố định cột bên trái hoặc phải khi cuộn ngang */
  fixed?: "left" | "right";

  /** Advanced: Override auto-calculated colspan (defaults to number of leaf descendants) */
  colSpan?: number;
  /** Advanced: Override auto-calculated rowspan (defaults based on depth) */
  rowSpan?: number;
};

export type Sorter = { key: string; order: "asc" | "desc" } | null;

export interface DataTableQuery {
  filters: Record<string, any>;
  sort?: Sorter;
  page: number;
  pageSize: number;
}

export type DataTableLabels = {
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

/** Internal type for header cell in multi-row headers */
export type HeaderCell<T> = {
  column: DataTableColumn<T>;
  colSpan: number;
  rowSpan: number;
  isLeaf: boolean;
  rowIndex: number;
  colIndex: number;
};

/** Internal type for a single header row in multi-row headers */
export type HeaderRow<T> = HeaderCell<T>[];

export interface DataTableProps<T> {
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
  /** Visual size preset. Maps to component scales in the table UI. */
  size?: DataTableSize;
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
  /** Enable OverlayScrollbars on table viewport. Default: false */
  useOverlayScrollbar?: boolean;
  labels?: DataTableLabels;
}
