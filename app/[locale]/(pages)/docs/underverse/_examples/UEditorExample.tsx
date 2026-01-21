"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import UEditor from "@/components/ui/UEditor";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

export default function UEditorExample() {
  const t = useTranslations("DocsUnderverse");
  const [content, setContent] = useState(`
    <h1>Welcome to UEditor</h1>
    <p>A powerful <strong>Notion-like</strong> editor built with TipTap. Try out the features below:</p>
    <h2>✨ Features</h2>
    <ul data-type="taskList">
      <li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked></label><div>Rich text formatting (bold, italic, underline, strike)</div></li>
      <li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked></label><div>Multiple heading levels</div></li>
      <li data-type="taskItem" data-checked="false"><label><input type="checkbox"></label><div>Task lists with checkboxes</div></li>
      <li data-type="taskItem" data-checked="false"><label><input type="checkbox"></label><div>Code blocks with syntax highlighting</div></li>
    </ul>
    <blockquote><p>💡 <em>Tip: Select text to see the bubble menu, or click + on empty lines for block commands!</em></p></blockquote>
  `);

  const basicCode =
    `import UEditor from '@/components/ui/UEditor'\n` +
    `import { useState } from 'react'\n\n` +
    `const [content, setContent] = useState("<p>Hello!</p>")\n\n` +
    `// Basic Notion-style editor\n` +
    `<UEditor\n` +
    `  content={content}\n` +
    `  onChange={setContent}\n` +
    `  placeholder="Type '/' for commands..."\n` +
    `  variant="notion"\n` +
    `/>\n\n` +
    `// Minimal toolbar\n` +
    `<UEditor\n` +
    `  content={content}\n` +
    `  onChange={setContent}\n` +
    `  variant="minimal"\n` +
    `/>\n\n` +
    `// With character count\n` +
    `<UEditor\n` +
    `  content={content}\n` +
    `  onChange={setContent}\n` +
    `  showCharacterCount\n` +
    `  maxCharacters={500}\n` +
    `/>\n\n` +
    `// Read-only mode\n` +
    `<UEditor\n` +
    `  content={content}\n` +
    `  editable={false}\n` +
    `  showToolbar={false}\n` +
    `/>\n\n` +
    `// Custom height\n` +
    `<UEditor\n` +
    `  content={content}\n` +
    `  onChange={setContent}\n` +
    `  minHeight={300}\n` +
    `  maxHeight={500}\n` +
    `/>`;

  const demo = (
    <div className="space-y-8">
      {/* Main Editor - Notion Style */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">Notion Style</span>
          <span className="text-sm text-muted-foreground">Full-featured editor with all formatting options</span>
        </div>
        <UEditor
          content={content}
          onChange={setContent}
          placeholder="Type '/' for commands, or just start writing..."
          variant="notion"
          showCharacterCount
          showBubbleMenu
          showFloatingMenu
          minHeight={300}
        />
      </div>

      {/* Minimal Editor */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs font-medium bg-blue-500/10 text-blue-500 rounded-full">Minimal</span>
          <span className="text-sm text-muted-foreground">Simple toolbar with essential formatting</span>
        </div>
        <UEditor
          content="<p>A minimal editor for simple text input...</p>"
          variant="minimal"
          showBubbleMenu={false}
          showFloatingMenu={false}
          minHeight={120}
        />
      </div>

      {/* Character Limit */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs font-medium bg-orange-500/10 text-orange-500 rounded-full">With Limit</span>
          <span className="text-sm text-muted-foreground">Character count with max limit</span>
        </div>
        <UEditor
          content="<p>Try typing more to see the character counter...</p>"
          variant="default"
          showCharacterCount
          maxCharacters={200}
          showFloatingMenu={false}
          minHeight={100}
        />
      </div>

      {/* Read-only Preview */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs font-medium bg-gray-500/10 text-gray-500 rounded-full">Read Only</span>
          <span className="text-sm text-muted-foreground">Content preview without editing</span>
        </div>
        <UEditor
          content={content}
          editable={false}
          showToolbar={false}
          showBubbleMenu={false}
          showFloatingMenu={false}
          minHeight={150}
          className="bg-muted/20"
        />
      </div>

      {/* HTML Output */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs font-medium bg-green-500/10 text-green-500 rounded-full">Output</span>
          <span className="text-sm text-muted-foreground">Raw HTML from the editor</span>
        </div>
        <div className="p-4 rounded-xl bg-[#1e1e1e] text-[#d4d4d4] font-mono text-xs overflow-x-auto whitespace-pre-wrap border max-h-48 overflow-y-auto">
          {content}
        </div>
      </div>
    </div>
  );

  const rows: PropsRow[] = [
    { property: "content", description: "HTML content of the editor", type: "string", default: '""' },
    { property: "onChange", description: "Callback when HTML content changes", type: "(content: string) => void", default: "—" },
    { property: "onHtmlChange", description: "Alias for onChange", type: "(html: string) => void", default: "—" },
    { property: "onJsonChange", description: "Callback with JSON structure of content", type: "(json: object) => void", default: "—" },
    { property: "placeholder", description: "Placeholder text when empty", type: "string", default: "\"Type '/' for commands...\"" },
    { property: "className", description: "Additional CSS classes for container", type: "string", default: "undefined" },
    { property: "editable", description: "Whether the editor is editable", type: "boolean", default: "true" },
    { property: "autofocus", description: "Auto focus editor on mount", type: "boolean", default: "false" },
    { property: "showToolbar", description: "Show the main toolbar", type: "boolean", default: "true" },
    { property: "showBubbleMenu", description: "Show bubble menu on text selection", type: "boolean", default: "true" },
    { property: "showFloatingMenu", description: "Show floating menu on empty lines", type: "boolean", default: "true" },
    { property: "showCharacterCount", description: "Show character & word count footer", type: "boolean", default: "false" },
    { property: "maxCharacters", description: "Maximum character limit", type: "number", default: "undefined" },
    { property: "minHeight", description: "Minimum height of editor area (px)", type: "number", default: "200" },
    { property: "maxHeight", description: "Maximum height with scroll (px)", type: "number", default: "undefined" },
    { property: "variant", description: "UI style variant", type: '"default" | "minimal" | "notion"', default: '"notion"' },
  ];

  const order = [
    "content",
    "onChange",
    "onHtmlChange",
    "onJsonChange",
    "placeholder",
    "className",
    "editable",
    "autofocus",
    "showToolbar",
    "showBubbleMenu",
    "showFloatingMenu",
    "showCharacterCount",
    "maxCharacters",
    "minHeight",
    "maxHeight",
    "variant",
  ];

  const featuresDoc = (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="text-lg font-semibold mb-3">🎨 Formatting Features</h3>
        <ul className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <li>✓ Bold, Italic, Underline, Strikethrough</li>
          <li>✓ Subscript & Superscript</li>
          <li>✓ Text color & Highlight</li>
          <li>✓ Headings (H1, H2, H3)</li>
          <li>✓ Text alignment (left, center, right, justify)</li>
          <li>✓ Inline code</li>
        </ul>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-3">📝 Block Features</h3>
        <ul className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <li>✓ Bullet & Numbered lists</li>
          <li>✓ Task lists with checkboxes</li>
          <li>✓ Blockquote</li>
          <li>✓ Code blocks with syntax highlighting</li>
          <li>✓ Tables (resizable)</li>
          <li>✓ Images</li>
          <li>✓ Links</li>
          <li>✓ Horizontal divider</li>
        </ul>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-3">⚡ UX Features</h3>
        <ul className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <li>✓ Bubble menu on selection</li>
          <li>✓ Floating menu (+) for block commands</li>
          <li>✓ Keyboard shortcuts</li>
          <li>✓ Undo/Redo with history</li>
          <li>✓ Character & word count</li>
          <li>✓ Typography auto-formatting</li>
        </ul>
      </div>
    </div>
  );

  const docs = (
    <div className="space-y-6">
      {featuresDoc}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-4 px-4">Props Reference</h3>
        <PropsDocsTable rows={rows} order={order} />
      </div>
    </div>
  );

  return (
    <Tabs
      tabs={[
        { value: "preview", label: t("tabs.preview"), content: <div className="p-1">{demo}</div> },
        { value: "code", label: t("tabs.code"), content: <CodeBlock code={basicCode} /> },
        { value: "docs", label: t("tabs.document"), content: <div className="p-1">{docs}</div> },
      ]}
      variant="underline"
      size="sm"
    />
  );
}
