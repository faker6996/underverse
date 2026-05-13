"use client";

import React, { useRef } from "react";
import type { Editor } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import {
  findTableRowNodeInfo,
  isRowResizeHotspot,
  MIN_TABLE_ROW_HEIGHT,
} from "./table-dom-utils";

type RowGuideHandler = (
  table: HTMLTableElement,
  row: HTMLTableRowElement,
  cell: HTMLTableCellElement,
) => void;

type UseTableRowResizeOptions = {
  editor: Editor | null;
  setHoveredTableCell: (cell: HTMLElement | null) => void;
  clearHoveredTableCell: () => void;
  showRowGuide: RowGuideHandler;
  clearAllTableResizeHover: () => void;
  scheduleTableLayoutSync: () => void;
};

type RowResizeState = {
  rowElement: HTMLTableRowElement;
  tableElement: HTMLTableElement;
  cellElement: HTMLTableCellElement;
  cellIndex: number;
  rowPos: number;
  rowNode: ProseMirrorNode;
  startY: number;
  startHeight: number;
  previewHeight: number;
  pendingHeight: number;
};

export function useTableRowResize({
  editor,
  setHoveredTableCell,
  clearHoveredTableCell,
  showRowGuide,
  clearAllTableResizeHover,
  scheduleTableLayoutSync,
}: UseTableRowResizeOptions) {
  const commitFrameRef = useRef<number | null>(null);
  const stateRef = useRef<RowResizeState | null>(null);

  const commitPreview = React.useCallback(() => {
    if (!editor) return;
    const state = stateRef.current;
    if (!state) return;

    const nextHeight = state.pendingHeight;
    if (nextHeight === state.previewHeight) {
      document.body.style.cursor = "row-resize";
      showRowGuide(state.tableElement, state.rowElement, state.cellElement);
      scheduleTableLayoutSync();
      return;
    }

    state.previewHeight = nextHeight;
    const tr = editor.view.state.tr;
    tr.setNodeMarkup(state.rowPos, undefined, {
      ...state.rowNode.attrs,
      rowHeight: nextHeight,
    });
    tr.setMeta("addToHistory", false);
    editor.view.dispatch(tr);
    state.rowNode = editor.view.state.doc.nodeAt(state.rowPos) ?? state.rowNode;

    const rowIndex = state.rowElement.rowIndex;
    if (rowIndex >= 0) {
      const refreshedRow = state.tableElement.rows.item(rowIndex);
      if (refreshedRow instanceof HTMLTableRowElement) {
        state.rowElement = refreshedRow;
        const refreshedCell = refreshedRow.cells.item(state.cellIndex);
        if (refreshedCell instanceof HTMLTableCellElement) {
          state.cellElement = refreshedCell;
        }
      }
    }

    document.body.style.cursor = "row-resize";
    showRowGuide(state.tableElement, state.rowElement, state.cellElement);
    scheduleTableLayoutSync();
  }, [editor, scheduleTableLayoutSync, showRowGuide]);

  const scheduleCommit = React.useCallback(() => {
    if (commitFrameRef.current !== null) return;

    commitFrameRef.current = window.requestAnimationFrame(() => {
      commitFrameRef.current = null;
      commitPreview();
    });
  }, [commitPreview]);

  const syncActiveGuide = React.useCallback(() => {
    const state = stateRef.current;
    if (!state) return false;

    setHoveredTableCell(state.cellElement);
    showRowGuide(state.tableElement, state.rowElement, state.cellElement);
    return true;
  }, [setHoveredTableCell, showRowGuide]);

  const isResizing = React.useCallback(() => stateRef.current !== null, []);

  const beginResize = React.useCallback((
    event: MouseEvent,
    table: HTMLTableElement,
    row: HTMLTableRowElement,
    cell: HTMLTableCellElement,
  ) => {
    if (!editor || !isRowResizeHotspot(cell, event.clientX, event.clientY)) {
      return false;
    }

    setHoveredTableCell(cell);
    const rowInfo = findTableRowNodeInfo(editor.view, row);
    if (!rowInfo) return false;

    const startHeight = row.getBoundingClientRect().height;
    stateRef.current = {
      rowElement: row,
      tableElement: table,
      cellElement: cell,
      cellIndex: cell.cellIndex,
      rowPos: rowInfo.pos,
      rowNode: rowInfo.node,
      startY: event.clientY,
      startHeight,
      previewHeight: startHeight,
      pendingHeight: startHeight,
    };

    showRowGuide(table, row, cell);
    document.body.style.cursor = "row-resize";
    event.preventDefault();
    event.stopPropagation();
    return true;
  }, [editor, setHoveredTableCell, showRowGuide]);

  const handlePointerMove = React.useCallback((event: MouseEvent | PointerEvent) => {
    const state = stateRef.current;
    if (!state) return;

    const nextHeight = Math.max(
      MIN_TABLE_ROW_HEIGHT,
      Math.round(state.startHeight + (event.clientY - state.startY)),
    );

    if (nextHeight === state.pendingHeight) {
      document.body.style.cursor = "row-resize";
      showRowGuide(state.tableElement, state.rowElement, state.cellElement);
      return;
    }

    state.pendingHeight = nextHeight;
    document.body.style.cursor = "row-resize";
    scheduleCommit();
  }, [scheduleCommit, showRowGuide]);

  const handlePointerUp = React.useCallback((event: MouseEvent | PointerEvent) => {
    if (!editor) return;
    const state = stateRef.current;
    if (!state) return;

    const nextHeight = Math.max(
      MIN_TABLE_ROW_HEIGHT,
      Math.round(state.startHeight + (event.clientY - state.startY)),
    );

    state.pendingHeight = nextHeight;
    if (commitFrameRef.current !== null) {
      window.cancelAnimationFrame(commitFrameRef.current);
      commitFrameRef.current = null;
    }

    commitPreview();

    const latestState = stateRef.current ?? state;
    const rowNode = editor.view.state.doc.nodeAt(latestState.rowPos) ?? latestState.rowNode;
    if (rowNode.attrs.rowHeight !== nextHeight) {
      const tr = editor.view.state.tr;
      tr.setNodeMarkup(latestState.rowPos, undefined, {
        ...rowNode.attrs,
        rowHeight: nextHeight,
      });
      editor.view.dispatch(tr);
    }

    stateRef.current = null;
    document.body.style.cursor = "";
    clearHoveredTableCell();
    clearAllTableResizeHover();
    scheduleTableLayoutSync();
  }, [clearAllTableResizeHover, clearHoveredTableCell, commitPreview, editor, scheduleTableLayoutSync]);

  const cancelResize = React.useCallback(() => {
    if (!stateRef.current) return;

    if (commitFrameRef.current !== null) {
      window.cancelAnimationFrame(commitFrameRef.current);
      commitFrameRef.current = null;
    }

    stateRef.current = null;
    document.body.style.cursor = "";
    clearHoveredTableCell();
    clearAllTableResizeHover();
    scheduleTableLayoutSync();
  }, [clearAllTableResizeHover, clearHoveredTableCell, scheduleTableLayoutSync]);

  const cleanup = React.useCallback(() => {
    if (commitFrameRef.current !== null) {
      window.cancelAnimationFrame(commitFrameRef.current);
      commitFrameRef.current = null;
    }
    stateRef.current = null;
    document.body.style.cursor = "";
  }, []);

  return {
    beginResize,
    cancelResize,
    cleanup,
    handlePointerMove,
    handlePointerUp,
    isResizing,
    syncActiveGuide,
  };
}
