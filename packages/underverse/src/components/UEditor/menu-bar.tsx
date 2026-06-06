"use client";

import React, { useRef, useState } from "react";
import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold as BoldIcon,
  Code as CodeIcon,
  Eye,
  FileCode,
  Heading1 as Heading1Icon,
  Heading2 as Heading2Icon,
  Heading3 as Heading3Icon,
  Image as ImageIcon,
  Italic as ItalicIcon,
  Link as LinkIcon,
  ListTodo,
  Maximize2,
  Quote as QuoteIcon,
  Redo as RedoIcon,
  Scissors,
  Strikethrough as StrikethroughIcon,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Table as TableIcon,
  Trash2,
  Underline as UnderlineIcon,
  Undo as UndoIcon,
  Upload,
  X,
} from "lucide-react";
import { useSmartTranslations } from "../../hooks/useSmartTranslations";
import { cn } from "../../utils/cn";
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, useDropdownMenuClose } from "../DropdownMenu";
import Modal from "../Modal";
import { ImageInput, LinkInput } from "./inputs";
import { TableInsertGrid, fileToDataUrl, getTableAnchorPos } from "./toolbar";
import { sanitizeUEditorUrl } from "./url-safety";
import { DEFAULT_UEDITOR_IMAGE_MAX_FILE_SIZE, DEFAULT_UEDITOR_IMAGE_MIME_TYPES } from "./clipboard-images";
import { UEDITOR_PROSEMIRROR_CLASS_NAME } from "./editor-styles";

// ─── Types ──────────────────────────────────────────────────────────────────

type MenuAction = {
  type: "action";
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  destructive?: boolean;
};

type MenuSeparator = { type: "separator" };

type MenuSub = {
  type: "sub";
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  items: MenuItemDef[];
  disabled?: boolean;
};

type MenuCustom = { type: "custom"; key: string; render: () => React.ReactNode };

type MenuItemDef = MenuAction | MenuSeparator | MenuSub | MenuCustom;

// ─── Render helper ──────────────────────────────────────────────────────────

function MenuTableInsertGrid({
  insertLabel,
  previewTemplate,
  onInsert,
}: {
  insertLabel: string;
  previewTemplate: string;
  onInsert: (rows: number, cols: number) => void;
}) {
  const closeMenu = useDropdownMenuClose();

  return (
    <TableInsertGrid
      insertLabel={insertLabel}
      previewTemplate={previewTemplate}
      onInsert={(rows, cols) => {
        onInsert(rows, cols);
        closeMenu();
      }}
    />
  );
}

function renderMenuItems(items: MenuItemDef[]): React.ReactNode {
  return items.map((item, i) => {
    switch (item.type) {
      case "separator":
        return <DropdownMenuSeparator key={i} />;
      case "action":
        return (
          <DropdownMenuItem
            key={i}
            label={item.label}
            icon={item.icon}
            shortcut={item.shortcut}
            onClick={item.onClick}
            disabled={item.disabled}
            active={item.active}
            destructive={item.destructive}
          />
        );
      case "sub":
        return (
          <DropdownMenuSub key={i} label={item.label} icon={item.icon} disabled={item.disabled}>
            {renderMenuItems(item.items)}
          </DropdownMenuSub>
        );
      case "custom":
        return <React.Fragment key={item.key}>{item.render()}</React.Fragment>;
    }
  });
}

// ─── Menu builders ──────────────────────────────────────────────────────────

