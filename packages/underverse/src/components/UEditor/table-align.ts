import { mergeAttributes } from "@tiptap/core";
import { Table } from "@tiptap/extension-table";
import type { DOMOutputSpec, Node as ProseMirrorNode } from "@tiptap/pm/model";
import { Plugin } from "@tiptap/pm/state";
import { tableEditing } from "@tiptap/pm/tables";
import {
  DEFAULT_TABLE_COLUMN_WIDTH,
  MIN_RESIZED_TABLE_COLUMN_WIDTH,
  dynamicColumnResizing,
} from "./table-column-resize";
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
      return "table-layout: fixed; margin-left: auto; margin-right: auto;";
    case "right":
      return "table-layout: fixed; margin-left: auto; margin-right: 0;";
    case "left":
      return "table-layout: fixed; margin-left: 0; margin-right: auto;";
    default:
      return "";
  }
}

function createUEditorColGroup(node: ProseMirrorNode) {
  const columns: DOMOutputSpec[] = [];
  let totalWidth = 0;
  const firstRow = node.firstChild;

  if (firstRow) {
    for (let cellIndex = 0; cellIndex < firstRow.childCount; cellIndex += 1) {
      const cell = firstRow.child(cellIndex);
      const colspan = Math.max(1, Number(cell.attrs.colspan) || 1);
      const colwidth = Array.isArray(cell.attrs.colwidth) ? cell.attrs.colwidth : [];

      for (let spanIndex = 0; spanIndex < colspan; spanIndex += 1) {
        const storedWidth = Number(colwidth[spanIndex]);
        const width = Number.isFinite(storedWidth) && storedWidth > 0
          ? Math.max(MIN_RESIZED_TABLE_COLUMN_WIDTH, Math.round(storedWidth))
          : DEFAULT_TABLE_COLUMN_WIDTH;
        totalWidth += width;
        columns.push(["col", { style: `width: ${width}px; min-width: ${width}px;`, width: String(width) }]);
      }
    }
  }

  return {
    colgroup: ["colgroup", {}, ...columns] as DOMOutputSpec,
    tableWidth: totalWidth > 0 ? `${totalWidth}px` : "",
  };
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
  addGlobalAttributes() {
    return [
      ...(this.parent?.() ?? []),
      {
        types: ["table"],
        attributes: {
          textAlign: {
            default: null,
            parseHTML: (element) => {
              if (!(element instanceof HTMLElement)) return null;
              return parseTableAlign(element);
            },
            renderHTML: (attributes) => {
              const tableAlign = normalizeTableAlign(attributes.textAlign);
              if (!tableAlign) return {};

              return {
                "data-table-align": tableAlign,
                style: renderTableAlignStyle(tableAlign),
              };
            },
          },
        },
      },
    ];
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
              textAlign: tableAlign,
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
              textAlign: null,
            }),
          );

          return true;
        },
    };
  },

  renderHTML({ node, HTMLAttributes }) {
    const { colgroup, tableWidth } = createUEditorColGroup(node);
    const table: DOMOutputSpec = [
      "table",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        style: tableWidth ? `width: ${tableWidth};` : "table-layout: fixed;",
      }),
      colgroup,
      ["tbody", 0],
    ];

    return this.options.renderWrapper
      ? ["div", { class: "tableWrapper" }, table] as DOMOutputSpec
      : table;
  },

  addProseMirrorPlugins() {
    const isResizable = this.options.resizable && this.editor.isEditable;

    return [
      ...(isResizable
        ? [
            dynamicColumnResizing({
              handleWidth: this.options.handleWidth,
              cellMinWidth: this.options.cellMinWidth,
              defaultCellMinWidth: DEFAULT_TABLE_COLUMN_WIDTH,
              lastColumnResizable: this.options.lastColumnResizable,
            }),
          ]
        : []),
      tableEditing({
        allowTableNodeSelection: this.options.allowTableNodeSelection,
      }),
      new Plugin({
        appendTransaction(_transactions, _oldState, newState) {
          const { doc, schema } = newState;
          const paragraphType = schema.nodes.paragraph;
          if (!paragraphType) return null;

          const needsLeading = doc.firstChild?.type.name === "table";
          const needsTrailing = doc.lastChild?.type.name === "table";

          if (!needsLeading && !needsTrailing) return null;

          const tr = newState.tr;
          if (needsTrailing) tr.insert(doc.content.size, paragraphType.create());
          // Insert at 0 after trailing so positions don't shift
          if (needsLeading) tr.insert(0, paragraphType.create());
          return tr;
        },
      }),
    ];
  },
});

export default UEditorTable;
