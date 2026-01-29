"use client";

import * as React from "react";
import CalendarTimeline, {
  type CalendarTimelineEvent,
  type CalendarTimelineResource,
  type CalendarTimelineGroup,
  type CalendarTimelineView,
} from "@/components/ui/CalendarTimeline";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { useTranslations } from "next-intl";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

type EventMeta = { kind?: "meeting" | "task" };

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

  const demo = (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="text-xs text-muted-foreground">
          Tip: Drag event to move, drag edges to resize, drag empty cells to create (when enabled).
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
          maxLanesPerRow={3}
          interactions={{ creatable: true, draggableEvents: true, resizableEvents: true }}
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
  const [events, setEvents] = useState([
    { id: 'e-1', resourceId: 'r-a', title: 'Event 1', start: '2026-01-03T00:00:00Z', end: '2026-01-05T00:00:00Z' }, // end exclusive
  ])

  return (
    <div className="h-[520px]">
      <CalendarTimeline
        resources={resources}
        groups={groups}
        events={events}
        defaultView="month"
        // locale/timeZone automatically follow the app/user settings by default
        interactions={{ creatable: true, draggableEvents: true, resizableEvents: true }}
        onCreateEvent={(draft) => {
          setEvents((prev) => [...prev, { id: String(prev.length + 1), resourceId: draft.resourceId, start: draft.start, end: draft.end, title: 'New event' }])
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
    { property: "view", description: t("props.calendarTimeline.view"), type: "'month' | 'week' | 'day'", default: "'month'" },
    { property: "date", description: t("props.calendarTimeline.date"), type: "Date", default: "new Date()" },
    { property: "timeZone", description: t("props.calendarTimeline.timeZone"), type: "string (IANA TZ)", default: "Intl resolved" },
    { property: "locale", description: t("props.calendarTimeline.locale"), type: "string (BCP47)", default: "from i18n" },
    { property: "groups", description: t("props.calendarTimeline.groups"), type: "CalendarTimelineGroup[]", default: "-" },
    { property: "groupCollapsed", description: t("props.calendarTimeline.groupCollapsed"), type: "Record<string, boolean>", default: "-" },
    { property: "interactions", description: t("props.calendarTimeline.interactions"), type: "{creatable; draggableEvents; resizableEvents}", default: "-" },
    { property: "onCreateEvent", description: t("props.calendarTimeline.onCreateEvent"), type: "(draft) => void", default: "-" },
    { property: "onEventMove", description: t("props.calendarTimeline.onEventMove"), type: "(args) => void", default: "-" },
    { property: "onEventResize", description: t("props.calendarTimeline.onEventResize"), type: "(args) => void", default: "-" },
  ];
  const docs = <PropsDocsTable rows={rows} />;

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
