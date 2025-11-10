"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Combobox } from "@/components/ui/Combobox";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function ComboboxExample() {
  const t = useTranslations("DocsUnderverse");
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

  const rows: PropsRow[] = [
    { property: "id", description: t("props.combobox.id"), type: "string", default: "-" },
    { property: "options", description: t("props.combobox.options"), type: "Array<string | { label: string; value: any }>", default: "-" },
    { property: "value", description: t("props.combobox.value"), type: "any", default: "-" },
    { property: "onChange", description: t("props.combobox.onChange"), type: "(value: any) => void", default: "-" },
    { property: "placeholder", description: t("props.combobox.placeholder"), type: "string", default: '"Select..."' },
    { property: "className", description: t("props.combobox.className"), type: "string", default: "-" },
    { property: "disabled", description: t("props.combobox.disabled"), type: "boolean", default: "false" },
    { property: "size", description: t("props.combobox.size"), type: '"sm" | "md" | "lg"', default: '"md"' },
    { property: "variant", description: t("props.combobox.variant"), type: '"default" | "outline" | "ghost"', default: '"default"' },
    { property: "allowClear", description: t("props.combobox.allowClear"), type: "boolean", default: "false" },
    { property: "searchPlaceholder", description: t("props.combobox.searchPlaceholder"), type: "string", default: '"Search..."' },
    { property: "emptyText", description: t("props.combobox.emptyText"), type: "string", default: '"No results found"' },
    { property: "usePortal", description: t("props.combobox.usePortal"), type: "boolean", default: "true" },
    { property: "label", description: t("props.combobox.label"), type: "string", default: "-" },
    { property: "required", description: t("props.combobox.required"), type: "boolean", default: "false" },
    { property: "fontBold", description: t("props.combobox.fontBold"), type: "boolean", default: "false" },
  ];
  const order = rows.map(r => r.property);
  const docs = <PropsDocsTable rows={rows} order={order} />;

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
