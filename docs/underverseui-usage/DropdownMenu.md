# DropdownMenu

Source: `components/ui/DropdownMenu.tsx`

Exports:

- DropdownMenu
- DropdownMenuItem
- DropdownMenuSeparator
- SelectDropdown

Note: Usage snippets are minimal; fill required props from the props type below.

## Behavior

- Dropdown uses `Popover` internally (portal + fixed positioning + auto flip/clamp in viewport).
- Closes on outside click and `Escape` (handled by `Popover`).

## Accessibility (Web Interface Guidelines Compliant)

| Feature                          | Status |
| -------------------------------- | ------ |
| `role="menu"` on dropdown        | ✅     |
| `role="menuitem"` on items       | ✅     |
| Keyboard navigation (Arrow keys) | ✅     |
| ESC to close                     | ✅     |
| `focus-visible` ring             | ✅     |
| Portal rendering                 | ✅     |

## DropdownMenu

Props type: `DropdownMenuProps`

```tsx
import { DropdownMenu } from "@underverse-ui/underverse";

export function Example() {
  return <DropdownMenu trigger={<button type="button">Open</button>} />;
}
```

Vi du day du:

```tsx
import React from "react";
import { DropdownMenu } from "@underverse-ui/underverse";

export function Example() {
  return (
    <DropdownMenu
      trigger={<button type="button">Hanh dong</button>}
      items={[
        { label: "Sua", onClick: () => {} },
        { label: "Xoa", onClick: () => {}, destructive: true },
      ]}
    />
  );
}
```

```ts
interface DropdownMenuProps {
  trigger: React.ReactElement;
  children?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  placement?: "top" | "bottom" | "left" | "right" | "top-start" | "bottom-start" | "top-end" | "bottom-end";
  closeOnSelect?: boolean;
  disabled?: boolean;
  // Alternative API props
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  items?: Array<{
    label: string;
    icon?: React.ComponentType<any>;
    onClick: () => void;
    disabled?: boolean;
    destructive?: boolean;
  }>;
}
```

## DropdownMenuItem

Enhanced menu item with support for icons, labels, descriptions, active state, and keyboard shortcuts.

Props type: `DropdownMenuItemProps`

```tsx
import { DropdownMenuItem } from "@underverse-ui/underverse";
import { Edit, Trash2 } from "lucide-react";

export function Example() {
  return (
    <>
      <DropdownMenuItem icon={Edit} label="Edit" description="Modify this item" shortcut="Ctrl+E" onClick={() => console.log("edit")} />
      <DropdownMenuItem icon={Trash2} label="Delete" destructive onClick={() => console.log("delete")} />
      <DropdownMenuItem active label="Selected option" />
    </>
  );
}
```

```ts
interface DropdownMenuItemProps {
  children?: React.ReactNode;
  label?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  active?: boolean;
  shortcut?: string;
  className?: string;
}
```

### DropdownMenuItem Features

| Feature       | Description                               |
| ------------- | ----------------------------------------- |
| `icon`        | Left-aligned icon component               |
| `label`       | Primary text                              |
| `description` | Secondary description text                |
| `active`      | Shows checkmark and primary color styling |
| `shortcut`    | Right-aligned keyboard shortcut hint      |
| `destructive` | Red styling for dangerous actions         |

## DropdownMenuSeparator

Props type: `DropdownMenuSeparatorProps`

```tsx
import { DropdownMenuSeparator } from "@underverse-ui/underverse";

export function Example() {
  return <DropdownMenuSeparator />;
}
```

Vi du day du:

```tsx
import React from "react";
import { DropdownMenuSeparator } from "@underverse-ui/underverse";

export function Example() {
  return <DropdownMenuSeparator />;
}
```

```ts
type DropdownMenuSeparatorProps = { className?: string };
```

## SelectDropdown

Props type: `SelectDropdownProps`

```tsx
import { SelectDropdown } from "@underverse-ui/underverse";

export function Example() {
  return <SelectDropdown />;
}
```

Vi du day du:

```tsx
import React from "react";
import { SelectDropdown } from "@underverse-ui/underverse";

export function Example() {
  const [value, setValue] = React.useState("");

  return <SelectDropdown value={value} onChange={setValue} options={"Gia tri"} placeholder={"Nhap..."} />;
}
```

```ts
type SelectDropdownProps = {
  options: string[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};
```
