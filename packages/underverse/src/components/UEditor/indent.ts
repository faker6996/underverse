import { Extension } from "@tiptap/core";
import type { EditorState } from "@tiptap/pm/state";
import type { Node as ProseMirrorNode, ResolvedPos } from "@tiptap/pm/model";
import { isInTable } from "@tiptap/pm/tables";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    indent: {
      increaseIndent: () => ReturnType;
      decreaseIndent: () => ReturnType;
    };
  }
}

type IndentOptions = {
  maxLevel: number;
  minLevel: number;
  stepRem: number;
  types: string[];
};

type IndentTarget = {
  node: ProseMirrorNode;
  pos: number;
};

const DEFAULT_MAX_LEVEL = 6;
const DEFAULT_MIN_LEVEL = 0;
const DEFAULT_STEP_REM = 2;
const INLINE_TAB_SPACES = "\u00a0".repeat(4);
const LIST_ITEM_TYPES = new Set(["listItem", "taskItem"]);
const TABLE_CELL_TYPES = new Set(["tableCell", "tableHeader"]);

function clampIndentLevel(value: unknown, minLevel: number, maxLevel: number) {
  const numericValue = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(numericValue)) return minLevel;
  return Math.min(maxLevel, Math.max(minLevel, Math.round(numericValue)));
}

function parseIndentLevel(element: HTMLElement, options: IndentOptions) {
  const dataIndent = element.getAttribute("data-indent");
  if (dataIndent !== null) {
    return clampIndentLevel(dataIndent, options.minLevel, options.maxLevel);
  }

  const marginLeft = element.style.marginLeft.trim();
  const match = marginLeft.match(/^(-?\d+(?:\.\d+)?)(rem|em|px)$/i);
  if (!match) return options.minLevel;

  const value = Number.parseFloat(match[1] ?? "0");
  const unit = match[2]?.toLowerCase();
  const remValue = unit === "px" ? value / 16 : value;
  return clampIndentLevel(remValue / options.stepRem, options.minLevel, options.maxLevel);
}

function getNodePos($pos: ResolvedPos, depth: number) {
  return depth > 0 ? $pos.before(depth) : 0;
}

function getIndentTargetAt($pos: ResolvedPos, indentTypes: Set<string>): IndentTarget | null {
  for (let depth = $pos.depth; depth > 0; depth -= 1) {
    const nodeName = $pos.node(depth).type.name;
    if (LIST_ITEM_TYPES.has(nodeName) || TABLE_CELL_TYPES.has(nodeName)) return null;
  }

  // A blockquote is the visual block that should move. Indenting its inner
  // paragraph would move only the text and leave the quote border behind.
  if (indentTypes.has("blockquote")) {
    for (let depth = $pos.depth; depth > 0; depth -= 1) {
      const node = $pos.node(depth);
      if (node.type.name === "blockquote") {
        return { node, pos: getNodePos($pos, depth) };
      }
    }
  }

  for (let depth = $pos.depth; depth > 0; depth -= 1) {
    const node = $pos.node(depth);
    if (indentTypes.has(node.type.name)) {
      return { node, pos: getNodePos($pos, depth) };
    }
  }

  return null;
}

function getIndentTargets(state: EditorState, types: string[]) {
  if (isInTable(state)) return [];

  const indentTypes = new Set(types);
  const targets = new Map<number, IndentTarget>();
  const addTarget = (target: IndentTarget | null) => {
    if (target) targets.set(target.pos, target);
  };

  addTarget(getIndentTargetAt(state.selection.$from, indentTypes));
  addTarget(getIndentTargetAt(state.selection.$to, indentTypes));

  if (!state.selection.empty) {
    state.doc.nodesBetween(state.selection.from, state.selection.to, (node, pos) => {
      if (!indentTypes.has(node.type.name)) return true;

      const resolvedPos = state.doc.resolve(Math.min(pos + 1, state.doc.content.size));
      addTarget(getIndentTargetAt(resolvedPos, indentTypes));
      return node.type.name !== "blockquote";
    });
  }

  return Array.from(targets.values()).sort((a, b) => a.pos - b.pos);
}

