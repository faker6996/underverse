import path from "node:path";
import { performance } from "node:perf_hooks";

import React from "../tests/helpers/workspace-react.mjs";
import { cleanup, render, waitFor } from "@testing-library/react";
import { Node as ProseMirrorNode } from "@tiptap/pm/model";

import { importTsModule } from "../tests/helpers/import-ts-module.mjs";
import { installJSDOM } from "../tests/helpers/setup-jsdom.mjs";

const restoreDom = installJSDOM();
const componentsRoot = path.resolve(import.meta.dirname, "../src/components");
const originalDescendants = ProseMirrorNode.prototype.descendants;
const traceDescendants = process.env.UEDITOR_BENCH_TRACE === "1";
let descendantCalls = 0;
let descendantVisits = 0;
let descendantStacks = new Map();

ProseMirrorNode.prototype.descendants = function instrumentedDescendants(callback) {
  descendantCalls += 1;
  if (traceDescendants) {
    const stack = new Error().stack
      ?.split("\n")
      .slice(2, 7)
      .map((line) => line.trim())
      .join("\n") ?? "unknown";
    descendantStacks.set(stack, (descendantStacks.get(stack) ?? 0) + 1);
  }
  return originalDescendants.call(this, (node, pos, parent, index) => {
    descendantVisits += 1;
    return callback(node, pos, parent, index);
  });
};

function percentile(samples, percentage) {
  const sorted = [...samples].sort((left, right) => left - right);
  const index = Math.min(sorted.length - 1, Math.floor(sorted.length * percentage));
  return sorted[index] ?? 0;
}

function findTextPosition(editor, text) {
  let found = null;

  editor.state.doc.descendants((node, pos) => {
    if (found != null) return false;
    if (!node.isText) return true;

    const index = node.text?.indexOf(text) ?? -1;
    if (index >= 0) {
      found = pos + index;
      return false;
    }

    return true;
  });

  if (found == null) throw new Error(`Could not find benchmark text: ${text}`);
  return found;
}

function buildLargeDocument(paragraphCount) {
  return Array.from(
    { length: paragraphCount },
    (_, index) => `<p>Paragraph ${index + 1}: benchmark content for transaction and decoration work.</p>`,
  ).join("");
}

function buildFormulaTable(rowCount, columnCount) {
  const rows = Array.from({ length: rowCount }, (_, rowIndex) => {
    const cells = Array.from({ length: columnCount }, (_, columnIndex) => {
      const sourceValue = 100_000 + rowIndex + 1;
      if (columnIndex === 0) return `<td>${sourceValue}</td>`;
      if (columnIndex === 1) {
        return `<td data-formula="=A${rowIndex + 1}*2" data-computed-value="${sourceValue * 2}">${sourceValue * 2}</td>`;
      }
      return `<td>R${rowIndex + 1}C${columnIndex + 1}</td>`;
    }).join("");

    return `<tr>${cells}</tr>`;
  }).join("");

  return `<p>Outside table benchmark</p><table><tbody>${rows}</tbody></table>`;
}

async function flushEditorWork() {
  await Promise.resolve();
  await Promise.resolve();
}

