import type { Editor } from "@tiptap/core";
import type { EditorState } from "@tiptap/pm/state";
import type { Node as ProseMirrorNode, ResolvedPos } from "@tiptap/pm/model";
import type { UEditorTableAlign } from "./table-align";

type TableNodeInfo = {
  depth: number;
  pos: number;
  node: ProseMirrorNode;
};

function findTableNodeInfoAtResolvedPos($pos: ResolvedPos): TableNodeInfo | null {
  for (let depth = $pos.depth; depth > 0; depth -= 1) {
    const node = $pos.node(depth);
    if (node.type.name === "table") {
      return {
        depth,
        pos: $pos.before(depth),
        node,
      };
    }
  }

  return null;
}

export function findTableNodeInfoFromState(state: EditorState, anchorPos?: number): TableNodeInfo | null {
  if (typeof anchorPos === "number" && Number.isFinite(anchorPos)) {
    const safePos = Math.max(0, Math.min(anchorPos, state.doc.content.size));
    return findTableNodeInfoAtResolvedPos(state.doc.resolve(safePos));
  }

  return findTableNodeInfoAtResolvedPos(state.selection.$from);
}

export function applyTableAlignment(editor: Editor, tableAlign: UEditorTableAlign | null, anchorPos?: number) {
  const tableInfo = findTableNodeInfoFromState(editor.state, anchorPos);
  if (!tableInfo) return false;

  editor.view.dispatch(
    editor.state.tr.setNodeMarkup(tableInfo.pos, tableInfo.node.type, {
      ...tableInfo.node.attrs,
      tableAlign,
    }),
  );

  const tableDom = editor.view.nodeDOM(tableInfo.pos);
  const tableElement = tableDom instanceof HTMLTableElement
    ? tableDom
    : tableDom instanceof HTMLElement
      ? tableDom.querySelector("table")
      : null;

  if (tableElement instanceof HTMLTableElement) {
    if (tableAlign) {
      tableElement.setAttribute("data-table-align", tableAlign);
      tableElement.style.width = "max-content";
      tableElement.style.maxWidth = "100%";
      tableElement.style.marginLeft = tableAlign === "center" || tableAlign === "right" ? "auto" : "0";
      tableElement.style.marginRight = tableAlign === "center" ? "auto" : tableAlign === "right" ? "0" : "auto";
    } else {
      tableElement.removeAttribute("data-table-align");
      tableElement.style.removeProperty("width");
      tableElement.style.removeProperty("max-width");
      tableElement.style.removeProperty("margin-left");
      tableElement.style.removeProperty("margin-right");
    }
  }

  return true;
}
