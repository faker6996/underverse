"use client";

import React from "react";
import { CategoryTreeSelect } from "@/components/ui/CategoryTreeSelect";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function CategoryTreeSelectExample() {
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

