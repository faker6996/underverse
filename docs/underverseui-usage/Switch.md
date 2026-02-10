# Switch

Source: `components/ui/Switch.tsx`

Exports:

- Switch

Note: Usage snippets are minimal; fill required props from the props type below.

## Accessibility (Web Interface Guidelines Compliant)

| Feature                                 | Status |
| --------------------------------------- | ------ |
| Native `<input type="checkbox">`        | ✅     |
| `peer-focus-visible` ring               | ✅     |
| Label wraps control (single hit target) | ✅     |
| Disabled state styling                  | ✅     |

## Switch

Props type: `SwitchProps`

```tsx
import { Switch } from "@underverse-ui/underverse";

export function Example() {
  return <Switch />;
}
```

Vi du day du:

```tsx
import React from "react";
import { Switch } from "@underverse-ui/underverse";

export function Example() {
  const [checked, setChecked] = React.useState(false);

  return <Switch checked={checked} onCheckedChange={setChecked} label={"Nhan"} variant={"default"} size={"md"} />;
}
```

```ts
interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  labelClassName?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "success" | "warning" | "danger";
  disabled?: boolean;
}
```
