"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Textarea from "@/components/ui/Textarea";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function TextareaExample() {
  const t = useTranslations("DocsUnderverse");
  const [value1, setValue1] = React.useState("");
  const [value2, setValue2] = React.useState("");
  const [value3, setValue3] = React.useState("This textarea has an error");

  const code =
    `import { Textarea } from '@underverse-ui/underverse'\n\n` +
    `// Variants\n` +
    `<Textarea label="Default variant" variant="default" placeholder="Default style..." />\n` +
    `<Textarea label="Filled variant" variant="filled" placeholder="Filled style..." />\n` +
    `<Textarea label="Outlined variant" variant="outlined" placeholder="Outlined style..." />\n\n` +
    `// Sizes\n` +
    `<Textarea label="Small" size="sm" placeholder="Small textarea..." />\n` +
    `<Textarea label="Medium" size="md" placeholder="Medium textarea..." />\n` +
    `<Textarea label="Large" size="lg" placeholder="Large textarea..." />\n\n` +
    `// With Error\n` +
    `<Textarea label="Comment" error="This field is required" value={value} onChange={(e) => setValue(e.target.value)} />\n\n` +
    `// With Description\n` +
    `<Textarea label="Bio" description="Tell us about yourself (max 500 characters)" maxLength={500} />\n\n` +
    `// Required Field\n` +
    `<Textarea label="Required field" required placeholder="This field is required..." />\n\n` +
    `// Disabled\n` +
    `<Textarea label="Disabled" disabled value="This textarea is disabled" />`;

  const demo = (
    <div className="space-y-6">
      {/* Variants */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Variants</p>
        <div className="space-y-3">
          <Textarea label="Default variant" variant="default" placeholder="Default style..." />
          <Textarea label="Filled variant" variant="filled" placeholder="Filled style..." />
          <Textarea label="Outlined variant" variant="outlined" placeholder="Outlined style..." />
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Sizes</p>
        <div className="space-y-3">
          <Textarea label="Small" size="sm" placeholder="Small textarea..." />
          <Textarea label="Medium" size="md" placeholder="Medium textarea..." />
          <Textarea label="Large" size="lg" placeholder="Large textarea..." />
        </div>
      </div>

      {/* With Error */}
      <div className="space-y-2">
        <p className="text-sm font-medium">With Error</p>
        <Textarea
          label="Comment"
          error="This field is required"
          value={value3}
          onChange={(e) => setValue3(e.target.value)}
          placeholder="Enter your comment..."
        />
      </div>

      {/* With Description */}
      <div className="space-y-2">
        <p className="text-sm font-medium">With Description</p>
        <Textarea
          label="Bio"
          description="Tell us about yourself (max 500 characters)"
          maxLength={500}
          placeholder="Write your bio..."
          value={value2}
          onChange={(e) => setValue2(e.target.value)}
        />
      </div>

      {/* Required Field */}
      <div className="space-y-2">
        <Textarea label="Required field" required placeholder="This field is required..." />
      </div>

      {/* Disabled */}
      <div className="space-y-2">
        <Textarea label="Disabled" disabled value="This textarea is disabled" />
      </div>
    </div>
  );

  const rows: PropsRow[] = [
    { property: "label", description: t("props.textarea.label"), type: "string", default: "—" },
    { property: "variant", description: t("props.textarea.variant"), type: '"default" | "filled" | "outlined"', default: '"default"' },
    { property: "size", description: t("props.textarea.size"), type: '"sm" | "md" | "lg"', default: '"md"' },
    { property: "description", description: t("props.textarea.description"), type: "string", default: "—" },
    { property: "error", description: t("props.textarea.error"), type: "string", default: "—" },
    { property: "maxLength", description: t("props.textarea.maxLength"), type: "number", default: "—" },
    { property: "required", description: t("props.textarea.required"), type: "boolean", default: "false" },
    { property: "disabled", description: t("props.textarea.disabled"), type: "boolean", default: "false" },
    { property: "value", description: t("props.textarea.value"), type: "string", default: "—" },
    { property: "onChange", description: t("props.textarea.onChange"), type: "(e: React.ChangeEvent<HTMLTextAreaElement>) => void", default: "—" },
    { property: "placeholder", description: t("props.textarea.placeholder"), type: "string", default: "—" },
    { property: "className", description: t("props.textarea.className"), type: "string", default: "—" },
  ];
  const order = ["label","variant","size","description","error","maxLength","required","disabled","value","onChange","placeholder","className"];
  const docs = <PropsDocsTable rows={rows} order={order} markdownFile="Textarea.md" />;

  return (
    <Tabs
      tabs={[
        { value: "preview", label: t("tabs.preview"), content: <div className="p-1">{demo}</div> },
        { value: "code", label: t("tabs.code"), content: <CodeBlock code={code} /> },
        { value: "docs", label: t("tabs.document"), content: <div className="p-1">{docs}</div> },
      ]}
      variant="underline"
      size="sm"
    />
  );
}

