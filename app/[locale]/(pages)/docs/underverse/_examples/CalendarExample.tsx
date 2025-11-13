"use client";

import * as React from "react";
import Calendar from "@/components/ui/Calendar";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { useTranslations } from "next-intl";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function CalendarExample() {
  const t = useTranslations("DocsUnderverse");
  const [selected, setSelected] = React.useState<Date | undefined>(new Date());
  const events = React.useMemo(() => [
    { date: new Date(), title: 'Today', color: '#f59e0b' },
    { date: new Date(new Date().setDate(new Date().getDate() + 1)), title: 'Tomorrow', color: '#10b981' },
    { date: new Date(new Date().setDate(new Date().getDate() + 3)), title: 'Event', color: '#3b82f6' },
  ], []);

  const demo = (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <p className="text-sm font-medium mb-2">Single select</p>
          <Calendar
            value={selected}
            onSelect={(v) => typeof v === 'object' && v instanceof Date ? setSelected(v) : undefined}
            events={events}
          />
          <div className="text-xs text-muted-foreground font-mono mt-2">{selected?.toDateString() || '—'}</div>
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Range select</p>
          <Calendar
            selectMode="range"
            defaultValue={{ start: new Date(), end: undefined }}
            events={events}
          />
        </div>
        <div>
          <p className="text-sm font-medium mb-2">Week view</p>
          <Calendar display="week" events={events} />
        </div>
      </div>
      <div>
        <p className="text-sm font-medium mb-2">Multi-month (2)</p>
        <Calendar months={2} />
      </div>
      <div>
        <p className="text-sm font-medium mb-2">Min/Max + disabled dates</p>
        <Calendar
          months={2}
          minDate={new Date(new Date().getFullYear(), new Date().getMonth(), 1)}
          maxDate={new Date(new Date().getFullYear(), new Date().getMonth() + 1, 28)}
          disabledDates={(d) => d.getDay() === 0}
        />
      </div>
    </div>
  );

  const code =
    `import { Calendar } from '@underverse-ui/underverse'\n` +
    `import { useState } from 'react'\n\n` +
    `// Single select\n` +
    `const [selected, setSelected] = useState<Date | undefined>(new Date())\n` +
    `const events = [\n` +
    `  { date: new Date(), title: 'Today', color: '#f59e0b' },\n` +
    `  { date: new Date(new Date().setDate(new Date().getDate() + 1)), title: 'Tomorrow', color: '#10b981' },\n` +
    `  { date: new Date(new Date().setDate(new Date().getDate() + 3)), title: 'Event', color: '#3b82f6' },\n` +
    `]\n\n` +
    `<Calendar\n` +
    `  value={selected}\n` +
    `  onSelect={(v) => typeof v === 'object' && v instanceof Date ? setSelected(v) : undefined}\n` +
    `  events={events}\n` +
    `/>\n` +
    `<div className="text-xs text-muted-foreground font-mono mt-2">\n` +
    `  {selected?.toDateString() || '—'}\n` +
    `</div>\n\n` +
    `// Range select\n` +
    `<Calendar\n` +
    `  selectMode='range'\n` +
    `  defaultValue={{ start: new Date(), end: undefined }}\n` +
    `  events={events}\n` +
    `/>\n\n` +
    `// Week view\n` +
    `<Calendar display='week' events={events} />\n\n` +
    `// Multi-month (2)\n` +
    `<Calendar months={2} />\n\n` +
    `// Min/Max + disabled dates\n` +
    `<Calendar\n` +
    `  months={2}\n` +
    `  minDate={new Date(new Date().getFullYear(), new Date().getMonth(), 1)}\n` +
    `  maxDate={new Date(new Date().getFullYear(), new Date().getMonth() + 1, 28)}\n` +
    `  disabledDates={(d) => d.getDay() === 0}\n` +
    `/>`;

  const rows: PropsRow[] = [
    { property: "month", description: t("props.calendar.month"), type: "Date", default: "-" },
    { property: "defaultMonth", description: t("props.calendar.defaultMonth"), type: "Date", default: "-" },
    { property: "onMonthChange", description: t("props.calendar.onMonthChange"), type: "(date: Date) => void", default: "-" },
    { property: "value", description: t("props.calendar.value"), type: "Date | Date[] | {start?: Date; end?: Date}", default: "-" },
    { property: "defaultValue", description: t("props.calendar.defaultValue"), type: "Date | Date[] | {start?: Date; end?: Date}", default: "-" },
    { property: "onSelect", description: t("props.calendar.onSelect"), type: "(value) => void", default: "-" },
    { property: "selectMode", description: t("props.calendar.selectMode"), type: "'single' | 'multiple' | 'range'", default: "'single'" },
    { property: "weekStartsOn", description: t("props.calendar.weekStartsOn"), type: "0|1|2|3|4|5|6", default: "0" },
    { property: "showWeekdays", description: t("props.calendar.showWeekdays"), type: "boolean", default: "true" },
    { property: "showHeader", description: t("props.calendar.showHeader"), type: "boolean", default: "true" },
    { property: "size", description: t("props.calendar.size"), type: "'sm' | 'md'", default: "'md'" },
    { property: "events", description: t("props.calendar.events"), type: "CalendarEvent[]", default: "-" },
    { property: "renderDay", description: t("props.calendar.renderDay"), type: "(args) => ReactNode", default: "-" },
    { property: "labels", description: t("props.calendar.labels"), type: "{weekdays?, month?, prev?, next?}", default: "-" },
    { property: "display", description: t("props.calendar.display"), type: "'month' | 'week'", default: "'month'" },
    { property: "months", description: t("props.calendar.months"), type: "number", default: "1" },
    { property: "minDate", description: t("props.calendar.minDate"), type: "Date", default: "-" },
    { property: "maxDate", description: t("props.calendar.maxDate"), type: "Date", default: "-" },
    { property: "disabledDates", description: t("props.calendar.disabledDates"), type: "Date[] | (date: Date) => boolean", default: "-" },
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
