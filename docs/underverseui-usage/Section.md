# Section

Source: `components/ui/Section.tsx`

Exports: `Section`

## Ví dụ cơ bản

```tsx
import { Section } from "@underverse-ui/underverse";

// Không padding, không background – dùng làm wrapper semantic thuần
<Section>
  <div>Nội dung</div>
</Section>

// Có spacing + paddingX
<Section variant="muted" spacing="md" paddingX="md">
  Nội dung với spacing và padding
</Section>
```

## Variants

```tsx
<Section variant="default">...</Section>   // bg-background
<Section variant="muted">...</Section>     // bg-muted/30
<Section variant="primary">...</Section>   // bg-primary/5
<Section variant="accent">...</Section>    // bg-accent/10
<Section variant="gradient">...</Section>  // linear-gradient via inline style
```

## Spacing (padding dọc)

```tsx
<Section spacing="none">...</Section>  // không padding (default)
<Section spacing="sm">...</Section>    // py-6 / max-md:py-4
<Section spacing="md">...</Section>    // py-8 / max-md:py-6
<Section spacing="lg">...</Section>    // py-12 / max-md:py-8
<Section spacing="xl">...</Section>    // py-16 / max-md:py-10
```

## PaddingX (padding ngang)

```tsx
<Section paddingX="none">...</Section>  // không padding (default)
<Section paddingX="sm">...</Section>    // px-3 md:px-4
<Section paddingX="md">...</Section>    // px-4 md:px-6
<Section paddingX="lg">...</Section>    // px-5 md:px-8
<Section paddingX="xl">...</Section>    // px-6 md:px-12
```

## Contained – background full-width, content có max-width

`contained=true` tạo inner `<div class="container mx-auto">` thay vì áp `container` trực tiếp lên `<section>`.
Kết quả: background phủ full-width, content được căn giữa tự động.

```tsx
// Background full-width, content có container mx-auto + paddingX
<Section variant="primary" spacing="md" contained paddingX="md">
  <h1>Hero content</h1>
</Section>

// containerClassName: override inner container (ưu tiên hơn paddingX)
<Section contained containerClassName="max-w-3xl mx-auto px-6">
  Nội dung hẹp hơn container mặc định
</Section>
```

## Gradient

`gradientFrom` và `gradientTo` nhận **CSS color value** (không phải Tailwind class) để tránh bị purge trong production.

```tsx
// Gradient mặc định (primary → accent)
<Section variant="gradient" spacing="xl" paddingX="md">
  <h1>Hero</h1>
</Section>

// Custom gradient
<Section
  variant="gradient"
  gradientFrom="oklch(0.7 0.2 300 / 20%)"
  gradientTo="oklch(0.7 0.2 0 / 20%)"
  gradientDirection="to-r"
  spacing="xl"
  paddingX="md"
>
  <h1>Custom gradient hero</h1>
</Section>

// Dùng hex / rgb / hsl đều được
<Section
  variant="gradient"
  gradientFrom="rgba(139, 92, 246, 0.15)"
  gradientTo="rgba(236, 72, 153, 0.15)"
  gradientDirection="to-br"
  spacing="lg"
>
  ...
</Section>
```

Các hướng gradient: `"to-r" | "to-l" | "to-b" | "to-t" | "to-br" | "to-bl" | "to-tr" | "to-tl"`

## as prop – đổi HTML tag

```tsx
<Section as="div">...</Section>      // render <div>
<Section as="main">...</Section>     // render <main>
<Section as="article">...</Section>  // render <article>
<Section as="aside">...</Section>    // render <aside>
```

## outlined

Thêm border + border-radius, không ảnh hưởng variant.

```tsx
<Section variant="muted" spacing="md" paddingX="md" outlined>
  Card-like section
</Section>
```

## Kết hợp tất cả

```tsx
// Hero section đầy đủ
<Section
  as="main"
  variant="gradient"
  gradientFrom="oklch(0.7 0.2 300 / 20%)"
  gradientTo="oklch(0.7 0.2 200 / 20%)"
  gradientDirection="to-br"
  spacing="xl"
  contained
  paddingX="md"
  containerClassName="max-w-5xl mx-auto"
>
  <h1>Tiêu đề trang</h1>
  <p>Mô tả ngắn</p>
</Section>
```

## API

```ts
interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  /** Override HTML tag. Default: "section" */
  as?: React.ElementType;
  variant?: "default" | "muted" | "primary" | "accent" | "gradient";
  /** Vertical padding. Default: "none" */
  spacing?: "none" | "sm" | "md" | "lg" | "xl";
  /** Horizontal padding. Default: "none" */
  paddingX?: "none" | "sm" | "md" | "lg" | "xl";
  /** Tạo inner container mx-auto – background vẫn full-width */
  contained?: boolean;
  /** className cho inner container khi contained=true */
  containerClassName?: string;
  /** Viền mỏng kiểu Card */
  outlined?: boolean;
  /** CSS color value cho gradient start. Default: "oklch(0.7 0.15 280 / 20%)" */
  gradientFrom?: string;
  /** CSS color value cho gradient end. Default: "oklch(0.7 0.2 200 / 20%)" */
  gradientTo?: string;
  /** Hướng gradient. Default: "to-br" */
  gradientDirection?: "to-r" | "to-l" | "to-b" | "to-t" | "to-br" | "to-bl" | "to-tr" | "to-tl";
}
```

## Design Philosophy

Section mặc định **không thêm padding hay container nào** – caller chủ động khai báo khi cần:

```tsx
// ✅ Rõ ràng, không ẩn side effect
<Section spacing="md" paddingX="md" contained>...</Section>

// ❌ Tránh double-container nếu page đã có layout wrapper
```
