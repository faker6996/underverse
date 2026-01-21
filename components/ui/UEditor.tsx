"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenuPlugin } from "@tiptap/extension-bubble-menu";
import { FloatingMenuPlugin } from "@tiptap/extension-floating-menu";
import { createPortal } from "react-dom";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Strike from "@tiptap/extension-strike";
import Underline from "@tiptap/extension-underline";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Blockquote from "@tiptap/extension-blockquote";
import Code from "@tiptap/extension-code";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import History from "@tiptap/extension-history";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import CharacterCount from "@tiptap/extension-character-count";
import Typography from "@tiptap/extension-typography";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { common, createLowlight } from "lowlight";
import { cn } from "@/lib/utils/cn";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  List as ListIcon,
  ListOrdered as ListOrderedIcon,
  Strikethrough as StrikethroughIcon,
  Quote as QuoteIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  Code as CodeIcon,
  Heading1 as Heading1Icon,
  Heading2 as Heading2Icon,
  Heading3 as Heading3Icon,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Underline as UnderlineIcon,
  ListTodo,
  Table as TableIcon,
  Plus,
  Palette,
  Type,
  ChevronDown,
  X,
  Check,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Sparkles,
  FileCode,
  Minus,
  MoreHorizontal,
  Trash2,
  Copy,
  ExternalLink,
  GripVertical,
  ArrowDown,
  ArrowRight,
} from "lucide-react";

// Lowlight setup for code highlighting
const lowlight = createLowlight(common);

// ========== Types ==========
export interface UEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  onHtmlChange?: (html: string) => void;
  onJsonChange?: (json: object) => void;
  placeholder?: string;
  className?: string;
  editable?: boolean;
  autofocus?: boolean;
  showToolbar?: boolean;
  showBubbleMenu?: boolean;
  showFloatingMenu?: boolean;
  showCharacterCount?: boolean;
  maxCharacters?: number;
  minHeight?: number | string;
  maxHeight?: number | string;
  variant?: "default" | "minimal" | "notion";
}

// ========== Color Palette - Using CSS Variables ==========
// ========== Color Palette - Using CSS Variables ==========
const useEditorColors = () => {
  const t = useTranslations("UEditor");

  const textColors = useMemo(
    () => [
      { name: t("colors.default"), color: "inherit", cssClass: "text-foreground" },
      { name: t("colors.muted"), color: "var(--muted-foreground)", cssClass: "text-muted-foreground" },
      { name: t("colors.primary"), color: "var(--primary)", cssClass: "text-primary" },
      { name: t("colors.secondary"), color: "var(--secondary)", cssClass: "text-secondary" },
      { name: t("colors.success"), color: "var(--success)", cssClass: "text-success" },
      { name: t("colors.warning"), color: "var(--warning)", cssClass: "text-warning" },
      { name: t("colors.destructive"), color: "var(--destructive)", cssClass: "text-destructive" },
      { name: t("colors.info"), color: "var(--info)", cssClass: "text-info" },
    ],
    [t],
  );

  const highlightColors = useMemo(
    () => [
      { name: t("colors.default"), color: "", cssClass: "" },
      { name: t("colors.muted"), color: "var(--muted)", cssClass: "bg-muted" },
      { name: t("colors.primary"), color: "color-mix(in oklch, var(--primary) 20%, transparent)", cssClass: "bg-primary/20" },
      { name: t("colors.secondary"), color: "color-mix(in oklch, var(--secondary) 20%, transparent)", cssClass: "bg-secondary/20" },
      { name: t("colors.success"), color: "color-mix(in oklch, var(--success) 20%, transparent)", cssClass: "bg-success/20" },
      { name: t("colors.warning"), color: "color-mix(in oklch, var(--warning) 20%, transparent)", cssClass: "bg-warning/20" },
      { name: t("colors.destructive"), color: "color-mix(in oklch, var(--destructive) 20%, transparent)", cssClass: "bg-destructive/20" },
      { name: t("colors.info"), color: "color-mix(in oklch, var(--info) 20%, transparent)", cssClass: "bg-info/20" },
      { name: t("colors.accent"), color: "var(--accent)", cssClass: "bg-accent" },
    ],
    [t],
  );

  return { textColors, highlightColors };
};

