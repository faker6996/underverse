"use client";

import { Extension } from "@tiptap/core";
import type { Editor, Range } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import type { SuggestionProps } from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
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
  Info,
  Bookmark as BookmarkIcon,
  Paperclip,
  CheckSquare,
  CircleCheckBig,
  CircleDot,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { destroyTippyInstance, getFirstTippyInstance, hideTippyInstance, setTippyReferenceClientRect, tippy, type TippyInstance } from "./tippy-interop";

export type SlashCommandMessages = {
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
  callout: string;
  calloutDesc: string;
  bookmark: string;
  bookmarkDesc: string;
  fileCard: string;
  fileCardDesc: string;
  formCheckbox: string;
  formCheckboxDesc: string;
  roundCheckbox: string;
  roundCheckboxDesc: string;
  formRadio: string;
  formRadioDesc: string;
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
  callout: "Callout",
  calloutDesc: "Highlight key info with a callout block",
  bookmark: "Bookmark Card",
  bookmarkDesc: "Embed a link as a bookmark card",
  fileCard: "File Attachment",
  fileCardDesc: "Upload a file card attachment",
  formCheckbox: "Form Checkbox",
  formCheckboxDesc: "Insert an interactive checkbox field",
  roundCheckbox: "Round Checkbox",
  roundCheckboxDesc: "Insert a circular interactive checkbox",
  formRadio: "Form Radio Button",
  formRadioDesc: "Insert an interactive radio button field",
};

export type SlashCommandExecutionContext = {
  editor: Editor;
  range?: Range | null;
};

export type SlashCommandItem = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  searchTerms?: string[];
  command: (ctx: SlashCommandExecutionContext) => void;
};

/** Public props for the `SlashCommandList` component. */
type SlashCommandListProps = {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
  messages: SlashCommandMessages;
};

export type SlashCommandListRef = {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
};

function useResettingIndex(resetToken: unknown) {
  const [state, setState] = React.useState<{ resetToken: unknown; index: number }>({ resetToken, index: 0 });
  const selectedIndex = Object.is(state.resetToken, resetToken) ? state.index : 0;

  const setSelectedIndex = React.useCallback((nextIndex: React.SetStateAction<number>) => {
    setState((prev) => {
      const prevIndex = Object.is(prev.resetToken, resetToken) ? prev.index : 0;
      return {
        resetToken,
        index: typeof nextIndex === "function" ? (nextIndex as (value: number) => number)(prevIndex) : nextIndex,
      };
    });
  }, [resetToken]);

  return [selectedIndex, setSelectedIndex] as const;
}

function getCommandChain(editor: Editor, range?: Range | null) {
  const chain = editor.chain().focus();
  return range ? chain.deleteRange(range) : chain;
}

export function buildSlashCommandMessages(translate: (key: string) => string): SlashCommandMessages {
  return {
    noResults: translate("slashCommand.noResults"),
    basicBlocks: translate("slashCommand.basicBlocks"),
    text: translate("slashCommand.text"),
    textDesc: translate("slashCommand.textDesc"),
    heading1: translate("slashCommand.heading1"),
    heading1Desc: translate("slashCommand.heading1Desc"),
    heading2: translate("slashCommand.heading2"),
    heading2Desc: translate("slashCommand.heading2Desc"),
    heading3: translate("slashCommand.heading3"),
    heading3Desc: translate("slashCommand.heading3Desc"),
    bulletList: translate("slashCommand.bulletList"),
    bulletListDesc: translate("slashCommand.bulletListDesc"),
    orderedList: translate("slashCommand.orderedList"),
    orderedListDesc: translate("slashCommand.orderedListDesc"),
    todoList: translate("slashCommand.todoList"),
    todoListDesc: translate("slashCommand.todoListDesc"),
    quote: translate("slashCommand.quote"),
    quoteDesc: translate("slashCommand.quoteDesc"),
    codeBlock: translate("slashCommand.codeBlock"),
    codeBlockDesc: translate("slashCommand.codeBlockDesc"),
    divider: translate("slashCommand.divider") || "Divider",
    dividerDesc: translate("slashCommand.dividerDesc") || "Visually divide blocks",
    table: translate("slashCommand.table") || "Table",
    tableDesc: translate("slashCommand.tableDesc") || "Insert a table",
    callout: translate("slashCommand.callout") || "Callout",
    calloutDesc: translate("slashCommand.calloutDesc") || "Highlight key info with a callout block",
    bookmark: translate("slashCommand.bookmark") || "Bookmark Card",
    bookmarkDesc: translate("slashCommand.bookmarkDesc") || "Embed a link as a bookmark card",
    fileCard: translate("slashCommand.fileCard") || "File Attachment",
    fileCardDesc: translate("slashCommand.fileCardDesc") || "Upload a file card attachment",
    formCheckbox: translate("slashCommand.formCheckbox") || "Form Checkbox",
    formCheckboxDesc: translate("slashCommand.formCheckboxDesc") || "Insert an interactive checkbox field",
    roundCheckbox: translate("slashCommand.roundCheckbox") || "Round Checkbox",
    roundCheckboxDesc: translate("slashCommand.roundCheckboxDesc") || "Insert a circular interactive checkbox",
    formRadio: translate("slashCommand.formRadio") || "Form Radio Button",
    formRadioDesc: translate("slashCommand.formRadioDesc") || "Insert an interactive radio button field",
  };
}

