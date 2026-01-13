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

  // Example i18n labels - in real app, use useTranslations
  const labels = {
    emptyText: "No categories available",
    selectedText: (count: number) => `${count} categories selected`,
  };

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
    `// i18n labels\n` +
    `const labels = {\n` +
    `  emptyText: t('categoryTree.empty'),\n` +
    `  selectedText: (count) => t('categoryTree.selected', { count }),\n` +
    `}\n\n` +
    `// 1) Basic\n` +
    `<CategoryTreeSelect\n` +
    `  categories={categories}\n` +
    `  value={selected}\n` +
    `  onChange={setSelected}\n` +
    `  placeholder="Select category"\n` +
    `  labels={labels}\n` +
    `/>\n\n` +
    `// 2) With initial selection\n` +
    `<CategoryTreeSelect categories={categories} value={selectedInit} onChange={setSelectedInit} labels={labels} />\n\n` +
    `// 3) Disabled\n` +
    `<CategoryTreeSelect categories={categories} value={selected} onChange={setSelected} disabled labels={labels} />\n\n` +
    `// 4) View Only (read-only tree)\n` +
    `<CategoryTreeSelect categories={categories} viewOnly labels={labels} />\n\n` +
    `// 5) View Only with default expanded\n` +
    `<CategoryTreeSelect categories={categories} viewOnly defaultExpanded labels={labels} />`;

  const demo = (
    <div className="space-y-6">
      {/* 1) Basic */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Basic</p>
        <CategoryTreeSelect categories={categories} value={selected} onChange={setSelected} placeholder="Select category" labels={labels} />
        <div className="text-sm text-muted-foreground">Selected: {selected.join(", ") || "(none)"}</div>
      </div>

      {/* 2) With initial selection */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Initial selection</p>
        <CategoryTreeSelect categories={categories} value={selectedInit} onChange={setSelectedInit} labels={labels} />
      </div>

      {/* 3) Disabled */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Disabled</p>
        <CategoryTreeSelect categories={categories} value={selected} onChange={setSelected} disabled labels={labels} />
      </div>

      {/* 4) View Only */}
      <div className="space-y-2">
        <p className="text-sm font-medium">View Only (read-only tree)</p>
        <CategoryTreeSelect categories={categories} viewOnly labels={labels} />
      </div>

      {/* 5) View Only with default expanded */}
      <div className="space-y-2">
        <p className="text-sm font-medium">View Only (default expanded)</p>
        <CategoryTreeSelect categories={categories} viewOnly defaultExpanded labels={labels} />
      </div>
    </div>
  );

  const rows: PropsRow[] = [
    {
      property: "categories",
      description: t("props.categoryTreeSelect.categories"),
      type: "Array<{ id: number; name: string; parent_id?: number | null }>",
      default: "[]",
    },
    { property: "value", description: t("props.categoryTreeSelect.value"), type: "number[]", default: "[]" },
    { property: "onChange", description: t("props.categoryTreeSelect.onChange"), type: "(selectedIds: number[]) => void", default: "-" },
    { property: "placeholder", description: t("props.categoryTreeSelect.placeholder"), type: "string", default: '"Select category"' },
    { property: "disabled", description: t("props.categoryTreeSelect.disabled"), type: "boolean", default: "false" },
    { property: "viewOnly", description: t("props.categoryTreeSelect.viewOnly"), type: "boolean", default: "false" },
    { property: "defaultExpanded", description: t("props.categoryTreeSelect.defaultExpanded"), type: "boolean", default: "false" },
    { property: "labels", description: t("props.categoryTreeSelect.labels"), type: "CategoryTreeSelectLabels", default: "-" },
  ];
  const order = rows.map((r) => r.property);
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