async function runScenario(UEditor, {
  content,
  editCount,
  formulaProbe,
  insertText = "x",
  name,
  replaceSelectedCellValues,
  selectText,
  showBubbleMenu = false,
  showCharacterCount = false,
  showMenuBar = false,
  showToolbar = false,
}) {
  globalThis.gc?.();
  const ref = React.createRef();
  let reactCommitCount = 0;
  let reactRenderDurationMs = 0;
  const mountStartedAt = performance.now();
  render(
    React.createElement(
      React.Profiler,
      {
        id: `ueditor-benchmark-${name}`,
        onRender: (_id, phase, actualDuration) => {
          if (phase !== "update") return;
          reactCommitCount += 1;
          reactRenderDurationMs += actualDuration;
        },
      },
      React.createElement(UEditor, {
        ref,
        content,
        showToolbar,
        showBubbleMenu,
        showFloatingMenu: false,
        showCharacterCount,
        showFooter: false,
        showMenuBar,
      }),
    ),
  );

  await waitFor(() => {
    if (!ref.current?.editor) throw new Error("Editor is not ready");
  }, { timeout: 30_000 });
  await flushEditorWork();

  const mountMs = performance.now() - mountStartedAt;
  const editor = ref.current.editor;
  let formulaRecalculationTransactions = 0;
  let updateEvents = 0;
  const trackFormulaRecalculation = ({ appendedTransactions, transaction }) => {
    formulaRecalculationTransactions += [transaction, ...appendedTransactions]
      .filter((candidate) => candidate.getMeta("ueditorTableFormulaRecalculate"))
      .length;
  };
  const trackUpdate = () => {
    updateEvents += 1;
  };
  editor.on("transaction", trackFormulaRecalculation);
  editor.on("update", trackUpdate);
  editor.commands.setTextSelection(findTextPosition(editor, selectText) + selectText.length);
  let selectedCellPos = null;
  for (let depth = editor.state.selection.$from.depth; depth > 0; depth -= 1) {
    const node = editor.state.selection.$from.node(depth);
    if (node.type.name !== "tableCell" && node.type.name !== "tableHeader") continue;
    selectedCellPos = editor.state.selection.$from.before(depth);
    break;
  }
  const performEdit = (index) => {
    if (replaceSelectedCellValues && selectedCellPos != null) {
      const cell = editor.state.doc.nodeAt(selectedCellPos);
      if (!cell) throw new Error("Benchmark source cell was removed");
      const from = selectedCellPos + 2;
      editor.commands.setTextSelection({ from, to: from + cell.textContent.length });
      editor.commands.insertContent(replaceSelectedCellValues[index % replaceSelectedCellValues.length]);
      return;
    }

    editor.commands.insertContent(insertText);
  };
  const getFormulaProbeValue = () => {
    if (!formulaProbe) return null;
    const cell = Array.from(editor.view.dom.querySelectorAll("th,td"))
      .find((candidate) => candidate.getAttribute("data-formula") === formulaProbe);
    return cell?.getAttribute("data-computed-value") ?? null;
  };
  const initialFormulaProbeValue = getFormulaProbeValue();
  const selectionPath = Array.from(
    { length: editor.state.selection.$from.depth + 1 },
    (_, index) => editor.state.selection.$from.node(index).type.name,
  ).join(">");

  for (let index = 0; index < 5; index += 1) {
    performEdit(index);
    await flushEditorWork();
  }

  descendantCalls = 0;
  descendantVisits = 0;
  descendantStacks = new Map();
  formulaRecalculationTransactions = 0;
  reactCommitCount = 0;
  reactRenderDurationMs = 0;
  updateEvents = 0;
  const samples = [];
  for (let index = 0; index < editCount; index += 1) {
    const startedAt = performance.now();
    performEdit(index + 5);
    await flushEditorWork();
    samples.push(performance.now() - startedAt);
  }

  const result = {
    name,
    selectionPath,
    mountMs: Number(mountMs.toFixed(2)),
    editAverageMs: Number((samples.reduce((total, sample) => total + sample, 0) / samples.length).toFixed(2)),
    editP50Ms: Number(percentile(samples, 0.5).toFixed(2)),
    editP95Ms: Number(percentile(samples, 0.95).toFixed(2)),
    descendantCallsPerEdit: Number((descendantCalls / editCount).toFixed(2)),
    descendantVisitsPerEdit: Number((descendantVisits / editCount).toFixed(2)),
    formulaRecalculationsPerEdit: Number((formulaRecalculationTransactions / editCount).toFixed(2)),
    formulaProbeChanged: formulaProbe ? initialFormulaProbeValue !== getFormulaProbeValue() : null,
    reactCommitsPerEdit: Number((reactCommitCount / editCount).toFixed(2)),
    reactRenderMsPerEdit: Number((reactRenderDurationMs / editCount).toFixed(2)),
    updateEventsPerEdit: Number((updateEvents / editCount).toFixed(2)),
    ...(traceDescendants ? {
      descendantStacks: [...descendantStacks.entries()]
        .sort((left, right) => right[1] - left[1])
        .map(([stack, count]) => ({ count, stack })),
    } : {}),
  };

  editor.off("transaction", trackFormulaRecalculation);
  editor.off("update", trackUpdate);
  cleanup();
  await new Promise((resolve) => setTimeout(resolve, 10));
  return result;
}

