import type { JSONContent } from "@tiptap/core";

type ClipboardDataLike = {
  getData: (type: string) => string;
};

type ClipboardTableCell = {
  text: string;
  isHeader: boolean;
};

function getClipboardData(dataTransfer: ClipboardDataLike, type: string) {
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

export function getClipboardTableContent(dataTransfer: ClipboardDataLike) {
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

export function getClipboardTsvTableContent(dataTransfer: ClipboardDataLike) {
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