export function buildSlashCommandItems({
  query,
  messages,
}: {
  query: string;
  messages: SlashCommandMessages;
}): SlashCommandItem[] {
  const run = (handler: (ctx: SlashCommandExecutionContext) => void) => handler;

  return [
    {
      icon: Type,
      title: messages.text,
      description: messages.textDesc,
      command: run(({ editor, range }) => {
        getCommandChain(editor, range).setParagraph().run();
      }),
    },
    {
      icon: Heading1,
      title: messages.heading1,
      description: messages.heading1Desc,
      command: run(({ editor, range }) => {
        getCommandChain(editor, range).setNode("heading", { level: 1 }).run();
      }),
    },
    {
      icon: Heading2,
      title: messages.heading2,
      description: messages.heading2Desc,
      command: run(({ editor, range }) => {
        getCommandChain(editor, range).setNode("heading", { level: 2 }).run();
      }),
    },
    {
      icon: Heading3,
      title: messages.heading3,
      description: messages.heading3Desc,
      command: run(({ editor, range }) => {
        getCommandChain(editor, range).setNode("heading", { level: 3 }).run();
      }),
    },
    {
      icon: List,
      title: messages.bulletList,
      description: messages.bulletListDesc,
      command: run(({ editor, range }) => {
        getCommandChain(editor, range).toggleBulletList().run();
      }),
    },
    {
      icon: ListOrdered,
      title: messages.orderedList,
      description: messages.orderedListDesc,
      command: run(({ editor, range }) => {
        getCommandChain(editor, range).toggleOrderedList().run();
      }),
    },
    {
      icon: ListTodo,
      title: messages.todoList,
      description: messages.todoListDesc,
      command: run(({ editor, range }) => {
        getCommandChain(editor, range).toggleTaskList().run();
      }),
    },
    {
      icon: Quote,
      title: messages.quote,
      description: messages.quoteDesc,
      command: run(({ editor, range }) => {
        getCommandChain(editor, range).toggleBlockquote().run();
      }),
    },
    {
      icon: FileCode,
      title: messages.codeBlock,
      description: messages.codeBlockDesc,
      command: run(({ editor, range }) => {
        getCommandChain(editor, range).toggleCodeBlock().run();
      }),
    },
    {
      icon: Minus,
      title: messages.divider,
      description: messages.dividerDesc,
      command: run(({ editor, range }) => {
        getCommandChain(editor, range).setHorizontalRule().run();
      }),
    },
    {
      icon: Table,
      title: messages.table,
      description: messages.tableDesc,
      command: run(({ editor, range }) => {
        getCommandChain(editor, range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
      }),
    },
    {
      icon: Info,
      title: messages.callout || "Callout",
      description: messages.calloutDesc || "Highlight key info with a callout block",
      command: run(({ editor, range }) => {
        getCommandChain(editor, range).setCallout().run();
      }),
    },
    {
      icon: BookmarkIcon,
      title: messages.bookmark || "Bookmark Card",
      description: messages.bookmarkDesc || "Embed a link as a bookmark card",
      command: run(({ editor, range }) => {
        const url = window.prompt("Enter URL for bookmark:");
        if (url) {
          getCommandChain(editor, range).setBookmark({ url }).run();
        }
      }),
    },
    {
      icon: Paperclip,
      title: messages.fileCard || "File Attachment",
      description: messages.fileCardDesc || "Upload a file card attachment",
      command: run(({ editor, range }) => {
        const input = document.createElement("input");
        input.type = "file";
        input.onchange = async () => {
          const file = input.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            getCommandChain(editor, range).setFileCard({
              src: dataUrl,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type,
            }).run();
          };
          reader.readAsDataURL(file);
        };
        input.click();
      }),
    },
    {
      icon: CheckSquare,
      title: messages.formCheckbox,
      description: messages.formCheckboxDesc,
      searchTerms: ["checkbox", "square checkbox"],
      command: run(({ editor, range }) => {
        getCommandChain(editor, range).setFormCheckbox().run();
      }),
    },
    {
      icon: CircleCheckBig,
      title: messages.roundCheckbox,
      description: messages.roundCheckboxDesc,
      searchTerms: ["roundcheckbox", "round checkbox", "circle checkbox"],
      command: run(({ editor, range }) => {
        getCommandChain(editor, range).setFormCheckbox({ variant: "circle" }).run();
      }),
    },
    {
      icon: CircleDot,
      title: messages.formRadio,
      description: messages.formRadioDesc,
      command: run(({ editor, range }) => {
        getCommandChain(editor, range).setFormRadio({ name: `radio-group-${Math.random().toString(36).substring(2, 6)}` }).run();
      }),
    },
  ].filter((item) => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return true;

    return [item.title, item.description, ...(item.searchTerms ?? [])]
      .some((value) => value.toLowerCase().includes(normalizedQuery));
  });
}

