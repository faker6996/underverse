"use client";

import React from "react";
import { Combobox } from "@/components/ui/Combobox";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function ComboboxExample() {
  const [value, setValue] = React.useState<string | undefined>();
  const options = [
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
    { label: "Cherry", value: "cherry" },
  ];

  const code =
    `import { Combobox } from '@underverse-ui/underverse'\n\n` +
    `const [value, setValue] = useState<string | undefined>()\n` +
    `const options = [\n` +
    `  { label: "Apple", value: "apple" },\n` +
    `  { label: "Banana", value: "banana" },\n` +
    `  { label: "Cherry", value: "cherry" },\n` +
    `]\n\n` +
    `<Combobox\n` +
    `  options={options}\n` +
    `  value={value}\n` +
    `  onChange={setValue}\n` +
    `  label="Fruit"\n` +
    `  required\n` +
    `  allowClear\n` +
    `  placeholder="Chọn trái cây"\n` +
    `/>\n` +
    `<div className="text-sm text-muted-foreground">Giá trị: {String(value ?? "(none)")}</div>`;

  const demo = (
    <div className="space-y-3">
      <Combobox 
        options={options}
        value={value}
        onChange={setValue}
        label="Fruit"
        required
        allowClear
        placeholder="Chọn trái cây"
      />
      <div className="text-sm text-muted-foreground">Giá trị: {String(value ?? "(none)")}</div>
    </div>
  );

  return (
    <Tabs
      tabs={[
        { value: "preview", label: "Preview", content: <div className="p-1">{demo}</div> },
        { value: "code", label: "Code", content: <CodeBlock code={code} /> },
      ]}
      variant="underline"
      size="sm"
    />
  );
}
