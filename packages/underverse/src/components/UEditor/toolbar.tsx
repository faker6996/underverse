"use client";

import React, { useRef, useState } from "react";
import type { Editor } from "@tiptap/core";
import { useSmartTranslations } from "../../hooks/useSmartTranslations";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Bold as BoldIcon,
  ChevronDown,
  Code as CodeIcon,
  FileCode,
  Heading1 as Heading1Icon,
  Heading2 as Heading2Icon,
  Heading3 as Heading3Icon,
  Highlighter,
  Image as ImageIcon,
  Italic as ItalicIcon,
  Link as LinkIcon,
  List as ListIcon,
  ListOrdered as ListOrderedIcon,
  ListTodo,
  Palette,
  Quote as QuoteIcon,
  Redo as RedoIcon,
  RotateCcw,
  Smile,
  Strikethrough as StrikethroughIcon,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Table as TableIcon,
  Trash2,
  Type,
  Underline as UnderlineIcon,
  Undo as UndoIcon,
  Upload,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { DropdownMenu, DropdownMenuItem } from "../DropdownMenu";
import { Tooltip } from "../Tooltip";
import { EditorColorPalette, useEditorColors } from "./colors";
import { applyImageLayout, applyImageWidthPreset, deleteSelectedImage, resetImageSize, type UEditorImageWidthPreset } from "./image-commands";
import { ImageInput } from "./inputs";
import { EmojiPicker } from "./emoji-picker";
import { applyTableAlignment } from "./table-align-utils";
import type {
  UEditorFontFamilyOption,
  UEditorFontSizeOption,
  UEditorLetterSpacingOption,
  UEditorLineHeightOption,
  UEditorVariant,
} from "./types";
import {
  getDefaultFontFamilies,
  getDefaultFontSizes,
  getDefaultLetterSpacings,
  getDefaultLineHeights,
  normalizeStyleValue,
} from "./typography-options";

type UploadImageFn = (file: File) => Promise<string> | string;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}

function formatTableInsertLabel(template: string, rows: number, cols: number) {
  return template.replace("{rows}", String(rows)).replace("{cols}", String(cols));
}

export const ToolbarButton = React.forwardRef<
  HTMLButtonElement,
  {
    onClick: (e: React.MouseEvent) => void;
    onMouseDown?: (e: React.MouseEvent) => void;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title?: string;
    className?: string;
  }
>(({ onClick, onMouseDown, active, disabled, children, title, className }, ref) => {
  const button = (
    <button
      ref={ref}
      type="button"
      aria-label={title}
      onMouseDown={(e) => {
        onMouseDown?.(e);
        e.preventDefault();
      }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
        "hover:bg-accent hover:scale-105",
        "focus:outline-none focus:ring-2 focus:ring-primary/20",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100",
        active ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      {children}
    </button>
  );

  if (title) {
    return (
      <Tooltip content={title} placement="top" delay={{ open: 200, close: 0 }}>
        {button}
      </Tooltip>
    );
  }

  return button;
});
ToolbarButton.displayName = "ToolbarButton";

const ToolbarDivider = () => <div className="w-px h-6 bg-border/50 mx-1" />;

const TableInsertGrid = ({
  insertLabel,
  previewTemplate,
  onInsert,
}: {
  insertLabel: string;
  previewTemplate: string;
  onInsert: (rows: number, cols: number) => void;
}) => {
  const [selection, setSelection] = React.useState({ rows: 3, cols: 3 });
  const maxRows = 8;
  const maxCols = 8;

  return (
    <div className="mb-2 rounded-xl border border-border/60 bg-muted/20 p-2">
      <div className="mb-2 text-sm font-medium text-foreground">
        {formatTableInsertLabel(previewTemplate, selection.rows, selection.cols)}
      </div>
      <div
        className="grid grid-cols-8 gap-1"
        onMouseLeave={() => setSelection((prev) => prev)}
      >
        {Array.from({ length: maxRows }).map((_, rowIndex) =>
          Array.from({ length: maxCols }).map((__, colIndex) => {
            const rows = rowIndex + 1;
            const cols = colIndex + 1;
            const active = rows <= selection.rows && cols <= selection.cols;

            return (
              <button
                key={`${rows}-${cols}`}
                type="button"
                aria-label={formatTableInsertLabel(previewTemplate, rows, cols)}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setSelection({ rows, cols })}
                onFocus={() => setSelection({ rows, cols })}
                onClick={() => onInsert(rows, cols)}
                className={cn(
                  "h-5 w-5 rounded-[4px] border transition-colors",
                  active
                    ? "border-primary bg-primary/20"
                    : "border-border/70 bg-background hover:border-primary/60 hover:bg-primary/10",
                )}
              />
            );
          }),
        )}
      </div>
      <div className="mt-2 text-xs text-muted-foreground">{insertLabel}</div>
    </div>
  );
};

