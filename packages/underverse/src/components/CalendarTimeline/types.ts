import type * as React from "react";

export type CalendarTimelineView = "month" | "week" | "day" | "sprint";
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

export interface CalendarTimelineSprintDueDate {
  title: React.ReactNode;
  range_date: {
    start: CalendarTimelineDateInput;
    end: CalendarTimelineDateInput;
  };
}

export type CalendarTimelineDueDateSprint = Record<string, CalendarTimelineSprintDueDate>;

export interface CalendarTimelineLabels {
  today?: string;
  prev?: string;
  next?: string;
  month?: string;
  week?: string;
  day?: string;
  sprint?: string;
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
}

export interface CalendarTimelineFormatters {
  monthTitle?: (date: Date, ctx: { locale: string; timeZone: string }) => string;
  slotHeader?: (slotStart: Date, ctx: { view: CalendarTimelineView; locale: string; timeZone: string }) => React.ReactNode;
  eventTime?: (args: { start: Date; end: Date; locale: string; timeZone: string; view: CalendarTimelineView }) => string;
  ariaEventLabel?: (event: CalendarTimelineEvent, ctx: { locale: string; timeZone: string }) => string;
  ariaSlotLabel?: (slotStart: Date, ctx: { view: CalendarTimelineView; locale: string; timeZone: string }) => string;
}

export interface CalendarTimelineInteractions {
  /** Interaction preset. Default: "edit". */
  mode?: "edit" | "view";
  selectable?: boolean;
  creatable?: boolean;
  /** How creating events via the grid works. Default: "drag". */
  createMode?: "drag" | "click";
  draggableEvents?: boolean;
  resizableEvents?: boolean;
  deletableEvents?: boolean;
}

export interface CalendarTimelineVirtualization {
  enabled?: boolean;
  overscan?: number;
}

export type CalendarTimelineColumnVirtualization =
  | boolean
  | {
      /** Extra slots rendered on each side. Default: 6 */
      overscan?: number;
    };

export type CalendarTimelineAdaptiveSlotWidths =
  | boolean
  | {
      /**
       * "shrink": empty slots get `emptySlotWidth`, event slots keep the fixed base width (default).
       * "redistribute": keep the total grid width as in fixed mode, redistribute freed width to event slots (capped).
       */
      mode?: "shrink" | "redistribute";
      /** Width (px) for empty slots (month/day only). Default: `slotMinWidth * 0.6` (bounded). */
      emptySlotWidth?: number;
      /** Cap (px) for event slot width when `mode="redistribute"`. Default: `baseSlotWidth * 2.5`. */
      maxEventSlotWidth?: number;
      /**
       * Day view only: if enabled and the computed grid is narrower than the viewport, expand columns to fill the available width.
       * Default: false.
       */
      fillContainer?: boolean;
      /**
       * Day view only (when `fillContainer`): where the extra width goes.
       * - "event": distribute extra width to columns that have events (default)
       * - "all": distribute extra width to all columns
       */
      fillDistribute?: "event" | "all";
    };

