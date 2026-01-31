# TimePicker

Source: `components/ui/TimePicker.tsx`

Exports:
- TimePicker

Note: Usage snippets are minimal; fill required props from the props type below.

## Behavior

- `variant="inline"` renders content directly (no popover) and keeps a compact width (doesn’t force full-width layout).
- Popover dropdown width matches the trigger by default (`matchTriggerWidth=true`). Set `matchTriggerWidth={false}` to use the component’s default fixed dropdown widths.
- `size` scales the trigger and the dropdown content (typography, paddings, wheel sizes).
- Time range constraints: use `minTime`/`maxTime` or the aliases `min`/`max` (same format).
- The wheel is circular (wraps around). You can change values via:
  - Mouse wheel/trackpad scroll
  - Click a value
  - Click-and-drag inside a column (mouse)
  - Keyboard navigation (Arrow keys, Home/End, PageUp/PageDown)

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
      matchTriggerWidth
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
  minuteStep?: number; // default 1
  secondStep?: number; // default 1
  clearable?: boolean;
  /** Visual variant of the picker */
  variant?: TimePickerVariant;
  /** Match dropdown width to trigger width */
  matchTriggerWidth?: boolean;
  /** Show "Now" button */
  showNow?: boolean;
  /** Show time presets (Morning, Afternoon, Evening) */
  showPresets?: boolean;
  /** Enable manual input */
  allowManualInput?: boolean;
  /** Custom presets with labels and times */
  customPresets?: Array<{ label: string; time: string }>;
  /** Alias for minTime (e.g., "09:00") */
  min?: string;
  /** Alias for maxTime (e.g., "18:00") */
  max?: string;
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

## Usage Recipes

Match dropdown to trigger (default):

```tsx
<TimePicker matchTriggerWidth />
```

Use fixed dropdown width (ignores trigger width):

```tsx
<TimePicker matchTriggerWidth={false} />
```

Compact trigger + full-featured panel:

```tsx
<TimePicker variant="compact" showNow showPresets allowManualInput />
```

Small UI (compact layouts):

```tsx
<TimePicker size="sm" />
```

Restrict selectable time range:

```tsx
<TimePicker min="09:00" max="18:00" />
```
