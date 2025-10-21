"use client";

import React from "react";
import { DatePicker } from "@/components/ui/DatePicker";
import CodeBlock from "../_components/CodeBlock";
import IntlDemoProvider from "../_components/IntlDemoProvider";
import { useTranslations } from "next-intl";
import { useLocale } from "@/hooks/useLocale";

export default function DatePickerExample() {
  const [date1, setDate1] = React.useState<Date | undefined>();
  const [date2, setDate2] = React.useState<Date | undefined>();
  const t = useTranslations('DatePicker');
  const locale = useLocale();
  const weekdays = React.useMemo(() => {
    if (locale === 'vi') return ['CN','T2','T3','T4','T5','T6','T7'];
    if (locale === 'ko') return ['일','월','화','수','목','금','토'];
    if (locale === 'ja') return ['日','月','火','水','木','金','土'];
    return ['Su','Mo','Tu','We','Th','Fr','Sa'];
  }, [locale]);
  return (
    <IntlDemoProvider>
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-3">
          <DatePicker value={date1} onChange={setDate1} label="Mặc định (md)" todayLabel={t('today')} clearLabel={t('clear')} weekdayLabels={weekdays} />
          <DatePicker value={date2} onChange={setDate2} size="sm" label="Kích thước nhỏ (sm)" todayLabel={t('today')} clearLabel={t('clear')} weekdayLabels={weekdays} />
        </div>
        <div className="text-sm text-muted-foreground">Giá trị 1: {date1?.toLocaleDateString("vi-VN") || "(none)"} | Giá trị 2: {date2?.toLocaleDateString("vi-VN") || "(none)"}</div>
        <CodeBlock code={`<DatePicker label='Mặc định' />\n<DatePicker size='sm' label='Nhỏ' />`} />
      </div>
    </IntlDemoProvider>
  );
}
