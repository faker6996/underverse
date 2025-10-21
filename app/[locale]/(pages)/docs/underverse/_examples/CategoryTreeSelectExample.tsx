"use client";

import React from "react";
import { CategoryTreeSelect } from "@/components/ui/CategoryTreeSelect";
import CodeBlock from "../_components/CodeBlock";

export default function CategoryTreeSelectExample() {
  const [selected, setSelected] = React.useState<number[]>([]);
  const categories = [
    { id: 1, name: "Electronics" },
    { id: 2, name: "Phones", parent_id: 1 },
    { id: 3, name: "Laptops", parent_id: 1 },
    { id: 4, name: "Home" },
    { id: 5, name: "Kitchen", parent_id: 4 },
  ];
  return (
    <div className="space-y-3">
      <CategoryTreeSelect categories={categories} value={selected} onChange={setSelected} />
      <div className="text-sm text-muted-foreground">Chọn: {selected.join(", ") || "(none)"}</div>
      <CodeBlock
        code={`import { CategoryTreeSelect } from '@underverse-ui/underverse'\n\nconst categories=[{id:1,name:'Electronics'},{id:2,name:'Phones',parent_id:1}]\nconst [selected,setSelected]=useState<number[]>([])\n<CategoryTreeSelect categories={categories} value={selected} onChange={setSelected}/>`}
      />
    </div>
  );
}

