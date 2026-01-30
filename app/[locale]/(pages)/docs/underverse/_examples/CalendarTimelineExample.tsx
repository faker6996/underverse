"use client";

import * as React from "react";
import CalendarTimeline, {
  type CalendarTimelineDayRangeMode,
  type CalendarTimelineEvent,
  type CalendarTimelineResource,
  type CalendarTimelineGroup,
  type CalendarTimelineView,
} from "@/components/ui/CalendarTimeline";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { useTranslations } from "next-intl";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";
import Button from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import Input from "@/components/ui/Input";

type EventMeta = { kind?: "meeting" | "task" };
type CreateMode = "drag" | "click";
type DemoMode = "edit" | "view";
type DayRangeMode = CalendarTimelineDayRangeMode;

const resources: CalendarTimelineResource[] = [
  { id: "r-a", label: "Resource A", groupId: "g-1" },
  { id: "r-b", label: "Resource B", groupId: "g-1" },
  { id: "r-c", label: "Resource C", groupId: "g-2" },
  { id: "r-d", label: "Resource D", groupId: "g-2" },
];

const groups: CalendarTimelineGroup[] = [
  { id: "g-1", label: "Group 1" },
  { id: "g-2", label: "Group 2" },
];

function pad2(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

function ymd(d: Date) {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

function addUtcDays(d: Date, n: number) {
  return new Date(d.getTime() + n * 24 * 60 * 60 * 1000);
}

export default function CalendarTimelineExample() {
  const t = useTranslations("DocsUnderverse");

  const [view, setView] = React.useState<CalendarTimelineView>("month");
  const [date, setDate] = React.useState<Date>(new Date());
  const [demoMode, setDemoMode] = React.useState<DemoMode>("edit");
  const [createMode, setCreateMode] = React.useState<CreateMode>("drag");
  const [dayRangeMode, setDayRangeMode] = React.useState<DayRangeMode>("work");
  const [customCreateOpen, setCustomCreateOpen] = React.useState(false);
  const [customCreateTitle, setCustomCreateTitle] = React.useState("New event");
  const [customCreateDraft, setCustomCreateDraft] = React.useState<null | { resourceId: string; start: Date; end: Date }>(null);

  const todayUtc = React.useMemo(() => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  }, []);

  const [events, setEvents] = React.useState<Array<CalendarTimelineEvent<EventMeta>>>(() => {
    const d0 = todayUtc;
    return [
      {
        id: "e-1",
        resourceId: "r-a",
        title: "Event 1",
        start: `${ymd(addUtcDays(d0, 1))}T00:00:00Z`,
        end: `${ymd(addUtcDays(d0, 4))}T00:00:00Z`,
        color: "var(--destructive-soft)",
        draggable: true,
        resizable: true,
      },
      {
        id: "e-2",
        resourceId: "r-c",
        title: "Event 2",
        start: `${ymd(addUtcDays(d0, 6))}T00:00:00Z`,
        end: `${ymd(addUtcDays(d0, 10))}T00:00:00Z`,
        color: "var(--primary-soft)",
        draggable: true,
        resizable: true,
      },
      {
        id: "e-3",
        resourceId: "r-d",
        title: "Event 3",
        start: `${ymd(addUtcDays(d0, 8))}T00:00:00Z`,
        end: `${ymd(addUtcDays(d0, 9))}T00:00:00Z`,
        color: "var(--info-soft)",
        draggable: true,
        resizable: true,
      },
      // Day-view event with time
      {
        id: "e-4",
        resourceId: "r-b",
        title: "Meeting (Day view)",
        start: `${ymd(d0)}T09:00:00Z`,
        end: `${ymd(d0)}T12:00:00Z`,
        color: "var(--success-soft)",
        draggable: true,
        resizable: true,
        meta: { kind: "meeting" },
      },
    ];
  });

  const tip =
    demoMode === "view"
      ? "Mode: View only. Click an event to open the sheet."
      : createMode === "drag"
        ? "Mode: Edit + Drag-to-create. Drag empty cells to create a new event."
        : "Mode: Edit + Click-to-create (custom). Click an empty cell to open a custom create sheet.";

  const demo = (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant={demoMode === "edit" ? "default" : "ghost"} size="sm" onClick={() => setDemoMode("edit")}>
            Mode: Edit
          </Button>
          <Button variant={demoMode === "view" ? "default" : "ghost"} size="sm" onClick={() => setDemoMode("view")}>
            Mode: View
          </Button>
          <Button
            variant={createMode === "drag" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCreateMode("drag")}
            disabled={demoMode === "view"}
          >
            Create: Drag
          </Button>
          <Button
            variant={createMode === "click" ? "default" : "ghost"}
            size="sm"
            onClick={() => setCreateMode("click")}
            disabled={demoMode === "view"}
          >
            Create: Click (custom)
          </Button>
          <Button variant={dayRangeMode === "full" ? "default" : "ghost"} size="sm" onClick={() => setDayRangeMode("full")} disabled={view !== "day"}>
            Day: 24h
          </Button>
          <Button variant={dayRangeMode === "work" ? "default" : "ghost"} size="sm" onClick={() => setDayRangeMode("work")} disabled={view !== "day"}>
            Day: Work hours
          </Button>
          <div className="text-xs text-muted-foreground">{tip}</div>
        </div>
      </div>

      <div className="h-[520px]">
        <CalendarTimeline<unknown, EventMeta>
          resources={resources}
          groups={groups}
          events={events}
          view={view}
          onViewChange={setView}
          date={date}
          onDateChange={setDate}
          weekStartsOn={1}
          slotMinWidth={56}
          dayRangeMode={dayRangeMode}
          workHours={{ startHour: 8, endHour: 17 }}
          maxLanesPerRow={3}
          enableLayoutResize
          enableEventSheet
          renderEventSheet={({ event, close }) => (
            <div className="space-y-3">
              <div className="text-sm font-semibold">{event.title ?? event.id}</div>
              {event.meta?.kind ? <div className="text-xs text-muted-foreground">Kind: {event.meta.kind}</div> : null}
              <Button variant="default" size="sm" onClick={close}>
                Close
              </Button>
            </div>
          )}
          interactions={demoMode === "view" ? { mode: "view" } : { mode: "edit", creatable: true, createMode, draggableEvents: true, resizableEvents: true }}
          onCreateEventClick={
            demoMode !== "view" && createMode === "click"
              ? ({ resourceId, start, end }) => {
                  setCustomCreateDraft({ resourceId, start, end });
                  setCustomCreateTitle("New event");
                  setCustomCreateOpen(true);
                }
              : undefined
          }
          onCreateEvent={(draft) => {
            setEvents((prev) => [
              ...prev,
              {
                id: `e_${prev.length + 1}`,
                resourceId: draft.resourceId,
                title: "New event",
                start: draft.start,
                end: draft.end,
                color: "var(--secondary-soft)",
                draggable: true,
                resizable: true,
              },
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

      <Sheet
        open={customCreateOpen}
        onOpenChange={(open) => {
          setCustomCreateOpen(open);
          if (!open) setCustomCreateDraft(null);
        }}
        title="Custom create event"
        description={
          customCreateDraft ? `resource=${customCreateDraft.resourceId} • ${customCreateDraft.start.toISOString()} → ${customCreateDraft.end.toISOString()}` : undefined
        }
      >
        <div className="space-y-4">
          <Input label="Title" value={customCreateTitle} onChange={(e) => setCustomCreateTitle(e.target.value)} />
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setCustomCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                if (!customCreateDraft) return;
                setEvents((prev) => [
                  ...prev,
                  {
                    id: `e_${prev.length + 1}`,
                    resourceId: customCreateDraft.resourceId,
                    title: customCreateTitle || "New event",
                    start: customCreateDraft.start,
                    end: customCreateDraft.end,
                    color: "var(--secondary-soft)",
                    draggable: true,
                    resizable: true,
                  },
                ]);
                setCustomCreateOpen(false);
              }}
              disabled={!customCreateDraft}
            >
              Create
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  );

  const code = `import { CalendarTimeline } from '@underverse-ui/underverse'
import { useState } from 'react'

const resources = [
  { id: 'r-a', label: 'Resource A', groupId: 'g-1' },
  { id: 'r-b', label: 'Resource B', groupId: 'g-1' },
]

const groups = [{ id: 'g-1', label: 'Group 1' }]

export function Example() {
  const [view, setView] = useState('day')
  const [createMode, setCreateMode] = useState('drag') // 'drag' | 'click'
  const [dayRangeMode, setDayRangeMode] = useState('work') // 'full' | 'work'
  const [events, setEvents] = useState([
    { id: 'e-1', resourceId: 'r-a', title: 'Event 1', start: '2026-01-03T00:00:00Z', end: '2026-01-05T00:00:00Z' }, // end exclusive
    { id: 'e-2', resourceId: 'r-b', title: 'Meeting', start: '2026-01-03T09:00:00Z', end: '2026-01-03T12:00:00Z' },
  ])

  return (
    <div className="h-[520px]">
      <CalendarTimeline
        resources={resources}
        groups={groups}
        events={events}
        view={view}
        onViewChange={setView}
        dayRangeMode={dayRangeMode}
        workHours={{ startHour: 8, endHour: 17 }}
        // locale/timeZone automatically follow the app/user settings by default
        interactions={{ mode: 'edit', creatable: true, createMode, draggableEvents: true, resizableEvents: true }}
        onCreateEvent={(draft) => {
          setEvents((prev) => [...prev, { id: String(prev.length + 1), resourceId: draft.resourceId, start: draft.start, end: draft.end, title: 'New event' }])
        }}
        onCreateEventClick={({ resourceId, start, end }) => {
          // only when interactions.createMode === 'click'
          setEvents((prev) => [...prev, { id: String(prev.length + 1), resourceId, start, end, title: 'New event (custom)' }])
        }}
        onEventMove={({ eventId, resourceId, start, end }) => {
          setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, resourceId, start, end } : e)))
        }}
        onEventResize={({ eventId, start, end }) => {
          setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, start, end } : e)))
        }}
      />
    </div>
  )
}`;

  const rows: PropsRow[] = [
    { property: "resources", description: t("props.calendarTimeline.resources"), type: "CalendarTimelineResource[]", default: "-" },
    { property: "events", description: t("props.calendarTimeline.events"), type: "CalendarTimelineEvent[]", default: "-" },
    { property: "size", description: t("props.calendarTimeline.size"), type: '"sm" | "md" | "xl"', default: '"md"' },
    { property: "enableEventSheet", description: t("props.calendarTimeline.enableEventSheet"), type: "boolean", default: "false" },
    { property: "eventSheetSize", description: t("props.calendarTimeline.eventSheetSize"), type: '"sm" | "md" | "lg" | "xl" | "full"', default: '"md"' },
    {
      property: "renderEventSheet",
      description: t("props.calendarTimeline.renderEventSheet"),
      type: "(args) => ReactNode",
      default: "—",
    },
    { property: "selectedEventId", description: t("props.calendarTimeline.selectedEventId"), type: "string | null", default: "—" },
    { property: "defaultSelectedEventId", description: t("props.calendarTimeline.defaultSelectedEventId"), type: "string | null", default: "null" },
    { property: "onSelectedEventIdChange", description: t("props.calendarTimeline.onSelectedEventIdChange"), type: "(eventId: string | null) => void", default: "—" },
    { property: "eventSheetOpen", description: t("props.calendarTimeline.eventSheetOpen"), type: "boolean", default: "—" },
    { property: "defaultEventSheetOpen", description: t("props.calendarTimeline.defaultEventSheetOpen"), type: "boolean", default: "false" },
    { property: "onEventSheetOpenChange", description: t("props.calendarTimeline.onEventSheetOpenChange"), type: "(open: boolean) => void", default: "—" },
    { property: "view", description: t("props.calendarTimeline.view"), type: "'month' | 'week' | 'day'", default: "'month'" },
    { property: "defaultView", description: t("props.calendarTimeline.defaultView"), type: "'month' | 'week' | 'day'", default: "'month'" },
    { property: "onViewChange", description: t("props.calendarTimeline.onViewChange"), type: "(view: CalendarTimelineView) => void", default: "—" },
    { property: "date", description: t("props.calendarTimeline.date"), type: "Date", default: "new Date()" },
    { property: "defaultDate", description: t("props.calendarTimeline.defaultDate"), type: "Date", default: "new Date()" },
    { property: "onDateChange", description: t("props.calendarTimeline.onDateChange"), type: "(date: Date) => void", default: "—" },
    { property: "weekStartsOn", description: t("props.calendarTimeline.weekStartsOn"), type: "0 | 1 | 2 | 3 | 4 | 5 | 6", default: "1" },
    { property: "timeZone", description: t("props.calendarTimeline.timeZone"), type: "string (IANA TZ)", default: "Intl resolved" },
    { property: "locale", description: t("props.calendarTimeline.locale"), type: "string (BCP47)", default: "from i18n" },
    { property: "labels", description: t("props.calendarTimeline.labels"), type: "CalendarTimelineLabels", default: "—" },
    { property: "formatters", description: t("props.calendarTimeline.formatters"), type: "CalendarTimelineFormatters", default: "—" },
    { property: "groups", description: t("props.calendarTimeline.groups"), type: "CalendarTimelineGroup[]", default: "-" },
    { property: "groupCollapsed", description: t("props.calendarTimeline.groupCollapsed"), type: "Record<string, boolean>", default: "-" },
    { property: "defaultGroupCollapsed", description: t("props.calendarTimeline.defaultGroupCollapsed"), type: "Record<string, boolean>", default: "{}" },
    { property: "onGroupCollapsedChange", description: t("props.calendarTimeline.onGroupCollapsedChange"), type: "(next: Record<string, boolean>) => void", default: "—" },
    { property: "resourceColumnWidth", description: t("props.calendarTimeline.resourceColumnWidth"), type: "number | string", default: "by size" },
    { property: "rowHeight", description: t("props.calendarTimeline.rowHeight"), type: "number", default: "by size" },
    { property: "slotMinWidth", description: t("props.calendarTimeline.slotMinWidth"), type: "number", default: "by size" },
    { property: "dayTimeStepMinutes", description: t("props.calendarTimeline.dayTimeStepMinutes"), type: "number", default: "60" },
    { property: "dayRangeMode", description: t("props.calendarTimeline.dayRangeMode"), type: "'full' | 'work'", default: "'full'" },
    { property: "workHours", description: t("props.calendarTimeline.workHours"), type: "{ startHour: number; endHour: number }", default: "{ startHour: 8, endHour: 17 }" },
    { property: "maxLanesPerRow", description: t("props.calendarTimeline.maxLanesPerRow"), type: "number", default: "3" },
    { property: "now", description: t("props.calendarTimeline.now"), type: "Date", default: "new Date()" },
    { property: "enableLayoutResize", description: t("props.calendarTimeline.enableLayoutResize"), type: "boolean | {column?: boolean; row?: boolean}", default: "false" },
    { property: "defaultResourceColumnWidth", description: t("props.calendarTimeline.defaultResourceColumnWidth"), type: "number", default: "-" },
    { property: "onResourceColumnWidthChange", description: t("props.calendarTimeline.onResourceColumnWidthChange"), type: "(width: number) => void", default: "-" },
    { property: "minResourceColumnWidth", description: t("props.calendarTimeline.minResourceColumnWidth"), type: "number", default: "160" },
    { property: "maxResourceColumnWidth", description: t("props.calendarTimeline.maxResourceColumnWidth"), type: "number", default: "520" },
    { property: "defaultRowHeight", description: t("props.calendarTimeline.defaultRowHeight"), type: "number", default: "-" },
    { property: "onRowHeightChange", description: t("props.calendarTimeline.onRowHeightChange"), type: "(height: number) => void", default: "-" },
    { property: "minRowHeight", description: t("props.calendarTimeline.minRowHeight"), type: "number", default: "36" },
    { property: "maxRowHeight", description: t("props.calendarTimeline.maxRowHeight"), type: "number", default: "120" },
    { property: "rowHeights", description: t("props.calendarTimeline.rowHeights"), type: "Record<string, number>", default: "-" },
    { property: "defaultRowHeights", description: t("props.calendarTimeline.defaultRowHeights"), type: "Record<string, number>", default: "-" },
    { property: "onRowHeightsChange", description: t("props.calendarTimeline.onRowHeightsChange"), type: "(next: Record<string, number>) => void", default: "-" },
    { property: "renderResource", description: t("props.calendarTimeline.renderResource"), type: "(resource) => ReactNode", default: "—" },
    { property: "renderGroup", description: t("props.calendarTimeline.renderGroup"), type: "(group, args) => ReactNode", default: "—" },
    {
      property: "renderEvent",
      description: t("props.calendarTimeline.renderEvent"),
      type: "(event, layout: { left: number; width: number; lane: number; height: number; timeText: string }) => ReactNode",
      default: "—",
    },
    { property: "interactions", description: t("props.calendarTimeline.interactions"), type: "CalendarTimelineInteractions", default: "-" },
    { property: "interactions.mode", description: t("props.calendarTimeline.interactionsMode"), type: "'edit' | 'view'", default: "'edit'" },
    { property: "interactions.createMode", description: t("props.calendarTimeline.createMode"), type: "'drag' | 'click'", default: "'drag'" },
    { property: "onRangeChange", description: t("props.calendarTimeline.onRangeChange"), type: "(range) => void", default: "—" },
    { property: "onEventClick", description: t("props.calendarTimeline.onEventClick"), type: "(event) => void", default: "—" },
    { property: "onEventDoubleClick", description: t("props.calendarTimeline.onEventDoubleClick"), type: "(event) => void", default: "—" },
    { property: "onCreateEventClick", description: t("props.calendarTimeline.onCreateEventClick"), type: "(args) => void", default: "—" },
    { property: "onCreateEvent", description: t("props.calendarTimeline.onCreateEvent"), type: "(draft) => void", default: "-" },
    { property: "onEventMove", description: t("props.calendarTimeline.onEventMove"), type: "(args) => void", default: "-" },
    { property: "onEventResize", description: t("props.calendarTimeline.onEventResize"), type: "(args) => void", default: "-" },
    { property: "onEventDelete", description: t("props.calendarTimeline.onEventDelete"), type: "(args) => void", default: "—" },
    { property: "onMoreClick", description: t("props.calendarTimeline.onMoreClick"), type: "(args) => void", default: "—" },
    { property: "virtualization", description: t("props.calendarTimeline.virtualization"), type: "{enabled?: boolean; overscan?: number}", default: "—" },
  ];
  const docs = <PropsDocsTable rows={rows} markdownFile="CalendarTimeline.md" />;

  return (
    <Tabs
      tabs={[
        { value: "preview", label: t("tabs.preview"), content: <div className="p-1">{demo}</div> },
        { value: "code", label: t("tabs.code"), content: <CodeBlock code={code} /> },
        { value: "docs", label: t("tabs.document"), content: <div className="p-1">{docs}</div> },
      ]}
      variant="underline"
      size="sm"
    />
  );
}
