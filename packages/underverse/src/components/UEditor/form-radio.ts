import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { FormRadioView } from "./FormRadioView";

export interface FormRadioOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    formRadio: {
      /**
       * Insert a form radio button node
       */
      setFormRadio: (attributes?: { checked?: boolean; id?: string; name?: string; value?: string }) => ReturnType;
      /**
       * Check a specific radio button by ID and uncheck others in the same group
       */
      checkFormRadio: (id: string) => ReturnType;
    }
  }
}

export const FormRadio = Node.create<FormRadioOptions>({
  name: "formRadio",

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
        parseHTML: (element) => element.getAttribute("data-id") || element.getAttribute("id") || `rad-${Math.random().toString(36).substring(2, 9)}`,
        renderHTML: (attributes) => {
          if (!attributes.id) return {};
          return {
            "data-id": attributes.id,
            id: attributes.id,
          };
        },
      },
      name: {
        default: "radio-group",
        parseHTML: (element) => element.getAttribute("name") || element.getAttribute("data-group") || "radio-group",
        renderHTML: (attributes) => {
          if (!attributes.name) return {};
          return {
            name: attributes.name,
            "data-group": attributes.name,
          };
        },
      },
      value: {
        default: "",
        parseHTML: (element) => element.getAttribute("value") || "",
        renderHTML: (attributes) => {
          if (!attributes.value) return {};
          return {
            value: attributes.value,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'input[type="radio"][data-type="form-radio"]',
      },
      {
        tag: 'span[data-type="form-radio"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "input",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        type: "radio",
        "data-type": "form-radio",
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FormRadioView);
  },

  addCommands() {
    return {
      setFormRadio:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },

      checkFormRadio:
        (id) =>
        ({ tr, dispatch }) => {
          if (!dispatch) return true;

          let targetGroupName = "";
          let targetPos = -1;

          // Find the group name of the clicked radio button
          tr.doc.descendants((node, pos) => {
            if (node.type.name === "formRadio" && node.attrs.id === id) {
              targetGroupName = node.attrs.name;
              targetPos = pos;
              return false; // stop scanning
            }
            return true;
          });

          if (targetPos === -1) return false;

          // Check the clicked one, uncheck other radios in the same group name
          tr.doc.descendants((node, pos) => {
            if (node.type.name === "formRadio") {
              if (pos === targetPos) {
                if (!node.attrs.checked) {
                  tr.setNodeMarkup(pos, undefined, { ...node.attrs, checked: true });
                }
              } else if (node.attrs.name === targetGroupName && node.attrs.checked) {
                tr.setNodeMarkup(pos, undefined, { ...node.attrs, checked: false });
              }
            }
            return true;
          });

          return true;
        },
    };
  },
});
