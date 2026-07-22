import { mergeAttributes } from "@tiptap/core";
import { Document } from "@tiptap/extension-document";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Text } from "@tiptap/extension-text";
import { Bold } from "@tiptap/extension-bold";
import { Italic } from "@tiptap/extension-italic";
import { Strike } from "@tiptap/extension-strike";
import { Underline } from "@tiptap/extension-underline";
import { Heading } from "@tiptap/extension-heading";
import { BulletList } from "@tiptap/extension-bullet-list";
import { OrderedList } from "@tiptap/extension-ordered-list";
import { ListItem } from "@tiptap/extension-list-item";
import { ListKeymap } from "@tiptap/extension-list";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { Blockquote } from "@tiptap/extension-blockquote";
import { Code } from "@tiptap/extension-code";
import { wrappingInputRule } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { Callout } from "./callout";
import { Bookmark } from "./bookmark";
import { FileCard } from "./file-card";
import { FormCheckbox } from "./form-checkbox";
import { FormRadio } from "./form-radio";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { History } from "@tiptap/extension-history";
import { Link } from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { TextAlign } from "@tiptap/extension-text-align";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { CharacterCount } from "@tiptap/extension-character-count";
import { Typography } from "@tiptap/extension-typography";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { HorizontalRule } from "@tiptap/extension-horizontal-rule";
import { Gapcursor } from "@tiptap/extension-gapcursor";
import { buildSlashCommandMessages, SlashCommand } from "./slash-command";
import { ClipboardImages } from "./clipboard-images";
import { EmojiSuggestion } from "./emoji-suggestion";
import { FormulaSuggestion } from "./formula-suggestion";
import { UEditorPlaceholder } from "./placeholder";
import ResizableImage from "./resizable-image";
import UEditorTableRow from "./table-row";
import FontFamily from "./font-family";
import FontSize from "./font-size";
import LineHeight from "./line-height";
import LetterSpacing from "./letter-spacing";
import Indent from "./indent";
import UEditorTable from "./table-align";
import { isSafeUEditorUrl } from "./url-safety";
import { CodeBlockView } from "./CodeBlockView";
import { createOptimizedLowlightPlugin, type LowlightInstance } from "./optimized-lowlight";
import { TableFormulaRecalculation } from "./table-formula-recalculation";

function getFormulaStateAttributes(attributes: Record<string, unknown>) {
  const formula = attributes["data-formula"];
  if (!formula) {
    return {};
  }

  const computedValue = String(attributes["data-computed-value"] ?? "");
  return {
    "data-formula-state": computedValue.startsWith("#") ? "error" : "computed",
  };
}

type TableCellTextWrap = "wrap" | "nowrap";

function normalizeTableCellTextWrap(value: unknown): TableCellTextWrap {
  return value === "nowrap" ? "nowrap" : "wrap";
}

function parseTableCellTextWrap(element: HTMLElement): TableCellTextWrap {
  if (element.getAttribute("data-text-wrap") === "nowrap" || element.style.whiteSpace === "nowrap") {
    return "nowrap";
  }

  return "wrap";
}

function renderTableCellTextWrap(attributes: Record<string, unknown>) {
  return normalizeTableCellTextWrap(attributes.textWrap) === "nowrap"
    ? { "data-text-wrap": "nowrap" }
    : {};
}

function getTableCellTextWrapStyle(value: unknown) {
  return normalizeTableCellTextWrap(value) === "nowrap"
    ? "white-space: nowrap; overflow-wrap: normal; word-break: normal"
    : "white-space: normal; overflow-wrap: anywhere; word-break: normal";
}

