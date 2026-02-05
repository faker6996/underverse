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
  return <Calendar variant={"default"} size={"md"} />;
}
```

### Events mode (large cells)

```tsx
import React from "react";
import { Calendar } from "@underverse-ui/underverse";

export function Example() {
  const events = [
    { id: "a", date: new Date(), title: "Today", color: "#f59e0b", badge: "1" },
    { id: "b", date: new Date(), title: "Standup", color: "#3b82f6", badge: "15m" },
  ];

  return (
    <Calendar
      size="lg"
      cellMode="events"
      events={events}
      maxEventsPerDay={3}
      showEventBadges
      highlightWeekends
      enableEventSheet
      onEventClick={(event) => console.log(event)}
    />
  );
}
```

```ts
export interface CalendarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "value" | "onSelect"> {
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
  /** Render mode for each day cell (compact dots vs large cell with event list) */
  cellMode?: "compact" | "events";
  /** Max events shown per day (events cell mode) */
  maxEventsPerDay?: number;
  /** Show the event count badge in day cell header (events cell mode). Default: true */
  showEventCount?: boolean;
  /** Fired when clicking an event in a day cell (events cell mode) */
  onEventClick?: (event: CalendarEvent, date: Date) => void;
  /** Customize event rendering (events cell mode) */
  renderEvent?: (args: { event: CalendarEvent; date: Date }) => React.ReactNode;
  /** Open a right-side Sheet when clicking an event */
  enableEventSheet?: boolean;
  /** Sheet size (right side) */
  eventSheetSize?: "sm" | "md" | "lg" | "xl" | "full";
  /** Custom sheet content renderer */
  renderEventSheet?: (args: { event: CalendarEvent; date: Date; close: () => void }) => React.ReactNode;
  /** Controlled selected event id (recommended to provide `event.id`) */
  selectedEventId?: string | number;
  /** Controlled open state for the event sheet */
  eventSheetOpen?: boolean;
  /** Controlled open state handler */
  onEventSheetOpenChange?: (open: boolean) => void;
  /** Controlled selected event handler */
  onSelectedEventIdChange?: (id: string | number | undefined) => void;
}
```
