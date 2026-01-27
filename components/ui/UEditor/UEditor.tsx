"use client";

import React, { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useEditor, EditorContent } from "@tiptap/react";
import { cn } from "@/lib/utils/cn";
import { buildUEditorExtensions } from "./extensions";
import type { UEditorProps } from "./types";
import { EditorToolbar } from "./toolbar";
import { CustomBubbleMenu, CustomFloatingMenu } from "./menus";
import { CharacterCountDisplay } from "./CharacterCount";

const UEditor = ({
  content = "",
  onChange,
  onHtmlChange,
  onJsonChange,
  uploadImage,
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
}: UEditorProps) => {
  const t = useTranslations("UEditor");
  const effectivePlaceholder = placeholder ?? t("placeholder");

  const extensions = useMemo(
    () => buildUEditorExtensions({ placeholder: effectivePlaceholder, maxCharacters, uploadImage, imageInsertMode }),
    [effectivePlaceholder, maxCharacters, uploadImage, imageInsertMode],
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
          "[&_pre]:!bg-[#1e1e1e]",
          "[&_pre]:!text-[#d4d4d4]",
          "[&_pre_code]:!bg-transparent",
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

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      if (editor.isEmpty && content) {
        editor.commands.setContent(content);
      }
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
        "group relative flex flex-col rounded-2xl md:rounded-3xl border border-border bg-card text-card-foreground overflow-hidden",
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
        className="flex-1 overflow-y-auto"
        style={{
          minHeight,
          maxHeight,
        }}
      />

      {showCharacterCount && <CharacterCountDisplay editor={editor} maxCharacters={maxCharacters} />}
    </div>
  );
};

export default UEditor;
