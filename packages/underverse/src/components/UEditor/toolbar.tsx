"use client";

import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
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
  CircleCheckBig,
  FileCode,
  Heading1 as Heading1Icon,
  Heading2 as Heading2Icon,
  Heading3 as Heading3Icon,
  IndentDecrease,
  IndentIncrease,
  Link as LinkIcon,
  List as ListIcon,
  ListOrdered as ListOrderedIcon,
  ListTodo,
  Quote as QuoteIcon,
  RotateCcw,
  SquareCheckBig,
  TableCellsMerge,
  Trash2,
  Type,
  Upload,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
} from "lucide-react";
import { setCellAttr } from "@tiptap/pm/tables";
import { cn } from "../../utils/cn";
import { DropdownMenu, DropdownMenuItem } from "../DropdownMenu";
import { Tooltip } from "../Tooltip";
import { EditorColorPalette, HighlightColorIcon, TextColorIcon, useEditorColors } from "./colors";
import { DEFAULT_UEDITOR_IMAGE_MAX_FILE_SIZE, DEFAULT_UEDITOR_IMAGE_MIME_TYPES } from "./clipboard-images";
import { applyImageLayout, applyImageWidthPreset, deleteSelectedImage, resetImageSize, type UEditorImageWidthPreset } from "./image-commands";
import { ImageInput, LinkInput } from "./inputs";
import { applyEditorLink } from "./link-commands";
import { sanitizeUEditorUrl } from "./url-safety";
import { findTableNodeInfoFromState } from "./table-align-utils";
import { resolveEventElement } from "./table-dom-utils";
import { mergeTableCellsPreservingColumnWidths } from "./table-cell-commands";
import {
  FigmaAlignLeftIcon,
  FigmaBoldIcon,
  FigmaChevronDownIcon,
  FigmaCodeIcon,
  FigmaImageIcon,
  FigmaItalicIcon,
  FigmaLetterSpacingIcon,
  FigmaLineHeightIcon,
  FigmaLinkIcon,
  FigmaListIcon,
  FigmaQuoteIcon,
  FigmaRedoIcon,
  FigmaStrikeIcon,
  FigmaSubscriptIcon,
  FigmaSuperscriptIcon,
  FigmaTableIcon,
  FigmaTextStyleIcon,
  FigmaUnderlineIcon,
  FigmaUndoIcon,
} from "./figma-toolbar-icons";
import type { UEditorFontFamilyOption, UEditorFontSizeOption, UEditorLetterSpacingOption, UEditorLineHeightOption, UEditorVariant } from "./types";
import {
  getDefaultFontFamilies,
  getDefaultFontSizes,
  getDefaultLetterSpacings,
  getDefaultLineHeights,
  normalizeStyleValue,
} from "./typography-options";

type UploadImageFn = (file: File) => Promise<string> | string;

export function getTableAnchorPos(editor: Editor) {
  const tableInfo = findTableNodeInfoFromState(editor.state);
  if (tableInfo) return editor.state.selection.from;

  const selectionAnchor = resolveEventElement(window.getSelection()?.anchorNode ?? null);
  const selectionCell = selectionAnchor?.closest?.("th,td");
  if (selectionCell instanceof HTMLTableCellElement && editor.view.dom.contains(selectionCell)) {
    return editor.view.posAtDOM(selectionCell, 0) + 1;
  }

  const activeElement = document.activeElement instanceof Element ? document.activeElement : null;
  const activeCell = activeElement?.closest?.("th,td");
  if (activeCell instanceof HTMLTableCellElement && editor.view.dom.contains(activeCell)) {
    return editor.view.posAtDOM(activeCell, 0) + 1;
  }

  const tables = editor.view.dom.querySelectorAll("table");
  if (tables.length !== 1) return null;

  const firstCell = tables[0]?.querySelector("th,td");
  return firstCell instanceof HTMLTableCellElement ? editor.view.posAtDOM(firstCell, 0) + 1 : null;
}

const EDITOR_UI_ACTIVE_MARKS = [
  "blockquote",
  "bold",
  "bulletList",
  "code",
  "codeBlock",
  "formCheckbox",
  "highlight",
  "image",
  "italic",
  "link",
  "orderedList",
  "paragraph",
  "strike",
  "subscript",
  "superscript",
  "taskList",
  "underline",
] as const;

