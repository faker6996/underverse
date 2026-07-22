import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { Plugin, type EditorState } from "@tiptap/pm/state";
import {
  Decoration,
  DecorationSet,
  type EditorView,
  type NodeView,
  type ViewMutationRecord,
} from "@tiptap/pm/view";
import {
  ResizeState,
  TableMap,
  cellAround,
  columnResizingPluginKey,
  pointsAtCell,
  tableNodeTypes,
  type ColumnResizingOptions,
} from "@tiptap/pm/tables";

export const DEFAULT_TABLE_COLUMN_WIDTH = 100;
export const MIN_RESIZED_TABLE_COLUMN_WIDTH = 25;

type DynamicColumnDragging = {
  startX: number;
  startWidth: number;
  minWidth: number;
};

export function getColumnResizeMinWidth(configuredMinWidth: number) {
  const normalizedMinWidth = Number.isFinite(configuredMinWidth) && configuredMinWidth > 0
    ? Math.round(configuredMinWidth)
    : MIN_RESIZED_TABLE_COLUMN_WIDTH;

  return Math.max(MIN_RESIZED_TABLE_COLUMN_WIDTH, normalizedMinWidth);
}

function setColumnStyle(column: HTMLTableColElement, width: number | null) {
  if (width == null) {
    column.style.width = `${DEFAULT_TABLE_COLUMN_WIDTH}px`;
    column.style.minWidth = `${DEFAULT_TABLE_COLUMN_WIDTH}px`;
    return;
  }

  column.style.width = `${Math.max(width, MIN_RESIZED_TABLE_COLUMN_WIDTH)}px`;
  column.style.minWidth = "";
}

function isTableColumnElement(node: ChildNode | null): node is HTMLTableColElement {
  return node instanceof HTMLElement && node.tagName.toLowerCase() === "col";
}

function updateDynamicColumns(
  node: ProseMirrorNode,
  colgroup: HTMLTableColElement,
  table: HTMLTableElement,
  overrideCol?: number,
  overrideValue?: number,
) {
  let totalWidth = 0;
  let nextDOM = colgroup.firstChild;
  const row = node.firstChild;

  if (row) {
    for (let rowCellIndex = 0, col = 0; rowCellIndex < row.childCount; rowCellIndex += 1) {
      const { colspan, colwidth } = row.child(rowCellIndex).attrs as { colspan: number; colwidth?: number[] | null };

      for (let spanIndex = 0; spanIndex < colspan; spanIndex += 1, col += 1) {
        const rawWidth = overrideCol === col ? overrideValue : colwidth?.[spanIndex];
        const width = rawWidth ? Math.max(rawWidth, MIN_RESIZED_TABLE_COLUMN_WIDTH) : null;
        totalWidth += width ?? DEFAULT_TABLE_COLUMN_WIDTH;

        const colElement = isTableColumnElement(nextDOM)
          ? nextDOM
          : colgroup.appendChild(document.createElement("col"));
        setColumnStyle(colElement, width);
        nextDOM = colElement.nextSibling;
      }
    }
  }

  while (nextDOM) {
    const after = nextDOM.nextSibling;
    nextDOM.parentNode?.removeChild(nextDOM);
    nextDOM = after;
  }

  const hasUserWidth = typeof node.attrs.style === "string" && /\bwidth\s*:/i.test(node.attrs.style);
  if (!hasUserWidth) {
    table.style.width = `${totalWidth}px`;
    table.style.minWidth = "";
  } else {
    table.style.minWidth = `${totalWidth}px`;
  }
}

class UEditorTableView implements NodeView {
  node: ProseMirrorNode;

  dom: HTMLDivElement;

  table: HTMLTableElement;

  colgroup: HTMLTableColElement;

  contentDOM: HTMLTableSectionElement;

  constructor(node: ProseMirrorNode) {
    this.node = node;
    this.dom = document.createElement("div");
    this.dom.className = "tableWrapper";
    this.table = this.dom.appendChild(document.createElement("table"));

    if (node.attrs.style) {
      this.table.style.cssText = node.attrs.style;
    }
    this.table.style.tableLayout = "fixed";

    this.colgroup = this.table.appendChild(document.createElement("colgroup"));
    updateDynamicColumns(node, this.colgroup, this.table);
    this.contentDOM = this.table.appendChild(document.createElement("tbody"));
  }