function buildFileMenuItems(
  t: (k: string) => string,
  editor: Editor,
  { onSave, onExport }: { onSave?: () => void; onExport?: () => void },
): MenuItemDef[] {
  return [
    {
      type: "action",
      label: t("menubar.save"),
      shortcut: "Ctrl+S",
      onClick: () => onSave?.(),
      disabled: !onSave,
    },
    {
      type: "action",
      label: t("menubar.exportHtml"),
      onClick: () => {
        if (onExport) {
          onExport();
        } else {
          // Default: download as HTML file
          const html = editor.getHTML();
          const blob = new Blob([`<!DOCTYPE html><html><body>${html}</body></html>`], { type: "text/html" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "document.html";
          a.click();
          URL.revokeObjectURL(url);
        }
      },
    },
  ];
}

function buildEditMenuItems(t: (k: string) => string, editor: Editor): MenuItemDef[] {
  return [
    {
      type: "action",
      label: t("menubar.undo"),
      icon: UndoIcon,
      shortcut: t("menubar.undoShortcut"),
      onClick: () => editor.chain().focus().undo().run(),
      disabled: !editor.can().undo(),
    },
    {
      type: "action",
      label: t("menubar.redo"),
      icon: RedoIcon,
      shortcut: t("menubar.redoShortcut"),
      onClick: () => editor.chain().focus().redo().run(),
      disabled: !editor.can().redo(),
    },
    { type: "separator" },
    {
      type: "action",
      label: t("menubar.cut"),
      icon: Scissors,
      shortcut: t("menubar.cutShortcut"),
      onClick: () => document.execCommand("cut"),
    },
    {
      type: "action",
      label: t("menubar.copy"),
      shortcut: t("menubar.copyShortcut"),
      onClick: () => document.execCommand("copy"),
    },
    {
      type: "action",
      label: t("menubar.paste"),
      shortcut: t("menubar.pasteShortcut"),
      onClick: () => document.execCommand("paste"),
    },
    {
      type: "action",
      label: t("menubar.pasteAsText"),
      onClick: async () => {
        try {
          const text = await navigator.clipboard.readText();
          editor.chain().focus().insertContent(text).run();
        } catch {
          document.execCommand("paste");
        }
      },
    },
    { type: "separator" },
    {
      type: "action",
      label: t("menubar.selectAll"),
      shortcut: t("menubar.selectAllShortcut"),
      onClick: () => editor.chain().focus().selectAll().run(),
    },
  ];
}

function buildViewMenuItems(
  t: (k: string) => string,
  {
    containerRef,
    onSourceCode,
    openSourceDialog,
    onPreview,
    openPreviewDialog,
  }: {
    containerRef: React.RefObject<HTMLElement | null>;
    onSourceCode?: () => void;
    openSourceDialog: () => void;
    onPreview?: () => void;
    openPreviewDialog: () => void;
  },
): MenuItemDef[] {
  return [
    {
      type: "action",
      label: t("menubar.sourceCode"),
      icon: FileCode,
      onClick: () => (onSourceCode ? onSourceCode() : openSourceDialog()),
    },
    {
      type: "action",
      label: t("menubar.preview"),
      onClick: () => (onPreview ? onPreview() : openPreviewDialog()),
    },
    { type: "separator" },
    {
      type: "action",
      label: t("menubar.fullscreen"),
      icon: Maximize2,
      shortcut: t("menubar.fullscreenShortcut"),
      onClick: () => {
        const el = containerRef.current;
        if (!el) return;
        if (!document.fullscreenElement) {
          el.requestFullscreen?.();
        } else {
          document.exitFullscreen?.();
        }
      },
    },
  ];
}

function buildFormatMenuItems(t: (k: string) => string, editor: Editor): MenuItemDef[] {
  return [
    {
      type: "action",
      label: t("menubar.bold"),
      icon: BoldIcon,
      shortcut: t("menubar.boldShortcut"),
      active: editor.isActive("bold"),
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      type: "action",
      label: t("menubar.italic"),
      icon: ItalicIcon,
      shortcut: t("menubar.italicShortcut"),
      active: editor.isActive("italic"),
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      type: "action",
      label: t("menubar.underline"),
      icon: UnderlineIcon,
      shortcut: t("menubar.underlineShortcut"),
      active: editor.isActive("underline"),
      onClick: () => editor.chain().focus().toggleUnderline().run(),
    },
    {
      type: "action",
      label: t("menubar.strike"),
      icon: StrikethroughIcon,
      active: editor.isActive("strike"),
      onClick: () => editor.chain().focus().toggleStrike().run(),
    },
    {
      type: "action",
      label: t("menubar.superscript"),
      icon: SuperscriptIcon,
      active: editor.isActive("superscript"),
      onClick: () => editor.chain().focus().toggleSuperscript().run(),
    },
    {
      type: "action",
      label: t("menubar.subscript"),
      icon: SubscriptIcon,
      active: editor.isActive("subscript"),
      onClick: () => editor.chain().focus().toggleSubscript().run(),
    },
    {
      type: "action",
      label: t("menubar.code"),
      icon: CodeIcon,
      active: editor.isActive("code"),
      onClick: () => editor.chain().focus().toggleCode().run(),
    },
    { type: "separator" },
    {
      type: "sub",
      label: t("menubar.wrap"),
      items: [
        {
          type: "action",
          label: t("menubar.paragraph"),
          active: editor.isActive("paragraph"),
          onClick: () => editor.chain().focus().setParagraph().run(),
        },
        {
          type: "action",
          label: t("menubar.heading1"),
          icon: Heading1Icon,
          active: editor.isActive("heading", { level: 1 }),
          onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        },
        {
          type: "action",
          label: t("menubar.heading2"),
          icon: Heading2Icon,
          active: editor.isActive("heading", { level: 2 }),
          onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        },
        {
          type: "action",
          label: t("menubar.heading3"),
          icon: Heading3Icon,
          active: editor.isActive("heading", { level: 3 }),
          onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        },
        { type: "separator" },
        {
          type: "action",
          label: t("menubar.blockquote"),
          icon: QuoteIcon,
          active: editor.isActive("blockquote"),
          onClick: () => editor.chain().focus().toggleBlockquote().run(),
        },
        {
          type: "action",
          label: t("menubar.codeBlock"),
          icon: FileCode,
          active: editor.isActive("codeBlock"),
          onClick: () => editor.chain().focus().toggleCodeBlock().run(),
        },
        {
          type: "action",
          label: t("menubar.taskList"),
          icon: ListTodo,
          active: editor.isActive("taskList"),
          onClick: () => editor.chain().focus().toggleTaskList().run(),
        },
      ],
    },
    {
      type: "sub",
      label: t("menubar.align"),
      items: [
        {
          type: "action",
          label: t("menubar.alignLeft"),
          icon: AlignLeft,
          active: editor.isActive({ textAlign: "left" }),
          onClick: () => editor.chain().focus().setTextAlign("left").run(),
        },
        {
          type: "action",
          label: t("menubar.alignCenter"),
          icon: AlignCenter,
          active: editor.isActive({ textAlign: "center" }),
          onClick: () => editor.chain().focus().setTextAlign("center").run(),
        },
        {
          type: "action",
          label: t("menubar.alignRight"),
          icon: AlignRight,
          active: editor.isActive({ textAlign: "right" }),
          onClick: () => editor.chain().focus().setTextAlign("right").run(),
        },
        {
          type: "action",
          label: t("menubar.alignJustify"),
          icon: AlignJustify,
          active: editor.isActive({ textAlign: "justify" }),
          onClick: () => editor.chain().focus().setTextAlign("justify").run(),
        },
      ],
    },
    { type: "separator" },
    {
      type: "action",
      label: t("menubar.clearFormatting"),
      onClick: () => editor.chain().focus().unsetAllMarks().clearNodes().run(),
    },
  ];
}

function buildToolsMenuItems(
  t: (k: string) => string,
  { onSourceCode, openSourceDialog }: { onSourceCode?: () => void; openSourceDialog: () => void },
): MenuItemDef[] {
  return [
    {
      type: "action",
      label: t("menubar.sourceCode"),
      icon: FileCode,
      onClick: () => (onSourceCode ? onSourceCode() : openSourceDialog()),
    },
  ];
}

function buildTableMenuItems(t: (k: string) => string, editor: Editor, onInsertTable: (rows: number, cols: number) => void): MenuItemDef[] {
  const inTable = getTableAnchorPos(editor) !== null;

  return [
    {
      type: "sub",
      label: t("menubar.insertTable"),
      icon: TableIcon,
      items: [
        {
          type: "custom",
          key: "table-insert-grid",
          render: () => (
            <MenuTableInsertGrid
              insertLabel={t("tableMenu.insertTable")}
              previewTemplate={t("tableMenu.gridPreview")}
              onInsert={onInsertTable}
            />
          ),
        },
      ],
    },
    {
      type: "action",
      label: t("menubar.tableProperties"),
      disabled: true,
      onClick: () => {},
    },
    {
      type: "action",
      label: t("menubar.deleteTable"),
      icon: Trash2,
      destructive: true,
      disabled: !inTable,
      onClick: () => editor.chain().focus().deleteTable().run(),
    },
    { type: "separator" },
    {
      type: "sub",
      label: t("menubar.row"),
      disabled: !inTable,
      items: [
        {
          type: "action",
          label: t("menubar.addRowBefore"),
          onClick: () => editor.chain().focus().addRowBefore().run(),
        },
        {
          type: "action",
          label: t("menubar.addRowAfter"),
          onClick: () => editor.chain().focus().addRowAfter().run(),
        },
        { type: "separator" },
        {
          type: "action",
          label: t("menubar.deleteRow"),
          destructive: true,
          onClick: () => editor.chain().focus().deleteRow().run(),
        },
      ],
    },
    {
      type: "sub",
      label: t("menubar.column"),
      disabled: !inTable,
      items: [
        {
          type: "action",
          label: t("menubar.addColumnBefore"),
          onClick: () => editor.chain().focus().addColumnBefore().run(),
        },
        {
          type: "action",
          label: t("menubar.addColumnAfter"),
          onClick: () => editor.chain().focus().addColumnAfter().run(),
        },
        { type: "separator" },
        {
          type: "action",
          label: t("menubar.deleteColumn"),
          destructive: true,
          onClick: () => editor.chain().focus().deleteColumn().run(),
        },
      ],
    },
    {
      type: "sub",
      label: t("menubar.cell"),
      disabled: !inTable,
      items: [
        {
          type: "action",
          label: t("menubar.mergeCells"),
          onClick: () => editor.chain().focus().mergeCells().run(),
          disabled: !editor.can().mergeCells(),
        },
        {
          type: "action",
          label: t("menubar.splitCell"),
          onClick: () => editor.chain().focus().splitCell().run(),
          disabled: !editor.can().splitCell(),
        },
      ],
    },
  ];
}

// ─── MenuBarTrigger ──────────────────────────────────────────────────────────

const MenuBarTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ children, className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      className={cn(
        "px-2 py-0.5 rounded text-sm transition-colors cursor-pointer",
        "hover:bg-accent hover:text-accent-foreground",
        "focus:outline-none focus:bg-accent focus:text-accent-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);
MenuBarTrigger.displayName = "MenuBarTrigger";

// ─── MenuBar ─────────────────────────────────────────────────────────────────

export interface MenuBarProps {
  editor: Editor;
  containerRef: React.RefObject<HTMLElement | null>;
  uploadImage?: (file: File) => Promise<string> | string;
  imageInsertMode?: "base64" | "upload";
  maxImageFileSize?: number;
  allowedImageMimeTypes?: string[];
  onSave?: () => void;
  onExport?: () => void;
  onSourceCode?: () => void;
  onPreview?: () => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  editor,
  containerRef,
  uploadImage,
  imageInsertMode = "base64",
  maxImageFileSize = DEFAULT_UEDITOR_IMAGE_MAX_FILE_SIZE,
  allowedImageMimeTypes = DEFAULT_UEDITOR_IMAGE_MIME_TYPES,
  onSave,
  onExport,
  onSourceCode,
  onPreview,
}) => {
  const t = useSmartTranslations("UEditor");
  useEditorState({
    editor,
    selector: ({ transactionNumber }) => transactionNumber,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showImageInput, setShowImageInput] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [isInsertMenuOpen, setIsInsertMenuOpen] = useState(false);

  // Built-in source code dialog state
  const [showSourceDialog, setShowSourceDialog] = useState(false);
  const [sourceHtml, setSourceHtml] = useState("");

  // Built-in preview dialog state
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);

  const openSourceDialog = () => {
    setSourceHtml(editor.getHTML());
    setShowSourceDialog(true);
  };

  const openPreviewDialog = () => {
    setShowPreviewDialog(true);
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview();
      return;
    }

    openPreviewDialog();
  };

  React.useEffect(() => {
    if (!showPreviewDialog) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showPreviewDialog]);

  const applySourceHtml = () => {
    editor.chain().focus().setContent(sourceHtml).run();
    setShowSourceDialog(false);
  };

  const closeInsertMenu = () => {
    setIsInsertMenuOpen(false);
    setShowImageInput(false);
    setShowLinkInput(false);
  };

  const handleImageUrl = (url: string, alt?: string) => {
    const safe = sanitizeUEditorUrl(url, "image");
    if (safe) {
      editor.chain().focus().setImage({ src: safe, alt: alt ?? "" }).run();
      editor.commands.createParagraphNear();
    }
    closeInsertMenu();
  };

  const handleImageFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > maxImageFileSize) continue;
      if (allowedImageMimeTypes.length > 0 && !allowedImageMimeTypes.includes(file.type)) continue;
      try {
        const src = imageInsertMode === "upload" && uploadImage ? await uploadImage(file) : await fileToDataUrl(file);
        const safe = sanitizeUEditorUrl(src, "image");
        if (!safe) continue;
        editor.chain().focus().setImage({ src: safe, alt: file.name }).run();
        editor.commands.createParagraphNear();
      } catch {}
    }
    setIsInsertMenuOpen(false);
  };

  const handleInsertTable = (rows: number, cols: number) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
    // Close the Insert menu after inserting
    closeInsertMenu();
  };

  const handleLinkSubmit = (url: string) => {
    editor.chain().focus().setLink({ href: url }).run();
    closeInsertMenu();
  };

  const insertMenuItems: MenuItemDef[] = [
    {
      type: "custom",
      key: "image",
      render: () =>
        showImageInput ? (
          <ImageInput onSubmit={handleImageUrl} onCancel={() => setShowImageInput(false)} />
        ) : (
          <>
            <DropdownMenuItem label={t("menubar.image")} icon={ImageIcon} onClick={() => setShowImageInput(true)} closeOnSelect={false} />
            <DropdownMenuItem
              label={t("menubar.imageUpload")}
              icon={Upload}
              onClick={() => fileInputRef.current?.click()}
              closeOnSelect={false}
            />
          </>
        ),
    },
    { type: "separator" },
    {
      type: "custom",
      key: "link",
      render: () =>
        showLinkInput ? (
          <LinkInput onSubmit={handleLinkSubmit} onCancel={() => setShowLinkInput(false)} initialUrl={editor.getAttributes("link").href ?? ""} />
        ) : (
          <DropdownMenuItem
            label={t("menubar.link")}
            icon={LinkIcon}
            shortcut={t("menubar.linkShortcut")}
            onClick={() => setShowLinkInput(true)}
            closeOnSelect={false}
          />
        ),
    },
    { type: "separator" },
    {
      type: "sub",
      label: t("menubar.insertTable"),
      icon: TableIcon,
      items: [
        {
          type: "custom",
          key: "table-grid",
          render: () => (
            <MenuTableInsertGrid
              insertLabel={t("tableMenu.insertTable")}
              previewTemplate={t("tableMenu.gridPreview")}
              onInsert={handleInsertTable}
            />
          ),
        },
      ],
    },
    { type: "separator" },
    {
      type: "action",
      label: t("menubar.horizontalRule"),
      onClick: () => editor.chain().focus().setHorizontalRule().run(),
    },
  ];

  const menus = [
    {
      label: t("menubar.file"),
      items: buildFileMenuItems(t, editor, { onSave, onExport }),
      open: undefined as boolean | undefined,
      onOpenChange: undefined as ((v: boolean) => void) | undefined,
    },
    { label: t("menubar.edit"), items: buildEditMenuItems(t, editor), open: undefined, onOpenChange: undefined },
    {
      label: t("menubar.view"),
      items: buildViewMenuItems(t, { containerRef, onSourceCode, openSourceDialog, onPreview: handlePreview, openPreviewDialog }),
      open: undefined,
      onOpenChange: undefined,
    },
    {
      label: t("menubar.insert"),
      items: insertMenuItems,
      open: isInsertMenuOpen,
      onOpenChange: (open: boolean) => {
        setIsInsertMenuOpen(open);
        if (!open) {
          setShowImageInput(false);
          setShowLinkInput(false);
        }
      },
    },
    { label: t("menubar.format"), items: buildFormatMenuItems(t, editor), open: undefined, onOpenChange: undefined },
    {
      label: t("menubar.tools"),
      items: buildToolsMenuItems(t, { onSourceCode, openSourceDialog }),
      open: undefined,
      onOpenChange: undefined,
    },
    { label: t("menubar.table"), items: buildTableMenuItems(t, editor, handleInsertTable), open: undefined, onOpenChange: undefined },
  ];

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept={allowedImageMimeTypes.join(",")}
        multiple
        className="hidden"
        onChange={(e) => handleImageFiles(e.target.files)}
      />

      <div className="flex items-center gap-0.5 border-b border-border/35 bg-muted/20 px-1.5 py-0.5">
        {menus.map(({ label, items, open, onOpenChange }) => (
          <DropdownMenu
            key={label}
            trigger={<MenuBarTrigger>{label}</MenuBarTrigger>}
            placement="bottom-start"
            isOpen={open}
            onOpenChange={onOpenChange}
          >
            {renderMenuItems(items)}
          </DropdownMenu>
        ))}
        <button
          type="button"
          onClick={handlePreview}
          aria-label={t("menubar.preview")}
          title={t("menubar.preview")}
          className={cn(
            "ml-auto inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors",
            "hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
          )}
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Built-in source code dialog */}
      <Modal
        isOpen={showSourceDialog}
        onClose={() => setShowSourceDialog(false)}
        title={t("menubar.sourceCode")}
        size="lg"
      >
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">{t("menubar.sourceCodeHint")}</p>
          <textarea
            data-testid="source-code-textarea"
            className="w-full h-64 font-mono text-xs p-3 bg-muted rounded-lg border border-border resize-y focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={sourceHtml}
            onChange={(e) => setSourceHtml(e.target.value)}
            spellCheck={false}
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={applySourceHtml}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors"
            >
              {t("menubar.applySource")}
            </button>
            <button
              type="button"
              onClick={() => setShowSourceDialog(false)}
              className="px-4 py-2 bg-muted rounded-lg text-sm hover:bg-accent transition-colors"
            >
              {t("menubar.closeDialog")}
            </button>
          </div>
        </div>
      </Modal>

      {/* Built-in full-screen preview */}
      {showPreviewDialog && (
        <div className="fixed inset-0 z-9999 flex flex-col bg-background text-foreground">
          <div className="flex shrink-0 items-center justify-between border-b border-border bg-card px-4 py-3">
            <h2 className="text-base font-semibold">{t("menubar.preview")}</h2>
            <button
              type="button"
              onClick={() => setShowPreviewDialog(false)}
              aria-label={t("menubar.closeDialog")}
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors",
                "hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
              )}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <div
            data-testid="preview-content"
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 md:px-8"
          >
            {editor.isEmpty ? (
              <p className="text-muted-foreground text-sm">{t("menubar.previewEmpty")}</p>
            ) : (
              <div
                className={UEDITOR_PROSEMIRROR_CLASS_NAME}
                dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};
