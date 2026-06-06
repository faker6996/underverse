import { Extension } from "@tiptap/core";
import { Plugin } from "@tiptap/pm/state";
import { sanitizeUEditorUrl } from "./url-safety";

export type ClipboardImagesOptions = {
  maxFileSize: number;
  allowedMimeTypes: string[];
  upload?: (file: File) => Promise<string> | string;
  fallbackToDataUrl: boolean;
  insertMode: "base64" | "upload";
};

export const DEFAULT_UEDITOR_IMAGE_MAX_FILE_SIZE = 10 * 1024 * 1024;
export const DEFAULT_UEDITOR_IMAGE_MIME_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"];

function getImageFiles(dataTransfer: DataTransfer | null): File[] {
  if (!dataTransfer) return [];

  // Some browsers expose the *same* pasted/dropped image both in `items` and `files`.
  // Prefer `items` when available to avoid duplicate inserts.
  const itemFiles: File[] = [];
  const byKey = new Map<string, File>();

  for (const item of Array.from(dataTransfer.items ?? [])) {
    if (item.kind !== "file") continue;
    if (!item.type.startsWith("image/")) continue;
    const file = item.getAsFile();
    if (!file) continue;
    byKey.set(`${file.name}:${file.size}:${file.lastModified}`, file);
  }

  itemFiles.push(...Array.from(byKey.values()));
  if (itemFiles.length > 0) return itemFiles;

  for (const file of Array.from(dataTransfer.files ?? [])) {
    if (!file.type.startsWith("image/")) continue;
    byKey.set(`${file.name}:${file.size}:${file.lastModified}`, file);
  }

  return Array.from(byKey.values());
}

function getClipboardData(dataTransfer: DataTransfer, type: string) {
  try {
    return dataTransfer.getData(type) ?? "";
  } catch {
    return "";
  }
}

function extractClipboardHtmlFragment(html: string) {
  const startMarker = "<!--StartFragment-->";
  const endMarker = "<!--EndFragment-->";
  const start = html.indexOf(startMarker);
  const end = html.indexOf(endMarker);

  if (start >= 0 && end > start) {
    return html.slice(start + startMarker.length, end);
  }

  return html;
}

const EMPTY_TABLE_CELL_HTML = "<p></p>";
const TABLE_MEDIA_SELECTOR = "img,video,audio,iframe,svg,canvas,embed,object";
const TABLE_BLOCK_SELECTOR = "p,ul,ol,blockquote,pre,h1,h2,h3,h4,h5,h6,hr,table";

function hasMeaningfulTableCellText(value: string | null | undefined) {
  return Boolean(value?.replace(/\u00a0/g, " ").trim());
}

function normalizeClipboardTableCell(cell: HTMLTableCellElement) {
  const hasText = hasMeaningfulTableCellText(cell.textContent);
  const hasBlockContent = Boolean(cell.querySelector(TABLE_BLOCK_SELECTOR));
  const hasMediaContent = Boolean(cell.querySelector(TABLE_MEDIA_SELECTOR));

  if (!hasText && !hasBlockContent && !hasMediaContent) {
    cell.innerHTML = EMPTY_TABLE_CELL_HTML;
  }
}

function normalizeClipboardTable(table: HTMLTableElement) {
  for (const cell of Array.from(table.querySelectorAll("td,th"))) {
    if (!(cell instanceof HTMLTableCellElement)) continue;
    normalizeClipboardTableCell(cell);
  }
}

function getClipboardTableHtml(dataTransfer: DataTransfer) {
  const html = getClipboardData(dataTransfer, "text/html");
  if (!/<table(?:\s|>)/i.test(html)) return "";

  const fragment = extractClipboardHtmlFragment(html);

  if (typeof DOMParser !== "undefined") {
    const doc = new DOMParser().parseFromString(fragment, "text/html");
    const table = doc.querySelector("table");
    if (table instanceof HTMLTableElement) {
      normalizeClipboardTable(table);
      return table.outerHTML;
    }
  }

  return fragment;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseClipboardTsvRows(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = "";
  };

  const pushRow = () => {
    pushField();
    rows.push(row);
    row = [];
  };

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (inQuotes) {
      if (char === "\"" && nextChar === "\"") {
        field += "\"";
        index += 1;
        continue;
      }

      if (char === "\"") {
        inQuotes = false;
        continue;
      }

      field += char;
      continue;
    }

    if (char === "\"" && field.length === 0) {
      inQuotes = true;
      continue;
    }

    if (char === "\t") {
      pushField();
      continue;
    }

    if (char === "\n") {
      pushRow();
      continue;
    }

    field += char;
  }

  pushRow();

  while (rows.length > 0 && rows[rows.length - 1].every((cell) => cell === "")) {
    rows.pop();
  }

  return rows;
}

function renderClipboardTableCellHtml(value: string) {
  const lines = value.split("\n");
  const paragraphs = lines.length > 0 ? lines : [""];
  return paragraphs.map((line) => `<p>${escapeHtml(line)}</p>`).join("");
}

function getClipboardTsvTableHtml(dataTransfer: DataTransfer) {
  const text = getClipboardData(dataTransfer, "text/plain")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  if (!text.includes("\t")) return "";

  const rows = parseClipboardTsvRows(text);
  if (rows.length === 0 || rows.every((row) => row.length < 2)) return "";

  const columnCount = rows.reduce((max, row) => Math.max(max, row.length), 0);
  const body = rows
    .map((row) => {
      const normalizedRow = Array.from({ length: columnCount }, (_, index) => row[index] ?? "");
      return `<tr>${normalizedRow.map((cell) => `<td>${renderClipboardTableCellHtml(cell)}</td>`).join("")}</tr>`;
    })
    .join("");

  return `<table><tbody>${body}</tbody></table>`;
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
      const src = typeof result === "string" ? sanitizeUEditorUrl(result, "image") : "";
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
      maxFileSize: DEFAULT_UEDITOR_IMAGE_MAX_FILE_SIZE,
      allowedMimeTypes: DEFAULT_UEDITOR_IMAGE_MIME_TYPES,
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

        try {
          const src = await resolveImageSrc(file, options);
          editor.chain().focus().setImage({ src, alt: file.name }).run();
          editor.commands.createParagraphNear();
        } catch {
          // Upload failed with no fallback — skip this file and continue batch.
        }
      }
    };

    return [
      new Plugin({
        props: {
          handlePaste: (_view, event) => {
            if (!event || !event.clipboardData) return false;

            const tableHtml = getClipboardTableHtml(event.clipboardData);
            if (tableHtml) {
              event.preventDefault();
              editor.chain().focus().insertContent(tableHtml).run();
              return true;
            }

            const tsvTableHtml = getClipboardTsvTableHtml(event.clipboardData);
            if (tsvTableHtml) {
              event.preventDefault();
              editor.chain().focus().insertContent(tsvTableHtml).run();
              return true;
            }

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
