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

## Visual Notes

- **Weekend columns** (Saturday/Sunday) in **month/week** views are rendered with a subtle background tint (timezone-aware). “Today” highlight still takes precedence.

## Usage Recipes

### 1) Minimal (read-only)

```tsx
<CalendarTimeline
  resources={resources}
  events={events}
  interactions={{ mode: "view" }}
/>
```

### 2) Controlled view + date

```tsx
const [view, setView] = React.useState<CalendarTimelineView>("month");
const [date, setDate] = React.useState(new Date());

<CalendarTimeline
  resources={resources}
  events={events}
  view={view}
  onViewChange={setView}
  date={date}
  onDateChange={setDate}
/>
```

### 3) Lock view (only month / only day)

Use when you want to ship a single mode (no view switcher UI).

```tsx
<CalendarTimeline resources={resources} events={events} onlyView="month" />
```

```tsx
<CalendarTimeline resources={resources} events={events} onlyView="day" />
```

### 4) Hide resource column (left labels)

```tsx
<CalendarTimeline resources={resources} events={events} hideResourceColumn />
```

### 5) Month view: shrink empty days to free space

```tsx
<CalendarTimeline
  resources={resources}
  events={events}
  view="month"
  adaptiveSlotWidths={{ mode: "redistribute", emptySlotWidth: 32 }}
/>
```

### 6) Day view: shrink empty hours but keep full-width grid

Use when you want empty hour columns smaller, but the timeline still fills the container width.

```tsx
<CalendarTimeline
  resources={resources}
  events={events}
  view="day"
  slotMinWidth={56}
  adaptiveSlotWidths={{ mode: "shrink", emptySlotWidth: 44, fillContainer: true, fillDistribute: "event" }}
/>
```

### 7) Day view header

- `dayHeaderMode="full"`: show every hour label (legacy/default behavior)
- `dayHeaderMode="smart"`: show start/…/end markers (opt-in)

```tsx
<CalendarTimeline
  resources={resources}
  events={events}
  view="day"
  dayHeaderMode="full"
/>
```

```tsx
<CalendarTimeline
  resources={resources}
  events={events}
  view="day"
  dayHeaderMode="smart"
  daySlotCompression={true} // optional: also compress empty time columns in smart mode
/>
```

### 8) Day view range (work hours vs 24h)

```tsx
<CalendarTimeline
  resources={resources}
  events={events}
  view="day"
  dayRangeMode="work"
  workHours={{ startHour: 8, endHour: 17 }}
/>
```

### 9) Grouping + collapse

```tsx
const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({ g1: false, g2: true });

<CalendarTimeline
  resources={resources}
  events={events}
  groups={[
    { id: "g1", label: "Group 1" },
    { id: "g2", label: "Group 2" },
  ]}
  groupCollapsed={collapsed}
  onGroupCollapsedChange={setCollapsed}
/>
```

### 10) Interactions (create/drag/resize/delete)

```tsx
<CalendarTimeline
  resources={resources}
  events={events}
  interactions={{
    mode: "edit",
    creatable: true,
    createMode: "drag",
    draggableEvents: true,
    resizableEvents: true,
    deletableEvents: true,
  }}
  onCreateEvent={(draft) => console.log("create", draft)}
  onEventMove={(args) => console.log("move", args)}
  onEventResize={(args) => console.log("resize", args)}
  onEventDelete={(args) => console.log("delete", args)}
/>
```

### 11) “Create: click (custom)” flow

```tsx
<CalendarTimeline
  resources={resources}
  events={events}
  interactions={{ mode: "edit", creatable: true, createMode: "click" }}
  onCreateEventClick={({ resourceId, start, end }) => {
    // open your modal here
    console.log("open create modal", { resourceId, start, end });
  }}
/>
```

### 12) Row height control (per-resource + autoRowHeight)

```tsx
const [rowHeights, setRowHeights] = React.useState<Record<string, number>>({});

<CalendarTimeline
  resources={resources}
  events={events}
  rowHeights={rowHeights}
  onRowHeightsChange={setRowHeights}
  autoRowHeight // expand to fit overlapping events, reduce "+more"
/>
```

### 13) Performance toggles (large datasets)

```tsx
<CalendarTimeline
  resources={resources}
  events={events}
  enableEventTooltips={false}
  virtualization={{ enabled: true, overscan: 8 }}
  columnVirtualization={{ overscan: 8 }} // day view only
/>
```

### 14) Timezone + i18n

```tsx
<CalendarTimeline
  resources={resources}
  events={events}
  locale="vi-VN"
  timeZone="Asia/Ho_Chi_Minh"
/>
```