async function runMultiEditorScenario(UEditor, editorCount) {
  globalThis.gc?.();
  const trackedTypes = new Set([
    "blur",
    "mousemove",
    "mouseup",
    "pointercancel",
    "pointermove",
    "pointerup",
    "resize",
    "selectionchange",
  ]);
  const targets = [document, window];
  const originals = targets.map((target) => ({
    add: target.addEventListener,
    remove: target.removeEventListener,
    target,
  }));
  let nativeGlobalAdds = 0;
  let activeNativeGlobalListeners = 0;
  const nativeGlobalAddsByTarget = new Map();

  for (const { add, remove, target } of originals) {
    target.addEventListener = function instrumentedAdd(type, listener, options) {
      if (trackedTypes.has(type)) {
        nativeGlobalAdds += 1;
        activeNativeGlobalListeners += 1;
        const key = `${this === document ? "document" : "window"}:${type}`;
        nativeGlobalAddsByTarget.set(key, (nativeGlobalAddsByTarget.get(key) ?? 0) + 1);
      }
      return add.call(this, type, listener, options);
    };
    target.removeEventListener = function instrumentedRemove(type, listener, options) {
      if (trackedTypes.has(type)) activeNativeGlobalListeners -= 1;
      return remove.call(this, type, listener, options);
    };
  }

  try {
    const refs = Array.from({ length: editorCount }, () => React.createRef());
    const startedAt = performance.now();
    render(
      React.createElement(
        React.Fragment,
        null,
        refs.map((ref, index) => React.createElement(UEditor, {
          key: index,
          ref,
          content: `<p>Editor ${index + 1}</p>`,
          showBubbleMenu: false,
          showCharacterCount: false,
          showFloatingMenu: false,
          showFooter: false,
          showMenuBar: false,
          showToolbar: false,
        })),
      ),
    );
    await waitFor(() => {
      if (refs.some((ref) => !ref.current?.editor)) throw new Error("Editors are not ready");
    }, { timeout: 30_000 });
    await flushEditorWork();

    const result = {
      name: `${editorCount} simultaneous editors`,
      mountMs: Number((performance.now() - startedAt).toFixed(2)),
      nativeGlobalAdds,
      nativeGlobalAddBreakdown: [...nativeGlobalAddsByTarget]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, count]) => `${key}=${count}`)
        .join(", "),
      activeNativeGlobalListeners,
    };

    cleanup();
    await flushEditorWork();
    result.listenersAfterCleanup = activeNativeGlobalListeners;
    return result;
  } finally {
    for (const { add, remove, target } of originals) {
      target.addEventListener = add;
      target.removeEventListener = remove;
    }
  }
}

try {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const results = [];

  results.push(await runScenario(UEditor, {
    name: "1,500 paragraphs",
    content: buildLargeDocument(1_500),
    editCount: 25,
    selectText: "Paragraph 1500: benchmark content for transaction and decoration work.",
  }));
  results.push(await runScenario(UEditor, {
    name: "1,500 paragraphs with character count",
    content: buildLargeDocument(1_500),
    editCount: 25,
    selectText: "Paragraph 1500: benchmark content for transaction and decoration work.",
    showCharacterCount: true,
  }));
  results.push(await runScenario(UEditor, {
    name: "1,500 paragraphs with full editor chrome",
    content: buildLargeDocument(1_500),
    editCount: 25,
    selectText: "Paragraph 1500: benchmark content for transaction and decoration work.",
    showBubbleMenu: true,
    showCharacterCount: true,
    showMenuBar: true,
    showToolbar: true,
  }));
  results.push(await runScenario(UEditor, {
    name: "40x8 formula table, editing outside",
    content: buildFormulaTable(40, 8),
    editCount: 25,
    selectText: "Outside table benchmark",
  }));
  results.push(await runScenario(UEditor, {
    name: "200x12 formula table, editing source cell",
    content: buildFormulaTable(200, 12),
    editCount: 60,
    formulaProbe: "=A200*2",
    replaceSelectedCellValues: ["100201", "100202"],
    selectText: "100200",
  }));

  console.table(results);
  console.table([
    await runMultiEditorScenario(UEditor, 1),
    await runMultiEditorScenario(UEditor, 5),
  ]);
  if (traceDescendants) {
    for (const result of results) {
      console.log(`\n${result.name}`);
      console.dir(result.descendantStacks, { depth: null });
    }
  }
} finally {
  cleanup();
  await new Promise((resolve) => setTimeout(resolve, 10));
  ProseMirrorNode.prototype.descendants = originalDescendants;
  restoreDom();
}
