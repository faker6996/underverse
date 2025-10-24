"use client";

import React from "react";
import { Combobox } from "@/components/ui/Combobox";
import CodeBlock from "../_components/CodeBlock";

// > 10 options to demonstrate conditional search
const options = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Dragonfruit', value: 'dragonfruit' },
  { label: 'Elderberry', value: 'elderberry' },
  { label: 'Fig', value: 'fig' },
  { label: 'Grape', value: 'grape' },
  { label: 'Honeydew', value: 'honeydew' },
  { label: 'Jackfruit', value: 'jackfruit' },
  { label: 'Kiwi', value: 'kiwi' },
  { label: 'Lemon', value: 'lemon' },
  { label: 'Mango', value: 'mango' },
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
        label="Fruit (advanced)"
        required
        size="md"
        usePortal
        fontBold
      />
      <CodeBlock code={`<Combobox options={/* >10 items */} allowClear label="Fruit (advanced)" required size="md" fontBold />`} />
    </div>
  );
}
