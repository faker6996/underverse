"use client";

import React from "react";
import { Combobox } from "@/components/ui/Combobox";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function ComboboxExample() {
  const [value, setValue] = React.useState<string | null>(null);
  const [valueOutline, setValueOutline] = React.useState<string | null>(null);
  const [valueGhost, setValueGhost] = React.useState<string | null>(null);
  const [valueDisabled] = React.useState<string | null>("banana");

  const options = [
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
    { label: "Cherry", value: "cherry" },
  ];

  // Many options to demonstrate search input (>10)
  const manyOptions = Array.from({ length: 20 }).map((_, i) => ({ label: `Option ${i + 1}`, value: `opt-${i + 1}` }));

  const code =
    `import { Combobox } from '@underverse-ui/underverse'\n\n` +
    `const [value, setValue] = useState<string | null>(null)\n` +
    `const options = [\n` +
    `  { label: 'Apple', value: 'apple' },\n` +
    `  { label: 'Banana', value: 'banana' },\n` +
    `  { label: 'Cherry', value: 'cherry' },\n` +
    `]\n` +
    `const manyOptions = Array.from({ length: 20 }).map((_, i) => ({ label: \`Option \${i + 1}\`, value: \`opt-\${i + 1}\` }))\n\n` +
    `// 1) Default (md) with label, required, allowClear\n` +
    `<Combobox options={options} value={value} onChange={setValue} label='Fruit' required allowClear placeholder='Chọn trái cây' />\n\n` +
    `// 2) Sizes\n` +
    `<Combobox options={options} value={value} onChange={setValue} size='sm' placeholder='Small' />\n` +
    `<Combobox options={options} value={value} onChange={setValue} size='md' placeholder='Medium' />\n` +
    `<Combobox options={options} value={value} onChange={setValue} size='lg' placeholder='Large' />\n\n` +
    `// 3) Variants\n` +
    `<Combobox options={options} value={value} onChange={setValue} variant='default' placeholder='Default' />\n` +
    `<Combobox options={options} value={valueOutline} onChange={setValueOutline} variant='outline' placeholder='Outline' />\n` +
    `<Combobox options={options} value={valueGhost} onChange={setValueGhost} variant='ghost' placeholder='Ghost' />\n\n` +
    `// 4) Disabled\n` +
    `<Combobox options={options} value={'banana'} onChange={() => {}} disabled placeholder='Disabled' />\n\n` +
    `// 5) Without portal\n` +
    `<Combobox options={manyOptions} value={value} onChange={setValue} usePortal={false} placeholder='Search enabled with many options' />\n\n` +
    `// 6) Bold font label\n` +
    `<Combobox options={options} value={value} onChange={setValue} label='Category' fontBold />`;

  const demo = (
    <div className="space-y-6">
      {/* 1) Default with label, required, allowClear */}
      <Combobox options={options} value={value} onChange={setValue} label="Fruit" required allowClear placeholder="Chọn trái cây" />
      <div className="text-sm text-muted-foreground">Giá trị: {String(value ?? "(none)")}</div>

      {/* 2) Sizes */}
      <div className="flex flex-wrap gap-3">
        <Combobox options={options} value={value} onChange={setValue} size="sm" placeholder="Small" />
        <Combobox options={options} value={value} onChange={setValue} size="md" placeholder="Medium" />
        <Combobox options={options} value={value} onChange={setValue} size="lg" placeholder="Large" />
      </div>

      {/* 3) Variants */}
      <div className="flex flex-wrap gap-3">
        <Combobox options={options} value={value} onChange={setValue} variant="default" placeholder="Default" />
        <Combobox options={options} value={valueOutline} onChange={setValueOutline} variant="outline" placeholder="Outline" />
        <Combobox options={options} value={valueGhost} onChange={setValueGhost} variant="ghost" placeholder="Ghost" />
      </div>

      {/* 4) Disabled */}
      <Combobox options={options} value={valueDisabled} onChange={() => {}} disabled placeholder="Disabled" />

      {/* 5) No portal with many options (search enabled) */}
      <Combobox options={manyOptions} value={value} onChange={setValue} usePortal={false} placeholder="Search enabled with many options" />

      {/* 6) Bold label */}
      <Combobox options={options} value={value} onChange={setValue} label="Category" fontBold />
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