export interface CalendarTimelineProps<TResourceMeta = unknown, TEventMeta = unknown>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  resources: CalendarTimelineResource<TResourceMeta>[];
  events: CalendarTimelineEvent<TEventMeta>[];

  size?: CalendarTimelineSize;

  /**
   * Enable the built-in right-side event details sheet on click.
   * If `renderEventSheet` is provided, this defaults to enabled.
   */
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

  // view/date
  /**
   * Lock the timeline to a single view and hide the view switcher.
   * When set, `view`/`defaultView` are ignored.
   */
  onlyView?: CalendarTimelineView;

  /**
   * Active view (controlled) or allowed views list.
   * - string: controls the current view
   * - array: restricts which views are shown; the active view falls back to
   *   `defaultView` (if included) or the first entry.
   */
  view?: CalendarTimelineView | CalendarTimelineView[];
  defaultView?: CalendarTimelineView;
  onViewChange?: (view: CalendarTimelineView) => void;

  /**
   * Sprint view only: provide custom sprint titles (and ranges) so the header columns can display dynamic labels.
   * If not provided, sprint headers fall back to "S01", "S02", ...
   */
  dueDateSprint?: CalendarTimelineDueDateSprint;

  date?: Date;
  defaultDate?: Date;
  onDateChange?: (date: Date) => void;

  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;

  // timezone + i18n
  locale?: string; // BCP47 like "vi-VN"
  timeZone?: string; // IANA TZ like "Asia/Ho_Chi_Minh"
  labels?: CalendarTimelineLabels;
  formatters?: CalendarTimelineFormatters;

  // grouping
  groups?: CalendarTimelineGroup[];
  groupCollapsed?: Record<string, boolean>;
  defaultGroupCollapsed?: Record<string, boolean>;
  onGroupCollapsedChange?: (next: Record<string, boolean>) => void;

  // layout
  /**
   * Hide the left resource column (resource/group labels).
   * The grid rows still render (one per resource), but the left labels, group toggles,
   * and UI row-resize handles are not shown.
   */
  hideResourceColumn?: boolean;

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

  /** Controlled height of each resource row (px). */
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
   * Auto-expand each resource row height to fit overlapping events (lanes) without collapsing into "+more".
   * When enabled, `maxLanesPerRow` is ignored unless overridden via `autoRowHeight.maxLanesPerRow`.
   */
  autoRowHeight?: boolean | { maxRowHeight?: number; maxLanesPerRow?: number };

  /**
   * Allow resizing layout with mouse:
   * - column: drag the divider in the header
   * - row: drag the bottom edge of a resource row
   */
  enableLayoutResize?: boolean | { column?: boolean; row?: boolean };

  slotMinWidth?: number; // min px per slot; timeline can overflow horizontally
  /**
   * Month/day only: make slots (columns) without any events smaller to free space for slots that have events.
   * Week view is unaffected.
   */
  adaptiveSlotWidths?: CalendarTimelineAdaptiveSlotWidths;
  /**
   * Day view: visual style for events that span many time slots.
   * - "span": event blocks span the full duration on the timeline (default)
   * - "compact": event blocks keep a capped visual width (still positioned at correct start)
   */
  dayEventStyle?: "span" | "compact";
  /** Day view only (when `dayEventStyle="compact"`): max visual width (px). */
  dayEventMaxWidth?: number;

  /**
   * Month view: visual style for events that span many days.
   * - "span": event blocks span the full duration on the timeline (default)
   * - "compact": event blocks keep a capped visual width (still positioned at correct start)
   */
  monthEventStyle?: "span" | "compact";
  /** Month view only (when `monthEventStyle="compact"`): max visual width (px). */
  monthEventMaxWidth?: number;
  dayTimeStepMinutes?: number; // day view slot size

  /** Render tooltips on events (can be expensive for large datasets). Default: true. */
  enableEventTooltips?: boolean;

  /**
   * Day view: header rendering mode.
   * - "full": show every time slot label (default; matches legacy behavior)
   * - "smart": show start/…/end markers to reduce clutter on dense timelines
   */
  dayHeaderMode?: "full" | "smart";

  /**
   * Day view: optionally compress empty time columns when `dayHeaderMode="smart"`.
   * Default: false (keeps legacy column widths).
   */
  daySlotCompression?: boolean;

  /**
   * Day view only: virtualize columns in the header/overlay when there are many time slots (e.g. 5–15min step).
   * Keeps scroll behavior the same but reduces DOM work.
   */
  columnVirtualization?: CalendarTimelineColumnVirtualization;
  /**
   * Day view horizontal range:
   * - "full": show 24h (default)
   * - "work": show working hours (default 08:00–17:00)
   */
  dayRangeMode?: CalendarTimelineDayRangeMode;
  /** Used when `dayRangeMode="work"`. Default: `{ startHour: 8, endHour: 17 }`. */
  workHours?: { startHour: number; endHour: number };
  maxLanesPerRow?: number;
  now?: Date;

  // rendering
  renderResource?: (resource: CalendarTimelineResource<TResourceMeta>) => React.ReactNode;
  renderGroup?: (group: CalendarTimelineGroup, args: { collapsed: boolean; toggle: () => void }) => React.ReactNode;
  renderEvent?: (
    event: CalendarTimelineEvent<TEventMeta>,
    layout: { left: number; width: number; lane: number; height: number; timeText: string },
  ) => React.ReactNode;

  // interactions
  interactions?: CalendarTimelineInteractions;
  onRangeChange?: (range: { start: Date; end: Date }) => void;
  onEventClick?: (event: CalendarTimelineEvent<TEventMeta>) => void;
  onEventDoubleClick?: (event: CalendarTimelineEvent<TEventMeta>) => void;
  /**
   * Custom create flow: when `interactions.creatable` + `interactions.createMode="click"`,
   * clicking an empty cell calls this handler with the inferred range for that cell.
   */
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

  virtualization?: CalendarTimelineVirtualization;
}
