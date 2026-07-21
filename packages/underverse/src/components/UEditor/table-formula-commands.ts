import type { Editor } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { TextSelection, type EditorState, type Transaction } from "@tiptap/pm/state";
import { selectedRect, setCellAttr, TableMap } from "@tiptap/pm/tables";
import { dispatchTableLayoutChange } from "./table-cell-commands";
import {
  buildTableFormulaDependencyGraph,
  evaluateBasicTableFormula,
  getAffectedTableFormulaLabels,
  formatFormulaError,
  formatTableFormulaDisplayValue,
  getTableFormulaRecalculationOrder,
  indexToColumnName,
  isDraftTableFormula,
  normalizeTableFormula,
} from "./table-formula";

export const UEDITOR_TABLE_FORMULA_RECALCULATE_META = "ueditorTableFormulaRecalculate";
const TABLE_FORMULA_PLAN_CACHE_LIMIT = 50;

type TableFormulaPlan = {
  circular: Set<string>;
  graph: ReturnType<typeof buildTableFormulaDependencyGraph>;
  order: string[];
};

const tableFormulaPlanCache = new Map<string, TableFormulaPlan>();

type CellEntry = {
  node: ProseMirrorNode;
  relativePos: number;
};

type RelativeTableCellReplacement = {
  node: ProseMirrorNode;
  previousNode: ProseMirrorNode;
  relativePos: number;
};

type TableCellReplacement = {
  from: number;
  node: ProseMirrorNode;
  to: number;
};

function getTableFormulaPlan(cells: Array<{ formula: string; label: string }>) {
  const cacheKey = JSON.stringify(cells);
  const cached = tableFormulaPlanCache.get(cacheKey);
  if (cached) {
    tableFormulaPlanCache.delete(cacheKey);
    tableFormulaPlanCache.set(cacheKey, cached);
    return cached;
  }

  const graph = buildTableFormulaDependencyGraph(cells);
  const { order, circular } = getTableFormulaRecalculationOrder(graph);
  const plan = { circular, graph, order };
  tableFormulaPlanCache.set(cacheKey, plan);

  if (tableFormulaPlanCache.size > TABLE_FORMULA_PLAN_CACHE_LIMIT) {
    const oldestKey = tableFormulaPlanCache.keys().next().value;
    if (oldestKey !== undefined) tableFormulaPlanCache.delete(oldestKey);
  }

  return plan;
}

