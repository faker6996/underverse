"use client";

import React from "react";
import { Combobox } from "@/components/ui/Combobox";
import CodeBlock from "../_components/CodeBlock";

export default function ComboboxExample() {
  const [value, setValue] = React.useState<string | undefined>();
  const options = [
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
    { label: "Cherry", value: "cherry" },
  ];
  return (
    <div className="space-y-3">
      <Combobox options={options} value={value} onChange={setValue} placeholder="Chọn trái cây" />
      <div className="text-sm text-muted-foreground">Giá trị: {String(value ?? "(none)")}</div>
      <CodeBlock
        code={`import { Combobox } from '@underverse-ui/underverse'\n\nconst options = [{label:'Apple',value:'apple'},{label:'Banana',value:'banana'}]\nconst [value, setValue] = useState()\n<Combobox options={options} value={value} onChange={setValue} />`}
      />
    </div>
  );
}

