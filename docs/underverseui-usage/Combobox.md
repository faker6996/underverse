# Combobox

Source: `components/ui/Combobox.tsx`

Exports:

- Combobox

Note: Usage snippets are minimal; fill required props from the props type below.

## Features

- **Icons & Descriptions**: Options can have icons, descriptions, and be disabled
- **Grouped Options**: Group options using `groupBy` function
- **Error & Helper Text**: Display validation errors and helper text
- **Required Validation**: `required` now participates in form validation like `Input`
- **Custom Rendering**: Use `renderOption` and `renderValue` for custom UI
- **Large Lists**: Use `virtualized`, `maxInitialOptions`, or manual search for thousands of options
- **Variants**: Four visual styles - `default`, `outline`, `ghost`, `filled`
- **Keyboard Navigation**: Full keyboard support with arrow keys, Enter, Escape

## Behavior

- Dropdown uses `Popover` internally (portal + fixed positioning + auto flip/clamp in viewport).
- Dropdown width matches the trigger by default.
- Search is enabled automatically when options > 10.
- `searchMode="manual"` disables client-side filtering and calls `onSearchChange` so callers can provide server-filtered options.
- `showSearchPromptWhenEmptyQuery` with `minSearchLength` prevents rendering options until the query is long enough.
- Flat lists can be virtualized with `virtualized`; grouped lists render normally. Virtualization is powered by `@tanstack/react-virtual`.
- Use `selectedOption` when manual/server search results do not include the currently selected value.
- When `required` is set, the component exposes required semantics, switches to the destructive state if the parent form validates before a value is selected, and clears the local required error as soon as a valid value is chosen.

## Accessibility (Web Interface Guidelines Compliant)

| Feature                          | Status |
| -------------------------------- | ------ |
| Label `htmlFor` attribute        | ✅     |
| `role="combobox"` on trigger     | ✅     |
| `aria-expanded` state            | ✅     |
| `aria-required` when required    | ✅     |
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

### Required Validation

```tsx
<form>
  <Combobox options={options} value={value} onChange={setValue} label="Fruit" required />
  <button type="submit">Submit</button>
</form>
```

If the form is validated before a value is selected, the trigger, label, and helper area switch to the destructive state. The local required error clears once the user selects a valid value.

### Large User Picker

```tsx
<Combobox
  options={users}
  value={value}
  onChange={setValue}
  virtualized
  searchMode="manual"
  onSearchChange={setQuery}
  searchDebounceMs={250}
  loading={loading}
  minSearchLength={2}
  maxInitialOptions={80}
  estimatedItemHeight={52}
  overscan={8}
  showSearchPromptWhenEmptyQuery
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
  variant?: "default" | "outline" | "ghost" | "filled";
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
  /** Selected option fallback for manual/server search when options does not contain the current value. */
  selectedOption?: ComboboxOption;
  error?: string; // Error message
  helperText?: string; // Helper text
  /** Enable OverlayScrollbars on dropdown options list. Default: true when not virtualized */
  useOverlayScrollbar?: boolean;
  /** Virtualize large flat option lists. Grouped lists fall back to normal rendering. Default: false */
  virtualized?: boolean;
  /** Estimated option row height used by virtualized rendering. Default: 44 */
  estimatedItemHeight?: number;
  /** Number of extra rows rendered above and below the visible range. Default: 8 */
  overscan?: number;
  /** Use "manual" to let callers provide server-filtered options via onSearchChange. Default: "auto" */
  searchMode?: "auto" | "manual";
  /** Called whenever the search query changes. Required for manual/server search. */
  onSearchChange?: (query: string) => void;
  /** Debounce delay for onSearchChange. Default: 0 */
  searchDebounceMs?: number;
  /** Minimum query length before showing options in manual/search-prompt mode. Default: 0 */
  minSearchLength?: number;
  /** Limit the number of rendered options before the user types a query. */
  maxInitialOptions?: number;
  /** Show a prompt instead of options while the query is shorter than minSearchLength. Default: false */
  showSearchPromptWhenEmptyQuery?: boolean;
}
```
