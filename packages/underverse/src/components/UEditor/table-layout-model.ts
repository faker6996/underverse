import type { Editor } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { TableMap } from "prosemirror-tables";
import { resolveEventElement } from "./table-dom-utils";

const FALLBACK_TABLE_ROW_HEIGHT = 44;
const FALLBACK_TABLE_COLUMN_WIDTH = 160;

export type TableAxisHandle = {
  index: number;
  cellPos: number;
  start: number;
  size: number;
  center: number;
};

export type TableControlLayout = {
  cellPos: number;
  cornerCellPos: number;
  activeRowIndex: number;
  activeColumnIndex: number;
  tableLeft: number;
  tableTop: number;
  tableWidth: number;
  tableHeight: number;
  wrapperLeft: number;
  wrapperTop: number;
  wrapperWidth: number;
  wrapperHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  horizontalScrollbarHeight: number;
  verticalScrollbarWidth: number;
  avgRowHeight: number;
  avgColumnWidth: number;
  rowHandles: TableAxisHandle[];
  columnHandles: TableAxisHandle[];
};

export type TableInfo = {
  node: ProseMirrorNode;
  pos: number;
  start: number;
};

function metricOrFallback(value: number, fallback: number) {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function parsePixelMetric(value: string | null | undefined) {
  if (!value) return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function getPrimaryCell(table: HTMLTableElement) {
  const cell = table.querySelector("th,td");
  return cell instanceof HTMLTableCellElement ? cell : null;
}

function getLastCell(table: HTMLTableElement) {
  const lastRow = table.rows.item(table.rows.length - 1);
  if (!(lastRow instanceof HTMLTableRowElement)) return null;
  const cell = lastRow.cells.item(lastRow.cells.length - 1);
  return cell instanceof HTMLTableCellElement ? cell : null;
}

export function getCellFromTarget(target: EventTarget | Node | null) {
  const element = resolveEventElement(target);
  if (!element) return null;

  const directCell = element.closest("th,td");
  if (directCell instanceof HTMLTableCellElement) {
    return directCell;
  }

  const table = element.closest("table");
  if (table instanceof HTMLTableElement) {
    return getPrimaryCell(table);
  }

  return null;
}

export function findTableInfo(editor: Editor, pos: number): TableInfo | null {
  const $pos = editor.state.doc.resolve(pos);

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

function buildLogicalColumnMetrics({
  editor,
  surface,
  surfaceRect,
  tableElement,
  tableInfo,
  tableLeft,
  tableWidth,
}: {
  editor: Editor;
  surface: HTMLDivElement;
  surfaceRect: DOMRect;
  tableElement: HTMLTableElement;
  tableInfo: TableInfo;
  tableLeft: number;
  tableWidth: number;
}): TableAxisHandle[] {
  const map = TableMap.get(tableInfo.node);
  const fallbackWidth = metricOrFallback(tableWidth / map.width, FALLBACK_TABLE_COLUMN_WIDTH);
  const firstRow = tableElement.rows.item(0);
  const visualColumns: TableAxisHandle[] = [];

  if (firstRow) {
    for (const tableCell of Array.from(firstRow.cells)) {
      if (!(tableCell instanceof HTMLTableCellElement)) continue;

      const cellPos = editor.view.posAtDOM(tableCell, 0);
      const relativeCellPos = getCellRelativePosFromDomPos(map, tableInfo.start, cellPos);
      if (relativeCellPos == null) continue;

      const cellMapRect = map.findCell(relativeCellPos);
      const cellRect = tableCell.getBoundingClientRect();
      const cellStart = cellRect.width > 0
        ? cellRect.left - surfaceRect.left + surface.scrollLeft
        : tableLeft + cellMapRect.left * fallbackWidth;
      const size = metricOrFallback(cellRect.width, fallbackWidth * Math.max(1, cellMapRect.right - cellMapRect.left));

      visualColumns.push({
        index: cellMapRect.left,
        cellPos: tableInfo.start + relativeCellPos,
        start: cellStart,
        size,
        center: cellStart + size / 2,
      });
    }
  }

  if (visualColumns.length > 0) {
    return visualColumns.sort((a, b) => a.index - b.index);
  }

  const cols = Array.from(tableElement.querySelectorAll<HTMLTableColElement>("colgroup > col"));
  const parsedWidths = cols.slice(0, map.width).map((col) => parsePixelMetric(col.style.width) ?? parsePixelMetric(col.getAttribute("width")));
  const hasCompleteColWidths = parsedWidths.length >= map.width && parsedWidths.every((width): width is number => typeof width === "number");

  let cursor = tableLeft;

  return Array.from({ length: map.width }, (_, index) => {
    const size = hasCompleteColWidths ? parsedWidths[index] : fallbackWidth;
    const start = hasCompleteColWidths ? cursor : tableLeft + index * fallbackWidth;
    cursor += size;

    return {
      index,
      cellPos: tableInfo.start + map.positionAt(0, index, tableInfo.node),
      start,
      size,
      center: start + size / 2,
    };
  });
}

function buildLogicalRowMetrics({
  editor,
  surface,
  surfaceRect,
  tableInfo,
  rows,
  tableTop,
  tableHeight,
  cornerCell,
}: {
  editor: Editor;
  surface: HTMLDivElement;
  surfaceRect: DOMRect;
  tableInfo: TableInfo;
  rows: HTMLTableRowElement[];
  tableTop: number;
  tableHeight: number;
  cornerCell: HTMLTableCellElement;
}): TableAxisHandle[] {
  const map = TableMap.get(tableInfo.node);
  const fallbackHeight = metricOrFallback(tableHeight / map.height, FALLBACK_TABLE_ROW_HEIGHT);
  const visualRows: TableAxisHandle[] = [];
  const seenCellPositions = new Set<number>();

  for (let rowIndex = 0; rowIndex < map.height; rowIndex += 1) {
    const relativeCellPos = map.map[rowIndex * map.width];
    if (seenCellPositions.has(relativeCellPos)) continue;
    seenCellPositions.add(relativeCellPos);

    const cellMapRect = map.findCell(relativeCellPos);
    const cellDom = editor.view.nodeDOM(tableInfo.start + relativeCellPos);
    const tableCell = cellDom instanceof HTMLTableCellElement ? cellDom : null;

    if (tableCell) {
      const cellRect = tableCell.getBoundingClientRect();
      const start = cellRect.height > 0
        ? cellRect.top - surfaceRect.top + surface.scrollTop
        : tableTop + cellMapRect.top * fallbackHeight;
      const size = metricOrFallback(cellRect.height, fallbackHeight * Math.max(1, cellMapRect.bottom - cellMapRect.top));

      visualRows.push({
        index: cellMapRect.top,
        cellPos: tableInfo.start + relativeCellPos,
        start,
        size,
        center: start + size / 2,
      });
    }
  }

  if (visualRows.length > 0) {
    return visualRows.sort((a, b) => a.index - b.index);
  }

  return rows.map((tableRow, index) => {
    const rowRect = tableRow.getBoundingClientRect();
    const anchorCell = tableRow.cells.item(0) ?? cornerCell;
    const start = rowRect.height > 0
      ? rowRect.top - surfaceRect.top + surface.scrollTop
      : tableTop + index * fallbackHeight;
    const size = metricOrFallback(rowRect.height, fallbackHeight);

    return {
      index,
      cellPos: editor.view.posAtDOM(anchorCell, 0),
      start,
      size,
      center: start + size / 2,
    };
  });
}

export function getLastCellPosFromState(editor: Editor, pos: number) {
  const tableInfo = findTableInfo(editor, pos);
  if (!tableInfo) return null;

  const map = TableMap.get(tableInfo.node);
  return tableInfo.start + map.positionAt(map.height - 1, map.width - 1, tableInfo.node);
}

export function buildTableControlLayout(editor: Editor, surface: HTMLDivElement, cell: HTMLTableCellElement): TableControlLayout | null {
  const row = cell.closest("tr");
  const table = cell.closest("table");
  if (!(row instanceof HTMLTableRowElement) || !(table instanceof HTMLTableElement)) {
    return null;
  }

  const rows = Array.from(table.rows).filter((item): item is HTMLTableRowElement => item instanceof HTMLTableRowElement);
  const cornerCell = getLastCell(table);
  const cellPos = editor.view.posAtDOM(cell, 0);
  const tableInfo = findTableInfo(editor, cellPos);
  if (rows.length === 0 || !tableInfo || !(cornerCell instanceof HTMLTableCellElement)) {
    return null;
  }

  const map = TableMap.get(tableInfo.node);
  const surfaceRect = surface.getBoundingClientRect();
  const tableRect = table.getBoundingClientRect();
  const wrapperElement = table.closest(".tableWrapper");
  const wrapper = wrapperElement instanceof HTMLElement ? wrapperElement : null;
  const wrapperRect = wrapper?.getBoundingClientRect() ?? tableRect;
  const tableLeft = tableRect.left - surfaceRect.left + surface.scrollLeft;
  const tableTop = tableRect.top - surfaceRect.top + surface.scrollTop;
  const avgRowHeight = metricOrFallback(tableRect.height / rows.length, FALLBACK_TABLE_ROW_HEIGHT);
  const avgColumnWidth = metricOrFallback(tableRect.width / map.width, FALLBACK_TABLE_COLUMN_WIDTH);
  const tableWidth = metricOrFallback(tableRect.width, avgColumnWidth * map.width);
  const tableHeight = metricOrFallback(tableRect.height, avgRowHeight * rows.length);
  const wrapperLeft = wrapperRect.left - surfaceRect.left + surface.scrollLeft;
  const wrapperTop = wrapperRect.top - surfaceRect.top + surface.scrollTop;
  const wrapperWidth = metricOrFallback(wrapperRect.width, tableWidth);
  const wrapperHeight = metricOrFallback(wrapperRect.height, tableHeight);
  const viewportWidth = metricOrFallback(wrapper?.clientWidth ?? wrapperRect.width, tableWidth);
  const viewportHeight = metricOrFallback(wrapper?.clientHeight ?? wrapperRect.height, tableHeight);
  const verticalScrollbarWidth = Math.max(0, Math.round(wrapperWidth - viewportWidth));
  const horizontalScrollbarHeight = Math.max(0, Math.round(wrapperHeight - viewportHeight));

  const rowHandles = buildLogicalRowMetrics({
    editor,
    surface,
    surfaceRect,
    tableInfo,
    rows,
    tableTop,
    tableHeight,
    cornerCell,
  });

  const columnHandles = buildLogicalColumnMetrics({
    editor,
    surface,
    surfaceRect,
    tableElement: table,
    tableInfo,
    tableLeft,
    tableWidth,
  });
  const activeCellRelativePos = getCellRelativePosFromDomPos(map, tableInfo.start, cellPos);
  const activeCellRect = activeCellRelativePos != null ? map.findCell(activeCellRelativePos) : { left: cell.cellIndex, top: row.rowIndex };
  const normalizedCellPos = activeCellRelativePos != null ? tableInfo.start + activeCellRelativePos : cellPos;

  return {
    cellPos: normalizedCellPos,
    cornerCellPos: tableInfo.start + map.positionAt(map.height - 1, map.width - 1, tableInfo.node),
    activeRowIndex: activeCellRect.top,
    activeColumnIndex: activeCellRect.left,
    tableLeft,
    tableTop,
    tableWidth,
    tableHeight,
    wrapperLeft,
    wrapperTop,
    wrapperWidth,
    wrapperHeight,
    viewportWidth,
    viewportHeight,
    horizontalScrollbarHeight,
    verticalScrollbarWidth,
    avgRowHeight,
    avgColumnWidth,
    rowHandles,
    columnHandles,
  };
}
