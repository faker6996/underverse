# Card

Source: `components/ui/Card.tsx`

Exports:


- Card

Note: Usage snippets are minimal; fill required props from the props type below.

## Card

Props type: `CardProps`

```tsx
import Card from "@underverse-ui/underverse";

export function Example() {
  return <Card>Content</Card>;
  return <Card>Content</Card>;
}
```

Ví dụ đầy đủ:

```tsx
import React from "react";
import Card from "@underverse-ui/underverse";

export function Example() {
  return (
    <Card
      title="Thông tin đơn hàng"
      description="Cập nhật lần cuối: 10:30"
      footer={<div className="text-sm text-muted-foreground">Tổng: 1.200.000đ</div>}
      hoverable
    >
      <div className="text-sm">Nội dung thẻ hiển thị tại đây</div>
    </Card>
  );
}
```

## Smart Padding

Card hỗ trợ **smart padding override** thông qua `contentClassName`. Khi bạn cung cấp padding classes:

- `p-*` sẽ ghi đè **toàn bộ** padding mặc định
- `px-*`, `pl-*`, `pr-*` chỉ ghi đè padding **ngang**, giữ nguyên padding dọc
- `py-*`, `pt-*`, `pb-*` chỉ ghi đè padding **dọc**, giữ nguyên padding ngang

```tsx
// Ghi đè toàn bộ padding
<Card contentClassName="p-2">...</Card>

// Chỉ ghi đè padding ngang, giữ nguyên padding dọc mặc định
<Card contentClassName="px-2">...</Card>

// Không có padding
<Card noPadding>...</Card>
```

```ts
interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  hoverable?: boolean;
  clickable?: boolean;
  innerClassName?: string; // class for inner rounded wrapper
  contentClassName?: string; // class for content wrapper (supports smart padding override)
  noPadding?: boolean; // remove default body padding
}
```
