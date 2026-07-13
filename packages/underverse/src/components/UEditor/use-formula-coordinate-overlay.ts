"use client";

import { useEffect, useRef, type RefObject } from "react";
import type { Editor } from "@tiptap/core";
import { TableMap } from "@tiptap/pm/tables";
import { getTableFormulaReferences, indexToColumnName, isDraftTableFormula } from "./table-formula";
import { recalculateActiveTableFormulas } from "./table-formula-commands";
import {
  cancelFormulaEditing,
  getFormulaEditingTableContext,
  getFormulaTableCellInfo,
} from "./table-formula-range-picker";
import { UEDITOR_TABLE_LAYOUT_CHANGE_EVENT } from "./table-dom-utils";

type CoordinateSegment = {
  start: number;
  size: number;
  span: number;
};

function setPosition(element: HTMLElement, left: number, top: number, width?: number, height?: number) {
  element.style.left = `${left}px`;
  element.style.top = `${top}px`;
  if (width != null) element.style.width = `${Math.max(0, width)}px`;
  if (height != null) element.style.height = `${Math.max(0, height)}px`;
}

function createCoordinateLabel(kind: "column" | "row", label: string) {
  const element = document.createElement("span");
  element.dataset.ueditorFormulaCoordinate = kind;
  element.textContent = label;
  element.className =
    "pointer-events-none absolute z-30 flex items-center justify-center rounded-[3px] border border-primary/35 bg-primary/90 px-1 font-mono text-[10px] font-semibold leading-none text-primary-foreground shadow-sm";
  return element;
}

function createReferenceHighlight(label: string) {
  const element = document.createElement("span");
  element.dataset.ueditorFormulaReference = label;
  element.className = "pointer-events-none absolute z-[21] rounded-[2px] border-2 border-emerald-500 bg-emerald-500/15";
  return element;
}

type FormulaActionLabels = {
  apply: string;
  cancel: string;
};