Ví dụ đầy đủ (month/week/day + timezone + group/collapse + drag/resize + resize layout):

> Lưu ý: `export function Example()` trong file `.md` chỉ là snippet minh hoạ để bạn copy/paste, không có gì “cố định” trong component.

```tsx
import * as React from "react";
import {
  CalendarTimeline,
  type CalendarTimelineDayRangeMode,
  type CalendarTimelineEvent,
  type CalendarTimelineResource,
  type CalendarTimelineView,
} from "@underverse-ui/underverse";

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
  const [view, setView] = React.useState<CalendarTimelineView>("day");
  const [mode, setMode] = React.useState<"edit" | "view">("edit");
  const [createMode, setCreateMode] = React.useState<"drag" | "click">("drag");
  const [dayRangeMode, setDayRangeMode] = React.useState<CalendarTimelineDayRangeMode>("work");

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        <button type="button" onClick={() => setMode("edit")}>
          Mode: Edit
        </button>
        <button type="button" onClick={() => setMode("view")}>
          Mode: View
        </button>
        <button type="button" onClick={() => setCreateMode("drag")}>
          Create: Drag
        </button>
        <button type="button" onClick={() => setCreateMode("click")}>
          Create: Click (custom)
        </button>
        <button type="button" onClick={() => setView("month")}>
          View: Month
        </button>
        <button type="button" onClick={() => setView("week")}>
          View: Week
        </button>
        <button type="button" onClick={() => setView("day")}>
          View: Day
        </button>
        <button type="button" onClick={() => setDayRangeMode("full")}>
          Day: 24h
        </button>
        <button type="button" onClick={() => setDayRangeMode("work")}>
          Day: Work hours
        </button>
      </div>

      <CalendarTimeline
        resources={resources}
        groups={groups}
        events={events}
        view={view}
        onViewChange={setView}
        size="md" // "sm" | "md" | "xl"
        // Month/day only: make empty columns smaller to free space for columns with events
        // - "shrink" (default): empty slots shrink, event slots keep base width
        // - "redistribute": keep total grid width, redistribute freed width to event slots (capped)
        adaptiveSlotWidths={{ mode: "shrink" }}
        // Performance toggles for large datasets:
        enableEventTooltips={false}
        columnVirtualization={{ overscan: 6 }} // day view only
        dayHeaderMode="full" // default; use "smart" if you want start/…/end markers in day view
        daySlotCompression={false} // default; set true only if you want day columns to compress in "smart" mode
        // Note: if `dayHeaderMode="full"`, day view keeps a safe minimum slot width so hour labels stay readable.
        // Tip (day view): if you shrink empty columns and the grid becomes narrower than the viewport,
        // you can set `adaptiveSlotWidths={{ ..., fillContainer: true, fillDistribute: "event" }}` to keep the grid full-width.
        enableLayoutResize
        resourceColumnWidth={resourceColumnWidth}
        onResourceColumnWidthChange={setResourceColumnWidth}
        rowHeights={rowHeights}
        onRowHeightsChange={setRowHeights}
        enableEventSheet
        eventSheetSize="md" // "sm" | "md" | "lg" | "xl" | "full"
        // Day view: 2 modes
        // - "full": 24h (default)
        // - "work": working hours (default 08:00–17:00)
        dayRangeMode={dayRangeMode}
        workHours={{ startHour: 8, endHour: 17 }}
        // Auto-expand row height to fit overlapping events (no +more)
        autoRowHeight
        weekStartsOn={1}
        // locale/timeZone automatically follow the app/user settings by default
        // Modes:
        // - mode="view": disable create/drag/resize/delete (click event still opens sheet)
        // - createMode="drag": drag empty cells to create
        // - createMode="click": click empty cell for custom create UI
        interactions={{
          mode,
          creatable: true,
          createMode,
          draggableEvents: true,
          resizableEvents: true,
          deletableEvents: true,
        }}
        onCreateEvent={(draft) => {
          if (createMode !== "drag") return;
          setEvents((prev) => [
            ...prev,
            { id: `e_${prev.length + 1}`, resourceId: draft.resourceId, start: draft.start, end: draft.end, title: "New event" },
          ]);
        }}
        onCreateEventClick={({ resourceId, start, end }) => {
          if (createMode !== "click") return;
          // open your custom modal/sheet here and prefill {resourceId,start,end}
          setEvents((prev) => [
            ...prev,
            { id: `e_${prev.length + 1}`, resourceId, start, end, title: "New event (custom)" },
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
  interactions={{ mode: "edit", creatable: true, createMode: "drag" }}
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
  interactions={{ mode: "edit", creatable: true, createMode: "click" }}
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
- `onlyView="month" | "week" | "day"` sẽ **lock** view và **ẩn view switcher** (bỏ qua `view/defaultView`).
- `hideResourceColumn` sẽ **ẩn cột resource** bên trái (không hiện label/group toggle và không kéo resize row từ UI).
- Khi **drag/move/resize** event, component sẽ **không mở Event Sheet** (chỉ click mới mở).
- Ở **week view**, các slot sẽ **tự giãn để fill full chiều ngang** vùng timeline (nhưng vẫn tôn trọng `slotMinWidth` như giá trị tối thiểu).
- Có nút **New event** ở header (khi bật `interactions.creatable` và có `onCreateEvent`) để tạo event bằng cách chọn **resource / start / end** theo đúng view hiện tại (month/week/day).
- Có mode **view-only**: `interactions.mode="view"` sẽ tắt create/drag/resize/delete và **ẩn nút New event**; click event vẫn mở sheet.

## Day view: 24h / Work hours

Day view hỗ trợ 2 mode hiển thị theo giờ:

- `dayRangeMode="full"`: hiển thị 24h (mặc định)
- `dayRangeMode="work"`: hiển thị giờ làm việc (mặc định 08:00–17:00, có thể set bằng `workHours`)

```tsx
// 24h
<CalendarTimeline resources={resources} events={events} view="day" dayRangeMode="full" />

