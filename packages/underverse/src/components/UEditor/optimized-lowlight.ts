import { findChildren } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { Plugin, PluginKey, type Transaction } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

type LowlightNode = {
  children?: LowlightNode[];
  properties?: { className?: string[] };
  value?: string;
};

type LowlightResult = {
  children?: LowlightNode[];
  value?: LowlightNode[];
};

type LowlightInstance = {
  highlight: (language: string, code: string) => LowlightResult;
  highlightAuto: (code: string) => LowlightResult;
  listLanguages: () => string[];
  registered?: (language: string) => boolean;
};

function parseHighlightNodes(nodes: LowlightNode[], inheritedClasses: string[] = []) {
  return nodes.flatMap((node): Array<{ classes: string[]; text: string }> => {
    const classes = [...inheritedClasses, ...(node.properties?.className ?? [])];
    if (node.children) return parseHighlightNodes(node.children, classes);

    return [{
      classes,
      text: node.value ?? "",
    }];
  });
}

function getHighlightNodes(result: LowlightResult) {
  return result.value ?? result.children ?? [];
}

function highlightCode(lowlight: LowlightInstance, language: string | null | undefined, code: string) {
  if (language) {
    try {
      if (lowlight.listLanguages().includes(language) || lowlight.registered?.(language)) {
        return lowlight.highlight(language, code);
      }
    } catch {
      // Invalid or unregistered aliases fall back to automatic detection.
    }
  }

  return lowlight.highlightAuto(code);
}

function buildLowlightDecorations({
  defaultLanguage,
  doc,
  lowlight,
  nodeName,
}: {
  defaultLanguage: string | null | undefined;
  doc: ProseMirrorNode;
  lowlight: LowlightInstance;
  nodeName: string;
}) {
  const decorations: Decoration[] = [];

  for (const block of findChildren(doc, (node) => node.type.name === nodeName)) {
    let from = block.pos + 1;
    const language = block.node.attrs.language || defaultLanguage;
    const result = highlightCode(lowlight, language, block.node.textContent);

    for (const highlightedNode of parseHighlightNodes(getHighlightNodes(result))) {
      const to = from + highlightedNode.text.length;
      if (highlightedNode.classes.length > 0) {
        decorations.push(Decoration.inline(from, to, {
          class: highlightedNode.classes.join(" "),
        }));
      }
      from = to;
    }
  }

  return DecorationSet.create(doc, decorations);
}

function positionTouchesNode(doc: ProseMirrorNode, position: number, nodeName: string) {
  const safePosition = Math.max(0, Math.min(position, doc.content.size));
  const $position = doc.resolve(safePosition);

  for (let depth = $position.depth; depth > 0; depth -= 1) {
    if ($position.node(depth).type.name === nodeName) return true;
  }

  return $position.nodeBefore?.type.name === nodeName
    || $position.nodeAfter?.type.name === nodeName
    || doc.nodeAt(safePosition)?.type.name === nodeName;
}

function rangeContainsNode(doc: ProseMirrorNode, from: number, to: number, nodeName: string) {
  const safeFrom = Math.max(0, Math.min(from, doc.content.size));
  const safeTo = Math.max(safeFrom, Math.min(to, doc.content.size));
  if (safeFrom === safeTo) return positionTouchesNode(doc, safeFrom, nodeName);

  let found = false;
  doc.nodesBetween(safeFrom, safeTo, (node) => {
    if (node.type.name === nodeName) {
      found = true;
      return false;
    }
    return !found;
  });
  return found;
}

function fragmentContainsNode(fragment: { descendants?: (callback: (node: ProseMirrorNode) => boolean) => void } | undefined, nodeName: string) {
  if (!fragment?.descendants) return false;

  let found = false;
  fragment.descendants((node) => {
    if (node.type.name !== nodeName) return true;
    found = true;
    return false;
  });
  return found;
}

function transactionTouchesNode(transaction: Transaction, oldDoc: ProseMirrorNode, newDoc: ProseMirrorNode, nodeName: string) {
  if (!transaction.docChanged) return false;
  if (transaction.selection.$head.parent.type.name === nodeName) return true;

  const oldSelectionParent = transaction.before.resolve(
    Math.min(transaction.before.content.size, transaction.selection.from),
  ).parent;
  if (oldSelectionParent.type.name === nodeName) return true;

  for (const step of transaction.steps) {
    const structuralStep = step as unknown as {
      from?: number;
      pos?: number;
      slice?: { content?: { descendants?: (callback: (node: ProseMirrorNode) => boolean) => void } };
      to?: number;
    };

    if (fragmentContainsNode(structuralStep.slice?.content, nodeName)) return true;

    const from = structuralStep.from ?? structuralStep.pos;
    const to = structuralStep.to ?? structuralStep.pos;
    if (from === undefined || to === undefined) return true;
    if (rangeContainsNode(oldDoc, from, to, nodeName)) return true;

    const mappedFrom = transaction.mapping.map(from, -1);
    const mappedTo = transaction.mapping.map(to, 1);
    if (rangeContainsNode(newDoc, Math.min(mappedFrom, mappedTo), Math.max(mappedFrom, mappedTo), nodeName)) {
      return true;
    }
  }

  return false;
}

export function createOptimizedLowlightPlugin({
  defaultLanguage,
  lowlight,
  nodeName,
}: {
  defaultLanguage: string | null | undefined;
  lowlight: LowlightInstance;
  nodeName: string;
}) {
  const pluginKey = new PluginKey<DecorationSet>("ueditorLowlight");
  const createDecorations = (doc: ProseMirrorNode) => buildLowlightDecorations({
    defaultLanguage,
    doc,
    lowlight,
    nodeName,
  });

  return new Plugin<DecorationSet>({
    key: pluginKey,
    state: {
      init: (_, state) => createDecorations(state.doc),
      apply: (transaction, decorationSet, oldState, newState) => {
        if (transactionTouchesNode(transaction, oldState.doc, newState.doc, nodeName)) {
          return createDecorations(newState.doc);
        }

        return decorationSet.map(transaction.mapping, newState.doc);
      },
    },
    props: {
      decorations: (state) => pluginKey.getState(state),
    },
  });
}