function getTableRows(tableNode: ProseMirrorNode) {
  const rows: Array<{ cells: CellEntry[] }> = [];

  tableNode.forEach((rowNode, rowOffset) => {
    const cells: CellEntry[] = [];

    rowNode.forEach((cellNode, cellOffset) => {
      cells.push({
        node: cellNode,
        relativePos: rowOffset + 1 + cellOffset,
      });
    });

    rows.push({ cells });
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

function buildTableCellLabelIndex(map: TableMap) {
  const labels = new Map<number, string>();

  for (let row = 0; row < map.height; row += 1) {
    const rowOffset = row * map.width;
    for (let column = 0; column < map.width; column += 1) {
      const relativePos = map.map[rowOffset + column];
      if (relativePos === undefined || labels.has(relativePos)) continue;
      labels.set(relativePos, `${indexToColumnName(column)}${row + 1}`);
    }
  }

  return labels;
}

function getCellText(cellNode: ProseMirrorNode) {
  return cellNode.textBetween(0, cellNode.content.size, "\n").trim();
}

function getSelectionTableCellNodeFromState(state: EditorState) {
  const { $from } = state.selection;

  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const node = $from.node(depth);
    if (node.type.name === "tableCell" || node.type.name === "tableHeader") {
      return node;
    }
  }

  return null;
}

function getSelectionTableCellNode(editor: Editor) {
  return getSelectionTableCellNodeFromState(editor.state);
}

function getSelectionTableCellPos(editor: Editor) {
  const cellSelection = editor.state.selection as { $anchorCell?: { pos?: unknown } };
  const anchorCellPos = cellSelection.$anchorCell?.pos;
  if (typeof anchorCellPos === "number") {
    const node = editor.state.doc.nodeAt(anchorCellPos);
    if (node?.type.name === "tableCell" || node?.type.name === "tableHeader") {
      return anchorCellPos;
    }
  }

  const { $from } = editor.state.selection;
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const node = $from.node(depth);
    if (node.type.name === "tableCell" || node.type.name === "tableHeader") {
      return $from.before(depth);
    }
  }

  return null;
}

type TableCellSelectionAnchor = {
  column: number;
  row: number;
  tablePos: number;
};

function getSelectionTableCellAnchor(editor: Editor) {
  const cellPos = getSelectionTableCellPos(editor);
  if (cellPos == null) return null;

  const node = editor.state.doc.nodeAt(cellPos);
  if (!node || (node.type.name !== "tableCell" && node.type.name !== "tableHeader")) return null;

  const $cell = editor.state.doc.resolve(Math.min(cellPos + 1, editor.state.doc.content.size));
  for (let depth = $cell.depth; depth > 0; depth -= 1) {
    const tableNode = $cell.node(depth);
    if (tableNode.type.name !== "table") continue;

    const tableStart = $cell.start(depth);
    const rect = safeFindCell(TableMap.get(tableNode), cellPos - tableStart);
    if (!rect) return null;

    return {
      cellPos,
      column: rect.left,
      label: `${indexToColumnName(rect.left)}${rect.top + 1}`,
      node,
      row: rect.top,
      tablePos: tableStart - 1,
    };
  }

  return null;
}

function restoreSelectionAtTableCell(editor: Editor, anchor: TableCellSelectionAnchor) {
  const tableNode = editor.state.doc.nodeAt(anchor.tablePos);
  if (!tableNode || tableNode.type.name !== "table") return false;

  const map = TableMap.get(tableNode);
  if (anchor.row >= map.height || anchor.column >= map.width) return false;

  const relativeCellPos = map.positionAt(anchor.row, anchor.column, tableNode);
  const cellPos = anchor.tablePos + 1 + relativeCellPos;
  const cellNode = editor.state.doc.nodeAt(cellPos);
  if (!cellNode || (cellNode.type.name !== "tableCell" && cellNode.type.name !== "tableHeader")) return false;

  const selectionPos = Math.min(cellPos + 2, editor.state.doc.content.size);
  editor.view.dispatch(
    editor.state.tr
      .setSelection(TextSelection.near(editor.state.doc.resolve(selectionPos)))
      .setMeta("addToHistory", false),
  );
  return true;
}

export type SelectedTableFormulaCell = {
  cellPos: number;
  computedValue: string;
  formula: string;
  formulaState: "computed" | "error";
  label: string;
  node: ProseMirrorNode;
  column: number;
  row: number;
  tablePos: number;
};

export function getSelectedTableFormulaCell(editor: Editor): SelectedTableFormulaCell | null {
  const selectedCell = getSelectionTableCellAnchor(editor);
  if (!selectedCell) return null;

  const formula = typeof selectedCell.node.attrs.formula === "string" ? selectedCell.node.attrs.formula.trim() : "";
  if (!formula) return null;

  const computedValue = typeof selectedCell.node.attrs.computedValue === "string" ? selectedCell.node.attrs.computedValue : "";
  return {
    ...selectedCell,
    computedValue,
    formula,
    formulaState: computedValue.startsWith("#") ? "error" : "computed",
  };
}

function getSelectionTableInfoFromState(state: EditorState) {
  const { $from } = state.selection;

  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const node = $from.node(depth);
    if (node.type.name === "table") {
      return {
        node,
        pos: $from.before(depth),
      };
    }
  }

  return null;
}

function getSelectionTableInfo(editor: Editor) {
  return getSelectionTableInfoFromState(editor.state);
}

