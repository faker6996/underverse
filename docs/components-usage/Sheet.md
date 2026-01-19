# Sheet

Source: `components/ui/Sheet.tsx`

Exports:

- Sheet
- Drawer
- SlideOver
- BottomSheet
- SidebarSheet

Note: Usage snippets are minimal; fill required props from the props type below.

## Accessibility (Web Interface Guidelines Compliant)

| Feature                        | Status |
| ------------------------------ | ------ |
| ESC to close (`closeOnEscape`) | ✅     |
| Close button with title        | ✅     |
| `focus-visible` ring           | ✅     |
| Body scroll lock               | ✅     |
| Portal rendering               | ✅     |

## Sheet

Props type: `SheetProps`

```tsx
import { Sheet } from "@underverse-ui/underverse";

export function Example() {
  return <Sheet>Content</Sheet>;
}
```

Vi du day du:

```tsx
import React from "react";
import { Sheet } from "@underverse-ui/underverse";

export function Example() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Mo Sheet
      </button>
      <Sheet open={open} onOpenChange={setOpen} title="Gio hang">
        <div className="text-sm">Noi dung gio hang</div>
      </Sheet>
    </>
  );
}
```

```ts
interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: "left" | "right" | "top" | "bottom";
  size?: "sm" | "md" | "lg" | "xl" | "full";
  variant?: "default" | "overlay" | "push";
  children: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  showClose?: boolean;
  closeOnOutsideClick?: boolean;
  closeOnEscape?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}
```

## Drawer

Props type: `DrawerProps`

```tsx
import { Drawer } from "@underverse-ui/underverse";

export function Example() {
  return <Drawer />;
}
```

Vi du day du:

```tsx
import React from "react";
import { Drawer } from "@underverse-ui/underverse";

export function Example() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Mo Drawer
      </button>
      <Drawer open={open} onOpenChange={setOpen} title="Bo loc">
        <div className="text-sm">Noi dung bo loc</div>
      </Drawer>
    </>
  );
}
```

```ts
// Specialized Sheet components
interface DrawerProps extends Omit<SheetProps, "side"> {
  placement?: "left" | "right";
}
```

## SlideOver

Props type: `SlideOverProps`

```tsx
import { SlideOver } from "@underverse-ui/underverse";

export function Example() {
  return <SlideOver />;
}
```

Vi du day du:

```tsx
import React from "react";
import { SlideOver } from "@underverse-ui/underverse";

export function Example() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Mo SlideOver
      </button>
      <SlideOver open={open} onOpenChange={setOpen} title="Thong tin">
        <div className="text-sm">Noi dung chi tiet</div>
      </SlideOver>
    </>
  );
}
```

```ts
interface SlideOverProps extends Omit<SheetProps, "side" | "variant"> {}
```

## BottomSheet

Props type: `BottomSheetProps`

```tsx
import { BottomSheet } from "@underverse-ui/underverse";

export function Example() {
  return <BottomSheet />;
}
```

Vi du day du:

```tsx
import React from "react";
import { BottomSheet } from "@underverse-ui/underverse";

export function Example() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Mo BottomSheet
      </button>
      <BottomSheet open={open} onOpenChange={setOpen} title="Lua chon">
        <div className="text-sm">Noi dung tuy chon</div>
      </BottomSheet>
    </>
  );
}
```

```ts
interface BottomSheetProps extends Omit<SheetProps, "side"> {
  snapPoints?: string[];
  defaultSnap?: number;
}
```

## SidebarSheet

Props type: `SidebarSheetProps`

```tsx
import { SidebarSheet } from "@underverse-ui/underverse";

export function Example() {
  return <SidebarSheet />;
}
```

Vi du day du:

```tsx
import React from "react";
import { SidebarSheet } from "@underverse-ui/underverse";

export function Example() {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Mo Sidebar
      </button>
      <SidebarSheet open={open} onOpenChange={setOpen} title="Menu">
        <div className="text-sm">Noi dung menu</div>
      </SidebarSheet>
    </>
  );
}
```

```ts
interface SidebarSheetProps extends Omit<SheetProps, "side" | "variant"> {
  navigation?: React.ReactNode;
}
```
