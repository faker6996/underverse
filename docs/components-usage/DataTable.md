# DataTable

Source: `components/ui/DataTable.tsx`

Exports:

- DataTable

Note: Component hỗ trợ đa ngôn ngữ (en, vi, ko, ja) cho các labels như density, columns, etc.

## i18n Support

| Locale | Columns | Density | Compact    | Normal      | Comfortable |
| ------ | ------- | ------- | ---------- | ----------- | ----------- |
| `en`   | Columns | Density | Compact    | Normal      | Comfortable |
| `vi`   | Cột     | Mật độ  | Thu gọn    | Bình thường | Thoải mái   |
| `ko`   | 열      | 밀도    | 컴팩트     | 보통        | 편안함      |
| `ja`   | 列      | 密度    | コンパクト | 通常        | 快適        |

## DataTable

Props type: `DataTableProps<T>`

```tsx
import { DataTable } from "@underverse-ui/underverse";

export function Example() {
  return <DataTable />;
}
```

Vi du day du:

```tsx
import React from "react";
import { DataTable } from "@underverse-ui/underverse";

export function Example() {
  const columns = [
    { key: "name", title: "Ten", dataIndex: "name" },
    { key: "price", title: "Gia", dataIndex: "price" },
  ];
  const data = [
    { name: "San pham A", price: "120.000d" },
    { name: "San pham B", price: "240.000d" },
  ];

  return <DataTable columns={columns} data={data} total={data.length} page={1} pageSize={10} />;
}
```

```ts
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
```
