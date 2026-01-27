import { Extension } from "@tiptap/core";
import { Plugin } from "prosemirror-state";

export type ClipboardImagesOptions = {
  maxFileSize: number;
  allowedMimeTypes: string[];
  upload?: (file: File) => Promise<string> | string;
  fallbackToDataUrl: boolean;
  insertMode: "base64" | "upload";
};

function getImageFiles(dataTransfer: DataTransfer | null): File[] {
  if (!dataTransfer) return [];

  const byKey = new Map<string, File>();

  for (const item of Array.from(dataTransfer.items ?? [])) {
    if (item.kind !== "file") continue;
    if (!item.type.startsWith("image/")) continue;
    const file = item.getAsFile();
    if (!file) continue;
    byKey.set(`${file.name}:${file.size}:${file.lastModified}`, file);
  }

  for (const file of Array.from(dataTransfer.files ?? [])) {
    if (!file.type.startsWith("image/")) continue;
    byKey.set(`${file.name}:${file.size}:${file.lastModified}`, file);
  }

  return Array.from(byKey.values());
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}

async function resolveImageSrc(file: File, options: ClipboardImagesOptions): Promise<string> {
  if (options.insertMode === "upload" && options.upload) {
    try {
      const result = await options.upload(file);
      const src = typeof result === "string" ? result : "";
      if (src) return src;
    } catch (err) {
      if (!options.fallbackToDataUrl) throw err;
    }
  }

  return fileToDataUrl(file);
}

export const ClipboardImages = Extension.create<ClipboardImagesOptions>({
  name: "clipboardImages",

  addOptions() {
    return {
      maxFileSize: 10 * 1024 * 1024,
      allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"],
      upload: undefined,
      fallbackToDataUrl: true,
      insertMode: "base64",
    };
  },

  addProseMirrorPlugins() {
    const editor = this.editor;
    const options = this.options;

    const insertFiles = async (files: File[], selectionPos?: number) => {
      if (selectionPos !== undefined) {
        editor.commands.setTextSelection(selectionPos);
      }

      for (const file of files) {
        if (file.size > options.maxFileSize) continue;
        if (options.allowedMimeTypes.length > 0 && !options.allowedMimeTypes.includes(file.type)) continue;

        const src = await resolveImageSrc(file, options);
        editor.chain().focus().setImage({ src, alt: file.name }).run();
        editor.commands.createParagraphNear();
      }
    };

    return [
      new Plugin({
        props: {
          handlePaste: (_view, event) => {
            if (!(event instanceof ClipboardEvent)) return false;
            const files = getImageFiles(event.clipboardData);
            if (files.length === 0) return false;

            event.preventDefault();
            void insertFiles(files);
            return true;
          },
          handleDrop: (view, event, _slice, moved) => {
            if (moved) return false;
            if (!(event instanceof DragEvent)) return false;
            const files = getImageFiles(event.dataTransfer);
            if (files.length === 0) return false;

            const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
            event.preventDefault();
            void insertFiles(files, pos);
            return true;
          },
        },
      }),
    ];
  },
});
