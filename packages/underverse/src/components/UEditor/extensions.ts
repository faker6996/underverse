import { mergeAttributes } from "@tiptap/core";
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
import { wrappingInputRule } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { Callout } from "./callout";
import { Bookmark } from "./bookmark";
import { FileCard } from "./file-card";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import History from "@tiptap/extension-history";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import CharacterCount from "@tiptap/extension-character-count";
import Typography from "@tiptap/extension-typography";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import Gapcursor from "@tiptap/extension-gapcursor";
import { common, createLowlight } from "lowlight";
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
import UEditorTable from "./table-align";
import { isSafeUEditorUrl } from "./url-safety";
import { CodeBlockView } from "./CodeBlockView";

function getFormulaStateAttributes(attributes: Record<string, any>) {
  const formula = attributes["data-formula"];
  if (!formula) {
    return {};
  }

  const computedValue = String(attributes["data-computed-value"] ?? "");
  return {
    "data-formula-state": computedValue.startsWith("#") ? "error" : "computed",
  };
}

const CustomTableCell = TableCell.extend({
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
    };
  },

  renderHTML({ HTMLAttributes }) {
    const style = HTMLAttributes.style || "";
    const bg = HTMLAttributes["data-background-color"];
    const borderColor = HTMLAttributes["data-border-color"];
    const borderStyle = HTMLAttributes["data-border-style"];
    const borderWidth = HTMLAttributes["data-border-width"];

    let mergedStyle = style;
    if (bg) mergedStyle += `; background-color: ${bg}`;
    if (borderColor) mergedStyle += `; border-color: ${borderColor}`;
    if (borderStyle) mergedStyle += `; border-style: ${borderStyle}`;
    if (borderWidth) mergedStyle += `; border-width: ${borderWidth}`;
    mergedStyle = mergedStyle.replace(/^;/, "").trim();

    return [
      "td",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, getFormulaStateAttributes(HTMLAttributes), mergedStyle ? { style: mergedStyle } : {}),
      0,
    ];
  },
});

const CustomTableHeader = TableHeader.extend({
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
    };
  },

  renderHTML({ HTMLAttributes }) {
    const style = HTMLAttributes.style || "";
    const bg = HTMLAttributes["data-background-color"];
    const borderColor = HTMLAttributes["data-border-color"];
    const borderStyle = HTMLAttributes["data-border-style"];
    const borderWidth = HTMLAttributes["data-border-width"];

    let mergedStyle = style;
    if (bg) mergedStyle += `; background-color: ${bg}`;
    if (borderColor) mergedStyle += `; border-color: ${borderColor}`;
    if (borderStyle) mergedStyle += `; border-style: ${borderStyle}`;
    if (borderWidth) mergedStyle += `; border-width: ${borderWidth}`;
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

const lowlight = createLowlight(common);

const CustomCodeBlockLowlight = CodeBlockLowlight.extend({
  addNodeView() {
    return ReactNodeViewRenderer(CodeBlockView);
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
      lowlight,
      HTMLAttributes: {
        class: "rounded-lg border border-border/60 bg-muted/40 text-foreground p-4 font-mono text-sm overflow-x-auto",
      },
    }),
    HorizontalRule,
    Gapcursor,
    Link.configure({
      openOnClick: false,
      protocols: ["http", "https", "mailto", "tel"],
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
      },
    }),
    UEditorTableRow,
    CustomTableCell.configure({
      HTMLAttributes: {
        class: "border border-border p-2 min-w-25",
      },
    }),
    CustomTableHeader.configure({
      HTMLAttributes: {
        class: "border border-border p-2 bg-muted font-semibold min-w-25",
      },
    }),
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
  ];
}
