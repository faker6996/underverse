"use client";

import * as React from "react";
import { DateTimePicker } from "@/components/ui/DateTimePicker";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { useTranslations } from "next-intl";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function DateTimePickerExample() {
  const t = useTranslations("DocsUnderverse");
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [date2, setDate2] = React.useState<Date | undefined>();

  const demo = (
    <div className="space-y-8 min-h-100">
      <div className="max-w-sm space-y-4">
        <DateTimePicker label="Schedule Meeting (Default)" value={date} onChange={setDate} placeholder="Pick a date and time" />

        <div className="text-sm text-muted-foreground">Selected: {date ? date.toLocaleString() : "None"}</div>
      </div>

      <div className="max-w-sm space-y-4">
        <DateTimePicker
          label="Event Start (12h format + Seconds)"
          value={date2}
          onChange={setDate2}
          format="12"
          includeSeconds
          placeholder="Select start time"
        />
        <div className="text-sm text-muted-foreground">Selected: {date2 ? date2.toLocaleString() : "None"}</div>
      </div>

      <div className="max-w-sm space-y-4">
        <DateTimePicker
          label="Restricted Date (Min: Today)"
          value={undefined}
          onChange={() => {}}
          minDate={new Date()}
          placeholder="Future dates only"
        />
      </div>
    </div>
  );

  const code =
    `import { DateTimePicker } from '@underverse-ui/underverse'\n\n` +
    `// Basic \n` +
    `<DateTimePicker \n` +
    `  value={date} \n` +
    `  onChange={setDate} \n` +
    `  label="Schedule Meeting"\n` +
    `/>\n\n` +
    `// 12h format with seconds\n` +
    `<DateTimePicker \n` +
    `  format="12"\n` +
    `  includeSeconds\n` +
    `  label="Event Start"\n` +
    `/>\n\n`;

  const rows: PropsRow[] = [
    { property: "value", description: "Selected Date object", type: "Date", default: "-" },
    { property: "onChange", description: "Update callback", type: "(date: Date | undefined) => void", default: "-" },
    { property: "format", description: "Time format", type: "'12' | '24'", default: "'24'" },
    { property: "includeSeconds", description: "Enable seconds selection", type: "boolean", default: "false" },
    { property: "minDate", description: "Minimum selectable date", type: "Date", default: "-" },
    { property: "maxDate", description: "Maximum selectable date", type: "Date", default: "-" },
    { property: "doneLabel", description: "Label for Done button", type: "string", default: "Done" },
    { property: "clearLabel", description: "Label for Clear button", type: "string", default: "Clear" },
  ];

  return (
    <Tabs
      tabs={[
        { value: "preview", label: t("tabs.preview"), content: <div className="p-1">{demo}</div> },
        { value: "code", label: t("tabs.code"), content: <CodeBlock code={code} /> },
        {
          value: "docs",
          label: t("tabs.document"),
          content: (
            <div className="p-1">
              <PropsDocsTable rows={rows} />
            </div>
          ),
        },
      ]}
      variant="underline"
      size="sm"
    />
  );
}
