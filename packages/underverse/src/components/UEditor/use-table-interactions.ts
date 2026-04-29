"use client";

import React, { useEffect, useRef } from "react";
import type { Editor } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import {
  COLUMN_RESIZE_LINE_THICKNESS,
  findTableRowNodeInfo,
  getRelativeBoundaryMetrics,
  getRelativeCellMetrics,
  getRelativeSelectedCellsMetrics,
  getSelectionTableCell,
  isColumnResizeHotspot,
  isRowResizeHotspot,
  MIN_TABLE_ROW_HEIGHT,
  resolveEventElement,
  ROW_RESIZE_LINE_THICKNESS,
  UEDITOR_TABLE_LAYOUT_CHANGE_EVENT,
} from "./table-dom-utils";

export function useUEditorTableInteractions(editor: Editor | null) {
  const editorContentRef = useRef<HTMLDivElement | null>(null);
  const tableColumnGuideRef = useRef<HTMLSpanElement | null>(null);
  const tableRowGuideRef = useRef<HTMLSpanElement | null>(null);
  const activeTableCellHighlightRef = useRef<HTMLSpanElement | null>(null);
  const hoveredTableCellRef = useRef<HTMLElement | null>(null);
  const activeTableCellRef = useRef<HTMLElement | null>(null);
  const tableLayoutSyncFrameRef = useRef<number | null>(null);
  const rowResizeCommitFrameRef = useRef<number | null>(null);
  const rowResizeStateRef = useRef<{
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
  } | null>(null);

  const setEditorResizeCursor = React.useCallback((cursor: string) => {
    const proseMirror = editorContentRef.current?.querySelector(".ProseMirror") as HTMLElement | null;
    if (proseMirror) {
      proseMirror.style.cursor = cursor;
    }
  }, []);

  const hideColumnGuide = React.useCallback(() => {
    editorContentRef.current?.classList.remove("resize-cursor");
    const guide = tableColumnGuideRef.current;
    if (guide) {
      guide.style.opacity = "0";
    }
  }, []);

  const hideRowGuide = React.useCallback(() => {
    editorContentRef.current?.classList.remove("resize-row-cursor");
    const guide = tableRowGuideRef.current;
    if (guide) {
      guide.style.opacity = "0";
    }
  }, []);

  const clearAllTableResizeHover = React.useCallback(() => {
    setEditorResizeCursor("");
    hideColumnGuide();
    hideRowGuide();
  }, [hideColumnGuide, hideRowGuide, setEditorResizeCursor]);

  const updateActiveCellHighlight = React.useCallback((cell: HTMLElement | null) => {
    const surface = editorContentRef.current;
    const highlight = activeTableCellHighlightRef.current;
    if (!highlight) return;

    if (!surface || !cell) {
      highlight.style.display = "none";
      return;
    }

    const metrics = getRelativeSelectedCellsMetrics(surface) ?? getRelativeCellMetrics(surface, cell);
    highlight.style.display = "block";
    highlight.style.left = `${metrics.left}px`;
    highlight.style.top = `${metrics.top}px`;
    highlight.style.width = `${metrics.width}px`;
    highlight.style.height = `${metrics.height}px`;
  }, []);

  const scheduleTableLayoutSync = React.useCallback(() => {
    if (tableLayoutSyncFrameRef.current !== null) return;

    tableLayoutSyncFrameRef.current = window.requestAnimationFrame(() => {
      tableLayoutSyncFrameRef.current = null;
      updateActiveCellHighlight(activeTableCellRef.current);
      editorContentRef.current?.dispatchEvent(new CustomEvent(UEDITOR_TABLE_LAYOUT_CHANGE_EVENT));
    });
  }, [updateActiveCellHighlight]);

  const setActiveTableCell = React.useCallback((cell: HTMLElement | null) => {
    if (activeTableCellRef.current === cell) return;

    activeTableCellRef.current = cell;
    updateActiveCellHighlight(activeTableCellRef.current);
  }, [updateActiveCellHighlight]);

  const clearActiveTableCell = React.useCallback(() => {
    activeTableCellRef.current = null;
    updateActiveCellHighlight(null);
  }, [updateActiveCellHighlight]);

  const setHoveredTableCell = React.useCallback((cell: HTMLElement | null) => {
    hoveredTableCellRef.current = cell;
  }, []);

  const clearHoveredTableCell = React.useCallback(() => {
    hoveredTableCellRef.current = null;
  }, []);

  const showColumnGuide = React.useCallback((table: HTMLTableElement, row: HTMLTableRowElement, cell: HTMLTableCellElement) => {
    const surface = editorContentRef.current;
    const guide = tableColumnGuideRef.current;
    if (!surface || !guide) return;

    const metrics = getRelativeBoundaryMetrics(surface, table, row, cell);
    guide.style.left = `${metrics.columnRight - COLUMN_RESIZE_LINE_THICKNESS / 2}px`;
    guide.style.top = `${metrics.top}px`;
    guide.style.width = `${COLUMN_RESIZE_LINE_THICKNESS}px`;
    guide.style.height = `${metrics.height}px`;
    guide.style.opacity = "1";
    surface.classList.add("resize-cursor");
    setEditorResizeCursor("col-resize");
  }, [setEditorResizeCursor]);

  const showRowGuide = React.useCallback((table: HTMLTableElement, row: HTMLTableRowElement, cell: HTMLTableCellElement) => {
    const surface = editorContentRef.current;
    const guide = tableRowGuideRef.current;
    if (!surface || !guide) return;

    const metrics = getRelativeBoundaryMetrics(surface, table, row, cell);
    guide.style.left = `${metrics.left}px`;
    guide.style.top = `${metrics.rowBottom - ROW_RESIZE_LINE_THICKNESS / 2}px`;
    guide.style.width = `${metrics.width}px`;
    guide.style.height = `${ROW_RESIZE_LINE_THICKNESS}px`;
    guide.style.opacity = "1";
    surface.classList.add("resize-row-cursor");
    setEditorResizeCursor("row-resize");
  }, [setEditorResizeCursor]);

  const commitRowResizePreview = React.useCallback(() => {
    if (!editor) return;
    const state = rowResizeStateRef.current;
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

    const refreshedRow = state.tableElement.rows.item(state.rowElement.rowIndex);
    if (refreshedRow instanceof HTMLTableRowElement) {
      state.rowElement = refreshedRow;
      const refreshedCell = refreshedRow.cells.item(state.cellIndex);
      if (refreshedCell instanceof HTMLTableCellElement) {
        state.cellElement = refreshedCell;
      }
    }

    document.body.style.cursor = "row-resize";
    showRowGuide(state.tableElement, state.rowElement, state.cellElement);
    scheduleTableLayoutSync();
  }, [editor, scheduleTableLayoutSync, showRowGuide]);

  const scheduleRowResizeCommit = React.useCallback(() => {
    if (rowResizeCommitFrameRef.current !== null) return;

    rowResizeCommitFrameRef.current = window.requestAnimationFrame(() => {
      rowResizeCommitFrameRef.current = null;
      commitRowResizePreview();
    });
  }, [commitRowResizePreview]);

  const syncActiveTableCellFromSelection = React.useCallback(() => {
    if (!editor) return;
    setActiveTableCell(getSelectionTableCell(editor.view));
  }, [editor, setActiveTableCell]);

  useEffect(() => {
    if (!editor) return undefined;

    const proseMirror = editor.view.dom as HTMLElement;
    const surface = editorContentRef.current;
    let selectionSyncTimeoutId = 0;

    const scheduleActiveCellSync = (fallbackCell: HTMLElement | null = null) => {
      requestAnimationFrame(() => {
        setActiveTableCell(getSelectionTableCell(editor.view) ?? fallbackCell);
      });

      window.clearTimeout(selectionSyncTimeoutId);
      selectionSyncTimeoutId = window.setTimeout(() => {
        setActiveTableCell(getSelectionTableCell(editor.view) ?? fallbackCell);
      }, 0);
    };

    const handleSelectionChange = () => {
      scheduleActiveCellSync();
    };

    const handleActiveCellLayoutChange = () => {
      updateActiveCellHighlight(activeTableCellRef.current);
    };

    const handleEditorMouseMove = (event: MouseEvent) => {
      const activeRowResize = rowResizeStateRef.current;
      if (activeRowResize) {
        setHoveredTableCell(activeRowResize.cellElement);
        showRowGuide(activeRowResize.tableElement, activeRowResize.rowElement, activeRowResize.cellElement);
        return;
      }

      const target = resolveEventElement(event.target);
      if (!(target instanceof Element)) {
        clearAllTableResizeHover();
        return;
      }

      const cell = target.closest("th,td");
      if (!(cell instanceof HTMLElement)) {
        clearHoveredTableCell();
        clearAllTableResizeHover();
        return;
      }

      setHoveredTableCell(cell);

      const row = cell.closest("tr");
      const table = cell.closest("table");
      if (!(row instanceof HTMLTableRowElement) || !(table instanceof HTMLTableElement)) {
        clearHoveredTableCell();
        clearAllTableResizeHover();
        return;
      }

      const nearBottom = isRowResizeHotspot(cell, event.clientX, event.clientY);
      const nearRight = isColumnResizeHotspot(cell, event.clientX, event.clientY);

      if (nearBottom && cell instanceof HTMLTableCellElement) {
        hideColumnGuide();
        showRowGuide(table, row, cell);
        return;
      }

      if (nearRight && cell instanceof HTMLTableCellElement) {
        hideRowGuide();
        showColumnGuide(table, row, cell);
        return;
      }

      clearAllTableResizeHover();
    };

    const handleEditorMouseLeave = () => {
      clearHoveredTableCell();
      if (!rowResizeStateRef.current) {
        clearAllTableResizeHover();
      }
    };

    const handleEditorMouseDown = (event: MouseEvent) => {
      if (event.button !== 0) return;

      const target = resolveEventElement(event.target);
      if (!(target instanceof Element)) {
        clearActiveTableCell();
        return;
      }

      const cell = target.closest("th,td");
      if (!(cell instanceof HTMLTableCellElement)) {
        clearActiveTableCell();
        return;
      }

      setActiveTableCell(cell);
      scheduleActiveCellSync(cell);

      const row = cell.closest("tr");
      const table = cell.closest("table");
      if (!(row instanceof HTMLTableRowElement) || !(table instanceof HTMLTableElement)) return;

      if (!isRowResizeHotspot(cell, event.clientX, event.clientY)) {
        return;
      }

      setHoveredTableCell(cell);

      const rowInfo = findTableRowNodeInfo(editor.view, row);
      if (!rowInfo) return;

      const startHeight = row.getBoundingClientRect().height;
      rowResizeStateRef.current = {
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
    };

    const handlePointerMove = (event: MouseEvent) => {
      const state = rowResizeStateRef.current;
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
      scheduleRowResizeCommit();
    };

    const handlePointerUp = (event: MouseEvent) => {
      const state = rowResizeStateRef.current;
      if (!state) return;

      const nextHeight = Math.max(
        MIN_TABLE_ROW_HEIGHT,
        Math.round(state.startHeight + (event.clientY - state.startY)),
      );

      state.pendingHeight = nextHeight;
      if (rowResizeCommitFrameRef.current !== null) {
        window.cancelAnimationFrame(rowResizeCommitFrameRef.current);
        rowResizeCommitFrameRef.current = null;
      }

      commitRowResizePreview();

      const latestState = rowResizeStateRef.current ?? state;
      const rowNode = editor.view.state.doc.nodeAt(latestState.rowPos) ?? latestState.rowNode;
      if (rowNode.attrs.rowHeight !== nextHeight) {
        const tr = editor.view.state.tr;
        tr.setNodeMarkup(latestState.rowPos, undefined, {
          ...rowNode.attrs,
          rowHeight: nextHeight,
        });
        editor.view.dispatch(tr);
      }
      rowResizeStateRef.current = null;
      document.body.style.cursor = "";
      clearHoveredTableCell();
      clearAllTableResizeHover();
      scheduleTableLayoutSync();
    };

    const handleWindowBlur = () => {
      const state = rowResizeStateRef.current;
      if (!state) return;
      if (rowResizeCommitFrameRef.current !== null) {
        window.cancelAnimationFrame(rowResizeCommitFrameRef.current);
        rowResizeCommitFrameRef.current = null;
      }
      rowResizeStateRef.current = null;
      document.body.style.cursor = "";
      clearHoveredTableCell();
      clearAllTableResizeHover();
      scheduleTableLayoutSync();
    };

    proseMirror.addEventListener("mousemove", handleEditorMouseMove);
    proseMirror.addEventListener("mouseleave", handleEditorMouseLeave);
    proseMirror.addEventListener("mousedown", handleEditorMouseDown);
    proseMirror.addEventListener("click", handleSelectionChange);
    proseMirror.addEventListener("mouseup", handleSelectionChange);
    proseMirror.addEventListener("keyup", handleSelectionChange);
    proseMirror.addEventListener("focusin", handleSelectionChange);
    document.addEventListener("selectionchange", handleSelectionChange);
    surface?.addEventListener("scroll", handleActiveCellLayoutChange, { passive: true });
    window.addEventListener("resize", handleActiveCellLayoutChange);
    window.addEventListener("mousemove", handlePointerMove);
    document.addEventListener("pointermove", handlePointerMove as EventListener);
    window.addEventListener("mouseup", handlePointerUp);
    document.addEventListener("pointerup", handlePointerUp as EventListener);
    window.addEventListener("blur", handleWindowBlur);
    editor.on("selectionUpdate", syncActiveTableCellFromSelection);
    editor.on("focus", syncActiveTableCellFromSelection);
    syncActiveTableCellFromSelection();

    return () => {
      proseMirror.removeEventListener("mousemove", handleEditorMouseMove);
      proseMirror.removeEventListener("mouseleave", handleEditorMouseLeave);
      proseMirror.removeEventListener("mousedown", handleEditorMouseDown);
      proseMirror.removeEventListener("click", handleSelectionChange);
      proseMirror.removeEventListener("mouseup", handleSelectionChange);
      proseMirror.removeEventListener("keyup", handleSelectionChange);
      proseMirror.removeEventListener("focusin", handleSelectionChange);
      document.removeEventListener("selectionchange", handleSelectionChange);
      surface?.removeEventListener("scroll", handleActiveCellLayoutChange);
      window.removeEventListener("resize", handleActiveCellLayoutChange);
      window.removeEventListener("mousemove", handlePointerMove);
      document.removeEventListener("pointermove", handlePointerMove as EventListener);
      window.removeEventListener("mouseup", handlePointerUp);
      document.removeEventListener("pointerup", handlePointerUp as EventListener);
      window.removeEventListener("blur", handleWindowBlur);
      editor.off("selectionUpdate", syncActiveTableCellFromSelection);
      editor.off("focus", syncActiveTableCellFromSelection);
      window.clearTimeout(selectionSyncTimeoutId);
      if (tableLayoutSyncFrameRef.current !== null) {
        window.cancelAnimationFrame(tableLayoutSyncFrameRef.current);
        tableLayoutSyncFrameRef.current = null;
      }
      if (rowResizeCommitFrameRef.current !== null) {
        window.cancelAnimationFrame(rowResizeCommitFrameRef.current);
        rowResizeCommitFrameRef.current = null;
      }
      document.body.style.cursor = "";
      clearActiveTableCell();
      clearHoveredTableCell();
      clearAllTableResizeHover();
      rowResizeStateRef.current = null;
    };
  }, [clearActiveTableCell, clearAllTableResizeHover, clearHoveredTableCell, commitRowResizePreview, editor, hideColumnGuide, hideRowGuide, scheduleRowResizeCommit, scheduleTableLayoutSync, setHoveredTableCell, showColumnGuide, showRowGuide, syncActiveTableCellFromSelection, updateActiveCellHighlight]);

  return {
    editorContentRef,
    tableColumnGuideRef,
    tableRowGuideRef,
    activeTableCellHighlightRef,
  };
}
