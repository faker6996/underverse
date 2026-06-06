import type { JSONContent } from "@tiptap/core";

type ClipboardDataLike = {
  getData: (type: string) => string;
};

type ClipboardStyleDeclarations = Map<string, string>;
type ClipboardStyleMap = Map<string, ClipboardStyleDeclarations>;

type ClipboardTableCellAttrs = {
  backgroundColor?: string;
  borderColor?: string;
  borderStyle?: string;
  borderWidth?: string;
  colspan?: number;
  rowspan?: number;
  colwidth?: number[];
};

type ClipboardTextSegment = {
  text: string;
  marks?: JSONContent["marks"];
};

type ClipboardTableCell = {
  text: string;
  isHeader: boolean;
  attrs?: ClipboardTableCellAttrs;
  segments?: ClipboardTextSegment[];
  textColor?: string;
};

type ClipboardTableRow = {
  cells: ClipboardTableCell[];
  attrs?: {
    rowHeight?: number;
  };
};

const DEFAULT_HTML_TABLE_CELL_BACKGROUND_COLOR = "#ffffff";
const DEFAULT_HTML_TABLE_TEXT_COLOR = "#000000";

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

function parseStyleDeclarations(styleText: string | null | undefined): ClipboardStyleDeclarations {
  const declarations: ClipboardStyleDeclarations = new Map();
  if (!styleText) return declarations;

  for (const declaration of styleText.split(";")) {
    const separatorIndex = declaration.indexOf(":");
    if (separatorIndex <= 0) continue;

    const property = declaration.slice(0, separatorIndex).trim().toLowerCase();
    const value = cleanStyleValue(declaration.slice(separatorIndex + 1));
    if (!property || !value) continue;

    declarations.set(property, value);
  }

  return declarations;
}

function mergeStyleDeclarations(...sources: Array<ClipboardStyleDeclarations | null | undefined>) {
  const declarations: ClipboardStyleDeclarations = new Map();

  for (const source of sources) {
    if (!source) continue;
    for (const [property, value] of source.entries()) {
      declarations.set(property, value);
    }
  }

  return declarations;
}

function extractCssClassNames(selectorText: string) {
  const classNames = new Set<string>();
  const classNamePattern = /\.([_a-zA-Z-][\w-]*)/g;
  let match: RegExpExecArray | null;

  while ((match = classNamePattern.exec(selectorText)) !== null) {
    classNames.add(match[1]);
  }

  return classNames;
}