function getSelectionTableCellLabelFromState(state: EditorState) {
  const { $from } = state.selection;
  let cellDepth = -1;
  let tableDepth = -1;

  for (let depth = $from.depth; depth > 0; depth -= 1) {
    const node = $from.node(depth);
    if (cellDepth < 0 && (node.type.name === "tableCell" || node.type.name === "tableHeader")) {
      cellDepth = depth;
    }
    if (node.type.name === "table") {
      tableDepth = depth;
      break;
    }
  }

  if (cellDepth < 0 || tableDepth < 0) return null;

  const tableNode = $from.node(tableDepth);
  const tableStart = $from.start(tableDepth);
  const relativeCellPos = $from.before(cellDepth) - tableStart;
  const rect = safeFindCell(TableMap.get(tableNode), relativeCellPos);
  if (!rect) return null;

  return `${indexToColumnName(rect.left)}${rect.top + 1}`;
}

function getSelectionTableCellLabel(editor: Editor) {
  return getSelectionTableCellLabelFromState(editor.state);
}

export function isEditingTableFormulaText(editor: Editor) {
  const cellNode = getSelectionTableCellNode(editor);
  return Boolean(cellNode && getCellText(cellNode).startsWith("="));
}

function isEditingTableFormulaTextInState(state: EditorState) {
  const cellNode = getSelectionTableCellNodeFromState(state);
  return Boolean(cellNode && getCellText(cellNode).startsWith("="));
}

function createCellDisplayContent(cellNode: ProseMirrorNode, displayValue: string) {
  const paragraphType = cellNode.type.schema.nodes.paragraph;

  if (!paragraphType || !displayValue) {
    return paragraphType ? [paragraphType.create()] : cellNode.content;
  }

  return [paragraphType.create(null, cellNode.type.schema.text(displayValue))];
}

function removeSelectedTableCellFormula(editor: Editor, clearContent: boolean) {
  const selectedCell = getSelectedTableFormulaCell(editor);
  if (!selectedCell) return false;

  const nextCell = selectedCell.node.type.create(
    {
      ...selectedCell.node.attrs,
      formula: null,
      computedValue: null,
    },
    clearContent ? createCellDisplayContent(selectedCell.node, "") : selectedCell.node.content,
    selectedCell.node.marks,
  );

  let transaction = editor.state.tr
    .replaceWith(selectedCell.cellPos, selectedCell.cellPos + selectedCell.node.nodeSize, nextCell)
    .setMeta(UEDITOR_TABLE_FORMULA_RECALCULATE_META, true);
  const selectionPos = Math.min(selectedCell.cellPos + 2, transaction.doc.content.size);
  transaction = transaction.setSelection(TextSelection.near(transaction.doc.resolve(selectionPos)));
  editor.view.dispatch(transaction);

  recalculateActiveTableFormulas(editor);
  restoreSelectionAtTableCell(editor, selectedCell);
  editor.view.focus();
  dispatchTableLayoutChange(editor);
  return true;
}

export function normalizeFormulaInput(formula: string) {
  const trimmed = formula.trim();
  if (!trimmed) return "";
  return trimmed.startsWith("=") ? trimmed : `=${trimmed}`;
}

export function setSelectedTableCellFormula(editor: Editor, formula: string) {
  const normalized = normalizeFormulaInput(formula);
  const { state, view } = editor;
  const selectionAnchor = getSelectionTableCellAnchor(editor);

  if (!normalized) {
    return clearSelectedTableCellFormula(editor);
  }

  const appliedFormula = setCellAttr("formula", normalized)(state, view.dispatch.bind(view));
  const clearedValue = setCellAttr("computedValue", null)(editor.state, view.dispatch.bind(view));

  if (appliedFormula || clearedValue) {
    recalculateActiveTableFormulas(editor);
    if (selectionAnchor) restoreSelectionAtTableCell(editor, selectionAnchor);
    view.focus();
    dispatchTableLayoutChange(editor);
    return true;
  }

  return false;
}

export function clearSelectedTableCellFormula(editor: Editor) {
  return removeSelectedTableCellFormula(editor, true);
}

export function convertSelectedTableCellFormulaToValue(editor: Editor) {
  return removeSelectedTableCellFormula(editor, false);
}

