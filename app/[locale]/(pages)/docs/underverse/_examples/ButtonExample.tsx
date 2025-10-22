"use client";

import React from "react";
import Button from "@/components/ui/Button";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";

export default function ButtonExample() {
  const code =
    `import { Button } from '@underverse-ui/underverse'\n\n` +
    `<Button>Default</Button>\n` +
    `<Button variant="primary">Primary</Button>\n` +
    `<Button variant="secondary">Secondary</Button>\n` +
    `<Button variant="success">Success</Button>\n` +
    `<Button variant="warning">Warning</Button>\n` +
    `<Button variant="danger">Danger</Button>\n` +
    `<Button variant="info">Info</Button>\n` +
    `<Button variant="outline">Outline</Button>\n` +
    `<Button variant="ghost">Ghost</Button>\n` +
    `<Button variant="link">Link</Button>\n` +
    `<Button variant="gradient">Gradient</Button>\n` +
    `<Button loading loadingText=\"Đang xử lý...\">Loading</Button>\n` +
    `<Button disabled>Disabled</Button>`;

  const demo = (
    <div className="flex flex-wrap gap-3">
      <Button>Default</Button>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="success">Success</Button>
      <Button variant="warning">Warning</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="info">Info</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="gradient">Gradient</Button>
      <Button loading loadingText="Đang xử lý...">Loading</Button>
      <Button disabled>Disabled</Button>
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
