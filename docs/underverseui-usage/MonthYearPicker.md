# MonthYearPicker

Source: `components/ui/MonthYearPicker.tsx`

Exports:

- MonthYearPicker

A professional month/year picker with smooth wheel column selection, similar to TimePicker.

## Basic Usage

```tsx
import { MonthYearPicker } from "@underverse-ui/underverse";

export function Example() {
  return <MonthYearPicker placeholder="Select month/year" />;
}
```

## Controlled

```tsx
import React from "react";
import { MonthYearPicker } from "@underverse-ui/underverse";

export function Example() {
  const [value, setValue] = React.useState({ month: 0, year: 2026 });

  return <MonthYearPicker value={value} onChange={(v) => v && setValue({ month: v.month, year: v.year })} />;
}
```

## With Date Value

```tsx
import React from "react";
import { MonthYearPicker } from "@underverse-ui/underverse";

export function Example() {
  const [date, setDate] = React.useState(new Date());

  return <MonthYearPicker value={date} onChange={(v) => v && setDate(v.date)} />;
}
```

## Vietnamese Month Names

```tsx
import React from "react";
import { MonthYearPicker } from "@underverse-ui/underverse";

const VIETNAMESE_MONTHS = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

const VIETNAMESE_SHORT_MONTHS = ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"];

export function Example() {
  return <MonthYearPicker monthNames={VIETNAMESE_MONTHS} shortMonthNames={VIETNAMESE_SHORT_MONTHS} columnLabels={{ month: "Tháng", year: "Năm" }} />;
}
```

## Sizes

```tsx
import { MonthYearPicker } from "@underverse-ui/underverse";

export function Example() {
  return (
    <div className="space-y-4">
      <MonthYearPicker size="sm" placeholder="Small" />
      <MonthYearPicker size="md" placeholder="Medium" />
      <MonthYearPicker size="lg" placeholder="Large" />
    </div>
  );
}
```

## With Year Range

```tsx
import { MonthYearPicker } from "@underverse-ui/underverse";

export function Example() {
  return <MonthYearPicker minYear={2020} maxYear={2030} placeholder="2020 - 2030" />;
}
```

## Inline Variant

```tsx
import { MonthYearPicker } from "@underverse-ui/underverse";

export function Example() {
  return <MonthYearPicker variant="inline" label="Select Period" />;
}
```

## With Validation

```tsx
import { MonthYearPicker } from "@underverse-ui/underverse";

export function Example() {
  return (
    <div className="space-y-4">
      <MonthYearPicker label="Start Month" error="Please select a valid month" />
      <MonthYearPicker label="End Month" success helperText="Looks good!" />
    </div>
  );
}
```

## Props

```ts
export interface MonthYearPickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "value" | "defaultValue"> {
  /** Current value as Date or {month, year} */
  value?: Date | { month: number; year: number };
  /** Default value */
  defaultValue?: Date | { month: number; year: number };
  /** Change handler */
  onChange?: (value: { month: number; year: number; date: Date } | undefined) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Label text */
  label?: string;
  /** Custom class for label */
  labelClassName?: string;
  /** Required field */
  required?: boolean;
  /** Show clear button */
  clearable?: boolean;
  /** Visual variant */
  variant?: "default" | "compact" | "inline";
  /** Match dropdown width to trigger */
  matchTriggerWidth?: boolean;
  /** Custom month names */
  monthNames?: string[];
  /** Custom short month names for display */
  shortMonthNames?: string[];
  /** Minimum year in range */
  minYear?: number;
  /** Maximum year in range */
  maxYear?: number;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Show validation error */
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
  /** Show "This Month" button */
  showThisMonth?: boolean;
  /** Column labels */
  columnLabels?: { month?: string; year?: string };
}
```