export function setSelectedTableCellNumberFormat(editor: Editor, numberFormat: string | null) {
  const value = numberFormat && numberFormat !== "text" ? numberFormat : null;
  const { state, view } = editor;
  const applied = setCellAttr("numberFormat", value)(state, view.dispatch.bind(view));
  if (!applied) return false;

  recalculateSelectedTable(editor);
  view.focus();
  dispatchTableLayoutChange(editor);
  return true;
}

function getPromotedFormulaCell(cellNode: ProseMirrorNode) {
  const text = getCellText(cellNode);
  const existingFormula = typeof cellNode.attrs.formula === "string" ? cellNode.attrs.formula.trim() : "";
  const existingComputedValue = typeof cellNode.attrs.computedValue === "string" ? cellNode.attrs.computedValue.trim() : "";

  if (text.startsWith("=")) {
    if (!normalizeTableFormula(text)) {
      if (!existingFormula && !existingComputedValue) return cellNode;

      return cellNode.type.create(
        {
          ...cellNode.attrs,
          formula: null,
          computedValue: null,
        },
        text === formatFormulaError("empty") ? createCellDisplayContent(cellNode, "") : cellNode.content,
        cellNode.marks,
      );
    }

    if (isDraftTableFormula(text)) return cellNode;

    const formula = normalizeFormulaInput(text);
    if (cellNode.attrs.formula === formula) return cellNode;

    return cellNode.type.create(
      {
        ...cellNode.attrs,
        formula,
        computedValue: null,
      },
      cellNode.content,
      cellNode.marks,
    );
  }

  if (!existingFormula || normalizeTableFormula(existingFormula)) return cellNode;

  return cellNode.type.create(
    {
      ...cellNode.attrs,
      formula: null,
      computedValue: null,
    },
    text === formatFormulaError("empty") ? createCellDisplayContent(cellNode, "") : cellNode.content,
    cellNode.marks,
  );
}

function recalculateTableCells(
  tableNode: ProseMirrorNode,
  options?: { changedLabels?: Iterable<string> | null },
): RelativeTableCellReplacement[] {
  const map = TableMap.get(tableNode);
  const labelsByRelativePos = buildTableCellLabelIndex(map);
  const values = new Map<string, string | number>();
  const formulaEntries = new Map<string, {
    formula: string;
    node: ProseMirrorNode;
    relativePos: number;
  }>();
  const replacementsByRelativePos = new Map<number, RelativeTableCellReplacement>();

  for (const rowInfo of getTableRows(tableNode)) {
    for (const entry of rowInfo.cells) {
      const label = labelsByRelativePos.get(entry.relativePos);
      if (!label) continue;

      const node = getPromotedFormulaCell(entry.node);
      if (node !== entry.node) {
        replacementsByRelativePos.set(entry.relativePos, {
          node,
          previousNode: entry.node,
          relativePos: entry.relativePos,
        });
      }

      const computedValue = node.attrs.computedValue;
      values.set(label, typeof computedValue === "string" && computedValue.trim() ? computedValue : getCellText(node));

      const formula = typeof node.attrs.formula === "string" ? node.attrs.formula.trim() : "";
      if (!formula) continue;
      formulaEntries.set(label, {
        formula,
        node,
        relativePos: entry.relativePos,
      });
    }
  }

  const { circular, graph, order } = getTableFormulaPlan(
    Array.from(formulaEntries, ([label, entry]) => ({
      label,
      formula: entry.formula,
    })),
  );
  const affectedLabels = options?.changedLabels
    ? getAffectedTableFormulaLabels(graph, options.changedLabels)
    : null;
  const getCellValue = (label: string) => values.get(label.toUpperCase());

  for (const label of circular) {
    if (affectedLabels && !affectedLabels.has(label)) continue;
    values.set(label, formatFormulaError("circular-reference"));
  }

  for (const label of order) {
    if (affectedLabels && !affectedLabels.has(label)) continue;
    const entry = formulaEntries.get(label);
    if (!entry) continue;
    const result = evaluateBasicTableFormula(entry.formula, getCellValue);
    const computedValue = result.error ? formatFormulaError(result.error) : String(result.value);
    values.set(label, computedValue);
  }

  for (const [label, entry] of formulaEntries) {
    if (affectedLabels && !affectedLabels.has(label)) continue;
    const computedValue = values.get(label);
    if (computedValue == null) continue;

    const currentNode = replacementsByRelativePos.get(entry.relativePos)?.node ?? entry.node;
    const normalizedComputedValue = String(computedValue);
    const displayValue = formatTableFormulaDisplayValue(normalizedComputedValue, currentNode.attrs.numberFormat);
    const contentMatchesComputedValue = getCellText(currentNode) === displayValue;
    if (currentNode.attrs.computedValue === normalizedComputedValue && contentMatchesComputedValue) continue;

    replacementsByRelativePos.set(entry.relativePos, {
      node: currentNode.type.create(
        {
          ...currentNode.attrs,
          computedValue: normalizedComputedValue,
        },
        createCellDisplayContent(currentNode, displayValue),
        currentNode.marks,
      ),
      previousNode: replacementsByRelativePos.get(entry.relativePos)?.previousNode ?? entry.node,
      relativePos: entry.relativePos,
    });
  }

  return Array.from(replacementsByRelativePos.values());
}

