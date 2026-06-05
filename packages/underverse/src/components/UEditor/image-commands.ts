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

function toPositiveNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }
  return null;
}

function getImageElementAtSelection(editor: Editor, pos: number): HTMLImageElement | null {
  const nodeDom = editor.view.nodeDOM(pos);
  if (!(nodeDom instanceof HTMLElement)) return null;
  if (nodeDom.tagName === "IMG") return nodeDom as HTMLImageElement;
  return nodeDom.querySelector("img");
}

function getImageAspectRatio(editor: Editor, attrs: Record<string, unknown>, pos?: number): number | null {
  const widthAttr = toPositiveNumber(attrs.width);
  const heightAttr = toPositiveNumber(attrs.height);
  if (widthAttr && heightAttr) return widthAttr / heightAttr;

  const imageElement = typeof pos === "number" ? getImageElementAtSelection(editor, pos) : null;
  if (!imageElement) return null;

  if (imageElement.naturalWidth > 0 && imageElement.naturalHeight > 0) {
    return imageElement.naturalWidth / imageElement.naturalHeight;
  }

  const rect = imageElement.getBoundingClientRect();
  if (rect.width > 0 && rect.height > 0) return rect.width / rect.height;

  const width = toPositiveNumber(imageElement.getAttribute("width")) ?? toPositiveNumber(imageElement.style.width);
  const height = toPositiveNumber(imageElement.getAttribute("height")) ?? toPositiveNumber(imageElement.style.height);
  return width && height ? width / height : null;
}

function getImagePresetAttributes(editor: Editor, width: number, preset: UEditorImageWidthPreset, attrs: Record<string, unknown>, pos?: number) {
  const aspect = getImageAspectRatio(editor, attrs, pos);

  return {
    width,
    height: aspect ? Math.round(width / aspect) : toPositiveNumber(attrs.height),
    imageWidthPreset: preset,
  };
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
  const attrs = editor.getAttributes("image") as { imageLayout?: string } & Record<string, unknown>;
  const mode = attrs.imageLayout === "left" || attrs.imageLayout === "right" ? "wrap" : "block";
  const width = IMAGE_WIDTHS_BY_LAYOUT[mode][preset];
  if (!isSelectedImage(editor)) {
    editor.chain().focus().updateAttributes("image", getImagePresetAttributes(editor, width, preset, attrs)).run();
    return;
  }

  const { state, view } = editor;
  const selection = state.selection as NodeSelection;
  const nextAttrs = getImagePresetAttributes(editor, width, preset, selection.node.attrs, selection.from);
  const transaction = state.tr.setNodeMarkup(selection.from, undefined, {
    ...selection.node.attrs,
    ...nextAttrs,
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
