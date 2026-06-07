import type { Editor } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { TextSelection } from "@tiptap/pm/state";
import { selectedRect, TableMap } from "@tiptap/pm/tables";
import { UEDITOR_TABLE_LAYOUT_CHANGE_EVENT } from "./table-dom-utils";

type TableRectInfo = ReturnType<typeof selectedRect>;

function getCellSelectionPositions(selection: unknown): { anchor: number; head: number } | null {
  const value = selection as {
    $anchorCell?: { pos?: unknown };
    $headCell?: { pos?: unknown };
  };
  const anchor = value.$anchorCell?.pos;
  const head = value.$headCell?.pos;
  return typeof anchor === "number" && typeof head === "number" ? { anchor, head } : null;
}

function findTableInfoFromCellPos(editor: Editor, cellPos: number) {
  const $pos = editor.state.doc.resolve(cellPos);

  for (let depth = $pos.depth; depth > 0; depth -= 1) {
    const node = $pos.node(depth);
    if (node.type.name === "table") {
      return {
        table: node,
        tablePos: $pos.before(depth),
        tableStart: $pos.start(depth),
      };
    }
  }

  return null;
}

function getFocusableCellPos(editor: Editor, cellPos: number) {
  const cellNode = editor.state.doc.nodeAt(cellPos);
  if (!cellNode) return cellPos + 1;

  let offset = cellPos + 1;
  let node = cellNode.firstChild ?? null;

  while (node && !node.isTextblock) {
    offset += 1;
    node = node.firstChild ?? null;
  }

  return node?.isTextblock ? offset + 1 : cellPos + 1;
}

function focusCell(editor: Editor, cellPos: number) {
  const selection = TextSelection.near(editor.state.doc.resolve(getFocusableCellPos(editor, cellPos)));
  editor.view.dispatch(editor.state.tr.setSelection(selection));
  editor.view.focus();
}

function collectChildren(node: ProseMirrorNode) {
  const children: ProseMirrorNode[] = [];
  node.forEach((child) => children.push(child));
  return children;
}

function createEmptyCellNode(cellNode: ProseMirrorNode) {
  return cellNode.type.createAndFill(cellNode.attrs) ?? cellNode;
}

function createCellCopyForColumnDuplicate(cellNode: ProseMirrorNode) {
  return cellNode.type.create(cellNode.attrs, cellNode.content);
}

function createCellWithDuplicatedLogicalColumn(cellNode: ProseMirrorNode, widthIndex: number) {
  const colspan = Math.max(1, Number(cellNode.attrs.colspan) || 1);
  let nextColwidth: number[] | null = null;

  if (Array.isArray(cellNode.attrs.colwidth)) {
    nextColwidth = [...cellNode.attrs.colwidth];
    const duplicateWidth = nextColwidth[widthIndex];
    nextColwidth.splice(widthIndex + 1, 0, typeof duplicateWidth === "number" ? duplicateWidth : 0);
  }

  return cellNode.type.create({
    ...cellNode.attrs,
    colspan: colspan + 1,
    ...(nextColwidth ? { colwidth: nextColwidth } : null),
  }, cellNode.content);
}

