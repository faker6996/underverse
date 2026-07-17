"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Editor } from "@tiptap/core";
import { useEditorState } from "@tiptap/react";
import { isInTable as isSelectionInTable, setCellAttr } from "@tiptap/pm/tables";
import { createPortal } from "react-dom";
import { useSmartTranslations } from "../../hooks/useSmartTranslations";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold as BoldIcon,
  ChevronDown,
  Code as CodeIcon,
  Italic as ItalicIcon,
  Link as LinkIcon,
  Plus,
  RotateCcw,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  TableCellsMerge,
  Trash2,
  Type,
  Underline as UnderlineIcon,
  Strikethrough as StrikethroughIcon,
  Edit2,
  Eraser,
  Unlink,
  ExternalLink,
  Grid,
  Sigma,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
  ArrowDown,
  ArrowRight,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { ToolbarButton } from "./toolbar";
import { LinkInput } from "./inputs";
import { applyEditorLink } from "./link-commands";
import { DropdownMenu, DropdownMenuItem } from "../DropdownMenu";
import { CellBgColorIcon, CellBorderIcon, EditorColorPalette, HighlightColorIcon, TextColorIcon, useEditorColors } from "./colors";
import { applyImageLayout, applyImageWidthPreset, deleteSelectedImage, resetImageSize, type UEditorImageWidthPreset } from "./image-commands";
import { buildSlashCommandItems, buildSlashCommandMessages, SlashCommandList, type SlashCommandListRef } from "./slash-command";
import { mergeTableCellsPreservingColumnWidths } from "./table-cell-commands";
import { applyTableCellBorders, type TableBorderPosition } from "./table-border-commands";
import { clearSelectedTableCellFormula, recalculateSelectedTable, setSelectedTableCellFormula, setSelectedTableCellNumberFormat } from "./table-formula-commands";
import type { UEditorFontSizeOption, UEditorLineHeightOption } from "./types";
import { getDefaultFontSizes, getDefaultLineHeights, normalizeStyleValue } from "./typography-options";
import { sanitizeUEditorUrl } from "./url-safety";

const FloatingSlashCommandMenu = ({ editor, onClose }: { editor: Editor; onClose: () => void }) => {
  const t = useSmartTranslations("UEditor");
  const messages = useMemo(() => buildSlashCommandMessages(t), [t]);
  const items = useMemo(() => buildSlashCommandItems({ query: "", messages }), [messages]);
  const listRef = useRef<SlashCommandListRef>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      const handled = listRef.current?.onKeyDown({ event }) ?? false;
      if (handled) {
        event.preventDefault();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <SlashCommandList
      ref={listRef}
      items={items}
      messages={messages}
      command={(item) => {
        item.command({ editor });
        onClose();
      }}
    />
  );
};

const FloatingMenuContent = ({ editor }: { editor: Editor }) => {
  const t = useSmartTranslations("UEditor");
  const [showCommands, setShowCommands] = useState(false);

  if (showCommands) {
    return <FloatingSlashCommandMenu editor={editor} onClose={() => setShowCommands(false)} />;
  }

  return (
    <button
      type="button"
      onClick={() => setShowCommands(true)}
      className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-accent transition-all group"
    >
      <Plus className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
      <span className="text-sm text-muted-foreground group-hover:text-foreground">{t("floatingMenu.addBlock")}</span>
    </button>
  );
};

function applyTableCellBackground(editor: Editor, color: string) {
  const value = color || null;
  const { state, view } = editor;
  const applied = setCellAttr("backgroundColor", value)(state, view.dispatch.bind(view));

  if (applied) {
    view.focus();
    return;
  }

  editor.chain().focus().setCellAttribute("backgroundColor", value).run();
}

function applyTableCellAttribute(editor: Editor, name: string, value: string | null, options: { focus?: boolean } = {}) {
  const shouldFocus = options.focus ?? true;
  const { state, view } = editor;
  const applied = setCellAttr(name, value)(state, view.dispatch.bind(view));

  if (applied) {
    if (shouldFocus) view.focus();
    return;
  }

  const chain = editor.chain();
  if (shouldFocus) chain.focus();
  chain.setCellAttribute(name, value).run();
}

type BorderStyleOption = "solid" | "dashed" | "dotted" | "double" | "none";

function BorderStylePreviewIcon({ style }: { style: BorderStyleOption }) {
  const isNone = style === "none";

  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative inline-flex h-4 w-4 shrink-0 rounded-[2px]",
        isNone ? "border border-border/70 bg-muted/30" : "border text-current",
      )}
      style={
        isNone
          ? undefined
          : {
              borderStyle: style,
              borderWidth: style === "double" ? 3 : 2,
            }
      }
    >
      {isNone && <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 rotate-45 bg-muted-foreground/70" />}
    </span>
  );
}

function BorderPositionPreviewIcon({ position }: { position: TableBorderPosition }) {
  const showTop = position === "all" || position === "outer" || position === "top";
  const showRight = position === "all" || position === "outer" || position === "right";
  const showBottom = position === "all" || position === "outer" || position === "bottom";
  const showLeft = position === "all" || position === "outer" || position === "left";
  const showHorizontal = position === "all" || position === "inner" || position === "horizontal";
  const showVertical = position === "all" || position === "inner" || position === "vertical";

  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5 fill-none stroke-current">
      <path
        d="M2 2H18V18H2Z M2 10H18 M10 2V18"
        className="text-foreground opacity-70"
        stroke="currentColor"
        strokeDasharray="2 1.5"
        strokeWidth="1.25"
      />
      {showTop && <path d="M2 2H18" strokeWidth="2" />}
      {showRight && <path d="M18 2V18" strokeWidth="2" />}
      {showBottom && <path d="M2 18H18" strokeWidth="2" />}
      {showLeft && <path d="M2 2V18" strokeWidth="2" />}
      {showHorizontal && <path d="M2 10H18" strokeWidth="2" />}
      {showVertical && <path d="M10 2V18" strokeWidth="2" />}
    </svg>
  );
}

