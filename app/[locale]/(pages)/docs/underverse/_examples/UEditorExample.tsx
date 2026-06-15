"use client";

import React, { useState } from "react";
import { Extension } from "@tiptap/core";
import { useTranslations } from "next-intl";
import UEditor, { type UEditorRef, type UEditorUploadImageForSave } from "@/components/ui/UEditor";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import CodeBlock from "../_components/CodeBlock";
import { Tabs } from "@/components/ui/Tab";
import { PropsDocsTable, type PropsRow } from "./PropsDocsTabPattern";

const DemoCustomExtension = Extension.create({
  name: "demoCustomExtension",
  addKeyboardShortcuts() {
    return {
      "Mod-Shift-K": () => {
        alert("extraExtensions: custom keyboard shortcut Mod+Shift+K triggered!");
        return true;
      },
    };
  },
});

const CUSTOM_FONT_FAMILIES = [
  { label: "Inter", value: "Inter, ui-sans-serif, system-ui, sans-serif" },
  { label: "Georgia", value: "Georgia, 'Times New Roman', serif" },
  { label: "JetBrains Mono", value: "'JetBrains Mono', 'Fira Code', monospace" },
  { label: "Playfair Display", value: "'Playfair Display', Georgia, serif" },
];

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

const UEDITOR_SAVE_DEMO_STORAGE_KEY = "underverse-ui:ueditor-save-demo-html";
const UEDITOR_MENU_BAR_SAVE_DEMO_STORAGE_KEY = "underverse-ui:ueditor-menu-bar-save-demo-html";
const LEGACY_UEDITOR_DEMO_IMAGE_URL = "https://picsum.photos/seed/ueditor-";
const DEFAULT_MENU_BAR_CONTENT =
  "<p>Editor với menu bar kiểu classic — Tập tin, Sửa, Xem, Thêm, Định dạng, Công cụ, Bảng.</p>";

