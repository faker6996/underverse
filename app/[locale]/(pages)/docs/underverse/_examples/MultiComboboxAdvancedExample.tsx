"use client";

import React from "react";
import { MultiCombobox } from "@/components/ui/MultiCombobox";
import CodeBlock from "../_components/CodeBlock";

const ALL = ['React','Next.js','TypeScript','Node','GraphQL','Tailwind'];

export default function MultiComboboxAdvancedExample() {
  const [value, setValue] = React.useState<string[]>(['React']);
  return (
    <div className="space-y-3">
      <MultiCombobox
        options={ALL}
        value={value}
        onChange={setValue}
        maxSelected={3}
        disabledOptions={["Node"]}
        showClear
        showTags
      />
      <CodeBlock code={`<MultiCombobox options={['React','Next.js']} maxSelected={3} disabledOptions={['Node']} showClear showTags />`} />
    </div>
  );
}

