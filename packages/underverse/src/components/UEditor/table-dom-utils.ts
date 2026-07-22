import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import type { EditorView } from "@tiptap/pm/view";

export const DEFAULT_TABLE_ROW_HEIGHT = 25;
export const MIN_TABLE_ROW_HEIGHT = DEFAULT_TABLE_ROW_HEIGHT;
export const COLUMN_RESIZE_LINE_THICKNESS = 2;
export const ROW_RESIZE_LINE_THICKNESS = 2;
export const UEDITOR_TABLE_LAYOUT_CHANGE_EVENT = "ueditor-table-layout-change";

const TABLE_RESIZE_HIT_ZONE = 10;

export function findTableRowNodeInfo(view: EditorView, rowElement: HTMLTableRowElement): { pos: number; node: ProseMirrorNode } | null {
  const firstCell = rowElement.querySelector("th,td");
  if (!firstCell) return null;

  const cellPos = view.posAtDOM(firstCell, 0);
  const $pos = view.state.doc.resolve(cellPos);

  for (let depth = $pos.depth; depth > 0; depth -= 1) {
    const node = $pos.node(depth);
    if (node.type.name === "tableRow") {
      return {
        pos: $pos.before(depth),
        node,
      };
    }
  }

  return null;
}

export function resolveEventElement(target: EventTarget | null) {
  if (target instanceof Element) return target;
  if (target instanceof Node) return target.parentElement;
  return null;
}

/**
 * Returns true only when the pointer is over a rendered text run. Checking the
 * event target is not sufficient because block elements usually fill the
 * complete table cell, including its empty padding.
 */
export function isPointOverRenderedText(root: HTMLElement, clientX: number, clientY: number) {
  const view = root.ownerDocument.defaultView;
  if (!view) return false;

  const walker = root.ownerDocument.createTreeWalker(root, view.NodeFilter.SHOW_TEXT);
  let textNode = walker.nextNode();

  while (textNode) {
    if (textNode.textContent?.length) {
      const range = root.ownerDocument.createRange();
      range.selectNodeContents(textNode);
      const textRects = Array.from(range.getClientRects());
      range.detach?.();

      if (textRects.some((rect) => (
        clientX >= rect.left
        && clientX <= rect.right
        && clientY >= rect.top
        && clientY <= rect.bottom
      ))) {
        return true;
      }
    }

    textNode = walker.nextNode();
  }

  return false;
}

export function getSelectionTableCell(view: EditorView) {
  const browserSelection = window.getSelection();
  const anchorElement = resolveEventElement(browserSelection?.anchorNode ?? null);
  const anchorCell = anchorElement?.closest?.("th,td");
  if (anchorCell instanceof HTMLElement) {
    return anchorCell;
  }

  const { from } = view.state.selection;
  const domAtPos = view.domAtPos(from);
  const element = resolveEventElement(domAtPos.node);
  const cell = element?.closest?.("th,td");
  return cell instanceof HTMLElement ? cell : null;
}

export function isRowResizeHotspot(cell: HTMLElement, clientX: number, clientY: number) {
  const rect = cell.getBoundingClientRect();
  const nearBottom = rect.bottom - clientY <= TABLE_RESIZE_HIT_ZONE;
  const nearRight = rect.right - clientX <= TABLE_RESIZE_HIT_ZONE;
  return nearBottom && !nearRight;
}

export function isColumnResizeHotspot(cell: HTMLElement, clientX: number, clientY: number) {
  const rect = cell.getBoundingClientRect();
  const nearRight = rect.right - clientX <= TABLE_RESIZE_HIT_ZONE;
  const nearBottom = rect.bottom - clientY <= TABLE_RESIZE_HIT_ZONE;
  return nearRight && !nearBottom;
}

export function getRelativeBoundaryMetrics(surface: HTMLElement, table: HTMLTableElement, row: HTMLTableRowElement, cell: HTMLTableCellElement) {
  const surfaceRect = surface.getBoundingClientRect();
  const tableRect = table.getBoundingClientRect();
  const rowRect = row.getBoundingClientRect();
  const cellRect = cell.getBoundingClientRect();

  return {
    left: tableRect.left - surfaceRect.left + surface.scrollLeft,
    top: tableRect.top - surfaceRect.top + surface.scrollTop,
    width: tableRect.width,
    height: tableRect.height,
    rowBottom: rowRect.bottom - surfaceRect.top + surface.scrollTop,
    columnRight: cellRect.right - surfaceRect.left + surface.scrollLeft,
  };
}

export function getRelativeCellMetrics(surface: HTMLElement, cell: HTMLElement) {
  const surfaceRect = surface.getBoundingClientRect();
  const cellRect = cell.getBoundingClientRect();

  return {
    left: cellRect.left - surfaceRect.left + surface.scrollLeft,
    top: cellRect.top - surfaceRect.top + surface.scrollTop,
    width: cellRect.width,
    height: cellRect.height,
  };
}

export function getRelativeSelectedCellsMetrics(surface: HTMLElement) {
  const selectedCells = Array.from(
    surface.querySelectorAll<HTMLElement>("td.selectedCell, th.selectedCell"),
  );

  if (selectedCells.length === 0) {
    return null;
  }

  const surfaceRect = surface.getBoundingClientRect();
  let left = Number.POSITIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;

  selectedCells.forEach((cell) => {
    const rect = cell.getBoundingClientRect();
    left = Math.min(left, rect.left);
    top = Math.min(top, rect.top);
    right = Math.max(right, rect.right);
    bottom = Math.max(bottom, rect.bottom);
  });

  return {
    left: left - surfaceRect.left + surface.scrollLeft,
    top: top - surfaceRect.top + surface.scrollTop,
    width: right - left,
    height: bottom - top,
  };
}
