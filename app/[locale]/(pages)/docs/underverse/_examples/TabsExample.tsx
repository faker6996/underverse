"use client";

import React from "react";
import { Tabs } from "@/components/ui/Tab";
import CodeBlock from "../_components/CodeBlock";

export default function TabsExample() {
  return (
    <div className="space-y-3">
      <Tabs
        tabs={[
          { value: "a", label: "Tab A", content: <div className="p-3">Nội dung A</div> },
          { value: "b", label: "Tab B", content: <div className="p-3">Nội dung B</div> },
        ]}
      />
      <CodeBlock
        code={`import { Tabs } from '@underverse-ui/underverse'\n\n<Tabs tabs={[\n  { value: 'a', label: 'Tab A', content: <div>...</div> },\n  { value: 'b', label: 'Tab B', content: <div>...</div> },\n]} />`}
      />
    </div>
  );
}

