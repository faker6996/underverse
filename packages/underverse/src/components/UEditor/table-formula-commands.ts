import type { Editor } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { selectedRect, setCellAttr, TableMap } from "@tiptap/pm/tables";
import { dispatchTableLayoutChange } from "./table-cell-commands";
import { evaluateBasicTableFormula, indexToColumnName } from "./table-formula";

type CellEntry = {
  index: number;
  node: ProseMirrorNode;
  relativePos: number;
};

function collectChildren(node: ProseMirrorNode) {
  const children: ProseMirrorNode[] = [];
  node.forEach((child) => children.push(child));
  return children;
}

function getTableRows(tableNode: ProseMirrorNode) {
  const rows: Array<{ node: ProseMirrorNode; cells: CellEntry[] }> = [];

  tableNode.forEach((rowNode, rowOffset) => {
    const cells: CellEntry[] = [];

    rowNode.forEach((cellNode, cellOffset, index) => {
      cells.push({
        index,
        node: cellNode,
        relativePos: rowOffset + 1 + cellOffset,
      });
    });

    rows.push({ node: rowNode, cells });
  });

  return rows;
}

function safeFindCell(map: TableMap, relativePos: number) {
  try {
    return map.findCell(relativePos);
  } catch {
    return null;
  }
}

function getCellText(cellNode: ProseMirrorNode) {
  return cellNode.textBetween(0, cellNode.content.size, "\n").trim();
}

function buildTableValueGetter(tableNode: ProseMirrorNode) {
  const map = TableMap.get(tableNode);
  const values = new Map<string, string | number>();

  for (const rowInfo of getTableRows(tableNode)) {
    for (const entry of rowInfo.cells) {
      const rect = safeFindCell(map, entry.relativePos);
      if (!rect) continue;

      const label = `${indexToColumnName(rect.left)}${rect.top + 1}`;
      const computedValue = entry.node.attrs.computedValue;
      values.set(label, typeof computedValue === "string" && computedValue.trim() ? computedValue : getCellText(entry.node));
    }
  }

  return (label: string) => values.get(label.toUpperCase());
}

function getFormulaComputedValue(formula: string, tableNode: ProseMirrorNode) {
  const result = evaluateBasicTableFormula(formula, buildTableValueGetter(tableNode));
  return result.error ? `#${result.error.toUpperCase()}` : String(result.value);
}

export function normalizeFormulaInput(formula: string) {
  const trimmed = formula.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("=") ? trimmed : `=${trimmed}`;
}

export function setSelectedTableCellFormula(editor: Editor, formula: string) {
  const normalized = normalizeFormulaInput(formula);
  const { state, view } = editor;

  if (!normalized) {
    const clearedFormula = setCellAttr("formula", null)(state, view.dispatch.bind(view));
    const clearedValue = setCellAttr("computedValue", null)(editor.state, view.dispatch.bind(view));
    if (clearedFormula || clearedValue) {
      view.focus();
      dispatchTableLayoutChange(editor);
      return true;
    }
    return false;
  }

  const rect = selectedRect(state);
  const computedValue = getFormulaComputedValue(normalized, rect.table);
  const appliedFormula = setCellAttr("formula", normalized)(state, view.dispatch.bind(view));
  const appliedValue = setCellAttr("computedValue", computedValue)(editor.state, view.dispatch.bind(view));

  if (appliedFormula || appliedValue) {
    view.focus();
    dispatchTableLayoutChange(editor);
    return true;
  }

  return false;
}

export function clearSelectedTableCellFormula(editor: Editor) {
  return setSelectedTableCellFormula(editor, "");
}

export function recalculateSelectedTable(editor: Editor) {
  const rect = selectedRect(editor.state);
  const tableNode = rect.table;
  const map = TableMap.get(tableNode);
  const getCellValue = buildTableValueGetter(tableNode);
  let changed = false;

  const rows = getTableRows(tableNode).map((rowInfo) => {
    const cells = collectChildren(rowInfo.node);

    for (const entry of rowInfo.cells) {
      const formula = typeof entry.node.attrs.formula === "string" ? entry.node.attrs.formula.trim() : "";
      if (!formula) continue;

      const rectForCell = safeFindCell(map, entry.relativePos);
      if (!rectForCell) continue;

      const result = evaluateBasicTableFormula(formula, getCellValue);
      const computedValue = result.error ? `#${result.error.toUpperCase()}` : String(result.value);
      if (entry.node.attrs.computedValue === computedValue) continue;

      cells[entry.index] = entry.node.type.create(
        {
          ...entry.node.attrs,
          computedValue,
        },
        entry.node.content,
        entry.node.marks,
      );
      changed = true;
    }

    return rowInfo.node.type.create(rowInfo.node.attrs, cells);
  });

  if (!changed) return false;

  const nextTable = tableNode.type.create(tableNode.attrs, rows);
  editor.view.dispatch(editor.state.tr.replaceWith(rect.tableStart - 1, rect.tableStart - 1 + tableNode.nodeSize, nextTable));
  dispatchTableLayoutChange(editor);
  return true;
}
