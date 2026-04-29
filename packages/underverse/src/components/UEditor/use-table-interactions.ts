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

export function useUEditorTableInteractions(editor: Editor | null) {
  const editorContentRef = useRef<HTMLDivElement | null>(null);
  const tableColumnGuideRef = useRef<HTMLSpanElement | null>(null);
  const tableRowGuideRef = useRef<HTMLSpanElement | null>(null);
  const activeTableCellHighlightRef = useRef<HTMLSpanElement | null>(null);
  const hoveredTableCellRef = useRef<HTMLElement | null>(null);
  const activeTableCellRef = useRef<HTMLElement | null>(null);
  const suppressActiveCellHighlightRef = useRef(false);
  const tableLayoutSyncFrameRef = useRef<number | null>(null);

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
      cleanupRowResize();
      suppressActiveCellHighlightRef.current = false;
      document.body.style.cursor = "";
      clearActiveTableCell();
      clearHoveredTableCell();
      clearAllTableResizeHover();
    };
  }, [beginResize, cancelResize, cleanupRowResize, clearActiveTableCell, clearAllTableResizeHover, clearHoveredTableCell, editor, handleRowResizePointerMove, handleRowResizePointerUp, hideColumnGuide, hideRowGuide, isRowResizing, showColumnGuide, showRowGuide, syncActiveRowResizeGuide, syncActiveTableCellFromSelection, updateActiveCellHighlight]);

  return {
    editorContentRef,
    tableColumnGuideRef,
    tableRowGuideRef,
    activeTableCellHighlightRef,
  };
}
