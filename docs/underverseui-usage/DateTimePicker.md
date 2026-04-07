# DateTimePicker

Source: `components/ui/DateTimePicker.tsx`

Combines a DatePicker and TimePicker into a single popover for selecting both date and time.

Exports:

- DateTimePicker

## Behavior

- Uses `Popover` internally (portal + fixed positioning).
- Popover auto-adjusts to stay within the viewport; on small screens it may scroll instead of overflowing.
- Calendar and time columns are kept compact to avoid overly wide popovers.
- `required` now participates in form validation for the trigger, similar to `Input`.

## Accessibility

| Feature                       | Status |
| ----------------------------- | ------ |
| Label association             | ✅     |
| `aria-required` when required | ✅     |
| `aria-invalid` for errors     | ✅     |
| ESC to close popover          | ✅     |
| `focus-visible` ring          | ✅     |

## DateTimePicker

Props type: `DateTimePickerProps`

```tsx
import { DateTimePicker } from "@underverse-ui/underverse";
import { useState } from "react";

export function Example() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return <DateTimePicker value={date} onChange={setDate} label="Schedule Meeting" />;
}
```

### Required Validation

```tsx
<form>
  <DateTimePicker value={date} onChange={setDate} label="Appointment" required />
  <button type="submit">Submit</button>
</form>
```

If the form is validated before a date-time is selected, the trigger and label switch to the destructive state and the local required error is shown below the field.

```ts
export interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  /** 12 or 24 hour format */
  format?: "12" | "24";
  includeSeconds?: boolean;
  label?: string;
  labelClassName?: string;
  required?: boolean;
  /** Label for the "Done" button */
  doneLabel?: string;
  /** Label for the "Clear" button */
  clearLabel?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}
```
