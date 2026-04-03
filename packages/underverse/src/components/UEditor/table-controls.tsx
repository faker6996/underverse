"use client";

import React from "react";
import type { Editor } from "@tiptap/core";
import { TableMap, moveTableColumn, moveTableRow } from "prosemirror-tables";
import { TextSelection } from "prosemirror-state";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Copy,
  GripHorizontal,
  GripVertical,
  MoreHorizontal,
  Table as TableIcon,
  Trash2,
} from "lucide-react";
import { useSmartTranslations } from "../../hooks/useSmartTranslations";
import { cn } from "../../utils/cn";
import { DropdownMenu } from "../DropdownMenu";

const FALLBACK_TABLE_ROW_HEIGHT = 44;
const FALLBACK_TABLE_COLUMN_WIDTH = 160;

type TableControlsProps = {
  editor: Editor;
  containerRef: React.RefObject<HTMLDivElement | null>;
};

type TableAxisHandle = {
  index: number;
  cellPos: number;
  start: number;
  size: number;
  center: number;
};

type TableControlLayout = {
  cellPos: number;
  cornerCellPos: number;
  activeRowIndex: number;
  activeColumnIndex: number;
  tableLeft: number;
  tableTop: number;
  tableWidth: number;
  tableHeight: number;
  avgRowHeight: number;
  avgColumnWidth: number;
  rowHandles: TableAxisHandle[];
  columnHandles: TableAxisHandle[];
};

type DragPreview =
  | { kind: "row"; originIndex: number; targetIndex: number; targetStart: number; targetSize: number }
  | { kind: "column"; originIndex: number; targetIndex: number; targetStart: number; targetSize: number }
  | { kind: "add-row"; previewRows: number }
  | { kind: "add-column"; previewCols: number };

type DragState =
  | { kind: "row"; originIndex: number; targetIndex: number; anchorPos: number }
  | { kind: "column"; originIndex: number; targetIndex: number; anchorPos: number }
  | { kind: "add-row"; previewRows: number }
  | { kind: "add-column"; previewCols: number };

function resolveElement(target: EventTarget | Node | null) {
  if (target instanceof Element) return target;
  if (target instanceof Node) return target.parentElement;
  return null;
}

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

