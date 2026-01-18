# Combobox

Source: `components/ui/Combobox.tsx`

Exports:

- Combobox

Note: Usage snippets are minimal; fill required props from the props type below.

## Accessibility (Web Interface Guidelines Compliant)

| Feature                          | Status |
| -------------------------------- | ------ |
| Label `htmlFor` attribute        | ✅     |
| `role="combobox"` on trigger     | ✅     |
| `role="listbox"` on dropdown     | ✅     |
| `aria-expanded` state            | ✅     |
| Keyboard navigation (Arrow keys) | ✅     |
| ESC to close                     | ✅     |
| `focus-visible` ring             | ✅     |

## Combobox

Props type: `ComboboxProps`

```tsx
import { Combobox } from "@underverse-ui/underverse";

export function Example() {
  return <Combobox />;
}
```

Vi du day du:

```tsx
import React from "react";
import { Combobox } from "@underverse-ui/underverse";

export function Example() {
  const [value, setValue] = React.useState("");

  return <Combobox value={value} onChange={setValue} options={undefined} label={"Nhan"} placeholder={"Nhap..."} />;
}
```

```ts
export interface ComboboxProps {
  id?: string;
  options: ComboboxOption[];
  value?: any;
  onChange: (value: any) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
  allowClear?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
  usePortal?: boolean;
  label?: string;
  required?: boolean;
  fontBold?: boolean;
  loading?: boolean;
  loadingText?: string;
}
```
