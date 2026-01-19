# Popover

Source: `components/ui/Popover.tsx`

Exports:

- Popover

Note: Usage snippets are minimal; fill required props from the props type below.

## Accessibility (Web Interface Guidelines Compliant)

| Feature                | Status |
| ---------------------- | ------ |
| ESC to close           | ✅     |
| Click outside to close | ✅     |
| `focus-visible` ring   | ✅     |
| Portal rendering       | ✅     |

## Popover

Props type: `PopoverProps`

```tsx
import { Popover } from "@underverse-ui/underverse";

export function Example() {
  return <Popover>Content</Popover>;
}
```

Vi du day du:

```tsx
import React from "react";
import { Popover } from "@underverse-ui/underverse";

export function Example() {
  return (
    <Popover trigger={<button type="button">Chi tiet</button>} placement="bottom">
      <div className="space-y-1">
        <div className="font-medium">Thong tin them</div>
        <div className="text-sm text-muted-foreground">Noi dung mo rong</div>
      </div>
    </Popover>
  );
}
```

```ts
interface PopoverProps {
  trigger: React.ReactElement;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  placement?: "top" | "bottom" | "left" | "right" | "top-start" | "bottom-start" | "top-end" | "bottom-end";
  modal?: boolean;
  disabled?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  matchTriggerWidth?: boolean;
  contentWidth?: number; // optional fixed width
}
```
