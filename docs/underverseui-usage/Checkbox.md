# Checkbox

Source: `components/ui/CheckBox.tsx`

Exports:

- Checkbox

Note: Usage snippets are minimal; fill required props from the props type below.

## Accessibility (Web Interface Guidelines Compliant)

| Feature                          | Status |
| -------------------------------- | ------ |
| Native `<input type="checkbox">` | ✅     |
| Label wraps control              | ✅     |
| `focus-visible` ring             | ✅     |
| Disabled state styling           | ✅     |

## Checkbox

Props type: `CheckboxProps`

```tsx
import { Checkbox } from "@underverse-ui/underverse";

export function Example() {
  return <Checkbox />;
}
```

Vi du day du:

```tsx
import React from "react";
import { Checkbox } from "@underverse-ui/underverse";

export function Example() {
  return <Checkbox label={"Nhan"} />;
}
```

```ts
export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  labelClassName?: string;
  containerClassName?: string;
}
```
