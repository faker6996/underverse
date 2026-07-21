import type { Editor } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { TableMap } from "prosemirror-tables";
import { MIN_RESIZED_TABLE_COLUMN_WIDTH } from "./table-column-resize";
import { MIN_TABLE_ROW_HEIGHT } from "./table-dom-utils";
import { findTableInfo } from "./table-layout-model";

const MAX_TABLE_DIMENSION = 8192;

export type TableSizeSnapshot = {
  anchorPos: number;
  tablePos: number;
  startWidth: number;
  startHeight: number;
  columnWidths: number[];
  rowHeights: number[];
  minWidth: number;
  minHeight: number;
};

export type TableResizeDimensions = {
  width: number;
  height: number;
};

function positiveMetric(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;
}

function normalizeWeightsToTotal(values: number[], total: number, minimum: number) {
  if (values.length === 0) return [];

  const safeTotal = Math.max(values.length * minimum, Math.round(total));
  const positiveValues = values.map((value) => positiveMetric(value, 1));
  const weightSum = positiveValues.reduce((sum, value) => sum + value, 0);
  const raw = positiveValues.map((value) => (value / weightSum) * safeTotal);
  const normalized = raw.map((value) => Math.max(minimum, Math.round(value)));

  let difference = safeTotal - normalized.reduce((sum, value) => sum + value, 0);
  while (difference !== 0) {
    let changed = false;

    for (let index = normalized.length - 1; index >= 0 && difference !== 0; index -= 1) {
      if (difference < 0 && normalized[index] <= minimum) continue;
      normalized[index] += difference > 0 ? 1 : -1;
      difference += difference > 0 ? -1 : 1;
      changed = true;
    }

    if (!changed) break;
  }

  return normalized;
}

function getLogicalColumnWidths(table: ProseMirrorNode, tableMap: TableMap, fallback: number) {
  return Array.from({ length: tableMap.width }, (_, columnIndex) => {
    const relativeCellPos = tableMap.positionAt(0, columnIndex, table);
    const cell = table.nodeAt(relativeCellPos);
    if (!cell) return fallback;

    const cellStartColumn = tableMap.colCount(relativeCellPos);
    const widthIndex = columnIndex - cellStartColumn;
    const colwidth = cell.attrs.colwidth as number[] | null | undefined;
    return positiveMetric(colwidth?.[widthIndex], fallback);
  });
}

function getLogicalRowHeights(table: ProseMirrorNode, fallback: number) {
  const heights: number[] = [];
  table.forEach((row) => {
    heights.push(positiveMetric(row.attrs.rowHeight, fallback));
  });
  return heights;
}

export function createTableSizeSnapshot(
  editor: Editor,
  anchorPos: number,
  startWidth: number,
  startHeight: number,
): TableSizeSnapshot | null {
  const tableInfo = findTableInfo(editor, anchorPos);
  if (!tableInfo) return null;

  const tableMap = TableMap.get(tableInfo.node);
  if (tableMap.width === 0 || tableMap.height === 0) return null;

  const safeWidth = Math.max(tableMap.width * MIN_RESIZED_TABLE_COLUMN_WIDTH, Math.round(startWidth));
  const safeHeight = Math.max(tableMap.height * MIN_TABLE_ROW_HEIGHT, Math.round(startHeight));
  const fallbackColumnWidth = safeWidth / tableMap.width;
  const fallbackRowHeight = safeHeight / tableMap.height;

  return {
    anchorPos,
    tablePos: tableInfo.pos,
    startWidth: safeWidth,
    startHeight: safeHeight,
    columnWidths: normalizeWeightsToTotal(
      getLogicalColumnWidths(tableInfo.node, tableMap, fallbackColumnWidth),
      safeWidth,
      MIN_RESIZED_TABLE_COLUMN_WIDTH,
    ),
    rowHeights: normalizeWeightsToTotal(
      getLogicalRowHeights(tableInfo.node, fallbackRowHeight),
      safeHeight,
      MIN_TABLE_ROW_HEIGHT,
    ),
    minWidth: tableMap.width * MIN_RESIZED_TABLE_COLUMN_WIDTH,
    minHeight: tableMap.height * MIN_TABLE_ROW_HEIGHT,
  };
}

