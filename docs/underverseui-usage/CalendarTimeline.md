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
    <div>
      <CalendarTimeline resources={[]} events={[]} />
    </div>
  );
}
```

Ví dụ đầy đủ (month/week/day + timezone + group/collapse + drag/resize + resize layout):

> Lưu ý: `export function Example()` trong file `.md` chỉ là snippet minh hoạ để bạn copy/paste, không có gì “cố định” trong component.

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
  const [resourceColumnWidth, setResourceColumnWidth] = React.useState(240);
  const [rowHeights, setRowHeights] = React.useState<Record<string, number>>({});

  return (
    <div>
      <CalendarTimeline
        resources={resources}
        groups={groups}
        events={events}
        size="md" // "sm" | "md" | "xl"
        enableLayoutResize
        resourceColumnWidth={resourceColumnWidth}
        onResourceColumnWidthChange={setResourceColumnWidth}
        rowHeights={rowHeights}
        onRowHeightsChange={setRowHeights}
        enableEventSheet
        eventSheetSize="md" // "sm" | "md" | "lg" | "xl" | "full"
        defaultView="month"
        weekStartsOn={1}
        // locale/timeZone automatically follow the app/user settings by default
        // Hover an event to see a tooltip, click to open the sheet.
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

## Event Sheet

Clicking an event can open a right-side sheet. Provide `renderEventSheet` to customize content.

```tsx
<CalendarTimeline
  resources={resources}
  events={events}
  enableEventSheet
  eventSheetSize="lg"
  renderEventSheet={({ event, resource, close }) => (
    <div className="space-y-3">
      <div className="text-sm font-semibold">{event.title ?? event.id}</div>
      {resource?.label ? <div className="text-xs text-muted-foreground">{resource.label}</div> : null}
      <button type="button" onClick={close}>
        Close
      </button>
    </div>
  )}
/>
```

```ts
export type CalendarTimelineView = "month" | "week" | "day";
export type CalendarTimelineDateInput = Date | string | number;
export type CalendarTimelineSize = "sm" | "md" | "xl";
export type CalendarTimelineSheetSize = "sm" | "md" | "lg" | "xl" | "full";

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

export interface CalendarTimelineProps<TResourceMeta = unknown, TEventMeta = unknown> extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  resources: CalendarTimelineResource<TResourceMeta>[];
  events: CalendarTimelineEvent<TEventMeta>[];

  size?: CalendarTimelineSize;

  enableEventSheet?: boolean;
  eventSheetSize?: CalendarTimelineSheetSize;
  renderEventSheet?: (args: {
    event: CalendarTimelineEvent<TEventMeta>;
    resource?: CalendarTimelineResource<TResourceMeta>;
    close: () => void;
    locale: string;
    timeZone: string;
    view: CalendarTimelineView;
  }) => React.ReactNode;

  selectedEventId?: string | null;
  defaultSelectedEventId?: string | null;
  onSelectedEventIdChange?: (eventId: string | null) => void;

  eventSheetOpen?: boolean;
  defaultEventSheetOpen?: boolean;
  onEventSheetOpenChange?: (open: boolean) => void;

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
  defaultResourceColumnWidth?: number;
  onResourceColumnWidthChange?: (width: number) => void;
  minResourceColumnWidth?: number;
  maxResourceColumnWidth?: number;

  rowHeight?: number;
  defaultRowHeight?: number;
  onRowHeightChange?: (height: number) => void;
  minRowHeight?: number;
  maxRowHeight?: number;

  rowHeights?: Record<string, number>;
  defaultRowHeights?: Record<string, number>;
  onRowHeightsChange?: (next: Record<string, number>) => void;

  enableLayoutResize?: boolean | { column?: boolean; row?: boolean };

  slotMinWidth?: number;
  dayTimeStepMinutes?: number;
  maxLanesPerRow?: number;
  now?: Date;

  renderResource?: (resource: CalendarTimelineResource<TResourceMeta>) => React.ReactNode;
  renderGroup?: (group: CalendarTimelineGroup, args: { collapsed: boolean; toggle: () => void }) => React.ReactNode;
  renderEvent?: (event: CalendarTimelineEvent<TEventMeta>, layout: { left: number; width: number; lane: number }) => React.ReactNode;

  interactions?: {
    selectable?: boolean;
    creatable?: boolean;
    draggableEvents?: boolean;
    resizableEvents?: boolean;
  };

  onRangeChange?: (range: { start: Date; end: Date }) => void;
  onEventClick?: (event: CalendarTimelineEvent<TEventMeta>) => void;
  onEventDoubleClick?: (event: CalendarTimelineEvent<TEventMeta>) => void;
  onCreateEvent?: (draft: { resourceId: string; start: Date; end: Date }) => void;
  onEventMove?: (args: { eventId: string; resourceId: string; start: Date; end: Date }) => void;
  onEventResize?: (args: { eventId: string; start: Date; end: Date }) => void;

  onMoreClick?: (args: { resourceId: string; hiddenEvents: CalendarTimelineEvent<TEventMeta>[] }) => void;

  virtualization?: {
    enabled?: boolean;
    overscan?: number;
  };
}
```
