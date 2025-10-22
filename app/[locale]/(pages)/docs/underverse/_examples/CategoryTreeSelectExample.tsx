"use client";

import React from "react";
import { CategoryTreeSelect } from "@/components/ui/CategoryTreeSelect";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function CategoryTreeSelectExample() {
  const [selected, setSelected] = React.useState<number[]>([]);
  const categories = [
    { id: 1, name: "Electronics" },
    { id: 2, name: "Phones", parent_id: 1 },
    { id: 3, name: "Laptops", parent_id: 1 },
    { id: 4, name: "Home" },
    { id: 5, name: "Kitchen", parent_id: 4 },
  ];

  const code =
    `import { CategoryTreeSelect } from '@underverse-ui/underverse'\n\n` +
    `const [selected, setSelected] = useState<number[]>([])\n` +
    `const categories = [\n` +
    `  { id: 1, name: "Electronics" },\n` +
    `  { id: 2, name: "Phones", parent_id: 1 },\n` +
    `  { id: 3, name: "Laptops", parent_id: 1 },\n` +
    `  { id: 4, name: "Home" },\n` +
    `  { id: 5, name: "Kitchen", parent_id: 4 },\n` +
    `]\n\n` +
    `<CategoryTreeSelect categories={categories} value={selected} onChange={setSelected} />\n` +
    `<div className="text-sm text-muted-foreground">Chọn: {selected.join(", ") || "(none)"}</div>`;

  const demo = (
    <div className="space-y-3">
      <CategoryTreeSelect categories={categories} value={selected} onChange={setSelected} />
      <div className="text-sm text-muted-foreground">Chọn: {selected.join(", ") || "(none)"}</div>
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

