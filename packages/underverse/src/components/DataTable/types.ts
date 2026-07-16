import type React from "react";

export type FilterType = "text" | "select" | "date";
export type DataTableSize = "sm" | "md" | "lg";
export type DataTableDensity = "compact" | "normal" | "comfortable";
export type DataTableHorizontalMode = "auto" | "scroll" | "fit";

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
  /** Vị trí của icon sort/filter: "inline" (ngay sát text) hoặc "end" (cuối dòng) */
  iconPosition?: "inline" | "end";
  visible?: boolean; // default true
  /** Cố định cột bên trái hoặc phải khi cuộn ngang */
  fixed?: "left" | "right";

  /** Advanced: Override auto-calculated colspan (defaults to number of leaf descendants) */
  colSpan?: number;
  /** Advanced: Override auto-calculated rowspan (defaults based on depth) */
  /** Advanced: Override auto-calculated rowspan (defaults based on depth) */
  rowSpan?: number;

  /**
   * Color tag for this column (hex or rgb string, e.g. "#3b82f6").
   * - Header cell gets a darker tinted background
   * - Body cells get a lighter tinted background
   * - Columns with the same colorTag are grouped together in the visibility dropdown
   */
  colorTag?: string;
};

/** Configuration for a column color group in the visibility dropdown */
export type ColumnColorGroup = {
  /** Display label for this group (e.g. "Bắt buộc", "Tùy chọn") */
  label: string;
  /**
   * Optional override for the header cell text color of columns in this group.
   * Accepts any valid CSS color (hex, rgb, rgba, color-mix, var(--token), ...).
   * When omitted, the table picks a readable foreground (black or white) based
   * on the perceived luminance of the column's `colorTag` via WCAG formula.
   *
   * Useful when:
   * - the auto-picker doesn't match your brand palette
   * - you want a fixed color that survives light/dark theme swaps
   *   (e.g., a CSS var like `var(--foreground)`)
   */
  headerTextColor?: string;
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
  noData?: string;
  sortBy?: string;
  selectAll?: string;
  default?: string;
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

/** Public props for the `DataTable` component. */
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
  /** 
   * Define color groups for the column visibility dropdown legend.
   * Key = color value used in column's `colorTag` (e.g. "#1e40af").
   * If not provided, columns with colorTag still get colored but won't be grouped in dropdown.
   */
  columnColorGroups?: Record<string, ColumnColorGroup>;
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
  /**
   * Horizontal sizing strategy for the table viewport.
   * - "auto": default, prefer fitting the container and only scroll when content truly overflows
   * - "scroll": preserve explicit column widths and force horizontal scrolling via min-width aggregation
   * - "fit": use fixed table layout and suppress horizontal scrolling
   */
  horizontalMode?: DataTableHorizontalMode;
  /** Clip overflow của outer wrapper. Tắt khi cần cho phép shadow/focus ring tràn ra ngoài. */
  overflowHidden?: boolean;
  /** Enable OverlayScrollbars on table viewport. Default: false */
  useOverlayScrollbar?: boolean;
  /** Virtualize body rows for large page sizes. Default: false */
  virtualizedRows?: boolean;
  /** Estimated row height used by virtualized rendering. Defaults to the active density row height. */
  estimatedRowHeight?: number;
  /** Number of extra rows rendered above and below the visible range. Default: 8 */
  overscan?: number;
  /** Double-click leaf headers to auto-fit column width based on visible content. Default: true */
  enableHeaderAutoFit?: boolean;
  labels?: DataTableLabels;
}
