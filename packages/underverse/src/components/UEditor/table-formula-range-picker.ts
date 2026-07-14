import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { TextSelection } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";
import { TableMap } from "@tiptap/pm/tables";
import {
  buildTableFormulaDependencyGraph,
  getTableCellRangeLabels,
  indexToColumnName,
  parseTableCellRange,
  type TableFormulaCell,
} from "./table-formula";
import { resolveEventElement } from "./table-dom-utils";

export type FormulaRangePickState = {
  anchorLabel: string;
  anchorCell: HTMLTableCellElement;
  tablePos: number;
  insertedFrom: number;
  insertedTo: number;
  currentLabel: string;
  currentCell: HTMLTableCellElement;
  blocked: boolean;
  formulaCellLabel: string;
};

export type FormulaRangePickHighlight = {
  left: number;
  top: number;
  width: number;
  height: number;
  blocked: boolean;
};

function getCellText(cellNode: ProseMirrorNode) {
  return cellNode.textBetween(0, cellNode.content.size, "\n").trim();
}

export function getFormulaEditingTableContext(view: EditorView) {
  const { $from } = view.state.selection;

  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const node = $from.node(depth);
    if (node.type.name !== "tableCell" && node.type.name !== "tableHeader") continue;
    if (!getCellText(node).startsWith("=")) return null;

    const cellPos = $from.before(depth);
    const cellDom = view.nodeDOM(cellPos);
    if (!(cellDom instanceof HTMLTableCellElement)) return null;
    const tableDepth = depth - 2;
    const tableNode = tableDepth > 0 ? $from.node(tableDepth) : null;
    if (!tableNode || tableNode.type.name !== "table") return null;
    const tableDom = cellDom.closest("table");
    if (!(tableDom instanceof HTMLTableElement)) return null;
    const tableMap = TableMap.get(tableNode);
    const tableStart = $from.start(tableDepth);
    const formulaCellRect = tableMap.findCell(cellPos - tableStart);

    return {
      cellContentEnd: $from.end(depth),
      cellContentStart: $from.start(depth),
      cellDom,
      formula: getCellText(node),
      tableDom,
      tableNode,
      tablePos: $from.before(tableDepth),
      formulaCellLabel: `${indexToColumnName(formulaCellRect.left)}${formulaCellRect.top + 1}`,
    };
  }

  return null;
}

function collectTableFormulaCells(tableNode: ProseMirrorNode) {
  const tableMap = TableMap.get(tableNode);
  const formulas: TableFormulaCell[] = [];

  tableNode.forEach((rowNode, rowOffset) => {
    rowNode.forEach((cellNode, cellOffset) => {
      const formula = typeof cellNode.attrs.formula === "string" ? cellNode.attrs.formula.trim() : "";
      if (!formula) return;

      const rect = tableMap.findCell(rowOffset + 1 + cellOffset);
      formulas.push({
        label: `${indexToColumnName(rect.left)}${rect.top + 1}`,
        formula,
      });
    });
  });

  return formulas;
}

export function getFormulaCycleBlockedLabels(tableNode: ProseMirrorNode, formulaCellLabel: string) {
  const graph = buildTableFormulaDependencyGraph(collectTableFormulaCells(tableNode));
  const blocked = new Set<string>();
  const queue = [formulaCellLabel.toUpperCase()];

  for (let index = 0; index < queue.length; index += 1) {
    const label = queue[index];
    if (!label || blocked.has(label)) continue;
    blocked.add(label);
    for (const dependent of graph.dependents.get(label) ?? []) {
      if (!blocked.has(dependent)) queue.push(dependent);
    }
  }

  return blocked;
}

function getReferenceLabels(reference: string) {
  const range = parseTableCellRange(reference);
  return range ? getTableCellRangeLabels(range) : [reference.toUpperCase()];
}

function isBlockedFormulaReference(tableNode: ProseMirrorNode, formulaCellLabel: string, reference: string) {
  const blockedLabels = getFormulaCycleBlockedLabels(tableNode, formulaCellLabel);
  return getReferenceLabels(reference).some((label) => blockedLabels.has(label));
}

export function cancelFormulaEditing(view: EditorView) {
  const context = getFormulaEditingTableContext(view);
  if (!context) return false;

  let tr = view.state.tr.delete(context.cellContentStart, context.cellContentEnd);
  const selectionPos = Math.min(context.cellContentStart, tr.doc.content.size);
  tr = tr.setSelection(TextSelection.near(tr.doc.resolve(selectionPos)));
  view.dispatch(tr);
  view.focus();
  return true;
}

function getReferenceInsertionPrefix(view: EditorView, cellContentStart: number, insertionPos: number) {
  const textBeforeCursor = view.state.doc.textBetween(cellContentStart, insertionPos, "", "");
  const isInsideFunctionArguments = /[A-Z]+\([^)]*$/i.test(textBeforeCursor);
  const followsReference = /[A-Z]+[1-9]\d*(?::[A-Z]+[1-9]\d*)?\s*$/i.test(textBeforeCursor);

  return isInsideFunctionArguments && followsReference ? "," : "";
}

function findTableForPos(view: EditorView, pos: number) {
  const $pos = view.state.doc.resolve(pos);

  for (let depth = $pos.depth; depth > 0; depth -= 1) {
    const node = $pos.node(depth);
    if (node.type.name === "table") {
      return {
        node,
        pos: $pos.before(depth),
        start: $pos.start(depth),
      };
    }
  }

  return null;
}