/**
 * Returns only the editor state that can change toolbar, menu bar or bubble-menu UI.
 * TipTap compares this snapshot deeply, so plain typing no longer forces those large
 * React trees to render when their visible state did not change.
 */
export function getEditorUiRenderState(editor: Editor) {
  const textStyle = editor.getAttributes("textStyle");
  const highlight = editor.getAttributes("highlight");
  const image = editor.getAttributes("image");
  const link = editor.getAttributes("link");
  const tableCell = editor.getAttributes("tableCell");
  const tableHeader = editor.getAttributes("tableHeader");
  const hasTableContext = findTableNodeInfoFromState(editor.state) !== null;
  const can = editor.can();

  return {
    active: EDITOR_UI_ACTIVE_MARKS.map((name) => editor.isActive(name)),
    alignment: ["left", "center", "right", "justify"].map((textAlign) => editor.isActive({ textAlign })),
    heading: [1, 2, 3].map((level) => editor.isActive("heading", { level })),
    textStyle: {
      color: textStyle.color ?? null,
      fontFamily: textStyle.fontFamily ?? null,
      fontSize: textStyle.fontSize ?? null,
      letterSpacing: textStyle.letterSpacing ?? null,
      lineHeight: textStyle.lineHeight ?? null,
    },
    highlightColor: highlight.color ?? null,
    image: {
      imageLayout: image.imageLayout ?? null,
      imageWidthPreset: image.imageWidthPreset ?? null,
    },
    linkHref: link.href ?? null,
    tableCell: {
      backgroundColor: tableCell.backgroundColor ?? tableHeader.backgroundColor ?? null,
      borderColor: tableCell.borderColor ?? tableHeader.borderColor ?? null,
      borderStyle: tableCell.borderStyle ?? tableHeader.borderStyle ?? null,
      borderWidth: tableCell.borderWidth ?? tableHeader.borderWidth ?? null,
      formula: tableCell.formula ?? tableHeader.formula ?? null,
      numberFormat: tableCell.numberFormat ?? tableHeader.numberFormat ?? null,
      textDirection: tableCell.textDirection ?? tableHeader.textDirection ?? null,
      verticalAlign: tableCell.verticalAlign ?? tableHeader.verticalAlign ?? null,
    },
    can: {
      addColumnAfter: hasTableContext && can.addColumnAfter(),
      addColumnBefore: hasTableContext && can.addColumnBefore(),
      addRowAfter: hasTableContext && can.addRowAfter(),
      addRowBefore: hasTableContext && can.addRowBefore(),
      decreaseIndent: can.decreaseIndent(),
      increaseIndent: can.increaseIndent(),
      mergeCells: hasTableContext && can.mergeCells(),
      redo: can.redo(),
      splitCell: hasTableContext && can.splitCell(),
      undo: can.undo(),
    },
    hasTableContext,
    isEmpty: editor.isEmpty,
  };
}

