"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  minHeight?: number;
  maxHeight?: number;
  variant?: "default" | "minimal" | "notion";
}

// ========== Color Palette - Using CSS Variables ==========
const TEXT_COLORS = [
  { name: "Default", color: "inherit", cssClass: "text-foreground" },
  { name: "Muted", color: "var(--muted-foreground)", cssClass: "text-muted-foreground" },
  { name: "Primary", color: "var(--primary)", cssClass: "text-primary" },
  { name: "Secondary", color: "var(--secondary)", cssClass: "text-secondary" },
  { name: "Success", color: "var(--success)", cssClass: "text-success" },
  { name: "Warning", color: "var(--warning)", cssClass: "text-warning" },
  { name: "Destructive", color: "var(--destructive)", cssClass: "text-destructive" },
  { name: "Info", color: "var(--info)", cssClass: "text-info" },
];

const HIGHLIGHT_COLORS = [
  { name: "Default", color: "", cssClass: "" },
  { name: "Muted", color: "var(--muted)", cssClass: "bg-muted" },
  { name: "Primary", color: "color-mix(in oklch, var(--primary) 20%, transparent)", cssClass: "bg-primary/20" },
  { name: "Secondary", color: "color-mix(in oklch, var(--secondary) 20%, transparent)", cssClass: "bg-secondary/20" },
  { name: "Success", color: "color-mix(in oklch, var(--success) 20%, transparent)", cssClass: "bg-success/20" },
  { name: "Warning", color: "color-mix(in oklch, var(--warning) 20%, transparent)", cssClass: "bg-warning/20" },
  { name: "Destructive", color: "color-mix(in oklch, var(--destructive) 20%, transparent)", cssClass: "bg-destructive/20" },
  { name: "Info", color: "color-mix(in oklch, var(--info) 20%, transparent)", cssClass: "bg-info/20" },
  { name: "Accent", color: "var(--accent)", cssClass: "bg-accent" },
];

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
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  active?: boolean;
  shortcut?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      "flex items-center w-full px-3 py-2 rounded-lg text-sm transition-all",
      "hover:bg-accent group",
      active && "bg-primary/10 text-primary",
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
        placeholder="Paste or type a link..."
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
        <label className="text-xs font-medium text-muted-foreground">Image URL</label>
        <input
          ref={inputRef}
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full mt-1 px-3 py-2 text-sm bg-muted/50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">Alt text (optional)</label>
        <input
          type="text"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="Describe the image..."
          className="w-full mt-1 px-3 py-2 text-sm bg-muted/50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!url}
          className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          Add Image
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
          Cancel
        </button>
      </div>
    </form>
  );
};

