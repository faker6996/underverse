# TimePicker

Source: `components/ui/TimePicker.tsx`

Exports:
- TimePicker

Note: Usage snippets are minimal; fill required props from the props type below.

## Behavior

- `variant="inline"` renders content directly (no popover) and keeps a compact width (doesn’t force full-width layout).
- Time columns (hour/min/sec) use fixed widths to avoid overly wide pickers inside popovers.

## TimePicker

Props type: `TimePickerProps`

```tsx
import { TimePicker } from "@underverse-ui/underverse";

export function Example() {
  return <TimePicker />;
}
```

Vi du day du:

```tsx
import React from "react";
import { TimePicker } from "@underverse-ui/underverse";

export function Example() {
  const [value, setValue] = React.useState("");

  return (
    <TimePicker
      value={value}
      onChange={setValue}
      label={"Nhan"}
      placeholder={"Nhap..."}
      variant={"default"}
     />
  );
}
```

```ts
export interface TimePickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: string; // e.g. "14:05" or "02:05 PM"
  defaultValue?: string;
  onChange?: (value: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string;
  required?: boolean;
  format?: TimeFormat; // 24 or 12
  includeSeconds?: boolean;
  minuteStep?: number; // default 5
  secondStep?: number; // default 5
  clearable?: boolean;
  /** Visual variant of the picker */
  variant?: TimePickerVariant;
  /** Show "Now" button */
  showNow?: boolean;
  /** Show time presets (Morning, Afternoon, Evening) */
  showPresets?: boolean;
  /** Enable manual input */
  allowManualInput?: boolean;
  /** Custom presets with labels and times */
  customPresets?: Array<{ label: string; time: string }>;
  /** Minimum allowed time (e.g., "09:00") */
  minTime?: string;
  /** Maximum allowed time (e.g., "18:00") */
  maxTime?: string;
  /** Disabled times function or array */
  disabledTimes?: ((time: string) => boolean) | string[];
  /** Show validation feedback */
  error?: string;
  /** Success state */
  success?: boolean;
  /** Helper text */
  helperText?: string;
  /** Enable smooth animations */
  animate?: boolean;
  /** Callback when popover opens */
  onOpen?: () => void;
  /** Callback when popover closes */
  onClose?: () => void;
}
```
