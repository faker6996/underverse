"use client";

import React from "react";
import { Popover } from "@/components/ui/Popover";
import Button from "@/components/ui/Button";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function PopoverExample() {
  const code =
    `import { Popover } from '@underverse-ui/underverse'\n` +
    `import Button from '@underverse-ui/underverse'\n\n` +
    `<Popover\n` +
    `  trigger={<Button variant="outline">Open Popover</Button>}\n` +
    `>\n` +
    `  <div className="p-3 text-sm">Nội dung Popover</div>\n` +
    `</Popover>`;

  const demo = (
    <div>
      <Popover
        trigger={<Button variant="outline">Open Popover</Button>}
      >
        <div className="p-3 text-sm">Nội dung Popover</div>
      </Popover>
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

