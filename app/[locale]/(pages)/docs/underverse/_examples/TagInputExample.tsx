"use client";

import React from "react";
import TagInput from "@/components/ui/TagInput";
import CodeBlock from "../_components/CodeBlock";
import IntlDemoProvider from "../_components/IntlDemoProvider";
import { Tabs } from "@/components/ui/Tab";
import { useTranslations } from "next-intl";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function TagInputExample() {
  const t = useTranslations("DocsUnderverse");

  // Basic example states
  const [tags, setTags] = React.useState<string[]>([]);
  const [appliedTags, setAppliedTags] = React.useState<string[]>([]);

  // Size variants states
  const [smTags, setSmTags] = React.useState<string[]>(["task-001", "task-002"]);
  const [lgTags, setLgTags] = React.useState<string[]>([]);

  // Many tags for maxVisibleTags demo
  const [manyTags, setManyTags] = React.useState<string[]>([
    "user-001",
    "user-002",
    "user-003",
    "task-abc",
    "task-def",
    "project-x",
    "project-y",
    "item-123",
  ]);

  const code = `import TagInput from '@underverse-ui/underverse'

// Basic usage with two-state pattern
const [tags, setTags] = useState<string[]>([])
const [appliedTags, setAppliedTags] = useState<string[]>([])

<TagInput
  value={tags}
  onChange={setTags}
  onSearch={setAppliedTags}
  label="Filter by name"
  placeholder="Enter name and press Enter..."
  placeholderWithTags="Ctrl+Enter to search"
/>

// With maxTags limit
<TagInput
  value={tags}
  onChange={setTags}
  onSearch={handleSearch}
  maxTags={5}
  label="Max 5 tags"
/>

// With maxVisibleTags (collapse +N more)
<TagInput
  value={manyTags}
  onChange={setManyTags}
  onSearch={handleSearch}
  maxVisibleTags={3}
  label="Show max 3 tags"
/>

// Custom labels (no external i18n dependency)
<TagInput
  value={tags}
  onChange={setTags}
  onSearch={handleSearch}
  labels={{
    search: "Tìm kiếm",
    clearAll: "Xóa tất cả",
    placeholder: "Nhập giá trị...",
    moreCount: "+{count} ẩn"
  }}
/>

// Size variants
<TagInput size="sm" value={smTags} onChange={setSmTags} onSearch={...} />
<TagInput size="md" value={mdTags} onChange={setMdTags} onSearch={...} />
<TagInput size="lg" value={lgTags} onChange={setLgTags} onSearch={...} />`;

  const demo = (
    <div className="space-y-8 max-w-2xl">
      {/* Basic Usage */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Basic Usage</p>
        <TagInput
          value={tags}
          onChange={setTags}
          onSearch={setAppliedTags}
          label="Filter by task name"
          placeholder="Enter name and press Enter..."
          placeholderWithTags="Add more or Ctrl+Enter to search"
        />
        {appliedTags.length > 0 && (
          <div className="text-xs text-muted-foreground p-2 bg-muted rounded-md font-mono">
            Applied tags: [{appliedTags.map((t) => `"${t}"`).join(", ")}]
          </div>
        )}
      </div>

      {/* Max Visible Tags */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Max Visible Tags (+N more)</p>
        <TagInput
          value={manyTags}
          onChange={setManyTags}
          onSearch={(tags) => alert(`Search: ${tags.join(", ")}`)}
          maxVisibleTags={3}
          label="Show max 3 tags (click +N more to expand)"
          placeholder="Add more tags..."
        />
      </div>

      {/* Max Tags Limit */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Max Tags Limit</p>
        <TagInput
          value={tags}
          onChange={setTags}
          onSearch={setAppliedTags}
          maxTags={5}
          label="Maximum 5 tags allowed"
          placeholder="Enter tag (max 5)..."
        />
      </div>

      {/* Size Variants */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Size Variants</p>
        <div className="space-y-4">
          <TagInput
            size="sm"
            value={smTags}
            onChange={setSmTags}
            onSearch={(tags) => alert(`Search: ${tags.join(", ")}`)}
            label="Small"
            placeholder="Enter tag..."
          />
          <TagInput
            size="md"
            value={tags}
            onChange={setTags}
            onSearch={(tags) => alert(`Search: ${tags.join(", ")}`)}
            label="Medium (default)"
            placeholder="Enter tag..."
          />
          <TagInput
            size="lg"
            value={lgTags}
            onChange={setLgTags}
            onSearch={(tags) => alert(`Search: ${tags.join(", ")}`)}
            label="Large"
            placeholder="Enter tag..."
          />
        </div>
      </div>

      {/* States */}
      <div className="space-y-3">
        <p className="text-sm font-medium">States</p>
        <div className="grid md:grid-cols-2 gap-4">
          <TagInput value={["user-1", "user-2"]} onChange={() => {}} onSearch={() => {}} label="Disabled" disabled />
          <TagInput value={["loading-example"]} onChange={() => {}} onSearch={() => {}} label="Loading" loading />
        </div>
      </div>

      {/* Hidden buttons */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Hidden Buttons</p>
        <TagInput
          value={tags}
          onChange={setTags}
          onSearch={setAppliedTags}
          label="Hide Search Button"
          hideSearchButton
          placeholder="Press Ctrl+Enter to search..."
        />
      </div>

      {/* Custom Labels */}
      <div className="space-y-3">
        <p className="text-sm font-medium">Custom Labels (no i18n dependency)</p>
        <TagInput
          value={tags}
          onChange={setTags}
          onSearch={setAppliedTags}
          label="Vietnamese labels"
          labels={{
            search: "Tìm kiếm",
            clearAll: "Xóa tất cả",
            placeholder: "Nhập giá trị và nhấn Enter...",
            placeholderWithTags: "Ctrl+Enter để tìm kiếm",
          }}
        />
      </div>
    </div>
  );

  const propsRows: PropsRow[] = [
    { property: "value", description: "Danh sách tags hiện tại", type: "string[]", default: "[]" },
    { property: "onChange", description: "Callback khi danh sách tags thay đổi", type: "(tags: string[]) => void", default: "-" },
    {
      property: "onSearch",
      description: "Callback khi user muốn tìm kiếm (Ctrl+Enter hoặc click Search)",
      type: "(tags: string[]) => void",
      default: "-",
    },
    { property: "onClear", description: "Callback khi clear all tags", type: "() => void", default: "-" },
    { property: "placeholder", description: "Placeholder khi chưa có tags", type: "string", default: '"Enter value..."' },
    { property: "placeholderWithTags", description: "Placeholder khi đã có tags", type: "string", default: '"Ctrl+Enter to search"' },
    { property: "label", description: "Label hiển thị phía trên input", type: "string", default: "-" },
    { property: "hideSearchButton", description: "Ẩn nút Search", type: "boolean", default: "false" },
    { property: "hideClearButton", description: "Ẩn nút Clear All", type: "boolean", default: "false" },
    { property: "size", description: "Kích thước component", type: '"sm" | "md" | "lg"', default: '"md"' },
    { property: "disabled", description: "Trạng thái disabled", type: "boolean", default: "false" },
    { property: "loading", description: "Trạng thái loading - hiển thị spinner trên nút Search", type: "boolean", default: "false" },
    { property: "maxTags", description: "Số tags tối đa được phép", type: "number", default: "-" },
    { property: "maxVisibleTags", description: "Số tags hiển thị trước khi collapse (+N more)", type: "number", default: "-" },
    { property: "className", description: "Custom class cho container", type: "string", default: "-" },
    {
      property: "labels",
      description: "Custom labels (no i18n dependency)",
      type: "{ search, clearAll, placeholder, placeholderWithTags, moreCount }",
      default: "-",
    },
  ];

  return (
    <IntlDemoProvider>
      <Tabs
        tabs={[
          { value: "preview", label: t("tabs.preview"), content: <div className="p-1">{demo}</div> },
          { value: "code", label: t("tabs.code"), content: <CodeBlock code={code} /> },
          {
            value: "docs",
            label: t("tabs.document"),
            content: (
              <div className="p-1">
                <PropsDocsTable rows={propsRows} order={propsRows.map((r) => r.property)} />
              </div>
            ),
          },
        ]}
        variant="underline"
        size="sm"
      />
    </IntlDemoProvider>
  );
}