export function fileToDataUrl(file: File): Promise<string> {
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
        "flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors duration-150",
        "gap-0.5 [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:shrink-0",
        "hover:bg-accent",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        active ? "bg-primary/10 text-primary shadow-sm" : "text-[#7B8184] hover:text-foreground dark:text-muted-foreground",
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

const ToolbarDivider = () => <div aria-hidden="true" className="mx-1.5 h-7 w-px shrink-0 bg-[rgba(123,129,132,0.24)]" />;

export const TableInsertGrid = ({
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
      <div className="mb-2 text-sm font-medium text-foreground">{formatTableInsertLabel(previewTemplate, selection.rows, selection.cols)}</div>
      <div className="grid grid-cols-8 gap-1">
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
                  "h-5 w-5 rounded-sm border transition-colors",
                  active ? "border-primary bg-primary/20" : "border-border/70 bg-background hover:border-primary/60 hover:bg-primary/10",
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

function applyTableCellAttribute(editor: Editor, name: string, value: string | null) {
  const { state, view } = editor;
  const applied = setCellAttr(name, value)(state, view.dispatch.bind(view));

  if (applied) {
    view.focus();
    return;
  }

  editor.chain().focus().setCellAttribute(name, value).run();
}

export const EditorToolbar = ({
  editor,
  variant,
  uploadImage,
  imageInsertMode = "base64",
  maxImageFileSize = DEFAULT_UEDITOR_IMAGE_MAX_FILE_SIZE,
  allowedImageMimeTypes = DEFAULT_UEDITOR_IMAGE_MIME_TYPES,
  fontFamilies,
  fontSizes,
  lineHeights,
  letterSpacings,
}: {
  editor: Editor;
  variant: UEditorVariant;
  uploadImage?: UploadImageFn;
  imageInsertMode?: "base64" | "upload";
  maxImageFileSize?: number;
  allowedImageMimeTypes?: string[];
  fontFamilies?: UEditorFontFamilyOption[];
  fontSizes?: UEditorFontSizeOption[];
  lineHeights?: UEditorLineHeightOption[];
  letterSpacings?: UEditorLetterSpacingOption[];
}) => {
  const t = useSmartTranslations("UEditor");
  const editorUiState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => getEditorUiRenderState(currentEditor),
  });
  const { textColors, highlightColors } = useEditorColors();
  const [showImageInput, setShowImageInput] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [isTableMenuOpen, setIsTableMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  const isImageSelected = editor.isActive("image");
  const imageAttrs = editor.getAttributes("image") as { imageLayout?: string; imageWidthPreset?: UEditorImageWidthPreset | null };
  const tableAnchorPos = getTableAnchorPos(editor);
  const tableInfo = tableAnchorPos == null ? null : findTableNodeInfoFromState(editor.state, tableAnchorPos);
  const textStyleAttrs = editor.getAttributes("textStyle") as {
    fontFamily?: string;
    fontSize?: string;
    color?: string;
    lineHeight?: string;
    letterSpacing?: string;
  };
  const imageLayout = imageAttrs.imageLayout === "left" || imageAttrs.imageLayout === "right" ? imageAttrs.imageLayout : "block";
  const imageWidthPreset =
    imageAttrs.imageWidthPreset === "sm" || imageAttrs.imageWidthPreset === "md" || imageAttrs.imageWidthPreset === "lg"
      ? imageAttrs.imageWidthPreset
      : null;
  const isTableSelected = tableInfo !== null;
  const hasTableContext = isTableSelected;
  const canMergeCells = hasTableContext && editor.can().mergeCells();
  const canSplitCell = hasTableContext && editor.can().splitCell();
  const currentCellVerticalAlign =
    normalizeStyleValue(editor.getAttributes("tableCell").verticalAlign || editor.getAttributes("tableHeader").verticalAlign) || "";
  const currentCellTextDirection =
    normalizeStyleValue(editor.getAttributes("tableCell").textDirection || editor.getAttributes("tableHeader").textDirection) || "horizontal";
  const currentFontFamily = normalizeStyleValue(textStyleAttrs.fontFamily);
  const currentFontSize = normalizeStyleValue(textStyleAttrs.fontSize);
  const currentTextColor = normalizeStyleValue(textStyleAttrs.color) || "inherit";
  const currentHighlightColor = normalizeStyleValue(editor.getAttributes("highlight").color) || "";
  const currentLineHeight = normalizeStyleValue(textStyleAttrs.lineHeight);
  const currentLetterSpacing = normalizeStyleValue(textStyleAttrs.letterSpacing);
  const availableFontFamilies = React.useMemo<UEditorFontFamilyOption[]>(() => fontFamilies ?? getDefaultFontFamilies(t), [fontFamilies, t]);
  const availableFontSizes = React.useMemo<UEditorFontSizeOption[]>(() => fontSizes ?? getDefaultFontSizes(), [fontSizes]);
  const availableLineHeights = React.useMemo<UEditorLineHeightOption[]>(() => lineHeights ?? getDefaultLineHeights(), [lineHeights]);
  const availableLetterSpacings = React.useMemo<UEditorLetterSpacingOption[]>(() => letterSpacings ?? getDefaultLetterSpacings(), [letterSpacings]);
  const currentFontFamilyDisplayValue = currentFontFamily.split(",")[0]?.trim() ?? currentFontFamily;
  const currentFontFamilyLabel =
    availableFontFamilies.find((option) => normalizeStyleValue(option.value) === currentFontFamily)?.label ??
    (currentFontFamilyDisplayValue || t("toolbar.fontDefault"));
  const currentFontSizeLabel =
    availableFontSizes.find((option) => normalizeStyleValue(option.value) === currentFontSize)?.label ?? "13";
  const currentLineHeightLabel =
    availableLineHeights.find((option) => normalizeStyleValue(option.value) === currentLineHeight)?.label ?? t("toolbar.lineHeightDefault");
  const currentLetterSpacingLabel =
    availableLetterSpacings.find((option) => normalizeStyleValue(option.value) === currentLetterSpacing)?.label ?? t("toolbar.letterSpacingDefault");
  const defaultFontFamily = availableFontFamilies[0];
  const defaultFontFamilyValue = defaultFontFamily?.value ?? "";
  const displayedFontFamilyLabel = currentFontFamily ? currentFontFamilyLabel : (defaultFontFamily?.label ?? t("toolbar.fontDefault"));
  const displayedFontFamilyValue = currentFontFamily || defaultFontFamilyValue;
  const displayedFontSizeLabel = currentFontSize ? currentFontSizeLabel : "13";
  const activeFontSize = currentFontSize || "13px";
  const isMedium = variant === "medium";
  const isMediumFull = variant === "medium-full";
  const isFull = variant === "default" || variant === "full" || variant === "notion" || !variant;

  const insertImageFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploadingImage(true);
    setImageUploadError(null);

    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > maxImageFileSize) continue;
      if (allowedImageMimeTypes.length > 0 && !allowedImageMimeTypes.includes(file.type)) continue;
      try {
        const src = imageInsertMode === "upload" && uploadImage ? await uploadImage(file) : await fileToDataUrl(file);
        const safeSrc = sanitizeUEditorUrl(src, "image");
        if (!safeSrc) continue;
        editor.chain().focus().setImage({ src: safeSrc, alt: file.name }).run();
        editor.commands.createParagraphNear();
      } catch {
        setImageUploadError(t("imageInput.uploadError"));
      }
    }

    setIsUploadingImage(false);
  };

  if (variant === "minimal") {
    return (
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border/35 bg-muted/30 p-1.5">
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title={t("toolbar.undo")}>
          <FigmaUndoIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title={t("toolbar.redo")}>
          <FigmaRedoIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title={t("toolbar.bold")}>
          <FigmaBoldIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title={t("toolbar.italic")}>
          <FigmaItalicIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title={t("toolbar.bulletList")}
        >
          <FigmaListIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().decreaseIndent().run()}
          disabled={!editorUiState.can.decreaseIndent}
          title={t("toolbar.decreaseIndent")}
        >
          <IndentDecrease className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().increaseIndent().run()}
          disabled={!editorUiState.can.increaseIndent}
          title={t("toolbar.increaseIndent")}
        >
          <IndentIncrease className="h-4 w-4" />
        </ToolbarButton>
        <DropdownMenu
          trigger={
            <ToolbarButton onClick={() => {}} active={editor.isActive("formCheckbox")} title={t("slashCommand.formCheckbox")}>
              <SquareCheckBig className="w-4 h-4" />
            </ToolbarButton>
          }
        >
          <DropdownMenuItem
            icon={SquareCheckBig}
            label={t("slashCommand.formCheckbox")}
            onClick={() => editor.chain().focus().setFormCheckbox().run()}
          />
          <DropdownMenuItem
            icon={CircleCheckBig}
            label={t("slashCommand.roundCheckbox")}
            onClick={() => editor.chain().focus().setFormCheckbox({ variant: "circle" }).run()}
          />
        </DropdownMenu>
        <DropdownMenu
          contentClassName="min-w-72"
          trigger={
            <ToolbarButton onClick={() => setShowLinkInput(!editor.isActive("link"))} active={editor.isActive("link")} title={t("toolbar.link")}>
              <FigmaLinkIcon className="h-4 w-4" />
            </ToolbarButton>
          }
        >
          {showLinkInput ? (
            <LinkInput
              initialUrl={String(editor.getAttributes("link").href ?? "")}
              onSubmit={(url) => {
                applyEditorLink(editor, url);
                setShowLinkInput(false);
              }}
              onCancel={() => setShowLinkInput(false)}
            />
          ) : (
            <>
              <DropdownMenuItem
                icon={LinkIcon}
                label={t("toolbar.link")}
                onClick={() => setShowLinkInput(true)}
                active={editor.isActive("link")}
                closeOnSelect={false}
              />
              <DropdownMenuItem
                icon={Trash2}
                label={t("toolbar.removeLink")}
                onClick={() => editor.chain().focus().extendMarkRange("link").unsetLink().run()}
                disabled={!editor.isActive("link")}
                destructive
              />
            </>
          )}
        </DropdownMenu>
      </div>
    );
  }

  const VerticalAlignActiveIcon =
    currentCellVerticalAlign === "middle"
      ? AlignCenterVertical
      : currentCellVerticalAlign === "bottom"
      ? AlignEndVertical
      : AlignStartVertical;

  return (
    <div
      role="toolbar"
      className="flex min-h-12 flex-nowrap items-center gap-0.5 overflow-x-auto border-b border-[rgba(196,197,213,0.6)] bg-[#F4F4F4] px-2 py-2 dark:bg-muted/60"
    >
      {isFull && (
        <DropdownMenu
          trigger={
            <ToolbarButton
              onClick={() => {}}
              title={t("toolbar.fontFamily")}
              className="h-8 w-44 max-w-44 justify-between gap-2 border border-[rgba(196,197,213,0.6)] bg-white px-2.5 text-[#404040] shadow-[0_1px_2px_rgba(0,0,0,0.07)] hover:bg-white hover:text-[#404040] dark:bg-background dark:text-foreground"
            >
              <span className="min-w-0 flex-1 truncate text-left text-sm font-normal" style={{ fontFamily: displayedFontFamilyValue || undefined }}>
                {displayedFontFamilyLabel}
              </span>
              <FigmaChevronDownIcon className="h-3 w-3 shrink-0 text-[#7B8184]" />
            </ToolbarButton>
          }
          contentClassName="max-h-80 overflow-y-auto min-w-56 p-2"
        >
          {availableFontFamilies.map((option) => (
            <DropdownMenuItem
              key={option.value}
              label={option.label}
              onClick={() => editor.chain().focus().setFontFamily(option.value).run()}
              active={normalizeStyleValue(option.value) === (currentFontFamily || normalizeStyleValue(defaultFontFamilyValue))}
              className="font-medium"
            />
          ))}
        </DropdownMenu>
      )}

      {(isMediumFull || isFull) && (
        <DropdownMenu
          trigger={
            <ToolbarButton
              onClick={() => {}}
              title={t("toolbar.fontSize")}
              className="h-8 w-16 justify-between gap-2 border border-[rgba(196,197,213,0.6)] bg-white px-2.5 text-[#404040] shadow-[0_1px_2px_rgba(0,0,0,0.07)] hover:bg-white hover:text-[#404040] dark:bg-background dark:text-foreground"
            >
              <span className="text-sm font-normal leading-none">{displayedFontSizeLabel}</span>
              <FigmaChevronDownIcon className="h-3 w-3 shrink-0 text-[#7B8184]" />
            </ToolbarButton>
          }
          contentClassName="max-h-80 overflow-y-auto min-w-32 p-2"
        >
          {availableFontSizes.map((option) => (
            <DropdownMenuItem
              key={option.value}
              label={option.label}
              onClick={() => editor.chain().focus().setFontSize(option.value).run()}
              active={normalizeStyleValue(option.value) === activeFontSize}
            />
          ))}
        </DropdownMenu>
      )}

      <DropdownMenu
        contentClassName="p-1"
        trigger={
          <ToolbarButton onClick={() => {}} title={t("toolbar.textStyle")} className="px-1.5 w-auto gap-0.5">
            <FigmaTextStyleIcon className="h-4 w-4" />
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

      {isFull && (
        <>
          <DropdownMenu
            trigger={
              <ToolbarButton onClick={() => {}} title={t("toolbar.lineHeight")} className="gap-0.5">
                <FigmaLineHeightIcon className="h-4 w-4" />
              </ToolbarButton>
            }
            contentClassName="max-h-72 overflow-y-auto p-1"
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
              <ToolbarButton onClick={() => {}} title={t("toolbar.letterSpacing")} className="gap-0.5">
                <FigmaLetterSpacingIcon className="h-4 w-4" />
              </ToolbarButton>
            }
            contentClassName="max-h-72 overflow-y-auto p-1"
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
        </>
      )}

      <ToolbarDivider />

      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title={t("toolbar.bold")}>
        <FigmaBoldIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title={t("toolbar.italic")}>
        <FigmaItalicIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        title={t("toolbar.underline")}
      >
        <FigmaUnderlineIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title={t("toolbar.strike")}>
        <FigmaStrikeIcon className="h-4 w-4" />
      </ToolbarButton>
      {(isMediumFull || isFull) && (
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title={t("toolbar.code")}>
          <FigmaCodeIcon className="h-4 w-4" />
        </ToolbarButton>
      )}
      {isFull && (
        <>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleSubscript().run()}
            active={editor.isActive("subscript")}
            title={t("toolbar.subscript")}
          >
            <FigmaSubscriptIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleSuperscript().run()}
            active={editor.isActive("superscript")}
            title={t("toolbar.superscript")}
          >
            <FigmaSuperscriptIcon className="h-4 w-4" />
          </ToolbarButton>
        </>
      )}

      <DropdownMenu
        contentClassName="min-w-72"
        trigger={
          <ToolbarButton onClick={() => setShowLinkInput(!editor.isActive("link"))} active={editor.isActive("link")} title={t("toolbar.link")}>
            <FigmaLinkIcon className="h-4 w-4" />
          </ToolbarButton>
        }
      >
        {showLinkInput ? (
          <LinkInput
            initialUrl={String(editor.getAttributes("link").href ?? "")}
            onSubmit={(url) => {
              applyEditorLink(editor, url);
              setShowLinkInput(false);
            }}
            onCancel={() => setShowLinkInput(false)}
          />
        ) : (
          <>
            <DropdownMenuItem
              icon={LinkIcon}
              label={t("toolbar.link")}
              onClick={() => setShowLinkInput(true)}
              active={editor.isActive("link")}
              closeOnSelect={false}
            />
            <DropdownMenuItem
              icon={Trash2}
              label={t("toolbar.removeLink")}
              onClick={() => editor.chain().focus().extendMarkRange("link").unsetLink().run()}
              disabled={!editor.isActive("link")}
              destructive
            />
          </>
        )}
      </DropdownMenu>

      <ToolbarDivider />

      <DropdownMenu
        trigger={
          <ToolbarButton onClick={() => {}} title={t("colors.textColor")}>
            <TextColorIcon color={currentTextColor} />
          </ToolbarButton>
        }
      >
        <EditorColorPalette
          colors={textColors}
          currentColor={currentTextColor}
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
          <ToolbarButton onClick={() => {}} active={editor.isActive("highlight")} title={t("colors.highlight")}>
            <HighlightColorIcon color={currentHighlightColor} />
          </ToolbarButton>
        }
      >
        <EditorColorPalette
          colors={highlightColors}
          currentColor={currentHighlightColor}
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

      {(isMediumFull || isFull) && (
        <>
          <ToolbarDivider />
          <DropdownMenu
            trigger={
              <ToolbarButton onClick={() => {}} title={t("toolbar.alignment")}>
                <FigmaAlignLeftIcon className="h-4 w-4" />
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
            {hasTableContext && (
              <>
                <div className="my-1 border-t" />
                <DropdownMenuItem
                  icon={AlignStartVertical}
                  label={t("tableMenu.alignVerticalTop") || "Align top"}
                  onClick={() => applyTableCellAttribute(editor, "verticalAlign", "top")}
                  active={currentCellVerticalAlign === "top"}
                />
                <DropdownMenuItem
                  icon={AlignCenterVertical}
                  label={t("tableMenu.alignVerticalMiddle") || "Align middle"}
                  onClick={() => applyTableCellAttribute(editor, "verticalAlign", "middle")}
                  active={currentCellVerticalAlign === "middle"}
                />
                <DropdownMenuItem
                  icon={AlignEndVertical}
                  label={t("tableMenu.alignVerticalBottom") || "Align bottom"}
                  onClick={() => applyTableCellAttribute(editor, "verticalAlign", "bottom")}
                  active={currentCellVerticalAlign === "bottom"}
                />
              </>
            )}
          </DropdownMenu>
          {hasTableContext && (
            <DropdownMenu
              trigger={
                <ToolbarButton onClick={() => {}} title={t("tableMenu.textDirection")}>
                  {currentCellTextDirection === "vertical" ? <ArrowDown className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </ToolbarButton>
              }
            >
              <DropdownMenuItem
                icon={ArrowRight}
                label={t("tableMenu.horizontalText")}
                onClick={() => applyTableCellAttribute(editor, "textDirection", null)}
                active={currentCellTextDirection === "horizontal"}
              />
              <DropdownMenuItem
                icon={ArrowDown}
                label={t("tableMenu.verticalText")}
                onClick={() => applyTableCellAttribute(editor, "textDirection", "vertical")}
                active={currentCellTextDirection === "vertical"}
              />
            </DropdownMenu>
          )}
        </>
      )}

      <ToolbarDivider />

      <DropdownMenu
        trigger={
          <ToolbarButton onClick={() => {}} title={t("toolbar.bulletList")}>
            <FigmaListIcon className="h-4 w-4" />
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

      <ToolbarButton
        onClick={() => editor.chain().focus().decreaseIndent().run()}
        disabled={!editorUiState.can.decreaseIndent}
        title={t("toolbar.decreaseIndent")}
      >
        <IndentDecrease className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().increaseIndent().run()}
        disabled={!editorUiState.can.increaseIndent}
        title={t("toolbar.increaseIndent")}
      >
        <IndentIncrease className="h-4 w-4" />
      </ToolbarButton>

      <DropdownMenu
        trigger={
          <ToolbarButton onClick={() => {}} active={editor.isActive("formCheckbox")} title={t("slashCommand.formCheckbox")}>
            <SquareCheckBig className="w-4 h-4" />
          </ToolbarButton>
        }
      >
        <DropdownMenuItem
          icon={SquareCheckBig}
          label={t("slashCommand.formCheckbox")}
          onClick={() => editor.chain().focus().setFormCheckbox().run()}
        />
        <DropdownMenuItem
          icon={CircleCheckBig}
          label={t("slashCommand.roundCheckbox")}
          onClick={() => editor.chain().focus().setFormCheckbox({ variant: "circle" }).run()}
        />
      </DropdownMenu>

      {isMediumFull && (
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title={t("toolbar.quote")}>
          <FigmaQuoteIcon className="h-4 w-4" />
        </ToolbarButton>
      )}

      {isFull && (
        <DropdownMenu
          trigger={
            <ToolbarButton onClick={() => {}} title={t("toolbar.quote")}>
              <FigmaQuoteIcon className="h-4 w-4" />
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
      )}

      {(isMediumFull || isFull) && (
        <DropdownMenu
          trigger={
            <ToolbarButton onClick={() => {}} title={t("toolbar.image")}>
              <FigmaImageIcon className="h-4 w-4" />
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
              <DropdownMenuItem icon={LinkIcon} label={t("imageInput.addFromUrl")} onClick={() => setShowImageInput(true)} closeOnSelect={false} />
              <DropdownMenuItem
                icon={Upload}
                label={isUploadingImage ? t("imageInput.uploading") : t("imageInput.uploadTab")}
                disabled={isUploadingImage}
                onClick={() => fileInputRef.current?.click()}
                closeOnSelect={false}
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
      )}

      {(isMediumFull || isFull) && (
        <DropdownMenu
          isOpen={isTableMenuOpen}
          onOpenChange={setIsTableMenuOpen}
          trigger={
            <ToolbarButton onClick={() => {}} title={t("toolbar.table")}>
              <FigmaTableIcon className="h-4 w-4" />
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
        </DropdownMenu>
      )}

      <ToolbarDivider />

      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title={t("toolbar.undo")}>
        <FigmaUndoIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title={t("toolbar.redo")}>
        <FigmaRedoIcon className="h-4 w-4" />
      </ToolbarButton>

      {hasTableContext && (
        <>
          <ToolbarDivider />
          <ToolbarButton
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            disabled={!editor.can().addColumnBefore()}
            title={t("tableMenu.addColumnBefore")}
          >
            <ArrowLeft className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            disabled={!editor.can().addColumnAfter()}
            title={t("tableMenu.addColumnAfter")}
          >
            <ArrowRight className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().addRowBefore().run()}
            disabled={!editor.can().addRowBefore()}
            title={t("tableMenu.addRowBefore")}
          >
            <ArrowUp className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().addRowAfter().run()}
            disabled={!editor.can().addRowAfter()}
            title={t("tableMenu.addRowAfter")}
          >
            <ArrowDown className="w-4 h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => {
              if (canSplitCell) {
                editor.chain().focus().splitCell().run();
                return;
              }
              mergeTableCellsPreservingColumnWidths(editor);
            }}
            active={canSplitCell}
            disabled={!canMergeCells && !canSplitCell}
            title={canSplitCell ? t("tableMenu.splitCell") : t("tableMenu.mergeCells")}
          >
            <TableCellsMerge className="w-4 h-4" />
          </ToolbarButton>
        </>
      )}
    </div>
  );
};
