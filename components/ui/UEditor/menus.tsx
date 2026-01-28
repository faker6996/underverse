"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Editor } from "@tiptap/core";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import {
  Bold as BoldIcon,
  Code as CodeIcon,
  FileCode,
  Heading1 as Heading1Icon,
  Heading2 as Heading2Icon,
  Heading3 as Heading3Icon,
  Italic as ItalicIcon,
  Link as LinkIcon,
  List as ListIcon,
  ListOrdered as ListOrderedIcon,
  ListTodo,
  Minus,
  Palette,
  Plus,
  Quote as QuoteIcon,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Table as TableIcon,
  Type,
  Underline as UnderlineIcon,
  Strikethrough as StrikethroughIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ToolbarButton } from "./toolbar";
import { LinkInput } from "./inputs";
import { EditorColorPalette, useEditorColors } from "./colors";

type SlashCommand = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  action: () => void;
};

const SlashCommandMenu = ({ editor, onClose, filterText = "" }: { editor: Editor; onClose: () => void; filterText?: string }) => {
  const t = useTranslations("UEditor");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const allCommands = useMemo<SlashCommand[]>(
    () => [
      {
        icon: Type,
        label: t("slashCommand.text"),
        description: t("slashCommand.textDesc"),
        action: () => editor.chain().focus().setParagraph().run(),
      },
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
    ],
    [editor, t],
  );

  const commands = useMemo(() => {
    if (!filterText) return allCommands;
    const lowerFilter = filterText.toLowerCase();
    return allCommands.filter((cmd) => cmd.label.toLowerCase().includes(lowerFilter) || cmd.description.toLowerCase().includes(lowerFilter));
  }, [allCommands, filterText]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filterText]);

  useEffect(() => {
    const selectedElement = menuRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    selectedElement?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const selectCommand = useCallback(
    (index: number) => {
      const command = commands[index];
      if (command) {
        command.action();
        onClose();
      }
    },
    [commands, onClose],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (commands.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % commands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + commands.length) % commands.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        selectCommand(selectedIndex);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [commands, selectedIndex, selectCommand, onClose]);

  if (commands.length === 0) {
    return <div className="w-72 p-4 text-center text-muted-foreground text-sm">{t("slashCommand.noResults")}</div>;
  }

  return (
    <div ref={menuRef} className="w-72 max-h-80 overflow-y-auto">
      <div className="px-3 py-2 border-b">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("slashCommand.basicBlocks")}</span>
      </div>
      <div className="p-1">
        {commands.map((cmd, index) => (
          <button
            key={cmd.label}
            type="button"
            data-index={index}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => selectCommand(index)}
            onMouseEnter={() => setSelectedIndex(index)}
            className={cn(
              "flex items-center w-full px-3 py-2.5 rounded-lg transition-colors group",
              selectedIndex === index ? "bg-accent" : "hover:bg-accent/50",
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-lg mr-3 transition-colors",
                selectedIndex === index ? "bg-primary/10" : "bg-muted/50 group-hover:bg-muted",
              )}
            >
              <cmd.icon className={cn("w-5 h-5", selectedIndex === index ? "text-primary" : "text-muted-foreground")} />
            </div>
            <div className="text-left">
              <div className={cn("text-sm font-medium", selectedIndex === index && "text-primary")}>{cmd.label}</div>
              <div className="text-xs text-muted-foreground">{cmd.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export const SlashCommandTrigger = ({ editor }: { editor: Editor }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [filterText, setFilterText] = useState("");
  const slashPosRef = useRef<number | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      const { state, view } = editor;
      const { $from, empty } = state.selection;

      if (!empty || !view.hasFocus()) {
        setIsVisible(false);
        slashPosRef.current = null;
        return;
      }

      const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
      const slashMatch = textBefore.match(/\/([^\s\/]*)$/);

      if (slashMatch) {
        const slashIndex = textBefore.lastIndexOf("/");
        const absoluteSlashPos = $from.start() + slashIndex;

        const coords = view.coordsAtPos(absoluteSlashPos);
        setPosition({ top: coords.bottom + 5, left: coords.left });
        setFilterText(slashMatch[1] || "");
        slashPosRef.current = absoluteSlashPos;
        setIsVisible(true);
      } else {
        setIsVisible(false);
        slashPosRef.current = null;
        setFilterText("");
      }
    };

    editor.on("selectionUpdate", handleUpdate);
    editor.on("update", handleUpdate);

    return () => {
      editor.off("selectionUpdate", handleUpdate);
      editor.off("update", handleUpdate);
    };
  }, [editor]);

  const handleClose = useCallback(() => {
    if (slashPosRef.current !== null) {
      const { state } = editor;
      const { $from } = state.selection;
      const deleteFrom = slashPosRef.current;
      const deleteTo = $from.pos;
      editor.chain().focus().deleteRange({ from: deleteFrom, to: deleteTo }).run();
    }
    setIsVisible(false);
    slashPosRef.current = null;
    setFilterText("");
  }, [editor]);

  if (!isVisible) return null;

  return createPortal(
    <div
      className="fixed z-50 rounded-2xl border border-border bg-card text-card-foreground shadow-lg backdrop-blur-sm overflow-hidden animate-in fade-in-0 zoom-in-95 slide-in-from-top-2"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <SlashCommandMenu editor={editor} onClose={handleClose} filterText={filterText} />
    </div>,
    document.body,
  );
};

const FloatingMenuContent = ({ editor }: { editor: Editor }) => {
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

const BubbleMenuContent = ({
  editor,
  onKeepOpenChange,
}: {
  editor: Editor;
  onKeepOpenChange?: (keepOpen: boolean) => void;
}) => {
  const t = useTranslations("UEditor");
  const { textColors, highlightColors } = useEditorColors();
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showEditorColorPalette, setShowEditorColorPalette] = useState(false);

  useEffect(() => {
    onKeepOpenChange?.(showLinkInput);
  }, [onKeepOpenChange, showLinkInput]);

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

export const CustomBubbleMenu = ({ editor }: { editor: Editor }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const keepOpenRef = useRef(false);
  const setKeepOpen = useCallback((next: boolean) => {
    keepOpenRef.current = next;
    if (next) setIsVisible(true);
  }, []);

  useEffect(() => {
    const updatePosition = () => {
      const { state, view } = editor;
      const { from, to, empty } = state.selection;

      if (!keepOpenRef.current && (empty || !view.hasFocus())) {
        setIsVisible(false);
        return;
      }

      const start = view.coordsAtPos(from);
      const end = view.coordsAtPos(to);

      const left = (start.left + end.left) / 2;
      const top = start.top - 10;

      setPosition({ top, left });
      setIsVisible(true);
    };

    const handleBlur = () => {
      if (!keepOpenRef.current) setIsVisible(false);
    };

    editor.on("selectionUpdate", updatePosition);
    editor.on("focus", updatePosition);
    editor.on("blur", handleBlur);

    return () => {
      editor.off("selectionUpdate", updatePosition);
      editor.off("focus", updatePosition);
      editor.off("blur", handleBlur);
    };
  }, [editor]);

  if (!isVisible) return null;

  return createPortal(
    <div
      ref={menuRef}
      className="fixed z-50 flex rounded-2xl border border-border bg-card text-card-foreground shadow-lg backdrop-blur-sm overflow-hidden animate-in fade-in-0 zoom-in-95"
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
      />
    </div>,
    document.body,
  );
};

export const CustomFloatingMenu = ({ editor }: { editor: Editor }) => {
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
      setPosition({ top: coords.top - 10, left: coords.left });
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
      className="fixed z-50 rounded-2xl border border-border bg-card text-card-foreground shadow-lg backdrop-blur-sm overflow-hidden animate-in fade-in-0 slide-in-from-bottom-2"
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
