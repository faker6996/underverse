"use client";

import React from "react";
import Button from "@/components/ui/Button";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { ArrowRight, Download, Plus } from "lucide-react";

export default function ButtonAdvancedExample() {
  const [saving, setSaving] = React.useState(false);
  const onSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
  };

  const code =
    `import Button from '@underverse-ui/underverse'\n` +
    `import { ArrowRight, Download, Plus } from 'lucide-react'\n\n` +
    `const [saving, setSaving] = useState(false)\n` +
    `const onSave = async () => {\n` +
    `  setSaving(true)\n` +
    `  await new Promise((r) => setTimeout(r, 900))\n` +
    `  setSaving(false)\n` +
    `}\n\n` +
    `// Variants\n` +
    `<Button>Default</Button>\n` +
    `<Button variant="primary">Primary</Button>\n` +
    `<Button variant="secondary">Secondary</Button>\n` +
    `<Button variant="success">Success</Button>\n` +
    `<Button variant="warning">Warning</Button>\n` +
    `<Button variant="danger">Danger</Button>\n` +
    `<Button variant="outline">Outline</Button>\n` +
    `<Button variant="ghost">Ghost</Button>\n` +
    `<Button variant="link">Link</Button>\n` +
    `<Button variant="gradient">Gradient</Button>\n\n` +
    `// Sizes\n` +
    `<Button size="sm">Small</Button>\n` +
    `<Button size="md">Medium</Button>\n` +
    `<Button size="lg">Large</Button>\n` +
    `<Button size="smx">Smx</Button>\n` +
    `<Button size="icon" variant="outline" icon={Plus} aria-label="Add" />\n\n` +
    `// Icons\n` +
    `<Button icon={Download}>Download</Button>\n` +
    `<Button iconRight={ArrowRight} variant="primary">Tiếp tục</Button>\n` +
    `<Button icon={Plus} iconRight={ArrowRight} variant="secondary">New</Button>\n\n` +
    `// Loading & Disabled\n` +
    `<Button loading loadingText="Đang xử lý...">Loading</Button>\n` +
    `<Button disabled variant="outline">Disabled</Button>\n` +
    `<Button loading preserveChildrenOnLoading variant="success">Lưu</Button>\n` +
    `<Button onClick={onSave} loading={saving} variant="primary">Lưu thay đổi</Button>\n\n` +
    `// Behavior\n` +
    `<Button preventDoubleClick onClick={handleClick}>Chống double-click</Button>\n` +
    `<Button fullWidth variant="outline">Full width button</Button>`;

  const demo = (
    <div className="space-y-6">
      {/* Variants */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Variants</p>
        <div className="flex flex-wrap gap-3">
          <Button>Default</Button>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="success">Success</Button>
          <Button variant="warning">Warning</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link" title="Link style">Link</Button>
          <Button variant="gradient">Gradient</Button>
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Sizes</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="smx">Smx</Button>
          <Button size="icon" variant="outline" icon={Plus} aria-label="Add" />
        </div>
      </div>

      {/* Icons */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Icons</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button icon={Download}>Download</Button>
          <Button iconRight={ArrowRight} variant="primary">Tiếp tục</Button>
          <Button icon={Plus} iconRight={ArrowRight} variant="secondary">New</Button>
        </div>
      </div>

      {/* Loading & disabled */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Loading / Disabled</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button loading loadingText="Đang xử lý...">Loading</Button>
          <Button disabled variant="outline">Disabled</Button>
          <Button loading preserveChildrenOnLoading variant="success">Lưu</Button>
          <Button onClick={onSave} loading={saving} variant="primary">Lưu thay đổi</Button>
        </div>
      </div>

      {/* Behavior */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Behavior</p>
        <div className="flex flex-col gap-3">
          <Button preventDoubleClick onClick={() => console.log("clicked")}>Chống double-click</Button>
          <Button fullWidth variant="outline">Full width button</Button>
        </div>
      </div>
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
