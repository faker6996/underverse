# Section

Source: `components/ui/Section.tsx`

Exports:

- Section

Note: Usage snippets are minimal; fill required props from the props type below.

## Section

Props type: `SectionProps`

```tsx
import { Section } from "@underverse-ui/underverse";

export function Example() {
  return <Section>Content</Section>;
}
```

Ví dụ đầy đủ:

```tsx
import React from "react";
import { Section } from "@underverse-ui/underverse";

export function Example() {
  return (
    <Section variant="muted" spacing="md" paddingX="md">
      Nội dung với spacing và padding
    </Section>
  );
}
```

```ts
interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "muted" | "primary" | "accent" | "gradient";
  /** Vertical padding (py). Default: "none" - không thêm padding dọc */
  spacing?: "none" | "sm" | "md" | "lg" | "xl";
  /** Horizontal padding (px). Default: "none" - không thêm padding ngang */
  paddingX?: "none" | "sm" | "md" | "lg" | "xl";
  /** Thêm container wrapper với mx-auto. Default: false */
  contained?: boolean;
  /** Hiển thị viền mỏng xám nhạt giống Card */
  outlined?: boolean;
  /** Gradient start color (Tailwind class like 'from-purple-500') */
  gradientFrom?: string;
  /** Gradient end color (Tailwind class like 'to-pink-500') */
  gradientTo?: string;
  /** Gradient direction */
  gradientDirection?: GradientDirection;
}
```

## API Design Philosophy

Section mặc định **không thêm bất kỳ padding hay container nào**.
Caller phải chủ động yêu cầu khi cần:

```tsx
// Mặc định: không padding, không container
<Section>...</Section>

// Có padding dọc và ngang
<Section spacing="md" paddingX="md">...</Section>

// Có container (hiếm khi cần)
<Section contained spacing="md">...</Section>
```

Điều này giúp:

- Tránh double-container khi page đã có container
- Backward compatible - code cũ không bị ảnh hưởng
- Explicit > implicit - nhìn code biết ngay có gì
