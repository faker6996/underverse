# Card

Source: `components/ui/Card.tsx`

Exports: `Card`

## Ví dụ cơ bản

```tsx
import { Card } from "@underverse-ui/underverse";

// Tối giản
<Card>Nội dung bất kỳ</Card>

// Có title + description
<Card title="Tiêu đề" description="Mô tả ngắn">
  <p>Nội dung chính</p>
</Card>
```

## Props chính

### title / description / footer

```tsx
<Card
  title="Tên thẻ"
  description="Mô tả ngắn gọn"
  footer={
    <div className="flex gap-2">
      <Button variant="outline" size="sm">Hủy</Button>
      <Button variant="primary" size="sm">Lưu</Button>
    </div>
  }
>
  <p>Nội dung thẻ</p>
</Card>
```

### hoverable

Thêm hover effect: nâng nhẹ + border đổi màu + title đổi màu primary.

```tsx
<Card title="Hover me" hoverable>
  <p>Card nâng lên khi hover trên desktop</p>
</Card>
```

### clickable + onClick

Card hoạt động như button: có `role="button"`, `tabIndex=0`, keyboard Enter/Space.

```tsx
const [count, setCount] = useState(0);

<Card
  title="Clickable Card"
  description="Nhấn hoặc dùng bàn phím"
  clickable
  onClick={() => setCount(count + 1)}
>
  <p>Đã nhấn {count} lần</p>
</Card>
```

> **Lưu ý:** `role="button"` và keyboard handler chỉ được thêm khi cả `clickable` lẫn `onClick` cùng có mặt.

## Custom layout header / footer

Dùng `headerClassName` và `footerClassName` khi chỉ cần chỉnh layout của wrapper có sẵn, không cần đổi cấu trúc component.

```tsx
<Card
  title="Project Status"
  description="Cập nhật lần cuối: 10:30"
  headerClassName="flex-row items-center gap-4"
  footer={
    <>
      <span className="text-sm text-muted-foreground">Updated now</span>
      <Button size="sm">Open</Button>
    </>
  }
  footerClassName="justify-between"
>
  <p>Nội dung</p>
</Card>
```

## Smart Padding (contentClassName)

`contentClassName` áp vào body wrapper. Component hiện có logic giữ default padding theo từng trục:
- `px-*` chỉ override trục ngang
- `py-*` chỉ override trục dọc
- `p-*` hoặc `noPadding` sẽ bỏ toàn bộ default padding

```tsx
// Chỉ custom horizontal → vertical giữ mặc định
<Card title="Horizontal Only" contentClassName="px-8">
  <p>py mặc định vẫn được giữ</p>
</Card>

// Chỉ custom vertical → horizontal giữ mặc định
<Card title="Vertical Only" contentClassName="py-12">
  <p>px mặc định vẫn được giữ</p>
</Card>

// Override toàn bộ
<Card title="Full Custom" contentClassName="p-0">
  <img src="/cover.jpg" className="w-full" />
</Card>

// Bỏ hoàn toàn padding
<Card title="No Padding" noPadding>
  <div className="aspect-video bg-muted" />
</Card>
```

## innerClassName

`innerClassName` áp vào inner wrapper đang giữ `overflow-hidden` và bo góc. Hữu ích khi cần đổi clipping hoặc radius nội bộ.

```tsx
<Card innerClassName="rounded-none overflow-visible">...</Card>
```

## Custom Styling

```tsx
// Gradient background
<Card
  title="Custom"
  className="bg-linear-to-br from-primary/10 to-transparent border-primary/20"
  contentClassName="text-center"
>
  <p>Centered content</p>
</Card>
```

## Animation

Card dùng explicit transition properties để tối ưu hiệu suất:

```css
transition-property: transform, box-shadow, border-color, background-color;
```

Hover shadow (`md:hover:shadow-md`) chỉ áp khi `hoverable` hoặc `clickable` — không áp mặc định lên mọi card.

## API

```ts
interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  footerClassName?: string;
  children?: React.ReactNode;
  hoverable?: boolean;
  clickable?: boolean;
  innerClassName?: string;
  contentClassName?: string;
  noPadding?: boolean;
}
```

## Ghi chú

- `Card` hiện là API kiểu prop-based, phù hợp cho case card đơn giản đến trung bình.
- Nếu content bên trong đã là bảng, media block hoặc layout có padding riêng, ưu tiên `noPadding` hoặc `contentClassName="p-0"`.
- Nếu cần cấu trúc header phức tạp hơn nhiều, nên truyền React node vào `title` hoặc `footer` thay vì cố nhồi thêm prop mới.