// ========== Slash Command Menu ==========
const SlashCommandMenu = ({
  editor,
  onClose,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor: any;
  onClose: () => void;
}) => {
  const commands = [
    { icon: Type, label: "Text", description: "Plain text block", action: () => editor.chain().focus().setParagraph().run() },
    {
      icon: Heading1Icon,
      label: "Heading 1",
      description: "Large section heading",
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      icon: Heading2Icon,
      label: "Heading 2",
      description: "Medium section heading",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      icon: Heading3Icon,
      label: "Heading 3",
      description: "Small section heading",
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    { icon: ListIcon, label: "Bullet List", description: "Simple bulleted list", action: () => editor.chain().focus().toggleBulletList().run() },
    { icon: ListOrderedIcon, label: "Numbered List", description: "Numbered list", action: () => editor.chain().focus().toggleOrderedList().run() },
    { icon: ListTodo, label: "To-do List", description: "Checkboxes for tasks", action: () => editor.chain().focus().toggleTaskList().run() },
    { icon: QuoteIcon, label: "Quote", description: "Capture a quote", action: () => editor.chain().focus().toggleBlockquote().run() },
    {
      icon: FileCode,
      label: "Code Block",
      description: "Code with syntax highlighting",
      action: () => editor.chain().focus().toggleCodeBlock().run(),
    },
    { icon: Minus, label: "Divider", description: "Visual divider", action: () => editor.chain().focus().setHorizontalRule().run() },
    {
      icon: TableIcon,
      label: "Table",
      description: "Add a table",
      action: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
  ];

  return (
    <div className="w-72 max-h-80 overflow-y-auto">
      <div className="px-3 py-2 border-b">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Basic Blocks</span>
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
      <span className="text-sm text-muted-foreground group-hover:text-foreground">Add block</span>
    </button>
  );
};

// ========== Bubble Menu Content ==========
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BubbleMenuContent = ({ editor }: { editor: any }) => {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  if (showLinkInput) {
    return (
      <LinkInput
        initialUrl={editor.getAttributes("link").href || ""}
        onSubmit={(url) => {
          editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
          setShowLinkInput(false);
        }}
        onCancel={() => setShowLinkInput(false)}
      />
    );
  }

  if (showColorPicker) {
    return (
      <div className="w-48">
        <ColorPicker
          colors={TEXT_COLORS}
          currentColor={editor.getAttributes("textStyle").color || "inherit"}
          onSelect={(color) => {
            if (color === "inherit") {
              editor.chain().focus().unsetColor().run();
            } else {
              editor.chain().focus().setColor(color).run();
            }
          }}
          label="Text Color"
        />
        <div className="border-t my-1" />
        <ColorPicker
          colors={HIGHLIGHT_COLORS}
          currentColor={editor.getAttributes("highlight").color || ""}
          onSelect={(color) => {
            if (color === "") {
              editor.chain().focus().unsetHighlight().run();
            } else {
              editor.chain().focus().toggleHighlight({ color }).run();
            }
          }}
          label="Highlight"
        />
        <div className="p-2 border-t">
          <button
            type="button"
            onClick={() => setShowColorPicker(false)}
            className="w-full py-1.5 text-sm rounded-lg hover:bg-muted transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0.5 p-1">
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
        <BoldIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
        <ItalicIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
        <UnderlineIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
        <StrikethroughIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Code">
        <CodeIcon className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton onClick={() => setShowLinkInput(true)} active={editor.isActive("link")} title="Link">
        <LinkIcon className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton onClick={() => setShowColorPicker(true)} title="Colors">
        <Palette className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      <ToolbarButton onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive("subscript")} title="Subscript">
        <SubscriptIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive("superscript")} title="Superscript">
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
  const [showImageInput, setShowImageInput] = useState(false);

  if (variant === "minimal") {
    return (
      <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
          <BoldIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
          <ItalicIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="List">
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
          <ToolbarButton onClick={() => {}} title="Text Style" className="px-2 w-auto gap-1">
            <Type className="w-4 h-4" />
            <ChevronDown className="w-3 h-3" />
          </ToolbarButton>
        }
      >
        <MenuItem icon={Type} label="Normal text" onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive("paragraph")} />
        <MenuItem
          icon={Heading1Icon}
          label="Heading 1"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          shortcut="Ctrl+Alt+1"
        />
        <MenuItem
          icon={Heading2Icon}
          label="Heading 2"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          shortcut="Ctrl+Alt+2"
        />
        <MenuItem
          icon={Heading3Icon}
          label="Heading 3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          shortcut="Ctrl+Alt+3"
        />
      </DropdownMenu>

      <ToolbarDivider />

      {/* Basic Formatting */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold (Ctrl+B)">
        <BoldIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic (Ctrl+I)">
        <ItalicIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline (Ctrl+U)">
        <UnderlineIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
        <StrikethroughIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Inline Code">
        <CodeIcon className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Colors */}
      <DropdownMenu
        trigger={
          <ToolbarButton onClick={() => {}} title="Text Color">
            <Palette className="w-4 h-4" />
          </ToolbarButton>
        }
      >
        <ColorPicker
          colors={TEXT_COLORS}
          currentColor={editor.getAttributes("textStyle").color || "inherit"}
          onSelect={(color) => {
            if (color === "inherit") {
              editor.chain().focus().unsetColor().run();
            } else {
              editor.chain().focus().setColor(color).run();
            }
          }}
          label="Text Color"
        />
      </DropdownMenu>

      <DropdownMenu
        trigger={
          <ToolbarButton onClick={() => {}} active={editor.isActive("highlight")} title="Highlight">
            <Highlighter className="w-4 h-4" />
          </ToolbarButton>
        }
      >
        <ColorPicker
          colors={HIGHLIGHT_COLORS}
          currentColor={editor.getAttributes("highlight").color || ""}
          onSelect={(color) => {
            if (color === "") {
              editor.chain().focus().unsetHighlight().run();
            } else {
              editor.chain().focus().toggleHighlight({ color }).run();
            }
          }}
          label="Highlight"
        />
      </DropdownMenu>

      <ToolbarDivider />

      {/* Alignment */}
      <DropdownMenu
        trigger={
          <ToolbarButton onClick={() => {}} title="Alignment">
            <AlignLeft className="w-4 h-4" />
          </ToolbarButton>
        }
      >
        <MenuItem
          icon={AlignLeft}
          label="Align Left"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
        />
        <MenuItem
          icon={AlignCenter}
          label="Align Center"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
        />
        <MenuItem
          icon={AlignRight}
          label="Align Right"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
        />
        <MenuItem
          icon={AlignJustify}
          label="Justify"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          active={editor.isActive({ textAlign: "justify" })}
        />
      </DropdownMenu>

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">
        <ListIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered List">
        <ListOrderedIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive("taskList")} title="Task List">
        <ListTodo className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Blocks */}
      <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote">
        <QuoteIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code Block">
        <FileCode className="w-4 h-4" />
      </ToolbarButton>

      {/* Image */}
      <DropdownMenu
        trigger={
          <ToolbarButton onClick={() => {}} title="Insert Image">
            <ImageIcon className="w-4 h-4" />
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
          <div className="p-2">
            <button type="button" onClick={() => setShowImageInput(true)} className="flex items-center w-full px-3 py-2 rounded-lg hover:bg-accent">
              <LinkIcon className="w-4 h-4 mr-2" />
              <span className="text-sm">Add from URL</span>
            </button>
          </div>
        )}
      </DropdownMenu>

      {/* Table */}
      <DropdownMenu
        trigger={
          <ToolbarButton onClick={() => {}} title="Insert Table" active={editor.isActive("table")}>
            <TableIcon className="w-4 h-4" />
          </ToolbarButton>
        }
      >
        <div className="p-2 space-y-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            className="flex items-center w-full px-3 py-2 rounded-lg hover:bg-accent text-sm"
          >
            <TableIcon className="w-4 h-4 mr-2" />
            Insert 3×3 Table
          </button>
          {editor.isActive("table") && (
            <>
              <div className="border-t my-2" />
              <button
                type="button"
                onClick={() => editor.chain().focus().addColumnBefore().run()}
                className="flex items-center w-full px-3 py-2 rounded-lg hover:bg-accent text-sm"
              >
                Add Column Before
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                className="flex items-center w-full px-3 py-2 rounded-lg hover:bg-accent text-sm"
              >
                Add Column After
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().addRowBefore().run()}
                className="flex items-center w-full px-3 py-2 rounded-lg hover:bg-accent text-sm"
              >
                Add Row Before
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().addRowAfter().run()}
                className="flex items-center w-full px-3 py-2 rounded-lg hover:bg-accent text-sm"
              >
                Add Row After
              </button>
              <div className="border-t my-2" />
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteColumn().run()}
                className="flex items-center w-full px-3 py-2 rounded-lg hover:bg-destructive/10 text-destructive text-sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Column
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteRow().run()}
                className="flex items-center w-full px-3 py-2 rounded-lg hover:bg-destructive/10 text-destructive text-sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Row
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().deleteTable().run()}
                className="flex items-center w-full px-3 py-2 rounded-lg hover:bg-destructive/10 text-destructive text-sm"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Table
              </button>
            </>
          )}
        </div>
      </DropdownMenu>

      <ToolbarDivider />

      {/* History */}
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)">
        <UndoIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Y)">
        <RedoIcon className="w-4 h-4" />
      </ToolbarButton>
    </div>
  );
};

// ========== Character Count ==========
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CharacterCountDisplay = ({ editor, maxCharacters }: { editor: any; maxCharacters?: number }) => {
  const characterCount = editor.storage.characterCount.characters();
  const wordCount = editor.storage.characterCount.words();
  const percentage = maxCharacters ? Math.round((characterCount / maxCharacters) * 100) : 0;

  return (
    <div className="flex items-center gap-4 px-3 py-2 border-t bg-muted/20 text-xs text-muted-foreground">
      <span>{wordCount} words</span>
      <span>{characterCount} characters</span>
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
  placeholder = "Type '/' for commands, or just start writing...",
  className,
  editable = true,
  autofocus = false,
  showToolbar = true,
  showBubbleMenu = true,
  showFloatingMenu = true,
  showCharacterCount = false,
  maxCharacters,
  minHeight = 200,
  maxHeight,
  variant = "notion",
}: UEditorProps) => {
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
        placeholder,
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
      <div className={cn("flex items-center justify-center border rounded-xl bg-muted/30", className)} style={{ minHeight }}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading editor...</span>
        </div>
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
