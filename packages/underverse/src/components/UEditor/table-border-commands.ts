import type { Editor } from "@tiptap/core";
import { selectedRect } from "@tiptap/pm/tables";

export type TableBorderPosition = "all" | "outer" | "inner" | "horizontal" | "vertical" | "top" | "right" | "bottom" | "left";

export interface TableBorderFormat {
  color: string;
  style: "solid" | "dashed" | "dotted" | "double" | "none";
  width: string;
}

type BorderSide = "top" | "right" | "bottom" | "left";
type BorderQuad = Record<BorderSide, string>;

const SIDES: BorderSide[] = ["top", "right", "bottom", "left"];
const OPPOSITE_SIDE: Record<BorderSide, BorderSide> = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right",
};

function splitCssValues(value: string) {
  const values: string[] = [];
  let token = "";
  let parentheses = 0;

  for (const character of value.trim()) {
    if (/\s/.test(character) && parentheses === 0) {
      if (token) values.push(token);
      token = "";
      continue;
    }
    if (character === "(") parentheses += 1;
    if (character === ")") parentheses = Math.max(0, parentheses - 1);
    token += character;
  }
  if (token) values.push(token);
  return values;
}

function expandCssQuad(value: unknown, fallback: string): BorderQuad {
  const values = typeof value === "string" ? splitCssValues(value) : [];
  const [top = fallback, right = top, bottom = top, left = right] = values;
  return { top, right, bottom, left };
}

function serializeCssQuad({ top, right, bottom, left }: BorderQuad) {
  if (top === right && top === bottom && top === left) return top;
  if (top === bottom && right === left) return `${top} ${right}`;
  if (right === left) return `${top} ${right} ${bottom}`;
  return `${top} ${right} ${bottom} ${left}`;
}

function getAppliedSides(
  position: TableBorderPosition,
  cell: { top: number; right: number; bottom: number; left: number },
  selection: { top: number; right: number; bottom: number; left: number },
) {
  const outer = {
    top: cell.top === selection.top,
    right: cell.right === selection.right,
    bottom: cell.bottom === selection.bottom,
    left: cell.left === selection.left,
  };
  const inner = {
    top: cell.top > selection.top,
    right: cell.right < selection.right,
    bottom: cell.bottom < selection.bottom,
    left: cell.left > selection.left,
  };

  switch (position) {
    case "all":
      return { top: true, right: true, bottom: true, left: true };
    case "outer":
      return outer;
    case "inner":
      return inner;
    case "horizontal":
      return { top: inner.top, right: false, bottom: inner.bottom, left: false };
    case "vertical":
      return { top: false, right: inner.right, bottom: false, left: inner.left };
    default:
      return {
        top: position === "top" && outer.top,
        right: position === "right" && outer.right,
        bottom: position === "bottom" && outer.bottom,
        left: position === "left" && outer.left,
      };
  }
}

export function applyTableCellBorders(editor: Editor, position: TableBorderPosition, format: TableBorderFormat, options: { focus?: boolean } = {}) {
  const { state, view } = editor;
  const selection = selectedRect(state);
  const transaction = state.tr;
  const cellPositions = new Set(selection.map.cellsInRect(selection));
  const sidesByCell = new Map<number, Set<BorderSide>>();

  const addSide = (cellPos: number, side: BorderSide) => {
    const sides = sidesByCell.get(cellPos) ?? new Set<BorderSide>();
    sides.add(side);
    sidesByCell.set(cellPos, sides);
  };

  const addAdjacentSides = (
    cell: { top: number; right: number; bottom: number; left: number },
    side: BorderSide,
  ) => {
    const adjacentPositions = new Set<number>();
    if (side === "top" && cell.top > 0) {
      for (let col = cell.left; col < cell.right; col += 1) adjacentPositions.add(selection.map.map[(cell.top - 1) * selection.map.width + col]);
    } else if (side === "bottom" && cell.bottom < selection.map.height) {
      for (let col = cell.left; col < cell.right; col += 1) adjacentPositions.add(selection.map.map[cell.bottom * selection.map.width + col]);
    } else if (side === "left" && cell.left > 0) {
      for (let row = cell.top; row < cell.bottom; row += 1) adjacentPositions.add(selection.map.map[row * selection.map.width + cell.left - 1]);
    } else if (side === "right" && cell.right < selection.map.width) {
      for (let row = cell.top; row < cell.bottom; row += 1) adjacentPositions.add(selection.map.map[row * selection.map.width + cell.right]);
    }

    for (const adjacentPos of adjacentPositions) addSide(adjacentPos, OPPOSITE_SIDE[side]);
  };

  for (const relativePos of cellPositions) {
    const cell = selection.map.findCell(relativePos);
    const appliedSides = getAppliedSides(position, cell, selection);
    for (const side of SIDES) {
      if (!appliedSides[side]) continue;
      addSide(relativePos, side);
      addAdjacentSides(cell, side);
    }
  }

  for (const [relativePos, appliedSides] of sidesByCell) {
    const absolutePos = selection.tableStart + relativePos;
    const node = state.doc.nodeAt(absolutePos);
    if (!node) continue;

    const styles = expandCssQuad(node.attrs.borderStyle, "solid");
    const widths = expandCssQuad(node.attrs.borderWidth, "1px");
    const colors = expandCssQuad(node.attrs.borderColor, "#000000");

    for (const side of SIDES) {
      if (!appliedSides.has(side)) continue;
      styles[side] = format.style;
      widths[side] = format.width;
      colors[side] = format.color || "currentColor";
    }

    transaction.setNodeMarkup(absolutePos, undefined, {
      ...node.attrs,
      borderStyle: serializeCssQuad(styles),
      borderWidth: serializeCssQuad(widths),
      borderColor: serializeCssQuad(colors),
    });
  }

  if (transaction.docChanged) view.dispatch(transaction);
  if (options.focus ?? true) view.focus();
  return transaction.docChanged;
}
