# ScrollArea

Source: `components/ui/ScrollArea.tsx`

Exports:

- ScrollArea

## ScrollArea

Props type: `ScrollAreaProps`

```tsx
import { ScrollArea } from "@underverse-ui/underverse";

export function Example() {
  return <ScrollArea className="h-64">{/* content */}</ScrollArea>;
}
```

Ví dụ đầy đủ:

```tsx
import { ScrollArea } from "@underverse-ui/underverse";

// Basic - no default padding
<ScrollArea className="h-48">
  <div className="p-4">Content here...</div>
</ScrollArea>

// With padding via contentClassName
<ScrollArea className="h-48" contentClassName="p-4">
  Content with padding...
</ScrollArea>

// With variant and outlined
<ScrollArea variant="muted" outlined className="h-48">
  <div className="p-4">Muted with border</div>
</ScrollArea>
```

```ts
interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  /** Content area class name */
  contentClassName?: string;
  variant?: "default" | "muted" | "primary" | "accent";
  /** Show thin border like Card */
  outlined?: boolean;
}
```

## Props

| Prop               | Type                                            | Default     | Description                                                |
| ------------------ | ----------------------------------------------- | ----------- | ---------------------------------------------------------- |
| `className`        | `string`                                        | -           | CSS class for outer container (set height here)            |
| `contentClassName` | `string`                                        | -           | CSS class for inner scrollable viewport (set padding here) |
| `variant`          | `"default" \| "muted" \| "primary" \| "accent"` | `"default"` | Background color variant                                   |
| `outlined`         | `boolean`                                       | `false`     | Show thin border with rounded corners                      |

> **Note**: ScrollArea không có padding mặc định. Thêm padding qua `contentClassName` hoặc wrap content trong div với padding.