function parseClipboardCssClassStyles(doc: Document): ClipboardStyleMap {
  const styleMap: ClipboardStyleMap = new Map();

  for (const styleElement of Array.from(doc.querySelectorAll("style"))) {
    const cssText = (styleElement.textContent ?? "")
      .replace(/<!--|-->/g, "")
      .replace(/\/\*[\s\S]*?\*\//g, "");
    const rulePattern = /([^{}]+)\{([^{}]*)\}/g;
    let match: RegExpExecArray | null;

    while ((match = rulePattern.exec(cssText)) !== null) {
      const classNames = extractCssClassNames(match[1]);
      if (classNames.size === 0) continue;

      const declarations = parseStyleDeclarations(match[2]);
      if (declarations.size === 0) continue;

      for (const className of classNames) {
        styleMap.set(className, mergeStyleDeclarations(styleMap.get(className), declarations));
      }
    }
  }

  return styleMap;
}

function getElementStyleDeclarations(element: HTMLElement, styleMap: ClipboardStyleMap) {
  const classDeclarations = Array.from(element.classList).map((className) => styleMap.get(className));
  const inlineDeclarations = parseStyleDeclarations(element.getAttribute("style"));
  return mergeStyleDeclarations(...classDeclarations, inlineDeclarations);
}

function cleanStyleValue(value: string | null | undefined) {
  const normalized = value?.trim();
  if (!normalized) return null;
  if (/[\0<>;{}]/.test(normalized)) return null;
  if (/\b(?:expression|url|(?:repeating-)?(?:linear|radial|conic)-gradient)\s*\(/i.test(normalized)) return null;
  return normalized;
}

function normalizeColorValue(value: string | null | undefined) {
  const normalized = cleanStyleValue(value);
  if (!normalized) return null;
  if (/^(?:auto|inherit|initial|none|transparent|unset)$/i.test(normalized)) return null;
  return normalized;
}

function normalizeTextColorValue(value: string | null | undefined) {
  const normalized = normalizeColorValue(value);
  if (!normalized) return null;
  if (/^(?:automatic|windowtext|black|#000|#000000|rgb\(\s*0\s*,\s*0\s*,\s*0\s*\))$/i.test(normalized)) {
    return DEFAULT_HTML_TABLE_TEXT_COLOR;
  }
  return normalized;
}

function isWhiteColor(value: string | null | undefined) {
  if (!value) return false;
  return /^(?:white|#fff|#ffffff|rgb\(\s*255\s*,\s*255\s*,\s*255\s*\))$/i.test(value.trim());
}

function parseCssColorRgb(value: string | null | undefined) {
  const normalized = normalizeColorValue(value);
  if (!normalized) return null;

  const lowerColor = normalized.toLowerCase();
  if (lowerColor === "white") return { r: 255, g: 255, b: 255 };
  if (lowerColor === "black") return { r: 0, g: 0, b: 0 };

  const hexMatch = lowerColor.match(/^#([\da-f]{3}|[\da-f]{6})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    const fullHex = hex.length === 3 ? hex.split("").map((part) => part + part).join("") : hex;

    return {
      r: Number.parseInt(fullHex.slice(0, 2), 16),
      g: Number.parseInt(fullHex.slice(2, 4), 16),
      b: Number.parseInt(fullHex.slice(4, 6), 16),
    };
  }

  const rgbMatch = lowerColor.match(/^rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)/);
  if (rgbMatch) {
    return {
      r: Math.max(0, Math.min(255, Number.parseFloat(rgbMatch[1]))),
      g: Math.max(0, Math.min(255, Number.parseFloat(rgbMatch[2]))),
      b: Math.max(0, Math.min(255, Number.parseFloat(rgbMatch[3]))),
    };
  }

  return null;
}

function getRelativeLuminance(value: string | null | undefined) {
  const rgb = parseCssColorRgb(value);
  if (!rgb) return null;

  const toLinear = (channel: number) => {
    const normalized = channel / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * toLinear(rgb.r) + 0.7152 * toLinear(rgb.g) + 0.0722 * toLinear(rgb.b);
}

function isLightTextColor(value: string | null | undefined) {
  const luminance = getRelativeLuminance(value);
  return luminance !== null && luminance >= 0.72;
}

function isDarkReadableBackground(value: string | null | undefined) {
  const luminance = getRelativeLuminance(value);
  return luminance !== null && luminance <= 0.45;
}

function splitCssTokens(value: string) {
  const tokens: string[] = [];
  let current = "";
  let depth = 0;

  for (const char of value) {
    if (char === "(") depth += 1;
    if (char === ")") depth = Math.max(0, depth - 1);

    if (/\s/.test(char) && depth === 0) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      continue;
    }

    current += char;
  }

  if (current) tokens.push(current);
  return tokens;
}

function extractColorFromShorthand(value: string | null | undefined) {
  const normalized = cleanStyleValue(value);
  if (!normalized) return null;

  const explicitColor = normalized.match(/#[\da-f]{3,8}\b|rgba?\([^)]+\)|hsla?\([^)]+\)/i);
  if (explicitColor) return explicitColor[0];

  const ignoredKeywords = new Set([
    "border-box",
    "center",
    "contain",
    "content-box",
    "cover",
    "fixed",
    "inherit",
    "initial",
    "left",
    "local",
    "none",
    "no-repeat",
    "padding-box",
    "repeat",
    "repeat-x",
    "repeat-y",
    "right",
    "scroll",
    "top",
    "transparent",
    "unset",
  ]);

  return splitCssTokens(normalized).find((token) => !ignoredKeywords.has(token.toLowerCase())) ?? null;
}

function getBackgroundColor(styles: ClipboardStyleDeclarations) {
  return (
    normalizeColorValue(styles.get("background-color"))
    ?? normalizeColorValue(extractColorFromShorthand(styles.get("background")))
  );
}

const BORDER_STYLES = new Set([
  "dashed",
  "dotted",
  "double",
  "groove",
  "hidden",
  "inset",
  "none",
  "outset",
  "ridge",
  "solid",
]);

const BORDER_WIDTH_KEYWORDS = new Set(["medium", "thick", "thin"]);

function normalizeBorderStyle(value: string | null | undefined) {
  const normalized = cleanStyleValue(value);
  if (!normalized) return null;

  const styles = splitCssTokens(normalized).filter((token) => BORDER_STYLES.has(token.toLowerCase()));
  const usefulStyles = styles.filter((style) => !/^(?:hidden|none)$/i.test(style));
  return usefulStyles.length > 0 ? usefulStyles.join(" ") : null;
}

function normalizeBorderWidth(value: string | null | undefined) {
  const normalized = cleanStyleValue(value);
  if (!normalized) return null;

  const widths = splitCssTokens(normalized).filter((token) => {
    const lowerToken = token.toLowerCase();
    return BORDER_WIDTH_KEYWORDS.has(lowerToken) || /^\d*\.?\d+(?:px|pt|pc|in|cm|mm|em|rem)?$/i.test(token);
  });

  return widths.length > 0 ? widths.join(" ") : null;
}

function parseBorderShorthand(value: string | null | undefined) {
  const normalized = cleanStyleValue(value);
  if (!normalized) return null;

  const tokens = splitCssTokens(normalized);
  let borderStyle: string | null = null;
  let borderWidth: string | null = null;
  const colorTokens: string[] = [];

  for (const token of tokens) {
    const lowerToken = token.toLowerCase();

    if (!borderStyle && BORDER_STYLES.has(lowerToken)) {
      borderStyle = lowerToken;
      continue;
    }

    if (
      !borderWidth
      && (BORDER_WIDTH_KEYWORDS.has(lowerToken) || /^\d*\.?\d+(?:px|pt|pc|in|cm|mm|em|rem)?$/i.test(token))
    ) {
      borderWidth = token;
      continue;
    }

    colorTokens.push(token);
  }

  if (borderStyle && /^(?:hidden|none)$/i.test(borderStyle)) return null;

  return {
    borderColor: normalizeColorValue(colorTokens.join(" ")),
    borderStyle,
    borderWidth,
  };
}

function getFirstParsedBorder(styles: ClipboardStyleDeclarations) {
  for (const property of ["border", "border-top", "border-right", "border-bottom", "border-left"]) {
    const border = parseBorderShorthand(styles.get(property));
    if (border) return border;
  }

  return null;
}

function getBorderAttrs(styles: ClipboardStyleDeclarations) {
  const parsedBorder = getFirstParsedBorder(styles);

  return {
    borderColor: normalizeColorValue(styles.get("border-color")) ?? parsedBorder?.borderColor ?? undefined,
    borderStyle: normalizeBorderStyle(styles.get("border-style")) ?? parsedBorder?.borderStyle ?? undefined,
    borderWidth: normalizeBorderWidth(styles.get("border-width")) ?? parsedBorder?.borderWidth ?? undefined,
  };
}

function parsePositiveInteger(value: string | null | undefined, max = 100) {
  if (!value) return null;

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return null;

  return Math.min(parsed, max);
}

function parseCssSize(value: string | null | undefined) {
  const normalized = cleanStyleValue(value);
  if (!normalized) return null;

  const match = normalized.match(/^(\d+(?:\.\d+)?)(px|pt)?$/i);
  if (!match) return null;

  const amount = Number.parseFloat(match[1]);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  return Math.round(match[2]?.toLowerCase() === "pt" ? amount * (4 / 3) : amount);
}

function getCellWidth(cell: HTMLTableCellElement, styles: ClipboardStyleDeclarations, colspan: number) {
  if (colspan !== 1) return null;

  const width = parseCssSize(cell.getAttribute("data-colwidth") ?? cell.getAttribute("width") ?? styles.get("width"));
  return width ? [width] : null;
}

function getTableRowAttrs(row: HTMLTableRowElement, styles: ClipboardStyleDeclarations): ClipboardTableRow["attrs"] {
  const rowHeight = parseCssSize(
    row.getAttribute("data-row-height") ?? row.getAttribute("height") ?? styles.get("height"),
  );
  return rowHeight ? { rowHeight } : undefined;
}

function getTableCellAttrs(
  cell: HTMLTableCellElement,
  styles: ClipboardStyleDeclarations,
  defaultBackgroundColor?: string,
): ClipboardTableCellAttrs | undefined {
  const colspan = parsePositiveInteger(cell.getAttribute("colspan")) ?? 1;
  const rowspan = parsePositiveInteger(cell.getAttribute("rowspan")) ?? 1;
  const backgroundColor =
    getBackgroundColor(styles)
    ?? normalizeColorValue(cell.getAttribute("data-background-color"))
    ?? normalizeColorValue(cell.getAttribute("bgcolor"))
    ?? defaultBackgroundColor;
  const borderAttrs = getBorderAttrs(styles);
  const colwidth = getCellWidth(cell, styles, colspan);

  const attrs: ClipboardTableCellAttrs = {};

  if (backgroundColor) attrs.backgroundColor = backgroundColor;
  if (borderAttrs.borderColor) attrs.borderColor = borderAttrs.borderColor;
  if (borderAttrs.borderStyle) attrs.borderStyle = borderAttrs.borderStyle;
  if (borderAttrs.borderWidth) attrs.borderWidth = borderAttrs.borderWidth;
  if (colspan > 1) attrs.colspan = colspan;
  if (rowspan > 1) attrs.rowspan = rowspan;
  if (colwidth) attrs.colwidth = colwidth;

  return Object.keys(attrs).length > 0 ? attrs : undefined;
}

function marksEqual(left: JSONContent["marks"], right: JSONContent["marks"]) {
  return JSON.stringify(left ?? []) === JSON.stringify(right ?? []);
}

function mergeMarks(base: JSONContent["marks"] | undefined, additions: JSONContent["marks"] | undefined) {
  const next = [...(base ?? [])];

  for (const addition of additions ?? []) {
    const existingIndex = next.findIndex((mark) => mark.type === addition.type);
    if (existingIndex >= 0) {
      const existingMark = next[existingIndex];
      next[existingIndex] = {
        ...existingMark,
        attrs: {
          ...(existingMark.attrs ?? {}),
          ...(addition.attrs ?? {}),
        },
      };
      continue;
    }

    next.push(addition);
  }

  return next.length > 0 ? next : undefined;
}

function getMarkColor(marks: JSONContent["marks"] | undefined, markType: string) {
  const mark = marks?.find((candidate) => candidate.type === markType);
  const color = mark?.attrs?.color;
  return typeof color === "string" ? color : null;
}

function replaceTextStyleColor(marks: JSONContent["marks"] | undefined, color: string) {
  let replaced = false;
  const next = (marks ?? []).map((mark) => {
    if (mark.type !== "textStyle") return mark;

    replaced = true;
    return {
      ...mark,
      attrs: {
        ...(mark.attrs ?? {}),
        color,
      },
    };
  });

  if (!replaced) {
    next.unshift({ type: "textStyle", attrs: { color } });
  }

  return next;
}

function ensureReadableSpreadsheetSegments(
  segments: ClipboardTextSegment[],
  cellBackgroundColor: string | null | undefined,
) {
  return segments.map((segment) => {
    const textColor = getMarkColor(segment.marks, "textStyle");
    if (!isLightTextColor(textColor)) return segment;

    const inlineBackgroundColor = getMarkColor(segment.marks, "highlight");
    if (isDarkReadableBackground(inlineBackgroundColor) || isDarkReadableBackground(cellBackgroundColor)) {
      return segment;
    }

    return {
      ...segment,
      marks: replaceTextStyleColor(segment.marks, DEFAULT_HTML_TABLE_TEXT_COLOR),
    };
  });
}

function getElementInlineMarks(element: HTMLElement, styles: ClipboardStyleDeclarations): JSONContent["marks"] | undefined {
  const marks: JSONContent["marks"] = [];
  const tagName = element.tagName;
  const color = normalizeTextColorValue(styles.get("color") ?? element.getAttribute("color"));
  const backgroundColor = getBackgroundColor(styles);
  const fontWeight = styles.get("font-weight")?.toLowerCase();
  const fontStyle = styles.get("font-style")?.toLowerCase();
  const textDecoration = styles.get("text-decoration")?.toLowerCase();

  if (color) {
    marks.push({ type: "textStyle", attrs: { color } });
  }

  if (backgroundColor && !isWhiteColor(backgroundColor)) {
    marks.push({ type: "highlight", attrs: { color: backgroundColor } });
  }

  if (
    tagName === "B"
    || tagName === "STRONG"
    || fontWeight === "bold"
    || (/^\d+$/.test(fontWeight ?? "") && Number(fontWeight) >= 600)
  ) {
    marks.push({ type: "bold" });
  }

  if (tagName === "I" || tagName === "EM" || fontStyle === "italic") {
    marks.push({ type: "italic" });
  }

  if (tagName === "U" || textDecoration?.includes("underline")) {
    marks.push({ type: "underline" });
  }

  return marks.length > 0 ? marks : undefined;
}

function appendTextSegment(segments: ClipboardTextSegment[], segment: ClipboardTextSegment) {
  if (!segment.text) return;

  const lastSegment = segments[segments.length - 1];
  if (lastSegment && marksEqual(lastSegment.marks, segment.marks)) {
    lastSegment.text += segment.text;
    return;
  }

  segments.push(segment);
}

function segmentsEndWithNewline(segments: ClipboardTextSegment[]) {
  return segments.length > 0 && segments[segments.length - 1].text.endsWith("\n");
}

function normalizeClipboardTextSegments(segments: ClipboardTextSegment[]) {
  const normalizedSegments: ClipboardTextSegment[] = [];

  for (const segment of segments) {
    appendTextSegment(normalizedSegments, {
      text: segment.text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").replace(/\u00a0/g, " "),
      marks: segment.marks,
    });
  }

  while (normalizedSegments.length > 0) {
    const firstSegment = normalizedSegments[0];
    firstSegment.text = firstSegment.text.replace(/^\s+/, "");
    if (firstSegment.text) break;
    normalizedSegments.shift();
  }

  while (normalizedSegments.length > 0) {
    const lastSegment = normalizedSegments[normalizedSegments.length - 1];
    lastSegment.text = lastSegment.text.replace(/\s+$/, "");
    if (lastSegment.text) break;
    normalizedSegments.pop();
  }

  return normalizedSegments;
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

function getClipboardCellSegments(
  node: Node,
  styleMap: ClipboardStyleMap,
  inheritedMarks?: JSONContent["marks"],
): ClipboardTextSegment[] {
  if (node.nodeType === Node.TEXT_NODE) {
    return [{ text: node.textContent ?? "", marks: inheritedMarks }];
  }

  if (!(node instanceof HTMLElement)) {
    return [];
  }

  if (node.tagName === "BR") {
    return [{ text: "\n", marks: inheritedMarks }];
  }

  const styles = getElementStyleDeclarations(node, styleMap);
  const marks = mergeMarks(inheritedMarks, getElementInlineMarks(node, styles));
  const segments: ClipboardTextSegment[] = [];

  for (const childNode of Array.from(node.childNodes)) {
    for (const segment of getClipboardCellSegments(childNode, styleMap, marks)) {
      appendTextSegment(segments, segment);
    }
  }

  if ((node.tagName === "P" || node.tagName === "DIV" || node.tagName === "LI") && segments.length > 0 && !segmentsEndWithNewline(segments)) {
    appendTextSegment(segments, { text: "\n" });
  }

  return segments;
}

function getClipboardCellChildSegments(
  cell: HTMLTableCellElement,
  styleMap: ClipboardStyleMap,
  inheritedMarks?: JSONContent["marks"],
) {
  const segments: ClipboardTextSegment[] = [];

  for (const childNode of Array.from(cell.childNodes)) {
    for (const segment of getClipboardCellSegments(childNode, styleMap, inheritedMarks)) {
      appendTextSegment(segments, segment);
    }
  }

  return normalizeClipboardTextSegments(segments);
}

function getHtmlTableRows(table: HTMLTableElement, styleMap: ClipboardStyleMap): ClipboardTableRow[] {
  const rows = Array.from(table.querySelectorAll("tr")).map((row) =>
    ({
      attrs: getTableRowAttrs(row, getElementStyleDeclarations(row, styleMap)),
      cells: Array.from(row.children)
        .filter((cell): cell is HTMLTableCellElement => cell instanceof HTMLTableCellElement)
        .map((cell) => {
          const styles = getElementStyleDeclarations(cell, styleMap);
          const textColor = normalizeTextColorValue(styles.get("color")) ?? DEFAULT_HTML_TABLE_TEXT_COLOR;
          const inheritedMarks = [{ type: "textStyle", attrs: { color: textColor } }];
          const attrs = getTableCellAttrs(cell, styles, DEFAULT_HTML_TABLE_CELL_BACKGROUND_COLOR);
          const segments = ensureReadableSpreadsheetSegments(
            getClipboardCellChildSegments(cell, styleMap, inheritedMarks),
            attrs?.backgroundColor,
          );

          return {
            text: normalizeClipboardCellText(getClipboardCellText(cell)),
            isHeader: cell.tagName === "TH",
            attrs,
            segments: segments.length > 0 ? segments : undefined,
            textColor,
          };
        }),
    }),
  );

  return rows.filter((row) => row.cells.length > 0);
}

function createTextMarks(cell: ClipboardTableCell) {
  return cell.textColor ? [{ type: "textStyle", attrs: { color: cell.textColor } }] : undefined;
}

function createParagraphContent(text: string, marks?: JSONContent["marks"]): JSONContent {
  return text
    ? {
        type: "paragraph",
        content: [{ type: "text", text, ...(marks ? { marks } : {}) }],
      }
    : { type: "paragraph" };
}

function createParagraphContentFromSegments(segments: ClipboardTextSegment[]): JSONContent[] {
  const paragraphs: ClipboardTextSegment[][] = [[]];

  for (const segment of segments) {
    const parts = segment.text.split("\n");

    parts.forEach((part, index) => {
      if (part) {
        paragraphs[paragraphs.length - 1].push({ text: part, marks: segment.marks });
      }

      if (index < parts.length - 1) {
        paragraphs.push([]);
      }
    });
  }

  return paragraphs.map((paragraphSegments) => {
    const content = paragraphSegments.map((segment) => ({
      type: "text",
      text: segment.text,
      ...(segment.marks ? { marks: segment.marks } : {}),
    }));

    return content.length > 0 ? { type: "paragraph", content } : { type: "paragraph" };
  });
}

function createTableCellContent(cell: ClipboardTableCell): JSONContent {
  const lines = cell.text.split("\n");
  const marks = createTextMarks(cell);
  const paragraphs =
    cell.segments && cell.segments.length > 0
      ? createParagraphContentFromSegments(cell.segments)
      : (lines.length > 0 ? lines : [""]).map((line) => createParagraphContent(line, marks));

  return {
    type: cell.isHeader ? "tableHeader" : "tableCell",
    ...(cell.attrs ? { attrs: cell.attrs } : {}),
    content: paragraphs.length > 0 ? paragraphs : [{ type: "paragraph" }],
  };
}

type PositionedTableCell = {
  startColumn: number;
  colspan: number;
  cell: ClipboardTableCell;
};

type PositionedTableRow = {
  cells: PositionedTableCell[];
  coveredColumns: boolean[];
  attrs?: ClipboardTableRow["attrs"];
};

function getRowspanLimitedCell(cell: ClipboardTableCell, remainingRowCount: number): ClipboardTableCell {
  const attrs = cell.attrs;
  if (!attrs?.rowspan || attrs.rowspan <= remainingRowCount) return cell;

  if (remainingRowCount <= 1) {
    const { rowspan: _rowspan, ...nextAttrs } = attrs;

    return {
      ...cell,
      attrs: Object.keys(nextAttrs).length > 0 ? nextAttrs : undefined,
    };
  }

  return {
    ...cell,
    attrs: {
      ...attrs,
      rowspan: remainingRowCount,
    },
  };
}

function normalizeTableRows(rows: ClipboardTableRow[]) {
  const positionedRows: PositionedTableRow[] = [];
  let rowspans: number[] = [];
  let columnCount = 0;

  rows.forEach((row, rowIndex) => {
    const coveredColumns = rowspans.map((span) => span > 0);
    const nextRowspans = rowspans.map((span) => Math.max(0, span - 1));
    const positionedCells: PositionedTableCell[] = [];
    let columnIndex = 0;

    for (const rawCell of row.cells) {
      while (coveredColumns[columnIndex]) columnIndex += 1;

      const remainingRowCount = rows.length - rowIndex;
      const cell = getRowspanLimitedCell(rawCell, remainingRowCount);
      const colspan = Math.max(1, cell.attrs?.colspan ?? 1);
      const rowspan = Math.max(1, cell.attrs?.rowspan ?? 1);

      positionedCells.push({ startColumn: columnIndex, colspan, cell });

      if (rowspan > 1) {
        for (let offset = 0; offset < colspan; offset += 1) {
          const spannedColumn = columnIndex + offset;
          nextRowspans[spannedColumn] = Math.max(nextRowspans[spannedColumn] ?? 0, rowspan - 1);
        }
      }

      columnIndex += colspan;
    }

    const lastCoveredColumn = coveredColumns.reduce((lastIndex, covered, index) => (covered ? index : lastIndex), -1);
    const lastFutureRowspanColumn = nextRowspans.reduce((lastIndex, span, index) => (span > 0 ? index : lastIndex), -1);
    columnCount = Math.max(columnCount, columnIndex, lastCoveredColumn + 1, lastFutureRowspanColumn + 1);

    positionedRows.push({
      attrs: row.attrs,
      cells: positionedCells,
      coveredColumns,
    });
    rowspans = nextRowspans;
  });

  return { positionedRows, columnCount };
}

function createNormalizedRowContent(
  row: PositionedTableRow,
  columnCount: number,
  fillerCellAttrs?: ClipboardTableCellAttrs,
) {
  const content: JSONContent[] = [];
  const cellByStartColumn = new Map(row.cells.map((cell) => [cell.startColumn, cell]));
  let columnIndex = 0;

  while (columnIndex < columnCount) {
    if (row.coveredColumns[columnIndex]) {
      columnIndex += 1;
      continue;
    }

    const positionedCell = cellByStartColumn.get(columnIndex);
    if (positionedCell) {
      content.push(createTableCellContent(positionedCell.cell));
      columnIndex += positionedCell.colspan;
      continue;
    }

    content.push(createTableCellContent({ text: "", isHeader: false, attrs: fillerCellAttrs }));
    columnIndex += 1;
  }

  return content;
}

function createTableContent(
  rows: ClipboardTableRow[],
  minColumnCount = 1,
  fillerCellAttrs?: ClipboardTableCellAttrs,
): JSONContent | null {
  const tableRows = rows.filter((row) => row.cells.length > 0);
  if (tableRows.length === 0) return null;

  const { positionedRows, columnCount } = normalizeTableRows(tableRows);
  if (columnCount < minColumnCount) return null;

  return {
    type: "table",
    content: positionedRows.map((row) => ({
      type: "tableRow",
      ...(row.attrs ? { attrs: row.attrs } : {}),
      content: createNormalizedRowContent(row, columnCount, fillerCellAttrs),
    })),
  };
}

export function getClipboardTableContent(dataTransfer: ClipboardDataLike) {
  const html = getClipboardData(dataTransfer, "text/html");
  if (!/<table(?:\s|>)/i.test(html)) return null;
  if (typeof DOMParser === "undefined") return null;

  const doc = new DOMParser().parseFromString(html, "text/html");
  const fragment = extractClipboardHtmlFragment(html);
  const fragmentDoc = new DOMParser().parseFromString(fragment, "text/html");
  const styleMap = parseClipboardCssClassStyles(doc);
  const table = fragmentDoc.querySelector("table") ?? doc.querySelector("table");
  if (!(table instanceof HTMLTableElement)) return null;

  return createTableContent(getHtmlTableRows(table, styleMap), 1, {
    backgroundColor: DEFAULT_HTML_TABLE_CELL_BACKGROUND_COLOR,
  });
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
    rows.map((row) => ({
      cells: row.map((cell) => ({ text: normalizeClipboardCellText(cell), isHeader: false })),
    })),
    2,
  );
}
