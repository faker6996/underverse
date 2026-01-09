"use client";

import React from "react";
import { DatePicker, DateRangePicker } from "@/components/ui/DatePicker";
import CodeBlock from "../_components/CodeBlock";
import IntlDemoProvider from "../_components/IntlDemoProvider";
import { Tabs } from "@/components/ui/Tab";
import { useTranslations } from "next-intl";
import { useLocale } from "@/hooks/useLocale";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function DatePickerExample() {
  const [date1, setDate1] = React.useState<Date | undefined>();
  const [date2, setDate2] = React.useState<Date | undefined>();
  const [rangeStart, setRangeStart] = React.useState<Date | undefined>();
  const [rangeEnd, setRangeEnd] = React.useState<Date | undefined>();
  const [advancedDate, setAdvancedDate] = React.useState<Date | undefined>();
  const [advancedRangeStart, setAdvancedRangeStart] = React.useState<Date | undefined>();
  const [advancedRangeEnd, setAdvancedRangeEnd] = React.useState<Date | undefined>();
  const [futureOnlyDate, setFutureOnlyDate] = React.useState<Date | undefined>();
  const [futureRangeStart, setFutureRangeStart] = React.useState<Date | undefined>();
  const [futureRangeEnd, setFutureRangeEnd] = React.useState<Date | undefined>();
  const t = useTranslations("DatePicker");
  const td = useTranslations("DocsUnderverse");
  const locale = useLocale();
  const weekdays = React.useMemo(() => {
    if (locale === "vi") return ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
    if (locale === "ko") return ["일", "월", "화", "수", "목", "금", "토"];
    if (locale === "ja") return ["日", "月", "火", "水", "木", "金", "土"];
    return ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
  }, [locale]);

  const code =
    `import { DatePicker, DateRangePicker } from '@underverse-ui/underverse'\n` +
    `import { useTranslations } from 'next-intl'\n` +
    `import { useLocale } from '@/hooks/useLocale'\n\n` +
    `const [date1, setDate1] = useState<Date | undefined>()\n` +
    `const [date2, setDate2] = useState<Date | undefined>()\n` +
    `const [rangeStart, setRangeStart] = useState<Date | undefined>()\n` +
    `const [rangeEnd, setRangeEnd] = useState<Date | undefined>()\n` +
    `const t = useTranslations('DatePicker')\n` +
    `const locale = useLocale()\n` +
    `const weekdays = useMemo(() => {\n` +
    `  if (locale === 'vi') return ['CN','T2','T3','T4','T5','T6','T7']\n` +
    `  if (locale === 'ko') return ['일','월','화','수','목','금','토']\n` +
    `  if (locale === 'ja') return ['日','月','火','水','木','金','土']\n` +
    `  return ['Su','Mo','Tu','We','Th','Fr','Sa']\n` +
    `}, [locale])\n\n` +
    `// 1) Basic (md) + Small (sm)\n` +
    `<DatePicker value={date1} onChange={setDate1} label='Default (md)' clearLabel={t('clear')} weekdayLabels={weekdays} />\n` +
    `<DatePicker value={date2} onChange={setDate2} size='sm' label='Small (sm)' clearLabel={t('clear')} weekdayLabels={weekdays} />\n\n` +
    `// 2) Placeholder + required\n` +
    `<DatePicker value={date1} onChange={setDate1} label='Required' required placeholder='Select date' clearLabel={t('clear')} />\n\n` +
    `// 3) Disabled\n` +
    `<DatePicker value={new Date()} onChange={()=>{}} label='Disabled' disabled />\n\n` +
    `// 4) DateRangePicker\n` +
    `<DateRangePicker startDate={rangeStart} endDate={rangeEnd} onChange={(s,e)=>{ setRangeStart(s); setRangeEnd(e); }} />\n\n` +
    `// 5) Advanced example: small DatePicker with custom weekdayLabels + required\n` +
    `<DatePicker\n` +
    `  value={advancedDate}\n` +
    `  onChange={setAdvancedDate}\n` +
    `  size='sm'\n` +
    `  placeholder='Pick a date (sm)'\n` +
    `  weekdayLabels={['Su','Mo','Tu','We','Th','Fr','Sa']}\n` +
    `  label='Small date (sm)'\n` +
    `  required\n` +
    `/>\n` +
    `<DateRangePicker startDate={advancedRangeStart} endDate={advancedRangeEnd} onChange={(s,e)=>{ setAdvancedRangeStart(s); setAdvancedRangeEnd(e); }} />\n\n` +
    `// 6) Disable Past Dates\n` +
    `<DatePicker value={futureOnlyDate} onChange={setFutureOnlyDate} label='Future Only' disablePastDates />\n` +
    `<DateRangePicker startDate={futureRangeStart} endDate={futureRangeEnd} onChange={(s,e)=>{ setFutureRangeStart(s); setFutureRangeEnd(e); }} disablePastDates />`;

  const demo = (
    <div className="space-y-6">
      {/* 1) Basic + Small */}
      <div className="grid md:grid-cols-2 gap-3">
        <DatePicker value={date1} onChange={setDate1} label="Default (md)" clearLabel={t("clear")} weekdayLabels={weekdays} />
        <DatePicker value={date2} onChange={setDate2} size="sm" label="Small (sm)" clearLabel={t("clear")} weekdayLabels={weekdays} />
      </div>
      <div className="text-sm text-muted-foreground">
        Value 1: {date1?.toLocaleDateString() || "(none)"} | Value 2: {date2?.toLocaleDateString() || "(none)"}
      </div>

      {/* 2) Placeholder + required */}
      <DatePicker value={date1} onChange={setDate1} label="Required" required placeholder="Select date" clearLabel={t("clear")} />

      {/* 3) Disabled */}
      <DatePicker value={new Date()} onChange={() => {}} label="Disabled" disabled />

      {/* 4) DateRangePicker */}
      <div className="space-y-2">
        <p className="text-sm font-medium">DateRangePicker</p>
        <DateRangePicker
          startDate={rangeStart}
          endDate={rangeEnd}
          onChange={(s, e) => {
            setRangeStart(s);
            setRangeEnd(e);
          }}
        />
        <div className="text-sm text-muted-foreground">
          Range: {rangeStart?.toLocaleDateString() || "(start)"} - {rangeEnd?.toLocaleDateString() || "(end)"}
        </div>
      </div>

      {/* 5) Disable Past Dates */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Disable Past Dates</p>
        <div className="grid md:grid-cols-2 gap-4">
          <DatePicker value={futureOnlyDate} onChange={setFutureOnlyDate} label="Future Only" disablePastDates clearLabel={t("clear")} />
          <DateRangePicker
            startDate={futureRangeStart}
            endDate={futureRangeEnd}
            onChange={(s, e) => {
              setFutureRangeStart(s);
              setFutureRangeEnd(e);
            }}
            disablePastDates
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Future Date: {futureOnlyDate?.toLocaleDateString() || "(none)"} | Range: {futureRangeStart?.toLocaleDateString() || "(start)"} -{" "}
          {futureRangeEnd?.toLocaleDateString() || "(end)"}
        </div>
      </div>

      {/* 6) Advanced corner cases */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Advanced</p>
        <div className="grid md:grid-cols-2 gap-4">
          <DatePicker
            value={advancedDate}
            onChange={setAdvancedDate}
            size="sm"
            placeholder="Pick a date (sm)"
            weekdayLabels={["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]}
            label="Small date (sm)"
            required
          />
          <DateRangePicker
            startDate={advancedRangeStart as any}
            endDate={advancedRangeEnd as any}
            onChange={(s, e) => {
              setAdvancedRangeStart(s);
              setAdvancedRangeEnd(e);
            }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <IntlDemoProvider>
      <Tabs
        tabs={[
          { value: "preview", label: td("tabs.preview"), content: <div className="p-1">{demo}</div> },
          { value: "code", label: td("tabs.code"), content: <CodeBlock code={code} /> },
          {
            value: "docs",
            label: td("tabs.document"),
            content: (
              <div className="p-1 space-y-6">
                <div>
                  <p className="text-sm font-medium">DatePicker</p>
                  <PropsDocsTable
                    rows={[
                      { property: "id", description: td("props.datePicker.id"), type: "string", default: "-" },
                      { property: "value", description: td("props.datePicker.value"), type: "Date", default: "-" },
                      { property: "onChange", description: td("props.datePicker.onChange"), type: "(date: Date | undefined) => void", default: "-" },
                      { property: "placeholder", description: td("props.datePicker.placeholder"), type: "string", default: "-" },
                      { property: "className", description: td("props.datePicker.className"), type: "string", default: "-" },
                      { property: "disabled", description: td("props.datePicker.disabled"), type: "boolean", default: "false" },
                      { property: "size", description: td("props.datePicker.size"), type: '"sm" | "md"', default: '"md"' },
                      { property: "label", description: td("props.datePicker.label"), type: "string", default: "-" },
                      { property: "required", description: td("props.datePicker.required"), type: "boolean", default: "false" },
                      { property: "todayLabel", description: td("props.datePicker.todayLabel"), type: "string", default: "-" },
                      { property: "clearLabel", description: td("props.datePicker.clearLabel"), type: "string", default: "-" },
                      { property: "weekdayLabels", description: td("props.datePicker.weekdayLabels"), type: "string[]", default: "-" },
                      { property: "disablePastDates", description: td("props.datePicker.disablePastDates"), type: "boolean", default: "false" },
                    ]}
                    order={[
                      "id",
                      "value",
                      "onChange",
                      "placeholder",
                      "className",
                      "disabled",
                      "size",
                      "label",
                      "required",
                      "todayLabel",
                      "clearLabel",
                      "weekdayLabels",
                      "disablePastDates",
                    ]}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">DateRangePicker</p>
                  <PropsDocsTable
                    rows={[
                      { property: "startDate", description: td("props.dateRangePicker.startDate"), type: "Date", default: "-" },
                      { property: "endDate", description: td("props.dateRangePicker.endDate"), type: "Date", default: "-" },
                      {
                        property: "onChange",
                        description: td("props.dateRangePicker.onChange"),
                        type: "(start: Date, end: Date) => void",
                        default: "-",
                      },
                      {
                        property: "placeholder",
                        description: td("props.dateRangePicker.placeholder"),
                        type: "string",
                        default: '"Select date range..."',
                      },
                      { property: "className", description: td("props.dateRangePicker.className"), type: "string", default: "-" },
                      { property: "disablePastDates", description: td("props.dateRangePicker.disablePastDates"), type: "boolean", default: "false" },
                    ]}
                    order={["startDate", "endDate", "onChange", "placeholder", "className", "disablePastDates"]}
                  />
                </div>
              </div>
            ),
          },
        ]}
        variant="underline"
        size="sm"
      />
    </IntlDemoProvider>
  );
}
