"use client";

import React, { useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { useSmartTranslations } from "../../hooks/useSmartTranslations";
import { useEditor, EditorContent } from "@tiptap/react";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import type { EditorView } from "@tiptap/pm/view";
import { cn } from "../../utils/cn";
import { buildUEditorExtensions } from "./extensions";
import type { UEditorPrepareContentForSaveResult, UEditorProps, UEditorRef } from "./types";
import { EditorToolbar } from "./toolbar";
import { CustomBubbleMenu, CustomFloatingMenu } from "./menus";
import { CharacterCountDisplay } from "./CharacterCount";
import { prepareUEditorContentForSave, UEditorPrepareContentForSaveError } from "./prepare-content-for-save";

const TABLE_RESIZE_HIT_ZONE = 10;
const MIN_TABLE_ROW_HEIGHT = 36;

function applyPreviewRowHeight(rowElement: HTMLTableRowElement, nextHeight: number) {
  rowElement.style.height = `${nextHeight}px`;
  rowElement.querySelectorAll("th,td").forEach((cell) => {
    if (cell instanceof HTMLElement) {
      cell.style.height = `${nextHeight}px`;
      cell.style.minHeight = `${nextHeight}px`;
    }
  });
}

function clearPreviewRowHeight(rowElement: HTMLTableRowElement) {
  rowElement.style.height = "";
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

function resolveTableResizeTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;

  const cell = target.closest("th,td");
  if (!(cell instanceof HTMLElement)) return null;

  const row = cell.closest("tr");
  if (!(row instanceof HTMLTableRowElement)) return null;

  const rect = cell.getBoundingClientRect();
  const bottomDistance = rect.bottom - ("clientY" in target ? 0 : 0);

  return { cell, row, rect, bottomDistance };
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
}: UEditorProps, ref) => {
  const t = useSmartTranslations("UEditor");
  const effectivePlaceholder = placeholder ?? t("placeholder");
  const inFlightPrepareRef = useRef<Promise<UEditorPrepareContentForSaveResult> | null>(null);
  const editorRootRef = useRef<HTMLElement | null>(null);
  const hoveredTableRowRef = useRef<HTMLTableRowElement | null>(null);
  const rowResizeStateRef = useRef<{
    rowElement: HTMLTableRowElement;
    rowPos: number;
    rowNode: ProseMirrorNode;
    startY: number;
    startHeight: number;
  } | null>(null);

  const setEditorResizeCursor = React.useCallback((cursor: string) => {
    const proseMirror = editorRootRef.current?.querySelector(".ProseMirror") as HTMLElement | null;
    if (proseMirror) {
      proseMirror.style.cursor = cursor;
    }
  }, []);

  const clearHoveredTableRow = React.useCallback(() => {
    editorRootRef.current?.classList.remove("resize-row-cursor");
    setEditorResizeCursor("");
    if (hoveredTableRowRef.current) {
      delete hoveredTableRowRef.current.dataset.rowResizeHover;
      hoveredTableRowRef.current = null;
    }
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
        mousemove: (view, event) => {
          if (!(event instanceof MouseEvent)) return false;

          if (rowResizeStateRef.current) {
            return false;
          }

          const target = event.target;
          if (!(target instanceof Element)) {
            clearHoveredTableRow();
            return false;
          }

          const cell = target.closest("th,td");
          if (!(cell instanceof HTMLElement)) {
            clearHoveredTableRow();
            return false;
          }

          const row = cell.closest("tr");
          if (!(row instanceof HTMLTableRowElement)) {
            clearHoveredTableRow();
            return false;
          }

          const rect = cell.getBoundingClientRect();
          const nearBottom = rect.bottom - event.clientY <= TABLE_RESIZE_HIT_ZONE;
          const nearRight = rect.right - event.clientX <= TABLE_RESIZE_HIT_ZONE;

          if (nearBottom && !nearRight) {
            editorRootRef.current?.classList.add("resize-row-cursor");
            setEditorResizeCursor("row-resize");

            if (hoveredTableRowRef.current !== row) {
              if (hoveredTableRowRef.current) {
                delete hoveredTableRowRef.current.dataset.rowResizeHover;
              }
              row.dataset.rowResizeHover = "true";
              hoveredTableRowRef.current = row;
            }

            return false;
          }

          clearHoveredTableRow();
          return false;
        },
        mousedown: (view, event) => {
          if (!(event instanceof MouseEvent) || event.button !== 0) return false;

          const target = event.target;
          if (!(target instanceof Element)) return false;

          const cell = target.closest("th,td");
          if (!(cell instanceof HTMLElement)) return false;

          const row = cell.closest("tr");
          if (!(row instanceof HTMLTableRowElement)) return false;

          const rect = cell.getBoundingClientRect();
          const nearBottom = rect.bottom - event.clientY <= TABLE_RESIZE_HIT_ZONE;
          const nearRight = rect.right - event.clientX <= TABLE_RESIZE_HIT_ZONE;

          if (!nearBottom || nearRight) {
            return false;
          }

          const rowInfo = findTableRowNodeInfo(view, row);
          if (!rowInfo) {
            return false;
          }

          rowResizeStateRef.current = {
            rowElement: row,
            rowPos: rowInfo.pos,
            rowNode: rowInfo.node,
            startY: event.clientY,
            startHeight: row.getBoundingClientRect().height,
          };

          row.dataset.rowResizeHover = "true";
          editorRootRef.current?.classList.add("resize-row-cursor");
          setEditorResizeCursor("row-resize");
          document.body.style.cursor = "row-resize";
          event.preventDefault();
          return true;
        },
        click: (view, event) => {
          if (!(event instanceof MouseEvent)) return false;
          if (event.button !== 0) return false;

          const target = event.target as Element | null;
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
          "[&_pre]:bg-[#1e1e1e]!",
          "[&_pre]:text-[#d4d4d4]!",
          "[&_pre_code]:bg-transparent!",
          "[&_.tableWrapper]:overflow-x-auto",
          "[&_td]:relative",
          "[&_th]:relative",
          "[&_.column-resize-handle]:pointer-events-auto",
          "[&_.column-resize-handle]:cursor-col-resize",
          "[&_.column-resize-handle]:bg-primary/35",
          "[&_.column-resize-handle]:w-1.5",
          "[&_.column-resize-handle]:opacity-0",
          "[&_.column-resize-handle]:transition-opacity",
          "[&_td:hover_.column-resize-handle]:opacity-100",
          "[&_th:hover_.column-resize-handle]:opacity-100",
          "[&_tr[data-row-resize-hover='true']>td]:border-b-primary/60",
          "[&_tr[data-row-resize-hover='true']>th]:border-b-primary/60",
          "[&_tr[data-row-resize-hover='true']>td]:shadow-[inset_0_-3px_0_0_hsl(var(--primary))]",
          "[&_tr[data-row-resize-hover='true']>th]:shadow-[inset_0_-3px_0_0_hsl(var(--primary))]",
          "[&_tr[data-row-resize-hover='true']>td]:cursor-row-resize",
          "[&_tr[data-row-resize-hover='true']>th]:cursor-row-resize",
          "[&_tr[data-row-resize-hover='true']_*]:cursor-row-resize!",
          "[&_tr[data-row-resize-hover='true']>td:last-child]:after:content-['']",
          "[&_tr[data-row-resize-hover='true']>th:last-child]:after:content-['']",
          "[&_tr[data-row-resize-hover='true']>td:last-child]:after:absolute",
          "[&_tr[data-row-resize-hover='true']>th:last-child]:after:absolute",
          "[&_tr[data-row-resize-hover='true']>td:last-child]:after:right-[-10px]",
          "[&_tr[data-row-resize-hover='true']>th:last-child]:after:right-[-10px]",
          "[&_tr[data-row-resize-hover='true']>td:last-child]:after:bottom-[-7px]",
          "[&_tr[data-row-resize-hover='true']>th:last-child]:after:bottom-[-7px]",
          "[&_tr[data-row-resize-hover='true']>td:last-child]:after:h-3.5",
          "[&_tr[data-row-resize-hover='true']>th:last-child]:after:h-3.5",
          "[&_tr[data-row-resize-hover='true']>td:last-child]:after:w-5",
          "[&_tr[data-row-resize-hover='true']>th:last-child]:after:w-5",
          "[&_tr[data-row-resize-hover='true']>td:last-child]:after:rounded-full",
          "[&_tr[data-row-resize-hover='true']>th:last-child]:after:rounded-full",
          "[&_tr[data-row-resize-hover='true']>td:last-child]:after:border",
          "[&_tr[data-row-resize-hover='true']>th:last-child]:after:border",
          "[&_tr[data-row-resize-hover='true']>td:last-child]:after:border-primary/60",
          "[&_tr[data-row-resize-hover='true']>th:last-child]:after:border-primary/60",
          "[&_tr[data-row-resize-hover='true']>td:last-child]:after:bg-background/95",
          "[&_tr[data-row-resize-hover='true']>th:last-child]:after:bg-background/95",
          "[&_tr[data-row-resize-hover='true']>td:last-child]:after:shadow-sm",
          "[&_tr[data-row-resize-hover='true']>th:last-child]:after:shadow-sm",
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

    const handlePointerMove = (event: MouseEvent) => {
      const state = rowResizeStateRef.current;
      if (!state) return;

      const nextHeight = Math.max(
        MIN_TABLE_ROW_HEIGHT,
        Math.round(state.startHeight + (event.clientY - state.startY)),
      );

      applyPreviewRowHeight(state.rowElement, nextHeight);
      document.body.style.cursor = "row-resize";
      setEditorResizeCursor("row-resize");
    };

    const handlePointerUp = (event: MouseEvent) => {
      const state = rowResizeStateRef.current;
      if (!state) return;

      const nextHeight = Math.max(
        MIN_TABLE_ROW_HEIGHT,
        Math.round(state.startHeight + (event.clientY - state.startY)),
      );

      const tr = editor.view.state.tr;
      tr.setNodeMarkup(state.rowPos, undefined, {
        ...state.rowNode.attrs,
        rowHeight: nextHeight,
      });
      editor.view.dispatch(tr);

      clearPreviewRowHeight(state.rowElement);
      rowResizeStateRef.current = null;
      document.body.style.cursor = "";
      clearHoveredTableRow();
    };

    const handleWindowBlur = () => {
      const state = rowResizeStateRef.current;
      if (!state) return;
      clearPreviewRowHeight(state.rowElement);
      rowResizeStateRef.current = null;
      document.body.style.cursor = "";
      clearHoveredTableRow();
    };

    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      window.removeEventListener("blur", handleWindowBlur);
      document.body.style.cursor = "";
      clearHoveredTableRow();
      rowResizeStateRef.current = null;
    };
  }, [clearHoveredTableRow, editor, setEditorResizeCursor]);

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
        <EditorToolbar editor={editor} variant={variant} uploadImage={uploadImage} imageInsertMode={imageInsertMode} />
      )}
      {editable && showBubbleMenu && <CustomBubbleMenu editor={editor} />}
      {editable && showFloatingMenu && <CustomFloatingMenu editor={editor} />}

      <EditorContent
        editor={editor}
        ref={(node) => {
          editorRootRef.current = node;
        }}
        className="flex-1 overflow-y-auto"
        style={{
          minHeight,
          maxHeight,
        }}
      />

      {showCharacterCount && <CharacterCountDisplay editor={editor} maxCharacters={maxCharacters} />}
    </div>
  );
});

UEditor.displayName = "UEditor";

export default UEditor;
