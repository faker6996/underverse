"use client";

import React from "react";
import type { ChainedCommands, Editor } from "@tiptap/core";
import { moveTableColumn, moveTableRow } from "prosemirror-tables";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Copy,
  Paintbrush,
  Table as TableIcon,
  Trash2,
} from "lucide-react";
import { useSmartTranslations } from "../../hooks/useSmartTranslations";
import { applyTableAlignment } from "./table-align-utils";
import {
  clearTableColumnAt,
  clearTableRowAt,
  duplicateTableColumnAt,
  duplicateTableRowAt,
  expandTableFromCell,
  runTableCommandAtCellPos,
} from "./table-cell-commands";
import { resolveEventElement, UEDITOR_TABLE_LAYOUT_CHANGE_EVENT } from "./table-dom-utils";
import {
  areTableHoverStatesEqual,
  buildTableHoverState,
  DEFAULT_TABLE_HOVER_STATE,
  type TableHoverState,
} from "./table-hover-state";
import { TableDragPreview, type TableDragPreviewState } from "./table-drag-preview";
import { TableAddRails } from "./table-add-rails";
import { TableControlMenu } from "./table-control-menu";
import { TableColumnHandles, TableRowHandles } from "./table-axis-handles";
import { TableResizeHandles } from "./table-resize-handles";
import {
  buildTableControlLayout,
  getCellFromTarget,
  type TableAxisHandle,
  type TableControlLayout,
} from "./table-layout-model";
import {
  applyTableSize,
  createTableSizeSnapshot,
  resolveTableResizeDimensions,
  type TableResizeDimensions,
  type TableSizeSnapshot,
} from "./table-size-utils";

const TABLE_MENU_TOP_OFFSET = 10;
const COLUMN_HANDLE_TOP_OFFSET = 8;

/** Public props for the `TableControls` component. */
type TableControlsProps = {
  editor: Editor;
  containerRef: React.RefObject<HTMLDivElement | null>;
  showCellInspector?: boolean;
};

type DragState =
  | { kind: "row"; originIndex: number; targetIndex: number; anchorPos: number }
  | { kind: "column"; originIndex: number; targetIndex: number; anchorPos: number }
  | { kind: "add-row"; previewRows: number }
  | { kind: "add-column"; previewCols: number }
  | {
      kind: "resize-table";
      pointerId: number;
      pointerTarget: HTMLButtonElement;
      startX: number;
      startY: number;
      snapshot: TableSizeSnapshot;
      pendingDimensions: TableResizeDimensions;
    };

type OpenMenuKey = `row:${number}` | `column:${number}` | "table" | null;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function nearestIndex(centers: number[], position: number) {
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  centers.forEach((center, index) => {
    const distance = Math.abs(center - position);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });

  return bestIndex;
}

function getSelectedCell(editor: Editor) {
  const browserSelection = window.getSelection();
  const anchorElement = resolveEventElement(browserSelection?.anchorNode ?? null);
  const anchorCell = anchorElement?.closest?.("th,td");
  if (anchorCell instanceof HTMLTableCellElement) {
    return anchorCell;
  }

  const domAtPos = editor.view.domAtPos(editor.state.selection.from);
  return getCellFromTarget(domAtPos.node);
}