export const CustomTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: (element) => element.style.backgroundColor || element.getAttribute("data-background-color") || null,
        renderHTML: (attributes) => {
          if (!attributes.backgroundColor) {
            return {};
          }
          return {
            "data-background-color": attributes.backgroundColor,
          };
        },
      },
      borderColor: {
        default: null,
        parseHTML: (element) => element.style.borderColor || element.getAttribute("data-border-color") || null,
        renderHTML: (attributes) => {
          if (!attributes.borderColor) return {};
          return {
            "data-border-color": attributes.borderColor,
          };
        },
      },
      borderStyle: {
        default: null,
        parseHTML: (element) => element.style.borderStyle || element.getAttribute("data-border-style") || null,
        renderHTML: (attributes) => {
          if (!attributes.borderStyle) return {};
          return {
            "data-border-style": attributes.borderStyle,
          };
        },
      },
      borderWidth: {
        default: null,
        parseHTML: (element) => element.style.borderWidth || element.getAttribute("data-border-width") || null,
        renderHTML: (attributes) => {
          if (!attributes.borderWidth) return {};
          return {
            "data-border-width": attributes.borderWidth,
          };
        },
      },
      cellId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-cell-id") || null,
        renderHTML: (attributes) => {
          if (!attributes.cellId) return {};
          return {
            "data-cell-id": attributes.cellId,
          };
        },
      },
      numberFormat: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-number-format") || null,
        renderHTML: (attributes) => {
          if (!attributes.numberFormat) return {};
          return {
            "data-number-format": attributes.numberFormat,
          };
        },
      },
      formula: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-formula") || null,
        renderHTML: (attributes) => {
          if (!attributes.formula) return {};
          return {
            "data-formula": attributes.formula,
          };
        },
      },
      computedValue: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-computed-value") || null,
        renderHTML: (attributes) => {
          if (!attributes.computedValue) return {};
          return {
            "data-computed-value": attributes.computedValue,
          };
        },
      },
      verticalAlign: {
        default: null,
        parseHTML: (element) => element.style.verticalAlign || element.getAttribute("data-vertical-align") || null,
        renderHTML: (attributes) => {
          if (!attributes.verticalAlign) return {};
          return {
            "data-vertical-align": attributes.verticalAlign,
          };
        },
      },
      textDirection: {
        default: null,
        parseHTML: (element) =>
          element.getAttribute("data-text-direction") === "vertical" || ["sideways-lr", "vertical-lr", "vertical-rl"].includes(element.style.writingMode)
            ? "vertical"
            : null,
        renderHTML: (attributes) => attributes.textDirection === "vertical" ? { "data-text-direction": "vertical" } : {},
      },
      textWrap: {
        default: "wrap",
        parseHTML: parseTableCellTextWrap,
        renderHTML: renderTableCellTextWrap,
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const style = HTMLAttributes.style || "";
    const bg = HTMLAttributes["data-background-color"];
    const borderColor = HTMLAttributes["data-border-color"];
    const borderStyle = HTMLAttributes["data-border-style"];
    const borderWidth = HTMLAttributes["data-border-width"];
    const verticalAlign = HTMLAttributes["data-vertical-align"];
    const textDirection = HTMLAttributes["data-text-direction"];
    const textWrap = HTMLAttributes["data-text-wrap"];

    let mergedStyle = style;
    if (bg) mergedStyle += `; background-color: ${bg}`;
    if (borderColor) mergedStyle += `; border-color: ${borderColor}`;
    if (borderStyle) mergedStyle += `; border-style: ${borderStyle}`;
    if (borderWidth) mergedStyle += `; border-width: ${borderWidth}`;
    if (verticalAlign) mergedStyle += `; vertical-align: ${verticalAlign}`;
    if (textDirection === "vertical") mergedStyle += "; writing-mode: sideways-lr; text-orientation: mixed";
    mergedStyle += `; ${getTableCellTextWrapStyle(textWrap)}`;
    mergedStyle = mergedStyle.replace(/^;/, "").trim();

    return [
      "td",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, getFormulaStateAttributes(HTMLAttributes), mergedStyle ? { style: mergedStyle } : {}),
      0,
    ];
  },
});

