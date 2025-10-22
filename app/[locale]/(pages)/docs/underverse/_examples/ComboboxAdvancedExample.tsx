"use client";

import React from "react";
import { Combobox } from "@/components/ui/Combobox";
import CodeBlock from "../_components/CodeBlock";

const options = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
];

export default function ComboboxAdvancedExample() {
  const [value, setValue] = React.useState<string | null>(null);
  return (
    <div className="space-y-3">
      <Combobox
        options={options}
        value={value}
        onChange={setValue}
        allowClear
        placeholder="Select fruit"
        searchPlaceholder="Search fruits..."
        usePortal={false}
        fontBold
      />
      <CodeBlock code={`<Combobox options={[{label:'Apple',value:'apple'}]} allowClear usePortal={false} fontBold />`} />
    </div>
  );
}