// Working hours (08:00–17:00)
<CalendarTimeline resources={resources} events={events} view="day" dayRangeMode="work" workHours={{ startHour: 8, endHour: 17 }} />
```

## Auto row height (fit overlapping events)

Khi nhiều event **overlap** trên cùng 1 resource (tạo ra nhiều “lane”), bạn có thể bật `autoRowHeight` để component **tự tăng chiều cao hàng** để hiển thị hết (không gộp vào `+more`).

```tsx
<CalendarTimeline resources={resources} events={events} autoRowHeight />
```

## View-only mode

Chỉ xem (không tạo/sửa/xoá), click event vẫn mở sheet:

```tsx
<CalendarTimeline
  resources={resources}
  events={events}
  enableEventSheet
  interactions={{ mode: "view" }}
/>
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

## Custom event box (`renderEvent`)

Bạn có thể custom UI trong box event bằng `renderEvent`. Component sẽ **không cho nội dung vượt quá chiều cao của hàng** (event box có `overflow: hidden`), nên nếu text quá dài thì bạn nên **wrap + clamp** số dòng.

`renderEvent` nhận thêm:
- `layout.height`: chiều cao event box hiện tại (px)
- `layout.timeText`: text thời gian đã được format theo `formatters.eventTime`/default

Ví dụ: tự xuống dòng + tối đa 1–2 dòng tuỳ theo `layout.height`:

```tsx
<CalendarTimeline
  resources={resources}
  events={events}
  renderEvent={(event, layout) => {
    const maxLines = layout.height >= 34 ? 2 : 1;
    return (
      <div className="h-full px-2.5 flex items-center min-w-0 overflow-hidden">
        <div className="w-full grid grid-cols-[1fr_auto] gap-x-2 items-start min-w-0 overflow-hidden">
          <div
            className="text-xs font-semibold leading-snug min-w-0 overflow-hidden break-words"
            style={{ display: \"-webkit-box\", WebkitBoxOrient: \"vertical\", WebkitLineClamp: maxLines as any }}
          >
            {event.title}
          </div>
          <div className="text-[11px] opacity-70 leading-snug whitespace-nowrap">{layout.timeText}</div>
        </div>
      </div>
    );
  }}
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
export type CalendarTimelineDayRangeMode = "full" | "work";
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
  autoRowHeight?: boolean | { maxRowHeight?: number; maxLanesPerRow?: number };
  dayRangeMode?: CalendarTimelineDayRangeMode;
  workHours?: { startHour: number; endHour: number };
  maxLanesPerRow?: number;
  now?: Date;

  renderResource?: (resource: CalendarTimelineResource<TResourceMeta>) => React.ReactNode;
  renderGroup?: (group: CalendarTimelineGroup, args: { collapsed: boolean; toggle: () => void }) => React.ReactNode;
  renderEvent?: (
    event: CalendarTimelineEvent<TEventMeta>,
    layout: { left: number; width: number; lane: number; height: number; timeText: string },
  ) => React.ReactNode;

  interactions?: {
    mode?: "edit" | "view";
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
