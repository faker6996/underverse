"use client";

import React from "react";
import Button from "@/components/ui/Button";
import CodeBlock from "../_components/CodeBlock";
import { ArrowRight, Download, Plus } from "lucide-react";

export default function ButtonAdvancedExample() {
  const [saving, setSaving] = React.useState(false);
  const onSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setSaving(false);
  };

  return (
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

      <CodeBlock code={`// Variants, sizes, icons, loading, disabled, behaviors\n<Button variant='primary' size='md' iconRight={ArrowRight}>Tiếp tục</Button>`} />
    </div>
  );
}

