import type { Editor } from "@tiptap/core";
import { Extension, isNodeEmpty } from "@tiptap/core";
import type { Node as ProsemirrorNode } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export interface UEditorPlaceholderOptions {
  emptyEditorClass: string;
  emptyNodeClass: string;
  dataAttribute: string;
  placeholder:
    | ((props: { editor: Editor; node: ProsemirrorNode; pos: number; hasAnchor: boolean }) => string)
    | string;
  showOnlyWhenEditable: boolean;
  showOnlyCurrent: boolean;
  includeChildren: boolean;
  shouldShow: (props: {
    editor: Editor;
    node: ProsemirrorNode;
    pos: number;
    hasAnchor: boolean;
    isEmptyDoc: boolean;
    hasTable: boolean;
  }) => boolean;
}

export const UEditorPlaceholder = Extension.create<UEditorPlaceholderOptions>({
  name: "placeholder",

  addOptions() {
    return {
      emptyEditorClass: "is-editor-empty",
      emptyNodeClass: "is-empty",
      dataAttribute: "placeholder",
      placeholder: "Write something...",
      showOnlyWhenEditable: true,
      showOnlyCurrent: true,
      includeChildren: false,
      shouldShow: () => true,
    };
  },

  addProseMirrorPlugins() {
    const dataAttribute = `data-${this.options.dataAttribute}`;

    return [
      new Plugin({
        key: new PluginKey("placeholder"),
        props: {
          decorations: ({ doc, selection }) => {
            const active = this.editor.isEditable || !this.options.showOnlyWhenEditable;
            const { anchor } = selection;
            const decorations: Decoration[] = [];
            let hasTable = false;

            if (!active) {
              return null;
            }

            const isEmptyDoc = this.editor.isEmpty;

            doc.descendants((node) => {
              if (node.type.name === "table") {
                hasTable = true;
                return false;
              }

              return undefined;
            });

            doc.descendants((node, pos) => {
              const hasAnchor = anchor >= pos && anchor <= pos + node.nodeSize;
              const isEmpty = !node.isLeaf && isNodeEmpty(node);

              if (!((hasAnchor || !this.options.showOnlyCurrent) && isEmpty)) {
                return this.options.includeChildren;
              }

              if (!this.options.shouldShow({ editor: this.editor, node, pos, hasAnchor, isEmptyDoc, hasTable })) {
                return this.options.includeChildren;
              }

              const placeholderValue = typeof this.options.placeholder === "function"
                ? this.options.placeholder({ editor: this.editor, node, pos, hasAnchor })
                : this.options.placeholder;

              if (!placeholderValue) {
                return this.options.includeChildren;
              }

              const classes = [this.options.emptyNodeClass];

              if (isEmptyDoc) {
                classes.push(this.options.emptyEditorClass);
              }

              decorations.push(
                Decoration.node(pos, pos + node.nodeSize, {
                  class: classes.join(" "),
                  [dataAttribute]: placeholderValue,
                }),
              );

              return this.options.includeChildren;
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});

export default UEditorPlaceholder;
