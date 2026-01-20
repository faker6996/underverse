# MultiCombobox

Source: `components/ui/MultiCombobox.tsx`

Exports:
- MultiCombobox

Note: Usage snippets are minimal; fill required props from the props type below.

## Behavior

- Dropdown uses `Popover` internally (portal + fixed positioning + auto flip/clamp in viewport).
- Dropdown width matches the trigger by default.

## MultiCombobox

Props type: `MultiComboboxProps`

```tsx
import { MultiCombobox } from "@underverse-ui/underverse";

export function Example() {
  return <MultiCombobox value={[]} onChange={() => {}} options={[]} />;
}
```

Vi du day du:

```tsx
import React from "react";
import { MultiCombobox } from "@underverse-ui/underverse";

export function Example() {
  const [value, setValue] = React.useState<string[]>([]);

  return (
    <MultiCombobox
      value={value}
      onChange={setValue}
      options={["Gia tri"]}
      label={"Nhan"}
      placeholder={"Nhap..."}
     />
  );
}
```

```ts
export interface MultiComboboxProps {
  id?: string;
  options: Array<string | MultiComboboxOption>;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  maxSelected?: number;
  disabledOptions?: string[];
  showTags?: boolean;
  showClear?: boolean;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string;
  title?: string;
  required?: boolean;
  displayFormat?: (option: MultiComboboxOption) => string;
  loading?: boolean;
  loadingText?: string;
  emptyText?: string;
}
```