export const CustomTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      backgroundColor: {
        default: null,
        parseHTML: (element) => element.style.backgroundColor || element.getAttribute("data-background-color") || null,
        renderHTML: (attributes) => {
          if (!attributes.backgroundColor) {
            return {};
          }
          return {
            "data-background-color": attributes.backgroundColor,
          };
        },
      },
      borderColor: {
        default: null,
        parseHTML: (element) => element.style.borderColor || element.getAttribute("data-border-color") || null,
        renderHTML: (attributes) => {
          if (!attributes.borderColor) return {};
          return {
            "data-border-color": attributes.borderColor,
          };
        },
      },
      borderStyle: {
        default: null,
        parseHTML: (element) => element.style.borderStyle || element.getAttribute("data-border-style") || null,
        renderHTML: (attributes) => {
          if (!attributes.borderStyle) return {};
          return {
            "data-border-style": attributes.borderStyle,
          };
        },
      },
      borderWidth: {
        default: null,
        parseHTML: (element) => element.style.borderWidth || element.getAttribute("data-border-width") || null,
        renderHTML: (attributes) => {
          if (!attributes.borderWidth) return {};
          return {
            "data-border-width": attributes.borderWidth,
          };
        },
      },
      cellId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-cell-id") || null,
        renderHTML: (attributes) => {
          if (!attributes.cellId) return {};
          return {
            "data-cell-id": attributes.cellId,
          };
        },
      },
      numberFormat: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-number-format") || null,
        renderHTML: (attributes) => {
          if (!attributes.numberFormat) return {};
          return {
            "data-number-format": attributes.numberFormat,
          };
        },
      },
      formula: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-formula") || null,
        renderHTML: (attributes) => {
          if (!attributes.formula) return {};
          return {
            "data-formula": attributes.formula,
          };
        },
      },
      computedValue: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-computed-value") || null,
        renderHTML: (attributes) => {
          if (!attributes.computedValue) return {};
          return {
            "data-computed-value": attributes.computedValue,
          };
        },
      },
      verticalAlign: {
        default: null,
        parseHTML: (element) => element.style.verticalAlign || element.getAttribute("data-vertical-align") || null,
        renderHTML: (attributes) => {
          if (!attributes.verticalAlign) return {};
          return {
            "data-vertical-align": attributes.verticalAlign,
          };
        },
      },
      textDirection: {
        default: null,
        parseHTML: (element) =>
          element.getAttribute("data-text-direction") === "vertical" || ["sideways-lr", "vertical-lr", "vertical-rl"].includes(element.style.writingMode)
            ? "vertical"
            : null,
        renderHTML: (attributes) => attributes.textDirection === "vertical" ? { "data-text-direction": "vertical" } : {},
      },
      textWrap: {
        default: "wrap",
        parseHTML: parseTableCellTextWrap,
        renderHTML: renderTableCellTextWrap,
      },
    };
  },

  renderHTML({ HTMLAttributes }) {
    const style = HTMLAttributes.style || "";
    const bg = HTMLAttributes["data-background-color"];
    const borderColor = HTMLAttributes["data-border-color"];
    const borderStyle = HTMLAttributes["data-border-style"];
    const borderWidth = HTMLAttributes["data-border-width"];
    const verticalAlign = HTMLAttributes["data-vertical-align"];
    const textDirection = HTMLAttributes["data-text-direction"];
    const textWrap = HTMLAttributes["data-text-wrap"];

    let mergedStyle = style;
    if (bg) mergedStyle += `; background-color: ${bg}`;
    if (borderColor) mergedStyle += `; border-color: ${borderColor}`;
    if (borderStyle) mergedStyle += `; border-style: ${borderStyle}`;
    if (borderWidth) mergedStyle += `; border-width: ${borderWidth}`;
    if (verticalAlign) mergedStyle += `; vertical-align: ${verticalAlign}`;
    if (textDirection === "vertical") mergedStyle += "; writing-mode: sideways-lr; text-orientation: mixed";
    mergedStyle += `; ${getTableCellTextWrapStyle(textWrap)}`;
    mergedStyle = mergedStyle.replace(/^;/, "").trim();

    return [
      "th",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, getFormulaStateAttributes(HTMLAttributes), mergedStyle ? { style: mergedStyle } : {}),
      0,
    ];
  },
});

const CustomTaskList = TaskList.extend({
  addInputRules() {
    return [
      wrappingInputRule({
        find: /^\s*(\[ \]|\[\])\s$/,
        type: this.type,
      }),
      wrappingInputRule({
        find: /^\s*(-\s*\[ \]|-\s*\[\])\s$/,
        type: this.type,
      }),
      wrappingInputRule({
        find: /^\s*(\*\s*\[ \]|-\s*\[\])\s$/,
        type: this.type,
      }),
    ];
  },
});

type CommonLowlightRuntime = ReturnType<(typeof import("./lowlight-runtime"))["createCommonLowlightRuntime"]>;

let commonLowlightRuntime: CommonLowlightRuntime | null = null;
let commonLowlightLanguagesPromise: Promise<void> | null = null;

const lazyLowlight: LowlightInstance = {
  highlight: (language, code) => commonLowlightRuntime?.highlight(language, code) ?? {
    children: [{ value: code }],
  },
  highlightAuto: (code) => commonLowlightRuntime?.highlightAuto(code) ?? {
    children: [{ value: code }],
  },
  listLanguages: () => commonLowlightRuntime?.listLanguages() ?? [],
  registered: (language) => commonLowlightRuntime?.registered(language) ?? false,
};

function ensureCommonLowlightLanguages() {
  if (commonLowlightRuntime) return Promise.resolve();

  commonLowlightLanguagesPromise ??= import("./lowlight-runtime")
    .then(({ createCommonLowlightRuntime }) => {
      commonLowlightRuntime = createCommonLowlightRuntime();
    })
    .catch((error) => {
      commonLowlightLanguagesPromise = null;
      throw error;
    });

  return commonLowlightLanguagesPromise;
}

const CustomCodeBlockLowlight = CodeBlockLowlight.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView);
  },

  addProseMirrorPlugins() {
    const parentPlugins = this.parent?.() ?? [];
    return [
      ...parentPlugins.filter((plugin) => {
        const key = (plugin.spec.key as unknown as { key?: string } | undefined)?.key;
        return !key?.startsWith("lowlight$");
      }),
      createOptimizedLowlightPlugin({
        defaultLanguage: this.options.defaultLanguage,
        ensureLanguages: ensureCommonLowlightLanguages,
        lowlight: this.options.lowlight,
        nodeName: this.name,
      }),
    ];
  },
});

