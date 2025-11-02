"use client";

import React from "react";
import { DatePicker, DateRangePicker } from "@/components/ui/DatePicker";
import CodeBlock from "../_components/CodeBlock";
import IntlDemoProvider from "../_components/IntlDemoProvider";
import { Tabs } from "@/components/ui/Tab";
import { useTranslations } from "next-intl";
import { useLocale } from "@/hooks/useLocale";

export default function DatePickerExample() {
  const [date1, setDate1] = React.useState<Date | undefined>();
  const [date2, setDate2] = React.useState<Date | undefined>();
  const [rangeStart, setRangeStart] = React.useState<Date | undefined>();
  const [rangeEnd, setRangeEnd] = React.useState<Date | undefined>();
  const t = useTranslations('DatePicker');
  const locale = useLocale();
  const weekdays = React.useMemo(() => {
    if (locale === 'vi') return ['CN','T2','T3','T4','T5','T6','T7'];
    if (locale === 'ko') return ['일','월','화','수','목','금','토'];
    if (locale === 'ja') return ['日','月','火','水','木','金','土'];
    return ['Su','Mo','Tu','We','Th','Fr','Sa'];
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
    `<DateRangePicker startDate={rangeStart} endDate={rangeEnd} onChange={(s,e)=>{ setRangeStart(s); setRangeEnd(e); }} />`;

  const demo = (
    <div className="space-y-6">
      {/* 1) Basic + Small */}
      <div className="grid md:grid-cols-2 gap-3">
        <DatePicker value={date1} onChange={setDate1} label="Default (md)" clearLabel={t('clear')} weekdayLabels={weekdays} />
        <DatePicker value={date2} onChange={setDate2} size="sm" label="Small (sm)" clearLabel={t('clear')} weekdayLabels={weekdays} />
      </div>
      <div className="text-sm text-muted-foreground">Value 1: {date1?.toLocaleDateString() || "(none)"} | Value 2: {date2?.toLocaleDateString() || "(none)"}</div>

      {/* 2) Placeholder + required */}
      <DatePicker value={date1} onChange={setDate1} label="Required" required placeholder="Select date" clearLabel={t('clear')} />

      {/* 3) Disabled */}
      <DatePicker value={new Date()} onChange={() => {}} label="Disabled" disabled />

      {/* 4) DateRangePicker */}
      <div className="space-y-2">
        <p className="text-sm font-medium">DateRangePicker</p>
        <DateRangePicker startDate={rangeStart} endDate={rangeEnd} onChange={(s,e)=>{ setRangeStart(s); setRangeEnd(e); }} />
        <div className="text-sm text-muted-foreground">Range: {rangeStart?.toLocaleDateString() || "(start)"} - {rangeEnd?.toLocaleDateString() || "(end)"}</div>
      </div>
    </div>
  );

  return (
    <IntlDemoProvider>
      <Tabs
        tabs={[
          { value: "preview", label: "Preview", content: <div className="p-1">{demo}</div> },
          { value: "code", label: "Code", content: <CodeBlock code={code} /> },
        ]}
        variant="underline"
        size="sm"
      />
    </IntlDemoProvider>
  );
}

