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
| ARIA labels for range mode                    | ✅     |

## Slider

Props type: `SliderProps`

A modern, premium slider component with **interactive tooltips**, **gradient fills**, and smooth animations. Perfect for value selection, range inputs, and settings controls.

### ✨ Key Features

- **Interactive Tooltips**: Hover/drag to see current value (enabled by default)
- **Premium Gradients**: Beautiful gradient fills on progress tracks
- **Smooth Animations**: Buttery smooth interactions with scale effects
- **Range Mode**: Dual-thumb range selection with independent tooltips
- **Size Variants**: Small, medium, and large options
- **Custom Formatting**: Format displayed values (e.g., currency, temperature)

### Basic Usage

```tsx
import { Slider } from "@underverse-ui/underverse";

export function Example() {
  return <Slider />;
}
```

### With Tooltip (Default Behavior)

```tsx
import React from "react";
import { Slider } from "@underverse-ui/underverse";

export function Example() {
  const [value, setValue] = React.useState(50);

  return <Slider value={value} onValueChange={setValue} label="Volume" showValue />;
}
```

### Without Tooltip

```tsx
<Slider value={value} onValueChange={setValue} showTooltip={false} label="No Tooltip" />
```

### Gradient vs Solid Fill

```tsx
{
  /* With gradient (default) */
}
<Slider value={value} onValueChange={setValue} />;

{
  /* Solid color fill */
}
<Slider value={value} onValueChange={setValue} useGradient={false} />;
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
- Each thumb displays its own tooltip when hovered/dragged.

## Custom Value Formatting

```tsx
<Slider value={temperature} onValueChange={setTemperature} min={-20} max={40} label="Temperature" showValue formatValue={(val) => `${val}°C`} />
```

## Size Variants

```tsx
<Slider size="sm" label="Small" />
<Slider size="md" label="Medium" />
<Slider size="lg" label="Large" />
```

## Full Example

```tsx
import React from "react";
import { Slider } from "@underverse-ui/underverse";

export function Example() {
  const [value, setValue] = React.useState(50);

  return (
    <Slider
      value={value}
      onChange={setValue}
      label="Brightness"
      size="md"
      min={0}
      max={100}
      step={5}
      showValue
      showTooltip={true}
      useGradient={true}
    />
  );
}
```

## Props Interface

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

  // ✨ New Props
  showTooltip?: boolean; // Show tooltip on hover/drag (default: true)
  tooltipClassName?: string; // Custom tooltip styling
  useGradient?: boolean; // Use gradient fill for progress (default: true)
}
```

## Visual Enhancements (v2.0)

The Slider component has been upgraded with premium UI/UX features:

- **Interactive Tooltips**: Automatically displays current value when hovering or dragging
- **Gradient Fills**: Beautiful gradient effects on progress tracks for a modern look
- **Enhanced Shadows**: Premium shadow and glow effects on thumbs
- **Smooth Transitions**: All interactions have refined 200ms transitions
- **Scale Effects**: Thumbs scale on hover (110%) and active (105%) states
- **Better Disabled State**: Improved visual feedback when disabled
