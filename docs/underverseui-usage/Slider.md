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

## Range Mode (min → max)

Use `mode="range"` to allow selecting a value range with 2 thumbs:

```tsx
import React from "react";
import { Slider } from "@underverse-ui/underverse";

export function Example() {
  const [range, setRange] = React.useState<[number, number]>([20, 80]);
  return (
    <Slider
      mode="range"
      min={0}
      max={100}
      step={1}
      rangeValue={range}
      onRangeValueChange={setRange}
      label="Price range"
      showValue
      formatValue={(v) => `$${v}`}
    />
  );
}
```

Behavior notes:
- Dragging on the track chooses the nearest thumb (min/max) and moves it.
- Both thumbs are independently draggable.

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
  mode?: "single" | "range";
  value?: number;
  defaultValue?: number;
  rangeValue?: [number, number];
  defaultRangeValue?: [number, number];
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  onValueChange?: (value: number) => void; // Alternative prop name for consistency
  onRangeChange?: (value: [number, number]) => void;
  onRangeValueChange?: (value: [number, number]) => void;
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
