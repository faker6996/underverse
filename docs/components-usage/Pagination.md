# Pagination

Source: `components/ui/Pagination.tsx`

Exports:

- Pagination
- SimplePagination
- CompactPagination

Note: Component hỗ trợ đa ngôn ngữ (en, vi, ko, ja). Tự động detect `next-intl` hoặc sử dụng `TranslationProvider`.

## Accessibility (Web Interface Guidelines Compliant)

| Feature                                  | Status |
| ---------------------------------------- | ------ |
| `nav` element with `aria-label`          | ✅     |
| `aria-current="page"` for active page    | ✅     |
| Button labels (First/Previous/Next/Last) | ✅     |
| `focus-visible` ring                     | ✅     |
| Disabled state styling                   | ✅     |

## Supported Locales

| Locale | First Page   | Previous | Next | Last Page     |
| ------ | ------------ | -------- | ---- | ------------- |
| `en`   | First page   | Previous | Next | Last page     |
| `vi`   | Trang đầu    | Trước    | Tiếp | Trang cuối    |
| `ko`   | 처음 페이지  | 이전     | 다음 | 마지막 페이지 |
| `ja`   | 最初のページ | 前へ     | 次へ | 最後のページ  |

## Pagination

Props type: `PaginationProps`

```tsx
import { Pagination } from "@underverse-ui/underverse";

export function Example() {
  return <Pagination />;
}
```

Vi du day du:

```tsx
import React from "react";
import { Pagination } from "@underverse-ui/underverse";

export function Example() {
  const [page, setPage] = React.useState(1);
  return <Pagination page={page} totalPages={8} onChange={setPage} showInfo totalItems={80} />;
}
```

### Với TranslationProvider (Korean):

```tsx
import { TranslationProvider, Pagination } from "@underverse-ui/underverse";

export function App() {
  const [page, setPage] = React.useState(1);
  return (
    <TranslationProvider locale="ko">
      <Pagination page={page} totalPages={10} onChange={setPage} showInfo totalItems={100} />
      {/* Hiển thị: 1 - 10 / 100 항목 */}
    </TranslationProvider>
  );
}
```

### Override labels thủ công:

````tsx
<Pagination
  page={page}
  totalPages={10}
  onChange={setPage}
  labels={{
    firstPage: "最初 (custom)",
    lastPage: "最後 (custom)",
    previous: "前",
    next: "次",
    showingResults: ({ startItem, endItem, totalItems }) =>
      `${startItem} ~ ${endItem} / ${totalItems} 件`,
  }}
/>

```ts
export interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  showPageNumbers?: boolean;
  showInfo?: boolean;
  disabled?: boolean;
  alignment?: "left" | "center" | "right";
  // For page size selector
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  totalItems?: number;
  labels?: {
    navigationLabel?: string;
    showingResults?: (ctx: { startItem: number; endItem: number; totalItems?: number }) => string;
    firstPage?: string;
    previousPage?: string;
    previous?: string;
    nextPage?: string;
    next?: string;
    lastPage?: string;
    itemsPerPage?: string;
    search?: string;
    noOptions?: string;
    pageNumber?: (page: number) => string;
  };
}
````

## SimplePagination

Props type: `SimplePaginationProps`

```tsx
import { SimplePagination } from "@underverse-ui/underverse";

export function Example() {
  return <SimplePagination />;
}
```

Vi du day du:

```tsx
import React from "react";
import { SimplePagination } from "@underverse-ui/underverse";

export function Example() {
  const [page, setPage] = React.useState(1);
  return <SimplePagination page={page} totalPages={5} onChange={setPage} />;
}
```

```ts
// Simple Pagination - minimal version with just prev/next
export interface SimplePaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
  disabled?: boolean;
  showInfo?: boolean;
  totalItems?: number;
  pageSize?: number;
}
```

## CompactPagination

Props type: `CompactPaginationProps`

```tsx
import { CompactPagination } from "@underverse-ui/underverse";

export function Example() {
  return <CompactPagination />;
}
```

Vi du day du:

```tsx
import React from "react";
import { CompactPagination } from "@underverse-ui/underverse";

export function Example() {
  const [page, setPage] = React.useState(1);
  return <CompactPagination page={page} totalPages={3} onChange={setPage} />;
}
```

```ts
// Compact Pagination - icon only version
export interface CompactPaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  disabled?: boolean;
}
```
