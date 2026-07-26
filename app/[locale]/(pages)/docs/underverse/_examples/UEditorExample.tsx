"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import UEditor from "@/components/ui/UEditor";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function UEditorExample() {
  const t = useTranslations("DocsUnderverse");
  const initialContent = `
    <h2>${t("examples.ueditor.samples.documentTitle")}</h2>
    <p>${t("examples.ueditor.samples.documentDescription")}</p>
    <ul>
      <li>${t("examples.ueditor.samples.reviewRelease")}</li>
      <li>${t("examples.ueditor.samples.confirmMilestone")}</li>
    </ul>
  `;
  const readOnlyContent = `
    <h3>${t("examples.ueditor.samples.readOnlyTitle")}</h3>
    <p>${t("examples.ueditor.samples.readOnlyDescription")}</p>
    <blockquote><p>${t("examples.ueditor.samples.readOnlyQuote")}</p></blockquote>
  `;
  const [content, setContent] = useState(initialContent);

  const code =
    `import { useState } from 'react'\n` +
    `import { UEditor } from '@underverse-ui/underverse'\n\n` +
    `const [content, setContent] = useState('<p>Start writing…</p>')\n\n` +
    `// Basic editor\n` +
    `<UEditor\n` +
    `  content={content}\n` +
    `  onChange={setContent}\n` +
    `  placeholder="Type '/' for commands..."\n` +
    `  variant="notion"\n` +
    `  showMenuBar\n` +
    `  showCharacterCount\n` +
    `  minHeight={220}\n` +
    `/>\n\n` +
    `// Minimal toolbar\n` +
    `<UEditor\n` +
    `  content={content}\n` +
    `  onChange={setContent}\n` +
    `  variant="minimal"\n` +
    `  showBubbleMenu={false}\n` +
    `  showCharacterCount\n` +
    `  maxCharacters={200}\n` +
    `  minHeight={120}\n` +
    `/>\n\n` +
    `// Read-only\n` +
    `<UEditor content={content} editable={false} />`;

  const demo = (
    <div className="space-y-10">
      <div className="space-y-4" data-doc-preview="plain">
        <p className="text-sm font-medium">{t("examples.ueditor.basic.title")}</p>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          {t("examples.ueditor.basic.description")}
        </p>
        <UEditor
          content={content}
          onChange={setContent}
          placeholder={t("examples.ueditor.samples.placeholder")}
          variant="notion"
          showMenuBar
          showCharacterCount
          showBubbleMenu
          showFloatingMenu={false}
          minHeight={220}
        />
      </div>

      <div className="space-y-4" data-doc-preview="plain">
        <p className="text-sm font-medium">{t("examples.ueditor.minimal.title")}</p>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          {t("examples.ueditor.minimal.description")}
        </p>
        <UEditor
          content={`<p>${t("examples.ueditor.samples.minimalContent")}</p>`}
          variant="minimal"
          showBubbleMenu={false}
          showCharacterCount
          maxCharacters={200}
          showFloatingMenu={false}
          minHeight={120}
        />
      </div>

      <div className="space-y-4" data-doc-preview="plain">
        <p className="text-sm font-medium">{t("examples.ueditor.readOnly.title")}</p>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          {t("examples.ueditor.readOnly.description")}
        </p>
        <UEditor content={readOnlyContent} editable={false} />
      </div>
    </div>
  );

  const rows: PropsRow[] = [
    {
      property: "content",
      description: "HTML content rendered by the editor.",
      type: "string",
      default: '""',
      category: "Content",
    },
    {
      property: "onChange",
      description: "Called whenever the HTML content changes.",
      type: "(content: string) => void",
      default: "—",
      category: "Content",
    },
    {
      property: "onHtmlChange",
      description: "Alias for onChange.",
      type: "(html: string) => void",
      default: "—",
      category: "Content",
    },
    {
      property: "onJsonChange",
      description: "Called with the editor JSON document.",
      type: "(json: object) => void",
      default: "—",
      category: "Content",
    },
    {
      property: "placeholder",
      description: "Hint displayed when the document is empty.",
      type: "string",
      default: `"Type '/' for commands..."`,
      category: "Content",
    },
    {
      property: "editable",
      description: "Enables or disables document editing.",
      type: "boolean",
      default: "true",
      category: "Behavior",
    },
    {
      property: "autofocus",
      description: "Focuses the editor when it mounts.",
      type: "boolean",
      default: "false",
      category: "Behavior",
    },
    {
      property: "variant",
      description: "Selects the editor presentation.",
      type: '"default" | "minimal" | "notion"',
      default: '"default"',
      category: "Appearance",
    },
    {
      property: "showMenuBar",
      description: "Shows the document-style menu bar.",
      type: "boolean",
      default: "false",
      category: "Appearance",
    },
    {
      property: "showToolbar",
      description: "Shows the primary formatting toolbar.",
      type: "boolean",
      default: "true",
      category: "Appearance",
    },
    {
      property: "showBubbleMenu",
      description: "Shows contextual formatting controls for selected content.",
      type: "boolean",
      default: "true",
      category: "Appearance",
    },
    {
      property: "showFloatingMenu",
      description: "Shows the block menu on an empty line.",
      type: "boolean",
      default: "false",
      category: "Appearance",
    },
    {
      property: "showFooter",
      description: "Shows the footer below the editing surface.",
      type: "boolean",
      default: "true",
      category: "Appearance",
    },
    {
      property: "showCharacterCount",
      description: "Shows word and character totals.",
      type: "boolean",
      default: "true",
      category: "Validation",
    },
    {
      property: "maxCharacters",
      description: "Sets the maximum allowed character count.",
      type: "number",
      default: "undefined",
      category: "Validation",
    },
    {
      property: "minHeight",
      description: "Sets the minimum editing-surface height.",
      type: "number | string",
      default: '"200px"',
      category: "Layout",
    },
    {
      property: "maxHeight",
      description: "Sets the maximum height before content scrolls.",
      type: "number | string",
      default: '"auto"',
      category: "Layout",
    },
    {
      property: "rounded",
      description: "Enables rounded outer corners.",
      type: "boolean",
      default: "true",
      category: "Layout",
    },
    {
      property: "className",
      description: "Adds classes to the editor container.",
      type: "string",
      default: "undefined",
      category: "Layout",
    },
    {
      property: "imageInsertMode",
      description: "Keeps inserted images as base64 or uploads them immediately.",
      type: '"base64" | "upload"',
      default: '"base64"',
      category: "Media",
    },
    {
      property: "uploadImage",
      description: "Uploads images when imageInsertMode is upload.",
      type: "(file: File) => Promise<string> | string",
      default: "—",
      category: "Media",
    },
    {
      property: "uploadImageForSave",
      description: "Replaces inline base64 images while preparing content for save.",
      type: "(file: File) => Promise<string | { url: string }>",
      default: "—",
      category: "Media",
    },
    {
      property: "uploadImageConcurrency",
      description: "Limits concurrent image uploads during save preparation.",
      type: "number",
      default: "3",
      category: "Media",
    },
    {
      property: "maxImageFileSize",
      description: "Sets the maximum accepted image size in bytes.",
      type: "number",
      default: "10485760",
      category: "Media",
    },
    {
      property: "allowedImageMimeTypes",
      description: "Limits accepted image MIME types.",
      type: "string[]",
      default: "common web images",
      category: "Media",
    },
    {
      property: "fallbackToDataUrl",
      description: "Falls back to base64 when a paste or drop upload fails.",
      type: "boolean",
      default: "true",
      category: "Media",
    },
    {
      property: "uploadFile",
      description: "Uploads file attachments inserted from the slash menu.",
      type: "(file: File) => Promise<string> | string",
      default: "—",
      category: "Media",
    },
    {
      property: "fontFamilies",
      description: "Overrides font family choices in the toolbar.",
      type: "{ label: string; value: string }[]",
      default: "built-in presets",
      category: "Typography",
    },
    {
      property: "fontSizes",
      description: "Overrides font size choices in the toolbar.",
      type: "{ label: string; value: string }[]",
      default: "built-in presets",
      category: "Typography",
    },
    {
      property: "lineHeights",
      description: "Overrides line-height choices in the toolbar.",
      type: "{ label: string; value: string }[]",
      default: "built-in presets",
      category: "Typography",
    },
    {
      property: "letterSpacings",
      description: "Overrides letter-spacing choices in the toolbar.",
      type: "{ label: string; value: string }[]",
      default: "built-in presets",
      category: "Typography",
    },
    {
      property: "onPreview",
      description: "Handles the menu bar preview action.",
      type: "(html: string) => void | false",
      default: "—",
      category: "Menu bar",
    },
    {
      property: "onExport",
      description: "Handles the menu bar export action.",
      type: "() => void",
      default: "—",
      category: "Menu bar",
    },
    {
      property: "onSourceCode",
      description: "Handles the menu bar source-code action.",
      type: "() => void",
      default: "—",
      category: "Menu bar",
    },
    {
      property: "extraExtensions",
      description: "Adds custom Tiptap extensions after the built-in extensions.",
      type: "any[]",
      default: "[]",
      category: "Advanced",
    },
  ];

  const docs = <PropsDocsTable rows={rows} markdownFile="UEditor.md" />;

  return (
    <Tabs
      id="ueditor-tabs"
      tabs={[
        {
          value: "preview",
          label: t("tabs.preview"),
          content: <div className="p-1">{demo}</div>,
        },
        {
          value: "code",
          label: t("tabs.code"),
          content: <CodeBlock code={code} language="tsx" />,
        },
        {
          value: "docs",
          label: t("tabs.document"),
          content: <div className="p-1">{docs}</div>,
        },
      ]}
      variant="underline"
      size="sm"
    />
  );
}
