"use client";

import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { Editor } from "@tiptap/core";
import type { SuggestionProps } from "@tiptap/suggestion";
import {
  FileCode,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Minus,
  Quote,
  Table,
  Type,
} from "lucide-react";
import { cn } from "../../utils/cn";
import tippy, { type Instance as TippyInstance } from "tippy.js";

type SlashCommandMessages = {
  noResults: string;
  basicBlocks: string;
  text: string;
  textDesc: string;
  heading1: string;
  heading1Desc: string;
  heading2: string;
  heading2Desc: string;
  heading3: string;
  heading3Desc: string;
  bulletList: string;
  bulletListDesc: string;
  orderedList: string;
  orderedListDesc: string;
  todoList: string;
  todoListDesc: string;
  quote: string;
  quoteDesc: string;
  codeBlock: string;
  codeBlockDesc: string;
  divider: string;
  dividerDesc: string;
  table: string;
  tableDesc: string;
};

const DEFAULT_MESSAGES: SlashCommandMessages = {
  noResults: "No results",
  basicBlocks: "Basic Blocks",
  text: "Text",
  textDesc: "Start writing with plain text",
  heading1: "Heading 1",
  heading1Desc: "Large section heading",
  heading2: "Heading 2",
  heading2Desc: "Medium section heading",
  heading3: "Heading 3",
  heading3Desc: "Small section heading",
  bulletList: "Bullet List",
  bulletListDesc: "Create a simple bullet list",
  orderedList: "Numbered List",
  orderedListDesc: "Create a list with numbering",
  todoList: "Todo List",
  todoListDesc: "Track tasks with a todo list",
  quote: "Quote",
  quoteDesc: "Capture a quote",
  codeBlock: "Code Block",
  codeBlockDesc: "Display code with syntax highlighting",
  divider: "Divider",
  dividerDesc: "Visually divide blocks",
  table: "Table",
  tableDesc: "Insert a table",
};

type CommandItem = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  command: ({ editor, range }: { editor: Editor; range: any }) => void;
};

type CommandListProps = {
  items: CommandItem[];
  command: (item: CommandItem) => void;
  messages: SlashCommandMessages;
};

type CommandListRef = {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
};

const CommandList = forwardRef<CommandListRef, CommandListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  useEffect(() => {
    const selectedElement = listRef.current?.querySelector<HTMLElement>(`[data-index="${selectedIndex}"]`);
    selectedElement?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex, props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex((prev) => (prev + props.items.length - 1) % props.items.length);
        return true;
      }
      if (event.key === "ArrowDown") {
        setSelectedIndex((prev) => (prev + 1) % props.items.length);
        return true;
      }
      if (event.key === "Enter") {
        const item = props.items[selectedIndex];
        if (item) {
          props.command(item);
        }
        return true;
      }
      return false;
    },
  }));

  if (props.items.length === 0) {
    return <div className="w-72 p-4 text-center text-sm text-muted-foreground">{props.messages.noResults}</div>;
  }

  return (
    <div ref={listRef} className="w-72 max-h-80 overflow-y-auto bg-card border border-border/50 rounded-2xl shadow-lg">
      <div className="px-3 py-2 border-b">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{props.messages.basicBlocks}</span>
      </div>
      <div className="p-1">
        {props.items.map((item, index) => (
          <button
            key={item.title}
            type="button"
            data-index={index}
            onClick={() => props.command(item)}
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
              <item.icon className={cn("w-5 h-5", selectedIndex === index ? "text-primary" : "text-muted-foreground")} />
            </div>
            <div className="text-left">
              <div className={cn("text-sm font-medium", selectedIndex === index && "text-primary")}>{item.title}</div>
              <div className="text-xs text-muted-foreground">{item.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});

CommandList.displayName = "CommandList";

const getSuggestionItems = ({ query, messages }: { query: string; editor: Editor; messages: SlashCommandMessages }): CommandItem[] => {
  return [
    {
      icon: Type,
      title: messages.text,
      description: messages.textDesc,
      command: ({ editor, range }: { editor: Editor; range: any }) => {
        editor.chain().focus().deleteRange(range).setParagraph().run();
      },
    },
    {
      icon: Heading1,
      title: messages.heading1,
      description: messages.heading1Desc,
      command: ({ editor, range }: { editor: Editor; range: any }) => {
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run();
      },
    },
    {
      icon: Heading2,
      title: messages.heading2,
      description: messages.heading2Desc,
      command: ({ editor, range }: { editor: Editor; range: any }) => {
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run();
      },
    },
    {
      icon: Heading3,
      title: messages.heading3,
      description: messages.heading3Desc,
      command: ({ editor, range }: { editor: Editor; range: any }) => {
        editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run();
      },
    },
    {
      icon: List,
      title: messages.bulletList,
      description: messages.bulletListDesc,
      command: ({ editor, range }: { editor: Editor; range: any }) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      icon: ListOrdered,
      title: messages.orderedList,
      description: messages.orderedListDesc,
      command: ({ editor, range }: { editor: Editor; range: any }) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
    },
    {
      icon: ListTodo,
      title: messages.todoList,
      description: messages.todoListDesc,
      command: ({ editor, range }: { editor: Editor; range: any }) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run();
      },
    },
    {
      icon: Quote,
      title: messages.quote,
      description: messages.quoteDesc,
      command: ({ editor, range }: { editor: Editor; range: any }) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run();
      },
    },
    {
      icon: FileCode,
      title: messages.codeBlock,
      description: messages.codeBlockDesc,
      command: ({ editor, range }: { editor: Editor; range: any }) => {
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
      },
    },
    {
      icon: Minus,
      title: messages.divider,
      description: messages.dividerDesc,
      command: ({ editor, range }: { editor: Editor; range: any }) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run();
      },
    },
    {
      icon: Table,
      title: messages.table,
      description: messages.tableDesc,
      command: ({ editor, range }: { editor: Editor; range: any }) => {
        editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
      },
    },
  ].filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));
};

export const SlashCommand = Extension.create<{ messages: SlashCommandMessages }>({
  name: "slashCommand",

  addOptions() {
    return {
      messages: DEFAULT_MESSAGES,
    };
  },

  addProseMirrorPlugins() {
    const messages = this.options.messages;

    return [
      Suggestion({
        editor: this.editor,
        char: "/",
        command: ({ editor, range, props }: { editor: Editor; range: any; props: any }) => {
          props.command({ editor, range });
        },
        items: ({ query, editor }) => getSuggestionItems({ query, editor, messages }),
        render: () => {
          let component: ReactRenderer<CommandListRef, CommandListProps> | undefined;
          let popup: TippyInstance[] | undefined;

          return {
            onStart: (props: SuggestionProps<CommandItem>) => {
              component = new ReactRenderer(CommandList, {
                props: {
                  ...props,
                  messages,
                },
                editor: props.editor,
              });

              if (!props.clientRect) {
                return;
              }

              popup = tippy("body", {
                getReferenceClientRect: props.clientRect as () => DOMRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
              });
            },
            onUpdate(props: SuggestionProps<CommandItem>) {
              component?.updateProps({
                ...props,
                messages,
              });

              if (!props.clientRect) {
                return;
              }

              popup?.[0]?.setProps({
                getReferenceClientRect: props.clientRect as () => DOMRect,
              });
            },
            onKeyDown(props: { event: KeyboardEvent }) {
              if (props.event.key === "Escape") {
                popup?.[0]?.hide();
                return true;
              }

              return component?.ref?.onKeyDown(props) ?? false;
            },
            onExit() {
              popup?.[0]?.destroy();
              component?.destroy();
            },
          };
        },
      }),
    ];
  },
});
