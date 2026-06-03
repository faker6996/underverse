import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { FileCardView } from "./FileCardView";

export interface FileCardOptions {
  HTMLAttributes: Record<string, any>;
  upload?: (file: File) => Promise<string> | string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fileCard: {
      /**
       * Insert a file card
       */
      setFileCard: (attributes: { src: string; fileName: string; fileSize?: number; fileType?: string }) => ReturnType;
    }
  }
}

export const FileCard = Node.create<FileCardOptions>({
  name: "fileCard",

  group: "block",

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      upload: undefined,
    };
  },

  addAttributes() {
    return {
      src: {
        default: "",
        parseHTML: (element) => element.getAttribute("href") || element.getAttribute("data-src") || "",
        renderHTML: (attributes) => ({
          href: attributes.src,
          "data-src": attributes.src,
        }),
      },
      fileName: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-file-name") || "",
        renderHTML: (attributes) => ({
          "data-file-name": attributes.fileName,
        }),
      },
      fileSize: {
        default: null,
        parseHTML: (element) => {
          const val = element.getAttribute("data-file-size");
          return val ? Number(val) : null;
        },
        renderHTML: (attributes) => {
          if (attributes.fileSize === null || attributes.fileSize === undefined) return {};
          return {
            "data-file-size": attributes.fileSize,
          };
        },
      },
      fileType: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-file-type") || "",
        renderHTML: (attributes) => ({
          "data-file-type": attributes.fileType,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="file-card"]',
      },
      {
        tag: 'a[data-type="file-card"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { "data-type": "file-card" }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileCardView);
  },

  addCommands() {
    return {
      setFileCard:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },
    };
  },
});
