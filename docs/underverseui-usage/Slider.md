# Slider

Source: `components/ui/Slider.tsx`

Exports:

- Slider

Note: Usage snippets are minimal; fill required props from the props type below.

## Accessibility (Web Interface Guidelines Compliant)

| Feature                                       | Status |
| --------------------------------------------- | ------ |
| Native `<input type="range">`                 | ✅     |
| Label support                                 | ✅     |
| `focus-visible` ring (optional via `noFocus`) | ✅     |
| Keyboard navigation (Arrow keys)              | ✅     |

## Slider

Props type: `SliderProps`

```tsx
import { Slider } from "@underverse-ui/underverse";

export function Example() {
  return <Slider />;
}
```

Vi du day du:

```tsx
import React from "react";
import { Slider } from "@underverse-ui/underverse";

export function Example() {
  const [value, setValue] = React.useState("");

  return <Slider value={value} onChange={setValue} label={"Nhan"} size={"md"} />;
}
```

```ts
interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "size"> {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  onValueChange?: (value: number) => void; // Alternative prop name for consistency
  onMouseUp?: () => void; // Called when mouse is released
  onTouchEnd?: () => void; // Called when touch ends
  label?: React.ReactNode;
  labelClassName?: string;
  containerClassName?: string;
  trackClassName?: string;
  thumbClassName?: string;
  showValue?: boolean;
  valueClassName?: string;
  formatValue?: (value: number) => string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  orientation?: "horizontal" | "vertical";
  noFocus?: boolean; // remove focus ring/outline styling
}
```
