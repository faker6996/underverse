"use client";

import React from "react";
import MonthYearPicker from "@/components/ui/MonthYearPicker";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { useTranslations } from "next-intl";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

const VIETNAMESE_MONTHS = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

const VIETNAMESE_SHORT_MONTHS = ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"];

export default function MonthYearPickerExample() {
  const t = useTranslations("DocsUnderverse");
  const [value, setValue] = React.useState<{ month: number; year: number } | undefined>({ month: 1, year: 2026 });
  const [dateValue, setDateValue] = React.useState<Date>(new Date());

  const demo = (
    <div className="space-y-8">
      {/* Basic */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Basic Usage</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Default</p>
            <MonthYearPicker placeholder="Select month/year" />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Controlled</p>
            <MonthYearPicker value={value} onChange={(v) => v && setValue({ month: v.month, year: v.year })} />
            <p className="text-xs text-muted-foreground font-mono">{value ? `${value.month + 1}/${value.year}` : "—"}</p>
          </div>
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Sizes</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Small</p>
            <MonthYearPicker size="sm" defaultValue={{ month: 0, year: 2026 }} />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Medium (default)</p>
            <MonthYearPicker size="md" defaultValue={{ month: 5, year: 2026 }} />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Large</p>
            <MonthYearPicker size="lg" defaultValue={{ month: 11, year: 2026 }} />
          </div>
        </div>
      </div>

      {/* Vietnamese */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Vietnamese Month Names</p>
        <div className="max-w-sm space-y-2">
          <MonthYearPicker
            monthNames={VIETNAMESE_MONTHS}
            shortMonthNames={VIETNAMESE_SHORT_MONTHS}
            columnLabels={{ month: "Tháng", year: "Năm" }}
            label="Chọn tháng/năm"
          />
        </div>
      </div>

      {/* Year Range */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Year Range</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">2020 - 2030</p>
            <MonthYearPicker minYear={2020} maxYear={2030} />
          </div>
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Last 5 years</p>
            <MonthYearPicker minYear={new Date().getFullYear() - 5} maxYear={new Date().getFullYear()} />
          </div>
        </div>
      </div>

      {/* Inline Variant */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Inline Variant</p>
        <div className="max-w-sm">
          <MonthYearPicker variant="inline" label="Select Period" showThisMonth />
        </div>
      </div>

      {/* With Date Value */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">With Date Value</p>
        <div className="max-w-sm space-y-2">
          <MonthYearPicker value={dateValue} onChange={(v) => v && setDateValue(v.date)} label="Select Month" />
          <p className="text-xs text-muted-foreground font-mono">{dateValue.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
        </div>
      </div>

      {/* Validation States */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Validation States</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <MonthYearPicker label="Start Month" error="Please select a valid month" />
          </div>
          <div className="space-y-2">
            <MonthYearPicker label="End Month" success helperText="Looks good!" defaultValue={{ month: 5, year: 2026 }} />
          </div>
        </div>
      </div>

      {/* Disabled & Required */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Disabled & Required</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <MonthYearPicker label="Disabled" disabled defaultValue={{ month: 2, year: 2026 }} />
          </div>
          <div className="space-y-2">
            <MonthYearPicker label="Required Field" required />
          </div>
        </div>
      </div>

      {/* Keyboard Navigation */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground/90">Keyboard Navigation</p>
        <div className="max-w-sm space-y-2">
          <p className="text-xs text-muted-foreground">
            Use Arrow keys to navigate. Home/End for first/last. PageUp/Down to jump. Left/Right to switch columns.
          </p>
          <MonthYearPicker label="Try Keyboard" helperText="Click to open and try keyboard controls" />
        </div>
      </div>
    </div>
  );

  const code = `import { MonthYearPicker } from '@underverse-ui/underverse'
import { useState } from 'react'

// Basic usage
<MonthYearPicker placeholder="Select month/year" />

// Controlled with {month, year}
const [value, setValue] = useState({ month: 0, year: 2026 })
<MonthYearPicker
  value={value}
  onChange={(v) => v && setValue({ month: v.month, year: v.year })}
/>

// Controlled with Date
const [date, setDate] = useState(new Date())
<MonthYearPicker
  value={date}
  onChange={(v) => v && setDate(v.date)}
/>

// Vietnamese month names
const VIETNAMESE_MONTHS = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
  "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
  "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
]
<MonthYearPicker
  monthNames={VIETNAMESE_MONTHS}
  columnLabels={{ month: "Tháng", year: "Năm" }}
/>

// Year range
<MonthYearPicker minYear={2020} maxYear={2030} />

// Sizes
<MonthYearPicker size="sm" />
<MonthYearPicker size="md" />
<MonthYearPicker size="lg" />

// Inline variant
<MonthYearPicker variant="inline" label="Select Period" />

// With validation
<MonthYearPicker
  label="Start Month"
  error="Please select a valid month"
/>
<MonthYearPicker
  label="End Month"
  success
  helperText="Looks good!"
/>`;

  const rows: PropsRow[] = [
    { property: "value", description: t("props.monthYearPicker.value"), type: "Date | { month: number; year: number }", default: "-" },
    { property: "defaultValue", description: t("props.monthYearPicker.defaultValue"), type: "Date | { month: number; year: number }", default: "-" },
    {
      property: "onChange",
      description: t("props.monthYearPicker.onChange"),
      type: "(value: { month, year, date } | undefined) => void",
      default: "-",
    },
    { property: "placeholder", description: t("props.monthYearPicker.placeholder"), type: "string", default: "'Select month/year'" },
    { property: "disabled", description: t("props.monthYearPicker.disabled"), type: "boolean", default: "false" },
    { property: "size", description: t("props.monthYearPicker.size"), type: "'sm' | 'md' | 'lg'", default: "'md'" },
    { property: "label", description: t("props.monthYearPicker.label"), type: "string", default: "-" },
    { property: "required", description: t("props.monthYearPicker.required"), type: "boolean", default: "false" },
    { property: "clearable", description: t("props.monthYearPicker.clearable"), type: "boolean", default: "true" },
    { property: "variant", description: t("props.monthYearPicker.variant"), type: "'default' | 'compact' | 'inline'", default: "'default'" },
    { property: "monthNames", description: t("props.monthYearPicker.monthNames"), type: "string[]", default: "English months" },
    { property: "shortMonthNames", description: t("props.monthYearPicker.shortMonthNames"), type: "string[]", default: "English short months" },
    { property: "minYear", description: t("props.monthYearPicker.minYear"), type: "number", default: "currentYear - 50" },
    { property: "maxYear", description: t("props.monthYearPicker.maxYear"), type: "number", default: "currentYear + 10" },
    { property: "minDate", description: t("props.monthYearPicker.minDate"), type: "Date", default: "-" },
    { property: "maxDate", description: t("props.monthYearPicker.maxDate"), type: "Date", default: "-" },
    { property: "error", description: t("props.monthYearPicker.error"), type: "string", default: "-" },
    { property: "success", description: t("props.monthYearPicker.success"), type: "boolean", default: "false" },
    { property: "helperText", description: t("props.monthYearPicker.helperText"), type: "string", default: "-" },
    { property: "animate", description: t("props.monthYearPicker.animate"), type: "boolean", default: "true" },
    { property: "showThisMonth", description: t("props.monthYearPicker.showThisMonth"), type: "boolean", default: "true" },
    {
      property: "columnLabels",
      description: t("props.monthYearPicker.columnLabels"),
      type: "{ month?: string; year?: string }",
      default: "{ month: 'Month', year: 'Year' }",
    },
    { property: "onOpen", description: t("props.monthYearPicker.onOpen"), type: "() => void", default: "-" },
    { property: "onClose", description: t("props.monthYearPicker.onClose"), type: "() => void", default: "-" },
  ];

  const docs = <PropsDocsTable rows={rows} markdownFile="MonthYearPicker.md" />;

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
