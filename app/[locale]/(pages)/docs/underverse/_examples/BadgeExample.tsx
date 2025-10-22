"use client";

import React from "react";
import Badge from "@/components/ui/Badge";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function BadgeExample() {
  const code =
    `import { Badge } from '@underverse-ui/underverse'\n\n` +
    `<Badge>Default</Badge>\n` +
    `<Badge variant="primary">Primary</Badge>\n` +
    `<Badge variant="secondary">Secondary</Badge>\n` +
    `<Badge variant="success">Success</Badge>\n` +
    `<Badge variant="warning">Warning</Badge>\n` +
    `<Badge variant="danger">Danger</Badge>\n` +
    `<Badge variant="destructive">Destructive</Badge>\n` +
    `<Badge variant="info">Info</Badge>\n` +
    `<Badge variant="outline">Outline</Badge>\n` +
    `<Badge variant="ghost">Ghost</Badge>\n` +
    `<Badge variant="transparent">Transparent</Badge>\n` +
    `<Badge variant="gradient">Gradient</Badge>`;

  const demo = (
    <div className="flex flex-wrap gap-2 items-center">
      <Badge>Default</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="danger">Danger</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="ghost">Ghost</Badge>
      <Badge variant="transparent">Transparent</Badge>
      <Badge variant="gradient">Gradient</Badge>
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

