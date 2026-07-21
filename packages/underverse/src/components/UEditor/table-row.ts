import { TableRow } from "@tiptap/extension-table-row";
import { DEFAULT_TABLE_ROW_HEIGHT, MIN_TABLE_ROW_HEIGHT } from "./table-dom-utils";

function parseRowHeight(value: string | null | undefined) {
  if (!value) return null;
  const match = String(value).match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const parsed = Number.parseFloat(match[1]);
  return normalizeRowHeight(parsed);
}

function normalizeRowHeight(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.max(MIN_TABLE_ROW_HEIGHT, Math.round(value))
    : null;
}

const UEditorTableRow = TableRow.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      rowHeight: {
        default: DEFAULT_TABLE_ROW_HEIGHT,
        parseHTML: (element) => {
          if (!(element instanceof HTMLElement)) return null;
          return (
            parseRowHeight(element.getAttribute("data-row-height"))
            ?? parseRowHeight(element.style.height)
          );
        },
        renderHTML: (attributes) => {
          const rowHeight = normalizeRowHeight(attributes.rowHeight);
          if (!rowHeight) {
            return {};
          }

          return {
            "data-row-height": String(rowHeight),
            style: `height: ${rowHeight}px; min-height: ${rowHeight}px;`,
          };
        },
      },
    };
  },
});

export default UEditorTableRow;
