"use client";

import React from "react";
import { Tooltip } from "@/components/ui/Tooltip";
import Button from "@/components/ui/Button";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function TooltipExample() {
  const demo = (
    <Tooltip content="Tooltip mặc định">
      <Button variant="outline">Hover me</Button>
    </Tooltip>
  );

  const code =
    `import { Tooltip, Button } from '@underverse-ui/underverse'\n\n` +
    `<Tooltip content='Tooltip mặc định'>\n` +
    `  <Button variant='outline'>Hover me</Button>\n` +
    `</Tooltip>`;

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

