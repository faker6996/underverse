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
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import { common, createLowlight } from "lowlight";
import { SlashCommand } from "./slash-command";
import { ClipboardImages } from "./clipboard-images";
import { EmojiSuggestion } from "./emoji-suggestion";
import ResizableImage from "./resizable-image";

const lowlight = createLowlight(common);

export function buildUEditorExtensions({
  placeholder,
  maxCharacters,
  uploadImage,
  imageInsertMode = "base64",
  editable = true,
}: {
  placeholder: string;
  maxCharacters?: number;
  uploadImage?: (file: File) => Promise<string> | string;
  imageInsertMode?: "base64" | "upload";
  editable?: boolean;
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
    TaskList,
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
    CodeBlockLowlight.configure({
      lowlight,
      HTMLAttributes: {
        "data-os-scrollbar": "true",
        class: "rounded-lg bg-[#1e1e1e] p-4 font-mono text-sm overflow-x-auto",
      },
    }),
    HorizontalRule,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: "text-primary underline underline-offset-2 hover:text-primary/80 cursor-pointer",
      },
    }),
    ResizableImage,
    ClipboardImages.configure({ upload: uploadImage, insertMode: imageInsertMode }),
    TextStyle,
    Color,
    Highlight.configure({
      multicolor: true,
    }),
    TextAlign.configure({
      types: ["heading", "paragraph", "image"],
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
        class: "border border-border p-2 min-w-25",
      },
    }),
    TableHeader.configure({
      HTMLAttributes: {
        class: "border border-border p-2 bg-muted font-semibold min-w-25",
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
    SlashCommand,
    EmojiSuggestion,
  ];
}