function getCellRelativePosFromDomPos(map: TableMap, tableStart: number, domPos: number) {
  const relativeDomPos = domPos - tableStart;
  const seen = new Set<number>();

  for (const relativeCellPos of map.map) {
    if (seen.has(relativeCellPos)) continue;
    seen.add(relativeCellPos);

    if (relativeDomPos === relativeCellPos || relativeDomPos === relativeCellPos + 1) {
      return relativeCellPos;
    }
  }

  return null;
}

export function getFormulaTableCellInfo(view: EditorView, target: EventTarget | null, tablePos: number) {
  const element = resolveEventElement(target);
  const cell = element?.closest?.("th,td");
  if (!(cell instanceof HTMLTableCellElement)) return null;

  const domPos = view.posAtDOM(cell, 0);
  const tableInfo = findTableForPos(view, domPos);
  if (!tableInfo || tableInfo.pos !== tablePos) return null;

  const map = TableMap.get(tableInfo.node);
  const relativeCellPos = getCellRelativePosFromDomPos(map, tableInfo.start, domPos);
  if (relativeCellPos == null) return null;

  const rect = map.findCell(relativeCellPos);
  return {
    cell,
    label: `${indexToColumnName(rect.left)}${rect.top + 1}`,
    rect,
  };
}

function normalizeFormulaRangeLabel(fromLabel: string, toLabel: string) {
  return fromLabel === toLabel ? fromLabel : `${fromLabel}:${toLabel}`;
}

function replacePickedLabel(
  view: EditorView,
  pickState: FormulaRangePickState,
  nextLabel: string,
  currentCell: HTMLTableCellElement,
) {
  const formulaContext = getFormulaEditingTableContext(view);
  const blocked = formulaContext
    ? isBlockedFormulaReference(formulaContext.tableNode, pickState.formulaCellLabel, nextLabel)
    : false;
  if (blocked) {
    return {
      ...pickState,
      blocked: true,
      currentCell,
    };
  }
  if (nextLabel === pickState.currentLabel && currentCell === pickState.currentCell && !pickState.blocked) return pickState;
  if (nextLabel === pickState.currentLabel) {
    return {
      ...pickState,
      blocked: false,
      currentCell,
    };
  }

  let tr = view.state.tr.insertText(nextLabel, pickState.insertedFrom, pickState.insertedTo);
  const nextTo = pickState.insertedFrom + nextLabel.length;
  tr = tr.setSelection(TextSelection.create(tr.doc, nextTo));
  view.dispatch(tr);

  return {
    ...pickState,
    blocked: false,
    insertedTo: nextTo,
    currentLabel: nextLabel,
    currentCell,
  };
}

export function beginFormulaRangePick(view: EditorView, event: MouseEvent): FormulaRangePickState | null {
  if (event.button !== 0) return null;

  const formulaCell = getFormulaEditingTableContext(view);
  if (!formulaCell) return null;

  const picked = getFormulaTableCellInfo(view, event.target, formulaCell.tablePos);
  if (!picked || picked.cell === formulaCell.cellDom) return null;

  const blocked = isBlockedFormulaReference(formulaCell.tableNode, formulaCell.formulaCellLabel, picked.label);
  if (blocked) {
    event.preventDefault();
    event.stopPropagation();
    return {
      anchorLabel: picked.label,
      anchorCell: picked.cell,
      tablePos: formulaCell.tablePos,
      insertedFrom: view.state.selection.from,
      insertedTo: view.state.selection.from,
      currentLabel: "",
      currentCell: picked.cell,
      blocked: true,
      formulaCellLabel: formulaCell.formulaCellLabel,
    };
  }

  const { from, to } = view.state.selection;
  const prefix = from === to ? getReferenceInsertionPrefix(view, formulaCell.cellContentStart, from) : "";
  const insertedText = `${prefix}${picked.label}`;
  const insertedFrom = from + prefix.length;
  let tr = view.state.tr.insertText(insertedText, from, to);
  tr = tr.setSelection(TextSelection.create(tr.doc, from + insertedText.length));
  view.dispatch(tr);
  view.focus();

  event.preventDefault();
  event.stopPropagation();

  return {
    anchorLabel: picked.label,
    anchorCell: picked.cell,
    tablePos: formulaCell.tablePos,
    insertedFrom,
    insertedTo: insertedFrom + picked.label.length,
    currentLabel: picked.label,
    currentCell: picked.cell,
    blocked: false,
    formulaCellLabel: formulaCell.formulaCellLabel,
  };
}

export function updateFormulaRangePick(view: EditorView, pickState: FormulaRangePickState, event: MouseEvent) {
  const picked = getFormulaTableCellInfo(view, event.target, pickState.tablePos);
  if (!picked) return pickState;

  event.preventDefault();
  event.stopPropagation();

  return replacePickedLabel(
    view,
    pickState,
    normalizeFormulaRangeLabel(pickState.anchorLabel, picked.label),
    picked.cell,
  );
}

export function getFormulaRangePickHighlight(
  container: HTMLElement,
  pickState: FormulaRangePickState,
): FormulaRangePickHighlight | null {
  if (!container.contains(pickState.anchorCell) || !container.contains(pickState.currentCell)) return null;

  const containerRect = container.getBoundingClientRect();
  const anchorRect = pickState.anchorCell.getBoundingClientRect();
  const currentRect = pickState.currentCell.getBoundingClientRect();

  const left = Math.min(anchorRect.left, currentRect.left) - containerRect.left + container.scrollLeft;
  const top = Math.min(anchorRect.top, currentRect.top) - containerRect.top + container.scrollTop;
  const right = Math.max(anchorRect.right, currentRect.right) - containerRect.left + container.scrollLeft;
  const bottom = Math.max(anchorRect.bottom, currentRect.bottom) - containerRect.top + container.scrollTop;

  return {
    left,
    top,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
    blocked: pickState.blocked,
  };
}
