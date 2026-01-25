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

## Multi-Row Headers (Column Grouping)

DataTable hỗ trợ **multi-row headers** với khả năng nhóm cột theo cấu trúc phân cấp. Tính năng này cho phép tạo header nhiều dòng với colspan/rowspan tự động.

### Tính năng chính

| Feature                | Description                                                    |
| ---------------------- | -------------------------------------------------------------- |
| **Nested Structure**   | Nhóm cột theo cấu trúc `children`, không giới hạn độ sâu      |
| **Auto Colspan**       | Tự động tính colspan dựa trên số lượng cột con                |
| **Auto Rowspan**       | Tự động tính rowspan cho cột không có children                |
| **Group Headers**      | Cột nhóm chỉ hiển thị tiêu đề, không có sort/filter           |
| **Leaf Columns**       | Cột lá (không có children) hỗ trợ đầy đủ sort/filter/render   |
| **Sticky Groups**      | Nhóm cố định (fixed) được kế thừa bởi tất cả cột con          |
| **Validation**         | Cảnh báo tự động trong dev mode cho cấu trúc không hợp lệ     |
| **Backward Compatible** | Code hiện tại không cần thay đổi, flat columns vẫn hoạt động |

### Cách sử dụng cơ bản

#### Example 1: Simple 2-row grouping

```tsx
const columns: DataTableColumn<User>[] = [
  {
    key: "personal-info",
    title: "Personal Information",
    children: [
      { key: "name", title: "Name", dataIndex: "name", sortable: true, width: 150 },
      { key: "email", title: "Email", dataIndex: "email", width: 200 },
    ],
  },
  {
    key: "work-info",
    title: "Work Information",
    children: [
      { key: "role", title: "Role", dataIndex: "role", filter: { type: "select" }, width: 100 },
      { key: "department", title: "Department", dataIndex: "department", width: 130 },
    ],
  },
  {
    key: "actions",
    title: "Actions",
    width: 140,
    fixed: "right",
    render: (_, record) => <Button>Edit</Button>,
  },
];
```

**Kết quả render:**

```
┌────────────────────────────────┬──────────────────────────┬──────────┐
│     Personal Information       │    Work Information      │ Actions  │
├───────────────┬────────────────┼────────────┬─────────────┤          │
│ Name          │ Email          │ Role       │ Department  │          │
└───────────────┴────────────────┴────────────┴─────────────┴──────────┘
```

#### Example 2: Deep nesting (3 levels)

```tsx
const columns: DataTableColumn<Order>[] = [
  {
    key: "order-details",
    title: "Order Details",
    children: [
      {
        key: "basic",
        title: "Basic Info",
        children: [
          { key: "id", title: "ID", dataIndex: "id", width: 80 },
          { key: "date", title: "Date", dataIndex: "date", width: 120 },
        ],
      },
      {
        key: "customer",
        title: "Customer",
        children: [
          { key: "customer-name", title: "Name", dataIndex: "customerName", width: 150 },
          { key: "customer-email", title: "Email", dataIndex: "customerEmail", width: 200 },
        ],
      },
    ],
  },
  {
    key: "total",
    title: "Total",
    dataIndex: "total",
    sortable: true,
    width: 120,
    // Tự động rowspan=3 (span tất cả 3 dòng header)
  },
];
```

**Kết quả render (3 header rows):**

```
┌───────────────────────────────────────────────────┬────────┐
│                 Order Details                     │        │
├─────────────────────┬─────────────────────────────┤        │
│     Basic Info      │         Customer            │ Total  │
├──────────┬──────────┼──────────────┬──────────────┤        │
│ ID       │ Date     │ Name         │ Email        │        │
└──────────┴──────────┴──────────────┴──────────────┴────────┘
```

#### Example 3: Mixed columns (some with rowspan)

```tsx
const columns: DataTableColumn<User>[] = [
  {
    key: "id",
    title: "ID",
    dataIndex: "id",
    width: 80,
    // Tự động rowspan=2 (span tất cả header rows)
  },
  {
    key: "user-info",
    title: "User Information",
    children: [
      { key: "name", title: "Name", dataIndex: "name", sortable: true, width: 150 },
      { key: "email", title: "Email", dataIndex: "email", width: 200 },
    ],
  },
  {
    key: "status",
    title: "Status",
    dataIndex: "status",
    width: 100,
    // Tự động rowspan=2
  },
];
```

**Kết quả render:**

```
┌────┬─────────────────────────────────┬─────────┐
│    │     User Information            │         │
│ ID ├──────────────┬──────────────────┤ Status  │
│    │ Name         │ Email            │         │
└────┴──────────────┴──────────────────┴─────────┘
```

### Sticky Groups (Fixed Columns với Groups)

