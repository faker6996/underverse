# DatePicker

Source: `components/ui/DatePicker.tsx`

Exports:
- DatePicker
- DateRangePicker

Note: Usage snippets are minimal; fill required props from the props type below.

## DatePicker

Props type: `DatePickerProps`

```tsx
import { DatePicker } from "@underverse-ui/underverse";

export function Example() {
  return <DatePicker />;
}
```

Vi du day du:

```tsx
import React from "react";
import { DatePicker } from "@underverse-ui/underverse";

export function Example() {
  const [date, setDate] = React.useState();
  return (
    <DatePicker
      value={date}
      onChange={setDate}
      label="Ngay giao"
      placeholder="Chon ngay"
    />
  );
}
```

```ts
export interface DatePickerProps {
  id?: string;
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  label?: string;
  required?: boolean;
  todayLabel?: string;
  clearLabel?: string;
  weekdayLabels?: string[];
}
```

## DateRangePicker

Props type: `DateRangePickerProps`

```tsx
import { DateRangePicker } from "@underverse-ui/underverse";

export function Example() {
  return <DateRangePicker />;
}
```

Vi du day du:

```tsx
import React from "react";
import { DateRangePicker } from "@underverse-ui/underverse";

export function Example() {
  const [range, setRange] = React.useState({ start: undefined, end: undefined });
  return (
    <DateRangePicker
      value={range}
      onChange={setRange}
      label="Khoang ngay"
      placeholder="Chon khoang"
    />
  );
}
```

```ts
type DateRangePickerProps = {
  startDate?: Date;
  endDate?: Date;
  onChange: (start: Date, end: Date) => void;
  placeholder?: string;
  className?: string;
};
```
