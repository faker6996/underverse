# ColorPicker

Source: `components/ui/ColorPicker.tsx`

Exports:
- ColorPicker

Note: Usage snippets are minimal; fill required props from the props type below.

## ColorPicker

Props type: `ColorPickerProps`

```tsx
import { ColorPicker } from "@underverse-ui/underverse";

export function Example() {
  return <ColorPicker />;
}
```

Vi du day du:

```tsx
import React from "react";
import { ColorPicker } from "@underverse-ui/underverse";

export function Example() {
  const [value, setValue] = React.useState("");

  return (
    <ColorPicker
      value={value}
      onChange={setValue}
      variant={"default"}
      size={"md"}
     />
  );
}
```

```ts
export interface ColorPickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  withAlpha?: boolean;
  format?: OutputFormat;
  presets?: string[];
  /** Class for the trigger button */
  triggerClassName?: string;
  /** Class for the popover content panel */
  contentClassName?: string;
  /** Show a clear button to reset to empty */
  clearable?: boolean;
  /** Show copy to clipboard button */
  copyable?: boolean;
  /** Size variant of the picker */
  size?: ColorPickerSize;
  /** Visual variant of the picker */
  variant?: ColorPickerVariant;
  /** Show recent colors history */
  showRecent?: boolean;
  /** Show color harmony suggestions */
  showHarmony?: boolean;
  /** Max recent colors to remember */
  maxRecent?: number;
}
```