export function resolveTableResizeDimensions({
  deltaX,
  deltaY,
  lockAxis,
  preserveRatio,
  snapshot,
}: {
  deltaX: number;
  deltaY: number;
  lockAxis: boolean;
  preserveRatio: boolean;
  snapshot: TableSizeSnapshot;
}): TableResizeDimensions {
  let width = snapshot.startWidth + deltaX;
  let height = snapshot.startHeight + deltaY;

  if (preserveRatio) {
    const horizontalDrag = Math.abs(deltaX) >= Math.abs(deltaY);
    const scale = horizontalDrag
      ? width / snapshot.startWidth
      : height / snapshot.startHeight;

    const minScale = Math.max(
      snapshot.minWidth / snapshot.startWidth,
      snapshot.minHeight / snapshot.startHeight,
    );
    const maxScale = Math.min(
      MAX_TABLE_DIMENSION / snapshot.startWidth,
      MAX_TABLE_DIMENSION / snapshot.startHeight,
    );
    const safeScale = Math.min(Math.max(scale, minScale), maxScale);
    width = snapshot.startWidth * safeScale;
    height = snapshot.startHeight * safeScale;
  } else if (lockAxis) {
    if (Math.abs(deltaX) >= Math.abs(deltaY)) {
      height = snapshot.startHeight;
    } else {
      width = snapshot.startWidth;
    }
  }

  return {
    width: Math.min(MAX_TABLE_DIMENSION, Math.max(snapshot.minWidth, Math.round(width))),
    height: Math.min(MAX_TABLE_DIMENSION, Math.max(snapshot.minHeight, Math.round(height))),
  };
}

function arraysEqual(left: unknown, right: number[]) {
  return Array.isArray(left)
    && left.length === right.length
    && left.every((value, index) => value === right[index]);
}

export function applyTableSize(
  editor: Editor,
  snapshot: TableSizeSnapshot,
  dimensions: TableResizeDimensions,
) {
  const table = editor.state.doc.nodeAt(snapshot.tablePos);
  if (!table || table.type.name !== "table") return false;

  const tableMap = TableMap.get(table);
  if (tableMap.width !== snapshot.columnWidths.length || tableMap.height !== snapshot.rowHeights.length) {
    return false;
  }

  const resizeWidth = dimensions.width !== snapshot.startWidth;
  const resizeHeight = dimensions.height !== snapshot.startHeight;
  if (!resizeWidth && !resizeHeight) return false;

  const tableStart = snapshot.tablePos + 1;
  const transaction = editor.state.tr;

  if (resizeWidth) {
    const nextColumnWidths = normalizeWeightsToTotal(
      snapshot.columnWidths,
      dimensions.width,
      MIN_RESIZED_TABLE_COLUMN_WIDTH,
    );
    const seenCellPositions = new Set<number>();

    for (const relativeCellPos of tableMap.map) {
      if (seenCellPositions.has(relativeCellPos)) continue;
      seenCellPositions.add(relativeCellPos);

      const cell = table.nodeAt(relativeCellPos);
      if (!cell) continue;

      const cellRect = tableMap.findCell(relativeCellPos);
      const colwidth = nextColumnWidths.slice(cellRect.left, cellRect.right);
      if (arraysEqual(cell.attrs.colwidth, colwidth)) continue;

      transaction.setNodeMarkup(tableStart + relativeCellPos, undefined, {
        ...cell.attrs,
        colwidth,
      });
    }
  }

  if (resizeHeight) {
    const nextRowHeights = normalizeWeightsToTotal(
      snapshot.rowHeights,
      dimensions.height,
      MIN_TABLE_ROW_HEIGHT,
    );

    table.forEach((row, offset, rowIndex) => {
      const rowHeight = nextRowHeights[rowIndex];
      if (row.attrs.rowHeight === rowHeight) return;

      transaction.setNodeMarkup(tableStart + offset, undefined, {
        ...row.attrs,
        rowHeight,
      });
    });
  }

  if (!transaction.docChanged) return false;
  editor.view.dispatch(transaction);
  return true;
}