export function buildUEditorExtensions({
  placeholder,
  translate,
  maxCharacters,
  uploadImage,
  uploadFile,
  imageInsertMode = "base64",
  maxImageFileSize,
  allowedImageMimeTypes,
  fallbackToDataUrl,
  editable = true,
  fetchMetadata,
}: {
  placeholder: string;
  translate: (key: string) => string;
  maxCharacters?: number;
  uploadImage?: (file: File) => Promise<string> | string;
  uploadFile?: (file: File) => Promise<string> | string;
  imageInsertMode?: "base64" | "upload";
  maxImageFileSize?: number;
  allowedImageMimeTypes?: string[];
  fallbackToDataUrl?: boolean;
  editable?: boolean;
  fetchMetadata?: (url: string) => Promise<{ title?: string; description?: string; image?: string; publisher?: string }>;
}) {
  return [
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
    BulletList.configure({
      HTMLAttributes: {
        class: "list-disc pl-6 my-2 space-y-1",
      },
    }),
    OrderedList.configure({
      HTMLAttributes: {
        class: "list-decimal pl-6 my-2 space-y-1",
      },
    }),
    ListItem.configure({
      HTMLAttributes: {
        class: "pl-1",
      },
    }),
    ListKeymap,
    CustomTaskList,
    TaskItem.configure({
      nested: true,
    }),
    Blockquote.configure({
      HTMLAttributes: {
        class: "border-l-4 border-primary pl-4 py-2 my-4 bg-muted/30 rounded-r-lg italic text-muted-foreground",
      },
    }),
    Code.configure({
      HTMLAttributes: {
        class: "px-1.5 py-0.5 rounded bg-muted font-mono text-sm",
      },
    }),
    CustomCodeBlockLowlight.configure({
      lowlight: lazyLowlight as CommonLowlightRuntime,
      HTMLAttributes: {
        class: "rounded-lg border border-border/60 bg-muted/40 text-foreground p-4 font-mono text-sm overflow-x-auto",
      },
    }),
    HorizontalRule,
    Gapcursor,
    Link.configure({
      openOnClick: false,
      isAllowedUri: (url) => isSafeUEditorUrl(url ?? "", "link"),
      HTMLAttributes: {
        class: "text-primary underline underline-offset-2 hover:text-primary/80 cursor-pointer",
      },
    }),
    ResizableImage,
    ClipboardImages.configure({
      upload: uploadImage,
      insertMode: imageInsertMode,
      ...(maxImageFileSize !== undefined ? { maxFileSize: maxImageFileSize } : {}),
      ...(allowedImageMimeTypes ? { allowedMimeTypes: allowedImageMimeTypes } : {}),
      ...(fallbackToDataUrl !== undefined ? { fallbackToDataUrl } : {}),
    }),
    TextStyle,
    FontFamily,
    FontSize,
    LineHeight,
    LetterSpacing,
    Indent,
    Color,
    Highlight.configure({
      multicolor: true,
    }),
    TextAlign.configure({
      types: ["heading", "paragraph", "image"],
    }),
    UEditorTable.configure({
      resizable: editable,
      handleWidth: 10,
      allowTableNodeSelection: true,
      HTMLAttributes: {
        class: "border-collapse my-4",
        style: "table-layout: fixed;",
      },
    }),
    UEditorTableRow,
    CustomTableCell.configure({
      HTMLAttributes: {
        class: "border border-black px-2 py-0 min-w-25",
      },
    }),
    CustomTableHeader.configure({
      HTMLAttributes: {
        class: "border border-black px-2 py-0 bg-muted font-semibold min-w-25",
      },
    }),
    TableFormulaRecalculation,
    CharacterCount.configure({
      limit: maxCharacters,
    }),
    Typography,
    History,
    UEditorPlaceholder.configure({
      placeholder,
      emptyEditorClass: "is-editor-empty",
      emptyNodeClass: "is-empty",
      shouldShow: ({ node, hasTable }) => {
        const nodeName = node.type.name;

        if (nodeName === "table" || nodeName === "tableCell" || nodeName === "tableHeader") {
          return false;
        }

        if (hasTable) {
          return false;
        }

        return true;
      },
    }),
    SlashCommand.configure({
      messages: buildSlashCommandMessages(translate),
    }),
    FormulaSuggestion,
    EmojiSuggestion,
    Callout,
    Bookmark.configure({
      fetchMetadata,
    }),
    FileCard.configure({
      upload: uploadFile,
    }),
    FormCheckbox,
    FormRadio,
  ];
}
