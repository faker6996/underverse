"use client";

import { Extension, type Editor, type Range } from "@tiptap/core";
import { Suggestion } from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import { PluginKey } from "@tiptap/pm/state";
import React, { forwardRef, useImperativeHandle } from "react";
import type { SuggestionProps } from "@tiptap/suggestion";
import { Sigma } from "lucide-react";
import { useSmartTranslations } from "../../hooks/useSmartTranslations";
import {
  destroyTippyInstance,
  getFirstTippyInstance,
  hideTippyInstance,
  setTippyReferenceClientRect,
  tippy,
  type TippyInstance,
} from "./tippy-interop";

export type FormulaSuggestionItem = {
  name: string;
  signature: string;
  descriptionKey: string;
};

type FormulaSuggestionListProps = {
  items: FormulaSuggestionItem[];
  command: (item: FormulaSuggestionItem) => void;
};

export type FormulaSuggestionListRef = {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
};

const FORMULA_FUNCTIONS: FormulaSuggestionItem[] = [
  {
    name: "SUM",
    signature: "SUM(range)",
    descriptionKey: "formulaSuggestion.sum",
  },
  {
    name: "AVG",
    signature: "AVG(range)",
    descriptionKey: "formulaSuggestion.avg",
  },
  {
    name: "MIN",
    signature: "MIN(range)",
    descriptionKey: "formulaSuggestion.min",
  },
  {
    name: "MAX",
    signature: "MAX(range)",
    descriptionKey: "formulaSuggestion.max",
  },
  {
    name: "COUNT",
    signature: "COUNT(range)",
    descriptionKey: "formulaSuggestion.count",
  },
];

function isInTableCell(editor: Editor) {
  const { $from } = editor.state.selection;

  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const nodeName = $from.node(depth).type.name;
    if (nodeName === "tableCell" || nodeName === "tableHeader") {
      return true;
    }
  }

  return false;
}

export function buildFormulaSuggestionItems({ query }: { query: string }): FormulaSuggestionItem[] {
  const normalizedQuery = query.trim().toUpperCase();

  if (!isFormulaFunctionSuggestionQuery(normalizedQuery)) {
    return [];
  }

  if (!normalizedQuery) {
    return FORMULA_FUNCTIONS;
  }

  return FORMULA_FUNCTIONS.filter((item) => item.name.startsWith(normalizedQuery));
}

export function isFormulaFunctionSuggestionQuery(query: string) {
  return /^[A-Z]*$/i.test(query.trim());
}

const FormulaSuggestionList = forwardRef<FormulaSuggestionListRef, FormulaSuggestionListProps>((props, ref) => {
  const t = useSmartTranslations("UEditor");
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (props.items.length === 0) return false;

      if (event.key === "ArrowUp") {
        setSelectedIndex((prev) => (prev + props.items.length - 1) % props.items.length);
        return true;
      }

      if (event.key === "ArrowDown") {
        setSelectedIndex((prev) => (prev + 1) % props.items.length);
        return true;
      }

      if (event.key === "Tab") {
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
    return (
      <div className="w-72 p-3 text-sm text-muted-foreground bg-card border border-border/50 rounded-lg shadow-lg">
        {t("formulaSuggestion.noResults")}
      </div>
    );
  }

  return (
    <div className="w-72 max-h-80 overflow-y-auto bg-card border border-border/50 rounded-lg shadow-lg">
      <div className="px-3 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Sigma className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t("formulaSuggestion.title")}</span>
        </div>
      </div>
      <div className="p-1.5">
        {props.items.map((item, index) => (
          <button
            key={item.name}
            type="button"
            className={`w-full rounded-md px-2.5 py-2 text-left transition-colors ${
              selectedIndex === index ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
            }`}
            onMouseEnter={() => setSelectedIndex(index)}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => props.command(item)}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-sm font-semibold">{item.name}</span>
              <span className="font-mono text-xs text-muted-foreground">{item.signature}</span>
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">{t(item.descriptionKey)}</div>
          </button>
        ))}
      </div>
    </div>
  );
});

FormulaSuggestionList.displayName = "FormulaSuggestionList";

function insertFormulaFunction(editor: Editor, range: Range, item: FormulaSuggestionItem) {
  const insertedText = `=${item.name}()`;
  const cursorPosition = range.from + item.name.length + 2;

  editor.chain().focus().deleteRange(range).insertContent(insertedText).run();
  editor.commands.setTextSelection(cursorPosition);
}

export const FormulaSuggestion = Extension.create({
  name: "formulaSuggestion",

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: "=",
        pluginKey: new PluginKey("formulaSuggestion"),
        allow: ({ editor, range }) => {
          if (!isInTableCell(editor)) return false;
          const suggestionText = editor.state.doc.textBetween(range.from, range.to, "", "");
          return suggestionText.startsWith("=") && isFormulaFunctionSuggestionQuery(suggestionText.slice(1));
        },
        command: ({ editor, range, props }: { editor: Editor; range: Range; props: FormulaSuggestionItem }) => {
          insertFormulaFunction(editor, range, props);
        },
        items: buildFormulaSuggestionItems,
        render: () => {
          let component: ReactRenderer<FormulaSuggestionListRef, FormulaSuggestionListProps> | undefined;
          let popup: TippyInstance[] | undefined;

          return {
            onStart: (props: SuggestionProps<FormulaSuggestionItem>) => {
              component = new ReactRenderer(FormulaSuggestionList, {
                props,
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
            onUpdate(props: SuggestionProps<FormulaSuggestionItem>) {
              component?.updateProps(props);

              if (!props.clientRect) {
                return;
              }

              setTippyReferenceClientRect(getFirstTippyInstance(popup), props.clientRect as () => DOMRect);
            },
            onKeyDown(props: { event: KeyboardEvent }) {
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
