import { MIN_TABLE_ROW_HEIGHT } from "./table-dom-utils";

const DEFAULT_TABLE_COLUMN_WIDTH = 100;
const TIPTAP_TABLE_MIN_COLUMN_WIDTH = 25;

function parsePixelWidth(value: string | null | undefined): number | null {
  if (!value) return null;
  const match = String(value).match(/(?:^|[\s:])(\d+(?:\.\d+)?)px\b/i) ?? String(value).match(/^(\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const parsed = Number.parseFloat(match[1] ?? match[0]);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : null;
}

function parseStyleWidth(style: CSSStyleDeclaration) {
  return parsePixelWidth(style.width) ?? parsePixelWidth(style.minWidth);
}

function parseStyleHeight(style: CSSStyleDeclaration) {
  return parsePixelWidth(style.height) ?? parsePixelWidth(style.minHeight);
}

function getCellColspan(cell: HTMLTableCellElement) {
  return Math.max(1, cell.colSpan || Number.parseInt(cell.getAttribute("colspan") || "1", 10) || 1);
}

function getCellWidths(cell: HTMLTableCellElement): number[] | null {
  const dataColwidth = cell.getAttribute("data-colwidth") || cell.getAttribute("colwidth");
  if (dataColwidth) {
    const widths = dataColwidth
      .split(/[,\s]+/)
      .map((part) => parsePixelWidth(part))
      .filter((width): width is number => typeof width === "number");
    if (widths.length > 0) return widths;
  }

  const width = parsePixelWidth(cell.getAttribute("width")) ?? parseStyleWidth(cell.style);
  if (!width) return null;

  const colspan = getCellColspan(cell);
  return Array.from({ length: colspan }, () => Math.max(DEFAULT_TABLE_COLUMN_WIDTH, Math.round(width / colspan)));
}

function getColumnCount(table: HTMLTableElement) {
  const colCount = table.querySelectorAll("colgroup > col").length;
  if (colCount > 0) return colCount;

  return Math.max(
    0,
    ...Array.from(table.rows).map((row) =>
      Array.from(row.cells).reduce((count, cell) => count + getCellColspan(cell), 0),
    ),
  );
}

function resolveColumnWidths(table: HTMLTableElement) {
  const columnCount = getColumnCount(table);
  if (columnCount <= 0) return [];

  const widths = Array.from({ length: columnCount }, () => DEFAULT_TABLE_COLUMN_WIDTH);
  const cols = Array.from(table.querySelectorAll<HTMLTableColElement>("colgroup > col"));

  cols.slice(0, columnCount).forEach((col, index) => {
    const width = parsePixelWidth(col.getAttribute("width")) ?? parseStyleWidth(col.style);
    if (width && width > TIPTAP_TABLE_MIN_COLUMN_WIDTH) {
      widths[index] = width;
    }
  });

  Array.from(table.rows).forEach((row) => {
    let columnIndex = 0;
    Array.from(row.cells).forEach((cell) => {
      const cellWidths = getCellWidths(cell);
      if (cellWidths) {
        cellWidths.slice(0, getCellColspan(cell)).forEach((width, offset) => {
          if (width > TIPTAP_TABLE_MIN_COLUMN_WIDTH && columnIndex + offset < widths.length) {
            widths[columnIndex + offset] = width;
          }
        });
      }
      columnIndex += getCellColspan(cell);
    });
  });

  return widths;
}

function setStyleProperty(element: HTMLElement, property: string, value: string) {
  element.style.setProperty(property, value);
}

function resolveExplicitRowHeight(row: HTMLTableRowElement) {
  const explicitRowHeight = parsePixelWidth(row.getAttribute("data-row-height")) ?? parseStyleHeight(row.style);
  if (explicitRowHeight) return Math.max(MIN_TABLE_ROW_HEIGHT, explicitRowHeight);

  const cellHeight = Array.from(row.cells).reduce((maxHeight, cell) => {
    const height = parsePixelWidth(cell.getAttribute("height")) ?? parseStyleHeight(cell.style);
    return height ? Math.max(maxHeight, height) : maxHeight;
  }, 0);

  return cellHeight ? Math.max(MIN_TABLE_ROW_HEIGHT, cellHeight) : null;
}

function normalizePreviewRowHeight(row: HTMLTableRowElement) {
  const rowHeight = resolveExplicitRowHeight(row);
  if (!rowHeight) return;

  row.style.height = `${rowHeight}px`;
  row.style.minHeight = `${rowHeight}px`;

  Array.from(row.cells).forEach((cell) => {
    cell.style.height = `${rowHeight}px`;
    cell.style.minHeight = `${rowHeight}px`;
  });
}

function normalizePreviewTable(table: HTMLTableElement) {
  const widths = resolveColumnWidths(table);
  if (widths.length === 0) return;

  let colgroup = table.querySelector("colgroup");
  if (!colgroup) {
    colgroup = document.createElement("colgroup");
    table.insertBefore(colgroup, table.firstChild);
  }

  while (colgroup.children.length < widths.length) {
    colgroup.appendChild(document.createElement("col"));
  }

  Array.from(colgroup.children).forEach((child, index) => {
    if (child.tagName.toLowerCase() !== "col") return;
    const col = child as HTMLTableColElement;
    if (index >= widths.length) {
      child.remove();
      return;
    }
    col.style.width = `${widths[index]}px`;
    col.style.minWidth = `${widths[index]}px`;
    col.setAttribute("width", String(widths[index]));
  });

  const tableWidth = widths.reduce((sum, width) => sum + width, 0);
  setStyleProperty(table, "width", `${tableWidth}px`);
  setStyleProperty(table, "min-width", `${tableWidth}px`);
  setStyleProperty(table, "table-layout", "fixed");

  Array.from(table.rows).forEach((row) => {
    let columnIndex = 0;
    normalizePreviewRowHeight(row);

    Array.from(row.cells).forEach((cell) => {
      const colspan = getCellColspan(cell);
      const cellWidth = widths.slice(columnIndex, columnIndex + colspan).reduce((sum, width) => sum + width, 0);
      if (cellWidth > 0) {
        cell.style.width = `${cellWidth}px`;
        cell.style.minWidth = `${cellWidth}px`;
      }
      columnIndex += colspan;
    });
  });
}

export function prepareUEditorPreviewHtml(html: string) {
  if (typeof document === "undefined" || !html) return html;

  const container = document.createElement("div");
  container.innerHTML = html;
  container.querySelectorAll("table").forEach((table) => normalizePreviewTable(table));
  return container.innerHTML;
}
