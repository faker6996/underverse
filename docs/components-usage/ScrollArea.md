# ScrollArea

Source: `components/ui/ScrollArea.tsx`

Exports:

- ScrollArea

Note: Usage snippets are minimal; fill required props from the props type below.

## ScrollArea

Props type: `ScrollAreaProps`

```tsx
import { ScrollArea } from "@underverse-ui/underverse";

export function Example() {
  return <ScrollArea />;
}
```

Ví dụ đầy đủ:

```tsx
import React from "react";
import { ScrollArea } from "@underverse-ui/underverse";

export function Example() {
  return (
    // Basic - no padding by default
    <ScrollArea className="h-32">
      <div>Content here...</div>
    </ScrollArea>

    // With spacing and outlined
    <ScrollArea spacing="md" outlined className="h-48">
      <div>Content with padding...</div>
    </ScrollArea>

    // With variant
    <ScrollArea variant="muted" spacing="lg" outlined>
      <div>Muted background content...</div>
    </ScrollArea>
  );
}
```

```ts
interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  /** Content area class name */
  contentClassName?: string;
  variant?: "default" | "muted" | "primary" | "accent";
  spacing?: "none" | "sm" | "md" | "lg" | "xl";
  /** Full width mode (no container constraints) */
  fullWidth?: boolean;
  /** Show thin border like Card */
  outlined?: boolean;
}
```

## Props

| Prop               | Type                                            | Default     | Description                                |
| ------------------ | ----------------------------------------------- | ----------- | ------------------------------------------ |
| `className`        | `string`                                        | -           | CSS class for outer container              |
| `contentClassName` | `string`                                        | -           | CSS class for inner scrollable viewport    |
| `variant`          | `"default" \| "muted" \| "primary" \| "accent"` | `"default"` | Background color variant                   |
| `spacing`          | `"none" \| "sm" \| "md" \| "lg" \| "xl"`        | `"none"`    | Inner padding size                         |
| `fullWidth`        | `boolean`                                       | `true`      | Full width mode (no container constraints) |
| `outlined`         | `boolean`                                       | `false`     | Show thin border with rounded corners      |
