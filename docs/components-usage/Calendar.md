# Calendar

Source: `components/ui/Calendar.tsx`

Exports:
- Calendar

Note: Usage snippets are minimal; fill required props from the props type below.

## Calendar

Props type: `CalendarProps`

```tsx
import { Calendar } from "@underverse-ui/underverse";

export function Example() {
  return <Calendar />;
}
```

Vi du day du:

```tsx
import React from "react";
import { Calendar } from "@underverse-ui/underverse";

export function Example() {
  return (
    <Calendar
      variant={"default"}
      size={"md"}
     />
  );
}
```

```ts
export interface CalendarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'value' | 'onSelect'> {
  month?: Date; // visible month
  defaultMonth?: Date;
  onMonthChange?: (next: Date) => void;
  value?: Date | Date[] | { start?: Date; end?: Date };
  defaultValue?: Date | Date[] | { start?: Date; end?: Date };
  onSelect?: (value: Date | Date[] | { start?: Date; end?: Date }) => void;
  selectMode?: SelectMode;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sun
  showWeekdays?: boolean;
  showHeader?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: Variant;
  events?: CalendarEvent[];
  renderDay?: (args: { date: Date; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean; events: CalendarEvent[] }) => React.ReactNode;
  labels?: { weekdays?: string[]; month?: (date: Date) => string; prev?: string; next?: string; today?: string; clear?: string };
  /** Display mode: month grid, single week, or year */
  display?: DisplayMode;
  /** Number of months to render side-by-side (month mode only) */
  months?: number;
  /** Show "Today" button */
  showToday?: boolean;
  /** Show "Clear" button */
  showClear?: boolean;
  /** Minimum selectable date */
  minDate?: Date;
  /** Maximum selectable date */
  maxDate?: Date;
  /** Disabled dates */
  disabledDates?: Date[] | ((date: Date) => boolean);
  /** Dense mode with less padding */
  dense?: boolean;
  /** Animate transitions */
  animate?: boolean;
  /** Show event badges */
  showEventBadges?: boolean;
  /** Highlight weekends */
  highlightWeekends?: boolean;
}
```
