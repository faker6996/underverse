# Tooltip

Source: `packages/underverse/src/components/Tooltip.tsx`

Exports:

- Tooltip

Note: Usage snippets are minimal; fill required props from the props type below.

## Behavior

- Renders in a portal (`document.body`) using `position: fixed` and measures actual tooltip size.
- Auto-flips/clamps to stay within the viewport (no hardcoded width).
- Uses `asChild` pattern by default: the child remains the real trigger element and `Tooltip` only augments props.
- Does not add an extra wrapper by default, so event path stays safe for interactive triggers such as dropdown/menu buttons.
- Forwards trigger props and `ref` when used as a child of higher-level trigger components such as `DropdownMenu` or `Popover`.
- Closes immediately on trigger `pointerdown`/`click`, document `pointerdown`, or `Escape`.
- This prevents portal tooltips from staying visible after the trigger opens a modal, popover, dropdown, or another overlay that covers the trigger before `mouseleave` can fire.

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
  asChild?: boolean;
}
```

`asChild` mặc định là `true`. Chỉ dùng `asChild={false}` nếu bạn thật sự muốn `Tooltip` tự bọc child bằng một phần tử trung gian.

Example trigger composition:

```tsx
<DropdownMenu
  trigger={
    <Tooltip content="More actions" asChild>
      <button type="button">Actions</button>
    </Tooltip>
  }
  items={[{ label: "Edit", onClick: () => {} }]}
/>
```

When used with interactive triggers, no manual cleanup is required. `Tooltip` clears pending open/close timers and removes document listeners when it closes or unmounts.
