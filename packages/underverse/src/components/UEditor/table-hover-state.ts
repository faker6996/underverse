import { resolveEventElement } from "./table-dom-utils";
import { getVisibleTableBounds, type TableControlLayout } from "./table-layout-model";

const MENU_HOVER_PADDING = 18;
const ROW_HANDLE_HOVER_WIDTH = 28;
const COLUMN_HANDLE_HOVER_HEIGHT = 28;
const ADD_COLUMN_HOVER_WIDTH = 24;
const ADD_ROW_HOVER_HEIGHT = 24;
const HANDLE_HOVER_RADIUS = 14;

export type TableHoverState = {
  menuVisible: boolean;
  addColumnVisible: boolean;
  addRowVisible: boolean;
  rowHandleIndex: number | null;
  columnHandleIndex: number | null;
};

export const DEFAULT_TABLE_HOVER_STATE: TableHoverState = {
  menuVisible: false,
  addColumnVisible: false,
  addRowVisible: false,
  rowHandleIndex: null,
  columnHandleIndex: null,
};

export function areTableHoverStatesEqual(left: TableHoverState, right: TableHoverState) {
  return left.menuVisible === right.menuVisible
    && left.addColumnVisible === right.addColumnVisible
    && left.addRowVisible === right.addRowVisible
    && left.rowHandleIndex === right.rowHandleIndex
    && left.columnHandleIndex === right.columnHandleIndex;
}

export function buildTableHoverState({
  event,
  layout,
  surface,
}: {
  event: MouseEvent | PointerEvent;
  layout: TableControlLayout;
  surface: HTMLDivElement;
}): TableHoverState {
  const surfaceRect = surface.getBoundingClientRect();
  const relativeX = event.clientX - surfaceRect.left + surface.scrollLeft;
  const relativeY = event.clientY - surfaceRect.top + surface.scrollTop;
  const targetElement = resolveEventElement(event.target);

  const directRowHandle = targetElement?.closest?.("[data-row-handle-index]");
  const directColumnHandle = targetElement?.closest?.("[data-column-handle-index]");
  const directTableMenu = targetElement?.closest?.("[data-table-control='table-menu']");
  const directAddColumn = targetElement?.closest?.("[data-table-control='add-column']");
  const directAddRow = targetElement?.closest?.("[data-table-control='add-row']");

  const directRowHandleIndex = directRowHandle instanceof HTMLElement
    ? Number.parseInt(directRowHandle.dataset.rowHandleIndex ?? "", 10)
    : Number.NaN;
  const directColumnHandleIndex = directColumnHandle instanceof HTMLElement
    ? Number.parseInt(directColumnHandle.dataset.columnHandleIndex ?? "", 10)
    : Number.NaN;
  const visibleBounds = getVisibleTableBounds(layout);
  const rowRailTop = layout.wrapperTop + layout.wrapperHeight;

  const isMouseInTable = relativeX >= layout.tableLeft
    && relativeX <= layout.tableLeft + layout.tableWidth
    && relativeY >= layout.tableTop
    && relativeY <= layout.tableTop + layout.tableHeight;

  const rowHandleIndex = Number.isFinite(directRowHandleIndex)
    ? directRowHandleIndex
    : layout.rowHandles.find((rowHandle) => (
      relativeX >= layout.tableLeft - ROW_HANDLE_HOVER_WIDTH
      && relativeX <= layout.tableLeft
      && Math.abs(relativeY - rowHandle.center) <= HANDLE_HOVER_RADIUS
    ))?.index ?? null;

  const columnHandleIndex = Number.isFinite(directColumnHandleIndex)
    ? directColumnHandleIndex
    : layout.columnHandles.find((columnHandle) => (
      relativeY >= layout.tableTop - COLUMN_HANDLE_HOVER_HEIGHT
      && relativeY <= layout.tableTop
      && Math.abs(relativeX - columnHandle.center) <= HANDLE_HOVER_RADIUS
    ))?.index ?? null;

  const menuVisible = Boolean(directTableMenu) || isMouseInTable || (
    relativeX >= layout.tableLeft - MENU_HOVER_PADDING
    && relativeX <= layout.tableLeft + 42
    && relativeY >= layout.tableTop - COLUMN_HANDLE_HOVER_HEIGHT
    && relativeY <= layout.tableTop + MENU_HOVER_PADDING
  );

  const lastRow = layout.rowHandles[layout.rowHandles.length - 1];
  const lastCol = layout.columnHandles[layout.columnHandles.length - 1];

  const isMouseInLastColumn = lastCol
    ? relativeX >= lastCol.start
      && relativeX <= lastCol.start + lastCol.size
      && relativeY >= visibleBounds.top
      && relativeY <= visibleBounds.bottom
    : false;

  const addColumnVisible = Boolean(directAddColumn) || (
    relativeX >= visibleBounds.right
    && relativeX <= visibleBounds.right + ADD_COLUMN_HOVER_WIDTH
    && relativeY >= visibleBounds.top
    && relativeY <= visibleBounds.bottom
  ) || isMouseInLastColumn;

  const isMouseInLastRow = lastRow
    ? relativeY >= lastRow.start
      && relativeY <= lastRow.start + lastRow.size
      && relativeX >= visibleBounds.left
      && relativeX <= visibleBounds.right
    : false;

  const addRowVisible = Boolean(directAddRow) || (
    relativeY >= rowRailTop
    && relativeY <= rowRailTop + ADD_ROW_HOVER_HEIGHT
    && relativeX >= visibleBounds.left
    && relativeX <= visibleBounds.right
  ) || isMouseInLastRow;

  return {
    menuVisible,
    addColumnVisible,
    addRowVisible,
    rowHandleIndex,
    columnHandleIndex,
  };
}
