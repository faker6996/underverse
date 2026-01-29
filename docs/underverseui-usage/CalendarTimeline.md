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
        // Mode 1: Drag to create (default)
        // Hover an event to see a tooltip, click to open the sheet.
        interactions={{ creatable: true, createMode: "drag", draggableEvents: true, resizableEvents: true, deletableEvents: true }}
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
        onEventDelete={({ eventId }) => {
          setEvents((prev) => prev.filter((e) => e.id !== eventId));
        }}
      />
    </div>
  );
}
```

## Examples: 2 create modes

### Mode 1 — Drag to create (default)

Kéo chuột trên grid để tạo event (giữ nguyên hành vi hiện tại).

```tsx
<CalendarTimeline
  resources={resources}
  events={events}
  interactions={{ creatable: true, createMode: "drag" }}
  onCreateEvent={({ resourceId, start, end }) => {
    setEvents((prev) => [...prev, { id: `e_${prev.length + 1}`, resourceId, start, end, title: "New event" }]);
  }}
/>
```

### Mode 2 — Click cell to open custom create UI

Click vào ô trống để bạn tự mở modal/sheet tạo event theo ý (custom UI).

```tsx
<CalendarTimeline
  resources={resources}
  events={events}
  interactions={{ creatable: true, createMode: "click" }}
  onCreateEventClick={({ resourceId, start, end, view }) => {
    // open your custom modal/sheet here and prefill {resourceId,start,end}
    console.log("create", { resourceId, start, end, view });
  }}
/>
```

## Hành vi

- **Một resource (một hàng)** có thể có **nhiều event**. Nếu các event overlap, component sẽ tự xếp thành nhiều “lane”.
- `maxLanesPerRow` giới hạn số lane hiển thị; phần dư sẽ vào “hidden” và hiển thị nút `+n more`.
- `end` của event là **exclusive** (kết thúc không bao gồm). Ví dụ `04:00 → 06:00` là đúng 2 giờ.
- Khi **drag/move/resize** event, component sẽ **không mở Event Sheet** (chỉ click mới mở).
- Ở **week view**, các slot sẽ **tự giãn để fill full chiều ngang** vùng timeline (nhưng vẫn tôn trọng `slotMinWidth` như giá trị tối thiểu).
- Có nút **New event** ở header (khi bật `interactions.creatable` và có `onCreateEvent`) để tạo event bằng cách chọn **resource / start / end** theo đúng view hiện tại (month/week/day).

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

## Custom create mode (click cell)

Nếu bạn muốn **tự custom UI tạo event** (mở modal/sheet riêng của bạn) khi click vào **ô trống** trong grid:

```tsx
<CalendarTimeline
  resources={resources}
  events={events}
  interactions={{ creatable: true, createMode: "click" }}
  onCreateEventClick={({ resourceId, start, end, view }) => {
    // mở modal/sheet của bạn, prefill theo ô vừa click
    console.log("create at", { resourceId, start, end, view });
  }}
/>
```

Gợi ý:
- `view="day"`: `start/end` theo step giờ (dựa trên `dayTimeStepMinutes`)
- `view="week"`/`"month"`: `start/end` theo ngày

## Layout Resize (Row/Column)

CalendarTimeline hỗ trợ **resize bằng chuột** (khi bật `enableLayoutResize`):

- **Resize độ rộng cột Resource (bên trái)**: hover vào ô header “Resources”, kéo mép phải.
- **Resize chiều cao từng hàng Resource**: hover vào **ô Resource bên trái của hàng đó**, kéo mép dưới.

## Delete event (right click)

Chuột phải lên event để hiện confirm và xoá (cần cung cấp `onEventDelete`).

> macOS: bạn có thể dùng **Ctrl+Click** để mở “chuột phải”.

```tsx
<CalendarTimeline
  resources={resources}
  events={events}
  onEventDelete={({ eventId }) => setEvents((prev) => prev.filter((e) => e.id !== eventId))}
  interactions={{ deletableEvents: true }}
