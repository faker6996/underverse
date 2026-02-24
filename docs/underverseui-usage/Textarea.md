# Textarea

Source: `components/ui/Textarea.tsx`

Exports:
- Textarea

Note: Usage snippets are minimal; fill required props from the props type below.

## Textarea

Props type: `TextareaProps`

```tsx
import { Textarea } from "@underverse-ui/underverse";

export function Example() {
  return <Textarea />;
}
```

Vi du day du:

```tsx
import React from "react";
import { Textarea } from "@underverse-ui/underverse";

export function Example() {
  return (
    <Textarea
      label={"Nhan"}
      description={"Mo ta ngan"}
      variant={"default"}
      size={"md"}
      placeholder="Nhap..."
     />
  );
}
```

```ts
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  description?: string;
  variant?: "default" | "filled" | "outlined";
  size?: "sm" | "md" | "lg";
  /** Enable OverlayScrollbars on textarea viewport. Default: false */
  useOverlayScrollbar?: boolean;
}
```

## Props quick reference

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `label` | `string` | - | Label hiển thị phía trên textarea |
| `error` | `string` | - | Text lỗi validation |
| `description` | `string` | - | Text mô tả phía dưới |
| `variant` | `"default" \| "filled" \| "outlined"` | `"default"` | Kiểu hiển thị |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Kích thước textarea |
| `useOverlayScrollbar` | `boolean` | `false` | Bật OverlayScrollbars cho vùng cuộn của textarea |