// ========== Toolbar Button Component ==========
const ToolbarButton = React.forwardRef<
  HTMLButtonElement,
  {
    onClick: (e: React.MouseEvent) => void;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title?: string;
    className?: string;
  }
>(({ onClick, active, disabled, children, title, className }, ref) => (
  <button
    ref={ref}
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
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
));
ToolbarButton.displayName = "ToolbarButton";

// ========== Dropdown Menu Component ==========
const DropdownMenu = ({
  trigger,
  children,
  align = "start",
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "start" | "center" | "end";
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            "absolute z-50 mt-2 min-w-50 rounded-xl border bg-popover/95 backdrop-blur-xl p-2 shadow-2xl",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2",
            align === "end" && "right-0",
            align === "center" && "left-1/2 -translate-x-1/2",
          )}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
};

// ========== Menu Item Component ==========
const MenuItem = ({
  icon: Icon,
  label,
  onClick,
  active,
  shortcut,
  disabled = false,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  active?: boolean;
  shortcut?: string;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "flex items-center w-full px-3 py-2 rounded-lg text-sm transition-all",
      "hover:bg-accent group",
      active && "bg-primary/10 text-primary",
      disabled && "opacity-40 cursor-not-allowed hover:bg-transparent",
    )}
  >
    {Icon && <Icon className="w-4 h-4 mr-3 opacity-60 group-hover:opacity-100" />}
    <span className="flex-1 text-left">{label}</span>
    {shortcut && <span className="ml-2 text-xs text-muted-foreground opacity-60">{shortcut}</span>}
    {active && <Check className="w-4 h-4 ml-2 text-primary" />}
  </button>
);

// ========== Color Picker Component ==========
const ColorPicker = ({
  colors,
  currentColor,
  onSelect,
  label,
}: {
  colors: { name: string; color: string; cssClass?: string }[];
  currentColor: string;
  onSelect: (color: string) => void;
  label: string;
}) => (
  <div className="p-2">
    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">{label}</span>
    <div className="grid grid-cols-4 gap-1.5 mt-2">
      {colors.map((c) => (
        <button
          key={c.name}
          type="button"
          onClick={() => onSelect(c.color)}
          className={cn(
            "flex items-center justify-center w-9 h-9 rounded-lg border-2 transition-all hover:scale-105",
            currentColor === c.color ? "border-primary ring-2 ring-primary/20" : "border-border/50 hover:border-primary/50",
          )}
          style={{ backgroundColor: c.color || "transparent" }}
          title={c.name}
        >
          {c.color === "" && <X className="w-4 h-4 text-muted-foreground" />}
          {c.color === "inherit" && <span className="text-xs font-medium">A</span>}
        </button>
      ))}
    </div>
  </div>
);

// ========== Divider Component ==========
const ToolbarDivider = () => <div className="w-px h-6 bg-border/50 mx-1" />;

