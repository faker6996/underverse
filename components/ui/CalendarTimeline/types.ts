import type * as React from "react";

export type CalendarTimelineView = "month" | "week" | "day";
export type CalendarTimelineDateInput = Date | string | number;
export type CalendarTimelineSize = "sm" | "md" | "xl";

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

export interface CalendarTimelineLabels {
  today?: string;
  prev?: string;
  next?: string;
  month?: string;
  week?: string;
  day?: string;
  expandGroup?: string;
  collapseGroup?: string;
  more?: (n: number) => string;
}

export interface CalendarTimelineFormatters {
  monthTitle?: (date: Date, ctx: { locale: string; timeZone: string }) => string;
  slotHeader?: (slotStart: Date, ctx: { view: CalendarTimelineView; locale: string; timeZone: string }) => React.ReactNode;
  eventTime?: (args: { start: Date; end: Date; locale: string; timeZone: string; view: CalendarTimelineView }) => string;
  ariaEventLabel?: (event: CalendarTimelineEvent, ctx: { locale: string; timeZone: string }) => string;
  ariaSlotLabel?: (slotStart: Date, ctx: { view: CalendarTimelineView; locale: string; timeZone: string }) => string;
}

export interface CalendarTimelineInteractions {
  selectable?: boolean;
  creatable?: boolean;
  draggableEvents?: boolean;
  resizableEvents?: boolean;
}

export interface CalendarTimelineVirtualization {
  enabled?: boolean;
  overscan?: number;
}

export interface CalendarTimelineProps<TResourceMeta = unknown, TEventMeta = unknown>
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  resources: CalendarTimelineResource<TResourceMeta>[];
  events: CalendarTimelineEvent<TEventMeta>[];

  size?: CalendarTimelineSize;

  // view/date
  view?: CalendarTimelineView;
  defaultView?: CalendarTimelineView;
  onViewChange?: (view: CalendarTimelineView) => void;

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
  resourceColumnWidth?: number | string;
  rowHeight?: number;
  slotMinWidth?: number; // min px per slot; timeline can overflow horizontally
  dayTimeStepMinutes?: number; // day view slot size
  maxLanesPerRow?: number;
  now?: Date;

  // rendering
  renderResource?: (resource: CalendarTimelineResource<TResourceMeta>) => React.ReactNode;
  renderGroup?: (group: CalendarTimelineGroup, args: { collapsed: boolean; toggle: () => void }) => React.ReactNode;
  renderEvent?: (event: CalendarTimelineEvent<TEventMeta>, layout: { left: number; width: number; lane: number }) => React.ReactNode;

  // interactions
  interactions?: CalendarTimelineInteractions;
  onRangeChange?: (range: { start: Date; end: Date }) => void;
  onEventClick?: (event: CalendarTimelineEvent<TEventMeta>) => void;
  onEventDoubleClick?: (event: CalendarTimelineEvent<TEventMeta>) => void;
  onCreateEvent?: (draft: { resourceId: string; start: Date; end: Date }) => void;
  onEventMove?: (args: { eventId: string; resourceId: string; start: Date; end: Date }) => void;
  onEventResize?: (args: { eventId: string; start: Date; end: Date }) => void;
  onMoreClick?: (args: { resourceId: string; hiddenEvents: CalendarTimelineEvent<TEventMeta>[] }) => void;

  virtualization?: CalendarTimelineVirtualization;
}