function updateBlockIndent({
  state,
  dispatch,
  options,
  delta,
}: {
  state: EditorState;
  dispatch: ((transaction: EditorState["tr"]) => void) | undefined;
  options: IndentOptions;
  delta: -1 | 1;
}) {
  const targets = getIndentTargets(state, options.types);
  let transaction = state.tr;
  let changed = false;

  for (const target of targets) {
    const currentLevel = clampIndentLevel(target.node.attrs.indent, options.minLevel, options.maxLevel);
    const nextLevel = clampIndentLevel(currentLevel + delta, options.minLevel, options.maxLevel);
    if (nextLevel === currentLevel) continue;

    transaction = transaction.setNodeMarkup(target.pos, undefined, {
      ...target.node.attrs,
      indent: nextLevel,
    });
    changed = true;
  }

  if (changed && dispatch) dispatch(transaction.scrollIntoView());
  return changed;
}

function insertTabAtCursor(state: EditorState, dispatch?: (transaction: EditorState["tr"]) => void) {
  if (!state.selection.empty) return false;

  if (dispatch) {
    dispatch(state.tr.insertText(INLINE_TAB_SPACES, state.selection.from).scrollIntoView());
  }

  return true;
}

function removeTabBeforeCursor(state: EditorState, dispatch?: (transaction: EditorState["tr"]) => void) {
  if (!state.selection.empty || state.selection.$from.parentOffset <= 0) return false;

  const cursorPos = state.selection.from;
  const tabStartPos = cursorPos - INLINE_TAB_SPACES.length;
  if (tabStartPos < 0 || state.doc.textBetween(tabStartPos, cursorPos) !== INLINE_TAB_SPACES) return false;

  if (dispatch) {
    dispatch(state.tr.delete(tabStartPos, cursorPos).scrollIntoView());
  }

  return true;
}

const Indent = Extension.create<IndentOptions>({
  name: "indent",

  addOptions() {
    return {
      maxLevel: DEFAULT_MAX_LEVEL,
      minLevel: DEFAULT_MIN_LEVEL,
      stepRem: DEFAULT_STEP_REM,
      types: ["paragraph", "blockquote"],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: this.options.minLevel,
            parseHTML: (element: HTMLElement) => parseIndentLevel(element, this.options),
            renderHTML: (attributes: Record<string, unknown>) => {
              const level = clampIndentLevel(attributes.indent, this.options.minLevel, this.options.maxLevel);
              if (level <= this.options.minLevel) return {};

              return {
                "data-indent": String(level),
                style: `margin-left: ${level * this.options.stepRem}rem`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      increaseIndent:
        () =>
        ({ editor, commands, state, dispatch }) => {
          if (editor.isActive("taskItem")) return commands.sinkListItem("taskItem");
          if (editor.isActive("listItem")) return commands.sinkListItem("listItem");

          return updateBlockIndent({
            state,
            dispatch,
            options: this.options,
            delta: 1,
          });
        },
      decreaseIndent:
        () =>
        ({ editor, commands, state, dispatch }) => {
          if (editor.isActive("taskItem")) return commands.liftListItem("taskItem");
          if (editor.isActive("listItem")) return commands.liftListItem("listItem");

          return updateBlockIndent({
            state,
            dispatch,
            options: this.options,
            delta: -1,
          });
        },
    };
  },

  addKeyboardShortcuts() {
    const handleBlockIndent = (delta: -1 | 1) => {
      const { state } = this.editor;
      const hasBlockTarget = getIndentTargets(state, this.options.types).length > 0;
      if (!hasBlockTarget) {
        return delta > 0
          ? this.editor.commands.increaseIndent()
          : this.editor.commands.decreaseIndent();
      }

      // A collapsed cursor inside text behaves like a word processor: Tab is
      // inserted at the caret instead of shifting the entire paragraph. Block
      // indentation remains available at the start of a block and for ranges.
      if (state.selection.empty && state.selection.$from.parentOffset > 0) {
        if (delta > 0) {
          return insertTabAtCursor(state, (transaction) => this.editor.view.dispatch(transaction));
        }

        removeTabBeforeCursor(state, (transaction) => this.editor.view.dispatch(transaction));
        // Keep focus in the editor when there is no preceding tab to remove.
        return true;
      }

      if (delta > 0) {
        this.editor.commands.increaseIndent();
      } else {
        this.editor.commands.decreaseIndent();
      }

      // Keep focus inside the editor even at the min/max boundary.
      return true;
    };

    return {
      Tab: () => handleBlockIndent(1),
      "Shift-Tab": () => handleBlockIndent(-1),
    };
  },
});

export default Indent;
