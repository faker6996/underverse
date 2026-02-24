# Combobox

Source: `components/ui/Combobox.tsx`

Exports:

- Combobox

Note: Usage snippets are minimal; fill required props from the props type below.

## Features

- **Icons & Descriptions**: Options can have icons, descriptions, and be disabled
- **Grouped Options**: Group options using `groupBy` function
- **Error & Helper Text**: Display validation errors and helper text
- **Custom Rendering**: Use `renderOption` and `renderValue` for custom UI
- **Variants**: Three visual styles - `default`, `outline`, `ghost`
- **Keyboard Navigation**: Full keyboard support with arrow keys, Enter, Escape

## Behavior

- Dropdown uses `Popover` internally (portal + fixed positioning + auto flip/clamp in viewport).
- Dropdown width matches the trigger by default.
- Search is enabled automatically when options > 10

## Accessibility (Web Interface Guidelines Compliant)

| Feature                          | Status |
| -------------------------------- | ------ |
| Label `htmlFor` attribute        | ✅     |
| `role="combobox"` on trigger     | ✅     |
| `role="listbox"` on dropdown     | ✅     |
| `aria-expanded` state            | ✅     |
| `aria-invalid` for errors        | ✅     |
| Keyboard navigation (Arrow keys) | ✅     |
| ESC to close                     | ✅     |
| `focus-visible` ring             | ✅     |

## Combobox

Props type: `ComboboxProps`

### Basic Usage

```tsx
import { Combobox } from "@underverse-ui/underverse";

export function Example() {
  const [value, setValue] = React.useState<string | null>(null);
  return <Combobox options={["A", "B", "C"]} value={value} onChange={setValue} label="Select" />;
}
```

### With Icons & Descriptions

```tsx
import { Apple, Banana, Cherry } from "lucide-react";

const options = [
  { label: "Apple", value: "apple", icon: <Apple />, description: "Fresh and crispy" },
  { label: "Banana", value: "banana", icon: <Banana />, description: "Rich in potassium" },
  { label: "Cherry", value: "cherry", icon: <Cherry />, description: "Sweet and tangy", disabled: true },
];

<Combobox options={options} value={value} onChange={setValue} showSelectedIcon />;
```

### Grouped Options

```tsx
const options = [
  { label: "Profile", value: "profile", group: "Account" },
  { label: "Security", value: "security", group: "Account" },
  { label: "Notifications", value: "notifications", group: "Preferences" },
];

<Combobox options={options} value={value} onChange={setValue} groupBy={(opt) => opt.group || ""} />;
```

### With Error State

```tsx
<Combobox
  options={options}
  value={value}
  onChange={setValue}
  error={!value ? "Please select an option" : undefined}
  helperText="This field is required"
/>
```

## Option Type

```ts
export type ComboboxOption =
  | string
  | {
      label: string;
      value: any;
      icon?: React.ReactNode; // Icon to display
      description?: string; // Description text
      disabled?: boolean; // Disable this option
      group?: string; // Group name for grouping
    };
```

## Props

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
  labelClassName?: string;
  required?: boolean;
  fontBold?: boolean;
  loading?: boolean;
  loadingText?: string;
  // New props
  showSelectedIcon?: boolean; // Show icon in trigger
  maxHeight?: number; // Max dropdown height (default: 280)
  groupBy?: (option: ComboboxOption) => string; // Group options
  renderOption?: (option: ComboboxOption, isSelected: boolean) => React.ReactNode;
  renderValue?: (option: ComboboxOption) => React.ReactNode;
  error?: string; // Error message
  helperText?: string; // Helper text
  /** Enable OverlayScrollbars on dropdown options list. Default: false */
  useOverlayScrollbar?: boolean;
}
```