function metricOrFallback(value: number, fallback: number) {
  return Number.isFinite(value) && value > 0 ? value : fallback;
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

function getCellFromTarget(target: EventTarget | Node | null) {
  const element = resolveElement(target);
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

function findTableInfo(editor: Editor, pos: number) {
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

function getLastCellPosFromState(editor: Editor, pos: number) {
  const tableInfo = findTableInfo(editor, pos);
  if (!tableInfo) return null;

  const map = TableMap.get(tableInfo.node);
  return tableInfo.start + map.positionAt(map.height - 1, map.width - 1, tableInfo.node);
}

function buildLayout(editor: Editor, surface: HTMLDivElement, cell: HTMLTableCellElement): TableControlLayout | null {
  const row = cell.closest("tr");
  const table = cell.closest("table");
  if (!(row instanceof HTMLTableRowElement) || !(table instanceof HTMLTableElement)) {
    return null;
  }

  const rows = Array.from(table.rows).filter((item): item is HTMLTableRowElement => item instanceof HTMLTableRowElement);
  const referenceRow = rows[0];
  const referenceCells = Array.from(referenceRow?.cells ?? []).filter((item): item is HTMLTableCellElement => item instanceof HTMLTableCellElement);
  const cornerCell = getLastCell(table);
  if (rows.length === 0 || referenceCells.length === 0 || !(cornerCell instanceof HTMLTableCellElement)) {
    return null;
  }

  const surfaceRect = surface.getBoundingClientRect();
  const tableRect = table.getBoundingClientRect();
  const tableLeft = tableRect.left - surfaceRect.left + surface.scrollLeft;
  const tableTop = tableRect.top - surfaceRect.top + surface.scrollTop;
  const avgRowHeight = metricOrFallback(tableRect.height / rows.length, FALLBACK_TABLE_ROW_HEIGHT);
  const avgColumnWidth = metricOrFallback(tableRect.width / referenceCells.length, FALLBACK_TABLE_COLUMN_WIDTH);
  const tableWidth = metricOrFallback(tableRect.width, avgColumnWidth * referenceCells.length);
  const tableHeight = metricOrFallback(tableRect.height, avgRowHeight * rows.length);

  const rowHandles = rows.map((tableRow, index) => {
    const rowRect = tableRow.getBoundingClientRect();
    const anchorCell = tableRow.cells.item(0) ?? cornerCell;
    const start = rowRect.height > 0
      ? rowRect.top - surfaceRect.top + surface.scrollTop
      : tableTop + index * avgRowHeight;
    const size = metricOrFallback(rowRect.height, avgRowHeight);

    return {
      index,
      cellPos: editor.view.posAtDOM(anchorCell, 0),
      start,
      size,
      center: start + size / 2,
    };
  });

  const columnHandles = referenceCells.map((tableCell, index) => {
    const cellRect = tableCell.getBoundingClientRect();
    const start = cellRect.width > 0
      ? cellRect.left - surfaceRect.left + surface.scrollLeft
      : tableLeft + index * avgColumnWidth;
    const size = metricOrFallback(cellRect.width, avgColumnWidth);

    return {
      index,
      cellPos: editor.view.posAtDOM(tableCell, 0),
      start,
      size,
      center: start + size / 2,
    };
  });

  return {
    cellPos: editor.view.posAtDOM(cell, 0),
    cornerCellPos: editor.view.posAtDOM(cornerCell, 0),
    activeRowIndex: row.rowIndex,
    activeColumnIndex: cell.cellIndex,
    tableLeft,
    tableTop,
    tableWidth,
    tableHeight,
    avgRowHeight,
    avgColumnWidth,
    rowHandles,
    columnHandles,
  };
}

function getSelectedCell(editor: Editor) {
  const domAtPos = editor.view.domAtPos(editor.state.selection.from);
  return getCellFromTarget(domAtPos.node);
}

function getFocusableCellPos(editor: Editor, cellPos: number) {
  const cellNode = editor.state.doc.nodeAt(cellPos);
  if (!cellNode) return cellPos + 1;

  let offset = cellPos + 1;
  let node = cellNode.firstChild ?? null;

  while (node && !node.isTextblock) {
    offset += 1;
    node = node.firstChild ?? null;
  }

  return node?.isTextblock ? offset + 1 : cellPos + 1;
}

function focusCell(editor: Editor, cellPos: number) {
  const selection = TextSelection.near(editor.state.doc.resolve(getFocusableCellPos(editor, cellPos)));
  editor.view.dispatch(editor.state.tr.setSelection(selection));
  editor.view.focus();
}

function collectChildren(node: any) {
  const children: any[] = [];
  node.forEach((child: any) => children.push(child));
  return children;
}

export function TableControls({ editor, containerRef }: TableControlsProps) {
  const t = useSmartTranslations("UEditor");
  const [layout, setLayout] = React.useState<TableControlLayout | null>(null);
  const [dragPreview, setDragPreview] = React.useState<DragPreview | null>(null);
  const layoutRef = React.useRef<TableControlLayout | null>(null);
  const dragStateRef = React.useRef<DragState | null>(null);

  React.useEffect(() => {
    layoutRef.current = layout;
  }, [layout]);

  const syncFromCell = React.useCallback((cell: HTMLTableCellElement | null) => {
    const surface = containerRef.current;
    if (!surface || !cell) {
      setLayout(null);
      return;
    }

    setLayout(buildLayout(editor, surface, cell));
  }, [containerRef, editor]);

  const syncFromSelection = React.useCallback(() => {
    syncFromCell(getSelectedCell(editor));
  }, [editor, syncFromCell]);

  const refreshCurrentLayout = React.useCallback(() => {
    setLayout((prev) => {
      if (!prev) return prev;

      const surface = containerRef.current;
      if (!surface) return null;

      const node = editor.view.nodeDOM(prev.cellPos);
      const cell = getCellFromTarget(node) ?? getSelectedCell(editor);
      return cell ? buildLayout(editor, surface, cell) : null;
    });
  }, [containerRef, editor]);

  const clearDrag = React.useCallback(() => {
    dragStateRef.current = null;
    setDragPreview(null);
    document.body.style.cursor = "";
  }, []);

  React.useEffect(() => {
    const proseMirror = editor.view.dom as HTMLElement;
    const surface = containerRef.current;
    if (!surface) return undefined;

    const handleMouseOver = (event: MouseEvent) => {
      if (dragStateRef.current) return;
      syncFromCell(getCellFromTarget(event.target));
    };

    const handleMouseLeave = () => {
      if (dragStateRef.current) return;
      syncFromSelection();
    };

    const handleFocusIn = () => {
      if (dragStateRef.current) return;
      syncFromSelection();
    };

    proseMirror.addEventListener("mouseover", handleMouseOver);
    proseMirror.addEventListener("mouseleave", handleMouseLeave);
    proseMirror.addEventListener("focusin", handleFocusIn);
    surface.addEventListener("scroll", refreshCurrentLayout, { passive: true });
    window.addEventListener("resize", refreshCurrentLayout);
    editor.on("selectionUpdate", syncFromSelection);
    editor.on("update", refreshCurrentLayout);

    syncFromSelection();

    return () => {
      proseMirror.removeEventListener("mouseover", handleMouseOver);
      proseMirror.removeEventListener("mouseleave", handleMouseLeave);
      proseMirror.removeEventListener("focusin", handleFocusIn);
      surface.removeEventListener("scroll", refreshCurrentLayout);
      window.removeEventListener("resize", refreshCurrentLayout);
      editor.off("selectionUpdate", syncFromSelection);
      editor.off("update", refreshCurrentLayout);
    };
  }, [clearDrag, containerRef, editor, refreshCurrentLayout, syncFromCell, syncFromSelection]);

  const runAtCellPos = React.useCallback((cellPos: number | null, command: (chain: any) => any, options?: { sync?: boolean }) => {
    if (cellPos == null) return false;
    focusCell(editor, cellPos);
    const result = command(editor.chain().focus(null, { scrollIntoView: false })).run();
    if (options?.sync !== false) {
      requestAnimationFrame(syncFromSelection);
    }
    return result;
  }, [editor, syncFromSelection]);

  const runAtActiveCell = React.useCallback((command: (chain: any) => any, options?: { sync?: boolean }) => {
    return runAtCellPos(layoutRef.current?.cellPos ?? null, command, options);
  }, [runAtCellPos]);

  const getCurrentCornerCellPos = React.useCallback(() => {
    const activePos = layoutRef.current?.cellPos ?? editor.state.selection.from;
    return getLastCellPosFromState(editor, activePos);
  }, [editor]);

  const runAtCornerCell = React.useCallback((command: (chain: any) => any, options?: { sync?: boolean }) => {
    return runAtCellPos(getCurrentCornerCellPos(), command, options);
  }, [getCurrentCornerCellPos, runAtCellPos]);

  const replaceTableAtCellPos = React.useCallback((cellPos: number | null, updateTable: (tableNode: any) => any | null) => {
    if (cellPos == null) return false;
    const tableInfo = findTableInfo(editor, cellPos);
    if (!tableInfo) return false;

    const nextTable = updateTable(tableInfo.node);
    if (!nextTable) return false;

    editor.view.dispatch(editor.state.tr.replaceWith(tableInfo.pos, tableInfo.pos + tableInfo.node.nodeSize, nextTable));
    requestAnimationFrame(syncFromSelection);
    return true;
  }, [editor, syncFromSelection]);

  const createEmptyCellNode = React.useCallback((cellNode: any) => {
    return cellNode.type.createAndFill(cellNode.attrs) ?? cellNode;
  }, []);

  const duplicateRowAt = React.useCallback((rowIndex: number, cellPos: number | null) => {
    return replaceTableAtCellPos(cellPos, (tableNode) => {
      const rows = collectChildren(tableNode);
      const rowNode = rows[rowIndex];
      if (!rowNode) return null;
      rows.splice(rowIndex + 1, 0, rowNode.copy(rowNode.content));
      return tableNode.type.create(tableNode.attrs, rows);
    });
  }, [replaceTableAtCellPos]);

  const clearRowAt = React.useCallback((rowIndex: number, cellPos: number | null) => {
    return replaceTableAtCellPos(cellPos, (tableNode) => {
      const rows = collectChildren(tableNode);
      const rowNode = rows[rowIndex];
      if (!rowNode) return null;
      const cells = collectChildren(rowNode).map((cellNode) => createEmptyCellNode(cellNode));
      rows[rowIndex] = rowNode.type.create(rowNode.attrs, cells);
      return tableNode.type.create(tableNode.attrs, rows);
    });
  }, [createEmptyCellNode, replaceTableAtCellPos]);

  const duplicateColumnAt = React.useCallback((columnIndex: number, cellPos: number | null) => {
    return replaceTableAtCellPos(cellPos, (tableNode) => {
      const rows = collectChildren(tableNode).map((rowNode) => {
        const cells = collectChildren(rowNode);
        const cellNode = cells[columnIndex];
        if (!cellNode) return rowNode;
        cells.splice(columnIndex + 1, 0, cellNode.copy(cellNode.content));
        return rowNode.type.create(rowNode.attrs, cells);
      });
      return tableNode.type.create(tableNode.attrs, rows);
    });
  }, [replaceTableAtCellPos]);

  const clearColumnAt = React.useCallback((columnIndex: number, cellPos: number | null) => {
    return replaceTableAtCellPos(cellPos, (tableNode) => {
      const rows = collectChildren(tableNode).map((rowNode) => {
        const cells = collectChildren(rowNode);
        const cellNode = cells[columnIndex];
        if (!cellNode) return rowNode;
        cells[columnIndex] = createEmptyCellNode(cellNode);
        return rowNode.type.create(rowNode.attrs, cells);
      });
      return tableNode.type.create(tableNode.attrs, rows);
    });
  }, [createEmptyCellNode, replaceTableAtCellPos]);

  const expandTableBy = React.useCallback((rows: number, cols: number) => {
    let ok = true;

    for (let index = 0; index < rows; index += 1) {
      ok = runAtCornerCell((chain) => chain.addRowAfter(), { sync: false });
      if (!ok) return false;
    }

    for (let index = 0; index < cols; index += 1) {
      ok = runAtCornerCell((chain) => chain.addColumnAfter(), { sync: false });
      if (!ok) return false;
    }

    requestAnimationFrame(syncFromSelection);
    return true;
  }, [runAtCornerCell, syncFromSelection]);

  const canExpandTable = Boolean(layout);

  React.useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const dragState = dragStateRef.current;
      const activeLayout = layoutRef.current;
      const surface = containerRef.current;
      if (!dragState || !activeLayout || !surface) return;

      const surfaceRect = surface.getBoundingClientRect();
      const relativeX = event.clientX - surfaceRect.left + surface.scrollLeft;
      const relativeY = event.clientY - surfaceRect.top + surface.scrollTop;

      if (dragState.kind === "row") {
        const targetIndex = nearestIndex(activeLayout.rowHandles.map((item) => item.center), relativeY);
        dragState.targetIndex = targetIndex;
        const targetRow = activeLayout.rowHandles[targetIndex];
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
        const targetIndex = nearestIndex(activeLayout.columnHandles.map((item) => item.center), relativeX);
        dragState.targetIndex = targetIndex;
        const targetColumn = activeLayout.columnHandles[targetIndex];
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
      if (!dragState) return;

      if (dragState.kind === "row" && dragState.originIndex !== dragState.targetIndex) {
        moveTableRow({
          from: dragState.originIndex,
          to: dragState.targetIndex,
          pos: dragState.anchorPos,
          select: true,
        })(editor.state, editor.view.dispatch);
        requestAnimationFrame(syncFromSelection);
      }

      if (dragState.kind === "column" && dragState.originIndex !== dragState.targetIndex) {
        moveTableColumn({
          from: dragState.originIndex,
          to: dragState.targetIndex,
          pos: dragState.anchorPos,
          select: true,
        })(editor.state, editor.view.dispatch);
        requestAnimationFrame(syncFromSelection);
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
  }, [clearDrag, containerRef, editor, expandTableBy, syncFromSelection]);

  const menuItems = React.useMemo(() => {
    if (!layout) return [];

    return [
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
  }, [layout, runAtActiveCell, t]);

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

  const menuTop = Math.max(8, layout.tableTop - 16);
  const menuLeft = Math.max(8, layout.tableLeft);
  const rowHandleLeft = Math.max(8, layout.tableLeft - 66);
  const columnHandleTop = Math.max(8, layout.tableTop - 14);
  const columnRailTop = layout.tableTop;
  const columnRailLeft = layout.tableLeft + layout.tableWidth + 8;
  const rowRailTop = layout.tableTop + layout.tableHeight + 8;
  const rowRailLeft = layout.tableLeft;
  const expandPreviewWidth = dragPreview?.kind === "add-column"
    ? layout.tableWidth + dragPreview.previewCols * layout.avgColumnWidth
    : layout.tableWidth;
  const expandPreviewHeight = dragPreview?.kind === "add-row"
    ? layout.tableHeight + dragPreview.previewRows * layout.avgRowHeight
    : layout.tableHeight;
  const dragStatusText = dragPreview?.kind === "row"
    ? `${t("tableMenu.dragRow")} ${dragPreview.originIndex + 1} -> ${dragPreview.targetIndex + 1}`
    : dragPreview?.kind === "column"
      ? `${t("tableMenu.dragColumn")} ${dragPreview.originIndex + 1} -> ${dragPreview.targetIndex + 1}`
      : dragPreview?.kind === "add-row"
        ? `+${dragPreview.previewRows}R`
        : dragPreview?.kind === "add-column"
          ? `+${dragPreview.previewCols}C`
        : null;

  return (
    <>
      {layout.rowHandles.map((rowHandle) => (
        <div key={`row-handle-${rowHandle.index}`} className="absolute z-30" style={{ top: Math.max(8, rowHandle.center - 12), left: rowHandleLeft }}>
          <DropdownMenu
            placement="right"
            items={getRowHandleMenuItems(rowHandle)}
            trigger={(
              <button
                type="button"
                aria-label={`${t("tableMenu.dragRow")} ${rowHandle.index + 1}`}
                title={`${t("tableMenu.dragRow")} ${rowHandle.index + 1}`}
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
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
                }}
                className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded-full",
                  "border border-border/70 bg-background/95 text-muted-foreground shadow-sm backdrop-blur",
                  "transition-colors hover:bg-accent hover:text-foreground",
                )}
              >
                <GripVertical className="h-3.5 w-3.5" />
              </button>
            )}
          />
        </div>
      ))}

      {layout.columnHandles.map((columnHandle) => (
        <div key={`column-handle-${columnHandle.index}`} className="absolute z-30" style={{ top: columnHandleTop, left: Math.max(8, columnHandle.center - 12) }}>
          <DropdownMenu
            placement="bottom-start"
            items={getColumnHandleMenuItems(columnHandle)}
            trigger={(
              <button
                type="button"
                aria-label={`${t("tableMenu.dragColumn")} ${columnHandle.index + 1}`}
                title={`${t("tableMenu.dragColumn")} ${columnHandle.index + 1}`}
                onMouseDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
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
                }}
                className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded-full",
                  "border border-border/70 bg-background/95 text-muted-foreground shadow-sm backdrop-blur",
                  "transition-colors hover:bg-accent hover:text-foreground",
                )}
              >
                <GripHorizontal className="h-3.5 w-3.5" />
              </button>
            )}
          />
        </div>
      ))}

      <div className="pointer-events-none absolute z-30" style={{ top: menuTop, left: menuLeft }}>
        <DropdownMenu
          placement="bottom-start"
          items={menuItems}
          trigger={(
            <button
              type="button"
              aria-label={t("tableMenu.openControls")}
              title={t("tableMenu.openControls")}
              onMouseDown={(event) => event.preventDefault()}
              className={cn(
                "pointer-events-auto inline-flex h-7 w-7 items-center justify-center rounded-full",
                "border border-border/70 bg-background/95 text-muted-foreground shadow-sm backdrop-blur",
                "transition-colors hover:bg-accent hover:text-foreground",
              )}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          )}
        />
      </div>

      <button
        type="button"
        aria-label={t("tableMenu.quickAddColumnAfter")}
        title={t("tableMenu.quickAddColumnAfter")}
        onMouseDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!canExpandTable) return;
          dragStateRef.current = { kind: "add-column", previewCols: 1 };
          setDragPreview({ kind: "add-column", previewCols: 1 });
          document.body.style.cursor = "ew-resize";
        }}
        disabled={!canExpandTable}
        className={cn(
          "absolute z-30 inline-flex items-center justify-center rounded-md",
          "border border-border/70 bg-muted/40 text-muted-foreground shadow-sm backdrop-blur",
          "transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed",
        )}
        style={{ top: columnRailTop, left: columnRailLeft, width: 18, height: layout.tableHeight }}
      >
        <span className="text-sm font-medium leading-none">+</span>
      </button>

      <button
        type="button"
        aria-label={t("tableMenu.quickAddRowAfter")}
        title={t("tableMenu.quickAddRowAfter")}
        onMouseDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!canExpandTable) return;
          dragStateRef.current = { kind: "add-row", previewRows: 1 };
          setDragPreview({ kind: "add-row", previewRows: 1 });
          document.body.style.cursor = "ns-resize";
        }}
        disabled={!canExpandTable}
        className={cn(
          "absolute z-30 inline-flex items-center justify-center rounded-md",
          "border border-border/70 bg-muted/40 text-muted-foreground shadow-sm backdrop-blur",
          "transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed",
        )}
        style={{ top: rowRailTop, left: rowRailLeft, width: layout.tableWidth, height: 16 }}
      >
        <span className="text-sm font-medium leading-none">+</span>
      </button>

      {dragPreview?.kind === "row" && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute z-20 rounded-lg border border-primary/20 bg-primary/10"
            style={{
              top: dragPreview.targetStart,
              left: layout.tableLeft,
              width: layout.tableWidth,
              height: dragPreview.targetSize,
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute z-20 rounded-full bg-primary/80"
            style={{
              top: dragPreview.targetStart + dragPreview.targetSize / 2 - 1,
              left: layout.tableLeft,
              width: layout.tableWidth,
              height: 2,
            }}
          />
        </>
      )}

      {dragPreview?.kind === "column" && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute z-20 rounded-lg border border-primary/20 bg-primary/10"
            style={{
              top: layout.tableTop,
              left: dragPreview.targetStart,
              width: dragPreview.targetSize,
              height: layout.tableHeight,
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute z-20 rounded-full bg-primary/80"
            style={{
              top: layout.tableTop,
              left: dragPreview.targetStart + dragPreview.targetSize / 2 - 1,
              width: 2,
              height: layout.tableHeight,
            }}
          />
        </>
      )}

      {(dragPreview?.kind === "add-row" || dragPreview?.kind === "add-column") && (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute z-20 rounded-xl border border-dashed border-primary/70 bg-primary/5"
            style={{
              top: layout.tableTop,
              left: layout.tableLeft,
              width: expandPreviewWidth,
              height: expandPreviewHeight,
            }}
          />
        </>
      )}

      {dragStatusText && (
        <div
          role="status"
          className="pointer-events-none absolute z-30 rounded-full border border-primary/20 bg-background/95 px-2 py-1 text-[11px] font-medium text-foreground shadow-sm backdrop-blur"
          style={{
            top: dragPreview?.kind === "add-row" || dragPreview?.kind === "add-column" ? layout.tableTop + expandPreviewHeight + 8 : layout.tableTop - 40,
            left: dragPreview?.kind === "add-row" || dragPreview?.kind === "add-column"
              ? layout.tableLeft + Math.max(0, expandPreviewWidth - 84)
              : layout.tableLeft + Math.max(0, layout.tableWidth - 108),
          }}
        >
          {dragStatusText}
        </div>
      )}
    </>
  );
}

export default TableControls;