  update(node: ProseMirrorNode) {
    if (node.type !== this.node.type) return false;

    this.node = node;
    updateDynamicColumns(node, this.colgroup, this.table);
    return true;
  }

  ignoreMutation(mutation: ViewMutationRecord) {
    const target = mutation.target;
    const isInsideWrapper = this.dom.contains(target);
    const isInsideContent = this.contentDOM.contains(target);

    if (isInsideWrapper && !isInsideContent) {
      return mutation.type === "attributes" || mutation.type === "childList" || mutation.type === "characterData";
    }

    return false;
  }
}

function getDraggedWidth(dragging: DynamicColumnDragging, event: MouseEvent) {
  const offset = event.clientX - dragging.startX;
  return Math.max(dragging.minWidth, Math.round(dragging.startWidth + offset));
}

function getCurrentColWidth(
  view: EditorView,
  cellPos: number,
  { colspan, colwidth }: { colspan: number; colwidth?: number[] | null },
) {
  const width = colwidth?.[colwidth.length - 1];
  if (width) return width;

  const dom = view.domAtPos(cellPos);
  const cellElement = dom.node.childNodes[dom.offset];
  let domWidth = cellElement instanceof HTMLElement ? cellElement.offsetWidth : 0;
  let parts = Math.max(1, colspan);

  if (colwidth) {
    for (let index = 0; index < colspan; index += 1) {
      const partWidth = colwidth[index];
      if (partWidth) {
        domWidth -= partWidth;
        parts -= 1;
      }
    }
  }

  return domWidth / Math.max(1, parts);
}

function domCellAround(target: EventTarget | null) {
  let node = target instanceof Node ? target : null;

  while (node && node.nodeName !== "TD" && node.nodeName !== "TH") {
    const element = node instanceof Element ? node : null;
    if (element?.classList.contains("ProseMirror")) return null;
    node = node.parentNode;
  }

  return node instanceof HTMLElement ? node : null;
}

function edgeCell(view: EditorView, event: MouseEvent, side: "left" | "right", handleWidth: number) {
  const offset = side === "right" ? -handleWidth : handleWidth;
  const found = view.posAtCoords({
    left: event.clientX + offset,
    top: event.clientY,
  });
  if (!found) return -1;

  const $cell = cellAround(view.state.doc.resolve(found.pos));
  if (!$cell) return -1;
  if (side === "right") return $cell.pos;

  const map = TableMap.get($cell.node(-1));
  const start = $cell.start(-1);
  const index = map.map.indexOf($cell.pos - start);
  return index % map.width === 0 ? -1 : start + map.map[index - 1];
}

function updateHandle(view: EditorView, value: number) {
  view.dispatch(view.state.tr.setMeta(columnResizingPluginKey, { setHandle: value }));
}

function handleMouseMove(view: EditorView, event: MouseEvent, handleWidth: number, lastColumnResizable: boolean) {
  if (!view.editable) return;

  const pluginState = columnResizingPluginKey.getState(view.state);
  if (!pluginState || pluginState.dragging) return;

  const target = domCellAround(event.target);
  let cell = -1;

  if (target) {
    const { left, right } = target.getBoundingClientRect();
    if (event.clientX - left <= handleWidth) cell = edgeCell(view, event, "left", handleWidth);
    else if (right - event.clientX <= handleWidth) cell = edgeCell(view, event, "right", handleWidth);
  }

  if (cell === pluginState.activeHandle) return;

  if (!lastColumnResizable && cell !== -1) {
    const $cell = view.state.doc.resolve(cell);
    const table = $cell.node(-1);
    const map = TableMap.get(table);
    const tableStart = $cell.start(-1);
    const nodeAfter = $cell.nodeAfter;
    if (!nodeAfter) return;

    if (map.colCount($cell.pos - tableStart) + nodeAfter.attrs.colspan - 1 === map.width - 1) return;
  }

  updateHandle(view, cell);
}

function handleMouseLeave(view: EditorView) {
  if (!view.editable) return;

  const pluginState = columnResizingPluginKey.getState(view.state);
  if (pluginState && pluginState.activeHandle > -1 && !pluginState.dragging) {
    updateHandle(view, -1);
  }
}

