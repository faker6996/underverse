import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { CalloutView } from "./CalloutView";

export interface CalloutOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      /**
       * Set a callout block
       */
      setCallout: (attributes?: { emoji?: string; backgroundColor?: string }) => ReturnType;
    }
  }
}

export const Callout = Node.create<CalloutOptions>({
  name: "callout",

  group: "block",

  content: "block+",

  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      emoji: {
        default: "💡",
        parseHTML: (element) => element.getAttribute("data-emoji") || "💡",
        renderHTML: (attributes) => ({
          "data-emoji": attributes.emoji,
        }),
      },
      backgroundColor: {
        default: "var(--muted)",
        parseHTML: (element) => element.getAttribute("data-background-color") || element.style.backgroundColor || "var(--muted)",
        renderHTML: (attributes) => ({
          "data-background-color": attributes.backgroundColor,
          style: `background-color: ${attributes.backgroundColor}`,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="callout"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { "data-type": "callout" }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutView);
  },

  addCommands() {
    return {
      setCallout:
        (attributes) =>
        ({ commands }) => {
          return commands.wrapIn(this.name, attributes);
        },
    };
  },
});
