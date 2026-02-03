"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  Smartphone,
  Laptop,
  Home,
  UtensilsCrossed,
  Sofa,
  Shirt,
  Watch,
  Headphones,
  Monitor,
  Tablet,
  Camera,
  Speaker,
  Lamp,
  Bed,
  Package,
} from "lucide-react";
import { CategoryTreeSelect } from "@/components/ui/CategoryTreeSelect";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function CategoryTreeSelectExample() {
  const t = useTranslations("DocsUnderverse");
  const [selected, setSelected] = React.useState<number[]>([]);
  const [selectedInit, setSelectedInit] = React.useState<number[]>([1, 2]);
  const [singleSelected, setSingleSelected] = React.useState<number | null>(null);
  const [inlineSingle, setInlineSingle] = React.useState<number | null>(1);

  const categories = [
    // Electronics
    { id: 1, name: "Electronics" },
    { id: 2, name: "Phones", parent_id: 1, icon: <Smartphone className="w-4 h-4" /> },
    { id: 3, name: "Laptops", parent_id: 1, icon: <Laptop className="w-4 h-4" /> },
    { id: 4, name: "Tablets", parent_id: 1, icon: <Tablet className="w-4 h-4" /> },
    { id: 5, name: "Monitors", parent_id: 1, icon: <Monitor className="w-4 h-4" /> },
    { id: 6, name: "Audio", parent_id: 1, icon: <Headphones className="w-4 h-4" /> },
    { id: 7, name: "Headphones", parent_id: 6, icon: <Headphones className="w-4 h-4" /> },
    { id: 8, name: "Speakers", parent_id: 6, icon: <Speaker className="w-4 h-4" /> },
    { id: 9, name: "Cameras", parent_id: 1, icon: <Camera className="w-4 h-4" /> },

    // Fashion
    { id: 10, name: "Fashion" },
    { id: 11, name: "Men's Clothing", parent_id: 10, icon: <Shirt className="w-4 h-4" /> },
    { id: 12, name: "Women's Clothing", parent_id: 10, icon: <Shirt className="w-4 h-4" /> },
    { id: 13, name: "Accessories", parent_id: 10, icon: <Watch className="w-4 h-4" /> },
    { id: 14, name: "Watches", parent_id: 13, icon: <Watch className="w-4 h-4" /> },

    // Home & Living
    { id: 15, name: "Home & Living" },
    { id: 16, name: "Kitchen", parent_id: 15, icon: <UtensilsCrossed className="w-4 h-4" /> },
    { id: 17, name: "Furniture", parent_id: 15, icon: <Sofa className="w-4 h-4" /> },
    { id: 18, name: "Living Room", parent_id: 17, icon: <Sofa className="w-4 h-4" /> },
    { id: 19, name: "Bedroom", parent_id: 17, icon: <Bed className="w-4 h-4" /> },
    { id: 20, name: "Lighting", parent_id: 15, icon: <Lamp className="w-4 h-4" /> },

    // Sports
    { id: 21, name: "Sports & Outdoors" },
    { id: 22, name: "Fitness", parent_id: 21, icon: <Package className="w-4 h-4" /> },
    { id: 23, name: "Camping", parent_id: 21, icon: <Package className="w-4 h-4" /> },
  ];

  // Example i18n labels
  const labels = {
    emptyText: "No categories available",
    selectedText: (count: number) => `${count} categories selected`,
  };

  const code =
    `import { CategoryTreeSelect } from '@underverse-ui/underverse'\n` +
    `import { Smartphone, Laptop } from 'lucide-react'\n\n` +
    `// Categories with custom icons\n` +
    `const categories = [\n` +
    `  { id: 1, name: "Electronics" },\n` +
    `  { id: 2, name: "Phones", parent_id: 1, icon: <Smartphone className="w-4 h-4" /> },\n` +
    `  { id: 3, name: "Laptops", parent_id: 1, icon: <Laptop className="w-4 h-4" /> },\n` +
    `]\n\n` +
    `// 1) Multi-select (default)\n` +
    `<CategoryTreeSelect\n` +
    `  categories={categories}\n` +
    `  value={selected}\n` +
    `  onChange={setSelected}\n` +
    `  placeholder="Select categories"\n` +
    `/>\n\n` +
    `// 2) Single-select mode\n` +
    `<CategoryTreeSelect\n` +
    `  categories={categories}\n` +
    `  value={singleSelected}     // number | null\n` +
    `  onChange={setSingleSelected}\n` +
    `  singleSelect               // NEW: only one node\n` +
    `/>\n\n` +
    `// 3) Inline mode (always visible, no radio buttons)\n` +
    `<CategoryTreeSelect\n` +
    `  categories={categories}\n` +
    `  value={inlineSingle}\n` +
    `  onChange={setInlineSingle}\n` +
    `  singleSelect\n` +
    `  inline                     // NEW: no dropdown, no radio\n` +
    `  defaultExpanded\n` +
    `/>\n\n` +
    `// 4) With onNodeClick (navigation)\n` +
    `<CategoryTreeSelect\n` +
    `  categories={departments}\n` +
    `  value={selectedId}\n` +
    `  onChange={setSelectedId}\n` +
    `  singleSelect\n` +
    `  inline\n` +
    `  onNodeClick={(node) => router.push(\`/dept/\${node.id}\`)}\n` +
    `/>\n\n` +
    `// 5) View Only\n` +
    `<CategoryTreeSelect categories={categories} viewOnly defaultExpanded />`;

  const demo = (
    <div className="space-y-6">
      {/* 1) Multi-select */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Multi-select (default)</p>
        <CategoryTreeSelect categories={categories} value={selected} onChange={setSelected} placeholder="Select categories" labels={labels} />
        <div className="text-sm text-muted-foreground">Selected: {selected.join(", ") || "(none)"}</div>
      </div>

      {/* 2) Single-select dropdown */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Single-select (dropdown)</p>
        <CategoryTreeSelect
          categories={categories}
          value={singleSelected}
          onChange={setSingleSelected}
          placeholder="Select one category"
          singleSelect
        />
        <div className="text-sm text-muted-foreground">Selected: {singleSelected ?? "(none)"}</div>
      </div>

      {/* 3) Single-select inline */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Single-select inline (always visible)</p>
        <CategoryTreeSelect categories={categories} value={inlineSingle} onChange={setInlineSingle} singleSelect inline defaultExpanded />
        <div className="text-sm text-muted-foreground">Selected: {inlineSingle ?? "(none)"}</div>
      </div>

      {/* 4) View Only */}
      <div className="space-y-2">
        <p className="text-sm font-medium">View Only</p>
        <CategoryTreeSelect categories={categories} viewOnly defaultExpanded />
      </div>

      {/* 5) Disabled */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Disabled</p>
        <CategoryTreeSelect categories={categories} value={selectedInit} onChange={setSelectedInit} disabled />
      </div>
    </div>
  );

  const rows: PropsRow[] = [
    { property: "categories", description: t("props.categoryTreeSelect.categories"), type: "Category[]", default: "[]" },
    { property: "value", description: t("props.categoryTreeSelect.value"), type: "number[] | number | null", default: "[]" },
    { property: "onChange", description: t("props.categoryTreeSelect.onChange"), type: "(ids | id) => void", default: "-" },
    { property: "placeholder", description: t("props.categoryTreeSelect.placeholder"), type: "string", default: '"Select category"' },
    { property: "disabled", description: t("props.categoryTreeSelect.disabled"), type: "boolean", default: "false" },
    { property: "singleSelect", description: t("props.categoryTreeSelect.singleSelect"), type: "boolean", default: "false" },
    { property: "inline", description: t("props.categoryTreeSelect.inline"), type: "boolean", default: "false" },
    { property: "onNodeClick", description: t("props.categoryTreeSelect.onNodeClick"), type: "(node: Category) => void", default: "-" },
    { property: "viewOnly", description: t("props.categoryTreeSelect.viewOnly"), type: "boolean", default: "false" },
    { property: "defaultExpanded", description: t("props.categoryTreeSelect.defaultExpanded"), type: "boolean", default: "false" },
    { property: "labels", description: t("props.categoryTreeSelect.labels"), type: "CategoryTreeSelectLabels", default: "-" },
    { property: "className", description: t("props.categoryTreeSelect.className"), type: "string", default: "-" },
  ];
  const order = rows.map((r) => r.property);
  const docs = <PropsDocsTable rows={rows} order={order} markdownFile="CategoryTreeSelect.md" />;

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
