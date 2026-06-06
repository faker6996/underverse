import { Extension, type JSONContent } from "@tiptap/core";
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

type ClipboardTableCell = {
  text: string;
  isHeader: boolean;
};

function normalizeClipboardCellText(value: string) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n+$/g, "")
    .replace(/^\n+/g, "")
    .trim();
}

function getClipboardCellText(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? "";
  }

  if (!(node instanceof HTMLElement)) {
    return "";
  }

  if (node.tagName === "BR") {
    return "\n";
  }

  const childText = Array.from(node.childNodes).map(getClipboardCellText).join("");

  if ((node.tagName === "P" || node.tagName === "DIV" || node.tagName === "LI") && childText && !childText.endsWith("\n")) {
    return `${childText}\n`;
  }

  return childText;
}

function getHtmlTableRows(table: HTMLTableElement) {
  const rows = Array.from(table.querySelectorAll("tr")).map((row) =>
    Array.from(row.children)
      .filter((cell): cell is HTMLTableCellElement => cell instanceof HTMLTableCellElement)
      .map((cell) => ({
        text: normalizeClipboardCellText(getClipboardCellText(cell)),
        isHeader: cell.tagName === "TH",
      })),
  );

  return rows.filter((row) => row.length > 0);
}

function createParagraphContent(text: string): JSONContent {
  return text
    ? {
        type: "paragraph",
        content: [{ type: "text", text }],
      }
    : { type: "paragraph" };
}

function createTableCellContent(cell: ClipboardTableCell): JSONContent {
  const lines = cell.text.split("\n");
  const paragraphs = (lines.length > 0 ? lines : [""]).map(createParagraphContent);

  return {
    type: cell.isHeader ? "tableHeader" : "tableCell",
    content: paragraphs.length > 0 ? paragraphs : [{ type: "paragraph" }],
  };
}

function createTableContent(rows: ClipboardTableCell[][], minColumnCount = 1): JSONContent | null {
  const tableRows = rows.filter((row) => row.length > 0);
  if (tableRows.length === 0) return null;

  const columnCount = tableRows.reduce((max, row) => Math.max(max, row.length), 0);
  if (columnCount < minColumnCount) return null;

  return {
    type: "table",
    content: tableRows.map((row) => {
      const normalizedRow = Array.from(
        { length: columnCount },
        (_, index): ClipboardTableCell => row[index] ?? { text: "", isHeader: false },
      );

      return {
        type: "tableRow",
        content: normalizedRow.map(createTableCellContent),
      };
    }),
  };
}

function getClipboardTableContent(dataTransfer: DataTransfer) {
  const html = getClipboardData(dataTransfer, "text/html");
  if (!/<table(?:\s|>)/i.test(html)) return null;
  if (typeof DOMParser === "undefined") return null;

  const fragment = extractClipboardHtmlFragment(html);
  const doc = new DOMParser().parseFromString(fragment, "text/html");
  const table = doc.querySelector("table");
  if (!(table instanceof HTMLTableElement)) return null;

  return createTableContent(getHtmlTableRows(table));
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

function getClipboardTsvTableContent(dataTransfer: DataTransfer) {
  const text = getClipboardData(dataTransfer, "text/plain")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  if (!text.includes("\t")) return null;

  const rows = parseClipboardTsvRows(text);
  return createTableContent(
    rows.map((row) => row.map((cell) => ({ text: normalizeClipboardCellText(cell), isHeader: false }))),
    2,
  );
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

            const tableContent = getClipboardTableContent(event.clipboardData);
            if (tableContent) {
              event.preventDefault();
              editor.chain().focus().insertContent(tableContent).run();
              return true;
            }

            const tsvTableContent = getClipboardTsvTableContent(event.clipboardData);
            if (tsvTableContent) {
              event.preventDefault();
              editor.chain().focus().insertContent(tsvTableContent).run();
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
