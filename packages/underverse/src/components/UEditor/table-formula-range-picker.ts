import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { TextSelection } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";
import { TableMap } from "@tiptap/pm/tables";
import { indexToColumnName } from "./table-formula";
import { resolveEventElement } from "./table-dom-utils";

export type FormulaRangePickState = {
  anchorLabel: string;
  anchorCell: HTMLTableCellElement;
  tablePos: number;
  insertedFrom: number;
  insertedTo: number;
  currentLabel: string;
  currentCell: HTMLTableCellElement;
};

export type FormulaRangePickHighlight = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function getCellText(cellNode: ProseMirrorNode) {
  return cellNode.textBetween(0, cellNode.content.size, "\n").trim();
}

function findSelectionFormulaCell(view: EditorView) {
  const { $from } = view.state.selection;

  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const node = $from.node(depth);
    if (node.type.name !== "tableCell" && node.type.name !== "tableHeader") continue;
    if (!getCellText(node).startsWith("=")) return null;

    const cellPos = $from.before(depth);
    const cellDom = view.nodeDOM(cellPos);
    const tableDepth = depth - 2;
    const tableNode = tableDepth > 0 ? $from.node(tableDepth) : null;
    if (!tableNode || tableNode.type.name !== "table") return null;

    return {
      cellDom: cellDom instanceof HTMLTableCellElement ? cellDom : null,
      tablePos: $from.before(tableDepth),
    };
  }

  return null;
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

function getPickedCellLabel(view: EditorView, target: EventTarget | null, tablePos: number) {
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
  if (nextLabel === pickState.currentLabel && currentCell === pickState.currentCell) return pickState;
  if (nextLabel === pickState.currentLabel) {
    return {
      ...pickState,
      currentCell,
    };
  }

  let tr = view.state.tr.insertText(nextLabel, pickState.insertedFrom, pickState.insertedTo);
  const nextTo = pickState.insertedFrom + nextLabel.length;
  tr = tr.setSelection(TextSelection.create(tr.doc, nextTo));
  view.dispatch(tr);

  return {
    ...pickState,
    insertedTo: nextTo,
    currentLabel: nextLabel,
    currentCell,
  };
}

export function beginFormulaRangePick(view: EditorView, event: MouseEvent): FormulaRangePickState | null {
  if (event.button !== 0) return null;

  const formulaCell = findSelectionFormulaCell(view);
  if (!formulaCell) return null;

  const picked = getPickedCellLabel(view, event.target, formulaCell.tablePos);
  if (!picked || picked.cell === formulaCell.cellDom) return null;

  const { from, to } = view.state.selection;
  let tr = view.state.tr.insertText(picked.label, from, to);
  tr = tr.setSelection(TextSelection.create(tr.doc, from + picked.label.length));
  view.dispatch(tr);
  view.focus();

  event.preventDefault();
  event.stopPropagation();

  return {
    anchorLabel: picked.label,
    anchorCell: picked.cell,
    tablePos: formulaCell.tablePos,
    insertedFrom: from,
    insertedTo: from + picked.label.length,
    currentLabel: picked.label,
    currentCell: picked.cell,
  };
}

export function updateFormulaRangePick(view: EditorView, pickState: FormulaRangePickState, event: MouseEvent) {
  const picked = getPickedCellLabel(view, event.target, pickState.tablePos);
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
  };
}