const BubbleMenuContent = ({
  editor,
  onKeepOpenChange,
  onLinkInputOpenChange,
  onRequestClose,
  fontSizes,
  lineHeights,
  initialShowLinkInput = false,
  cellBorderOpenRequest = 0,
}: {
  editor: Editor;
  onKeepOpenChange?: (keepOpen: boolean) => void;
  onLinkInputOpenChange?: (open: boolean) => void;
  onRequestClose?: () => void;
  fontSizes?: UEditorFontSizeOption[];
  lineHeights?: UEditorLineHeightOption[];
  initialShowLinkInput?: boolean;
  cellBorderOpenRequest?: number;
}) => {
  const t = useSmartTranslations("UEditor");
  useEditorState({
    editor,
    selector: ({ transactionNumber }) => transactionNumber,
  });
  const { textColors, highlightColors } = useEditorColors();
  const [showLinkInput, setShowLinkInput] = useState(initialShowLinkInput);
  const [activeColorPalette, setActiveColorPalette] = useState<"text" | "highlight" | "cell-bg" | "cell-border" | "cell-border-color" | null>(null);

  useEffect(() => {
    setShowLinkInput(initialShowLinkInput);
  }, [initialShowLinkInput]);

  useEffect(() => {
    if (!cellBorderOpenRequest) return;
    setActiveColorPalette("cell-border");
    onKeepOpenChange?.(true);
  }, [cellBorderOpenRequest, onKeepOpenChange]);
  const [showTypographyPanel, setShowTypographyPanel] = useState(false);
  const [showFormulaPanel, setShowFormulaPanel] = useState(false);
  const [formulaDraft, setFormulaDraft] = useState("");
  const [showFontSizeOptions, setShowFontSizeOptions] = useState(false);
  const [fontSizeDraft, setFontSizeDraft] = useState("");
  const isImageSelected = editor.isActive("image");
  const imageAttrs = editor.getAttributes("image") as { imageLayout?: string; imageWidthPreset?: UEditorImageWidthPreset | null };
  const imageLayout = imageAttrs.imageLayout === "left" || imageAttrs.imageLayout === "right" ? imageAttrs.imageLayout : "block";
  const imageWidthPreset =
    imageAttrs.imageWidthPreset === "sm" || imageAttrs.imageWidthPreset === "md" || imageAttrs.imageWidthPreset === "lg"
      ? imageAttrs.imageWidthPreset
      : null;
  const textStyleAttrs = editor.getAttributes("textStyle") as { color?: string; fontSize?: string; lineHeight?: string };
  const currentTextColor = normalizeStyleValue(textStyleAttrs.color) || "inherit";
  const currentHighlightColor = normalizeStyleValue(editor.getAttributes("highlight").color) || "";
  const currentCellBgColor =
    normalizeStyleValue(editor.getAttributes("tableCell").backgroundColor || editor.getAttributes("tableHeader").backgroundColor) || "";
  const currentCellFormula =
    normalizeStyleValue(editor.getAttributes("tableCell").formula || editor.getAttributes("tableHeader").formula) || "";
  const currentCellNumberFormat =
    normalizeStyleValue(editor.getAttributes("tableCell").numberFormat || editor.getAttributes("tableHeader").numberFormat) || "text";
  const currentCellBorderStyle = editor.getAttributes("tableCell").borderStyle || editor.getAttributes("tableHeader").borderStyle || "solid";
  const currentCellBorderWidth = editor.getAttributes("tableCell").borderWidth || editor.getAttributes("tableHeader").borderWidth || "1px";
  const currentCellBorderColor =
    normalizeStyleValue(editor.getAttributes("tableCell").borderColor || editor.getAttributes("tableHeader").borderColor) || "#000000";
  const [borderStyleDraft, setBorderStyleDraft] = useState<BorderStyleOption>(
    (["solid", "dashed", "dotted", "double"] as string[]).includes(currentCellBorderStyle)
      ? (currentCellBorderStyle as BorderStyleOption)
      : "solid",
  );
  const [borderWidthDraft, setBorderWidthDraft] = useState(currentCellBorderWidth);
  const [borderColorDraft, setBorderColorDraft] = useState(currentCellBorderColor);
  const [borderEditMode, setBorderEditMode] = useState<"draw" | "erase">("draw");
  const [activeBorderPosition, setActiveBorderPosition] = useState<TableBorderPosition>("all");
  const currentCellVerticalAlign =
    normalizeStyleValue(editor.getAttributes("tableCell").verticalAlign || editor.getAttributes("tableHeader").verticalAlign) || "";
  const currentCellTextDirection =
    normalizeStyleValue(editor.getAttributes("tableCell").textDirection || editor.getAttributes("tableHeader").textDirection) || "horizontal";
  const isInTable = isSelectionInTable(editor.state);
  const canMergeCells = isInTable && editor.can().mergeCells();
  const canSplitCell = isInTable && editor.can().splitCell();
  const currentFontSize = normalizeStyleValue(textStyleAttrs.fontSize);
  const currentLineHeight = normalizeStyleValue(textStyleAttrs.lineHeight);
  const quickFontSizes = useMemo(
    () => (fontSizes ?? getDefaultFontSizes()).filter((option) => ["14px", "16px", "24px"].includes(option.value)),
    [fontSizes],
  );
  const quickLineHeights = useMemo(
    () => (lineHeights ?? getDefaultLineHeights()).filter((option) => ["1.2", "1.5", "1.75"].includes(option.value)),
    [lineHeights],
  );
  const borderColors = useMemo(
    () => [
      highlightColors[0] ?? { name: t("colors.default"), color: "" },
      { name: "Black", color: "#000000" },
      { name: "White", color: "#ffffff" },
      ...highlightColors.slice(1),
    ],
    [highlightColors, t],
  );

  useEffect(() => {
    setFontSizeDraft(currentFontSize.replace(/px$/i, ""));
  }, [currentFontSize]);

  useEffect(() => {
    setFormulaDraft(currentCellFormula);
  }, [currentCellFormula]);

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
    setFontSizeDraft(String(clamped));
  };

  useEffect(() => {
    onKeepOpenChange?.(showLinkInput);
    onLinkInputOpenChange?.(showLinkInput);
  }, [onKeepOpenChange, onLinkInputOpenChange, showLinkInput]);

  useEffect(() => {
    onKeepOpenChange?.(Boolean(activeColorPalette));
  }, [activeColorPalette, onKeepOpenChange]);

  const closeTransientPanels = useCallback(() => {
    setActiveColorPalette(null);
    setShowLinkInput(false);
    onKeepOpenChange?.(false);
    onLinkInputOpenChange?.(false);
    onRequestClose?.();
  }, [onKeepOpenChange, onLinkInputOpenChange, onRequestClose]);

  const selectTableCellBorderColor = useCallback((color: string) => {
    const value = color || "currentColor";
    setBorderColorDraft(value);
    setBorderEditMode("draw");
    setActiveBorderPosition("all");
    applyTableCellBorders(editor, "all", {
      color: value,
      style: borderStyleDraft,
      width: borderWidthDraft,
    }, { focus: false });
    setActiveColorPalette("cell-border");
    onKeepOpenChange?.(true);
  }, [borderStyleDraft, borderWidthDraft, editor, onKeepOpenChange]);

  const applyTableCellBorderPosition = useCallback((position: TableBorderPosition) => {
    setActiveBorderPosition(position);
    applyTableCellBorders(editor, position, {
      color: borderColorDraft,
      style: borderEditMode === "erase" ? "none" : borderStyleDraft,
      width: borderWidthDraft,
    }, { focus: false });
    onKeepOpenChange?.(true);
  }, [borderColorDraft, borderEditMode, borderStyleDraft, borderWidthDraft, editor, onKeepOpenChange]);

  const applyTableCellBorderStyle = useCallback((style: BorderStyleOption) => {
    setBorderStyleDraft(style);
    setBorderEditMode("draw");
    setActiveBorderPosition("all");
    applyTableCellBorders(editor, "all", {
      color: borderColorDraft,
      style,
      width: borderWidthDraft,
    }, { focus: false });
    onKeepOpenChange?.(true);
  }, [borderColorDraft, borderWidthDraft, editor, onKeepOpenChange]);

  const applyTableCellBorderWidth = useCallback((width: string) => {
    setBorderWidthDraft(width);
    setBorderEditMode("draw");
    setActiveBorderPosition("all");
    applyTableCellBorders(editor, "all", {
      color: borderColorDraft,
      style: borderStyleDraft,
      width,
    }, { focus: false });
    onKeepOpenChange?.(true);
  }, [borderColorDraft, borderStyleDraft, editor, onKeepOpenChange]);

  const clearTableCellBorders = useCallback(() => {
    setActiveBorderPosition("all");
    setBorderEditMode("erase");
    applyTableCellBorders(editor, "all", {
      color: borderColorDraft,
      style: "none",
      width: borderWidthDraft,
    }, { focus: false });
    onKeepOpenChange?.(true);
  }, [borderColorDraft, borderWidthDraft, editor, onKeepOpenChange]);

  const closeColorPalette = useCallback(() => {
    setActiveColorPalette(null);
    onKeepOpenChange?.(false);
  }, [onKeepOpenChange]);

  const applyInlineColorAndClose = useCallback((color: string) => {
    if (activeColorPalette === "text") {
      if (color === "inherit") {
        editor.chain().focus().unsetColor().run();
      } else {
        editor.chain().focus().setColor(color).run();
      }
    } else if (activeColorPalette === "highlight") {
      if (color === "") {
        editor.chain().focus().unsetHighlight().run();
      } else {
        editor.chain().focus().toggleHighlight({ color }).run();
      }
    } else {
      applyTableCellBackground(editor, color);
    }
    closeColorPalette();
  }, [activeColorPalette, closeColorPalette, editor]);

  useEffect(() => {
    if (!showLinkInput) return;

    // If user opened the link input but then clicked somewhere else in the editor,
    // close the input and resume normal bubble behavior.
    const close = () => setShowLinkInput(false);
    editor.on("selectionUpdate", close);
    editor.on("blur", close);

    return () => {
      editor.off("selectionUpdate", close);
      editor.off("blur", close);
    };
  }, [editor, showLinkInput]);

  if (showLinkInput) {
    return (
      <LinkInput
        initialUrl={editor.getAttributes("link").href || ""}
        onSubmit={(url) => {
          applyEditorLink(editor, url);
          setShowLinkInput(false);
          // Move focus back to editor so the bubble can resume normal tracking.
          requestAnimationFrame(() => editor.commands.focus());
        }}
        onCancel={() => {
          setShowLinkInput(false);
          requestAnimationFrame(() => editor.commands.focus());
        }}
      />
    );
  }
  if (activeColorPalette) {
    const isTextPalette = activeColorPalette === "text";
    const isHighlightPalette = activeColorPalette === "highlight";

    if (activeColorPalette === "cell-border") {
      return (
        <div className="flex w-72 flex-col gap-2 p-2 text-sm" data-ueditor-keep-open>
          <div className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-1">
            {t("tableMenu.cellBorder") || "Cell Borders"}
          </div>

          <div className="flex gap-2">
            <div className="min-w-0 flex-1">
              <label className="mb-1 block text-xs text-muted-foreground">{t("tableMenu.borderPosition") || "Border placement"}</label>
              <div className="grid grid-cols-5 gap-1" role="group" aria-label={t("tableMenu.borderPosition") || "Border placement"}>
                {([
                  ["all", "borderAll"],
                  ["outer", "borderOuter"],
                  ["inner", "borderInner"],
                  ["horizontal", "borderHorizontal"],
                  ["vertical", "borderVertical"],
                  ["top", "borderTop"],
                  ["right", "borderRight"],
                  ["bottom", "borderBottom"],
                  ["left", "borderLeft"],
                ] as Array<[TableBorderPosition, string]>).map(([position, labelKey]) => {
                  const label = t(`tableMenu.${labelKey}`) || position;
                  return (
                    <button
                      key={position}
                      type="button"
                      aria-label={label}
                      title={label}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => applyTableCellBorderPosition(position)}
                      className={cn(
                        "inline-flex h-8 items-center justify-center rounded-md text-foreground transition-colors hover:bg-muted hover:text-primary",
                        activeBorderPosition === position ? "bg-primary/10 text-primary" : "bg-muted/40",
                      )}
                    >
                      <BorderPositionPreviewIcon position={position} />
                    </button>
                  );
                })}
                <button
                  type="button"
                  aria-label={t("tableMenu.clearBorder") || "Clear borders"}
                  title={t("tableMenu.clearBorder") || "Clear borders"}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={clearTableCellBorders}
                  className="inline-flex h-8 items-center justify-center rounded-md bg-muted/40 text-destructive transition-colors hover:bg-destructive/10"
                >
                  <BorderStylePreviewIcon style="none" />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1 border-l border-border pl-2 pt-5" role="group" aria-label={t("tableMenu.borderMode") || "Border mode"}>
              <button
                type="button"
                aria-label={t("tableMenu.borderDraw") || "Draw borders"}
                title={t("tableMenu.borderDraw") || "Draw borders"}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setBorderEditMode("draw")}
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-muted",
                  borderEditMode === "draw" ? "bg-primary/10 text-primary" : "text-muted-foreground",
                )}
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label={t("tableMenu.borderErase") || "Hide borders"}
                title={t("tableMenu.borderErase") || "Hide borders"}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setBorderEditMode("erase")}
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-muted",
                  borderEditMode === "erase" ? "bg-destructive/10 text-destructive" : "text-muted-foreground",
                )}
              >
                <Eraser className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Border Style Selector */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">{t("tableMenu.borderStyle") || "Border Style"}</label>
            <div className="grid grid-cols-4 gap-1.5" role="group" aria-label={t("tableMenu.borderStyle") || "Border Style"}>
              {([
                ["solid", "Solid"],
                ["dashed", "Dashed"],
                ["dotted", "Dotted"],
                ["double", "Double"],
              ] as Array<[BorderStyleOption, string]>).map(([style, label]) => (
                <button
                  key={style}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => applyTableCellBorderStyle(style)}
                  className={cn(
                    "inline-flex h-8 min-w-0 items-center justify-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors hover:bg-muted",
                    borderStyleDraft === style ? "bg-primary/10 text-primary" : "bg-muted/40 text-foreground",
                  )}
                >
                  <BorderStylePreviewIcon style={style} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Border Width Selector */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">{t("tableMenu.borderWidth") || "Border Width"}</label>
            <div className="grid grid-cols-4 gap-1" role="group" aria-label={t("tableMenu.borderWidth") || "Border Width"}>
              {["1px", "2px", "3px", "4px"].map((width) => (
                <button
                  key={width}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => applyTableCellBorderWidth(width)}
                  className={cn(
                    "h-8 rounded-md px-2 text-xs font-medium transition-colors hover:bg-muted",
                    borderWidthDraft === width ? "bg-primary/10 text-primary" : "bg-muted/40 text-foreground",
                  )}
                >
                  {width}
                </button>
              ))}
            </div>
          </div>

          {/* Border Color Trigger */}
          <button
            type="button"
            onClick={() => setActiveColorPalette("cell-border-color")}
            className="flex items-center justify-between w-full h-8 px-2 rounded-md border border-input hover:bg-accent text-xs"
          >
            <span>{t("tableMenu.borderColor") || "Border Color"}</span>
            <span
              className="w-4 h-4 rounded-full border border-border"
              style={{
                backgroundColor: borderColorDraft,
              }}
            />
          </button>

        </div>
      );
    }

    if (activeColorPalette === "cell-border-color") {
      return (
        <div className="w-56" data-ueditor-keep-open>
          <EditorColorPalette
            colors={borderColors}
            currentColor={borderColorDraft}
            onSelect={selectTableCellBorderColor}
            label={t("tableMenu.borderColor") || "Border Color"}
          />
        </div>
      );
    }

    return (
      <div className="w-56" data-ueditor-keep-open>
        <EditorColorPalette
          colors={isTextPalette ? textColors : highlightColors}
          currentColor={isTextPalette ? currentTextColor : isHighlightPalette ? currentHighlightColor : currentCellBgColor}
          onSelect={applyInlineColorAndClose}
          label={
            isTextPalette ? t("colors.textColor") : isHighlightPalette ? t("colors.highlight") : t("tableMenu.cellBackground") || "Cell background"
          }
        />
      </div>
    );
  }

  if (isImageSelected) {
    return (
      <div className="flex items-center gap-0.5 p-1">
        <ToolbarButton onClick={() => applyImageLayout(editor, "block")} active={imageLayout === "block"} title={t("toolbar.imageLayoutBlock")}>
          <AlignCenter className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => applyImageLayout(editor, "left")} active={imageLayout === "left"} title={t("toolbar.imageLayoutLeft")}>
          <AlignLeft className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => applyImageLayout(editor, "right")} active={imageLayout === "right"} title={t("toolbar.imageLayoutRight")}>
          <AlignRight className="w-4 h-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border/50 mx-1" />

        <ToolbarButton onClick={() => applyImageWidthPreset(editor, "sm")} active={imageWidthPreset === "sm"} title={t("toolbar.imageWidthSm")}>
          <span className="text-[10px] font-semibold">S</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => applyImageWidthPreset(editor, "md")} active={imageWidthPreset === "md"} title={t("toolbar.imageWidthMd")}>
          <span className="text-[10px] font-semibold">M</span>
        </ToolbarButton>
        <ToolbarButton onClick={() => applyImageWidthPreset(editor, "lg")} active={imageWidthPreset === "lg"} title={t("toolbar.imageWidthLg")}>
          <span className="text-[10px] font-semibold">L</span>
        </ToolbarButton>

        <div className="w-px h-6 bg-border/50 mx-1" />

        <ToolbarButton onClick={() => resetImageSize(editor)} title={t("toolbar.imageResetSize")}>
          <RotateCcw className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => deleteSelectedImage(editor)}
          title={t("toolbar.imageDelete")}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </ToolbarButton>
      </div>
    );
  }

  if (showFormulaPanel && isInTable) {
    return (
      <div className="w-72 p-2">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {t("tableMenu.formula") || "Formula"}
          </span>
          <button
            type="button"
            onClick={() => {
              setShowFormulaPanel(false);
              onKeepOpenChange?.(false);
            }}
            className="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {t("colors.done")}
          </button>
        </div>

        <div className="flex h-9 items-center overflow-hidden rounded-md border border-border/60 bg-muted/40">
          <input
            value={formulaDraft}
            onChange={(event) => setFormulaDraft(event.target.value)}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              event.stopPropagation();
              if (event.key === "Enter") {
                event.preventDefault();
                setSelectedTableCellFormula(editor, formulaDraft);
                setShowFormulaPanel(false);
                onKeepOpenChange?.(false);
              }
            }}
            aria-label={t("tableMenu.formula") || "Formula"}
            placeholder="=SUM(A1:A3)"
            className="h-full min-w-0 flex-1 bg-transparent px-2 text-sm font-medium text-foreground outline-none"
          />
        </div>

        <div className="mt-2">
          <div className="mb-1 px-1 text-[11px] font-medium text-muted-foreground">
            {t("tableMenu.numberFormat") || "Number format"}
          </div>
          <div className="grid grid-cols-5 gap-1">
            {[
              ["text", "Text"],
              ["number", "123"],
              ["currency", "$"],
              ["percent", "%"],
              ["date", "Date"],
            ].map(([format, label]) => (
              <button
                key={format}
                type="button"
                onClick={() => setSelectedTableCellNumberFormat(editor, format)}
                className={cn(
                  "h-8 rounded-md text-[11px] font-semibold transition-colors hover:bg-muted",
                  currentCellNumberFormat === format || (format === "text" && !currentCellNumberFormat)
                    ? "bg-primary/10 text-primary"
                    : "bg-muted/40 text-foreground",
                )}
              >
                {format === "text" ? t("tableMenu.formatText") || label : format === "date" ? t("tableMenu.formatDate") || label : label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-1">
          <button
            type="button"
            onClick={() => {
              setSelectedTableCellFormula(editor, formulaDraft);
              setShowFormulaPanel(false);
              onKeepOpenChange?.(false);
            }}
            className="h-8 rounded-md bg-primary/10 text-xs font-semibold text-primary transition-colors hover:bg-primary/15"
          >
            {t("tableMenu.apply") || "Apply"}
          </button>
          <button
            type="button"
            onClick={() => {
              clearSelectedTableCellFormula(editor);
              setFormulaDraft("");
            }}
            className="h-8 rounded-md bg-muted/40 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
          >
            {t("tableMenu.clear") || "Clear"}
          </button>
          <button
            type="button"
            onClick={() => recalculateSelectedTable(editor)}
            className="h-8 rounded-md bg-muted/40 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
          >
            {t("tableMenu.recalculate") || "Recalc"}
          </button>
        </div>
      </div>
    );
  }

  if (showTypographyPanel) {
    return (
      <div className="w-72 p-2">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{t("toolbar.textStyle")}</span>
          <button
            type="button"
            onClick={() => setShowTypographyPanel(false)}
            className="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {t("colors.done")}
          </button>
        </div>

        <div className="space-y-2">
          <div>
            <div className="mb-1 px-1 text-[11px] font-medium text-muted-foreground">{t("toolbar.fontSize")}</div>
            <div className="flex h-9 items-center overflow-hidden rounded-md border border-border/60 bg-muted/40">
              <input
                type="number"
                min={8}
                max={96}
                step={1}
                value={fontSizeDraft}
                onChange={(event) => setFontSizeDraft(event.target.value)}
                onBlur={applyFontSizeDraft}
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => {
                  event.stopPropagation();
                  if (event.key === "Enter") {
                    event.preventDefault();
                    applyFontSizeDraft();
                  }
                }}
                aria-label={t("toolbar.fontSize")}
                placeholder="A"
                className="h-full min-w-0 flex-1 bg-transparent px-2 text-center text-sm font-semibold text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span className="border-l border-border/50 px-2 text-[11px] text-muted-foreground">px</span>
              <button
                type="button"
                aria-label={t("toolbar.fontSize")}
                onClick={() => setShowFontSizeOptions((open) => !open)}
                className={cn(
                  "flex h-full w-9 items-center justify-center border-l border-border/50 transition-colors hover:bg-muted",
                  showFontSizeOptions && "bg-primary/10 text-primary",
                )}
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            {showFontSizeOptions && (
              <div className="mt-1 grid grid-cols-4 gap-1">
                <button
                  type="button"
                  onClick={() => {
                    editor.chain().focus().unsetFontSize().run();
                    setShowFontSizeOptions(false);
                  }}
                  className={cn(
                    "h-8 rounded-md text-xs font-semibold transition-colors hover:bg-muted",
                    !currentFontSize ? "bg-primary/10 text-primary" : "bg-muted/40 text-foreground",
                  )}
                >
                  A
                </button>
                {quickFontSizes.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      editor.chain().focus().setFontSize(option.value).run();
                      setShowFontSizeOptions(false);
                    }}
                    className={cn(
                      "h-8 rounded-md text-xs font-semibold transition-colors hover:bg-muted",
                      normalizeStyleValue(option.value) === currentFontSize ? "bg-primary/10 text-primary" : "bg-muted/40 text-foreground",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="mb-1 px-1 text-[11px] font-medium text-muted-foreground">{t("toolbar.lineHeight")}</div>
            <div className="grid grid-cols-4 gap-1">
              <button
                type="button"
                onClick={() => editor.chain().focus().unsetLineHeight().run()}
                className={cn(
                  "h-8 rounded-md text-xs font-semibold transition-colors hover:bg-muted",
                  !currentLineHeight ? "bg-primary/10 text-primary" : "bg-muted/40 text-foreground",
                )}
              >
                LH
              </button>
              {quickLineHeights.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => editor.chain().focus().setLineHeight(option.value).run()}
                  className={cn(
                    "h-8 rounded-md text-xs font-semibold transition-colors hover:bg-muted",
                    normalizeStyleValue(option.value) === currentLineHeight ? "bg-primary/10 text-primary" : "bg-muted/40 text-foreground",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1 border-t border-border/40 pt-2">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleSubscript().run()}
              className={cn(
                "flex h-8 items-center justify-center gap-2 rounded-md text-xs font-semibold transition-colors hover:bg-muted",
                editor.isActive("subscript") ? "bg-primary/10 text-primary" : "bg-muted/40 text-foreground",
              )}
            >
              <SubscriptIcon className="h-4 w-4" />
              {t("toolbar.subscript")}
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
              className={cn(
                "flex h-8 items-center justify-center gap-2 rounded-md text-xs font-semibold transition-colors hover:bg-muted",
                editor.isActive("superscript") ? "bg-primary/10 text-primary" : "bg-muted/40 text-foreground",
              )}
            >
              <SuperscriptIcon className="h-4 w-4" />
              {t("toolbar.superscript")}
            </button>
          </div>
        </div>
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
    <div className="flex items-center gap-0.5 p-1">
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

      <div className="w-px h-6 bg-border/50 mx-1" />

      <ToolbarButton
        onMouseDown={() => {
          // Pin the bubble as early as possible (mousedown) so it won't disappear when focusing the input.
          onKeepOpenChange?.(true);
        }}
        onClick={() => {
          setShowLinkInput(true);
        }}
        active={editor.isActive("link")}
        title={t("toolbar.link")}
      >
        <LinkIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => setActiveColorPalette("text")} title={t("colors.textColor")}>
        <TextColorIcon color={currentTextColor} />
      </ToolbarButton>
      <ToolbarButton onClick={() => setActiveColorPalette("highlight")} active={editor.isActive("highlight")} title={t("colors.highlight")}>
        <HighlightColorIcon color={currentHighlightColor} />
      </ToolbarButton>
      {isInTable && (
        <>
          <ToolbarButton
            onClick={() => setActiveColorPalette("cell-bg")}
            active={Boolean(currentCellBgColor)}
            title={t("tableMenu.cellBackground") || "Cell background"}
          >
            <CellBgColorIcon color={currentCellBgColor} />
          </ToolbarButton>
          <ToolbarButton
            onMouseDown={() => {
              onKeepOpenChange?.(true);
            }}
            onClick={() => setActiveColorPalette("cell-border")}
            active={Boolean(
              editor.getAttributes("tableCell").borderColor ||
                editor.getAttributes("tableHeader").borderColor ||
                editor.getAttributes("tableCell").borderStyle ||
                editor.getAttributes("tableHeader").borderStyle ||
                editor.getAttributes("tableCell").borderWidth ||
                editor.getAttributes("tableHeader").borderWidth
            )}
            title={t("tableMenu.cellBorder") || "Cell border"}
          >
            <CellBorderIcon
              color={
                editor.getAttributes("tableCell").borderColor ||
                editor.getAttributes("tableHeader").borderColor
              }
            />
          </ToolbarButton>
          <ToolbarButton
            onMouseDown={() => {
              onKeepOpenChange?.(true);
            }}
            onClick={() => {
              setFormulaDraft(currentCellFormula);
              setShowFormulaPanel(true);
            }}
            active={Boolean(currentCellFormula)}
            title={t("tableMenu.formula") || "Formula"}
          >
            <Sigma className="w-4 h-4" />
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
            title={canSplitCell ? t("tableMenu.splitCell") || "Split cell" : t("tableMenu.mergeCells") || "Merge cells"}
          >
            <TableCellsMerge className="w-4 h-4" />
          </ToolbarButton>
          <DropdownMenu
            onOpenChange={(open) => {
              onKeepOpenChange?.(open);
            }}
            trigger={
              <ToolbarButton
                onMouseDown={() => {
                  onKeepOpenChange?.(true);
                }}
                onClick={() => {}}
                title={t("tableMenu.alignVertical") || "Vertical alignment"}
              >
                <VerticalAlignActiveIcon className="w-4 h-4" />
                <ChevronDown className="w-3 h-3" />
              </ToolbarButton>
            }
          >
            <DropdownMenuItem
              icon={AlignStartVertical}
              label={t("tableMenu.alignVerticalTop") || "Align top"}
              onClick={() => applyTableCellAttribute(editor, "verticalAlign", "top", { focus: false })}
              active={currentCellVerticalAlign === "top"}
            />
            <DropdownMenuItem
              icon={AlignCenterVertical}
              label={t("tableMenu.alignVerticalMiddle") || "Align middle"}
              onClick={() => applyTableCellAttribute(editor, "verticalAlign", "middle", { focus: false })}
              active={currentCellVerticalAlign === "middle"}
            />
            <DropdownMenuItem
              icon={AlignEndVertical}
              label={t("tableMenu.alignVerticalBottom") || "Align bottom"}
              onClick={() => applyTableCellAttribute(editor, "verticalAlign", "bottom", { focus: false })}
              active={currentCellVerticalAlign === "bottom"}
            />
          </DropdownMenu>
          <DropdownMenu
            onOpenChange={(open) => {
              onKeepOpenChange?.(open);
            }}
            trigger={
              <ToolbarButton
                onMouseDown={() => {
                  onKeepOpenChange?.(true);
                }}
                onClick={() => {}}
                title={t("tableMenu.textDirection")}
              >
                {currentCellTextDirection === "vertical" ? <ArrowDown className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                <ChevronDown className="w-3 h-3" />
              </ToolbarButton>
            }
          >
            <DropdownMenuItem
              icon={ArrowRight}
              label={t("tableMenu.horizontalText")}
              onClick={() => applyTableCellAttribute(editor, "textDirection", null, { focus: false })}
              active={currentCellTextDirection === "horizontal"}
            />
            <DropdownMenuItem
              icon={ArrowDown}
              label={t("tableMenu.verticalText")}
              onClick={() => applyTableCellAttribute(editor, "textDirection", "vertical", { focus: false })}
              active={currentCellTextDirection === "vertical"}
            />
          </DropdownMenu>
        </>
      )}

      <ToolbarButton
        onClick={() => setShowTypographyPanel(true)}
        active={Boolean(currentFontSize || currentLineHeight || editor.isActive("subscript") || editor.isActive("superscript"))}
        title={t("toolbar.textStyle")}
      >
        <Type className="w-4 h-4" />
      </ToolbarButton>
    </div>
  );
};

const LinkPreviewContent = ({ editor, onEdit }: { editor: Editor; onEdit: () => void }) => {
  const url = editor.getAttributes("link").href || "";
  const t = useSmartTranslations("UEditor");

  const handleOpen = () => {
    const safeUrl = sanitizeUEditorUrl(url, "link");
    if (safeUrl) window.open(safeUrl, "_blank", "noopener,noreferrer");
  };

  const handleUnlink = () => {
    editor.chain().focus().unsetLink().run();
  };

  return (
    <div className="flex items-center gap-1 p-1 max-w-sm">
      <span className="text-xs text-muted-foreground font-mono px-2 truncate max-w-45">
        {url}
      </span>
      <div className="w-px h-6 bg-border/50 mx-1" />
      <ToolbarButton onClick={handleOpen} title={t("linkPreview.open") || "Open link"}>
        <ExternalLink className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={onEdit} title={t("linkPreview.edit") || "Edit link"}>
        <Edit2 className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={handleUnlink} title={t("linkPreview.unlink") || "Remove link"} className="text-destructive hover:text-destructive">
        <Unlink className="w-4 h-4" />
      </ToolbarButton>
    </div>
  );
};

export const CustomBubbleMenu = ({
  editor,
  fontSizes,
  lineHeights,
}: {
  editor: Editor;
  fontSizes?: UEditorFontSizeOption[];
  lineHeights?: UEditorLineHeightOption[];
}) => {
  const SHOW_DELAY_MS = 180;
  const BUBBLE_MENU_OFFSET = 16;
  const BUBBLE_MENU_ESTIMATED_HEIGHT = 44;
  const [isVisible, setIsVisible] = useState(false);
  const [linkInputOpen, setLinkInputOpen] = useState(false);
  const [cellBorderOpenRequest, setCellBorderOpenRequest] = useState(0);
  const [position, setPosition] = useState<{ top: number; left: number; placement: "top" | "bottom" }>({
    top: 0,
    left: 0,
    placement: "top",
  });
  const menuRef = useRef<HTMLDivElement>(null);
  const keepOpenRef = useRef(false);
  const [keepOpen, setKeepOpenState] = useState(false);
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressShowUntilRef = useRef(0);
  const setKeepOpen = useCallback((next: boolean) => {
    keepOpenRef.current = next;
    setKeepOpenState(next);
    if (!next) setLinkInputOpen(false);
    if (next) setIsVisible(true);
  }, []);
  const closeBubbleMenu = useCallback((suppressShow = true) => {
    suppressShowUntilRef.current = suppressShow ? Date.now() + 1000 : 0;
    keepOpenRef.current = false;
    setKeepOpenState(false);
    setLinkInputOpen(false);
    setIsVisible(false);
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    const clearShowTimeout = () => {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }
    };

    const updatePosition = () => {
      const { state, view } = editor;
      const { from, to, empty } = state.selection;
      const isLinkActive = editor.isActive("link");

      if (Date.now() < suppressShowUntilRef.current) {
        clearShowTimeout();
        setIsVisible(false);
        return;
      }

      if (!keepOpenRef.current && ((empty && !isLinkActive) || !view.hasFocus())) {
        clearShowTimeout();
        setIsVisible(false);
        return;
      }

      let start: { top: number; left: number; right: number; bottom: number };
      let end: { top: number; left: number; right: number; bottom: number };
      try {
        start = view.coordsAtPos(from);
        end = view.coordsAtPos(to);
      } catch {
        if (keepOpenRef.current) {
          clearShowTimeout();
          setIsVisible(true);
          return;
        }
        clearShowTimeout();
        setIsVisible(false);
        return;
      }

      const viewportPadding = 8;
      const menuHeight = menuRef.current?.getBoundingClientRect().height || BUBBLE_MENU_ESTIMATED_HEIGHT;
      const editorTop = view.dom.getBoundingClientRect().top;
      const selectionTop = Math.min(start.top, end.top);
      const selectionBottom = Math.max(start.bottom, end.bottom);
      const hasRoomAboveEditor = selectionTop - BUBBLE_MENU_OFFSET - menuHeight >= editorTop + viewportPadding;
      const placement = hasRoomAboveEditor ? "top" : "bottom";
      const left = Math.min(
        window.innerWidth - viewportPadding,
        Math.max(viewportPadding, (start.left + end.left) / 2),
      );
      const top =
        placement === "top"
          ? Math.max(viewportPadding, selectionTop - BUBBLE_MENU_OFFSET)
          : Math.min(window.innerHeight - viewportPadding, selectionBottom + BUBBLE_MENU_OFFSET);

      setPosition({ top, left, placement });
      if (keepOpenRef.current) {
        clearShowTimeout();
        setIsVisible(true);
        return;
      }

      clearShowTimeout();
      showTimeoutRef.current = setTimeout(() => {
        setIsVisible(true);
        showTimeoutRef.current = null;
      }, SHOW_DELAY_MS);
    };

    const handleBlur = () => {
      if (!keepOpenRef.current) {
        clearShowTimeout();
        setIsVisible(false);
      }
    };

    editor.on("selectionUpdate", updatePosition);
    editor.on("focus", updatePosition);
    editor.on("blur", handleBlur);
    editor.on("transaction", updatePosition);
    editor.on("update", updatePosition);
    const animationFrameId = requestAnimationFrame(updatePosition);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearShowTimeout();
      editor.off("selectionUpdate", updatePosition);
      editor.off("focus", updatePosition);
      editor.off("blur", handleBlur);
      editor.off("transaction", updatePosition);
      editor.off("update", updatePosition);
    };
  }, [editor]);

  useEffect(() => {
    if (!isVisible) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (menuRef.current?.contains(target) || target.closest("[data-ueditor-keep-open]"))) return;
      const table = target?.closest("table");
      if (table && editor.view.dom.contains(table)) return;
      closeBubbleMenu(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeBubbleMenu();
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeBubbleMenu, editor, isVisible]);

  useEffect(() => {
    const handleTableDoubleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const cell = target?.closest("td,th");
      if (!cell || !editor.view.dom.contains(cell)) return;

      suppressShowUntilRef.current = 0;
      keepOpenRef.current = true;
      setKeepOpenState(true);
      setLinkInputOpen(false);
      setCellBorderOpenRequest((request) => request + 1);
      setIsVisible(true);
      requestAnimationFrame(() => editor.view.focus());
    };

    editor.view.dom.addEventListener("dblclick", handleTableDoubleClick);
    return () => editor.view.dom.removeEventListener("dblclick", handleTableDoubleClick);
  }, [editor]);

  if (!isVisible) return null;

  return createPortal(
    <div
      ref={menuRef}
      data-popover
      className="fixed z-[99999] flex rounded-xl border border-border/40 bg-card text-card-foreground shadow-lg backdrop-blur-sm overflow-hidden animate-in fade-in-0 zoom-in-95"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: position.placement === "top" ? "translate(-50%, -100%)" : "translate(-50%, 0)",
      }}
      onMouseDown={(e) => {
        const target = e.target as HTMLElement | null;
        if (target?.closest?.("[data-ueditor-close-on-select]")) {
          setKeepOpen(false);
        } else if (target?.closest?.("[data-ueditor-keep-open]")) {
          setKeepOpen(true);
        }
        e.preventDefault();
      }}
    >
      {editor.isActive("link") && !keepOpen && !linkInputOpen ? (
        <LinkPreviewContent
          editor={editor}
          onEdit={() => {
            setLinkInputOpen(true);
            setKeepOpen(true);
          }}
        />
      ) : (
        <BubbleMenuContent
          editor={editor}
          onKeepOpenChange={setKeepOpen}
          onLinkInputOpenChange={setLinkInputOpen}
          onRequestClose={closeBubbleMenu}
          fontSizes={fontSizes}
          lineHeights={lineHeights}
          initialShowLinkInput={linkInputOpen}
          cellBorderOpenRequest={cellBorderOpenRequest}
        />
      )}
    </div>,
    document.body,
  );
};

export const CustomFloatingMenu = ({ editor }: { editor: Editor }) => {
  const FLOATING_MENU_OFFSET = 16;
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const updatePosition = () => {
      const { state, view } = editor;
      const { $from, empty } = state.selection;

      const isEmptyTextBlock = $from.parent.isTextblock && $from.parent.type.name === "paragraph" && $from.parent.textContent === "" && empty;

      if (!isEmptyTextBlock || !view.hasFocus()) {
        setIsVisible(false);
        return;
      }

      const coords = view.coordsAtPos($from.pos);
      setPosition({ top: coords.top - FLOATING_MENU_OFFSET, left: coords.left });
      setIsVisible(true);
    };

    const handleBlur = () => setIsVisible(false);

    editor.on("selectionUpdate", updatePosition);
    editor.on("focus", updatePosition);
    editor.on("blur", handleBlur);
    editor.on("update", updatePosition);

    return () => {
      editor.off("selectionUpdate", updatePosition);
      editor.off("focus", updatePosition);
      editor.off("blur", handleBlur);
      editor.off("update", updatePosition);
    };
  }, [editor]);

  if (!isVisible) return null;

  return createPortal(
    <div
      data-popover
      className="fixed z-99999 rounded-2xl border border-border/50 bg-card text-card-foreground shadow-lg backdrop-blur-sm overflow-hidden animate-in fade-in-0 slide-in-from-bottom-2"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: "translate(-50%, -100%)",
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <FloatingMenuContent editor={editor} />
    </div>,
    document.body,
  );
};