function updateColumnWidth(view: EditorView, cell: number, width: number) {
  const $cell = view.state.doc.resolve(cell);
  const table = $cell.node(-1);
  const map = TableMap.get(table);
  const start = $cell.start(-1);
  const nodeAfter = $cell.nodeAfter;
  if (!nodeAfter) return;

  const col = map.colCount($cell.pos - start) + nodeAfter.attrs.colspan - 1;
  const tr = view.state.tr;

  for (let row = 0; row < map.height; row += 1) {
    const mapIndex = row * map.width + col;
    if (row && map.map[mapIndex] === map.map[mapIndex - map.width]) continue;

    const pos = map.map[mapIndex];
    const cellNode = table.nodeAt(pos);
    if (!cellNode) continue;

    const attrs = cellNode.attrs;
    const index = attrs.colspan === 1 ? 0 : col - map.colCount(pos);
    if (attrs.colwidth?.[index] === width) continue;

    const colwidth = attrs.colwidth ? attrs.colwidth.slice() : Array.from({ length: attrs.colspan }, () => 0);
    colwidth[index] = width;
    tr.setNodeMarkup(start + pos, null, {
      ...attrs,
      colwidth,
    });
  }

  if (tr.docChanged) view.dispatch(tr);
}

function getActiveDragging(state: EditorState): DynamicColumnDragging | null {
  const dragging = columnResizingPluginKey.getState(state)?.dragging;
  return dragging ? (dragging as DynamicColumnDragging) : null;
}

function getColumnResizeGhost(view: EditorView) {
  const doc = view.dom.ownerDocument;
  let ghost = doc.querySelector<HTMLDivElement>("[data-ueditor-column-resize-ghost]");
  if (!ghost) {
    ghost = doc.createElement("div");
    ghost.setAttribute("data-ueditor-column-resize-ghost", "");
    ghost.style.position = "fixed";
    ghost.style.zIndex = "99999";
    ghost.style.pointerEvents = "none";
    ghost.style.width = "2px";
    ghost.style.backgroundColor = "var(--primary, #2563eb)";
    ghost.style.opacity = "1";
    ghost.style.borderRadius = "9999px";
    ghost.style.boxShadow = "0 0 0 1px color-mix(in oklch, var(--background, #fff) 80%, transparent)";
    ghost.style.transform = "translateX(-1px)";
    ghost.style.willChange = "left";
    doc.body.appendChild(ghost);
  }

  return ghost;
}

function hideColumnResizeGhost(view: EditorView) {
  view.dom.ownerDocument.querySelector("[data-ueditor-column-resize-ghost]")?.remove();
}

function getTableElementAtCell(view: EditorView, cell: number) {
  const $cell = view.state.doc.resolve(cell);
  let dom: Node | null = view.domAtPos($cell.start(-1)).node;
  while (dom && dom.nodeName !== "TABLE") dom = dom.parentNode;
  return dom instanceof HTMLTableElement ? dom : null;
}

function showColumnResizeGhost(view: EditorView, cell: number, dragging: DynamicColumnDragging, width: number) {
  const table = getTableElementAtCell(view, cell);
  if (!table) return;

  const rect = table.getBoundingClientRect();
  const left = dragging.startX + width - dragging.startWidth;
  const ghost = getColumnResizeGhost(view);
  ghost.style.left = `${left}px`;
  ghost.style.top = `${rect.top}px`;
  ghost.style.height = `${rect.height}px`;
}

