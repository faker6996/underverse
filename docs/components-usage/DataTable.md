# DataTable

Source: `components/ui/DataTable.tsx`

Exports:

- DataTable

Note: Component hỗ trợ đa ngôn ngữ (en, vi, ko, ja) cho các labels như density, columns, loading, etc.

## i18n Support

| Key           | EN               | VI                | KO          | JA                 |
| ------------- | ---------------- | ----------------- | ----------- | ------------------ |
| `columns`     | Columns          | Cột               | 열          | 列                 |
| `density`     | Density          | Mật độ            | 밀도        | 密度               |
| `compact`     | Compact          | Gọn               | 컴팩트      | コンパクト         |
| `normal`      | Normal           | Thường            | 보통        | 通常               |
| `comfortable` | Comfortable      | Thoải mái         | 여유        | ゆったり           |
| `loading`     | Loading          | Đang tải          | 로딩 중     | 読み込み中         |
| `noData`      | No data          | Không có dữ liệu  | 데이터 없음 | データがありません |
| `clearFilter` | Clear filter     | Xóa bộ lọc        | 필터 지우기 | フィルターをクリア |
| `headerAlign` | Header alignment | Căn chỉnh tiêu đề | 헤더 정렬   | ヘッダー配置       |
| `alignLeft`   | Align left       | Căn trái          | 왼쪽 정렬   | 左揃え             |
| `alignCenter` | Align center     | Căn giữa          | 가운데 정렬 | 中央揃え           |
| `alignRight`  | Align right      | Căn phải          | 오른쪽 정렬 | 右揃え             |

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
