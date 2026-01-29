# CalendarTimeline

Source: `components/ui/CalendarTimeline/CalendarTimeline.tsx`

Exports:
- CalendarTimeline

## CalendarTimeline

Props type: `CalendarTimelineProps`

```tsx
import * as React from "react";
import { CalendarTimeline } from "@underverse-ui/underverse";

export function Example() {
  return (
    <div className="h-[520px]">
      <CalendarTimeline resources={[]} events={[]} />
    </div>
  );
}
```

Ví dụ đầy đủ (month/week/day + timezone + group/collapse + drag/resize):

```tsx
import * as React from "react";
import { CalendarTimeline, type CalendarTimelineEvent, type CalendarTimelineResource } from "@underverse-ui/underverse";

type ResourceMeta = { department?: string };
type EventMeta = { type?: "meeting" | "task" };

const resources: CalendarTimelineResource<ResourceMeta>[] = [
  { id: "r1", label: "Room A", groupId: "g1", meta: { department: "Ops" } },
  { id: "r2", label: "Room B", groupId: "g1" },
  { id: "r3", label: "Room C", groupId: "g2" },
];

const groups = [
  { id: "g1", label: "Resources A–B" },
  { id: "g2", label: "Resources C" },
];

const initialEvents: CalendarTimelineEvent<EventMeta>[] = [
  {
    id: "e1",
    resourceId: "r1",
    title: "Event 1",
    start: "2026-01-03T09:00:00Z",
    end: "2026-01-05T12:00:00Z", // end exclusive
    color: "var(--primary-soft)",
    draggable: true,
    resizable: true,
  },
];

export function Example() {
  const [events, setEvents] = React.useState(initialEvents);

  return (
    <div className="h-[520px]">
      <CalendarTimeline
        resources={resources}
        groups={groups}
        events={events}
        size="md" // "sm" | "md" | "xl"
        defaultView="month"
        weekStartsOn={1}
        // locale/timeZone automatically follow the app/user settings by default
        interactions={{ creatable: true, draggableEvents: true, resizableEvents: true }}
        onCreateEvent={(draft) => {
          setEvents((prev) => [
            ...prev,
            { id: `e_${prev.length + 1}`, resourceId: draft.resourceId, start: draft.start, end: draft.end, title: "New event" },
          ]);
        }}
        onEventMove={({ eventId, resourceId, start, end }) => {
          setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, resourceId, start, end } : e)));
        }}
        onEventResize={({ eventId, start, end }) => {
          setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, start, end } : e)));
        }}
      />
    </div>
  );
}
```

```ts
export type CalendarTimelineView = "month" | "week" | "day";
export type CalendarTimelineDateInput = Date | string | number;

export interface CalendarTimelineGroup {
  id: string;
  label: React.ReactNode;
  collapsible?: boolean;
}

export interface CalendarTimelineResource<TMeta = unknown> {
  id: string;
  label: React.ReactNode;
  groupId?: string;
  meta?: TMeta;
  disabled?: boolean;
}

export interface CalendarTimelineEvent<TMeta = unknown> {
  id: string;
  resourceId: string;
  start: CalendarTimelineDateInput;
  end: CalendarTimelineDateInput; // end is exclusive
  title?: React.ReactNode;
  color?: string;
  className?: string;
  meta?: TMeta;
  draggable?: boolean;
  resizable?: boolean;
}

export interface CalendarTimelineProps<TResourceMeta = unknown, TEventMeta = unknown>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  resources: CalendarTimelineResource<TResourceMeta>[];
  events: CalendarTimelineEvent<TEventMeta>[];

  view?: CalendarTimelineView;
  defaultView?: CalendarTimelineView;
  onViewChange?: (view: CalendarTimelineView) => void;

  date?: Date;
  defaultDate?: Date;
  onDateChange?: (date: Date) => void;

  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  locale?: string;
  timeZone?: string;

  groups?: CalendarTimelineGroup[];
  groupCollapsed?: Record<string, boolean>;
  defaultGroupCollapsed?: Record<string, boolean>;
  onGroupCollapsedChange?: (next: Record<string, boolean>) => void;

  resourceColumnWidth?: number | string;
  rowHeight?: number;
  slotMinWidth?: number;
  dayTimeStepMinutes?: number;
  maxLanesPerRow?: number;
  now?: Date;

  interactions?: {
    selectable?: boolean;
    creatable?: boolean;
    draggableEvents?: boolean;
    resizableEvents?: boolean;
  };

  onCreateEvent?: (draft: { resourceId: string; start: Date; end: Date }) => void;
  onEventMove?: (args: { eventId: string; resourceId: string; start: Date; end: Date }) => void;
  onEventResize?: (args: { eventId: string; start: Date; end: Date }) => void;
}
```