/>
```

### Controlled / Uncontrolled

- **Controlled**: dùng `resourceColumnWidth` + `rowHeights` và lắng nghe `onResourceColumnWidthChange` / `onRowHeightsChange`.
- **Uncontrolled**: dùng `defaultResourceColumnWidth` + `defaultRowHeights` (component tự quản lý state nội bộ).

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

  labels?: {
    today?: string;
    prev?: string;
    next?: string;
    month?: string;
    week?: string;
    day?: string;
    newEvent?: string;
    createEventTitle?: string;
    create?: string;
    cancel?: string;
    resource?: string;
    start?: string;
    end?: string;
    expandGroup?: string;
    collapseGroup?: string;
    more?: (n: number) => string;
    deleteConfirm?: string;
  };

  formatters?: {
    monthTitle?: (date: Date, ctx: { locale: string; timeZone: string }) => string;
    slotHeader?: (slotStart: Date, ctx: { view: CalendarTimelineView; locale: string; timeZone: string }) => React.ReactNode;
    eventTime?: (args: { start: Date; end: Date; locale: string; timeZone: string; view: CalendarTimelineView }) => string;
    ariaEventLabel?: (event: CalendarTimelineEvent, ctx: { locale: string; timeZone: string }) => string;
    ariaSlotLabel?: (slotStart: Date, ctx: { view: CalendarTimelineView; locale: string; timeZone: string }) => string;
  };

  groups?: CalendarTimelineGroup[];
  groupCollapsed?: Record<string, boolean>;
  defaultGroupCollapsed?: Record<string, boolean>;
  onGroupCollapsedChange?: (next: Record<string, boolean>) => void;

  /** Controlled width of the left resource column (px or CSS width string). */
  resourceColumnWidth?: number | string;
  /** Default width of the left resource column when uncontrolled (px). */
  defaultResourceColumnWidth?: number;
  /** Called when user resizes the left resource column. */
  onResourceColumnWidthChange?: (width: number) => void;
  /** Min width for the left resource column (px). */
  minResourceColumnWidth?: number;
  /** Max width for the left resource column (px). */
  maxResourceColumnWidth?: number;

  /** Default fallback height of each resource row (px). */
  rowHeight?: number;
  /** Default row height when uncontrolled (px). */
  defaultRowHeight?: number;
  /** Called when user resizes row height. */
  onRowHeightChange?: (height: number) => void;
  /** Min row height (px). */
  minRowHeight?: number;
  /** Max row height (px). */
  maxRowHeight?: number;

  /** Controlled per-resource row heights (px) keyed by resourceId. */
  rowHeights?: Record<string, number>;
  /** Default per-resource row heights (px) keyed by resourceId. */
  defaultRowHeights?: Record<string, number>;
  /** Called when per-resource row heights change. */
  onRowHeightsChange?: (next: Record<string, number>) => void;

  /**
   * Allow resizing layout with mouse:
   * - column: drag the divider in the header
   * - row: drag the bottom edge of a resource row header
   */
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
    createMode?: "drag" | "click";
    draggableEvents?: boolean;
    resizableEvents?: boolean;
    deletableEvents?: boolean;
  };

  onRangeChange?: (range: { start: Date; end: Date }) => void;
  onEventClick?: (event: CalendarTimelineEvent<TEventMeta>) => void;
  onEventDoubleClick?: (event: CalendarTimelineEvent<TEventMeta>) => void;
  onCreateEventClick?: (args: {
    resourceId: string;
    start: Date;
    end: Date;
    slotIdx: number;
    view: CalendarTimelineView;
    locale: string;
    timeZone: string;
  }) => void;
  onCreateEvent?: (draft: { resourceId: string; start: Date; end: Date }) => void;
  onEventMove?: (args: { eventId: string; resourceId: string; start: Date; end: Date }) => void;
  onEventResize?: (args: { eventId: string; start: Date; end: Date }) => void;
  onEventDelete?: (args: { eventId: string }) => void;

  onMoreClick?: (args: { resourceId: string; hiddenEvents: CalendarTimelineEvent<TEventMeta>[] }) => void;

  virtualization?: {
    enabled?: boolean;
    overscan?: number;
  };
}
```
