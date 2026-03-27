import type { Editor } from "@tiptap/core";
import { NodeSelection, TextSelection } from "@tiptap/pm/state";

export type UEditorImageLayout = "block" | "left" | "right";
export type UEditorImageWidthPreset = "sm" | "md" | "lg";

const IMAGE_WIDTHS_BY_LAYOUT: Record<"block" | "wrap", Record<UEditorImageWidthPreset, number>> = {
  block: {
    sm: 180,
    md: 280,
    lg: 380,
  },
  wrap: {
    sm: 140,
    md: 200,
    lg: 260,
  },
};

function isSelectedImage(editor: Editor) {
  const { selection } = editor.state;
  return selection instanceof NodeSelection && selection.node.type.name === "image";
}

export function applyImageLayout(editor: Editor, layout: UEditorImageLayout) {
  const { state, view } = editor;
  const { selection, schema } = state;

  if (!(selection instanceof NodeSelection) || selection.node.type.name !== "image") {
    editor.chain().focus().updateAttributes("image", { imageLayout: layout }).run();
    return;
  }

  let transaction = state.tr.setNodeMarkup(selection.from, undefined, {
    ...selection.node.attrs,
    imageLayout: layout,
  });

  if (layout !== "block") {
    const nextPos = transaction.mapping.map(selection.to);
    const nextNode = transaction.doc.nodeAt(nextPos);

    if (!nextNode || nextNode.type.name !== "paragraph") {
      const paragraph = schema.nodes.paragraph?.create();
      if (paragraph) {
        transaction = transaction.insert(nextPos, paragraph);
      }
    }

    const resolvedPos = transaction.doc.resolve(Math.min(nextPos + 1, transaction.doc.content.size));
    transaction = transaction.setSelection(TextSelection.near(resolvedPos));
  } else {
    const resolvedPos = transaction.doc.resolve(selection.from);
    transaction = transaction.setSelection(NodeSelection.create(transaction.doc, resolvedPos.pos));
  }

  view.dispatch(transaction.scrollIntoView());
  view.focus();
}

export function applyImageWidthPreset(editor: Editor, preset: UEditorImageWidthPreset) {
  const attrs = editor.getAttributes("image") as { imageLayout?: string };
  const mode = attrs.imageLayout === "left" || attrs.imageLayout === "right" ? "wrap" : "block";
  const width = IMAGE_WIDTHS_BY_LAYOUT[mode][preset];
  if (!isSelectedImage(editor)) {
    editor.chain().focus().updateAttributes("image", { width, imageWidthPreset: preset }).run();
    return;
  }

  const { state, view } = editor;
  const selection = state.selection as NodeSelection;
  const transaction = state.tr.setNodeMarkup(selection.from, undefined, {
    ...selection.node.attrs,
    width,
    imageWidthPreset: preset,
  });
  view.dispatch(transaction.scrollIntoView());
  view.focus();
}

export function resetImageSize(editor: Editor) {
  if (!isSelectedImage(editor)) {
    editor.chain().focus().updateAttributes("image", {
      width: null,
      height: null,
      imageWidthPreset: null,
    }).run();
    return;
  }

  const { state, view } = editor;
  const selection = state.selection as NodeSelection;
  const transaction = state.tr.setNodeMarkup(selection.from, undefined, {
    ...selection.node.attrs,
    width: null,
    height: null,
    imageWidthPreset: null,
  });
  view.dispatch(transaction.scrollIntoView());
  view.focus();
}

export function deleteSelectedImage(editor: Editor) {
  if (!isSelectedImage(editor)) return;
  editor.chain().focus().deleteSelection().run();
}
