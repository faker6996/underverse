import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { FileCardView } from "./FileCardView";
import { sanitizeUEditorUrl } from "./url-safety";

export interface FileCardOptions {
  HTMLAttributes: Record<string, unknown>;
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
        parseHTML: (element) => sanitizeUEditorUrl(element.getAttribute("href") || element.getAttribute("data-src") || "", "file"),
        renderHTML: (attributes) => {
          const src = sanitizeUEditorUrl(String(attributes.src ?? ""), "file");
          return src ? { href: src, "data-src": src } : {};
        },
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
          const rawValue = element.getAttribute("data-file-size");
          const value = rawValue ? Number(rawValue) : Number.NaN;
          return Number.isFinite(value) && value >= 0 ? value : null;
        },
        renderHTML: (attributes) => {
          const fileSize = Number(attributes.fileSize);
          if (!Number.isFinite(fileSize) || fileSize < 0) return {};
          return {
            "data-file-size": fileSize,
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
          const src = sanitizeUEditorUrl(attributes.src, "file");
          if (!src) return false;
          const fileSize = Number(attributes.fileSize);
          return commands.insertContent({
            type: this.name,
            attrs: {
              ...attributes,
              src,
              fileSize: Number.isFinite(fileSize) && fileSize >= 0 ? fileSize : null,
            },
          });
        },
    };
  },
});
