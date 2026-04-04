import { Table } from "@tiptap/extension-table";
import { findTableNodeInfoFromState } from "./table-align-utils";

export type UEditorTableAlign = "left" | "center" | "right";

function normalizeTableAlign(value: unknown): UEditorTableAlign | null {
  if (value === "left" || value === "center" || value === "right") {
    return value;
  }

  return null;
}

function parseTableAlign(element: HTMLElement) {
  const dataAlign = normalizeTableAlign(element.getAttribute("data-table-align"));
  if (dataAlign) return dataAlign;

  const marginLeft = element.style.marginLeft?.trim();
  const marginRight = element.style.marginRight?.trim();

  if (marginLeft === "auto" && marginRight === "auto") return "center";
  if (marginLeft === "auto" && (marginRight === "0px" || marginRight === "0")) return "right";
  if ((marginLeft === "0px" || marginLeft === "0") && marginRight === "auto") return "left";

  return null;
}

function renderTableAlignStyle(tableAlign: UEditorTableAlign) {
  switch (tableAlign) {
    case "center":
      return "width: max-content; max-width: 100%; margin-left: auto; margin-right: auto;";
    case "right":
      return "width: max-content; max-width: 100%; margin-left: auto; margin-right: 0;";
    case "left":
      return "width: max-content; max-width: 100%; margin-left: 0; margin-right: auto;";
    default:
      return "";
  }
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    tableAlign: {
      setTableAlign: (tableAlign: UEditorTableAlign) => ReturnType;
      unsetTableAlign: () => ReturnType;
    };
  }
}

const UEditorTable = Table.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      tableAlign: {
        default: null,
        parseHTML: (element) => {
          if (!(element instanceof HTMLElement)) return null;
          return parseTableAlign(element);
        },
        renderHTML: (attributes) => {
          const tableAlign = normalizeTableAlign(attributes.tableAlign);
          if (!tableAlign) return {};

          return {
            "data-table-align": tableAlign,
            style: renderTableAlignStyle(tableAlign),
          };
        },
      },
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setTableAlign:
        (tableAlign: UEditorTableAlign) =>
        ({ state, dispatch }) => {
          const tableInfo = findTableNodeInfoFromState(state);
          if (!tableInfo) return false;

          dispatch?.(
            state.tr.setNodeMarkup(tableInfo.pos, tableInfo.node.type, {
              ...tableInfo.node.attrs,
              tableAlign,
            }),
          );

          return true;
        },
      unsetTableAlign:
        () =>
        ({ state, dispatch }) => {
          const tableInfo = findTableNodeInfoFromState(state);
          if (!tableInfo) return false;

          dispatch?.(
            state.tr.setNodeMarkup(tableInfo.pos, tableInfo.node.type, {
              ...tableInfo.node.attrs,
              tableAlign: null,
            }),
          );

          return true;
        },
    };
  },
});

export default UEditorTable;
