import TableRow from "@tiptap/extension-table-row";

function parseRowHeight(value: string | null | undefined) {
  if (!value) return null;
  const match = String(value).match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const parsed = Number.parseFloat(match[1]);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : null;
}

const UEditorTableRow = TableRow.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      rowHeight: {
        default: null,
        parseHTML: (element) => {
          if (!(element instanceof HTMLElement)) return null;
          return (
            parseRowHeight(element.getAttribute("data-row-height"))
            ?? parseRowHeight(element.style.height)
          );
        },
        renderHTML: (attributes) => {
          if (!attributes.rowHeight || typeof attributes.rowHeight !== "number") {
            return {};
          }

          return {
            "data-row-height": String(attributes.rowHeight),
            style: `height: ${attributes.rowHeight}px;`,
          };
        },
      },
    };
  },
});

export default UEditorTableRow;
