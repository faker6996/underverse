import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { BookmarkView } from "./BookmarkView";
import { Plugin, PluginKey } from "@tiptap/pm/state";

export interface BookmarkOptions {
  fetchMetadata?: (url: string) => Promise<{ title?: string; description?: string; image?: string; publisher?: string }>;
  HTMLAttributes: Record<string, any>;
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
        parseHTML: (element) => element.getAttribute("href") || element.getAttribute("data-url") || "",
        renderHTML: (attributes) => ({
          href: attributes.url,
          "data-url": attributes.url,
        }),
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
        parseHTML: (element) => element.getAttribute("data-image") || "",
        renderHTML: (attributes) => ({
          "data-image": attributes.image,
        }),
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
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
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
            console.log("DEBUG handlePaste name:", parent.type.name, "size:", parent.content.size);
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