function getTableRows(tableNode: ProseMirrorNode) {
  const rows: Array<{
    node: ProseMirrorNode;
    cells: Array<{ index: number; node: ProseMirrorNode; relativePos: number }>;
  }> = [];

  tableNode.forEach((rowNode, rowOffset) => {
    const cells: Array<{ index: number; node: ProseMirrorNode; relativePos: number }> = [];

    rowNode.forEach((cellNode, cellOffset, index) => {
      cells.push({
        index,
        node: cellNode,
        relativePos: rowOffset + 1 + cellOffset,
      });
    });

    rows.push({
      node: rowNode,
      cells,
    });
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

function getSelectedTableRect(editor: Editor): TableRectInfo {
  const cellSelection = getCellSelectionPositions(editor.state.selection);
  if (cellSelection) {
    const tableInfo = findTableInfoFromCellPos(editor, cellSelection.anchor);
    if (tableInfo) {
      const map = TableMap.get(tableInfo.table);
      const rect = map.rectBetween(
        cellSelection.anchor - tableInfo.tableStart,
        cellSelection.head - tableInfo.tableStart,
      );

      return {
        ...rect,
        map,
        table: tableInfo.table,
        tableStart: tableInfo.tableStart,
      };
    }
  }

  return selectedRect(editor.state);
}

function parsePixelWidth(value: string | null | undefined) {
  if (!value) return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : null;
}

function getDomColumnWidths(editor: Editor, rect: TableRectInfo) {
  const tableDom = editor.view.nodeDOM(rect.tableStart - 1);
  if (!(tableDom instanceof HTMLTableElement)) return null;

  const cols = Array.from(tableDom.querySelectorAll<HTMLTableColElement>("colgroup > col"));
  if (cols.length === 0) return null;

  const widths: number[] = [];
  for (let col = rect.left; col < rect.right; col += 1) {
    const colElement = cols[col];
    if (!colElement) return null;

    const width = parsePixelWidth(colElement.style.width)
      ?? parsePixelWidth(colElement.getAttribute("width"))
      ?? Math.round(colElement.getBoundingClientRect().width);

    if (!Number.isFinite(width) || width <= 0) return null;
    widths.push(width);
  }

  return widths.length > 0 ? widths : null;
}

function getNodeColumnWidths(rect: TableRectInfo) {
  const widths: number[] = [];

  for (let col = rect.left; col < rect.right; col += 1) {
    let width: number | null = null;
    const seen = new Set<number>();

    for (let row = 0; row < rect.map.height && width == null; row += 1) {
      const cellPos = rect.map.map[row * rect.map.width + col];
      if (seen.has(cellPos)) continue;
      seen.add(cellPos);

      const cell = rect.table.nodeAt(cellPos);
      const colwidth = cell?.attrs.colwidth;
      if (!Array.isArray(colwidth)) continue;

      const cellLeft = rect.map.colCount(cellPos);
      const widthIndex = col - cellLeft;
      const candidate = colwidth[widthIndex];
      if (typeof candidate === "number" && candidate > 0) {
        width = candidate;
      }
    }

    if (width == null) return null;
    widths.push(width);
  }

  return widths.length > 0 ? widths : null;
}

function getSelectedColumnWidths(editor: Editor, rect: TableRectInfo) {
  return getDomColumnWidths(editor, rect) ?? getNodeColumnWidths(rect);
}

export function dispatchTableLayoutChange(editor: Editor) {
  editor.view.dom.dispatchEvent(new CustomEvent(UEDITOR_TABLE_LAYOUT_CHANGE_EVENT, { bubbles: true }));
}

export function mergeTableCellsPreservingColumnWidths(editor: Editor) {
  const rect = getSelectedTableRect(editor);
  const widths = getSelectedColumnWidths(editor, rect);
  const merged = editor.chain().focus().mergeCells().run();

  if (!merged) return merged;
  if (!widths) {
    dispatchTableLayoutChange(editor);
    return merged;
  }

  const nextRect = getSelectedTableRect(editor);
  const cellPos = nextRect.map.map[nextRect.top * nextRect.map.width + nextRect.left];
  const absolutePos = nextRect.tableStart + cellPos;
  const node = editor.state.doc.nodeAt(absolutePos);
  if (!node) return merged;

  editor.view.dispatch(
    editor.state.tr.setNodeMarkup(absolutePos, node.type, {
      ...node.attrs,
      colwidth: widths,
    }),
  );
  dispatchTableLayoutChange(editor);

  return true;
}

export function runTableCommandAtCellPos(editor: Editor, cellPos: number | null, command: (chain: any) => any) {
  if (cellPos == null) return false;
  focusCell(editor, cellPos);
  return command(editor.chain().focus(null, { scrollIntoView: false })).run();
}

export function getTableCornerCellPos(editor: Editor, activePos: number) {
  const tableInfo = findTableInfoFromCellPos(editor, activePos);
  if (!tableInfo) return null;

  const map = TableMap.get(tableInfo.table);
  return tableInfo.tableStart + map.positionAt(map.height - 1, map.width - 1, tableInfo.table);
}

function replaceTableAtCellPos(editor: Editor, cellPos: number | null, updateTable: (tableNode: ProseMirrorNode) => ProseMirrorNode | null) {
  if (cellPos == null) return false;
  const tableInfo = findTableInfoFromCellPos(editor, cellPos);
  if (!tableInfo) return false;

  const nextTable = updateTable(tableInfo.table);
  if (!nextTable) return false;

  editor.view.dispatch(editor.state.tr.replaceWith(tableInfo.tablePos, tableInfo.tablePos + tableInfo.table.nodeSize, nextTable));
  dispatchTableLayoutChange(editor);
  return true;
}

export function duplicateTableRowAt(editor: Editor, rowIndex: number, cellPos: number | null) {
  return replaceTableAtCellPos(editor, cellPos, (tableNode) => {
    const rows = collectChildren(tableNode);
    const rowNode = rows[rowIndex];
    if (!rowNode) return null;
    rows.splice(rowIndex + 1, 0, rowNode.copy(rowNode.content));
    return tableNode.type.create(tableNode.attrs, rows);
  });
}

export function clearTableRowAt(editor: Editor, rowIndex: number, cellPos: number | null) {
  return replaceTableAtCellPos(editor, cellPos, (tableNode) => {
    const map = TableMap.get(tableNode);
    if (rowIndex < 0 || rowIndex >= map.height) return null;

    const rows = getTableRows(tableNode).map((rowInfo) => {
      const cells = collectChildren(rowInfo.node);

      for (const entry of rowInfo.cells) {
        const rect = safeFindCell(map, entry.relativePos);
        if (!rect || rect.top > rowIndex || rowIndex >= rect.bottom) continue;
        cells[entry.index] = createEmptyCellNode(entry.node);
      }

      return rowInfo.node.type.create(rowInfo.node.attrs, cells);
    });

    return tableNode.type.create(tableNode.attrs, rows);
  });
}

export function duplicateTableColumnAt(editor: Editor, columnIndex: number, cellPos: number | null) {
  return replaceTableAtCellPos(editor, cellPos, (tableNode) => {
    const map = TableMap.get(tableNode);
    if (columnIndex < 0 || columnIndex >= map.width) return null;

    const rows = getTableRows(tableNode).map((rowInfo, rowIndex) => {
      const cells = collectChildren(rowInfo.node);
      const sourceCell = rowInfo.cells.find((entry) => {
        const rect = safeFindCell(map, entry.relativePos);
        return rect
          && rect.top === rowIndex
          && rect.left <= columnIndex
          && columnIndex < rect.right;
      });

      if (!sourceCell) return rowInfo.node;

      const sourceRect = safeFindCell(map, sourceCell.relativePos);
      if (sourceRect && (sourceRect.left < columnIndex || sourceRect.right > columnIndex + 1)) {
        cells[sourceCell.index] = createCellWithDuplicatedLogicalColumn(sourceCell.node, columnIndex - sourceRect.left);
        return rowInfo.node.type.create(rowInfo.node.attrs, cells);
      }

      cells.splice(sourceCell.index + 1, 0, createCellCopyForColumnDuplicate(sourceCell.node));
      return rowInfo.node.type.create(rowInfo.node.attrs, cells);
    });

    return tableNode.type.create(tableNode.attrs, rows);
  });
}

export function clearTableColumnAt(editor: Editor, columnIndex: number, cellPos: number | null) {
  return replaceTableAtCellPos(editor, cellPos, (tableNode) => {
    const map = TableMap.get(tableNode);
    if (columnIndex < 0 || columnIndex >= map.width) return null;

    const rows = getTableRows(tableNode).map((rowInfo) => {
      const cells = collectChildren(rowInfo.node);

      for (const entry of rowInfo.cells) {
        const rect = safeFindCell(map, entry.relativePos);
        if (!rect || rect.left > columnIndex || columnIndex >= rect.right) continue;
        cells[entry.index] = createEmptyCellNode(entry.node);
      }

      return rowInfo.node.type.create(rowInfo.node.attrs, cells);
    });

    return tableNode.type.create(tableNode.attrs, rows);
  });
}

export function expandTableFromCell(editor: Editor, activeCellPos: number, rows: number, columns: number) {
  let cornerCellPos = getTableCornerCellPos(editor, activeCellPos);
  if (cornerCellPos == null) return false;

  for (let index = 0; index < rows; index += 1) {
    const ok = runTableCommandAtCellPos(editor, cornerCellPos, (chain) => chain.addRowAfter());
    if (!ok) return false;
    cornerCellPos = getTableCornerCellPos(editor, cornerCellPos);
    if (cornerCellPos == null) return false;
  }

  for (let index = 0; index < columns; index += 1) {
    const ok = runTableCommandAtCellPos(editor, cornerCellPos, (chain) => chain.addColumnAfter());
    if (!ok) return false;
    cornerCellPos = getTableCornerCellPos(editor, cornerCellPos);
    if (cornerCellPos == null) return false;
  }

  dispatchTableLayoutChange(editor);
  return true;
}