Khi cột nhóm có `fixed`, tất cả cột con sẽ kế thừa thuộc tính này:

```tsx
const columns: DataTableColumn<Product>[] = [
  {
    key: "select",
    title: <Checkbox />,
    width: 48,
    fixed: "left",
    render: (_, r) => <Checkbox />,
  },
  {
    key: "product-info",
    title: "Product Information",
    // KHÔNG CẦN fixed ở đây, nhưng có thể thêm để explicit
    children: [
      { key: "sku", title: "SKU", dataIndex: "sku", width: 100 },
      { key: "name", title: "Name", dataIndex: "name", width: 200 },
    ],
  },
  {
    key: "actions",
    title: "Actions",
    width: 140,
    fixed: "right", // Cố định bên phải
    render: (_, r) => <Button>View</Button>,
  },
];
```

Khi cuộn ngang:

- Cột "select" sticky left
- Cột "actions" sticky right
- Cột "Product Information" và children scroll bình thường

### Column Visibility với Groups

Column visibility toggle **chỉ hiển thị leaf columns** (cột lá):

- Group columns tự động ẩn/hiện based on children visibility
- Nếu tất cả children bị ẩn → group cũng bị ẩn
- Nếu ít nhất 1 child visible → group vẫn hiển thị

### Custom Colspan/Rowspan (Advanced)

Bạn có thể override auto-calculation bằng cách set explicit `colSpan`/`rowSpan`:

```tsx
const columns: DataTableColumn<Data>[] = [
  {
    key: "group",
    title: "Custom Group",
    colSpan: 3, // Override: force colspan = 3
    rowSpan: 1, // Override: force rowspan = 1
    children: [
      { key: "a", title: "A", dataIndex: "a", width: 100 },
      { key: "b", title: "B", dataIndex: "b", width: 100 },
      { key: "c", title: "C", dataIndex: "c", width: 100 },
    ],
  },
];
```

> **Lưu ý**: Dev mode sẽ cảnh báo nếu giá trị explicit không khớp với structure.

### Validation (Dev Mode)

Trong development mode, DataTable tự động validate column structure và hiển thị warnings:

**Các warnings được kiểm tra:**

- ✅ Duplicate keys
- ✅ Group columns có leaf properties (dataIndex, sortable, filter, render)
- ✅ Explicit colspan/rowspan conflicts với structure
- ✅ Sticky inheritance conflicts (parent left, child right)
- ✅ Mixed sticky trong cùng group
- ✅ Deep nesting (>4 levels) - UX concern

**Example console output:**

```
[DataTable] Group column "user-info" has dataIndex (will be ignored)
[DataTable] Header depth is 5 rows. Consider simplifying - too many header rows may impact user experience.
```

### Quy tắc quan trọng

| Rule                    | Description                                                        |
| ----------------------- | ------------------------------------------------------------------ |
| **Group = Header Only** | Cột có `children` chỉ hiển thị title, KHÔNG có dataIndex/sort/filter |
| **Leaf = Data Column**  | Cột KHÔNG có `children` mới render data và có sort/filter         |
| **Width Required**      | Cột có `fixed` **bắt buộc** phải có `width` để tính sticky offset |
| **Auto Calculation**    | Colspan/rowspan tự động, KHÔNG cần tính thủ công                   |
| **Sticky Inheritance**  | Children kế thừa `fixed` từ parent nếu không có explicit value     |

### Best Practices

1. **Giữ cấu trúc đơn giản**: Tối đa 2-3 header rows cho UX tốt
2. **Đặt tên rõ ràng**: Group title nên mô tả nhóm cột bên dưới
3. **Width consistency**: Đảm bảo children widths hợp lý, group width = sum(children)
4. **Sticky placement**: Đặt sticky groups ở đầu/cuối mảng columns
5. **Test visibility**: Kiểm tra column visibility toggle với groups

### Backward Compatibility

**100% backward compatible** - Code hiện tại không cần thay đổi:

```tsx
// Trước đây (vẫn hoạt động)
const columns = [
  { key: "name", title: "Name", dataIndex: "name", sortable: true },
  { key: "email", title: "Email", dataIndex: "email" },
];

// Bây giờ (thêm grouping tùy chọn)
const columns = [
  {
    key: "user-info",
    title: "User Info",
    children: [
      { key: "name", title: "Name", dataIndex: "name", sortable: true },
      { key: "email", title: "Email", dataIndex: "email" },
    ],
  },
];
```

### Performance Notes

- **Memoization**: Header rows được memoized, rebuild chỉ khi columns thay đổi
- **Flat calculation**: Leaf columns được flatten một lần, tái sử dụng cho rendering
- **No overhead**: Flat columns (không có children) không có overhead
