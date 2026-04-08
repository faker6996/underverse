# MultiCombobox

Source: `components/ui/MultiCombobox.tsx`

Exports:

- MultiCombobox

Note: Usage snippets are minimal; fill required props from the props type below.

## Features

- **Icons & Descriptions**: Options can have icons, descriptions, and be disabled
- **Grouped Options**: Group options using `groupBy` function
- **Error & Helper Text**: Display validation errors and helper text
- **Required Validation**: `required` now participates in form validation like `Input`
- **Custom Rendering**: Use `renderOption` and `renderTag` for custom UI
- **Variants**: Three visual styles - `default`, `outline`, `ghost`
- **Tag Limit**: Control visible tags with `maxTagsVisible`
- **Checkbox Indicators**: Visual checkbox-style selection indicators
- **Keyboard Navigation**: Full keyboard support

## Behavior

- Dropdown uses `Popover` internally (portal + fixed positioning + auto flip/clamp in viewport).
- Dropdown width matches the trigger by default.
- Search is enabled automatically when options > 10.
- Header shows selected count and max limit.
- When `required` is set, the component exposes required semantics, switches to the destructive state if the parent form validates before any value is selected, and clears the local required error as soon as at least one valid value is chosen.

## Accessibility

| Feature                       | Status |
| ----------------------------- | ------ |
| `role="combobox"` on trigger  | ✅     |
| `role="listbox"` on dropdown  | ✅     |
| `aria-multiselectable="true"` | ✅     |
| `aria-expanded` state         | ✅     |
| `aria-required` when required | ✅     |
| `aria-invalid` for errors     | ✅     |
| Keyboard navigation           | ✅     |
| Screen reader labels          | ✅     |

## MultiCombobox

Props type: `MultiComboboxProps`

### Basic Usage

```tsx
import { MultiCombobox } from "@underverse-ui/underverse";

export function Example() {
  const [value, setValue] = React.useState<string[]>([]);
  return <MultiCombobox options={["A", "B", "C"]} value={value} onChange={setValue} label="Select" />;
}
```

### With Icons & Descriptions

```tsx
import { Sparkles, Zap, Palette } from "lucide-react";

const options = [
  { value: "react", label: "React", icon: <Sparkles />, description: "UI Library" },
  { value: "next", label: "Next.js", icon: <Zap />, description: "Framework" },
  { value: "tailwind", label: "Tailwind", icon: <Palette />, description: "CSS", disabled: true },
];

<MultiCombobox options={options} value={value} onChange={setValue} showSelectedIcons />;
```

### Grouped Options

```tsx
const options = [
  { value: "react", label: "React", group: "Frontend" },
  { value: "vue", label: "Vue.js", group: "Frontend" },
  { value: "node", label: "Node.js", group: "Backend" },
  { value: "postgres", label: "PostgreSQL", group: "Database" },
];

<MultiCombobox options={options} value={value} onChange={setValue} groupBy={(opt) => opt.group || ""} />;
```

### With Error State

```tsx
<MultiCombobox
  options={options}
  value={value}
  onChange={setValue}
  error={value.length === 0 ? "Select at least one" : undefined}
  helperText="This field is required"
/>
```

### Required Validation

```tsx
<form>
  <MultiCombobox options={options} value={value} onChange={setValue} label="Technologies" required />
  <button type="submit">Submit</button>
</form>
```

If the form is validated before at least one item is selected, the trigger, label, and helper area switch to the destructive state. The local required error clears once the user selects a valid value.

### Limited Tags Display

```tsx
<MultiCombobox
  options={options}
  value={value}
  onChange={setValue}
  maxTagsVisible={3} // Show max 3 tags, rest as "+N more"
  maxSelected={5} // Allow max 5 selections
/>
```

## Option Type

```ts
export interface MultiComboboxOption {
  value: string;
  label: string;
  icon?: React.ReactNode; // Icon to display
  description?: string; // Description text
  disabled?: boolean; // Disable this option
  group?: string; // Group name for grouping
}
```

## Props

```ts
export interface MultiComboboxProps {
  id?: string;
  options: Array<string | MultiComboboxOption>;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  maxSelected?: number;
  disabledOptions?: string[];
  showTags?: boolean;
  showClear?: boolean;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "ghost";
  label?: string;
  labelClassName?: string;
  title?: string;
  required?: boolean;
  displayFormat?: (option: MultiComboboxOption) => string;
  loading?: boolean;
  loadingText?: string;
  emptyText?: string;
  // New props
  showSelectedIcons?: boolean; // Show icons in tags
  maxHeight?: number; // Max dropdown height (default: 280)
  groupBy?: (option: MultiComboboxOption) => string; // Group options
  renderOption?: (option: MultiComboboxOption, isSelected: boolean) => React.ReactNode;
  renderTag?: (option: MultiComboboxOption, onRemove: () => void) => React.ReactNode;
  error?: string; // Error message
  helperText?: string; // Helper text
  maxTagsVisible?: number; // Max visible tags (default: 3)
  /** Enable OverlayScrollbars on dropdown options list. Default: false */
  useOverlayScrollbar?: boolean;
}
```
