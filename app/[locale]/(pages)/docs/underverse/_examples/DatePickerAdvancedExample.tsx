"use client";

import React from "react";
import { DatePicker, DateRangePicker } from "@/components/ui/DatePicker";
import CodeBlock from "../_components/CodeBlock";

export default function DatePickerAdvancedExample() {
  const [dateSm, setDateSm] = React.useState<Date | undefined>();
  const [start, setStart] = React.useState<Date | undefined>();
  const [end, setEnd] = React.useState<Date | undefined>();

  return (
    <div className="space-y-3">
      <div className="grid md:grid-cols-2 gap-4">
        <DatePicker
          value={dateSm as any}
          onChange={(d) => setDateSm(d)}
          size="sm"
          placeholder="Pick a date (sm)"
          weekdayLabels={["Su","Mo","Tu","We","Th","Fr","Sa"]}
        />
        <DateRangePicker
          startDate={start as any}
          endDate={end as any}
          onChange={(s, e) => { setStart(s); setEnd(e); }}
        />
      </div>
      <CodeBlock code={`<DatePicker size='sm' weekdayLabels={['Su','Mo','Tu','We','Th','Fr','Sa']} />\n<DateRangePicker onChange={(s,e)=>...} />`} />
    </div>
  );
}