export default function UEditorExample() {
  const t = useTranslations("DocsUnderverse");
  const editorRef = React.useRef<UEditorRef>(null);
  const menuBarEditorRef = React.useRef<UEditorRef>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [menuBarContent, setMenuBarContent] = useState(DEFAULT_MENU_BAR_CONTENT);
  const [menuBarSaveStatus, setMenuBarSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [menuBarSavedMessage, setMenuBarSavedMessage] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [savedHtml, setSavedHtml] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [modalContent, setModalContent] = useState(`
    <h2>UEditor Inside Modal Demo</h2>
    <p>This editor lives inside a modal. Test suggestion popups and menus here:</p>
    <ul>
      <li>Type <code>/</code> to trigger slash command suggestions.</li>
      <li>Double-click text to trigger the Bubble menu.</li>
      <li>Add a table using <code>/table</code> and change cell background color.</li>
    </ul>
  `);
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
    <h2>📝 Form Interactive Fields</h2>
    <p>Try clicking the checkboxes and radio buttons below directly inside the document. In the editor, when a radio button is selected, click the settings gear icon to edit its group name.</p>
    <p><input type="checkbox" data-type="form-checkbox" data-checked="true"> Option A (Form Checkbox)</p>
    <p><input type="checkbox" data-type="form-checkbox"> Option B (Form Checkbox)</p>
    <p>Select your favorite flavor:</p>
    <p><input type="radio" data-type="form-radio" data-checked="true" name="flavor-group" id="rad-choc" value="chocolate"> Chocolate (Form Radio)</p>
    <p><input type="radio" data-type="form-radio" name="flavor-group" id="rad-vanilla" value="vanilla"> Vanilla (Form Radio)</p>
  `);

  const uploadFile = async (file: File): Promise<string> => {
    return URL.createObjectURL(file);
  };

  const uploadImageForSave: UEditorUploadImageForSave = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/ueditor-demo-upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Demo image upload failed.");
    }

    const result = (await response.json()) as {
      url?: string;
      originalName?: string;
      size?: number;
      demoUpload?: boolean;
    };

    return {
      url: result.url ?? "",
      originalName: result.originalName ?? file.name,
      size: result.size ?? file.size,
      demoUpload: result.demoUpload ?? true,
    };
  };

  React.useEffect(() => {
    try {
      const storedMenuBarHtml = window.localStorage.getItem(UEDITOR_MENU_BAR_SAVE_DEMO_STORAGE_KEY);
      const storedHtml = window.localStorage.getItem(UEDITOR_SAVE_DEMO_STORAGE_KEY);

      if (storedMenuBarHtml?.includes(LEGACY_UEDITOR_DEMO_IMAGE_URL)) {
        window.localStorage.removeItem(UEDITOR_MENU_BAR_SAVE_DEMO_STORAGE_KEY);
        setMenuBarSavedMessage("Cleared old demo image URL. Save again to use the local demo upload.");
      } else if (storedMenuBarHtml) {
        setMenuBarContent(storedMenuBarHtml);
        setMenuBarSavedMessage("Loaded menu bar demo HTML from localStorage.");
        setMenuBarSaveStatus("saved");
      }

      if (storedHtml?.includes(LEGACY_UEDITOR_DEMO_IMAGE_URL)) {
        window.localStorage.removeItem(UEDITOR_SAVE_DEMO_STORAGE_KEY);
        setSavedMessage("Cleared old demo image URL. Save again to use the local demo upload.");
      } else if (storedHtml) {
        setContent(storedHtml);
        setSavedHtml(storedHtml);
        setSavedMessage("Loaded saved demo HTML from localStorage.");
        setSaveStatus("saved");
      }
    } catch {
      // localStorage can be unavailable in private or restricted contexts.
    }
  }, []);

  const handleMenuBarSave = async () => {
    setMenuBarSaveStatus("saving");
    setMenuBarSavedMessage("");

    try {
      const prepared = await menuBarEditorRef.current?.prepareContentForSave({ throwOnError: true });
      const html = prepared?.html ?? menuBarContent;

      setMenuBarContent(html);
      window.localStorage.setItem(UEDITOR_MENU_BAR_SAVE_DEMO_STORAGE_KEY, html);
      setMenuBarSavedMessage(
        `Saved ${prepared?.uploaded.length ?? 0} uploaded item(s). Inline image URL(s): ${prepared?.inlineImageUrls.length ?? 0}.`,
      );
      setMenuBarSaveStatus("saved");
    } catch (error) {
      setMenuBarSavedMessage(error instanceof Error ? error.message : "Failed to save menu bar editor content.");
      setMenuBarSaveStatus("error");
    }
  };

  const resetMenuBarSavedDemo = () => {
    try {
      window.localStorage.removeItem(UEDITOR_MENU_BAR_SAVE_DEMO_STORAGE_KEY);
    } catch {
      // Ignore storage cleanup failures in restricted contexts.
    }

    setMenuBarContent(DEFAULT_MENU_BAR_CONTENT);
    setMenuBarSavedMessage("Menu bar saved demo HTML cleared.");
    setMenuBarSaveStatus("idle");
  };

  const handlePrepareAndSave = async () => {
    setSaveStatus("saving");
    setSavedMessage("");

    try {
      const prepared = await editorRef.current?.prepareContentForSave({ throwOnError: true });
      const html = prepared?.html ?? "";

      setContent(html);
      setSavedHtml(html);
      window.localStorage.setItem(UEDITOR_SAVE_DEMO_STORAGE_KEY, html);
      setSavedMessage(
        `Saved ${prepared?.uploaded.length ?? 0} uploaded item(s). Inline image URL(s): ${prepared?.inlineImageUrls.length ?? 0}.`,
      );
      setSaveStatus("saved");
    } catch (error) {
      setSavedMessage(error instanceof Error ? error.message : "Failed to prepare editor content.");
      setSaveStatus("error");
    }
  };

  const resetSavedDemo = () => {
    try {
      window.localStorage.removeItem(UEDITOR_SAVE_DEMO_STORAGE_KEY);
    } catch {
      // Ignore storage cleanup failures in restricted contexts.
    }

    setSavedHtml("");
    setSavedMessage("Saved demo HTML cleared. Reload to see the original sample content.");
    setSaveStatus("idle");
  };

  const basicCode =
    `import UEditor from '@/components/ui/UEditor'\n` +
    `import { useRef, useState } from 'react'\n` +
    `import type { UEditorRef } from '@/components/ui/UEditor'\n\n` +
    `const editorRef = useRef<UEditorRef>(null)\n` +
    `const [content, setContent] = useState("<p>Hello!</p>")\n\n` +
    `// Images: paste/drop/file => base64 (data:) by default\n` +
    `// Basic Notion-style editor\n` +
    `<UEditor\n` +
    `  content={content}\n` +
    `  onChange={setContent}\n` +
    `  placeholder="Type '/' for commands..."\n` +
    `  variant="notion"\n` +
    `/>\n\n` +
    `// Recommended: keep images as base64 while editing, upload before save\n` +
    `const handleSave = async () => {\n` +
    `  const prepared = await editorRef.current?.prepareContentForSave({ throwOnError: true })\n` +
    `  await api.savePost({ content: prepared?.html ?? "" })\n` +
    `}\n\n` +
    `<UEditor\n` +
    `  ref={editorRef}\n` +
    `  content={content}\n` +
    `  onChange={setContent}\n` +
    `  uploadImageForSave={async (file) => {\n` +
    `    const fd = new FormData()\n` +
    `    fd.append('file', file)\n` +
    `    const res = await fetch('/api/upload', { method: 'POST', body: fd })\n` +
    `    const data = await res.json()\n` +
    `    return data.url\n` +
    `  }}\n` +
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
    `// Read-only mode — no border, no toolbar, no table resize\n` +
    `<UEditor\n` +
    `  content={content}\n` +
    `  editable={false}\n` +
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
      {/* Classic Menu Bar Editor */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs font-medium bg-violet-500/10 text-violet-500 rounded-full">Menu Bar</span>
          <span className="text-sm text-muted-foreground">Classic editor with menu bar (showMenuBar)</span>
        </div>
        <UEditor
          ref={menuBarEditorRef}
          content={menuBarContent}
          onChange={setMenuBarContent}
          uploadImageForSave={uploadImageForSave}
          showMenuBar
          showBubbleMenu
          showFloatingMenu={false}
          showCharacterCount
          minHeight={200}
          onSave={handleMenuBarSave}
          onExport={() => alert("onExport callback!")}
          onSourceCode={() => alert("onSourceCode callback!")}
          onPreview={(html) => setPreviewHtml(html)}
        />
        <div className="flex flex-wrap items-center justify-between gap-3 border border-border bg-muted/20 p-3 text-sm">
          <p className={menuBarSaveStatus === "error" ? "text-destructive" : "text-muted-foreground"}>
            {menuBarSavedMessage || "Use File > Save to upload inline base64 images and persist this demo."}
          </p>
          <div className="flex items-center gap-2">
            {menuBarSaveStatus === "saving" && <span className="text-xs text-muted-foreground">Saving...</span>}
            {menuBarContent !== DEFAULT_MENU_BAR_CONTENT && (
              <Button
                variant="outline"
                onClick={resetMenuBarSavedDemo}
              >
                Reset saved demo
              </Button>
            )}
          </div>
        </div>
        {previewHtml && (
          <div className="border border-border rounded p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Preview (View &gt; Preview)</p>
              <Button variant="outline" onClick={() => setPreviewHtml("")}>Close</Button>
            </div>
            <UEditor content={previewHtml} editable={false} />
          </div>
        )}
      </div>

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
          ref={editorRef}
          content={content}
          onChange={setContent}
          uploadImageForSave={uploadImageForSave}
          uploadFile={uploadFile}
          fontFamilies={CUSTOM_FONT_FAMILIES}
          maxImageFileSize={2 * 1024 * 1024}
          allowedImageMimeTypes={["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]}
          placeholder="Type '/' for commands, or just start writing..."
          variant="notion"
          showCharacterCount
          showBubbleMenu
          showFloatingMenu={false}
          minHeight={300}
        />
        <div className="space-y-3 border border-border bg-muted/20 p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm font-medium">Base64 while editing, upload before save</p>
              <p className="text-xs text-muted-foreground">
                Insert or paste an image, then prepare the HTML to replace inline base64 images with uploaded URLs.
              </p>
            </div>
            <Button
              variant="primary"
              onClick={handlePrepareAndSave}
              loading={saveStatus === "saving"}
            >
              Prepare & Save
            </Button>
            {savedHtml && (
              <Button
                variant="outline"
                onClick={resetSavedDemo}
              >
                Reset saved demo
              </Button>
            )}
          </div>
          {savedMessage && (
            <p className={saveStatus === "error" ? "text-sm text-destructive" : "text-sm text-muted-foreground"}>
              {savedMessage}
            </p>
          )}
          {savedHtml && (
            <pre className="max-h-52 overflow-auto border border-border bg-background p-3 text-xs">
              <code>{savedHtml}</code>
            </pre>
          )}
        </div>
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

      {/* Extra Extensions */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs font-medium bg-green-500/10 text-green-500 rounded-full">Extra Extensions</span>
          <span className="text-sm text-muted-foreground">Custom Tiptap extension via extraExtensions prop</span>
        </div>
        <div className="rounded-xl border border-green-500/20 bg-green-500/5 px-3 py-2 text-sm text-muted-foreground">
          Press <strong>Cmd+Shift+K</strong> (Mac) / <strong>Ctrl+Shift+K</strong> (Windows) to trigger the injected custom extension.
        </div>
        <UEditor
          content="<p>This editor has a custom Tiptap extension injected via <code>extraExtensions</code>. Focus here and press <strong>Cmd+Shift+K</strong> to trigger it.</p>"
          variant="default"
          extraExtensions={[DemoCustomExtension]}
          showFloatingMenu={false}
          minHeight={100}
        />
      </div>

      {/* Read-only Preview */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs font-medium bg-gray-500/10 text-gray-500 rounded-full">Read Only</span>
          <span className="text-sm text-muted-foreground">Content preview — no border, no resize, no toolbar</span>
        </div>
        <UEditor
          content={content}
          editable={false}
        />
      </div>

      {/* UEditor inside Modal */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs font-medium bg-purple-500/10 text-purple-500 rounded-full">Inside Modal</span>
          <span className="text-sm text-muted-foreground">Editor embedded within a Modal component</span>
        </div>
        <div>
          <Button variant="outline" onClick={() => setIsModalOpen(true)}>
            Open UEditor Modal
          </Button>
        </div>
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="UEditor inside Modal"
          size="lg"
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Try using "/", the selection bubble menu, or table color formatting. Clicking inside suggestion dropdowns or palettes will not close the modal.
            </p>
            <UEditor
              content={modalContent}
              onChange={setModalContent}
              placeholder="Type '/' for commands..."
              variant="notion"
              showCharacterCount
              showBubbleMenu
              showFloatingMenu={false}
              minHeight={250}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        </Modal>
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
      property: "uploadImageForSave",
      description: "Upload handler used by prepareContentForSave() to transform base64 images before save.",
      type: "(file: File) => Promise<string | { url: string }>",
      default: "—",
    },
    { property: "uploadImageConcurrency", description: "Maximum number of inline base64 images uploaded at once during prepareContentForSave().", type: "number", default: "3" },
    {
      property: "imageInsertMode",
      description: 'How images are inserted: "base64" (default) or "upload" (uses uploadImage).',
      type: '"base64" | "upload"',
      default: '"base64"',
    },
    { property: "maxImageFileSize", description: "Maximum image file size for paste, drop, and toolbar file insertion.", type: "number", default: "10485760" },
    { property: "allowedImageMimeTypes", description: "Allowed image MIME types for paste, drop, and toolbar file insertion.", type: "string[]", default: "common web images" },
    { property: "fallbackToDataUrl", description: "For paste/drop upload mode, fall back to base64 if uploadImage fails.", type: "boolean", default: "true" },
    { property: "placeholder", description: "Placeholder text when empty", type: "string", default: "\"Type '/' for commands...\"" },
    { property: "className", description: "Additional CSS classes for container", type: "string", default: "undefined" },
    { property: "editable", description: "Whether the editor is editable", type: "boolean", default: "true" },
    { property: "autofocus", description: "Auto focus editor on mount", type: "boolean", default: "false" },
    { property: "showToolbar", description: "Show the main toolbar", type: "boolean", default: "true" },
    { property: "showBubbleMenu", description: "Show bubble menu on text selection", type: "boolean", default: "true" },
    { property: "showFloatingMenu", description: "Show the empty-line floating block menu.", type: "boolean", default: "false" },
    { property: "showCharacterCount", description: "Show character & word count footer", type: "boolean", default: "true" },
    { property: "showFooter", description: "Show the editor footer", type: "boolean", default: "true" },
    { property: "maxCharacters", description: "Maximum character limit", type: "number", default: "undefined" },
    { property: "minHeight", description: "Minimum height of editor area", type: "number | string", default: '"200px"' },
    { property: "maxHeight", description: "Maximum height with scroll", type: "number | string", default: '"auto"' },
    { property: "variant", description: "UI style variant", type: '"default" | "minimal" | "notion"', default: '"default"' },
    { property: "rounded", description: "Whether the editor has rounded corners", type: "boolean", default: "true" },
    { property: "fontFamilies", description: "Override font family options shown in the toolbar dropdown", type: "{ label: string; value: string }[]", default: "built-in presets" },
    { property: "fontSizes", description: "Override font size options shown in the toolbar dropdown", type: "{ label: string; value: string }[]", default: "built-in presets" },
    { property: "lineHeights", description: "Override line-height options shown in the toolbar dropdown", type: "{ label: string; value: string }[]", default: "built-in presets" },
    { property: "letterSpacings", description: "Override letter-spacing options shown in the toolbar dropdown", type: "{ label: string; value: string }[]", default: "built-in presets" },
    { property: "uploadFile", description: "Upload handler for file attachments inserted via slash command (/file).", type: "(file: File) => Promise<string> | string", default: "—" },
    { property: "onPreview", description: "Callback for View > Preview in the menu bar. Return false to skip the built-in preview dialog.", type: "(html: string) => void | false", default: "—" },
    { property: "onExport", description: "Callback for File > Export in the menu bar.", type: "() => void", default: "—" },
    { property: "onSourceCode", description: "Callback for View > Source Code in the menu bar.", type: "() => void", default: "—" },
    { property: "showMenuBar", description: "Show the classic menu bar (File, Edit, View, Insert, Format, Tools, Table) above the editor.", type: "boolean", default: "false" },
    { property: "extraExtensions", description: "Additional Tiptap extensions to inject into the editor alongside the built-in set.", type: "any[]", default: "[]" },
  ];

  const order = [
    "content",
    "onChange",
    "onHtmlChange",
    "onJsonChange",
    "uploadImage",
    "uploadImageForSave",
    "uploadImageConcurrency",
    "imageInsertMode",
    "maxImageFileSize",
    "allowedImageMimeTypes",
    "fallbackToDataUrl",
    "placeholder",
    "className",
    "editable",
    "autofocus",
    "showToolbar",
    "showBubbleMenu",
    "showFloatingMenu",
    "showCharacterCount",
    "showFooter",
    "maxCharacters",
    "minHeight",
    "maxHeight",
    "variant",
    "rounded",
    "fontFamilies",
    "fontSizes",
    "lineHeights",
    "letterSpacings",
    "uploadFile",
    "onPreview",
    "onExport",
    "onSourceCode",
    "showMenuBar",
    "extraExtensions",
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
    <Tabs id="ueditor-tabs"
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
