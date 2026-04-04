"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Editor } from "@tiptap/core";
import { createPortal } from "react-dom";
import { useSmartTranslations } from "../../hooks/useSmartTranslations";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold as BoldIcon,
  Code as CodeIcon,
  Italic as ItalicIcon,
  Link as LinkIcon,
  Palette,
  Plus,
  RotateCcw,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Trash2,
  Underline as UnderlineIcon,
  Strikethrough as StrikethroughIcon,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { ToolbarButton } from "./toolbar";
import { LinkInput } from "./inputs";
import { EditorColorPalette, useEditorColors } from "./colors";
import { applyImageLayout, applyImageWidthPreset, deleteSelectedImage, resetImageSize, type UEditorImageWidthPreset } from "./image-commands";
import { buildSlashCommandItems, buildSlashCommandMessages, SlashCommandList, type SlashCommandListRef } from "./slash-command";
import type { UEditorFontSizeOption, UEditorLineHeightOption } from "./types";
import { getDefaultFontSizes, getDefaultLineHeights, normalizeStyleValue } from "./typography-options";

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

const BubbleMenuContent = ({
  editor,
  onKeepOpenChange,
  fontSizes,
  lineHeights,
}: {
  editor: Editor;
  onKeepOpenChange?: (keepOpen: boolean) => void;
  fontSizes?: UEditorFontSizeOption[];
  lineHeights?: UEditorLineHeightOption[];
}) => {
  const t = useSmartTranslations("UEditor");
  const { textColors, highlightColors } = useEditorColors();
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showEditorColorPalette, setShowEditorColorPalette] = useState(false);
  const isImageSelected = editor.isActive("image");
  const imageAttrs = editor.getAttributes("image") as { imageLayout?: string; imageWidthPreset?: UEditorImageWidthPreset | null };
  const imageLayout = imageAttrs.imageLayout === "left" || imageAttrs.imageLayout === "right" ? imageAttrs.imageLayout : "block";
  const imageWidthPreset = imageAttrs.imageWidthPreset === "sm" || imageAttrs.imageWidthPreset === "md" || imageAttrs.imageWidthPreset === "lg"
    ? imageAttrs.imageWidthPreset
    : null;
  const textStyleAttrs = editor.getAttributes("textStyle") as { fontSize?: string; lineHeight?: string };
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

  useEffect(() => {
    onKeepOpenChange?.(showLinkInput);
  }, [onKeepOpenChange, showLinkInput]);

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
          editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
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

  if (showEditorColorPalette) {
    return (
      <div className="w-48">
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
        <div className="border-t my-1" />
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
        <div className="p-2 border-t">
          <button
            type="button"
            onClick={() => setShowEditorColorPalette(false)}
            className="w-full py-1.5 text-sm rounded-lg hover:bg-muted transition-colors"
          >
            {t("colors.done")}
          </button>
        </div>
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
        <ToolbarButton onClick={() => deleteSelectedImage(editor)} title={t("toolbar.imageDelete")} className="text-destructive hover:text-destructive">
          <Trash2 className="w-4 h-4" />
        </ToolbarButton>
      </div>
    );
  }

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

      <ToolbarButton onClick={() => setShowEditorColorPalette(true)} title={t("colors.textColor")}>
        <Palette className="w-4 h-4" />
      </ToolbarButton>

      <div className="w-px h-6 bg-border/50 mx-1" />

      <ToolbarButton
        onClick={() => editor.chain().focus().unsetFontSize().run()}
        active={!currentFontSize}
        title={t("toolbar.sizeDefault")}
        className="px-2 w-auto"
      >
        <span className="text-[10px] font-semibold">A</span>
      </ToolbarButton>
      {quickFontSizes.map((option) => (
        <ToolbarButton
          key={option.value}
          onClick={() => editor.chain().focus().setFontSize(option.value).run()}
          active={normalizeStyleValue(option.value) === currentFontSize}
          title={`${t("toolbar.fontSize")} ${option.label}`}
          className="px-2 w-auto"
        >
          <span className="text-[10px] font-semibold">{option.label}</span>
        </ToolbarButton>
      ))}

      <div className="w-px h-6 bg-border/50 mx-1" />

      <ToolbarButton
        onClick={() => editor.chain().focus().unsetLineHeight().run()}
        active={!currentLineHeight}
        title={t("toolbar.lineHeightDefault")}
        className="px-2 w-auto"
      >
        <span className="text-[10px] font-semibold leading-none">LH</span>
      </ToolbarButton>
      {quickLineHeights.map((option) => (
        <ToolbarButton
          key={option.value}
          onClick={() => editor.chain().focus().setLineHeight(option.value).run()}
          active={normalizeStyleValue(option.value) === currentLineHeight}
          title={`${t("toolbar.lineHeight")} ${option.label}`}
          className="px-2 w-auto"
        >
          <span className="text-[10px] font-semibold">{option.label}</span>
        </ToolbarButton>
      ))}

      <div className="w-px h-6 bg-border/50 mx-1" />

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
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const keepOpenRef = useRef(false);
  const showTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setKeepOpen = useCallback((next: boolean) => {
    keepOpenRef.current = next;
    if (next) setIsVisible(true);
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

      if (!keepOpenRef.current && (empty || !view.hasFocus())) {
        clearShowTimeout();
        setIsVisible(false);
        return;
      }

      const start = view.coordsAtPos(from);
      const end = view.coordsAtPos(to);

      const left = (start.left + end.left) / 2;
      const top = start.top - BUBBLE_MENU_OFFSET;

      setPosition({ top, left });
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

    return () => {
      clearShowTimeout();
      editor.off("selectionUpdate", updatePosition);
      editor.off("focus", updatePosition);
      editor.off("blur", handleBlur);
    };
  }, [editor]);

  if (!isVisible) return null;

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-50 flex rounded-2xl border border-border/50 bg-card text-card-foreground shadow-lg backdrop-blur-sm overflow-hidden animate-in fade-in-0 zoom-in-95"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: "translate(-50%, -100%)",
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <BubbleMenuContent
        editor={editor}
        onKeepOpenChange={setKeepOpen}
        fontSizes={fontSizes}
        lineHeights={lineHeights}
      />
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

      const isEmptyTextBlock =
        $from.parent.isTextblock && $from.parent.type.name === "paragraph" && $from.parent.textContent === "" && empty;

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
      className="fixed z-50 rounded-2xl border border-border/50 bg-card text-card-foreground shadow-lg backdrop-blur-sm overflow-hidden animate-in fade-in-0 slide-in-from-bottom-2"
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
