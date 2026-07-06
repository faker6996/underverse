"use client";

import React from "react";
import { LunarDatePicker, LunarDateRangePicker } from "@/components/ui/LunarDatePicker";
import type { LunarPickerValue } from "@/components/ui/LunarDatePicker";
import CodeBlock from "../_components/CodeBlock";
import IntlDemoProvider from "../_components/IntlDemoProvider";
import { Tabs } from "@/components/ui/Tab";
import { useTranslations } from "next-intl";
import { useLocale } from "@/hooks/useLocale";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function LunarDatePickerExample() {
  const [date1, setDate1] = React.useState<LunarPickerValue | undefined>();
  const [date2, setDate2] = React.useState<LunarPickerValue | undefined>();
  const [requiredDate, setRequiredDate] = React.useState<LunarPickerValue | undefined>();
  const [requiredRangeStart, setRequiredRangeStart] = React.useState<LunarPickerValue | undefined>();
  const [requiredRangeEnd, setRequiredRangeEnd] = React.useState<LunarPickerValue | undefined>();
  const [rangeStart, setRangeStart] = React.useState<LunarPickerValue | undefined>();
  const [rangeEnd, setRangeEnd] = React.useState<LunarPickerValue | undefined>();
  const [futureOnlyDate, setFutureOnlyDate] = React.useState<LunarPickerValue | undefined>();
  const [futureRangeStart, setFutureRangeStart] = React.useState<LunarPickerValue | undefined>();
  const [futureRangeEnd, setFutureRangeEnd] = React.useState<LunarPickerValue | undefined>();
  const [advancedDate, setAdvancedDate] = React.useState<LunarPickerValue | undefined>();
  const [advancedRangeStart, setAdvancedRangeStart] = React.useState<LunarPickerValue | undefined>();
  const [advancedRangeEnd, setAdvancedRangeEnd] = React.useState<LunarPickerValue | undefined>();

  const t = useTranslations("DatePicker");
  const td = useTranslations("DocsUnderverse");
  const locale = useLocale();

  const code = 
    `import { LunarDatePicker, LunarDateRangePicker, type LunarPickerValue } from '@underverse-ui/underverse'\n` +
    `import { useTranslations } from 'next-intl'\n\n` +
    `const [date1, setDate1] = useState<LunarPickerValue | undefined>()\n` +
    `const [date2, setDate2] = useState<LunarPickerValue | undefined>()\n` +
    `const [rangeStart, setRangeStart] = useState<LunarPickerValue | undefined>()\n` +
    `const [rangeEnd, setRangeEnd] = useState<LunarPickerValue | undefined>()\n` +
    `const t = useTranslations('DatePicker')\n\n` +
    `// 1) Basic (md) + Small (sm)\n` +
    `<LunarDatePicker value={date1} onChange={setDate1} label='Default (md)' clearLabel={t('clear')} />\n` +
    `<LunarDatePicker value={date2} onChange={setDate2} size='sm' label='Small (sm)' clearLabel={t('clear')} />\n\n` +
    `// 2) Required validation via form submit\n` +
    `<form>\n` +
    `  <LunarDatePicker value={requiredDate} onChange={setRequiredDate} label='Required' required placeholder='Select lunar date' clearLabel={t('clear')} />\n` +
    `  <LunarDateRangePicker\n` +
    `    label='Required range'\n` +
    `    required\n` +
    `    startDate={requiredRangeStart}\n` +
    `    endDate={requiredRangeEnd}\n` +
    `    onChange={(s,e)=>{ setRequiredRangeStart(s); setRequiredRangeEnd(e); }}\n` +
    `  />\n` +
    `  <button type='submit'>Submit</button>\n` +
    `</form>\n\n` +
    `// 3) Disabled\n` +
    `<LunarDatePicker value={{ day: 1, month: 1, year: 2026, is_leap_month: false }} onChange={() => {}} label='Disabled' disabled />\n\n` +
    `// 4) DateRangePicker\n` +
    `<LunarDateRangePicker startDate={rangeStart} endDate={rangeEnd} onChange={(s,e)=>{ setRangeStart(s); setRangeEnd(e); }} />\n\n` +
    `// 5) Disable Past Dates\n` +
    `<LunarDatePicker value={futureOnlyDate} onChange={setFutureOnlyDate} label='Future Only' disablePastDates clearLabel={t('clear')} />\n` +
    `<LunarDateRangePicker startDate={futureRangeStart} endDate={futureRangeEnd} onChange={(s,e)=>{ setFutureRangeStart(s); setFutureRangeEnd(e); }} disablePastDates />\n\n` +
    `// 6) Advanced corner cases\n` +
    `<LunarDatePicker\n` +
    `  value={advancedDate}\n` +
    `  onChange={setAdvancedDate}\n` +
    `  size='sm'\n` +
    `  placeholder='Pick a lunar date (sm)'\n` +
    `  label='Small lunar date (sm)'\n` +
    `  required\n` +
    `/>\n` +
    `<LunarDateRangePicker startDate={advancedRangeStart} endDate={advancedRangeEnd} onChange={(s,e)=>{ setAdvancedRangeStart(s); setAdvancedRangeEnd(e); }} />`;

  const formatLunar = (d: LunarPickerValue | undefined) => d ? `${d.day}/${d.month}/${d.year}` : "(none)";

  const demo = (
    <div className="space-y-6">
      {/* 1) Basic + Small */}
      <div className="grid md:grid-cols-2 gap-3">
        <LunarDatePicker value={date1} onChange={setDate1} label={td("examples.lunarDatePicker.defaultLabel")} clearLabel={t("clear")} />
        <LunarDatePicker value={date2} onChange={setDate2} size="sm" label={td("examples.lunarDatePicker.smallLabel")} clearLabel={t("clear")} />
      </div>
      <div className="text-sm text-muted-foreground">
        {td("examples.lunarDatePicker.value1")} {formatLunar(date1)} | {td("examples.lunarDatePicker.value2")} {formatLunar(date2)}
      </div>

      {/* 2) Placeholder + required */}
      <form className="max-w-sm space-y-3" onSubmit={(e) => e.preventDefault()}>
        <LunarDatePicker value={requiredDate} onChange={setRequiredDate} label={td("examples.lunarDatePicker.required")} required placeholder={td("examples.lunarDatePicker.pickLunarSm")} clearLabel={t("clear")} />
        <LunarDateRangePicker
          label={td("examples.lunarDatePicker.requiredRange")}
          required
          startDate={requiredRangeStart}
          endDate={requiredRangeEnd}
          onChange={(s, e) => {
            setRequiredRangeStart(s ?? undefined);
            setRequiredRangeEnd(e ?? undefined);
          }}
        />
        <button type="submit" className="rounded-full border border-border px-3 py-1.5 text-xs font-medium">
          {td("examples.lunarDatePicker.submit")}
        </button>
      </form>

      {/* 3) Disabled */}
      <LunarDatePicker value={{ day: 1, month: 1, year: 2026, is_leap_month: false }} onChange={() => {}} label={td("examples.lunarDatePicker.disabled")} disabled />

      {/* 4) DateRangePicker */}
      <div className="space-y-2">
        <p className="text-sm font-medium">{td("examples.lunarDatePicker.dateRangePicker")}</p>
        <LunarDateRangePicker
          startDate={rangeStart}
          endDate={rangeEnd}
          onChange={(s, e) => {
            setRangeStart(s ?? undefined);
            setRangeEnd(e ?? undefined);
          }}
        />
        <div className="text-xs text-muted-foreground">{td("examples.lunarDatePicker.helperText")}</div>
        <div className="text-sm text-muted-foreground">
          {td("examples.lunarDatePicker.range")} {formatLunar(rangeStart)} - {formatLunar(rangeEnd)}
        </div>
      </div>

      {/* 5) Disable Past Dates */}
      <div className="space-y-3">
        <p className="text-sm font-medium">{td("examples.lunarDatePicker.disablePastDates")}</p>
        <div className="grid md:grid-cols-2 gap-4">
          <LunarDatePicker value={futureOnlyDate} onChange={setFutureOnlyDate} label={td("examples.lunarDatePicker.futureOnly")} disablePastDates clearLabel={t("clear")} />
          <LunarDateRangePicker
            startDate={futureRangeStart}
            endDate={futureRangeEnd}
            onChange={(s, e) => {
              setFutureRangeStart(s ?? undefined);
              setFutureRangeEnd(e ?? undefined);
            }}
            disablePastDates
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {td("examples.lunarDatePicker.futureDate")} {formatLunar(futureOnlyDate)} | {td("examples.lunarDatePicker.range")} {formatLunar(futureRangeStart)} - {formatLunar(futureRangeEnd)}
        </div>
      </div>

      {/* 6) Advanced corner cases */}
      <div className="space-y-3">
        <p className="text-sm font-medium">{td("examples.lunarDatePicker.advanced")}</p>
        <div className="grid md:grid-cols-2 gap-4">
          <LunarDatePicker
            value={advancedDate}
            onChange={setAdvancedDate}
            size="sm"
            placeholder={td("examples.lunarDatePicker.pickLunarSm")}
            label={td("examples.lunarDatePicker.smallLunarSm")}
            required
          />
          <LunarDateRangePicker
            startDate={advancedRangeStart}
            endDate={advancedRangeEnd}
            onChange={(s, e) => {
              setAdvancedRangeStart(s ?? undefined);
              setAdvancedRangeEnd(e ?? undefined);
            }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <IntlDemoProvider>
      <Tabs id="lunar-date-picker-tabs"
        tabs={[
          { value: "preview", label: td("tabs.preview"), content: <div className="p-1">{demo}</div> },
          { value: "code", label: td("tabs.code"), content: <CodeBlock code={code} /> },
          {
            value: "docs",
            label: td("tabs.document"),
            content: (
              <div className="p-1 space-y-6">
                <div>
                  <p className="text-sm font-medium">LunarDatePicker</p>
                  <PropsDocsTable
                    rows={[
                      { property: "id", description: td("props.datePicker.id"), type: "string", default: "-" },
                      { property: "value", description: td("props.datePicker.value"), type: "LunarPickerValue", default: "-" },
                      { property: "onChange", description: td("props.datePicker.onChange"), type: "(date: LunarPickerValue | undefined) => void", default: "-" },
                      { property: "placeholder", description: td("props.datePicker.placeholder"), type: "string", default: "-" },
                      { property: "className", description: td("props.datePicker.className"), type: "string", default: "-" },
                      { property: "disabled", description: td("props.datePicker.disabled"), type: "boolean", default: "false" },
                      { property: "size", description: td("props.datePicker.size"), type: '"sm" | "md" | "lg"', default: '"md"' },
                      { property: "label", description: td("props.datePicker.label"), type: "string", default: "-" },
                      { property: "required", description: td("props.datePicker.required"), type: "boolean", default: "false" },
                      { property: "todayLabel", description: td("props.datePicker.todayLabel"), type: "string", default: "-" },
                      { property: "clearLabel", description: td("props.datePicker.clearLabel"), type: "string", default: "-" },
                      { property: "weekdayLabels", description: td("props.datePicker.weekdayLabels"), type: "string[]", default: "-" },
                      { property: "disablePastDates", description: td("props.datePicker.disablePastDates"), type: "boolean", default: "false" },
                      { property: "minDate", description: td("props.datePicker.minDate"), type: "LunarPickerValue", default: "-" },
                      { property: "maxDate", description: td("props.datePicker.maxDate"), type: "LunarPickerValue", default: "-" },
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
                      "minDate",
                      "maxDate",
                    ]}
                    markdownFile="DatePicker.md"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">LunarDateRangePicker</p>
                  <PropsDocsTable
                    rows={[
                      { property: "startDate", description: td("props.dateRangePicker.startDate"), type: "LunarPickerValue", default: "-" },
                      { property: "endDate", description: td("props.dateRangePicker.endDate"), type: "LunarPickerValue", default: "-" },
                      { property: "id", description: td("props.dateRangePicker.id"), type: "string", default: "-" },
                      {
                        property: "onChange",
                        description: td("props.dateRangePicker.onChange"),
                        type: "(start: LunarPickerValue | undefined, end: LunarPickerValue | undefined) => void",
                        default: "-",
                      },
                      {
                        property: "placeholder",
                        description: td("props.dateRangePicker.placeholder"),
                        type: "string",
                        default: `"${td("examples.lunarDatePicker.selectLunarRange")}"`,
                      },
                      { property: "className", description: td("props.dateRangePicker.className"), type: "string", default: "-" },
                      { property: "label", description: td("props.dateRangePicker.label"), type: "string", default: "-" },
                      { property: "labelClassName", description: td("props.dateRangePicker.labelClassName"), type: "string", default: "-" },
                      { property: "required", description: td("props.dateRangePicker.required"), type: "boolean", default: "false" },
                      { property: "size", description: td("props.dateRangePicker.size"), type: '"sm" | "md" | "lg"', default: '"md"' },
                      { property: "disabled", description: td("props.dateRangePicker.disabled"), type: "boolean", default: "false" },
                      { property: "disablePastDates", description: td("props.dateRangePicker.disablePastDates"), type: "boolean", default: "false" },
                      { property: "minDate", description: td("props.dateRangePicker.minDate"), type: "LunarPickerValue", default: "-" },
                      { property: "maxDate", description: td("props.dateRangePicker.maxDate"), type: "LunarPickerValue", default: "-" },
                    ]}
                    order={["id", "startDate", "endDate", "onChange", "placeholder", "className", "disabled", "label", "labelClassName", "required", "size", "disablePastDates", "minDate", "maxDate"]}
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
