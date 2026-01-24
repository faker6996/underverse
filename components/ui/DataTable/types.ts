import type React from "react";

export type FilterType = "text" | "select" | "date";

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
  labels?: DataTableLabels;
}

