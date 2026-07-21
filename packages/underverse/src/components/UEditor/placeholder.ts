import type { Editor } from "@tiptap/core";
import { Extension, isNodeEmpty } from "@tiptap/core";
import type { Node as ProsemirrorNode } from "@tiptap/pm/model";
import type { EditorState } from "@tiptap/pm/state";
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

type PlaceholderCandidate = {
  hasAnchor: boolean;
  node: ProsemirrorNode;
  pos: number;
};

function documentHasTable(doc: ProsemirrorNode) {
  let hasTable = false;

  doc.descendants((node) => {
    if (node.type.name !== "table") return true;
    hasTable = true;
    return false;
  });

  return hasTable;
}

function getCurrentPlaceholderCandidates(selection: EditorState["selection"], includeChildren: boolean): PlaceholderCandidate[] {
  const { $anchor } = selection;
  if ($anchor.depth < 1) return [];

  const firstDepth = 1;
  const lastDepth = includeChildren ? $anchor.depth : 1;
  const candidates: PlaceholderCandidate[] = [];

  for (let depth = firstDepth; depth <= lastDepth; depth += 1) {
    const node = $anchor.node(depth);
    candidates.push({
      hasAnchor: true,
      node,
      pos: $anchor.before(depth),
    });
  }

  return candidates;
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

            const addDecoration = ({ hasAnchor, node, pos }: PlaceholderCandidate) => {
              const placeholderValue = typeof this.options.placeholder === "function"
                ? this.options.placeholder({ editor: this.editor, node, pos, hasAnchor })
                : this.options.placeholder;

              if (!placeholderValue) return;

              const classes = [this.options.emptyNodeClass];
              if (isEmptyDoc) classes.push(this.options.emptyEditorClass);

              decorations.push(
                Decoration.node(pos, pos + node.nodeSize, {
                  class: classes.join(" "),
                  [dataAttribute]: placeholderValue,
                }),
              );
            };

            if (this.options.showOnlyCurrent) {
              const candidates = getCurrentPlaceholderCandidates(
                selection,
                this.options.includeChildren,
              );

              for (const candidate of candidates) {
                const assumedHasTable = candidate.node.type.name === "table";
                if (!this.options.shouldShow({
                  editor: this.editor,
                  ...candidate,
                  isEmptyDoc,
                  hasTable: assumedHasTable,
                })) {
                  continue;
                }

                if (candidate.node.isLeaf || !isNodeEmpty(candidate.node)) continue;

                const hasTable = assumedHasTable || documentHasTable(doc);
                if (hasTable !== assumedHasTable && !this.options.shouldShow({
                  editor: this.editor,
                  ...candidate,
                  isEmptyDoc,
                  hasTable,
                })) {
                  continue;
                }

                addDecoration(candidate);
              }

              return DecorationSet.create(doc, decorations) as any;
            }

            hasTable = documentHasTable(doc);

            doc.descendants((node, pos) => {
              const hasAnchor = anchor >= pos && anchor <= pos + node.nodeSize;
              const isEmpty = !node.isLeaf && isNodeEmpty(node);

              if (!((hasAnchor || !this.options.showOnlyCurrent) && isEmpty)) {
                return this.options.includeChildren;
              }

              if (!this.options.shouldShow({ editor: this.editor, node, pos, hasAnchor, isEmptyDoc, hasTable })) {
                return this.options.includeChildren;
              }

              addDecoration({ hasAnchor, node, pos });

              return this.options.includeChildren;
            });

            // In this monorepo, ProseMirror types can be resolved from both the
            // root app and the package workspace, producing structurally equal
            // but nominally distinct DecorationSet types. Runtime is unaffected.
            return DecorationSet.create(doc, decorations) as any;
          },
        },
      }),
    ];
  },
});

export default UEditorPlaceholder;
