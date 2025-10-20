"use client";

import React from "react";
import { DatePicker } from "@/components/ui/DatePicker";
import CodeBlock from "../_components/CodeBlock";
import IntlDemoProvider from "../_components/IntlDemoProvider";

export default function DatePickerExample() {
  const [date1, setDate1] = React.useState<Date | undefined>();
  const [date2, setDate2] = React.useState<Date | undefined>();
  return (
    <IntlDemoProvider>
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-3">
          <DatePicker value={date1} onChange={setDate1} label="Mặc định (md)" />
          <DatePicker value={date2} onChange={setDate2} size="sm" label="Kích thước nhỏ (sm)" />
        </div>
        <div className="text-sm text-muted-foreground">Giá trị 1: {date1?.toLocaleDateString("vi-VN") || "(none)"} | Giá trị 2: {date2?.toLocaleDateString("vi-VN") || "(none)"}</div>
        <CodeBlock code={`<DatePicker label='Mặc định' />\n<DatePicker size='sm' label='Nhỏ' />`} />
      </div>
    </IntlDemoProvider>
  );
}
