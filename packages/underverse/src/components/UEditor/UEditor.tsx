"use client";

import React, { useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { useSmartTranslations } from "../../hooks/useSmartTranslations";
import { useEditor, EditorContent } from "@tiptap/react";
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
import { EditorToolbar, EditorUiRenderStateProvider } from "./toolbar";
import { CustomBubbleMenu, CustomFloatingMenu } from "./menus";
import { CharacterCountDisplay } from "./CharacterCount";
import { prepareUEditorContentForSave, UEditorPrepareContentForSaveError } from "./prepare-content-for-save";
import { TableControls } from "./table-controls";
import { UEDITOR_PROSEMIRROR_CLASS_NAME } from "./editor-styles";
import { resolveEventElement } from "./table-dom-utils";
import { useUEditorTableInteractions } from "./use-table-interactions";
import { useFormulaCoordinateOverlay } from "./use-formula-coordinate-overlay";
import {
  clearSelectedTableCellFormula,
  getSelectedTableFormulaCell,
  isEditingTableFormulaText,
  recalculateActiveTableFormulas,
  recalculateAllTableFormulas,
  UEDITOR_TABLE_FORMULA_RECALCULATE_META,
} from "./table-formula-commands";
import {
  beginFormulaRangePick,
  cancelFormulaEditing,
  getFormulaEditingTableContext,
  getFormulaRangePickHighlight,
  updateFormulaRangePick,
  type FormulaRangePickHighlight,
  type FormulaRangePickState,
} from "./table-formula-range-picker";
import { isDraftTableFormula } from "./table-formula";
import { sanitizeUEditorUrl } from "./url-safety";
import { TableFormulaBar } from "./table-formula-bar";

const LazyMenuBar = React.lazy(async () => {
  const { MenuBar } = await import("./menu-bar");
  return { default: MenuBar };
});

const UEditor = React.forwardRef<UEditorRef, UEditorProps>(({
  content = "",
  onChange,
  onHtmlChange,
  onJsonChange,
  uploadImage,
  uploadImageForSave,
  uploadImageConcurrency = 3,
  imageInsertMode = "base64",
  maxImageFileSize,
  allowedImageMimeTypes,
  fallbackToDataUrl,
  placeholder,
  className,
  editable = true,
  autofocus = false,
  showToolbar = true,
  showBubbleMenu = true,
  showFloatingMenu = false,
  showCharacterCount = true,
  showFooter = true,
  maxCharacters,
  minHeight = "200px",
  maxHeight = "auto",
  variant = "default",
  rounded = true,
  fontFamilies,
  fontSizes,
  lineHeights,
  letterSpacings,
  fetchMetadata,
  uploadFile,
  uploadFileForSave,
  extraExtensions,
  showMenuBar = false,
  onSave,
  onExport,
  onSourceCode,
  onPreview,
}: UEditorProps, ref) => {
  const t = useSmartTranslations("UEditor");
  const effectivePlaceholder = placeholder ?? t("placeholder");
  const inFlightPrepareRef = useRef<Promise<UEditorPrepareContentForSaveResult> | null>(null);
  const lastAppliedContentRef = useRef(content ?? "");
  const scheduledFormulaRecalculateRef = useRef(false);
  const pendingFormulaTextRecalculateRef = useRef(false);
  const editorInstanceRef = useRef<NonNullable<ReturnType<typeof useEditor>> | null>(null);
  const formulaRangePickRef = useRef<FormulaRangePickState | null>(null);
  const formulaRangeSurfaceRef = useRef<HTMLDivElement | null>(null);
  const [formulaRangeHighlight, setFormulaRangeHighlight] = React.useState<FormulaRangePickHighlight | null>(null);
  const scheduleFormulaRecalculate = React.useCallback((editor: NonNullable<ReturnType<typeof useEditor>>, options?: { force?: boolean }) => {
    if (editor.isDestroyed || scheduledFormulaRecalculateRef.current) return;
    if (!options?.force && isEditingTableFormulaText(editor)) return;

    scheduledFormulaRecalculateRef.current = true;
    queueMicrotask(() => {
      scheduledFormulaRecalculateRef.current = false;
      if (!editor.isDestroyed && (options?.force || !isEditingTableFormulaText(editor))) {
        recalculateActiveTableFormulas(editor);
      }
    });
  }, []);

  const resolvedUploadFile = useMemo(() => {
    if (uploadFile) return uploadFile;
    if (uploadFileForSave) {
      return async (file: File) => {
        const res = await uploadFileForSave(file);
        return typeof res === "string" ? res : res.url;
      };
    }
    return uploadImage;
  }, [uploadFile, uploadFileForSave, uploadImage]);

  const extensions = useMemo(
    () => [
      ...buildUEditorExtensions({
        placeholder: effectivePlaceholder,
        translate: t,
        maxCharacters,
        uploadImage,
        uploadFile: resolvedUploadFile,
        imageInsertMode,
        maxImageFileSize,
        allowedImageMimeTypes,
        fallbackToDataUrl,
        editable,
        fetchMetadata,
      }),
      ...(extraExtensions ?? []),
    ],
    [effectivePlaceholder, t, maxCharacters, uploadImage, resolvedUploadFile, imageInsertMode, maxImageFileSize, allowedImageMimeTypes, fallbackToDataUrl, editable, fetchMetadata, extraExtensions],
  );

  const syncFormulaRangeHighlight = React.useCallback((pickState: FormulaRangePickState | null) => {
    const container = formulaRangeSurfaceRef.current;
    setFormulaRangeHighlight(container && pickState ? getFormulaRangePickHighlight(container, pickState) : null);
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content,
    editable,
    autofocus,
    editorProps: {
      handleDOMEvents: {
        mousedown: (view, event) => {
          if (!(event instanceof MouseEvent)) return false;
          const pickState = beginFormulaRangePick(view, event);
          if (!pickState) return false;
          formulaRangePickRef.current = pickState;
          syncFormulaRangeHighlight(pickState);
          return true;
        },
        mousemove: (view, event) => {
          if (!(event instanceof MouseEvent)) return false;
          const pickState = formulaRangePickRef.current;
          if (!pickState) return false;
          if (event.buttons === 0) {
            formulaRangePickRef.current = null;
            syncFormulaRangeHighlight(null);
            return false;
          }
          const nextPickState = updateFormulaRangePick(view, pickState, event);
          formulaRangePickRef.current = nextPickState;
          syncFormulaRangeHighlight(nextPickState);
          return true;
        },
        mouseup: (_view, event) => {
          if (!(event instanceof MouseEvent)) return false;
          if (!formulaRangePickRef.current) return false;
          formulaRangePickRef.current = null;
          syncFormulaRangeHighlight(null);
          event.preventDefault();
          event.stopPropagation();
          return true;
        },
        keydown: (_view, event) => {
          if (!(event instanceof KeyboardEvent)) return false;
          const formulaContext = getFormulaEditingTableContext(_view);
          if (formulaContext && event.key === "Enter") {
            event.preventDefault();
            event.stopPropagation();
            const activeEditor = editorInstanceRef.current;
            if (activeEditor && !isDraftTableFormula(formulaContext.formula)) {
              recalculateActiveTableFormulas(activeEditor);
            }
            return true;
          }
          if (formulaContext && event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            cancelFormulaEditing(_view);
            return true;
          }
          const activeEditor = editorInstanceRef.current;
          if (
            activeEditor &&
            (event.key === "Backspace" || event.key === "Delete") &&
            getSelectedTableFormulaCell(activeEditor)
          ) {
            event.preventDefault();
            event.stopPropagation();
            clearSelectedTableCellFormula(activeEditor);
            return true;
          }
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
          const href = sanitizeUEditorUrl(anchor?.getAttribute("href") ?? "", "link");
          if (!href) return false;

          // If editable, let the bubble menu/floating link preview handle it.
          if (editable) return false;

          // Avoid opening while user is selecting text.
          if (!view.state.selection.empty) return false;

          event.preventDefault();
          event.stopPropagation();
          window.open(href, "_blank", "noopener,noreferrer");
          return true;
        },
      },
      attributes: {
        class: UEDITOR_PROSEMIRROR_CLASS_NAME,
      },
    },
    onUpdate: ({ editor, transaction, appendedTransactions }) => {
      const includesFormulaRecalculation = transaction.getMeta(UEDITOR_TABLE_FORMULA_RECALCULATE_META)
        || appendedTransactions.some((appendedTransaction) => (
          appendedTransaction.getMeta(UEDITOR_TABLE_FORMULA_RECALCULATE_META)
        ));
      if (!includesFormulaRecalculation) {
        if (isEditingTableFormulaText(editor)) {
          pendingFormulaTextRecalculateRef.current = true;
        } else {
          pendingFormulaTextRecalculateRef.current = false;
        }
      }

      if (onChange || onHtmlChange) {
        const html = editor.getHTML();
        onChange?.(html);
        onHtmlChange?.(html);
      }
      if (onJsonChange) {
        onJsonChange(editor.getJSON());
      }
    },
    onSelectionUpdate: ({ editor }) => {
      if (pendingFormulaTextRecalculateRef.current && !isEditingTableFormulaText(editor)) {
        pendingFormulaTextRecalculateRef.current = false;
        scheduleFormulaRecalculate(editor);
      }
    },
    onBlur: ({ editor, event }) => {
      const nextTarget = event.relatedTarget;
      if (nextTarget instanceof Element && nextTarget.closest("[data-ueditor-formula-bar]")) return;
      const shouldRecalculate = pendingFormulaTextRecalculateRef.current;
      pendingFormulaTextRecalculateRef.current = false;
      if (shouldRecalculate) scheduleFormulaRecalculate(editor, { force: true });
    },
  });
  useEffect(() => {
    editorInstanceRef.current = editor;
    return () => {
      if (editorInstanceRef.current === editor) editorInstanceRef.current = null;
    };
  }, [editor]);

  const {
    editorContentRef,
    tableColumnGuideRef,
    tableRowGuideRef,
    activeTableCellHighlightRef,
  } = useUEditorTableInteractions(editor, editable);
  const formulaCoordinateOverlayRef = useFormulaCoordinateOverlay(editor, editorContentRef, {
    apply: t("tableMenu.apply"),
    cancel: t("imageInput.cancelBtn"),
  });

  useImperativeHandle(
    ref,
    () => ({
      editor,
      prepareContentForSave: async ({ throwOnError = false } = {}) => {
        if (!inFlightPrepareRef.current) {
          const htmlSnapshot = editor?.getHTML() ?? content ?? "";
          inFlightPrepareRef.current = prepareUEditorContentForSave({
            html: htmlSnapshot,
            uploadImageForSave,
            uploadFileForSave,
            uploadConcurrency: uploadImageConcurrency,
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
    [content, editor, uploadImageForSave, uploadFileForSave, uploadImageConcurrency],
  );

  useEffect(() => {
    if (!editor) return;

    queueMicrotask(() => {
      if (!editor.isDestroyed) {
        recalculateAllTableFormulas(editor);
      }
    });
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    const nextContent = content ?? "";
    if (lastAppliedContentRef.current === nextContent) return;

    lastAppliedContentRef.current = nextContent;
    if (editor.getHTML() !== nextContent) {
      // Schedule content update in a microtask to avoid flushSync warning during React rendering/effects phase
      Promise.resolve().then(() => {
        if (!editor.isDestroyed) {
          editor.commands.setContent(nextContent, { emitUpdate: false });
          queueMicrotask(() => {
            if (!editor.isDestroyed) {
              recalculateAllTableFormulas(editor);
            }
          });
        }
      });
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div
        className={cn("w-full border bg-background flex items-center justify-center text-muted-foreground", className)}
        style={{ minHeight }}
      >
        {t("loading")}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative flex flex-col text-card-foreground",
        editable ? [
          "border border-border/50 bg-card overflow-hidden",
          "transition-[transform,box-shadow,border-color,background-color] duration-300 ease-soft",
          "shadow-sm focus-within:shadow-md focus-within:border-primary/15",
          "backdrop-blur-sm",
          variant === "notion" && "hover:shadow-md",
          rounded ? "rounded-2xl md:rounded-3xl max-md:rounded-xl" : "rounded-none",
        ] : "rounded-none",
        className,
      )}
    >
      {editable && (showMenuBar || showToolbar || showBubbleMenu) ? (
        <EditorUiRenderStateProvider editor={editor}>
          {showMenuBar && (
            <React.Suspense fallback={null}>
              <LazyMenuBar
                editor={editor}
                containerRef={editorContentRef}
                uploadImage={uploadImage}
                imageInsertMode={imageInsertMode}
                maxImageFileSize={maxImageFileSize}
                allowedImageMimeTypes={allowedImageMimeTypes}
                onSave={onSave}
                onExport={onExport}
                onSourceCode={onSourceCode}
                onPreview={onPreview}
              />
            </React.Suspense>
          )}
          {showToolbar && (
            <EditorToolbar
              editor={editor}
              variant={variant}
              uploadImage={uploadImage}
              imageInsertMode={imageInsertMode}
              maxImageFileSize={maxImageFileSize}
              allowedImageMimeTypes={allowedImageMimeTypes}
              fontFamilies={fontFamilies as UEditorFontFamilyOption[] | undefined}
              fontSizes={fontSizes as UEditorFontSizeOption[] | undefined}
              lineHeights={lineHeights as UEditorLineHeightOption[] | undefined}
              letterSpacings={letterSpacings as UEditorLetterSpacingOption[] | undefined}
            />
          )}
          <TableFormulaBar editor={editor} />
          {showBubbleMenu && (
            <CustomBubbleMenu
              editor={editor}
              fontSizes={fontSizes as UEditorFontSizeOption[] | undefined}
              lineHeights={lineHeights as UEditorLineHeightOption[] | undefined}
            />
          )}
        </EditorUiRenderStateProvider>
      ) : editable ? (
        <TableFormulaBar editor={editor} />
      ) : null}
      {editable && showFloatingMenu && <CustomFloatingMenu editor={editor} />}
      <div
        ref={(node) => {
          editorContentRef.current = node;
          formulaRangeSurfaceRef.current = node;
        }}
        className="relative flex-1 overflow-y-auto"
        style={{
          minHeight: editable ? minHeight : undefined,
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
          data-ueditor-active-cell-highlight=""
          className="pointer-events-none hidden absolute z-20 rounded-[2px] border-2 border-primary bg-primary/10"
        />
        <div
          ref={formulaCoordinateOverlayRef}
          data-ueditor-formula-coordinate-overlay=""
          className="pointer-events-none absolute inset-0 z-[35] hidden overflow-visible"
        />
        {formulaRangeHighlight && (
          <span
            aria-hidden="true"
            data-ueditor-formula-range-highlight=""
            data-ueditor-formula-range-blocked={formulaRangeHighlight.blocked ? "true" : undefined}
            className={cn(
              "pointer-events-none absolute z-20 rounded-[2px] border-2",
              formulaRangeHighlight.blocked
                ? "border-destructive bg-destructive/15"
                : "border-primary bg-primary/10",
            )}
            style={{
              left: formulaRangeHighlight.left,
              top: formulaRangeHighlight.top,
              width: formulaRangeHighlight.width,
              height: formulaRangeHighlight.height,
            }}
          />
        )}
        {editable && (
          <TableControls
            editor={editor}
            containerRef={editorContentRef}
            showCellInspector={showBubbleMenu}
          />
        )}
        <EditorContent
          editor={editor}
          className="min-h-full"
        />
      </div>

      {showFooter && showCharacterCount && <CharacterCountDisplay editor={editor} maxCharacters={maxCharacters} />}
    </div>
  );
});

UEditor.displayName = "UEditor";

export default UEditor;
