"use client";

import React from "react";
import { MultiCombobox } from "@/components/ui/MultiCombobox";
import CodeBlock from "../_components/CodeBlock";

export default function MultiComboboxExample() {
  const [value, setValue] = React.useState<string[]>([]);
  const options = ["React", "Next.js", "Tailwind", "TypeScript", "Node.js"];
  return (
    <div className="space-y-3">
      <MultiCombobox options={options} value={value} onChange={setValue} />
      <div className="text-sm text-muted-foreground">Chọn: {value.join(", ") || "(none)"}</div>
      <CodeBlock
        code={`import { MultiCombobox } from '@underverse-ui/underverse'\n\nconst [value, setValue] = useState<string[]>([])\n<MultiCombobox options={["React","Next.js"]} value={value} onChange={setValue} />`}
      />
    </div>
  );
}

