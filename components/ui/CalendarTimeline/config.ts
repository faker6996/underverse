import type { CalendarTimelineSize } from "./types";

export type CalendarTimelineSizeConfig = {
  resourceColumnWidth: number;
  rowHeight: number;
  slotMinWidth: number;
  eventHeight: number;
  laneGap: number;
  lanePaddingY: number;
  densityClass: string;
  headerPaddingClass: string;
  titleClass: string;
  resourceRowClass: string;
  groupRowClass: string;
  slotHeaderClass: string;
  controlButtonIconClass: string;
  controlButtonTextClass: string;
};

export const SIZE_CONFIG_BY_SIZE: Record<CalendarTimelineSize, CalendarTimelineSizeConfig> = {
  sm: {
    resourceColumnWidth: 200,
    rowHeight: 66,
    slotMinWidth: 52,
    eventHeight: 40,
    laneGap: 3,
    lanePaddingY: 5,
    densityClass: "text-xs",
    headerPaddingClass: "px-3 py-2",
    titleClass: "text-base",
    resourceRowClass: "gap-2 px-3",
    groupRowClass: "gap-2 px-3",
    slotHeaderClass: "px-1 py-2",
    controlButtonIconClass: "h-7 w-7",
    controlButtonTextClass: "h-7 px-2 text-xs",
  },
  md: {
    resourceColumnWidth: 240,
    rowHeight: 78,
    slotMinWidth: 64,
    eventHeight: 48,
    laneGap: 4,
    lanePaddingY: 6,
    densityClass: "text-sm",
    headerPaddingClass: "px-4 py-3",
    titleClass: "text-lg",
    resourceRowClass: "gap-3 px-4",
    groupRowClass: "gap-3 px-4",
    slotHeaderClass: "px-1 py-3",
    controlButtonIconClass: "h-8 w-8",
    controlButtonTextClass: "h-8 px-3",
  },
  xl: {
    resourceColumnWidth: 280,
    rowHeight: 90,
    slotMinWidth: 76,
    eventHeight: 56,
    laneGap: 5,
    lanePaddingY: 8,
    densityClass: "text-base",
    headerPaddingClass: "px-5 py-4",
    titleClass: "text-xl",
    resourceRowClass: "gap-4 px-5",
    groupRowClass: "gap-4 px-5",
    slotHeaderClass: "px-2 py-4",
    controlButtonIconClass: "h-9 w-9",
    controlButtonTextClass: "h-9 px-4 text-sm",
  },
};

export function getSizeConfig(size: CalendarTimelineSize) {
  return SIZE_CONFIG_BY_SIZE[size];
}