export function TableControls({ editor, containerRef, showCellInspector = true }: TableControlsProps) {
  const t = useSmartTranslations("UEditor");
  const [layout, setLayout] = React.useState<TableControlLayout | null>(null);
  const [dragPreview, setDragPreview] = React.useState<TableDragPreviewState | null>(null);
  const [tableResizeActive, setTableResizeActive] = React.useState(false);
  const [hoverState, setHoverState] = React.useState<TableHoverState>(DEFAULT_TABLE_HOVER_STATE);
  const [openMenuKey, setOpenMenuKey] = React.useState<OpenMenuKey>(null);
  const layoutRef = React.useRef<TableControlLayout | null>(null);
  const dragStateRef = React.useRef<DragState | null>(null);
  const syncFrameRef = React.useRef<number | null>(null);
  const tableResizeFrameRef = React.useRef<HTMLDivElement>(null);
  const tableResizePreviewFrameRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    layoutRef.current = layout;
  }, [layout]);

  const syncFromCell = React.useCallback((cell: HTMLTableCellElement | null) => {
    const surface = containerRef.current;
    if (!surface || !cell) {
      setLayout(null);
      return;
    }

    setLayout(buildTableControlLayout(editor, surface, cell));
  }, [containerRef, editor]);

  const syncFromSelection = React.useCallback(() => {
    syncFromCell(getSelectedCell(editor));
  }, [editor, syncFromCell]);

  const scheduleSyncFromSelection = React.useCallback(() => {
    if (syncFrameRef.current !== null) return;

    syncFrameRef.current = window.requestAnimationFrame(() => {
      syncFrameRef.current = null;
      syncFromSelection();
    });
  }, [syncFromSelection]);

  React.useEffect(() => () => {
    if (syncFrameRef.current !== null) {
      window.cancelAnimationFrame(syncFrameRef.current);
      syncFrameRef.current = null;
    }
  }, []);

  const refreshCurrentLayout = React.useCallback(() => {
    setLayout((prev) => {
      if (!prev) return prev;

      const surface = containerRef.current;
      if (!surface) return null;

      const node = editor.view.nodeDOM(prev.cellPos);
      const cell = getCellFromTarget(node) ?? getSelectedCell(editor);
      return cell ? buildTableControlLayout(editor, surface, cell) : null;
    });
  }, [containerRef, editor]);

  const updateTableResizePreview = React.useCallback((dimensions: TableResizeDimensions) => {
    const frame = tableResizeFrameRef.current;
    if (!frame) return;

    frame.style.width = `${dimensions.width}px`;
    frame.style.height = `${dimensions.height}px`;
    const dimensionsLabel = frame.querySelector<HTMLElement>("[data-table-resize-dimensions]");
    if (dimensionsLabel) {
      dimensionsLabel.textContent = `${dimensions.width} × ${dimensions.height}`;
    }
  }, []);

  const resetTableResizePreview = React.useCallback(() => {
    const activeLayout = layoutRef.current;
    if (!activeLayout) return;
    updateTableResizePreview({
      width: Math.round(activeLayout.tableWidth),
      height: Math.round(activeLayout.tableHeight),
    });
  }, [updateTableResizePreview]);

  const clearDrag = React.useCallback(() => {
    const dragState = dragStateRef.current;
    if (dragState?.kind === "resize-table") {
      try {
        if (dragState.pointerTarget.hasPointerCapture?.(dragState.pointerId)) {
          dragState.pointerTarget.releasePointerCapture(dragState.pointerId);
        }
      } catch {}
    }

    if (tableResizePreviewFrameRef.current !== null) {
      window.cancelAnimationFrame(tableResizePreviewFrameRef.current);
      tableResizePreviewFrameRef.current = null;
    }
    dragStateRef.current = null;
    setDragPreview(null);
    setTableResizeActive(false);
    resetTableResizePreview();
    document.body.style.cursor = "";
  }, [resetTableResizePreview]);

  const updateHoverState = React.useCallback((event: MouseEvent | PointerEvent) => {
    const activeLayout = layoutRef.current;
    const surface = containerRef.current;
    if (!activeLayout || !surface || dragStateRef.current) {
      setHoverState(DEFAULT_TABLE_HOVER_STATE);
      return;
    }

    const nextState = buildTableHoverState({
      event,
      layout: activeLayout,
      surface,
    });

    setHoverState((prev) => {
      return areTableHoverStatesEqual(prev, nextState) ? prev : nextState;
    });
  }, [containerRef]);

  React.useEffect(() => {
    const proseMirror = editor.view.dom as HTMLElement;
    const surface = containerRef.current;
    if (!surface) return undefined;
    const scrollListenerOptions = { passive: true, capture: true };

    const handleMouseOver = (event: MouseEvent) => {
      if (dragStateRef.current) return;
      const cell = getCellFromTarget(event.target);
      if (!cell) return;
      syncFromCell(cell);
    };

    const handleSurfaceMouseMove = (event: MouseEvent) => {
      updateHoverState(event);
    };

    const handleMouseLeave = () => {
      if (dragStateRef.current) return;
      setHoverState(DEFAULT_TABLE_HOVER_STATE);
    };

    const handleFocusIn = (event?: Event) => {
      if (dragStateRef.current) return;
      const cell = event ? getCellFromTarget(event.target) : null;
      syncFromCell(cell ?? getSelectedCell(editor));
    };

    const handleDoubleClick = (event: MouseEvent) => {
      if (event.button !== 0) return;

      const cell = getCellFromTarget(event.target);
      if (!cell || cell.hasAttribute("data-formula")) return;

      const surface = containerRef.current;
      const nextLayout = surface ? buildTableControlLayout(editor, surface, cell) : null;
      if (!nextLayout) return;

      const didSelect = editor.commands.setCellSelection({
        anchorCell: nextLayout.cellPos,
        headCell: nextLayout.cellPos,
      });
      if (!didSelect) return;

      event.preventDefault();
      editor.view.focus();
      setLayout(nextLayout);
    };

    proseMirror.addEventListener("mouseover", handleMouseOver);
    proseMirror.addEventListener("mouseleave", handleMouseLeave);
    proseMirror.addEventListener("click", handleFocusIn);
    proseMirror.addEventListener("dblclick", handleDoubleClick);
    proseMirror.addEventListener("mouseup", handleFocusIn);
    proseMirror.addEventListener("focusin", handleFocusIn);
    surface.addEventListener("mouseover", handleSurfaceMouseMove);
    surface.addEventListener("mousemove", handleSurfaceMouseMove);
    surface.addEventListener("scroll", refreshCurrentLayout, scrollListenerOptions);
    surface.addEventListener(UEDITOR_TABLE_LAYOUT_CHANGE_EVENT, refreshCurrentLayout);
    window.addEventListener("resize", refreshCurrentLayout);
    editor.on("selectionUpdate", syncFromSelection);
    editor.on("update", refreshCurrentLayout);

    syncFromSelection();

    return () => {
      proseMirror.removeEventListener("mouseover", handleMouseOver);
      proseMirror.removeEventListener("mouseleave", handleMouseLeave);
      proseMirror.removeEventListener("click", handleFocusIn);
      proseMirror.removeEventListener("dblclick", handleDoubleClick);
      proseMirror.removeEventListener("mouseup", handleFocusIn);
      proseMirror.removeEventListener("focusin", handleFocusIn);
      surface.removeEventListener("mouseover", handleSurfaceMouseMove);
      surface.removeEventListener("mousemove", handleSurfaceMouseMove);
      surface.removeEventListener("scroll", refreshCurrentLayout, scrollListenerOptions);
      surface.removeEventListener(UEDITOR_TABLE_LAYOUT_CHANGE_EVENT, refreshCurrentLayout);
      window.removeEventListener("resize", refreshCurrentLayout);
      editor.off("selectionUpdate", syncFromSelection);
      editor.off("update", refreshCurrentLayout);
    };
  }, [clearDrag, containerRef, editor, refreshCurrentLayout, syncFromCell, syncFromSelection, updateHoverState]);

  const runAtCellPos = React.useCallback((cellPos: number | null, command: (chain: ChainedCommands) => ChainedCommands, options?: { sync?: boolean }) => {
    const result = runTableCommandAtCellPos(editor, cellPos, command);
    if (options?.sync !== false) {
      scheduleSyncFromSelection();
    }
    return result;
  }, [editor, scheduleSyncFromSelection]);

  const runAtActiveCell = React.useCallback((command: (chain: ChainedCommands) => ChainedCommands, options?: { sync?: boolean }) => {
    return runAtCellPos(layoutRef.current?.cellPos ?? null, command, options);
  }, [runAtCellPos]);

  const duplicateRowAt = React.useCallback((rowIndex: number, cellPos: number | null) => {
    const result = duplicateTableRowAt(editor, rowIndex, cellPos);
    scheduleSyncFromSelection();
    return result;
  }, [editor, scheduleSyncFromSelection]);

  const clearRowAt = React.useCallback((rowIndex: number, cellPos: number | null) => {
    const result = clearTableRowAt(editor, rowIndex, cellPos);
    scheduleSyncFromSelection();
    return result;
  }, [editor, scheduleSyncFromSelection]);

  const duplicateColumnAt = React.useCallback((columnIndex: number, cellPos: number | null) => {
    const result = duplicateTableColumnAt(editor, columnIndex, cellPos);
    scheduleSyncFromSelection();
    return result;
  }, [editor, scheduleSyncFromSelection]);

  const clearColumnAt = React.useCallback((columnIndex: number, cellPos: number | null) => {
    const result = clearTableColumnAt(editor, columnIndex, cellPos);
    scheduleSyncFromSelection();
    return result;
  }, [editor, scheduleSyncFromSelection]);

  const expandTableBy = React.useCallback((rows: number, cols: number) => {
    const activeCellPos = layoutRef.current?.cellPos ?? editor.state.selection.from;
    const result = expandTableFromCell(editor, activeCellPos, rows, cols);
    scheduleSyncFromSelection();
    return result;
  }, [editor, scheduleSyncFromSelection]);

  const canExpandTable = Boolean(layout);
  const controlsVisible = dragPreview !== null;
  const tableMenuOpen = openMenuKey === "table";
  const startTableResize = React.useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0 || dragStateRef.current) return;

    const activeLayout = layoutRef.current;
    if (!activeLayout) return;

    const snapshot = createTableSizeSnapshot(
      editor,
      activeLayout.cellPos,
      activeLayout.tableWidth,
      activeLayout.tableHeight,
    );
    if (!snapshot) return;

    event.preventDefault();
    event.stopPropagation();
    try {
      event.currentTarget.setPointerCapture?.(event.pointerId);
    } catch {}

    setOpenMenuKey(null);
    setHoverState(DEFAULT_TABLE_HOVER_STATE);
    setTableResizeActive(true);
    const pendingDimensions = {
      width: snapshot.startWidth,
      height: snapshot.startHeight,
    };
    dragStateRef.current = {
      kind: "resize-table",
      pointerId: event.pointerId,
      pointerTarget: event.currentTarget,
      startX: event.clientX,
      startY: event.clientY,
      snapshot,
      pendingDimensions,
    };
    updateTableResizePreview(pendingDimensions);
    document.body.style.cursor = "nwse-resize";
  }, [editor, updateTableResizePreview]);
  const startAddColumnDrag = React.useCallback(() => {
    setOpenMenuKey(null);
    dragStateRef.current = { kind: "add-column", previewCols: 1 };
    setDragPreview({ kind: "add-column", previewCols: 1 });
    document.body.style.cursor = "ew-resize";
  }, []);
  const startAddRowDrag = React.useCallback(() => {
    setOpenMenuKey(null);
    dragStateRef.current = { kind: "add-row", previewRows: 1 };
    setDragPreview({ kind: "add-row", previewRows: 1 });
    document.body.style.cursor = "ns-resize";
  }, []);
  const startRowDrag = React.useCallback((rowHandle: TableAxisHandle) => {
    setOpenMenuKey(null);
    dragStateRef.current = {
      kind: "row",
      originIndex: rowHandle.index,
      targetIndex: rowHandle.index,
      anchorPos: rowHandle.cellPos,
    };
    setDragPreview({
      kind: "row",
      originIndex: rowHandle.index,
      targetIndex: rowHandle.index,
      targetStart: rowHandle.start,
      targetSize: rowHandle.size,
    });
    document.body.style.cursor = "grabbing";
  }, []);
  const startColumnDrag = React.useCallback((columnHandle: TableAxisHandle) => {
    setOpenMenuKey(null);
    dragStateRef.current = {
      kind: "column",
      originIndex: columnHandle.index,
      targetIndex: columnHandle.index,
      anchorPos: columnHandle.cellPos,
    };
    setDragPreview({
      kind: "column",
      originIndex: columnHandle.index,
      targetIndex: columnHandle.index,
      targetStart: columnHandle.start,
      targetSize: columnHandle.size,
    });
    document.body.style.cursor = "grabbing";
  }, []);

  React.useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const dragState = dragStateRef.current;
      const activeLayout = layoutRef.current;
      const surface = containerRef.current;
      if (!dragState || !activeLayout || !surface) return;

      const surfaceRect = surface.getBoundingClientRect();
      const relativeX = event.clientX - surfaceRect.left + surface.scrollLeft;
      const relativeY = event.clientY - surfaceRect.top + surface.scrollTop;

      if (dragState.kind === "resize-table") {
        return;
      }

      if (dragState.kind === "row") {
        const targetHandleIndex = nearestIndex(activeLayout.rowHandles.map((item) => item.center), relativeY);
        const targetRow = activeLayout.rowHandles[targetHandleIndex];
        const targetIndex = targetRow.index;
        dragState.targetIndex = targetIndex;
        setDragPreview({
          kind: "row",
          originIndex: dragState.originIndex,
          targetIndex,
          targetStart: targetRow.start,
          targetSize: targetRow.size,
        });
        document.body.style.cursor = "grabbing";
        return;
      }

      if (dragState.kind === "column") {
        const targetHandleIndex = nearestIndex(activeLayout.columnHandles.map((item) => item.center), relativeX);
        const targetColumn = activeLayout.columnHandles[targetHandleIndex];
        const targetIndex = targetColumn.index;
        dragState.targetIndex = targetIndex;
        setDragPreview({
          kind: "column",
          originIndex: dragState.originIndex,
          targetIndex,
          targetStart: targetColumn.start,
          targetSize: targetColumn.size,
        });
        document.body.style.cursor = "grabbing";
        return;
      }

      if (dragState.kind === "add-column") {
        const previewCols = Math.max(1, 1 + Math.floor(Math.max(0, relativeX - (activeLayout.tableLeft + activeLayout.tableWidth)) / activeLayout.avgColumnWidth));
        dragState.previewCols = previewCols;
        setDragPreview({ kind: "add-column", previewCols });
        document.body.style.cursor = "ew-resize";
        return;
      }

      const previewRows = Math.max(1, 1 + Math.floor(Math.max(0, relativeY - (activeLayout.tableTop + activeLayout.tableHeight)) / activeLayout.avgRowHeight));
      dragState.previewRows = previewRows;
      setDragPreview({ kind: "add-row", previewRows });
      document.body.style.cursor = "ns-resize";
    };

    const handleMouseUp = () => {
      const dragState = dragStateRef.current;
      if (!dragState || dragState.kind === "resize-table") return;

      if (dragState.kind === "row" && dragState.originIndex !== dragState.targetIndex) {
        moveTableRow({
          from: dragState.originIndex,
          to: dragState.targetIndex,
          pos: dragState.anchorPos,
          select: true,
        })(editor.state, editor.view.dispatch);
        scheduleSyncFromSelection();
      }

      if (dragState.kind === "column" && dragState.originIndex !== dragState.targetIndex) {
        moveTableColumn({
          from: dragState.originIndex,
          to: dragState.targetIndex,
          pos: dragState.anchorPos,
          select: true,
        })(editor.state, editor.view.dispatch);
        scheduleSyncFromSelection();
      }

      if (dragState.kind === "add-row") {
        expandTableBy(dragState.previewRows, 0);
      }

      if (dragState.kind === "add-column") {
        expandTableBy(0, dragState.previewCols);
      }

      clearDrag();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("blur", clearDrag);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("blur", clearDrag);
    };
  }, [clearDrag, containerRef, editor, expandTableBy, scheduleSyncFromSelection]);

  React.useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const dragState = dragStateRef.current;
      if (!dragState || dragState.kind !== "resize-table" || event.pointerId !== dragState.pointerId) return;

      dragState.pendingDimensions = resolveTableResizeDimensions({
        deltaX: event.clientX - dragState.startX,
        deltaY: event.clientY - dragState.startY,
        lockAxis: event.ctrlKey && !event.shiftKey,
        preserveRatio: event.ctrlKey && event.shiftKey,
        snapshot: dragState.snapshot,
      });

      if (tableResizePreviewFrameRef.current === null) {
        tableResizePreviewFrameRef.current = window.requestAnimationFrame(() => {
          tableResizePreviewFrameRef.current = null;
          const currentDragState = dragStateRef.current;
          if (!currentDragState || currentDragState.kind !== "resize-table") return;
          updateTableResizePreview(currentDragState.pendingDimensions);
        });
      }

      document.body.style.cursor = "nwse-resize";
      if (event.cancelable) event.preventDefault();
    };

    const finishTableResize = (event: PointerEvent, commit: boolean) => {
      const dragState = dragStateRef.current;
      if (!dragState || dragState.kind !== "resize-table" || event.pointerId !== dragState.pointerId) return;

      if (tableResizePreviewFrameRef.current !== null) {
        window.cancelAnimationFrame(tableResizePreviewFrameRef.current);
        tableResizePreviewFrameRef.current = null;
      }
      updateTableResizePreview(dragState.pendingDimensions);

      if (commit && applyTableSize(editor, dragState.snapshot, dragState.pendingDimensions)) {
        scheduleSyncFromSelection();
      }
      clearDrag();
    };

    const handlePointerUp = (event: PointerEvent) => finishTableResize(event, true);
    const handlePointerCancel = (event: PointerEvent) => finishTableResize(event, false);

    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
      if (tableResizePreviewFrameRef.current !== null) {
        window.cancelAnimationFrame(tableResizePreviewFrameRef.current);
        tableResizePreviewFrameRef.current = null;
      }
    };
  }, [clearDrag, editor, scheduleSyncFromSelection, updateTableResizePreview]);

  const openCellInspector = React.useCallback(() => {
    const cellPos = layoutRef.current?.cellPos;
    if (!showCellInspector || cellPos == null) return;

    const didSelect = editor.commands.setCellSelection({
      anchorCell: cellPos,
      headCell: cellPos,
    });
    if (!didSelect) return;

    window.requestAnimationFrame(() => {
      if (!editor.isDestroyed) editor.view.focus();
    });
  }, [editor, showCellInspector]);

  const menuItems = React.useMemo(() => {
    if (!layout) return [];

    return [
      ...(showCellInspector
        ? [{
            label: t("tableMenu.cellFormatting"),
            icon: Paintbrush,
            onClick: openCellInspector,
          }]
        : []),
      {
        label: t("tableMenu.alignLeft"),
        icon: AlignLeft,
        onClick: () => applyTableAlignment(editor, "left", layout.cellPos),
      },
      {
        label: t("tableMenu.alignCenter"),
        icon: AlignCenter,
        onClick: () => applyTableAlignment(editor, "center", layout.cellPos),
      },
      {
        label: t("tableMenu.alignRight"),
        icon: AlignRight,
        onClick: () => applyTableAlignment(editor, "right", layout.cellPos),
      },
      {
        label: t("tableMenu.addColumnBefore"),
        icon: ArrowLeft,
        onClick: () => runAtActiveCell((chain) => chain.addColumnBefore()),
      },
      {
        label: t("tableMenu.addColumnAfter"),
        icon: ArrowRight,
        onClick: () => runAtActiveCell((chain) => chain.addColumnAfter()),
      },
      {
        label: t("tableMenu.addRowBefore"),
        icon: ArrowUp,
        onClick: () => runAtActiveCell((chain) => chain.addRowBefore()),
      },
      {
        label: t("tableMenu.addRowAfter"),
        icon: ArrowDown,
        onClick: () => runAtActiveCell((chain) => chain.addRowAfter()),
      },
      {
        label: t("tableMenu.toggleHeaderRow"),
        icon: TableIcon,
        onClick: () => runAtActiveCell((chain) => chain.toggleHeaderRow()),
      },
      {
        label: t("tableMenu.toggleHeaderColumn"),
        icon: TableIcon,
        onClick: () => runAtActiveCell((chain) => chain.toggleHeaderColumn()),
      },
      {
        label: t("tableMenu.deleteColumn"),
        icon: Trash2,
        onClick: () => runAtActiveCell((chain) => chain.deleteColumn()),
        destructive: true,
      },
      {
        label: t("tableMenu.deleteRow"),
        icon: Trash2,
        onClick: () => runAtActiveCell((chain) => chain.deleteRow()),
        destructive: true,
      },
      {
        label: t("tableMenu.deleteTable"),
        icon: Trash2,
        onClick: () => runAtActiveCell((chain) => chain.deleteTable()),
        destructive: true,
      },
    ];
  }, [editor, layout, openCellInspector, runAtActiveCell, showCellInspector, t]);

  const getRowHandleMenuItems = React.useCallback((rowHandle: TableAxisHandle) => ([
    {
      label: t("tableMenu.addRowBefore"),
      icon: ArrowUp,
      onClick: () => runAtCellPos(rowHandle.cellPos, (chain) => chain.addRowBefore()),
    },
    {
      label: t("tableMenu.addRowAfter"),
      icon: ArrowDown,
      onClick: () => runAtCellPos(rowHandle.cellPos, (chain) => chain.addRowAfter()),
    },
    {
      label: t("tableMenu.duplicateRow"),
      icon: Copy,
      onClick: () => duplicateRowAt(rowHandle.index, rowHandle.cellPos),
    },
    {
      label: t("tableMenu.clearRowContents"),
      icon: TableIcon,
      onClick: () => clearRowAt(rowHandle.index, rowHandle.cellPos),
    },
    {
      label: t("tableMenu.deleteRow"),
      icon: Trash2,
      onClick: () => runAtCellPos(rowHandle.cellPos, (chain) => chain.deleteRow()),
      destructive: true,
    },
  ]), [clearRowAt, duplicateRowAt, runAtCellPos, t]);

  const getColumnHandleMenuItems = React.useCallback((columnHandle: TableAxisHandle) => ([
    {
      label: t("tableMenu.addColumnBefore"),
      icon: ArrowLeft,
      onClick: () => runAtCellPos(columnHandle.cellPos, (chain) => chain.addColumnBefore()),
    },
    {
      label: t("tableMenu.addColumnAfter"),
      icon: ArrowRight,
      onClick: () => runAtCellPos(columnHandle.cellPos, (chain) => chain.addColumnAfter()),
    },
    {
      label: t("tableMenu.duplicateColumn"),
      icon: Copy,
      onClick: () => duplicateColumnAt(columnHandle.index, columnHandle.cellPos),
    },
    {
      label: t("tableMenu.clearColumnContents"),
      icon: TableIcon,
      onClick: () => clearColumnAt(columnHandle.index, columnHandle.cellPos),
    },
    {
      label: t("tableMenu.deleteColumn"),
      icon: Trash2,
      onClick: () => runAtCellPos(columnHandle.cellPos, (chain) => chain.deleteColumn()),
      destructive: true,
    },
  ]), [clearColumnAt, duplicateColumnAt, runAtCellPos, t]);

  if (!layout) {
    return null;
  }

  const menuTop = Math.max(8, layout.tableTop - TABLE_MENU_TOP_OFFSET);
  const menuLeft = Math.max(8, layout.tableLeft);
  const rowHandleLeft = layout.tableLeft - 12;
  const columnHandleTop = layout.tableTop - 12;

  return (
    <>
      <TableRowHandles
        activeRowIndex={layout.activeRowIndex}
        controlsVisible={controlsVisible}
        getMenuItems={getRowHandleMenuItems}
        hoverRowHandleIndex={hoverState.rowHandleIndex}
        onOpenMenuChange={(menuKey, open) => {
          setOpenMenuKey((prev) => (open ? menuKey as OpenMenuKey : prev === menuKey ? null : prev));
        }}
        onStartDrag={startRowDrag}
        openMenuKey={openMenuKey}
        rowDragLabel={t("tableMenu.dragRow")}
        rowHandleLeft={rowHandleLeft}
        rowHandles={layout.rowHandles}
      />

      <TableColumnHandles
        activeColumnIndex={layout.activeColumnIndex}
        columnDragLabel={t("tableMenu.dragColumn")}
        columnHandleTop={columnHandleTop}
        columnHandles={layout.columnHandles}
        controlsVisible={controlsVisible}
        getMenuItems={getColumnHandleMenuItems}
        hoverColumnHandleIndex={hoverState.columnHandleIndex}
        onOpenMenuChange={(menuKey, open) => {
          setOpenMenuKey((prev) => (open ? menuKey as OpenMenuKey : prev === menuKey ? null : prev));
        }}
        onStartDrag={startColumnDrag}
        openMenuKey={openMenuKey}
      />

      <TableControlMenu
        controlsVisible={controlsVisible}
        isOpen={tableMenuOpen}
        items={menuItems}
        label={t("tableMenu.openControls")}
        left={menuLeft}
        menuVisible={hoverState.menuVisible}
        onOpenChange={(open) => {
          setOpenMenuKey((prev) => (open ? "table" : prev === "table" ? null : prev));
        }}
        top={menuTop}
      />

      {dragPreview === null && (
        <TableResizeHandles
          active={tableResizeActive}
          ctrlHint={t("tableMenu.resizeCtrlHint")}
          frameRef={tableResizeFrameRef}
          layout={layout}
          onStartResize={startTableResize}
          resizeBothLabel={t("tableMenu.resizeBoth")}
        />
      )}

      <TableAddRails
        addColumnVisible={hoverState.addColumnVisible}
        addRowVisible={hoverState.addRowVisible}
        canExpandTable={canExpandTable}
        controlsVisible={controlsVisible}
        layout={layout}
        onStartAddColumn={startAddColumnDrag}
        onStartAddRow={startAddRowDrag}
        quickAddColumnLabel={t("tableMenu.quickAddColumnAfter")}
        quickAddRowLabel={t("tableMenu.quickAddRowAfter")}
      />

      <TableDragPreview
        columnDragLabel={t("tableMenu.dragColumn")}
        dragPreview={dragPreview}
        layout={layout}
        rowDragLabel={t("tableMenu.dragRow")}
      />
    </>
  );
}

export default TableControls;