function resolveTableCellReplacements(
  tablePos: number,
  replacements: RelativeTableCellReplacement[],
): TableCellReplacement[] {
  return replacements.map((replacement) => {
    const from = tablePos + 1 + replacement.relativePos;
    return {
      from,
      node: replacement.node,
      to: from + replacement.previousNode.nodeSize,
    };
  });
}

function applyTableCellReplacements(transaction: Transaction, replacements: TableCellReplacement[]) {
  for (const replacement of [...replacements].sort((left, right) => right.from - left.from)) {
    transaction = transaction.replaceWith(replacement.from, replacement.to, replacement.node);
  }

  return transaction;
}

function dispatchTableCellReplacements(editor: Editor, replacements: TableCellReplacement[]) {
  if (replacements.length === 0) return false;

  editor.view.dispatch(
    applyTableCellReplacements(editor.state.tr, replacements)
      .setMeta(UEDITOR_TABLE_FORMULA_RECALCULATE_META, true),
  );
  dispatchTableLayoutChange(editor);
  return true;
}

export function createActiveTableFormulaRecalculationTransaction(state: EditorState) {
  if (isEditingTableFormulaTextInState(state)) return null;

  const tableInfo = getSelectionTableInfoFromState(state);
  if (!tableInfo) return null;

  const activeCellLabel = getSelectionTableCellLabelFromState(state);
  const replacements = resolveTableCellReplacements(
    tableInfo.pos,
    recalculateTableCells(tableInfo.node, {
      changedLabels: activeCellLabel ? [activeCellLabel] : null,
    }),
  );
  if (replacements.length === 0) return null;

  return applyTableCellReplacements(state.tr, replacements)
    .setMeta(UEDITOR_TABLE_FORMULA_RECALCULATE_META, true);
}

export function recalculateSelectedTable(editor: Editor) {
  const rect = selectedRect(editor.state);
  const tableNode = rect.table;

  return dispatchTableCellReplacements(
    editor,
    resolveTableCellReplacements(rect.tableStart - 1, recalculateTableCells(tableNode)),
  );
}

export function recalculateActiveTableFormulas(editor: Editor) {
  const tableInfo = getSelectionTableInfo(editor);
  if (!tableInfo) {
    return recalculateAllTableFormulas(editor);
  }

  const activeCellLabel = getSelectionTableCellLabel(editor);
  return dispatchTableCellReplacements(
    editor,
    resolveTableCellReplacements(
      tableInfo.pos,
      recalculateTableCells(tableInfo.node, {
        changedLabels: activeCellLabel ? [activeCellLabel] : null,
      }),
    ),
  );
}

export function recalculateAllTableFormulas(editor: Editor) {
  const replacements: TableCellReplacement[] = [];

  editor.state.doc.descendants((node, pos) => {
    if (node.type.name !== "table") return true;

    replacements.push(...resolveTableCellReplacements(pos, recalculateTableCells(node)));

    return false;
  });

  if (replacements.length === 0) return false;

  return dispatchTableCellReplacements(editor, replacements);
}
