import type { Editor } from "@tiptap/core";
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
        tableStart: $pos.start(depth),
      };
    }
  }

  return null;
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

function dispatchTableLayoutChange(editor: Editor) {
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
