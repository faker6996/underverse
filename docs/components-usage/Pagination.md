# Pagination

Source: `components/ui/Pagination.tsx`

Exports:
- Pagination
- SimplePagination
- CompactPagination

Note: Usage snippets are minimal; fill required props from the props type below.

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
  return (
    <Pagination
      page={page}
      totalPages={8}
      onChange={setPage}
      showInfo
      totalItems={80}
    />
  );
}
```

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
```

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
