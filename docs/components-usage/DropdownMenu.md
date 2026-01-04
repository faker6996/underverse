# DropdownMenu

Source: `components/ui/DropdownMenu.tsx`

Exports:
- DropdownMenu
- DropdownMenuItem
- DropdownMenuSeparator
- SelectDropdown

Note: Usage snippets are minimal; fill required props from the props type below.

## DropdownMenu

Props type: `DropdownMenuProps`

```tsx
import { DropdownMenu } from "@underverse-ui/underverse";

export function Example() {
  return (
    <DropdownMenu>
      Content
    </DropdownMenu>
  );
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

Props type: `DropdownMenuItemProps`

```tsx
import { DropdownMenuItem } from "@underverse-ui/underverse";

export function Example() {
  return (
    <DropdownMenuItem>
      Content
    </DropdownMenuItem>
  );
}
```

Vi du day du:

```tsx
import React from "react";
import { DropdownMenuItem } from "@underverse-ui/underverse";

export function Example() {
  return (
    <DropdownMenuItem>
      Noi dung
    </DropdownMenuItem>
  );
}
```

```ts
type DropdownMenuItemProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  className?: string;
};
```

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
  return (
    <DropdownMenuSeparator />
  );
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

  return (
    <SelectDropdown
      value={value}
      onChange={setValue}
      options={"Gia tri"}
      placeholder={"Nhap..."}
     />
  );
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
