import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { FormCheckboxView } from "./FormCheckboxView";

export interface FormCheckboxOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    formCheckbox: {
      /**
       * Insert a form checkbox node
       */
      setFormCheckbox: (attributes?: { checked?: boolean; id?: string; name?: string }) => ReturnType;
    }
  }
}

export const FormCheckbox = Node.create<FormCheckboxOptions>({
  name: "formCheckbox",

  group: "inline",

  inline: true,

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      checked: {
        default: false,
        parseHTML: (element) => {
          const checked = element.getAttribute("data-checked") || element.getAttribute("checked");
          if (checked === "true" || checked === "") return true;
          if (element instanceof HTMLInputElement) {
            return element.checked;
          }
          return false;
        },
        renderHTML: (attributes) => {
          if (!attributes.checked) return {};
          return {
            "data-checked": "true",
            checked: "checked",
          };
        },
      },
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-id") || element.getAttribute("id") || `chk-${Math.random().toString(36).substring(2, 9)}`,
        renderHTML: (attributes) => {
          if (!attributes.id) return {};
          return {
            "data-id": attributes.id,
            id: attributes.id,
          };
        },
      },
      name: {
        default: "",
        parseHTML: (element) => element.getAttribute("name") || "",
        renderHTML: (attributes) => {
          if (!attributes.name) return {};
          return {
            name: attributes.name,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'input[type="checkbox"][data-type="form-checkbox"]',
      },
      {
        tag: 'span[data-type="form-checkbox"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "input",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        type: "checkbox",
        "data-type": "form-checkbox",
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FormCheckboxView);
  },

  addCommands() {
    return {
      setFormCheckbox:
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
