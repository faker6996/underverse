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

## Performance Optimizations

DataTable được tối ưu hiệu suất theo **Vercel React Best Practices**:

| Optimization           | Description                                   |
| ---------------------- | --------------------------------------------- |
| **Lazy State Init**    | `useState(() => {...})` cho localStorage read |
| **Set Lookup**         | `O(1)` column visibility check thay vì `O(n)` |
| **content-visibility** | Auto skip rendering off-screen rows           |

### content-visibility

Table rows sử dụng CSS `content-visibility: auto` để browser có thể skip rendering các rows nằm ngoài viewport:

```css
/* Applied automatically to each <tr> */
content-visibility: auto;
contain-intrinsic-size: 0 48px; /* Estimated row height */
```

Hiệu quả nhất khi table có **50+ rows**.

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
  /** Cố định header khi cuộn dọc. Mặc định là true */
  stickyHeader?: boolean;
  /** Chiều cao tối đa của bảng khi bật stickyHeader. Mặc định là 500px */
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
```

## DataTableColumn

Type định nghĩa cho mỗi cột trong bảng:

```ts
type DataTableColumn<T> = {
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
```

## Sticky Column (Cố định cột)

DataTable hỗ trợ cố định một hoặc nhiều cột bên trái hoặc phải khi cuộn ngang. Sử dụng thuộc tính `fixed` trong column definition:

### Cách sử dụng

```tsx
const columns: DataTableColumn<MyData>[] = [
  {
    key: "id",
    title: "ID",
    dataIndex: "id",
    width: 80,
    fixed: "left", // Cố định bên trái
  },
  { key: "name", title: "Tên", dataIndex: "name", width: 200 },
  { key: "email", title: "Email", dataIndex: "email", width: 250 },
  { key: "phone", title: "Điện thoại", dataIndex: "phone", width: 150 },
  { key: "address", title: "Địa chỉ", dataIndex: "address", width: 300 },
  {
    key: "actions",
    title: "Thao tác",
    width: 120,
    fixed: "right", // Cố định bên phải
    render: (_, record) => <Button>Edit</Button>,
  },
];
```

### Cố định nhiều cột

Bạn có thể cố định nhiều cột cùng lúc. Các cột sẽ tự động tính toán vị trí dựa trên width của nhau:

```tsx
const columns: DataTableColumn<MyData>[] = [
  // 2 cột cố định bên trái
  { key: "select", title: <Checkbox />, width: 48, fixed: "left" },
  { key: "id", title: "ID", dataIndex: "id", width: 80, fixed: "left" },

  // Các cột bình thường
  { key: "name", title: "Tên", dataIndex: "name", width: 200 },
  { key: "email", title: "Email", dataIndex: "email", width: 250 },
  { key: "phone", title: "Điện thoại", dataIndex: "phone", width: 150 },

  // 2 cột cố định bên phải
  { key: "status", title: "Trạng thái", dataIndex: "status", width: 100, fixed: "right" },
  { key: "actions", title: "Thao tác", width: 120, fixed: "right", render: ... },
];
```

Kết quả:

- **Bên trái**: Cột `select` (left: 0px), cột `id` (left: 48px) - tự động xếp chồng
- **Bên phải**: Cột `actions` (right: 0px), cột `status` (right: 120px) - tự động xếp chồng

### Tính năng

| Feature                | Description                                                |
| ---------------------- | ---------------------------------------------------------- |
| **fixed="left"**       | Cố định cột bên trái khi cuộn ngang                        |
| **fixed="right"**      | Cố định cột bên phải khi cuộn ngang                        |
| **Multiple columns**   | Hỗ trợ cố định nhiều cột cùng lúc, tự động tính vị trí     |
| **Shadow effect**      | Hiển thị shadow để phân biệt cột cố định với các cột khác  |
| **Auto position**      | Tự động tính toán vị trí sticky dựa trên width của các cột |
| **Striped compatible** | Giữ màu nền striped cho các cột cố định                    |
| **Header sticky**      | Cột cố định ở header có z-index cao hơn để không bị đè lên |

### Lưu ý

- **Bắt buộc có `width`**: Các cột có `fixed` **phải** có thuộc tính `width` để tính toán vị trí chính xác
- **Thứ tự cột**: Các cột `fixed="left"` nên đặt ở đầu mảng columns, `fixed="right"` ở cuối
- **Hiệu suất**: Sử dụng CSS `position: sticky` nên không ảnh hưởng đến performance

## Sticky Header (Cố định header)

DataTable hỗ trợ cố định header khi cuộn dọc. Mặc định được bật (`stickyHeader={true}`).

### Cách sử dụng

```tsx
<DataTable
  columns={columns}
  data={data}
  stickyHeader={true} // Mặc định là true
  maxHeight={400} // Chiều cao tối đa, mặc định 500px
/>
```

### Props

| Prop           | Type             | Default | Description                                    |
| -------------- | ---------------- | ------- | ---------------------------------------------- |
| `stickyHeader` | `boolean`        | `true`  | Cố định header khi cuộn dọc                    |
| `maxHeight`    | `number\|string` | `500`   | Chiều cao tối đa của bảng (px hoặc CSS string) |

### Tính năng

| Feature           | Description                                                     |
| ----------------- | --------------------------------------------------------------- |
| **Auto scroll**   | Tự động hiển thị thanh cuộn dọc khi nội dung vượt quá maxHeight |
| **Header fixed**  | Header luôn hiển thị ở trên cùng khi cuộn                       |
| **Shadow effect** | Header có shadow nhẹ để phân biệt với body                      |
| **Compatible**    | Hoạt động tốt với cột cố định (fixed columns)                   |

### Ví dụ kết hợp Sticky Header và Sticky Column

```tsx
const columns: DataTableColumn<User>[] = [
  { key: "id", title: "ID", dataIndex: "id", width: 80, fixed: "left" },
  { key: "name", title: "Name", dataIndex: "name", width: 200 },
  { key: "email", title: "Email", dataIndex: "email", width: 250 },
  { key: "phone", title: "Phone", dataIndex: "phone", width: 150 },
  { key: "address", title: "Address", dataIndex: "address", width: 300 },
  { key: "actions", title: "Actions", width: 120, fixed: "right", render: ... },
];

<DataTable
  columns={columns}
  data={data}
  stickyHeader={true}
  maxHeight={400}
  striped
/>
```

Khi cuộn:

- **Cuộn dọc**: Header cố định ở trên
- **Cuộn ngang**: Cột ID (trái) và Actions (phải) cố định
