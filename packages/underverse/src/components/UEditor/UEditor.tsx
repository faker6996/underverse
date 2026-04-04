"use client";

import React, { useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { useSmartTranslations } from "../../hooks/useSmartTranslations";
import { useEditor, EditorContent } from "@tiptap/react";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import type { EditorView } from "@tiptap/pm/view";
import { cn } from "../../utils/cn";
import { buildUEditorExtensions } from "./extensions";
import type {
  UEditorFontFamilyOption,
  UEditorFontSizeOption,
  UEditorLetterSpacingOption,
  UEditorLineHeightOption,
  UEditorPrepareContentForSaveResult,
  UEditorProps,
  UEditorRef,
} from "./types";
import { EditorToolbar } from "./toolbar";
import { CustomBubbleMenu, CustomFloatingMenu } from "./menus";
import { CharacterCountDisplay } from "./CharacterCount";
import { prepareUEditorContentForSave, UEditorPrepareContentForSaveError } from "./prepare-content-for-save";
import { TableControls } from "./table-controls";

const TABLE_RESIZE_HIT_ZONE = 10;
const MIN_TABLE_ROW_HEIGHT = 36;
const TABLE_RESIZE_LINE_COLOR = "hsl(var(--primary))";
const COLUMN_RESIZE_LINE_THICKNESS = 2;
const ROW_RESIZE_LINE_THICKNESS = 2;

function applyPreviewRowHeight(rowElement: HTMLTableRowElement, nextHeight: number) {
  rowElement.style.height = `${nextHeight}px`;
  rowElement.style.minHeight = `${nextHeight}px`;
  rowElement.querySelectorAll("th,td").forEach((cell) => {
    if (cell instanceof HTMLElement) {
      cell.style.height = `${nextHeight}px`;
      cell.style.minHeight = `${nextHeight}px`;
    }
  });
}

function clearPreviewRowHeight(rowElement: HTMLTableRowElement) {
  rowElement.style.height = "";
  rowElement.style.minHeight = "";
  rowElement.querySelectorAll("th,td").forEach((cell) => {
    if (cell instanceof HTMLElement) {
      cell.style.height = "";
      cell.style.minHeight = "";
    }
  });
}

function findTableRowNodeInfo(view: EditorView, rowElement: HTMLTableRowElement) {
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

function resolveEventElement(target: EventTarget | null) {
  if (target instanceof Element) return target;
  if (target instanceof Node) return target.parentElement;
  return null;
}

function getSelectionTableCell(view: EditorView) {
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

function isRowResizeHotspot(cell: HTMLElement, clientX: number, clientY: number) {
  const rect = cell.getBoundingClientRect();
  const nearBottom = rect.bottom - clientY <= TABLE_RESIZE_HIT_ZONE;
  const nearRight = rect.right - clientX <= TABLE_RESIZE_HIT_ZONE;
  return nearBottom && !nearRight;
}

function isColumnResizeHotspot(cell: HTMLElement, clientX: number, clientY: number) {
  const rect = cell.getBoundingClientRect();
  const nearRight = rect.right - clientX <= TABLE_RESIZE_HIT_ZONE;
  const nearBottom = rect.bottom - clientY <= TABLE_RESIZE_HIT_ZONE;
  return nearRight && !nearBottom;
}

function getRelativeBoundaryMetrics(surface: HTMLElement, table: HTMLTableElement, row: HTMLTableRowElement, cell: HTMLTableCellElement) {
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

function getRelativeCellMetrics(surface: HTMLElement, cell: HTMLElement) {
  const surfaceRect = surface.getBoundingClientRect();
  const cellRect = cell.getBoundingClientRect();

  return {
    left: cellRect.left - surfaceRect.left + surface.scrollLeft,
    top: cellRect.top - surfaceRect.top + surface.scrollTop,
    width: cellRect.width,
    height: cellRect.height,
  };
}

function getRelativeSelectedCellsMetrics(surface: HTMLElement) {
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

const UEditor = React.forwardRef<UEditorRef, UEditorProps>(({
  content = "",
  onChange,
  onHtmlChange,
  onJsonChange,
  uploadImage,
  uploadImageForSave,
  imageInsertMode = "base64",
  placeholder,
  className,
  editable = true,
  autofocus = false,
  showToolbar = true,
  showBubbleMenu = true,
  showFloatingMenu = false,
  showCharacterCount = true,
  maxCharacters,
  minHeight = "200px",
  maxHeight = "auto",
  variant = "default",
  fontFamilies,
  fontSizes,
  lineHeights,
  letterSpacings,
}: UEditorProps, ref) => {
  const t = useSmartTranslations("UEditor");
  const effectivePlaceholder = placeholder ?? t("placeholder");
  const inFlightPrepareRef = useRef<Promise<UEditorPrepareContentForSaveResult> | null>(null);
  const editorContentRef = useRef<HTMLDivElement | null>(null);
  const tableColumnGuideRef = useRef<HTMLSpanElement | null>(null);
  const tableRowGuideRef = useRef<HTMLSpanElement | null>(null);
  const activeTableCellHighlightRef = useRef<HTMLSpanElement | null>(null);
  const hoveredTableCellRef = useRef<HTMLElement | null>(null);
  const activeTableCellRef = useRef<HTMLElement | null>(null);
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

  const extensions = useMemo(
    () => buildUEditorExtensions({ placeholder: effectivePlaceholder, translate: t, maxCharacters, uploadImage, imageInsertMode, editable }),
    [effectivePlaceholder, t, maxCharacters, uploadImage, imageInsertMode, editable],
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content,
    editable,
    autofocus,
    editorProps: {
      handleDOMEvents: {
        keydown: (_view, event) => {
          if (!(event instanceof KeyboardEvent)) return false;
          if (
            event.key === "ArrowLeft" ||
            event.key === "ArrowRight" ||
            event.key === "ArrowUp" ||
            event.key === "ArrowDown"
          ) {
            event.stopPropagation();
          }
          return false;
        },
        click: (view, event) => {
          if (!(event instanceof MouseEvent)) return false;
          if (event.button !== 0) return false;

          const target = resolveEventElement(event.target);
          const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
          const href = anchor?.getAttribute("href") ?? "";
          if (!href) return false;

          // Avoid opening while user is selecting text.
          if (!view.state.selection.empty) return false;

          event.preventDefault();
          event.stopPropagation();
          window.open(href, "_blank", "noopener,noreferrer");
          return true;
        },
      },
      attributes: {
        class: cn(
          "prose prose-sm sm:prose dark:prose-invert max-w-none",
          "focus:outline-none",
          "px-4 py-4",
          "[&_.is-editor-empty]:before:content-[attr(data-placeholder)]",
          "[&_.is-editor-empty]:before:text-muted-foreground/50",
          "[&_.is-editor-empty]:before:float-left",
          "[&_.is-editor-empty]:before:pointer-events-none",
          "[&_.is-editor-empty]:before:h-0",
          "[&_ul[data-type='taskList']]:list-none",
          "[&_ul[data-type='taskList']]:pl-0",
          "[&_ul[data-type='taskList']_li]:flex",
          "[&_ul[data-type='taskList']_li]:items-start",
          "[&_ul[data-type='taskList']_li]:gap-2",
          "[&_ul[data-type='taskList']_li>label]:mt-0.5",
          "[&_ul[data-type='taskList']_li>label>input]:w-4",
          "[&_ul[data-type='taskList']_li>label>input]:h-4",
          "[&_ul[data-type='taskList']_li>label>input]:rounded",
          "[&_ul[data-type='taskList']_li>label>input]:border-2",
          "[&_ul[data-type='taskList']_li>label>input]:border-primary/50",
          "[&_ul[data-type='taskList']_li>label>input]:accent-primary",
          "[&_pre]:bg-muted/40!",
          "[&_pre]:text-foreground!",
          "[&_pre]:border!",
          "[&_pre]:border-border/60!",
          "[&_pre_code]:bg-transparent!",
          "[&_.tableWrapper]:overflow-x-auto",
          "[&_.tableWrapper]:pb-1.5",
          "[&_.tableWrapper]:select-text",
          "[&_.tableWrapper]:[scrollbar-width:thin]",
          "[&_.tableWrapper]:[scrollbar-color:hsl(var(--border))_transparent]",
          "[&_.tableWrapper::-webkit-scrollbar]:h-2",
          "[&_.tableWrapper::-webkit-scrollbar]:w-2",
          "[&_.tableWrapper::-webkit-scrollbar-track]:rounded-full",
          "[&_.tableWrapper::-webkit-scrollbar-track]:bg-transparent",
          "[&_.tableWrapper::-webkit-scrollbar-thumb]:rounded-full",
          "[&_.tableWrapper::-webkit-scrollbar-thumb]:border",
          "[&_.tableWrapper::-webkit-scrollbar-thumb]:border-solid",
          "[&_.tableWrapper::-webkit-scrollbar-thumb]:border-transparent",
          "[&_.tableWrapper::-webkit-scrollbar-thumb]:bg-border/70",
          "[&_.tableWrapper::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/45",
          "[&_table]:table-fixed",
          "[&_table]:overflow-hidden",
          "[&_table]:select-text",
          "[&_table[data-table-align]]:w-max",
          "[&_table[data-table-align]]:max-w-full",
          "[&_table[data-table-align='center']]:mx-auto",
          "[&_table[data-table-align='right']]:ml-auto",
          "[&_table[data-table-align='right']]:mr-0",
          "[&_td]:relative",
          "[&_td]:align-top",
          "[&_td]:box-border",
          "[&_td]:select-text",
          "[&_th]:relative",
          "[&_th]:align-top",
          "[&_th]:box-border",
          "[&_th]:select-text",
          "[&_.selectedCell]:after:content-['']",
          "[&_.selectedCell]:after:absolute",
          "[&_.selectedCell]:after:inset-0",
          "[&_.selectedCell]:after:z-[2]",
          "[&_.selectedCell]:after:bg-primary/15",
          "[&_.selectedCell]:after:pointer-events-none",
          "[&_.column-resize-handle]:pointer-events-auto",
          "[&_.column-resize-handle]:cursor-col-resize",
          "[&_.column-resize-handle]:absolute",
          "[&_.column-resize-handle]:top-[-1px]",
          "[&_.column-resize-handle]:bottom-[-1px]",
          "[&_.column-resize-handle]:right-[-5px]",
          "[&_.column-resize-handle]:z-10",
          "[&_.column-resize-handle]:w-2.5",
          "[&_.column-resize-handle]:bg-transparent",
          "[&_.column-resize-handle]:rounded-none",
          "[&_.column-resize-handle]:opacity-0",
          "[&_.column-resize-handle]:transition-opacity",
          "[&_.column-resize-handle]:after:absolute",
          "[&_.column-resize-handle]:after:top-0",
          "[&_.column-resize-handle]:after:bottom-0",
          "[&_.column-resize-handle]:after:left-1/2",
          "[&_.column-resize-handle]:after:w-0.5",
          "[&_.column-resize-handle]:after:-translate-x-1/2",
          "[&_.column-resize-handle]:after:rounded-full",
          "[&_.column-resize-handle]:after:bg-primary/75",
          "[&_.column-resize-handle]:after:content-['']",
          "[&.resize-cursor_.column-resize-handle]:opacity-100",
          "[&.resize-cursor_.column-resize-handle]:after:bg-primary",
          "[&.resize-cursor]:cursor-col-resize",
          "[&.resize-row-cursor]:cursor-row-resize",
          "[&_img.ProseMirror-selectednode]:ring-2",
          "[&_img.ProseMirror-selectednode]:ring-primary/60",
          "[&_img.ProseMirror-selectednode]:ring-offset-2",
          "[&_img.ProseMirror-selectednode]:ring-offset-background",
          "[&_hr]:border-t-2",
          "[&_hr]:border-primary/30",
          "[&_hr]:my-8",
          "[&_h1]:text-3xl",
          "[&_h1]:font-bold",
          "[&_h1]:mt-6",
          "[&_h1]:mb-4",
          "[&_h1]:text-foreground",
          "[&_h2]:text-2xl",
          "[&_h2]:font-semibold",
          "[&_h2]:mt-5",
          "[&_h2]:mb-3",
          "[&_h2]:text-foreground",
          "[&_h3]:text-xl",
          "[&_h3]:font-semibold",
          "[&_h3]:mt-4",
          "[&_h3]:mb-2",
          "[&_h3]:text-foreground",
          "[&_ul:not([data-type='taskList'])]:list-disc",
          "[&_ul:not([data-type='taskList'])]:pl-6",
          "[&_ul:not([data-type='taskList'])]:my-3",
          "[&_ol]:list-decimal",
          "[&_ol]:pl-6",
          "[&_ol]:my-3",
          "[&_li]:my-1",
          "[&_li]:pl-1",
          "[&_li_p]:my-0",
          "[&_blockquote]:border-l-4",
          "[&_blockquote]:border-primary",
          "[&_blockquote]:pl-4",
          "[&_blockquote]:py-2",
          "[&_blockquote]:my-4",
          "[&_blockquote]:bg-muted/30",
          "[&_blockquote]:rounded-r-lg",
          "[&_blockquote]:italic",
          "[&_blockquote]:text-muted-foreground",
          "[&_blockquote_p]:my-0",
          "[&_[data-image-layout='left']+p]:mt-1",
          "[&_[data-image-layout='left']+p]:min-h-[5rem]",
          "[&_[data-image-layout='right']+p]:mt-1",
          "[&_[data-image-layout='right']+p]:min-h-[5rem]",
          "max-md:[&_[data-image-layout='left']]:float-none",
          "max-md:[&_[data-image-layout='left']]:mr-0",
          "max-md:[&_[data-image-layout='left']]:ml-0",
          "max-md:[&_[data-image-layout='left']]:max-w-full",
          "max-md:[&_[data-image-layout='right']]:float-none",
          "max-md:[&_[data-image-layout='right']]:mr-0",
          "max-md:[&_[data-image-layout='right']]:ml-0",
          "max-md:[&_[data-image-layout='right']]:max-w-full",
          "max-md:[&_[data-image-layout='left']+p]:min-h-0",
          "max-md:[&_[data-image-layout='right']+p]:min-h-0",
        ),
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
      onHtmlChange?.(html);
      onJsonChange?.(editor.getJSON());
    },
  });

  const syncActiveTableCellFromSelection = React.useCallback(() => {
    if (!editor) return;
    setActiveTableCell(getSelectionTableCell(editor.view));
  }, [editor, setActiveTableCell]);

  useImperativeHandle(
    ref,
    () => ({
      prepareContentForSave: async ({ throwOnError = false } = {}) => {
        if (!inFlightPrepareRef.current) {
          const htmlSnapshot = editor?.getHTML() ?? content ?? "";
          inFlightPrepareRef.current = prepareUEditorContentForSave({
            html: htmlSnapshot,
            uploadImageForSave,
          }).finally(() => {
            inFlightPrepareRef.current = null;
          });
        }

        const result = await inFlightPrepareRef.current;
        if (throwOnError && result.errors.length > 0) {
          throw new UEditorPrepareContentForSaveError(result);
        }
        return result;
      },
    }),
    [content, editor, uploadImageForSave],
  );

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      if (editor.isEmpty && content) {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

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

      rowResizeStateRef.current = {
        rowElement: row,
        tableElement: table,
        cellElement: cell,
        cellIndex: cell.cellIndex,
        rowPos: rowInfo.pos,
        rowNode: rowInfo.node,
        startY: event.clientY,
        startHeight: row.getBoundingClientRect().height,
        previewHeight: row.getBoundingClientRect().height,
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

      if (nextHeight === state.previewHeight) {
        document.body.style.cursor = "row-resize";
        showRowGuide(state.tableElement, state.rowElement, state.cellElement);
        return;
      }

      state.previewHeight = nextHeight;
      applyPreviewRowHeight(state.rowElement, nextHeight);
      const tr = editor.view.state.tr;
      tr.setNodeMarkup(state.rowPos, undefined, {
        ...state.rowNode.attrs,
        rowHeight: nextHeight,
      });
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
    };

    const handlePointerUp = (event: MouseEvent) => {
      const state = rowResizeStateRef.current;
      if (!state) return;

      const nextHeight = Math.max(
        MIN_TABLE_ROW_HEIGHT,
        Math.round(state.startHeight + (event.clientY - state.startY)),
      );

      clearPreviewRowHeight(state.rowElement);
      rowResizeStateRef.current = null;
      document.body.style.cursor = "";
      clearHoveredTableCell();
      clearAllTableResizeHover();
    };

    const handleWindowBlur = () => {
      const state = rowResizeStateRef.current;
      if (!state) return;
      clearPreviewRowHeight(state.rowElement);
      rowResizeStateRef.current = null;
      document.body.style.cursor = "";
      clearHoveredTableCell();
      clearAllTableResizeHover();
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
      document.body.style.cursor = "";
      clearActiveTableCell();
      clearHoveredTableCell();
      clearAllTableResizeHover();
      rowResizeStateRef.current = null;
    };
  }, [clearActiveTableCell, clearAllTableResizeHover, clearHoveredTableCell, editor, hideColumnGuide, hideRowGuide, setHoveredTableCell, showColumnGuide, showRowGuide, syncActiveTableCellFromSelection, updateActiveCellHighlight]);

  if (!editor) {
    return (
      <div
        className={cn("w-full rounded-lg border bg-background flex items-center justify-center text-muted-foreground", className)}
        style={{ minHeight }}
      >
        {t("loading")}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl md:rounded-3xl border border-border/50 bg-card text-card-foreground overflow-hidden",
        "transition-[transform,box-shadow,border-color,background-color] duration-300 ease-soft",
        "shadow-sm focus-within:shadow-md focus-within:border-primary/15",
        "backdrop-blur-sm",
        variant === "notion" && "hover:shadow-md",
        className,
      )}
    >
      {editable && showToolbar && (
        <EditorToolbar
          editor={editor}
          variant={variant}
          uploadImage={uploadImage}
          imageInsertMode={imageInsertMode}
          fontFamilies={fontFamilies as UEditorFontFamilyOption[] | undefined}
          fontSizes={fontSizes as UEditorFontSizeOption[] | undefined}
          lineHeights={lineHeights as UEditorLineHeightOption[] | undefined}
          letterSpacings={letterSpacings as UEditorLetterSpacingOption[] | undefined}
        />
      )}
      {editable && showBubbleMenu && (
        <CustomBubbleMenu
          editor={editor}
          fontSizes={fontSizes as UEditorFontSizeOption[] | undefined}
          lineHeights={lineHeights as UEditorLineHeightOption[] | undefined}
        />
      )}
      {editable && showFloatingMenu && <CustomFloatingMenu editor={editor} />}

      <div
        ref={editorContentRef}
        className="relative flex-1 overflow-y-auto"
        style={{
          minHeight,
          maxHeight,
        }}
      >
        <span
          ref={tableColumnGuideRef}
          aria-hidden="true"
          className="pointer-events-none absolute z-20 bg-primary opacity-0 transition-opacity duration-100"
        />
        <span
          ref={tableRowGuideRef}
          aria-hidden="true"
          className="pointer-events-none absolute z-20 bg-primary opacity-0 transition-opacity duration-100"
        />
        <span
          ref={activeTableCellHighlightRef}
          aria-hidden="true"
          className="pointer-events-none hidden absolute z-20 rounded-[2px] border-2 border-primary bg-primary/10 transition-[left,top,width,height] duration-100"
        />
        {editable && <TableControls editor={editor} containerRef={editorContentRef} />}
        <EditorContent
          editor={editor}
          className="min-h-full"
        />
      </div>

      {showCharacterCount && <CharacterCountDisplay editor={editor} maxCharacters={maxCharacters} />}
    </div>
  );
});

UEditor.displayName = "UEditor";

export default UEditor;
