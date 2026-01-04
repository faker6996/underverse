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
  return (
    <Section>
      Content
    </Section>
  );
}
```

Vi du day du:

```tsx
import React from "react";
import { Section } from "@underverse-ui/underverse";

export function Example() {
  return (
    <Section
      variant={"default"}
    >
      Noi dung
    </Section>
  );
}
```

```ts
interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "muted" | "primary" | "accent" | "gradient";
  spacing?: "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
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
