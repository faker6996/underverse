# Popover

Source: `components/ui/Popover.tsx`

Exports:

- Popover

## Behavior

- Renders in a portal (`document.body`) using `position: fixed` (stable when scrolling).
- Auto-adjusts placement to stay within the viewport (flip/clamp when near edges).
- Supports controlled (`open`/`onOpenChange`) and uncontrolled modes.

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
  return <Popover trigger={<button type="button">Open</button>}>Content</Popover>;
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

### Sizing tips

- Use `contentWidth` to set a fixed width, or `matchTriggerWidth` to match the trigger.
- Use `contentClassName` for constraints like `max-w-[calc(100vw-1rem)]` / `max-h-[calc(100vh-6rem)] overflow-auto`.