export const EditorToolbar = ({
  editor,
  variant,
  uploadImage,
  imageInsertMode = "base64",
  fontFamilies,
  fontSizes,
  lineHeights,
  letterSpacings,
}: {
  editor: Editor;
  variant: UEditorVariant;
  uploadImage?: UploadImageFn;
  imageInsertMode?: "base64" | "upload";
  fontFamilies?: UEditorFontFamilyOption[];
  fontSizes?: UEditorFontSizeOption[];
  lineHeights?: UEditorLineHeightOption[];
  letterSpacings?: UEditorLetterSpacingOption[];
}) => {
  const t = useSmartTranslations("UEditor");
  const { textColors, highlightColors } = useEditorColors();
  const [showImageInput, setShowImageInput] = useState(false);
  const [isTableMenuOpen, setIsTableMenuOpen] = useState(false);
  const tableCommandAnchorPosRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [fontSizeDraft, setFontSizeDraft] = useState("");
  const isImageSelected = editor.isActive("image");
  const imageAttrs = editor.getAttributes("image") as { imageLayout?: string; imageWidthPreset?: UEditorImageWidthPreset | null };
  const tableAttrs = editor.getAttributes("table") as { tableAlign?: "left" | "center" | "right" | null };
  const textStyleAttrs = editor.getAttributes("textStyle") as {
    fontFamily?: string;
    fontSize?: string;
    lineHeight?: string;
    letterSpacing?: string;
  };
  const imageLayout = imageAttrs.imageLayout === "left" || imageAttrs.imageLayout === "right" ? imageAttrs.imageLayout : "block";
  const imageWidthPreset = imageAttrs.imageWidthPreset === "sm" || imageAttrs.imageWidthPreset === "md" || imageAttrs.imageWidthPreset === "lg"
    ? imageAttrs.imageWidthPreset
    : null;
  const currentTableAlign = tableAttrs.tableAlign === "center" || tableAttrs.tableAlign === "right" ? tableAttrs.tableAlign : "left";
  const isTableSelected = editor.isActive("table");
  const hasTableContext = isTableSelected || tableCommandAnchorPosRef.current !== null;
  const currentFontFamily = normalizeStyleValue(textStyleAttrs.fontFamily);
  const currentFontSize = normalizeStyleValue(textStyleAttrs.fontSize);
  const currentLineHeight = normalizeStyleValue(textStyleAttrs.lineHeight);
  const currentLetterSpacing = normalizeStyleValue(textStyleAttrs.letterSpacing);
  const availableFontFamilies = React.useMemo<UEditorFontFamilyOption[]>(
    () => fontFamilies ?? getDefaultFontFamilies(t),
    [fontFamilies, t],
  );
  const availableFontSizes = React.useMemo<UEditorFontSizeOption[]>(
    () => fontSizes ?? getDefaultFontSizes(),
    [fontSizes],
  );
  const availableLineHeights = React.useMemo<UEditorLineHeightOption[]>(
    () => lineHeights ?? getDefaultLineHeights(),
    [lineHeights],
  );
  const availableLetterSpacings = React.useMemo<UEditorLetterSpacingOption[]>(
    () => letterSpacings ?? getDefaultLetterSpacings(),
    [letterSpacings],
  );
  const currentFontFamilyLabel =
    availableFontFamilies.find((option) => normalizeStyleValue(option.value) === currentFontFamily)?.label ?? t("toolbar.fontDefault");
  const currentFontSizeLabel =
    availableFontSizes.find((option) => normalizeStyleValue(option.value) === currentFontSize)?.label ?? t("toolbar.sizeDefault");
  const currentLineHeightLabel =
    availableLineHeights.find((option) => normalizeStyleValue(option.value) === currentLineHeight)?.label ?? t("toolbar.lineHeightDefault");
  const currentLetterSpacingLabel =
    availableLetterSpacings.find((option) => normalizeStyleValue(option.value) === currentLetterSpacing)?.label ??
    t("toolbar.letterSpacingDefault");

  React.useEffect(() => {
    setFontSizeDraft(currentFontSize.replace(/px$/i, ""));
  }, [currentFontSize]);

  const applyFontSizeDraft = () => {
    const normalized = fontSizeDraft.trim();
    if (!normalized) {
      editor.chain().focus().unsetFontSize().run();
      return;
    }

    const parsed = Number.parseFloat(normalized);
    if (!Number.isFinite(parsed) || parsed <= 0) return;

    const clamped = Math.min(96, Math.max(8, parsed));
    editor.chain().focus().setFontSize(`${clamped}px`).run();
  };

  const insertImageFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploadingImage(true);
    setImageUploadError(null);

    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      try {
        const src = imageInsertMode === "upload" && uploadImage ? await uploadImage(file) : await fileToDataUrl(file);
        if (!src) continue;
        editor.chain().focus().setImage({ src, alt: file.name }).run();
        editor.commands.createParagraphNear();
      } catch {
        setImageUploadError(t("imageInput.uploadError"));
      }
    }

    setIsUploadingImage(false);
  };

  if (variant === "minimal") {
    return (
      <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title={t("toolbar.bold")}>
          <BoldIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title={t("toolbar.italic")}>
          <ItalicIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title={t("toolbar.bulletList")}
        >
          <ListIcon className="w-4 h-4" />
        </ToolbarButton>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-linear-to-r from-muted/30 to-transparent">
      <DropdownMenu
        contentClassName="p-2"
        trigger={
          <ToolbarButton onClick={() => { }} title={t("toolbar.textStyle")} className="px-2 w-auto gap-1">
            <Type className="w-4 h-4" />
            <ChevronDown className="w-3 h-3" />
          </ToolbarButton>
        }
      >
        <DropdownMenuItem
          icon={Type}
          label={t("toolbar.normal")}
          onClick={() => editor.chain().focus().setParagraph().run()}
          active={editor.isActive("paragraph")}
        />
        <DropdownMenuItem
          icon={Heading1Icon}
          label={t("toolbar.heading1")}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          shortcut="Ctrl+Alt+1"
        />
        <DropdownMenuItem
          icon={Heading2Icon}
          label={t("toolbar.heading2")}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          shortcut="Ctrl+Alt+2"
        />
        <DropdownMenuItem
          icon={Heading3Icon}
          label={t("toolbar.heading3")}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          shortcut="Ctrl+Alt+3"
        />
      </DropdownMenu>

      <DropdownMenu
        trigger={
          <ToolbarButton
            onClick={() => { }}
            title={t("toolbar.fontFamily")}
            className="relative"
          >
            <Type className="w-4 h-4" />
          </ToolbarButton>
        }
        contentClassName="max-h-80 overflow-y-auto min-w-56 p-2"
      >
        <DropdownMenuItem
          icon={Type}
          label={t("toolbar.fontDefault")}
          onClick={() => editor.chain().focus().unsetFontFamily().run()}
          active={!currentFontFamily}
        />
        {availableFontFamilies.map((option) => (
          <DropdownMenuItem
            key={option.value}
            label={option.label}
            onClick={() => editor.chain().focus().setFontFamily(option.value).run()}
            active={normalizeStyleValue(option.value) === currentFontFamily}
            className="font-medium"
          />
        ))}
      </DropdownMenu>

      <DropdownMenu
        closeOnSelect={false}
        trigger={
          <ToolbarButton
            onClick={() => { }}
            title={t("toolbar.fontSize")}
            className="px-2 w-auto min-w-9"
          >
            <span className="text-[10px] font-semibold leading-none">{currentFontSize.replace(/px$/i, "") || "T"}</span>
          </ToolbarButton>
        }
        contentClassName="max-h-80 overflow-y-auto min-w-44 p-2"
      >
        <div className="mb-2 rounded-lg border border-border/60 bg-muted/30 p-2">
          <label className="flex items-center gap-2">
            <input
              type="number"
              min={8}
              max={96}
              step={1}
              value={fontSizeDraft}
              onChange={(e) => setFontSizeDraft(e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyFontSizeDraft();
                }
              }}
              aria-label={t("toolbar.fontSize")}
              className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
            <span className="text-xs text-muted-foreground">px</span>
          </label>
        </div>
        <DropdownMenuItem
          icon={Type}
          label={t("toolbar.sizeDefault")}
          onClick={() => editor.chain().focus().unsetFontSize().run()}
          active={!currentFontSize}
        />
        {availableFontSizes.map((option) => (
          <DropdownMenuItem
            key={option.value}
            label={option.label}
            onClick={() => editor.chain().focus().setFontSize(option.value).run()}
            active={normalizeStyleValue(option.value) === currentFontSize}
          />
        ))}
      </DropdownMenu>

      <DropdownMenu
        trigger={
          <ToolbarButton
            onClick={() => { }}
            title={t("toolbar.lineHeight")}
            className="gap-0.5"
          >
            <ArrowUp className="w-3 h-3" />
            <ArrowDown className="w-3 h-3" />
          </ToolbarButton>
        }
        contentClassName="max-h-72 overflow-y-auto p-2"
      >
        <DropdownMenuItem
          icon={Type}
          label={t("toolbar.lineHeightDefault")}
          onClick={() => editor.chain().focus().unsetLineHeight().run()}
          active={!currentLineHeight}
        />
        {availableLineHeights.map((option) => (
          <DropdownMenuItem
            key={option.value}
            label={option.label}
            onClick={() => editor.chain().focus().setLineHeight(option.value).run()}
            active={normalizeStyleValue(option.value) === currentLineHeight}
          />
        ))}
      </DropdownMenu>

      <DropdownMenu
        trigger={
          <ToolbarButton
            onClick={() => { }}
            title={t("toolbar.letterSpacing")}
            className="gap-0.5"
          >
            <ArrowLeft className="w-3 h-3" />
            <ArrowRight className="w-3 h-3" />
          </ToolbarButton>
        }
        contentClassName="max-h-72 overflow-y-auto p-2"
      >
        <DropdownMenuItem
          icon={Type}
          label={t("toolbar.letterSpacingDefault")}
          onClick={() => editor.chain().focus().unsetLetterSpacing().run()}
          active={!currentLetterSpacing}
        />
        {availableLetterSpacings.map((option) => (
          <DropdownMenuItem
            key={option.value}
            label={option.label}
            onClick={() => editor.chain().focus().setLetterSpacing(option.value).run()}
            active={normalizeStyleValue(option.value) === currentLetterSpacing}
          />
        ))}
      </DropdownMenu>

      <ToolbarDivider />

      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title={t("toolbar.bold")}>
        <BoldIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title={t("toolbar.italic")}>
        <ItalicIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        title={t("toolbar.underline")}
      >
        <UnderlineIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title={t("toolbar.strike")}>
        <StrikethroughIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title={t("toolbar.code")}>
        <CodeIcon className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      <DropdownMenu
        trigger={
          <ToolbarButton onClick={() => { }} title={t("colors.textColor")}>
            <Palette className="w-4 h-4" />
            <ChevronDown className="w-3 h-3" />
          </ToolbarButton>
        }
      >
        <EditorColorPalette
          colors={textColors}
          currentColor={editor.getAttributes("textStyle").color || "inherit"}
          onSelect={(color) => {
            if (color === "inherit") {
              editor.chain().focus().unsetColor().run();
            } else {
              editor.chain().focus().setColor(color).run();
            }
          }}
          label={t("colors.textColor")}
        />
      </DropdownMenu>

      <DropdownMenu
        trigger={
          <ToolbarButton onClick={() => { }} active={editor.isActive("highlight")} title={t("colors.highlight")}>
            <Highlighter className="w-4 h-4" />
            <ChevronDown className="w-3 h-3" />
          </ToolbarButton>
        }
      >
        <EditorColorPalette
          colors={highlightColors}
          currentColor={editor.getAttributes("highlight").color || ""}
          onSelect={(color) => {
            if (color === "") {
              editor.chain().focus().unsetHighlight().run();
            } else {
              editor.chain().focus().toggleHighlight({ color }).run();
            }
          }}
          label={t("colors.highlight")}
        />
      </DropdownMenu>

      <ToolbarDivider />

      <DropdownMenu
        trigger={
          <ToolbarButton onClick={() => { }} title={t("toolbar.emoji")}>
            <Smile className="w-4 h-4" />
          </ToolbarButton>
        }
      >
        <EmojiPicker
          onSelect={(emoji) => {
            editor.chain().focus().insertContent(emoji).run();
          }}
        />
      </DropdownMenu>

      <ToolbarDivider />

      <DropdownMenu
        trigger={
          <ToolbarButton onClick={() => { }} title={t("toolbar.alignment")}>
            <AlignLeft className="w-4 h-4" />
            <ChevronDown className="w-3 h-3" />
          </ToolbarButton>
        }
      >
        <DropdownMenuItem
          icon={AlignLeft}
          label={t("toolbar.alignLeft")}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
        />
        <DropdownMenuItem
          icon={AlignCenter}
          label={t("toolbar.alignCenter")}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
        />
        <DropdownMenuItem
          icon={AlignRight}
          label={t("toolbar.alignRight")}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
        />
        <DropdownMenuItem
          icon={AlignJustify}
          label={t("toolbar.justify")}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          active={editor.isActive({ textAlign: "justify" })}
        />
      </DropdownMenu>

      <ToolbarDivider />

      <DropdownMenu
        trigger={
          <ToolbarButton onClick={() => { }} title={t("toolbar.bulletList")}>
            <ListIcon className="w-4 h-4" />
            <ChevronDown className="w-3 h-3" />
          </ToolbarButton>
        }
      >
        <DropdownMenuItem
          icon={ListIcon}
          label={t("toolbar.bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          shortcut="Ctrl+Shift+8"
        />
        <DropdownMenuItem
          icon={ListOrderedIcon}
          label={t("toolbar.orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          shortcut="Ctrl+Shift+7"
        />
        <DropdownMenuItem
          icon={ListTodo}
          label={t("toolbar.taskList")}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          active={editor.isActive("taskList")}
          shortcut="Ctrl+Shift+9"
        />
      </DropdownMenu>

      <DropdownMenu
        trigger={
          <ToolbarButton onClick={() => { }} title={t("toolbar.quote")}>
            <QuoteIcon className="w-4 h-4" />
            <ChevronDown className="w-3 h-3" />
          </ToolbarButton>
        }
      >
        <DropdownMenuItem
          icon={QuoteIcon}
          label={t("toolbar.quote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          shortcut="Ctrl+Shift+B"
        />
        <DropdownMenuItem
          icon={FileCode}
          label={t("toolbar.codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          shortcut="Ctrl+Alt+C"
        />
      </DropdownMenu>

      <DropdownMenu
        trigger={
          <ToolbarButton onClick={() => { }} title={t("toolbar.image")}>
            <ImageIcon className="w-4 h-4" />
            <ChevronDown className="w-3 h-3" />
          </ToolbarButton>
        }
      >
        {showImageInput ? (
          <ImageInput
            onSubmit={(url, alt) => {
              editor.chain().focus().setImage({ src: url, alt }).run();
              setShowImageInput(false);
            }}
            onCancel={() => setShowImageInput(false)}
          />
        ) : (
          <>
            <DropdownMenuItem icon={LinkIcon} label={t("imageInput.addFromUrl")} onClick={() => setShowImageInput(true)} />
            <DropdownMenuItem
              icon={Upload}
              label={isUploadingImage ? t("imageInput.uploading") : t("imageInput.uploadTab")}
              disabled={isUploadingImage}
              onClick={() => fileInputRef.current?.click()}
            />
            {imageUploadError && <DropdownMenuItem label={imageUploadError} disabled destructive />}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                e.target.value = "";
                void insertImageFiles(files);
              }}
            />
            <div className="my-1 border-t" />
            <DropdownMenuItem
              icon={AlignCenter}
              label={t("toolbar.imageLayoutBlock")}
              onClick={() => applyImageLayout(editor, "block")}
              active={isImageSelected && imageLayout === "block"}
              disabled={!isImageSelected}
            />
            <DropdownMenuItem
              icon={AlignLeft}
              label={t("toolbar.imageLayoutLeft")}
              onClick={() => applyImageLayout(editor, "left")}
              active={isImageSelected && imageLayout === "left"}
              disabled={!isImageSelected}
            />
            <DropdownMenuItem
              icon={AlignRight}
              label={t("toolbar.imageLayoutRight")}
              onClick={() => applyImageLayout(editor, "right")}
              active={isImageSelected && imageLayout === "right"}
              disabled={!isImageSelected}
            />
            <div className="my-1 border-t" />
            <DropdownMenuItem
              label={t("toolbar.imageWidthSm")}
              onClick={() => applyImageWidthPreset(editor, "sm")}
              active={isImageSelected && imageWidthPreset === "sm"}
              disabled={!isImageSelected}
            />
            <DropdownMenuItem
              label={t("toolbar.imageWidthMd")}
              onClick={() => applyImageWidthPreset(editor, "md")}
              active={isImageSelected && imageWidthPreset === "md"}
              disabled={!isImageSelected}
            />
            <DropdownMenuItem
              label={t("toolbar.imageWidthLg")}
              onClick={() => applyImageWidthPreset(editor, "lg")}
              active={isImageSelected && imageWidthPreset === "lg"}
              disabled={!isImageSelected}
            />
            <div className="my-1 border-t" />
            <DropdownMenuItem
              icon={RotateCcw}
              label={t("toolbar.imageResetSize")}
              onClick={() => resetImageSize(editor)}
              disabled={!isImageSelected}
            />
            <DropdownMenuItem
              icon={Trash2}
              label={t("toolbar.imageDelete")}
              onClick={() => deleteSelectedImage(editor)}
              disabled={!isImageSelected}
              destructive
            />
          </>
        )}
      </DropdownMenu>

      <DropdownMenu
        isOpen={isTableMenuOpen}
        onOpenChange={(open) => {
          setIsTableMenuOpen(open);
          tableCommandAnchorPosRef.current = open && editor.isActive("table") ? editor.state.selection.$from.pos : null;
        }}
        trigger={
          <ToolbarButton onClick={() => { }} title={t("toolbar.table")}>
            <TableIcon className="w-4 h-4" />
            <ChevronDown className="w-3 h-3" />
          </ToolbarButton>
        }
        contentClassName="p-2 min-w-56"
      >
        <TableInsertGrid
          insertLabel={t("tableMenu.insertTable")}
          previewTemplate={t("tableMenu.gridPreview")}
          onInsert={(rows, cols) => {
            editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
            setIsTableMenuOpen(false);
          }}
        />
        <div className="my-1 border-t" />
        <DropdownMenuItem
          icon={AlignLeft}
          label={t("tableMenu.alignLeft")}
          onClick={() => applyTableAlignment(editor, "left", tableCommandAnchorPosRef.current ?? undefined)}
          active={hasTableContext && currentTableAlign === "left"}
          disabled={!hasTableContext}
        />
        <DropdownMenuItem
          icon={AlignCenter}
          label={t("tableMenu.alignCenter")}
          onClick={() => applyTableAlignment(editor, "center", tableCommandAnchorPosRef.current ?? undefined)}
          active={hasTableContext && currentTableAlign === "center"}
          disabled={!hasTableContext}
        />
        <DropdownMenuItem
          icon={AlignRight}
          label={t("tableMenu.alignRight")}
          onClick={() => applyTableAlignment(editor, "right", tableCommandAnchorPosRef.current ?? undefined)}
          active={hasTableContext && currentTableAlign === "right"}
          disabled={!hasTableContext}
        />
        <div className="my-1 border-t" />
        <DropdownMenuItem
          icon={ArrowLeft}
          label={t("tableMenu.addColumnBefore")}
          onClick={() => editor.chain().focus().addColumnBefore().run()}
          disabled={!hasTableContext || !editor.can().addColumnBefore()}
        />
        <DropdownMenuItem
          icon={ArrowDown}
          label={t("tableMenu.addColumnAfter")}
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          disabled={!hasTableContext || !editor.can().addColumnAfter()}
        />
        <DropdownMenuItem
          icon={ArrowUp}
          label={t("tableMenu.addRowBefore")}
          onClick={() => editor.chain().focus().addRowBefore().run()}
          disabled={!hasTableContext || !editor.can().addRowBefore()}
        />
        <DropdownMenuItem
          icon={ArrowRight}
          label={t("tableMenu.addRowAfter")}
          onClick={() => editor.chain().focus().addRowAfter().run()}
          disabled={!hasTableContext || !editor.can().addRowAfter()}
        />
        <div className="my-1 border-t" />
        <DropdownMenuItem
          icon={TableIcon}
          label={t("tableMenu.toggleHeaderRow")}
          onClick={() => editor.chain().focus().toggleHeaderRow().run()}
          disabled={!hasTableContext || !editor.can().toggleHeaderRow()}
        />
        <DropdownMenuItem
          icon={TableIcon}
          label={t("tableMenu.toggleHeaderColumn")}
          onClick={() => editor.chain().focus().toggleHeaderColumn().run()}
          disabled={!hasTableContext || !editor.can().toggleHeaderColumn()}
        />
        <div className="my-1 border-t" />
        <DropdownMenuItem
          icon={Trash2}
          label={t("tableMenu.deleteColumn")}
          onClick={() => editor.chain().focus().deleteColumn().run()}
          disabled={!hasTableContext || !editor.can().deleteColumn()}
        />
        <DropdownMenuItem
          icon={Trash2}
          label={t("tableMenu.deleteRow")}
          onClick={() => editor.chain().focus().deleteRow().run()}
          disabled={!hasTableContext || !editor.can().deleteRow()}
        />
        <DropdownMenuItem
          icon={Trash2}
          label={t("tableMenu.deleteTable")}
          onClick={() => editor.chain().focus().deleteTable().run()}
          disabled={!hasTableContext || !editor.can().deleteTable()}
        />
      </DropdownMenu>

      <ToolbarDivider />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        active={editor.isActive("subscript")}
        title={t("toolbar.subscript")}
      >
        <SubscriptIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        active={editor.isActive("superscript")}
        title={t("toolbar.superscript")}
      >
        <SuperscriptIcon className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title={t("toolbar.undo")}>
        <UndoIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title={t("toolbar.redo")}>
        <RedoIcon className="w-4 h-4" />
      </ToolbarButton>
    </div>
  );
};
