# ScrollArea

Source: `components/ui/ScrollArea.tsx`

Exports:

- ScrollArea

## ScrollArea

Props type: `ScrollAreaProps`

```tsx
import { ScrollArea } from "@underverse-ui/underverse";

export function Example() {
  return <ScrollArea className="h-64 rounded-xl border border-border">{/* content */}</ScrollArea>;
}
```

Ví dụ đầy đủ:

```tsx
import { ScrollArea } from "@underverse-ui/underverse";

// Basic - no default padding
<ScrollArea className="h-48 rounded-xl border border-border">
  <div className="p-4">Content here...</div>
</ScrollArea>

// With padding via contentClassName
<ScrollArea className="h-48 rounded-xl border border-border" contentClassName="p-4">
  Content with padding...
</ScrollArea>

// With overlay scrollbar (opt-in)
<ScrollArea className="h-48 rounded-xl border border-border" useOverlayScrollbar>
  <div className="p-4">Long content...</div>
</ScrollArea>

// With variant and outlined
<ScrollArea className="h-48 rounded-xl" variant="muted" outlined>
  <div className="p-4">Muted with border</div>
</ScrollArea>
```

```ts
interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  /** Scroll viewport class name */
  contentClassName?: string;
  variant?: "default" | "muted" | "primary" | "accent";
  /** Show thin border on outer wrapper */
  outlined?: boolean;
  /** Clip outer wrapper overflow */
  overflowHidden?: boolean;
  /** Enable OverlayScrollbars for this scroll viewport. Default: false */
  useOverlayScrollbar?: boolean;
}
```

## Props

| Prop               | Type                                            | Default     | Description                                                |
| ------------------ | ----------------------------------------------- | ----------- | ---------------------------------------------------------- |
| `className`        | `string`                                        | -           | CSS class for outer wrapper (set height/width, border, radius here) |
| `contentClassName` | `string`                                        | -           | CSS class for scrollable viewport (set padding/radius here) |
| `variant`          | `"default" \| "muted" \| "primary" \| "accent"` | `"default"` | Background color variant                                   |
| `outlined`         | `boolean`                                       | `false`     | Show thin border on the outer wrapper                      |
| `overflowHidden`   | `boolean`                                       | `true`      | Clip outer wrapper overflow; set `false` to allow overflow |
| `useOverlayScrollbar` | `boolean`                                    | `false`     | Bật OverlayScrollbars cho viewport này                     |

> **Note**: ScrollArea không còn hardcode bo góc ở primitive. `variant` và `outlined` áp trên outer wrapper; `contentClassName` chỉ nên dùng cho phần viewport scroll.
