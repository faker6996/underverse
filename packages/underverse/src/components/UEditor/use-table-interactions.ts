"use client";

import React, { useEffect, useRef } from "react";
import type { Editor } from "@tiptap/core";
import {
  COLUMN_RESIZE_LINE_THICKNESS,
  getRelativeBoundaryMetrics,
  getRelativeCellMetrics,
  getRelativeSelectedCellsMetrics,
  getSelectionTableCell,
  isColumnResizeHotspot,
  isRowResizeHotspot,
  resolveEventElement,
  ROW_RESIZE_LINE_THICKNESS,
  UEDITOR_TABLE_LAYOUT_CHANGE_EVENT,
} from "./table-dom-utils";
import { useTableRowResize } from "./use-table-row-resize";

export function useUEditorTableInteractions(editor: Editor | null, editable = true) {
  const editorContentRef = useRef<HTMLDivElement | null>(null);
  const tableColumnGuideRef = useRef<HTMLSpanElement | null>(null);
  const tableRowGuideRef = useRef<HTMLSpanElement | null>(null);
  const activeTableCellHighlightRef = useRef<HTMLSpanElement | null>(null);
  const hoveredTableCellRef = useRef<HTMLElement | null>(null);
  const activeTableCellRef = useRef<HTMLElement | null>(null);
  const suppressActiveCellHighlightRef = useRef(false);
  const tableLayoutSyncFrameRef = useRef<number | null>(null);

  const getProseMirrorElement = React.useCallback(() => {
    return editorContentRef.current?.querySelector(".ProseMirror") as HTMLElement | null;
  }, []);

  const setEditorResizeCursor = React.useCallback((cursor: string) => {
    const proseMirror = getProseMirrorElement();
    if (proseMirror) {
      proseMirror.style.cursor = cursor;
    }
  }, [getProseMirrorElement]);

  const hideColumnGuide = React.useCallback(() => {
    editorContentRef.current?.classList.remove("resize-cursor");
    getProseMirrorElement()?.classList.remove("resize-cursor");
    const guide = tableColumnGuideRef.current;
    if (guide) {
      guide.style.opacity = "0";
    }
  }, [getProseMirrorElement]);

  const hideRowGuide = React.useCallback(() => {
    editorContentRef.current?.classList.remove("resize-row-cursor");
    getProseMirrorElement()?.classList.remove("resize-row-cursor");
    const guide = tableRowGuideRef.current;
    if (guide) {
      guide.style.opacity = "0";
    }
  }, [getProseMirrorElement]);

  const clearAllTableResizeHover = React.useCallback(() => {
    setEditorResizeCursor("");
    hideColumnGuide();
    hideRowGuide();
  }, [hideColumnGuide, hideRowGuide, setEditorResizeCursor]);

  const updateActiveCellHighlight = React.useCallback((cell: HTMLElement | null) => {
    const surface = editorContentRef.current;
    const highlight = activeTableCellHighlightRef.current;
    if (!highlight) return;

    if (suppressActiveCellHighlightRef.current || !surface || !cell) {
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
    if (activeTableCellRef.current === cell) {
      updateActiveCellHighlight(cell);
      return;
    }

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
    getProseMirrorElement()?.classList.add("resize-cursor");
    setEditorResizeCursor("col-resize");
  }, [getProseMirrorElement, setEditorResizeCursor]);

  const showRowGuide = React.useCallback((table: HTMLTableElement, row: HTMLTableRowElement, cell: HTMLTableCellElement, previewHeight?: number) => {
    const surface = editorContentRef.current;
    const guide = tableRowGuideRef.current;
    if (!surface || !guide) return;

    const metrics = getRelativeBoundaryMetrics(surface, table, row, cell);
    const rowRect = row.getBoundingClientRect();
    const previewBottom = typeof previewHeight === "number"
      ? metrics.rowBottom - rowRect.height + previewHeight
      : metrics.rowBottom;
    guide.style.left = `${metrics.left}px`;
    guide.style.top = `${previewBottom - ROW_RESIZE_LINE_THICKNESS / 2}px`;
    guide.style.width = `${metrics.width}px`;
    guide.style.height = `${ROW_RESIZE_LINE_THICKNESS}px`;
    guide.style.opacity = "1";
    surface.classList.add("resize-row-cursor");
    getProseMirrorElement()?.classList.add("resize-row-cursor");
    setEditorResizeCursor("row-resize");
  }, [getProseMirrorElement, setEditorResizeCursor]);

  const {
    beginResize,
    cancelResize,
    cleanup: cleanupRowResize,
    handlePointerMove: handleRowResizePointerMove,
    handlePointerUp: handleRowResizePointerUp,
    isResizing: isRowResizing,
    syncActiveGuide: syncActiveRowResizeGuide,
  } = useTableRowResize({
    editor,
    setHoveredTableCell,
    clearHoveredTableCell,
    showRowGuide,
    clearAllTableResizeHover,
    scheduleTableLayoutSync,
  });

  const syncActiveTableCellFromSelection = React.useCallback(() => {
    if (!editor) return;
    if (!editor.isFocused) {
      clearActiveTableCell();
      return;
    }
    setActiveTableCell(getSelectionTableCell(editor.view));
  }, [clearActiveTableCell, editor, setActiveTableCell]);

  useEffect(() => {
    if (!editor || !editable) return undefined;

    const proseMirror = editor.view.dom as HTMLElement;
    const surface = editorContentRef.current;
    let selectionSyncTimeoutId = 0;
    const scrollListenerOptions = { passive: true, capture: true };

    const scheduleActiveCellSync = (fallbackCell: HTMLElement | null = null) => {
      requestAnimationFrame(() => {
        if (!editor.isFocused) {
          clearActiveTableCell();
          return;
        }
        setActiveTableCell(getSelectionTableCell(editor.view) ?? fallbackCell);
      });

      window.clearTimeout(selectionSyncTimeoutId);
      selectionSyncTimeoutId = window.setTimeout(() => {
        if (!editor.isFocused) {
          clearActiveTableCell();
          return;
        }
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
      if (syncActiveRowResizeGuide()) {
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
      if (!isRowResizing()) {
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

      if (beginResize(event, table, row, cell)) {
        suppressActiveCellHighlightRef.current = true;
        updateActiveCellHighlight(null);
      }
    };

    const handlePointerMove = (event: MouseEvent) => {
      handleRowResizePointerMove(event);
    };

    const handlePointerUp = (event: MouseEvent) => {
      const wasRowResizing = isRowResizing();
      handleRowResizePointerUp(event);
      if (wasRowResizing) {
        suppressActiveCellHighlightRef.current = false;
        requestAnimationFrame(() => {
          updateActiveCellHighlight(activeTableCellRef.current);
        });
      }
    };

    const handleWindowBlur = () => {
      const wasRowResizing = isRowResizing();
      cancelResize();
      if (wasRowResizing) {
        suppressActiveCellHighlightRef.current = false;
        updateActiveCellHighlight(activeTableCellRef.current);
      }
    };

    proseMirror.addEventListener("mousemove", handleEditorMouseMove);
    proseMirror.addEventListener("mouseleave", handleEditorMouseLeave);
    proseMirror.addEventListener("mousedown", handleEditorMouseDown);
    proseMirror.addEventListener("click", handleSelectionChange);
    proseMirror.addEventListener("mouseup", handleSelectionChange);
    proseMirror.addEventListener("keyup", handleSelectionChange);
    proseMirror.addEventListener("focusin", handleSelectionChange);
    document.addEventListener("selectionchange", handleSelectionChange);
    surface?.addEventListener(UEDITOR_TABLE_LAYOUT_CHANGE_EVENT, handleActiveCellLayoutChange);
    surface?.addEventListener("scroll", handleActiveCellLayoutChange, scrollListenerOptions);
    window.addEventListener("resize", handleActiveCellLayoutChange);
    document.addEventListener("pointermove", handlePointerMove as EventListener);
    document.addEventListener("pointerup", handlePointerUp as EventListener);
    window.addEventListener("blur", handleWindowBlur);
    editor.on("selectionUpdate", syncActiveTableCellFromSelection);
    editor.on("focus", syncActiveTableCellFromSelection);
    editor.on("blur", clearActiveTableCell);
    editor.on("update", scheduleTableLayoutSync);
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
      surface?.removeEventListener(UEDITOR_TABLE_LAYOUT_CHANGE_EVENT, handleActiveCellLayoutChange);
      surface?.removeEventListener("scroll", handleActiveCellLayoutChange, scrollListenerOptions);
      window.removeEventListener("resize", handleActiveCellLayoutChange);
      document.removeEventListener("pointermove", handlePointerMove as EventListener);
      document.removeEventListener("pointerup", handlePointerUp as EventListener);
      window.removeEventListener("blur", handleWindowBlur);
      editor.off("selectionUpdate", syncActiveTableCellFromSelection);
      editor.off("focus", syncActiveTableCellFromSelection);
      editor.off("blur", clearActiveTableCell);
      editor.off("update", scheduleTableLayoutSync);
      window.clearTimeout(selectionSyncTimeoutId);
      if (tableLayoutSyncFrameRef.current !== null) {
        window.cancelAnimationFrame(tableLayoutSyncFrameRef.current);
        tableLayoutSyncFrameRef.current = null;
      }
      cleanupRowResize();
      suppressActiveCellHighlightRef.current = false;
      document.body.style.cursor = "";
      clearActiveTableCell();
      clearHoveredTableCell();
      clearAllTableResizeHover();
    };
  }, [beginResize, cancelResize, cleanupRowResize, clearActiveTableCell, clearAllTableResizeHover, clearHoveredTableCell, editable, editor, handleRowResizePointerMove, handleRowResizePointerUp, hideColumnGuide, hideRowGuide, isRowResizing, scheduleTableLayoutSync, setActiveTableCell, setHoveredTableCell, showColumnGuide, showRowGuide, syncActiveRowResizeGuide, syncActiveTableCellFromSelection, updateActiveCellHighlight]);

  return {
    editorContentRef,
    tableColumnGuideRef,
    tableRowGuideRef,
    activeTableCellHighlightRef,
  };
}
