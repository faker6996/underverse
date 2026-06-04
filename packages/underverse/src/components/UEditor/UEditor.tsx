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
import { EditorToolbar } from "./toolbar";
import { CustomBubbleMenu, CustomFloatingMenu } from "./menus";
import { CharacterCountDisplay } from "./CharacterCount";
import { prepareUEditorContentForSave, UEditorPrepareContentForSaveError } from "./prepare-content-for-save";
import { TableControls } from "./table-controls";
import { UEDITOR_PROSEMIRROR_CLASS_NAME } from "./editor-styles";
import { resolveEventElement } from "./table-dom-utils";
import { useUEditorTableInteractions } from "./use-table-interactions";
import { MenuBar } from "./menu-bar";

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
  maxCharacters,
  minHeight = "200px",
  maxHeight = "auto",
  variant = "default",
  fontFamilies,
  fontSizes,
  lineHeights,
  letterSpacings,
  fetchMetadata,
  uploadFile,
  uploadFileForSave,
  collaborationOptions,
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
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
      onHtmlChange?.(html);
      onJsonChange?.(editor.getJSON());
    },
  });

  const {
    editorContentRef,
    tableColumnGuideRef,
    tableRowGuideRef,
    activeTableCellHighlightRef,
  } = useUEditorTableInteractions(editor, editable);

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

    const nextContent = content ?? "";
    if (lastAppliedContentRef.current === nextContent) return;

    lastAppliedContentRef.current = nextContent;
    if (editor.getHTML() !== nextContent) {
      // Schedule content update in a microtask to avoid flushSync warning during React rendering/effects phase
      Promise.resolve().then(() => {
        if (!editor.isDestroyed) {
          editor.commands.setContent(nextContent, { emitUpdate: false });
        }
      });
    }
  }, [content, editor]);

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
        "group relative flex flex-col text-card-foreground",
        editable ? [
          "rounded-2xl md:rounded-3xl border border-border/50 bg-card overflow-hidden",
          "transition-[transform,box-shadow,border-color,background-color] duration-300 ease-soft",
          "shadow-sm focus-within:shadow-md focus-within:border-primary/15",
          "backdrop-blur-sm",
          variant === "notion" && "hover:shadow-md",
        ] : "rounded-none",
        className,
      )}
    >
      {editable && showMenuBar && (
        <MenuBar
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
      )}
      {editable && showToolbar && (
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
