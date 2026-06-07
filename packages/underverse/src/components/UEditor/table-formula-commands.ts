import type { Editor } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { selectedRect, setCellAttr, TableMap } from "@tiptap/pm/tables";
import { dispatchTableLayoutChange } from "./table-cell-commands";
import {
  buildTableFormulaDependencyGraph,
  evaluateBasicTableFormula,
  formatFormulaError,
  formatTableFormulaDisplayValue,
  getTableFormulaRecalculationOrder,
  indexToColumnName,
  isDraftTableFormula,
  normalizeTableFormula,
} from "./table-formula";

export const UEDITOR_TABLE_FORMULA_RECALCULATE_META = "ueditorTableFormulaRecalculate";

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

function createCellDisplayContent(cellNode: ProseMirrorNode, displayValue: string) {
  const paragraphType = cellNode.type.schema.nodes.paragraph;

  if (!paragraphType || !displayValue) {
    return paragraphType ? [paragraphType.create()] : cellNode.content;
  }

  return [paragraphType.create(null, cellNode.type.schema.text(displayValue))];
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

function buildTableValueMap(tableNode: ProseMirrorNode) {
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

  return values;
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

function promoteFormulaTextInTableNode(tableNode: ProseMirrorNode) {
  let changed = false;

  const rows = getTableRows(tableNode).map((rowInfo) => {
    const cells = collectChildren(rowInfo.node);

    for (const entry of rowInfo.cells) {
      const text = getCellText(entry.node);
      const existingFormula = typeof entry.node.attrs.formula === "string" ? entry.node.attrs.formula.trim() : "";
      const existingComputedValue = typeof entry.node.attrs.computedValue === "string" ? entry.node.attrs.computedValue.trim() : "";

      if (text.startsWith("=")) {
        if (!normalizeTableFormula(text)) {
          if (!existingFormula && !existingComputedValue) continue;

          cells[entry.index] = entry.node.type.create(
            {
              ...entry.node.attrs,
              formula: null,
              computedValue: null,
            },
            text === formatFormulaError("empty") ? createCellDisplayContent(entry.node, "") : entry.node.content,
            entry.node.marks,
          );
          changed = true;
          continue;
        }

        if (isDraftTableFormula(text)) {
          continue;
        }

        const formula = normalizeFormulaInput(text);
        if (entry.node.attrs.formula === formula) continue;

        cells[entry.index] = entry.node.type.create(
          {
            ...entry.node.attrs,
            formula,
            computedValue: null,
          },
          entry.node.content,
          entry.node.marks,
        );
        changed = true;
        continue;
      }

      if (existingFormula) {
        const isExistingEmptyFormula = !normalizeTableFormula(existingFormula);
        if (!isExistingEmptyFormula) continue;

        cells[entry.index] = entry.node.type.create(
          {
            ...entry.node.attrs,
            formula: null,
            computedValue: null,
          },
          isExistingEmptyFormula && text === formatFormulaError("empty") ? createCellDisplayContent(entry.node, "") : entry.node.content,
          entry.node.marks,
        );
        changed = true;
      }
    }

    return rowInfo.node.type.create(rowInfo.node.attrs, cells);
  });

  return {
    tableNode: changed ? tableNode.type.create(tableNode.attrs, rows) : tableNode,
    changed,
  };
}

function recalculateTableNode(tableNode: ProseMirrorNode) {
  const promoted = promoteFormulaTextInTableNode(tableNode);
  tableNode = promoted.tableNode;
  const map = TableMap.get(tableNode);
  const values = buildTableValueMap(tableNode);
  const formulaEntries = new Map<string, { rowIndex: number; cellIndex: number; node: ProseMirrorNode; formula: string }>();
  let changed = false;

  const rowInfos = getTableRows(tableNode);
  for (const [rowIndex, rowInfo] of rowInfos.entries()) {
    for (const entry of rowInfo.cells) {
      const formula = typeof entry.node.attrs.formula === "string" ? entry.node.attrs.formula.trim() : "";
      if (!formula) continue;

      const rectForCell = safeFindCell(map, entry.relativePos);
      if (!rectForCell) continue;

      const label = `${indexToColumnName(rectForCell.left)}${rectForCell.top + 1}`;
      formulaEntries.set(label, {
        rowIndex,
        cellIndex: entry.index,
        node: entry.node,
        formula,
      });
    }
  }

  const graph = buildTableFormulaDependencyGraph(
    Array.from(formulaEntries, ([label, entry]) => ({
      label,
      formula: entry.formula,
    })),
  );
  const { order, circular } = getTableFormulaRecalculationOrder(graph);
  const computedValues = new Map<string, string>();
  const getCellValue = (label: string) => values.get(label.toUpperCase());

  for (const label of circular) {
    computedValues.set(label, formatFormulaError("circular-reference"));
    values.set(label, formatFormulaError("circular-reference"));
  }

  for (const label of order) {
    const entry = formulaEntries.get(label);
    if (!entry) continue;
    const result = evaluateBasicTableFormula(entry.formula, getCellValue);
    const computedValue = result.error ? formatFormulaError(result.error) : String(result.value);
    computedValues.set(label, computedValue);
    values.set(label, computedValue);
  }

  const rows = rowInfos.map((rowInfo) => {
    const cells = collectChildren(rowInfo.node);

    for (const entry of rowInfo.cells) {
      const rectForCell = safeFindCell(map, entry.relativePos);
      if (!rectForCell) continue;

      const label = `${indexToColumnName(rectForCell.left)}${rectForCell.top + 1}`;
      const computedValue = computedValues.get(label);
      if (computedValue == null) continue;

      const displayValue = formatTableFormulaDisplayValue(computedValue, entry.node.attrs.numberFormat);
      const contentMatchesComputedValue = getCellText(entry.node) === displayValue;
      if (entry.node.attrs.computedValue === computedValue && contentMatchesComputedValue) continue;

      cells[entry.index] = entry.node.type.create(
        {
          ...entry.node.attrs,
          computedValue,
        },
        createCellDisplayContent(entry.node, displayValue),
        entry.node.marks,
      );
      changed = true;
    }

    return rowInfo.node.type.create(rowInfo.node.attrs, cells);
  });

  if (!changed) return promoted.changed ? tableNode : null;

  return tableNode.type.create(tableNode.attrs, rows);
}

export function recalculateSelectedTable(editor: Editor) {
  const rect = selectedRect(editor.state);
  const tableNode = rect.table;
  const nextTable = recalculateTableNode(tableNode);

  if (!nextTable) return false;

  editor.view.dispatch(
    editor.state.tr
      .replaceWith(rect.tableStart - 1, rect.tableStart - 1 + tableNode.nodeSize, nextTable)
      .setMeta(UEDITOR_TABLE_FORMULA_RECALCULATE_META, true),
  );
  dispatchTableLayoutChange(editor);
  return true;
}

export function recalculateAllTableFormulas(editor: Editor) {
  const replacements: Array<{ from: number; to: number; node: ProseMirrorNode }> = [];

  editor.state.doc.descendants((node, pos) => {
    if (node.type.name !== "table") return true;

    const nextTable = recalculateTableNode(node);
    if (nextTable) {
      replacements.push({
        from: pos,
        to: pos + node.nodeSize,
        node: nextTable,
      });
    }

    return false;
  });

  if (replacements.length === 0) return false;

  let tr = editor.state.tr;
  for (const replacement of replacements.reverse()) {
    tr = tr.replaceWith(replacement.from, replacement.to, replacement.node);
  }

  editor.view.dispatch(tr.setMeta(UEDITOR_TABLE_FORMULA_RECALCULATE_META, true));
  dispatchTableLayoutChange(editor);
  return true;
}
