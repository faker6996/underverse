import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { BookmarkView } from "./BookmarkView";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { sanitizeUEditorUrl } from "./url-safety";

export interface BookmarkOptions {
  fetchMetadata?: (url: string) => Promise<{ title?: string; description?: string; image?: string; publisher?: string }>;
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    bookmark: {
      /**
       * Insert a bookmark card
       */
      setBookmark: (attributes: { url: string; title?: string; description?: string; image?: string; publisher?: string }) => ReturnType;
    }
  }
}

const URL_REGEX = /^(https?:\/\/[^\s]+)$/i;

export const Bookmark = Node.create<BookmarkOptions>({
  name: "bookmark",

  group: "block",

  atom: true,

  addOptions() {
    return {
      fetchMetadata: undefined,
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      url: {
        default: "",
        parseHTML: (element) => sanitizeUEditorUrl(element.getAttribute("href") || element.getAttribute("data-url") || "", "link"),
        renderHTML: (attributes) => {
          const url = sanitizeUEditorUrl(String(attributes.url ?? ""), "link");
          return url ? { href: url, "data-url": url } : {};
        },
      },
      title: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-title") || "",
        renderHTML: (attributes) => ({
          "data-title": attributes.title,
        }),
      },
      description: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-description") || "",
        renderHTML: (attributes) => ({
          "data-description": attributes.description,
        }),
      },
      image: {
        default: "",
        parseHTML: (element) => sanitizeUEditorUrl(element.getAttribute("data-image") || "", "image"),
        renderHTML: (attributes) => {
          const image = sanitizeUEditorUrl(String(attributes.image ?? ""), "image");
          return image ? { "data-image": image } : {};
        },
      },
      publisher: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-publisher") || "",
        renderHTML: (attributes) => ({
          "data-publisher": attributes.publisher,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="bookmark"]',
      },
      {
        tag: 'a[data-type="bookmark"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { "data-type": "bookmark" }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(BookmarkView);
  },

  addCommands() {
    return {
      setBookmark:
        (attributes) =>
        ({ commands }) => {
          const url = sanitizeUEditorUrl(attributes.url, "link");
          if (!url) return false;
          const image = attributes.image ? sanitizeUEditorUrl(attributes.image, "image") : "";
          return commands.insertContent({
            type: this.name,
            attrs: { ...attributes, url, image },
          });
        },
    };
  },

  addProseMirrorPlugins() {
    const editor = this.editor;

    return [
      new Plugin({
        key: new PluginKey("bookmarkPaste"),
        props: {
          handlePaste(view, event) {
            if (!event || !event.clipboardData) return false;
            const text = event.clipboardData.getData("text/plain")?.trim();
            if (!text || !URL_REGEX.test(text)) return false;

            const { selection } = view.state;
            const parent = selection.$from.parent;
            const isEmptyParagraph = parent.type.name === "paragraph" && parent.content.size === 0;

            if (isEmptyParagraph) {
              event.preventDefault();
              editor
                .chain()
                .focus()
                .insertContent({
                  type: "bookmark",
                  attrs: { url: text },
                })
                .run();
              return true;
            }

            return false;
          },
        },
      }),
    ];
  },
});
