"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import UEditor from "@/components/ui/UEditor";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

const wrappedImageDataUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="220" viewBox="0 0 320 220">
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#c084fc"/>
        <stop offset="100%" stop-color="#f59e0b"/>
      </linearGradient>
    </defs>
    <rect width="320" height="220" rx="24" fill="url(#bg)"/>
    <circle cx="88" cy="82" r="34" fill="rgba(255,255,255,0.28)"/>
    <path d="M46 176c20-34 44-52 72-52 24 0 41 11 62 29 11-10 25-16 40-16 29 0 47 21 54 39" fill="none" stroke="rgba(255,255,255,0.75)" stroke-width="14" stroke-linecap="round"/>
    <text x="28" y="42" fill="white" font-family="Arial, sans-serif" font-size="20" font-weight="700">Wrapped Media</text>
  </svg>`,
)}`;

export default function UEditorExample() {
  const t = useTranslations("DocsUnderverse");
  const [content, setContent] = useState(`
    <h1>Welcome to UEditor</h1>
    <p>A powerful <strong>Notion-like</strong> editor built with TipTap. Try out the features below:</p>
    <h2>↕️ Table Resize Demo</h2>
    <p>Hover the right edge of a cell to resize columns. Hover the bottom edge of a row to resize row height with a stronger guide line.</p>
    <table>
      <tbody>
        <tr data-row-height="42">
          <th>Feature</th>
          <th>Status</th>
          <th>Hint</th>
        </tr>
        <tr data-row-height="56">
          <td>Column resize</td>
          <td>Live</td>
          <td>Drag the blue handle on the right edge</td>
        </tr>
        <tr data-row-height="84">
          <td>Row resize</td>
          <td>Live</td>
          <td>Hover the bottom edge of this row, then drag downward</td>
        </tr>
      </tbody>
    </table>
    <p><img src="${wrappedImageDataUrl}" alt="Wrapped" data-image-layout="right" data-image-size="md" width="220" height="150" />This editor now supports wrapped images as well, so you can keep an image on one side and let the text flow naturally beside it. Select an image and use the image menu or image bubble menu to switch between block, left wrap, and right wrap layouts, then choose S, M, or L width presets without losing the setting when you save HTML.</p>
    <h2>🔤 Typography</h2>
    <p><span style="font-family: serif; font-size: 24px; line-height: 1.2; letter-spacing: -0.02em;">Serif lead text</span> can now live beside <span style="font-family: monospace; font-size: 14px; line-height: 1.75; letter-spacing: 0.05em;">monospace notes</span> and regular body content.</p>
    <h2>✨ Features</h2>
    <ul data-type="taskList">
      <li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked></label><div>Rich text formatting (bold, italic, underline, strike)</div></li>
      <li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked></label><div>Multiple heading levels</div></li>
      <li data-type="taskItem" data-checked="false"><label><input type="checkbox"></label><div>Task lists with checkboxes</div></li>
      <li data-type="taskItem" data-checked="false"><label><input type="checkbox"></label><div>Code blocks with syntax highlighting</div></li>
    </ul>
    <blockquote><p>💡 <em>Tip: Select text to see the bubble menu for quick formatting.</em></p></blockquote>
  `);

  const basicCode =
    `import UEditor from '@/components/ui/UEditor'\n` +
    `import { useState } from 'react'\n\n` +
    `const [content, setContent] = useState("<p>Hello!</p>")\n\n` +
    `// Images: paste/drop/file => base64 (data:) by default\n` +
    `// Basic Notion-style editor\n` +
    `<UEditor\n` +
    `  content={content}\n` +
    `  onChange={setContent}\n` +
    `  placeholder="Type '/' for commands..."\n` +
    `  variant="notion"\n` +
    `/>\n\n` +
    `// Optional: upload images immediately (instead of base64)\n` +
    `<UEditor\n` +
    `  content={content}\n` +
    `  onChange={setContent}\n` +
    `  imageInsertMode="upload"\n` +
    `  uploadImage={async (file) => {\n` +
    `    const fd = new FormData()\n` +
    `    fd.append('file', file)\n` +
    `    const res = await fetch('/api/upload', { method: 'POST', body: fd })\n` +
    `    const data = await res.json()\n` +
    `    return data.url\n` +
    `  }}\n` +
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
    `// Optional: customize font dropdowns\n` +
    `<UEditor\n` +
    `  content={content}\n` +
    `  onChange={setContent}\n` +
    `  fontFamilies={[\n` +
    `    { label: 'Inter', value: 'Inter, ui-sans-serif, system-ui, sans-serif' },\n` +
    `    { label: 'Georgia', value: \"Georgia, 'Times New Roman', serif\" },\n` +
    `    { label: 'JetBrains Mono', value: \"'JetBrains Mono', 'Fira Code', monospace\" },\n` +
    `  ]}\n` +
    `  fontSizes={[\n` +
    `    { label: '14', value: '14px' },\n` +
    `    { label: '16', value: '16px' },\n` +
    `    { label: '24', value: '24px' },\n` +
    `  ]}\n` +
    `  // Font size dropdown also accepts direct px input\n` +
    `  lineHeights={[\n` +
    `    { label: '1.2', value: '1.2' },\n` +
    `    { label: '1.5', value: '1.5' },\n` +
    `    { label: '1.75', value: '1.75' },\n` +
    `  ]}\n` +
    `  letterSpacings={[\n` +
    `    { label: '-0.02em', value: '-0.02em' },\n` +
    `    { label: '0', value: '0' },\n` +
    `    { label: '0.05em', value: '0.05em' },\n` +
    `  ]}\n` +
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
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-muted-foreground">
          Resize demo: drag the right edge of a table cell for columns, drag the bottom edge of a row for row height, and use the right or bottom rail to add columns and rows like Notion.
        </div>
        <UEditor
          content={content}
          onChange={setContent}
          placeholder="Type '/' for commands, or just start writing..."
          variant="notion"
          showCharacterCount
          showBubbleMenu
          showFloatingMenu={false}
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
    </div>
  );

  const rows: PropsRow[] = [
    { property: "content", description: "HTML content of the editor", type: "string", default: '""' },
    { property: "onChange", description: "Callback when HTML content changes", type: "(content: string) => void", default: "—" },
    { property: "onHtmlChange", description: "Alias for onChange", type: "(html: string) => void", default: "—" },
    { property: "onJsonChange", description: "Callback with JSON structure of content", type: "(json: object) => void", default: "—" },
    {
      property: "uploadImage",
      description: 'Override image upload handler (used when imageInsertMode="upload"). Return the image URL.',
      type: "(file: File) => Promise<string> | string",
      default: "—",
    },
    {
      property: "imageInsertMode",
      description: 'How images are inserted: "base64" (default) or "upload" (uses uploadImage).',
      type: '"base64" | "upload"',
      default: '"base64"',
    },
    { property: "placeholder", description: "Placeholder text when empty", type: "string", default: "\"Type '/' for commands...\"" },
    { property: "className", description: "Additional CSS classes for container", type: "string", default: "undefined" },
    { property: "editable", description: "Whether the editor is editable", type: "boolean", default: "true" },
    { property: "autofocus", description: "Auto focus editor on mount", type: "boolean", default: "false" },
    { property: "showToolbar", description: "Show the main toolbar", type: "boolean", default: "true" },
    { property: "showBubbleMenu", description: "Show bubble menu on text selection", type: "boolean", default: "true" },
    { property: "showFloatingMenu", description: "Show the empty-line floating block menu.", type: "boolean", default: "false" },
    { property: "showCharacterCount", description: "Show character & word count footer", type: "boolean", default: "true" },
    { property: "maxCharacters", description: "Maximum character limit", type: "number", default: "undefined" },
    { property: "minHeight", description: "Minimum height of editor area", type: "number | string", default: '"200px"' },
    { property: "maxHeight", description: "Maximum height with scroll", type: "number | string", default: '"auto"' },
    { property: "variant", description: "UI style variant", type: '"default" | "minimal" | "notion"', default: '"default"' },
    { property: "fontFamilies", description: "Override font family options shown in the toolbar dropdown", type: "{ label: string; value: string }[]", default: "built-in presets" },
    { property: "fontSizes", description: "Override font size options shown in the toolbar dropdown", type: "{ label: string; value: string }[]", default: "built-in presets" },
    { property: "lineHeights", description: "Override line-height options shown in the toolbar dropdown", type: "{ label: string; value: string }[]", default: "built-in presets" },
    { property: "letterSpacings", description: "Override letter-spacing options shown in the toolbar dropdown", type: "{ label: string; value: string }[]", default: "built-in presets" },
  ];

  const order = [
    "content",
    "onChange",
    "onHtmlChange",
    "onJsonChange",
    "uploadImage",
    "imageInsertMode",
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
    "fontFamilies",
    "fontSizes",
    "lineHeights",
    "letterSpacings",
  ];

  const featuresDoc = (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="text-lg font-semibold mb-3">🎨 Formatting Features</h3>
        <ul className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <li>✓ Bold, Italic, Underline, Strikethrough</li>
          <li>✓ Subscript & Superscript</li>
          <li>✓ Text color & Highlight</li>
          <li>✓ Font family presets</li>
          <li>✓ Font size presets</li>
          <li>✓ Line-height presets</li>
          <li>✓ Letter-spacing presets</li>
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
          <li>✓ Tables (resizable columns + rows)</li>
          <li>✓ Images (paste/drop/upload; base64 by default)</li>
          <li>✓ Wrapped images with text flow</li>
          <li>✓ Links</li>
          <li>✓ Horizontal divider</li>
        </ul>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-3">⚡ UX Features</h3>
        <ul className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <li>✓ Bubble menu on selection</li>
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
        <PropsDocsTable rows={rows} order={order} markdownFile="UEditor.md" />
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
