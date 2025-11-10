"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { CategoryTreeSelect } from "@/components/ui/CategoryTreeSelect";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function CategoryTreeSelectExample() {
  const t = useTranslations("DocsUnderverse");
  const [selected, setSelected] = React.useState<number[]>([]);
  const [selectedInit, setSelectedInit] = React.useState<number[]>([1, 2]);
  const categories = [
    { id: 1, name: "Electronics" },
    { id: 2, name: "Phones", parent_id: 1 },
    { id: 3, name: "Laptops", parent_id: 1 },
    { id: 4, name: "Home" },
    { id: 5, name: "Kitchen", parent_id: 4 },
    { id: 6, name: "Furniture", parent_id: 4 },
  ];

  const code =
    `import { CategoryTreeSelect } from '@underverse-ui/underverse'\n\n` +
    `const [selected, setSelected] = useState<number[]>([])\n` +
    `const [selectedInit, setSelectedInit] = useState<number[]>([1, 2])\n` +
    `const categories = [\n` +
    `  { id: 1, name: 'Electronics' },\n` +
    `  { id: 2, name: 'Phones', parent_id: 1 },\n` +
    `  { id: 3, name: 'Laptops', parent_id: 1 },\n` +
    `  { id: 4, name: 'Home' },\n` +
    `  { id: 5, name: 'Kitchen', parent_id: 4 },\n` +
    `  { id: 6, name: 'Furniture', parent_id: 4 },\n` +
    `]\n\n` +
    `// 1) Basic\n` +
    `<CategoryTreeSelect categories={categories} value={selected} onChange={setSelected} placeholder='Chọn danh mục' />\n` +
    `<div className=\"text-sm text-muted-foreground\">Chọn: {selected.join(', ') || '(none)'} </div>\n\n` +
    `// 2) With initial selection\n` +
    `<CategoryTreeSelect categories={categories} value={selectedInit} onChange={setSelectedInit} />\n\n` +
    `// 3) Disabled\n` +
    `<CategoryTreeSelect categories={categories} value={selected} onChange={setSelected} disabled />`;

  const demo = (
    <div className="space-y-6">
      {/* 1) Basic */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Basic</p>
        <CategoryTreeSelect categories={categories} value={selected} onChange={setSelected} placeholder="Chọn danh mục" />
        <div className="text-sm text-muted-foreground">Chọn: {selected.join(", ") || "(none)"}</div>
      </div>

      {/* 2) With initial selection */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Initial selection</p>
        <CategoryTreeSelect categories={categories} value={selectedInit} onChange={setSelectedInit} />
      </div>

      {/* 3) Disabled */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Disabled</p>
        <CategoryTreeSelect categories={categories} value={selected} onChange={setSelected} disabled />
      </div>
    </div>
  );

  const rows: PropsRow[] = [
    { property: "categories", description: t("props.categoryTreeSelect.categories"), type: "Array<{ id: number; name: string; parent_id?: number | null }>", default: "[]" },
    { property: "value", description: t("props.categoryTreeSelect.value"), type: "number[]", default: "[]" },
    { property: "onChange", description: t("props.categoryTreeSelect.onChange"), type: "(selectedIds: number[]) => void", default: "-" },
    { property: "placeholder", description: t("props.categoryTreeSelect.placeholder"), type: "string", default: '"Chọn danh mục"' },
    { property: "disabled", description: t("props.categoryTreeSelect.disabled"), type: "boolean", default: "false" },
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
