"use client";

import React, { useState } from "react";
import type { Editor } from "@tiptap/core";
import { useTranslations } from "next-intl";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowRight,
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
  Strikethrough as StrikethroughIcon,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Table as TableIcon,
  Trash2,
  Type,
  Underline as UnderlineIcon,
  Undo as UndoIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { DropdownMenu, DropdownMenuItem } from "../DropdownMenu";
import { Tooltip } from "../Tooltip";
import { EditorColorPalette, useEditorColors } from "./colors";
import { ImageInput } from "./inputs";
import type { UEditorVariant } from "./types";

export const ToolbarButton = React.forwardRef<
  HTMLButtonElement,
  {
    onClick: (e: React.MouseEvent) => void;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title?: string;
    className?: string;
  }
>(({ onClick, active, disabled, children, title, className }, ref) => {
  const button = (
    <button
      ref={ref}
      type="button"
      onMouseDown={(e) => e.preventDefault()}
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
      <Tooltip content={title} placement="top" delay={{ open: 500, close: 0 }}>
        {button}
      </Tooltip>
    );
  }

  return button;
});
ToolbarButton.displayName = "ToolbarButton";

const ToolbarDivider = () => <div className="w-px h-6 bg-border/50 mx-1" />;

export const EditorToolbar = ({ editor, variant }: { editor: Editor; variant: UEditorVariant }) => {
  const t = useTranslations("UEditor");
  const { textColors, highlightColors } = useEditorColors();
  const [showImageInput, setShowImageInput] = useState(false);

  if (variant === "minimal") {
    return (
      <div className="flex items-center gap-1 p-2 border-b bg-muted/30">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title={t("toolbar.bold")}>
          <BoldIcon className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title={t("toolbar.italic")}
        >
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
        trigger={
          <ToolbarButton onClick={() => {}} title={t("toolbar.textStyle")} className="px-2 w-auto gap-1">
            <Type className="w-4 h-4" />
            <ChevronDown className="w-3 h-3" />
          </ToolbarButton>
        }
      >
        <DropdownMenuItem icon={Type} label={t("toolbar.normal")} onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive("paragraph")} />
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

      <ToolbarDivider />

      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title={t("toolbar.bold")}>
        <BoldIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title={t("toolbar.italic")}
      >
        <ItalicIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        active={editor.isActive("underline")}
        title={t("toolbar.underline")}
      >
        <UnderlineIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        title={t("toolbar.strike")}
      >
        <StrikethroughIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title={t("toolbar.code")}>
        <CodeIcon className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarDivider />

      <DropdownMenu
        trigger={
          <ToolbarButton onClick={() => {}} title={t("colors.textColor")}>
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
          <ToolbarButton onClick={() => {}} active={editor.isActive("highlight")} title={t("colors.highlight")}>
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
          <ToolbarButton onClick={() => {}} title={t("toolbar.alignment")}>
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
          <ToolbarButton onClick={() => {}} title={t("toolbar.bulletList")}>
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
          <ToolbarButton onClick={() => {}} title={t("toolbar.quote")}>
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
          <DropdownMenuItem icon={LinkIcon} label={t("imageInput.addFromUrl")} onClick={() => setShowImageInput(true)} />
        )}
      </DropdownMenu>

      <DropdownMenu
        trigger={
          <ToolbarButton onClick={() => {}} title={t("toolbar.table")}>
            <TableIcon className="w-4 h-4" />
            <ChevronDown className="w-3 h-3" />
          </ToolbarButton>
        }
      >
        <DropdownMenuItem icon={TableIcon} label={t("tableMenu.insert3x3")} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} />
        <div className="my-1 border-t" />
        <DropdownMenuItem
          icon={ArrowDown}
          label={t("tableMenu.addColumnBefore")}
          onClick={() => editor.chain().focus().addColumnBefore().run()}
          disabled={!editor.can().addColumnBefore()}
        />
        <DropdownMenuItem
          icon={ArrowDown}
          label={t("tableMenu.addColumnAfter")}
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          disabled={!editor.can().addColumnAfter()}
        />
        <DropdownMenuItem
          icon={ArrowRight}
          label={t("tableMenu.addRowBefore")}
          onClick={() => editor.chain().focus().addRowBefore().run()}
          disabled={!editor.can().addRowBefore()}
        />
        <DropdownMenuItem
          icon={ArrowRight}
          label={t("tableMenu.addRowAfter")}
          onClick={() => editor.chain().focus().addRowAfter().run()}
          disabled={!editor.can().addRowAfter()}
        />
        <div className="my-1 border-t" />
        <DropdownMenuItem
          icon={Trash2}
          label={t("tableMenu.deleteColumn")}
          onClick={() => editor.chain().focus().deleteColumn().run()}
          disabled={!editor.can().deleteColumn()}
        />
        <DropdownMenuItem icon={Trash2} label={t("tableMenu.deleteRow")} onClick={() => editor.chain().focus().deleteRow().run()} disabled={!editor.can().deleteRow()} />
        <DropdownMenuItem
          icon={Trash2}
          label={t("tableMenu.deleteTable")}
          onClick={() => editor.chain().focus().deleteTable().run()}
          disabled={!editor.can().deleteTable()}
        />
      </DropdownMenu>

      <ToolbarDivider />

      <ToolbarButton onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive("subscript")} title={t("toolbar.subscript")}>
        <SubscriptIcon className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive("superscript")} title={t("toolbar.superscript")}>
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