// ========== Link Input Component ==========
const LinkInput = ({ onSubmit, onCancel, initialUrl = "" }: { onSubmit: (url: string) => void; onCancel: () => void; initialUrl?: string }) => {
  const t = useTranslations("UEditor");
  const [url, setUrl] = useState(initialUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      onSubmit(url.startsWith("http") ? url : `https://${url}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2">
      <input
        ref={inputRef}
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder={t("linkInput.placeholder")}
        className="flex-1 px-3 py-2 text-sm bg-muted/50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      <button type="submit" className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
        <Check className="w-4 h-4" />
      </button>
      <button type="button" onClick={onCancel} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
        <X className="w-4 h-4" />
      </button>
    </form>
  );
};

// ========== Image Input Component ==========
const ImageInput = ({ onSubmit, onCancel }: { onSubmit: (url: string, alt?: string) => void; onCancel: () => void }) => {
  const t = useTranslations("UEditor");
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) {
      onSubmit(url, alt);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 space-y-3">
      <div>
        <label className="text-xs font-medium text-muted-foreground">{t("imageInput.urlLabel")}</label>
        <input
          ref={inputRef}
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={t("imageInput.urlPlaceholder")}
          className="w-full mt-1 px-3 py-2 text-sm bg-muted/50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">{t("imageInput.altLabel")}</label>
        <input
          type="text"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder={t("imageInput.altPlaceholder")}
          className="w-full mt-1 px-3 py-2 text-sm bg-muted/50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!url}
          className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {t("imageInput.addBtn")}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
          {t("imageInput.cancelBtn")}
        </button>
      </div>
    </form>
  );
};

// ========== Slash Command Menu ==========
const SlashCommandMenu = ({ editor, onClose }: { editor: any; onClose: () => void }) => {
  const t = useTranslations("UEditor");

  const commands = [
    { icon: Type, label: t("slashCommand.text"), description: t("slashCommand.textDesc"), action: () => editor.chain().focus().setParagraph().run() },
    {
      icon: Heading1Icon,
      label: t("slashCommand.heading1"),
      description: t("slashCommand.heading1Desc"),
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      icon: Heading2Icon,
      label: t("slashCommand.heading2"),
      description: t("slashCommand.heading2Desc"),
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      icon: Heading3Icon,
      label: t("slashCommand.heading3"),
      description: t("slashCommand.heading3Desc"),
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      icon: ListIcon,
      label: t("slashCommand.bulletList"),
      description: t("slashCommand.bulletListDesc"),
      action: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      icon: ListOrderedIcon,
      label: t("slashCommand.orderedList"),
      description: t("slashCommand.orderedListDesc"),
      action: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      icon: ListTodo,
      label: t("slashCommand.todoList"),
      description: t("slashCommand.todoListDesc"),
      action: () => editor.chain().focus().toggleTaskList().run(),
    },
    {
      icon: QuoteIcon,
      label: t("slashCommand.quote"),
      description: t("slashCommand.quoteDesc"),
      action: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      icon: FileCode,
      label: t("slashCommand.codeBlock"),
      description: t("slashCommand.codeBlockDesc"),
      action: () => editor.chain().focus().toggleCodeBlock().run(),
    },
    {
      icon: Minus,
      label: t("slashCommand.divider"),
      description: t("slashCommand.dividerDesc"),
      action: () => editor.chain().focus().setHorizontalRule().run(),
    },
    {
      icon: TableIcon,
      label: t("slashCommand.table"),
      description: t("slashCommand.tableDesc"),
      action: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
  ];

  return (
    <div className="w-72 max-h-80 overflow-y-auto">
      <div className="px-3 py-2 border-b">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("slashCommand.basicBlocks")}</span>
      </div>
      <div className="p-1">
        {commands.map((cmd) => (
          <button
            key={cmd.label}
            type="button"
            onClick={() => {
              cmd.action();
              onClose();
            }}
            className="flex items-center w-full px-3 py-2.5 rounded-lg hover:bg-accent transition-colors group"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted/50 group-hover:bg-muted mr-3">
              <cmd.icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="text-left">
              <div className="text-sm font-medium">{cmd.label}</div>
              <div className="text-xs text-muted-foreground">{cmd.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ========== Floating Menu Content ==========
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FloatingMenuContent = ({ editor }: { editor: any }) => {
  const t = useTranslations("UEditor");
  const [showCommands, setShowCommands] = useState(false);

  if (showCommands) {
    return <SlashCommandMenu editor={editor} onClose={() => setShowCommands(false)} />;
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

// ========== Bubble Menu Content ==========
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BubbleMenuContent = ({ editor }: { editor: any }) => {
  const t = useTranslations("UEditor");
  const { textColors, highlightColors } = useEditorColors();
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  if (showLinkInput) {
    return (
      <LinkInput
        initialUrl={editor.getAttributes("link").href || ""}
        onSubmit={(url) => {
          editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }}
        onCancel={() => setShowLinkInput(false)}
      />
    );
  }

  if (showColorPicker) {
    return (
      <div className="w-48">
        <ColorPicker
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
        <ColorPicker
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
            onClick={() => setShowColorPicker(false)}
            className="w-full py-1.5 text-sm rounded-lg hover:bg-muted transition-colors"
          >
            {t("colors.done")}
          </button>
        </div>
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

      <ToolbarDivider />

      <ToolbarButton onClick={() => setShowLinkInput(true)} active={editor.isActive("link")} title={t("toolbar.link")}>
        <LinkIcon className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton onClick={() => setShowColorPicker(true)} title={t("colors.textColor")}>
        <Palette className="w-4 h-4" />
      </ToolbarButton>

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
    </div>
  );
};

// ========== Custom Bubble Menu Component ==========
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomBubbleMenu = ({ editor }: { editor: any }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePosition = () => {
      const { state, view } = editor;
      const { from, to, empty } = state.selection;

      if (empty || !view.hasFocus()) {
        setIsVisible(false);
        return;
      }

      // Get selection coordinates
      const start = view.coordsAtPos(from);
      const end = view.coordsAtPos(to);

      // Calculate menu position (center above selection)
      const left = (start.left + end.left) / 2;
      const top = start.top - 10;

      setPosition({ top, left });
      setIsVisible(true);
    };

    editor.on("selectionUpdate", updatePosition);
    editor.on("focus", updatePosition);
    editor.on("blur", () => setIsVisible(false));

    return () => {
      editor.off("selectionUpdate", updatePosition);
      editor.off("focus", updatePosition);
      editor.off("blur", () => setIsVisible(false));
    };
  }, [editor]);

  if (!isVisible) return null;

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-50 flex rounded-xl border bg-popover/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: "translate(-50%, -100%)",
      }}
    >
      <BubbleMenuContent editor={editor} />
    </div>,
    document.body,
  );
};

// ========== Custom Floating Menu Component ==========
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomFloatingMenu = ({ editor }: { editor: any }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const updatePosition = () => {
      const { state, view } = editor;
      const { $from, empty } = state.selection;

      // Check if current line is empty
      const isEmptyTextBlock = $from.parent.isTextblock && $from.parent.type.name === "paragraph" && $from.parent.textContent === "" && empty;

      if (!isEmptyTextBlock || !view.hasFocus()) {
        setIsVisible(false);
        return;
      }

      // Get cursor position
      const coords = view.coordsAtPos($from.pos);
      setPosition({ top: coords.top, left: coords.left - 40 });
      setIsVisible(true);
    };

    editor.on("selectionUpdate", updatePosition);
    editor.on("focus", updatePosition);
    editor.on("blur", () => setIsVisible(false));
    editor.on("update", updatePosition);

    return () => {
      editor.off("selectionUpdate", updatePosition);
      editor.off("focus", updatePosition);
      editor.off("blur", () => setIsVisible(false));
      editor.off("update", updatePosition);
    };
  }, [editor]);

  if (!isVisible) return null;

  return createPortal(
    <div
      className="fixed z-50 rounded-xl border bg-popover/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-in fade-in-0 slide-in-from-left-2"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: "translateY(-50%)",
      }}
    >
      <FloatingMenuContent editor={editor} />
    </div>,
    document.body,
  );
};

// ========== Main Editor Toolbar ==========
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EditorToolbar = ({ editor, variant }: { editor: any; variant: string }) => {
  const t = useTranslations("UEditor");
  const { textColors, highlightColors } = useEditorColors();
  const [showImageInput, setShowImageInput] = useState(false);

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
      {/* Text Style */}
      <DropdownMenu
        trigger={
          <ToolbarButton onClick={() => {}} title={t("toolbar.textStyle")} className="px-2 w-auto gap-1">
            <Type className="w-4 h-4" />
            <ChevronDown className="w-3 h-3" />
          </ToolbarButton>
        }
      >
        <MenuItem
          icon={Type}
          label={t("toolbar.normal")}
          onClick={() => editor.chain().focus().setParagraph().run()}
          active={editor.isActive("paragraph")}
        />
        <MenuItem
          icon={Heading1Icon}
          label={t("toolbar.heading1")}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          shortcut="Ctrl+Alt+1"
        />
        <MenuItem
          icon={Heading2Icon}
          label={t("toolbar.heading2")}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          shortcut="Ctrl+Alt+2"
        />
        <MenuItem
          icon={Heading3Icon}
          label={t("toolbar.heading3")}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          shortcut="Ctrl+Alt+3"
        />
      </DropdownMenu>

      <ToolbarDivider />

      {/* Basic Formatting */}
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

      {/* Colors */}
      <DropdownMenu
        trigger={
          <ToolbarButton onClick={() => {}} title={t("colors.textColor")}>
            <Palette className="w-4 h-4" />
            <ChevronDown className="w-3 h-3" />
          </ToolbarButton>
        }
      >
        <ColorPicker
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
          <ToolbarButton onClick={() => {}} active={editor.isActive("highlight")} title={t("colors.highlight")}>
            <Highlighter className="w-4 h-4" />
            <ChevronDown className="w-3 h-3" />
          </ToolbarButton>
        }
      >
        <ColorPicker
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

      {/* Alignment */}
      <DropdownMenu
        trigger={
          <ToolbarButton onClick={() => {}} title={t("toolbar.alignment")}>
            <AlignLeft className="w-4 h-4" />
            <ChevronDown className="w-3 h-3" />
          </ToolbarButton>
        }
      >
        <MenuItem
          icon={AlignLeft}
          label={t("toolbar.alignLeft")}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
        />
        <MenuItem
          icon={AlignCenter}
          label={t("toolbar.alignCenter")}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
        />
        <MenuItem
          icon={AlignRight}
          label={t("toolbar.alignRight")}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
        />
        <MenuItem
          icon={AlignJustify}
          label={t("toolbar.justify")}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          active={editor.isActive({ textAlign: "justify" })}
        />
      </DropdownMenu>

      <ToolbarDivider />

      {/* Lists */}
      <DropdownMenu
        trigger={
          <ToolbarButton onClick={() => {}} title={t("toolbar.bulletList")}>
            <ListIcon className="w-4 h-4" />
            <ChevronDown className="w-3 h-3" />
          </ToolbarButton>
        }
      >
        <MenuItem
          icon={ListIcon}
          label={t("toolbar.bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          shortcut="Ctrl+Shift+8"
        />
        <MenuItem
          icon={ListOrderedIcon}
          label={t("toolbar.orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          shortcut="Ctrl+Shift+7"
        />
        <MenuItem
          icon={ListTodo}
          label={t("toolbar.taskList")}
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          active={editor.isActive("taskList")}
          shortcut="Ctrl+Shift+9"
        />
      </DropdownMenu>

      {/* Blocks */}
      <DropdownMenu
        trigger={
          <ToolbarButton onClick={() => {}} title={t("toolbar.quote")}>
            <QuoteIcon className="w-4 h-4" />
            <ChevronDown className="w-3 h-3" />
          </ToolbarButton>
        }
      >
        <MenuItem
          icon={QuoteIcon}
          label={t("toolbar.quote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          shortcut="Ctrl+Shift+B"
        />
        <MenuItem
          icon={FileCode}
          label={t("toolbar.codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          shortcut="Ctrl+Alt+C"
        />
      </DropdownMenu>

      {/* Image */}
      <DropdownMenu
        trigger={
          <ToolbarButton onClick={() => {}} title={t("toolbar.image")}>
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
          <MenuItem icon={LinkIcon} label={t("imageInput.addFromUrl")} onClick={() => setShowImageInput(true)} />
        )}
      </DropdownMenu>

      {/* Table */}
      <DropdownMenu
        trigger={
          <ToolbarButton onClick={() => {}} title={t("toolbar.table")}>
            <TableIcon className="w-4 h-4" />
            <ChevronDown className="w-3 h-3" />
          </ToolbarButton>
        }
      >
        <MenuItem
          icon={TableIcon}
          label={t("tableMenu.insert3x3")}
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        />
        <div className="my-1 border-t" />
        <MenuItem
          icon={ArrowDown}
          label={t("tableMenu.addColumnBefore")}
          onClick={() => editor.chain().focus().addColumnBefore().run()}
          disabled={!editor.can().addColumnBefore()}
        />
        <MenuItem
          icon={ArrowDown}
          label={t("tableMenu.addColumnAfter")}
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          disabled={!editor.can().addColumnAfter()}
        />
        <MenuItem
          icon={ArrowRight}
          label={t("tableMenu.addRowBefore")}
          onClick={() => editor.chain().focus().addRowBefore().run()}
          disabled={!editor.can().addRowBefore()}
        />
        <MenuItem
          icon={ArrowRight}
          label={t("tableMenu.addRowAfter")}
          onClick={() => editor.chain().focus().addRowAfter().run()}
          disabled={!editor.can().addRowAfter()}
        />
        <div className="my-1 border-t" />
        <MenuItem
          icon={Trash2}
          label={t("tableMenu.deleteColumn")}
          onClick={() => editor.chain().focus().deleteColumn().run()}
          disabled={!editor.can().deleteColumn()}
        />
        <MenuItem
          icon={Trash2}
          label={t("tableMenu.deleteRow")}
          onClick={() => editor.chain().focus().deleteRow().run()}
          disabled={!editor.can().deleteRow()}
        />
        <MenuItem
          icon={Trash2}
          label={t("tableMenu.deleteTable")}
          onClick={() => editor.chain().focus().deleteTable().run()}
          disabled={!editor.can().deleteTable()}
        />
      </DropdownMenu>

      <ToolbarDivider />

      {/* History */}
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title={t("toolbar.undo")}>
        <UndoIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title={t("toolbar.redo")}>
        <RedoIcon className="w-4 h-4" />
      </ToolbarButton>
    </div>
  );
};

// ========== Character Count ==========
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CharacterCountDisplay = ({ editor, maxCharacters }: { editor: any; maxCharacters?: number }) => {
  const t = useTranslations("UEditor");
  if (!editor) return null;

  const characterCount = editor.storage.characterCount.characters();
  const wordCount = editor.storage.characterCount.words();
  const percentage = maxCharacters ? Math.round((characterCount / maxCharacters) * 100) : 0;

  return (
    <div className="flex items-center gap-3 px-3 py-2 text-xs text-muted-foreground border-t bg-muted/20">
      <span>
        {wordCount} {t("words")}
      </span>
      <span>
        {characterCount} {t("characters")}
      </span>
      {maxCharacters && (
        <span className={cn(percentage > 90 && "text-destructive", percentage > 100 && "font-bold")}>
          {characterCount}/{maxCharacters}
        </span>
      )}
    </div>
  );
};

// ========== Main UEditor Component ==========
const UEditor = ({
  content = "",
  onChange,
  onHtmlChange,
  onJsonChange,
  placeholder,
  className,
  editable = true,
  autofocus = false,
  showToolbar = true,
  showBubbleMenu = true,
  showFloatingMenu = true,
  showCharacterCount = true,
  maxCharacters,
  minHeight = "200px",
  maxHeight = "auto",
  variant = "default",
}: UEditorProps) => {
  const t = useTranslations("UEditor");
  const effectivePlaceholder = placeholder ?? t("placeholder");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Strike,
      Underline,
      Subscript,
      Superscript,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      BulletList,
      OrderedList,
      ListItem,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class: "border-l-4 border-primary/30 pl-4 italic",
        },
      }),
      Code.configure({
        HTMLAttributes: {
          class: "px-1.5 py-0.5 rounded bg-muted font-mono text-sm",
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: "rounded-lg bg-[#1e1e1e] p-4 font-mono text-sm overflow-x-auto",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-2 hover:text-primary/80 cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto my-4",
        },
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse w-full my-4",
        },
      }),
      TableRow,
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-border p-2 min-w-[100px]",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-border p-2 bg-muted font-semibold min-w-[100px]",
        },
      }),
      CharacterCount.configure({
        limit: maxCharacters,
      }),
      Typography,
      History,
      Placeholder.configure({
        placeholder: effectivePlaceholder,
        emptyEditorClass: "is-editor-empty",
        emptyNodeClass: "is-empty",
      }),
    ],
    content,
    editable,
    autofocus,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose dark:prose-invert max-w-none",
          "focus:outline-none",
          "px-4 py-4",
          "[&_.is-editor-empty]:before:content-[attr(data-placeholder)]",
          "[&_.is-editor-empty]:before:text-muted-foreground/50",
          "[&_.is-editor-empty]:before:float-left",
          "[&_.is-editor-empty]:before:pointer-events-none",
          "[&_.is-editor-empty]:before:h-0",
          "[&_ul[data-type='taskList']]:list-none",
          "[&_ul[data-type='taskList']]:pl-0",
          "[&_ul[data-type='taskList']_li]:flex",
          "[&_ul[data-type='taskList']_li]:items-start",
          "[&_ul[data-type='taskList']_li]:gap-2",
          "[&_ul[data-type='taskList']_li>label]:mt-0.5",
          "[&_ul[data-type='taskList']_li>label>input]:w-4",
          "[&_ul[data-type='taskList']_li>label>input]:h-4",
          "[&_ul[data-type='taskList']_li>label>input]:rounded",
          "[&_ul[data-type='taskList']_li>label>input]:border-2",
          "[&_ul[data-type='taskList']_li>label>input]:border-primary/50",
          "[&_ul[data-type='taskList']_li>label>input]:accent-primary",
          "[&_pre]:!bg-[#1e1e1e]",
          "[&_pre]:!text-[#d4d4d4]",
          "[&_pre_code]:!bg-transparent",
          "[&_hr]:border-t-2",
          "[&_hr]:border-border/50",
          "[&_hr]:my-6",
        ),
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
      onHtmlChange?.(html);
      onJsonChange?.(editor.getJSON());
    },
  });

  // Sync content if prop changes externally
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      if (editor.isEmpty && content) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div
        className={cn("w-full rounded-lg border bg-background flex items-center justify-center text-muted-foreground", className)}
        style={{ minHeight }}
      >
        {t("loading")}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border bg-background overflow-hidden",
        "transition-all duration-300",
        "focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50",
        variant === "notion" && "shadow-sm hover:shadow-md",
        className,
      )}
    >
      {/* Toolbar */}
      {editable && showToolbar && <EditorToolbar editor={editor} variant={variant} />}

      {/* Custom Bubble Menu - appears when text is selected */}
      {editable && showBubbleMenu && <CustomBubbleMenu editor={editor} />}

      {/* Custom Floating Menu - appears on empty lines */}
      {editable && showFloatingMenu && <CustomFloatingMenu editor={editor} />}

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="flex-1 overflow-y-auto"
        style={{
          minHeight,
          maxHeight,
        }}
      />

      {/* Character Count */}
      {showCharacterCount && <CharacterCountDisplay editor={editor} maxCharacters={maxCharacters} />}
    </div>
  );
};

export default UEditor;
