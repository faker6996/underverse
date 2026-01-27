# Tooltip

Source: `components/ui/Tooltip.tsx`

Exports:

- Tooltip

Note: Usage snippets are minimal; fill required props from the props type below.

## Behavior

- Renders in a portal (`document.body`) using `position: fixed` and measures actual tooltip size.
- Auto-flips/clamps to stay within the viewport (no hardcoded width).

## Accessibility (Web Interface Guidelines Compliant)

| Feature                                  | Status |
| ---------------------------------------- | ------ |
| `role="tooltip"`                         | ✅     |
| Keyboard accessible (`onFocus`/`onBlur`) | ✅     |
| `focus-visible` ring on trigger          | ✅     |

## Tooltip

Props type: `TooltipProps`

```tsx
import { Tooltip } from "@underverse-ui/underverse";

export function Example() {
  return <Tooltip />;
}
```

Vi du day du:

```tsx
import React from "react";
import { Tooltip } from "@underverse-ui/underverse";

export function Example() {
  return (
    <Tooltip content="Sao chep duong dan" placement="top">
      <button type="button">Copy</button>
    </Tooltip>
  );
}
```

```ts
interface TooltipProps {
  children: React.ReactElement;
  content: React.ReactNode;
  placement?: "top" | "right" | "bottom" | "left";
  delay?: number | { open?: number; close?: number };
  className?: string;
  disabled?: boolean;
  variant?: "default" | "info" | "warning" | "error" | "success";
}
```