function handleMouseDown(
  view: EditorView,
  event: MouseEvent,
  cellMinWidth: number,
) {
  if (!view.editable) return false;

  const win = view.dom.ownerDocument.defaultView ?? window;
  const pluginState = columnResizingPluginKey.getState(view.state);
  if (!pluginState || pluginState.activeHandle === -1 || pluginState.dragging) return false;

  const cell = view.state.doc.nodeAt(pluginState.activeHandle);
  if (!cell) return false;

  const attrs = cell.attrs as { colspan?: number; colwidth?: number[] | null };
  const width = getCurrentColWidth(view, pluginState.activeHandle, {
    colspan: attrs.colspan ?? 1,
    colwidth: attrs.colwidth,
  });
  const minWidth = getColumnResizeMinWidth(cellMinWidth);
  const dragging: DynamicColumnDragging = {
    startX: event.clientX,
    startWidth: width,
    minWidth,
  };

  view.dispatch(view.state.tr.setMeta(columnResizingPluginKey, { setDragging: dragging }));

  function finish(nextEvent: MouseEvent) {
    win.removeEventListener("mouseup", finish);
    win.removeEventListener("mousemove", move);

    const activeDragging = getActiveDragging(view.state);
    const activeHandle = columnResizingPluginKey.getState(view.state)?.activeHandle ?? -1;
    if (activeDragging && activeHandle > -1) {
      updateColumnWidth(view, activeHandle, getDraggedWidth(activeDragging, nextEvent));
      view.dispatch(view.state.tr.setMeta(columnResizingPluginKey, { setDragging: null }));
    }
    hideColumnResizeGhost(view);
  }

  function move(nextEvent: MouseEvent) {
    if (!nextEvent.buttons) return finish(nextEvent);

    const activeDragging = getActiveDragging(view.state);
    const activeHandle = columnResizingPluginKey.getState(view.state)?.activeHandle ?? -1;
    if (activeDragging && activeHandle > -1) {
      showColumnResizeGhost(view, activeHandle, activeDragging, getDraggedWidth(activeDragging, nextEvent));
    }
  }

  showColumnResizeGhost(view, pluginState.activeHandle, dragging, width);
  win.addEventListener("mouseup", finish);
  win.addEventListener("mousemove", move);
  event.preventDefault();
  return true;
}

function handleDecorations(state: EditorState, cell: number) {
  const decorations = [];
  const $cell = state.doc.resolve(cell);
  const table = $cell.node(-1);
  if (!table) return DecorationSet.empty;

  const map = TableMap.get(table);
  const start = $cell.start(-1);
  const nodeAfter = $cell.nodeAfter;
  if (!nodeAfter) return DecorationSet.empty;

  const col = map.colCount($cell.pos - start) + nodeAfter.attrs.colspan - 1;
  for (let row = 0; row < map.height; row += 1) {
    const index = col + row * map.width;
    if (
      (col === map.width - 1 || map.map[index] !== map.map[index + 1])
      && (row === 0 || map.map[index] !== map.map[index - map.width])
    ) {
      const cellPos = map.map[index];
      const cellNode = table.nodeAt(cellPos);
      if (!cellNode) continue;

      const pos = start + cellPos + cellNode.nodeSize - 1;
      const dom = document.createElement("div");
      dom.className = "column-resize-handle";

      if (columnResizingPluginKey.getState(state)?.dragging) {
        decorations.push(Decoration.node(start + cellPos, start + cellPos + cellNode.nodeSize, { class: "column-resize-dragging" }));
      }

      decorations.push(Decoration.widget(pos, dom));
    }
  }

  return DecorationSet.create(state.doc, decorations);
}

export function dynamicColumnResizing({
  handleWidth = 5,
  cellMinWidth = MIN_RESIZED_TABLE_COLUMN_WIDTH,
  defaultCellMinWidth = DEFAULT_TABLE_COLUMN_WIDTH,
  View = UEditorTableView,
  lastColumnResizable = true,
}: ColumnResizingOptions = {}) {
  const plugin = new Plugin({
    key: columnResizingPluginKey,
    state: {
      init(_, state) {
        const nodeViews = plugin.spec.props?.nodeViews as Record<string, (node: ProseMirrorNode, view: EditorView) => NodeView> | undefined;
        const tableName = tableNodeTypes(state.schema).table.name;
        if (View && nodeViews) {
          nodeViews[tableName] = (node, view) => new View(node, defaultCellMinWidth, view);
        }
        return new ResizeState(-1, false);
      },
      apply(tr, prev: ResizeState) {
        return prev.apply(tr);
      },
    },
    props: {
      attributes: (state): Record<string, string> => {
        const pluginState = columnResizingPluginKey.getState(state);
        return pluginState && pluginState.activeHandle > -1 ? { class: "resize-cursor" } : {};
      },
      handleDOMEvents: {
        mousemove: (view, event) => {
          handleMouseMove(view, event as MouseEvent, handleWidth, lastColumnResizable);
        },
        mouseleave: (view) => {
          handleMouseLeave(view);
        },
        mousedown: (view, event) => handleMouseDown(view, event as MouseEvent, cellMinWidth),
      },
      decorations: (state) => {
        const pluginState = columnResizingPluginKey.getState(state);
        if (pluginState && pluginState.activeHandle > -1) {
          return handleDecorations(state, pluginState.activeHandle);
        }
        return undefined;
      },
      nodeViews: {},
    },
  });

  return plugin;
}