export function useFormulaCoordinateOverlay(
  editor: Editor | null,
  containerRef: RefObject<HTMLDivElement | null>,
  labels: FormulaActionLabels,
) {
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!editor) return undefined;

    const overlay = overlayRef.current;
    const container = containerRef.current;
    if (!overlay || !container) return undefined;

    let animationFrame: number | null = null;
    let activeTable: HTMLTableElement | null = null;
    let activeTablePos: number | null = null;
    let hoverLabel: HTMLSpanElement | null = null;

    const clearOverlay = () => {
      activeTable = null;
      activeTablePos = null;
      hoverLabel = null;
      overlay.replaceChildren();
      overlay.style.display = "none";
    };

    const syncOverlay = () => {
      animationFrame = null;
      if (editor.isDestroyed) return;

      const context = getFormulaEditingTableContext(editor.view);
      if (!context) {
        clearOverlay();
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const tableRect = context.tableDom.getBoundingClientRect();
      const tableLeft = tableRect.left - containerRect.left + container.scrollLeft;
      const tableTop = tableRect.top - containerRect.top + container.scrollTop;
      const map = TableMap.get(context.tableNode);
      const columnSegments: Array<CoordinateSegment | undefined> = Array(map.width);
      const rowSegments: Array<CoordinateSegment | undefined> = Array(map.height);
      const cellInfos: Array<ReturnType<typeof getFormulaTableCellInfo>> = [];

      for (const cell of context.tableDom.querySelectorAll("th,td")) {
        if (!(cell instanceof HTMLTableCellElement)) continue;
        const info = getFormulaTableCellInfo(editor.view, cell, context.tablePos);
        if (!info) continue;
        cellInfos.push(info);

        const cellRect = cell.getBoundingClientRect();
        const columnSpan = Math.max(1, info.rect.right - info.rect.left);
        const rowSpan = Math.max(1, info.rect.bottom - info.rect.top);
        const columnWidth = cellRect.width / columnSpan;
        const rowHeight = cellRect.height / rowSpan;

        for (let column = info.rect.left; column < info.rect.right; column += 1) {
          if (!columnSegments[column] || columnSpan < columnSegments[column]!.span) {
            columnSegments[column] = {
              start: cellRect.left - containerRect.left + container.scrollLeft + (column - info.rect.left) * columnWidth,
              size: columnWidth,
              span: columnSpan,
            };
          }
        }

        for (let row = info.rect.top; row < info.rect.bottom; row += 1) {
          if (!rowSegments[row] || rowSpan < rowSegments[row]!.span) {
            rowSegments[row] = {
              start: cellRect.top - containerRect.top + container.scrollTop + (row - info.rect.top) * rowHeight,
              size: rowHeight,
              span: rowSpan,
            };
          }
        }
      }

      const fallbackColumnWidth = map.width > 0 ? tableRect.width / map.width : 0;
      const fallbackRowHeight = map.height > 0 ? tableRect.height / map.height : 0;
      const children: HTMLElement[] = [];

      const actions = document.createElement("div");
      actions.dataset.ueditorFormulaActions = "";
      actions.className =
        "pointer-events-auto absolute z-50 flex items-center gap-1 rounded-md border border-border bg-background p-1 shadow-md";
      const formulaCellRect = context.cellDom.getBoundingClientRect();
      setPosition(
        actions,
        formulaCellRect.left - containerRect.left + container.scrollLeft,
        formulaCellRect.bottom - containerRect.top + container.scrollTop + 4,
      );

      const applyButton = document.createElement("button");
      applyButton.type = "button";
      applyButton.dataset.ueditorFormulaApply = "";
      applyButton.disabled = isDraftTableFormula(context.formula);
      applyButton.textContent = `${applyButton.disabled ? "" : "✓ "}${labels.apply} (Enter)`;
      applyButton.className =
        "rounded bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-45";

      const cancelButton = document.createElement("button");
      cancelButton.type = "button";
      cancelButton.dataset.ueditorFormulaCancel = "";
      cancelButton.textContent = `${labels.cancel} (Esc)`;
      cancelButton.className =
        "rounded px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted";

      const preserveSelection = (event: MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
      };
      applyButton.addEventListener("mousedown", preserveSelection);
      cancelButton.addEventListener("mousedown", preserveSelection);
      applyButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!applyButton.disabled) recalculateActiveTableFormulas(editor);
      });
      cancelButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        cancelFormulaEditing(editor.view);
      });
      actions.append(applyButton, cancelButton);
      children.push(actions);

      for (let column = 0; column < map.width; column += 1) {
        const segment = columnSegments[column] ?? {
          start: tableLeft + column * fallbackColumnWidth,
          size: fallbackColumnWidth,
          span: map.width,
        };
        const label = createCoordinateLabel("column", indexToColumnName(column));
        setPosition(label, segment.start, Math.max(0, tableTop - 22), segment.size, 20);
        children.push(label);
      }

      for (let row = 0; row < map.height; row += 1) {
        const segment = rowSegments[row] ?? {
          start: tableTop + row * fallbackRowHeight,
          size: fallbackRowHeight,
          span: map.height,
        };
        const label = createCoordinateLabel("row", String(row + 1));
        setPosition(label, Math.max(0, tableLeft - 28), segment.start, 26, segment.size);
        children.push(label);
      }

      const references = new Set(getTableFormulaReferences(context.formula));
      for (const info of cellInfos) {
        if (!info || !references.has(info.label)) continue;
        const cellRect = info.cell.getBoundingClientRect();
        const highlight = createReferenceHighlight(info.label);
        setPosition(
          highlight,
          cellRect.left - containerRect.left + container.scrollLeft + 2,
          cellRect.top - containerRect.top + container.scrollTop + 2,
          cellRect.width - 4,
          cellRect.height - 4,
        );
        children.push(highlight);
      }

      hoverLabel = document.createElement("span");
      hoverLabel.dataset.ueditorFormulaHoverLabel = "";
      hoverLabel.className =
        "pointer-events-none absolute z-40 hidden rounded bg-foreground px-1.5 py-1 font-mono text-[10px] font-semibold leading-none text-background shadow-md";
      children.push(hoverLabel);

      overlay.replaceChildren(...children);
      overlay.style.display = "block";
      activeTable = context.tableDom;
      activeTablePos = context.tablePos;
    };

    const scheduleSync = () => {
      if (animationFrame != null) return;
      animationFrame = window.requestAnimationFrame(syncOverlay);
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!activeTable || activeTablePos == null || !hoverLabel) return;
      const target = event.target instanceof Element ? event.target.closest("th,td") : null;
      if (!(target instanceof HTMLTableCellElement) || target.closest("table") !== activeTable) {
        hoverLabel.style.display = "none";
        return;
      }

      const info = getFormulaTableCellInfo(editor.view, target, activeTablePos);
      if (!info) {
        hoverLabel.style.display = "none";
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const cellRect = target.getBoundingClientRect();
      hoverLabel.textContent = info.label;
      hoverLabel.style.display = "block";
      setPosition(
        hoverLabel,
        cellRect.left - containerRect.left + container.scrollLeft + 4,
        cellRect.top - containerRect.top + container.scrollTop + 4,
      );
    };

    const handleMouseLeave = () => {
      if (hoverLabel) hoverLabel.style.display = "none";
    };

    editor.on("selectionUpdate", scheduleSync);
    editor.on("update", scheduleSync);
    editor.on("focus", scheduleSync);
    editor.on("blur", scheduleSync);
    editor.view.dom.addEventListener("mousemove", handleMouseMove);
    editor.view.dom.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener(UEDITOR_TABLE_LAYOUT_CHANGE_EVENT, scheduleSync);
    window.addEventListener("resize", scheduleSync);
    scheduleSync();

    return () => {
      editor.off("selectionUpdate", scheduleSync);
      editor.off("update", scheduleSync);
      editor.off("focus", scheduleSync);
      editor.off("blur", scheduleSync);
      editor.view.dom.removeEventListener("mousemove", handleMouseMove);
      editor.view.dom.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener(UEDITOR_TABLE_LAYOUT_CHANGE_EVENT, scheduleSync);
      window.removeEventListener("resize", scheduleSync);
      if (animationFrame != null) window.cancelAnimationFrame(animationFrame);
      clearOverlay();
    };
  }, [containerRef, editor, labels.apply, labels.cancel]);

  return overlayRef;
}
