"use client";

import React from "react";
import DropdownMenu from "@/components/ui/DropdownMenu";
import Button from "@/components/ui/Button";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function DropdownMenuExample() {
  const code =
    `import DropdownMenu from '@underverse-ui/underverse'\n` +
    `import Button from '@underverse-ui/underverse'\n\n` +
    `<DropdownMenu\n` +
    `  trigger={<Button variant="outline">Open menu</Button>}\n` +
    `  items={[\n` +
    `    { label: "Action 1", onClick: () => console.log("Action 1") },\n` +
    `    { label: "Action 2", onClick: () => console.log("Action 2") },\n` +
    `  ]}\n` +
    `/>`;

  const demo = (
    <div>
      <DropdownMenu
        trigger={<Button variant="outline">Open menu</Button>}
        items={[
          { label: "Action 1", onClick: () => console.log("Action 1") },
          { label: "Action 2", onClick: () => console.log("Action 2") },
        ]}
      />
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