export const SlashCommandList = forwardRef<SlashCommandListRef, SlashCommandListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useResettingIndex(props.items);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const selectedElement = listRef.current?.querySelector<HTMLElement>(`[data-index="${selectedIndex}"]`);
    selectedElement?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex, props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: (keyProps: { event: KeyboardEvent }) => {
      if (!keyProps || !keyProps.event) return false;
      const { event } = keyProps;
      if (props.items.length === 0) {
        return false;
      }

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
            onMouseDown={(event) => event.preventDefault()}
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

SlashCommandList.displayName = "SlashCommandList";

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
        command: ({ editor, range, props }: { editor: Editor; range: Range; props: SlashCommandItem }) => {
          props.command({ editor, range });
        },
        items: ({ query }) => buildSlashCommandItems({ query, messages }),
        render: () => {
          let component: ReactRenderer<SlashCommandListRef, SlashCommandListProps> | undefined;
          let popup: TippyInstance[] | undefined;

          return {
            onStart: (props: SuggestionProps<SlashCommandItem>) => {
              component = new ReactRenderer(SlashCommandList, {
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
                zIndex: 99999,
              });
            },
            onUpdate(props: SuggestionProps<SlashCommandItem>) {
              component?.updateProps({
                ...props,
                messages,
              });

              if (!props.clientRect) {
                return;
              }

              setTippyReferenceClientRect(getFirstTippyInstance(popup), props.clientRect as () => DOMRect);
            },
            onKeyDown(props: { event: KeyboardEvent }) {
              if (!props || !props.event) return false;
              const popupInstance = getFirstTippyInstance(popup);
              if (props.event.key === "Escape") {
                hideTippyInstance(popupInstance);
                return true;
              }

              return component?.ref?.onKeyDown(props) ?? false;
            },
            onExit() {
              destroyTippyInstance(getFirstTippyInstance(popup));
              component?.destroy();
            },
          };
        },
      }),
    ];
  },
});
