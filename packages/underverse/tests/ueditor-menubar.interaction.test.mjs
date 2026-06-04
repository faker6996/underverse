/**
 * UEditor MenuBar interaction tests.
 *
 * Performance note: Tests are consolidated to share editor instances where
 * possible, keeping total count ~20 to avoid OOM on CI / local machines.
 *
 * Key behaviour: DropdownMenu in "children" mode does NOT auto-close after
 * clicking an item (only the "items array" mode uses closeOnSelect). So menus
 * stay open after fireEvent.click on items. openMenu() is idempotent — it
 * skips the trigger click if the menu is already open (aria-expanded=true).
 */
import assert from "node:assert/strict";
import path from "node:path";
import test, { after, afterEach } from "node:test";
import React from "./helpers/workspace-react.mjs";
import { cleanup, fireEvent, render, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { importTsModule } from "./helpers/import-ts-module.mjs";
import { installJSDOM } from "./helpers/setup-jsdom.mjs";

const restoreDom = installJSDOM();
after(() => restoreDom());
afterEach(async () => {
  cleanup();
  await new Promise((resolve) => setTimeout(resolve, 0));
});

const componentsRoot = path.resolve(import.meta.dirname, "../src/components");
const contextsRoot = path.resolve(import.meta.dirname, "../src/contexts");

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function loadUEditor() {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  return mod.default;
}

async function getEditorSurface(view) {
  return waitFor(() => {
    const el = view.container.querySelector(".ProseMirror");
    assert.ok(el);
    return el;
  });
}

function renderWithMenuBar(UEditor, extra = {}) {
  return render(
    React.createElement(UEditor, {
      content: "",
      showMenuBar: true,
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
      ...extra,
    }),
  );
}

/**
 * Open a menu bar dropdown.
 * Idempotent: if the trigger already has aria-expanded=true, the menu is
 * already open — clicking again would close it, so we skip the click.
 */
/**
 * Open a menu bar dropdown.
 * - Idempotent: skips click if aria-expanded=true.
 * - When multiple buttons share a name (e.g. "Table" appears as a menu bar
 *   trigger AND as a submenu trigger inside an open portal), always picks the
 *   FIRST one in DOM order, which is always the menu bar trigger.
 */
async function openMenu(body, label) {
  await waitFor(() => assert.ok(body.queryAllByRole("button", { name: label }).length > 0));
  const trigger = body.queryAllByRole("button", { name: label })[0];
  if (trigger.getAttribute("aria-expanded") === "true") return trigger;
  fireEvent.click(trigger);
  return trigger;
}

function getLastButtonByName(body, name) {
  const all = body.getAllByRole("button", { name });
  return all[all.length - 1];
}

function focusFirstTableCell(ref) {
  const editor = ref.current.editor;
  let cellPos = -1;
  editor.state.doc.descendants((node, pos) => {
    if (cellPos === -1 && (node.type.name === "tableCell" || node.type.name === "tableHeader")) {
      cellPos = pos + 1;
    }
  });
  assert.ok(cellPos > 0, "No table cell found");
  editor.commands.setTextSelection(cellPos);
}

/** Update a React-controlled textarea without userEvent (avoids hang with HTML strings). */
function setTextareaValue(textarea, value) {
  const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
  nativeSetter.call(textarea, value);
  fireEvent.input(textarea); // React 18 listens to native 'input' events
}

// ─── 1. Visibility ───────────────────────────────────────────────────────────

test("MenuBar hidden by default; shown when showMenuBar=true", async () => {
  const UEditor = await loadUEditor();

  render(React.createElement(UEditor, { content: "", showBubbleMenu: false, showFloatingMenu: false, showCharacterCount: false }));
  assert.equal(within(window.document.body).queryByRole("button", { name: "File" }), null);
  cleanup(); await new Promise((r) => setTimeout(r, 0));

  const view = renderWithMenuBar(UEditor);
  await getEditorSurface(view);
  const body = within(window.document.body);
  for (const label of ["File", "Edit", "View", "Insert", "Format", "Tools", "Table"]) {
    assert.ok(body.queryByRole("button", { name: label }), `Missing: ${label}`);
  }
});

// ─── 2. File menu ────────────────────────────────────────────────────────────

test("File: Save calls callback (disabled without it); Export always enabled", async () => {
  const UEditor = await loadUEditor();
  let saveCalled = 0;
  let exportCalled = 0;
  const view = renderWithMenuBar(UEditor, { onSave: () => saveCalled++, onExport: () => exportCalled++ });
  await getEditorSurface(view);
  const body = within(window.document.body);

  // Open File menu ONCE — it stays open after clicks
  await openMenu(body, "File");
  const saveBtn = await body.findByRole("button", { name: /^Save/ });
  assert.equal(saveBtn.disabled, false);
  fireEvent.click(saveBtn);
  assert.equal(saveCalled, 1);

  // Export is in the same open menu
  const exportBtn = await body.findByRole("button", { name: "Export HTML" });
  assert.equal(exportBtn.disabled, false);
  fireEvent.click(exportBtn);
  assert.equal(exportCalled, 1);

  // Verify Save is disabled without callback
  cleanup(); await new Promise((r) => setTimeout(r, 0));
  const view2 = renderWithMenuBar(UEditor);
  await getEditorSurface(view2);
  const body2 = within(window.document.body);
  await openMenu(body2, "File");
  assert.equal((await body2.findByRole("button", { name: /^Save/ })).disabled, true);
  assert.equal((await body2.findByRole("button", { name: "Export HTML" })).disabled, false);
});

// ─── 3. Edit menu ─────────────────────────────────────────────────────────────

test("Edit: Undo/Redo disabled with no history, enabled after typing", async () => {
  const UEditor = await loadUEditor();
  const view = renderWithMenuBar(UEditor, { content: "" });
  await getEditorSurface(view);
  const body = within(window.document.body);

  await openMenu(body, "Edit");
  assert.equal((await body.findByRole("button", { name: /^Undo/ })).disabled, true);
  assert.equal((await body.findByRole("button", { name: /^Redo/ })).disabled, true);
});

test("Edit: Undo reverts typed text; Redo re-applies", async () => {
  const UEditor = await loadUEditor();
  const user = userEvent.setup({ document: window.document });
  const htmlUpdates = [];
  const ref = React.createRef();
  const view = renderWithMenuBar(UEditor, { ref, content: "", onHtmlChange: (h) => htmlUpdates.push(h) });
  const editorEl = await getEditorSurface(view);
  const body = within(window.document.body);

  await user.click(editorEl);
  await user.type(editorEl, "Hi");
  await waitFor(() => assert.match(htmlUpdates.at(-1) ?? "", /Hi/));

  // Undo via menu
  await openMenu(body, "Edit");
  const undoBtn = await body.findByRole("button", { name: /^Undo/ });
  assert.equal(undoBtn.disabled, false);
  fireEvent.click(undoBtn);
  await waitFor(() => assert.doesNotMatch(htmlUpdates.at(-1) ?? "", /Hi/));

  // Redo via menu (Edit menu is still open)
  await waitFor(() => assert.ok(ref.current?.editor));
  const redoBtn = await body.findByRole("button", { name: /^Redo/ });
  assert.equal(redoBtn.disabled, false);
  fireEvent.click(redoBtn);
  await waitFor(() => assert.match(htmlUpdates.at(-1) ?? "", /Hi/));
});

test("Edit: Select All selects all content", async () => {
  const UEditor = await loadUEditor();
  const ref = React.createRef();
  renderWithMenuBar(UEditor, { ref, content: "<p>Select me</p>" });
  await waitFor(() => assert.ok(document.querySelector(".ProseMirror")));
  const body = within(window.document.body);

  await waitFor(() => assert.ok(ref.current?.editor));
  await openMenu(body, "Edit");
  fireEvent.click(await body.findByRole("button", { name: /Select All/ }));
  await waitFor(() => {
    const { from, to } = ref.current.editor.state.selection;
    assert.ok(to > from);
  });
});

// ─── 4. View menu ────────────────────────────────────────────────────────────

test("View: Source code callback when provided; built-in dialog when not", async () => {
  const UEditor = await loadUEditor();
  let called = 0;
  const view1 = renderWithMenuBar(UEditor, { content: "<p>x</p>", onSourceCode: () => called++ });
  await getEditorSurface(view1);
  const body1 = within(window.document.body);
  await openMenu(body1, "View");
  const btn = await body1.findByRole("button", { name: "Source code" });
  assert.equal(btn.disabled, false);
  fireEvent.click(btn);
  assert.equal(called, 1);
  assert.equal(body1.queryByTestId("source-code-textarea"), null);
  cleanup(); await new Promise((r) => setTimeout(r, 0));

  // No callback → built-in dialog
  const view2 = renderWithMenuBar(UEditor, { content: "<p>Hello source</p>" });
  await getEditorSurface(view2);
  const body2 = within(window.document.body);
  await openMenu(body2, "View");
  fireEvent.click(await body2.findByRole("button", { name: "Source code" }));
  const textarea = await body2.findByTestId("source-code-textarea");
  assert.match(textarea.value, /Hello source/);
});

test("View: Source code dialog Apply updates editor; Close dismisses", async () => {
  const UEditor = await loadUEditor();
  const user = userEvent.setup({ document: window.document });
  const view = renderWithMenuBar(UEditor, { content: "<p>Old</p>" });
  await getEditorSurface(view);
  const body = within(window.document.body);

  await openMenu(body, "View");
  fireEvent.click(await body.findByRole("button", { name: "Source code" }));
  const textarea = await body.findByTestId("source-code-textarea");
  assert.match(textarea.value, /Old/);

  // Use user.clear + user.type with plain text (no HTML chars to avoid hang).
  // TipTap's setContent wraps bare text in <p> automatically.
  await user.clear(textarea);
  await user.type(textarea, "Applied plain text");

  fireEvent.click(await body.findByRole("button", { name: "Apply" }));
  await waitFor(() => {
    assert.match(view.container.querySelector(".ProseMirror")?.textContent ?? "", /Applied plain text/);
  });

  // Reopen and test Close — dialog should dismiss without applying further changes
  await openMenu(body, "View");
  fireEvent.click(await body.findByRole("button", { name: "Source code" }));
  await body.findByTestId("source-code-textarea");
  fireEvent.click(await body.findByRole("button", { name: "Close" }));
  await waitFor(() => assert.equal(body.queryByTestId("source-code-textarea"), null, "Close should dismiss dialog"));
  assert.match(view.container.querySelector(".ProseMirror")?.textContent ?? "", /Applied plain text/);
});

test("View: Preview callback when provided; built-in modal when not", async () => {
  const UEditor = await loadUEditor();
  let called = 0;
  const view1 = renderWithMenuBar(UEditor, { content: "<p>x</p>", onPreview: () => called++ });
  await getEditorSurface(view1);
  const body1 = within(window.document.body);
  await openMenu(body1, "View");
  fireEvent.click(await body1.findByRole("button", { name: "Preview" }));
  assert.equal(called, 1);
  cleanup(); await new Promise((r) => setTimeout(r, 0));

  const view2 = renderWithMenuBar(UEditor, { content: "<p>Preview me</p>" });
  await getEditorSurface(view2);
  const body2 = within(window.document.body);
  await openMenu(body2, "View");
  fireEvent.click(await body2.findByRole("button", { name: "Preview" }));
  const preview = await body2.findByTestId("preview-content");
  assert.match(preview.innerHTML, /Preview me/);
});

// ─── 5. Insert menu ──────────────────────────────────────────────────────────

test("Insert: Image URL form — inserts image; cancel returns to list", async () => {
  const UEditor = await loadUEditor();
  const user = userEvent.setup({ document: window.document });
  const htmlUpdates = [];
  const view = renderWithMenuBar(UEditor, { content: "<p>x</p>", onHtmlChange: (h) => htmlUpdates.push(h) });
  await getEditorSurface(view);
  const body = within(window.document.body);

  await openMenu(body, "Insert");
  fireEvent.click(await body.findByRole("button", { name: "Image" }));
  const urlInput = await body.findByPlaceholderText(/example\.com\/image/i);
  await user.type(urlInput, "https://example.com/photo.png");
  fireEvent.click(await body.findByRole("button", { name: "Add Image" }));
  await waitFor(() => assert.match(htmlUpdates.at(-1) ?? "", /photo\.png/));

  // Reopen and cancel
  await openMenu(body, "Insert");
  fireEvent.click(await body.findByRole("button", { name: "Image" }));
  await body.findByPlaceholderText(/example\.com\/image/i);
  fireEvent.click(await body.findByRole("button", { name: "Cancel" }));
  await body.findByRole("button", { name: "Image" });
});

test("Insert: Link form — inserts link", async () => {
  const UEditor = await loadUEditor();
  const user = userEvent.setup({ document: window.document });
  const ref = React.createRef();
  const view = renderWithMenuBar(UEditor, { ref, content: "<p>Text</p>" });
  await getEditorSurface(view);
  const body = within(window.document.body);

  await waitFor(() => assert.ok(ref.current?.editor));
  ref.current.editor.commands.selectAll();

  await openMenu(body, "Insert");
  fireEvent.click(await body.findByRole("button", { name: /^Link/ }));
  const urlInput = await body.findByPlaceholderText(/paste or type/i);
  await user.type(urlInput, "https://example.com");
  await user.keyboard("{Enter}");
  await waitFor(() => {
    const link = view.container.querySelector("a[href]");
    assert.ok(link);
    assert.equal(link.getAttribute("href"), "https://example.com");
  });
});

test("Insert: Table submenu inserts table and closes Insert menu", async () => {
  const UEditor = await loadUEditor();
  const user = userEvent.setup({ document: window.document });
  const view = renderWithMenuBar(UEditor, { content: "<p>x</p>" });
  const editorEl = await getEditorSurface(view);
  const body = within(window.document.body);

  await user.click(editorEl);
  await openMenu(body, "Insert");
  await body.findByRole("button", { name: "Horizontal line" });
  fireEvent.click(getLastButtonByName(body, "Table"));
  const gridCell = await body.findByRole("button", { name: /Insert 3.3 Table/i });
  fireEvent.mouseEnter(gridCell);
  fireEvent.click(gridCell);
  await waitFor(() => assert.ok(view.container.querySelectorAll("tr").length >= 1));
  await waitFor(() => assert.equal(body.queryByRole("button", { name: "Horizontal line" }), null));
});

test("Insert: Horizontal line inserts <hr>", async () => {
  const UEditor = await loadUEditor();
  const user = userEvent.setup({ document: window.document });
  const view = renderWithMenuBar(UEditor, { content: "<p>x</p>" });
  const editorEl = await getEditorSurface(view);
  const body = within(window.document.body);
  await user.click(editorEl);
  await openMenu(body, "Insert");
  fireEvent.click(await body.findByRole("button", { name: "Horizontal line" }));
  await waitFor(() => assert.ok(view.container.querySelector("hr")));
});

// ─── 6. Format menu ──────────────────────────────────────────────────────────

test("Format: text marks Bold, Italic, Underline, Strike, Superscript, Subscript, Code", async () => {
  const UEditor = await loadUEditor();
  const ref = React.createRef();
  const htmlUpdates = [];
  const view = renderWithMenuBar(UEditor, {
    ref,
    content: "<p>text</p>",
    onHtmlChange: (h) => htmlUpdates.push(h),
  });
  await getEditorSurface(view);
  const body = within(window.document.body);
  await waitFor(() => assert.ok(ref.current?.editor));

  // Open Format menu ONCE — it stays open after each fireEvent.click on items
  await openMenu(body, "Format");

  const cases = [
    [/^Bold/, "strong"],
    [/^Italic/, "em"],
    [/^Underline/, "u"],
    ["Strikethrough", "s"],
    ["Superscript", "sup"],
    ["Subscript", "sub"],
    ["Code", "code"],
  ];

  for (const [btnName, tag] of cases) {
    ref.current.editor.commands.selectAll();
    fireEvent.click(await body.findByRole("button", { name: btnName }));
    // Use [\s>] to handle tags with attributes, e.g. <code class="...">
    await waitFor(() => assert.match(htmlUpdates.at(-1) ?? "", new RegExp(`<${tag}[\\s>]`)));
    // Toggle off for clean state
    ref.current.editor.commands.selectAll();
    fireEvent.click(await body.findByRole("button", { name: btnName }));
  }
});

test("Format: Bold active state when cursor in bold text", async () => {
  const UEditor = await loadUEditor();
  const ref = React.createRef();
  renderWithMenuBar(UEditor, { ref, content: "<p><strong>Bold</strong></p>" });
  await waitFor(() => assert.ok(document.querySelector(".ProseMirror")));
  const body = within(window.document.body);

  await waitFor(() => assert.ok(ref.current?.editor));
  ref.current.editor.commands.setTextSelection(3);
  await openMenu(body, "Format");
  const btn = await body.findByRole("button", { name: /^Bold/ });
  assert.ok(btn.className.includes("text-primary") || btn.className.includes("bg-primary"));
});

test("Format: Wrap submenu — Paragraph, H1, H2, H3, Blockquote, Code block, Task list", async () => {
  const UEditor = await loadUEditor();
  const user = userEvent.setup({ document: window.document });
  const view = renderWithMenuBar(UEditor, { content: "<p>text</p>" });
  const editorEl = await getEditorSurface(view);
  const body = within(window.document.body);
  await user.click(editorEl);

  // Open Format menu then Block submenu ONCE — both stay open via fireEvent.click
  await openMenu(body, "Format");
  fireEvent.click(await body.findByRole("button", { name: "Block" }));

  const cases = [
    ["Heading 1", "h1"],
    ["Heading 2", "h2"],
    ["Heading 3", "h3"],
    ["Paragraph", "p"],
    ["Blockquote", "blockquote"],
    ["Code block", "pre"],
    ["Task list", "ul[data-type='taskList']"],
  ];

  for (const [itemLabel, selector] of cases) {
    fireEvent.click(await body.findByRole("button", { name: itemLabel }));
    await waitFor(() => assert.ok(view.container.querySelector(selector), `${selector} not found`));
  }
});

test("Format: Align submenu — Center, Right, Justify, Left", async () => {
  const UEditor = await loadUEditor();
  const user = userEvent.setup({ document: window.document });
  const htmlUpdates = [];
  const view = renderWithMenuBar(UEditor, { content: "<p>align</p>", onHtmlChange: (h) => htmlUpdates.push(h) });
  const editorEl = await getEditorSurface(view);
  const body = within(window.document.body);
  await user.click(editorEl);

  // Open Format > Align submenu ONCE
  await openMenu(body, "Format");
  fireEvent.click(await body.findByRole("button", { name: "Align" }));

  const cases = [
    ["Center", /text-align:\s*center/i],
    ["Right", /text-align:\s*right/i],
    ["Justify", /text-align:\s*justify/i],
    ["Left", /text-align:\s*left/i],
  ];

  for (const [label, pattern] of cases) {
    fireEvent.click(await body.findByRole("button", { name: label }));
    await waitFor(() => assert.match(htmlUpdates.at(-1) ?? "", pattern));
  }
});

test("Format: Clear formatting removes all marks", async () => {
  const UEditor = await loadUEditor();
  const ref = React.createRef();
  const htmlUpdates = [];
  const view = renderWithMenuBar(UEditor, {
    ref,
    content: "<p><strong><em>Bold italic</em></strong></p>",
    onHtmlChange: (h) => htmlUpdates.push(h),
  });
  await getEditorSurface(view);
  const body = within(window.document.body);
  await waitFor(() => assert.ok(ref.current?.editor));
  ref.current.editor.commands.selectAll();
  await openMenu(body, "Format");
  fireEvent.click(await body.findByRole("button", { name: "Clear formatting" }));
  await waitFor(() => {
    const h = htmlUpdates.at(-1) ?? "";
    assert.doesNotMatch(h, /<strong>/);
    assert.doesNotMatch(h, /<em>/);
    assert.match(h, /Bold italic/);
  });
});

// ─── 7. Tools menu ───────────────────────────────────────────────────────────

test("Tools: Source code callback or built-in dialog (same behaviour as View)", async () => {
  const UEditor = await loadUEditor();
  let called = 0;
  const view1 = renderWithMenuBar(UEditor, { content: "<p>x</p>", onSourceCode: () => called++ });
  await getEditorSurface(view1);
  const body1 = within(window.document.body);
  await openMenu(body1, "Tools");
  fireEvent.click(await body1.findByRole("button", { name: "Source code" }));
  assert.equal(called, 1);
  cleanup(); await new Promise((r) => setTimeout(r, 0));

  const view2 = renderWithMenuBar(UEditor, { content: "<p>Tools source</p>" });
  await getEditorSurface(view2);
  const body2 = within(window.document.body);
  await openMenu(body2, "Tools");
  fireEvent.click(await body2.findByRole("button", { name: "Source code" }));
  const textarea = await body2.findByTestId("source-code-textarea");
  assert.match(textarea.value, /Tools source/);
});

// ─── 8. Table menu ───────────────────────────────────────────────────────────

test("Table: submenus + Delete disabled outside table", async () => {
  const UEditor = await loadUEditor();
  const user = userEvent.setup({ document: window.document });
  const view = renderWithMenuBar(UEditor, { content: "<p>no table</p>" });
  const editorEl = await getEditorSurface(view);
  const body = within(window.document.body);
  await user.click(editorEl);
  await openMenu(body, "Table");
  assert.equal((await body.findByRole("button", { name: "Row" })).disabled, true);
  assert.equal((await body.findByRole("button", { name: "Column" })).disabled, true);
  assert.equal((await body.findByRole("button", { name: "Cell" })).disabled, true);
  assert.equal((await body.findByRole("button", { name: "Delete table" })).disabled, true);
});

test("Table: Insert via grid → Row add/delete → Column add/delete → Delete table", async () => {
  const UEditor = await loadUEditor();
  const user = userEvent.setup({ document: window.document });
  const ref = React.createRef();
  const view = renderWithMenuBar(UEditor, { ref, content: "<p>start</p>" });
  const editorEl = await getEditorSurface(view);
  const body = within(window.document.body);
  await user.click(editorEl);
  await waitFor(() => assert.ok(ref.current?.editor));

  // Insert via Table > Table submenu grid
  await openMenu(body, "Table");
  await body.findByRole("button", { name: "Delete table" }); // portal present
  fireEvent.click(getLastButtonByName(body, "Table")); // open grid submenu
  const gridCell = await body.findByRole("button", { name: /Insert 3.3 Table/i });
  fireEvent.mouseEnter(gridCell);
  fireEvent.click(gridCell); // fireEvent avoids nested-portal mousedown issue
  await waitFor(() => assert.ok(view.container.querySelectorAll("tr").length >= 1));

  // Place cursor inside table (required for TipTap table commands)
  focusFirstTableCell(ref);
  await new Promise((r) => setTimeout(r, 0));

  // Row: Add below
  const rowsBefore = view.container.querySelectorAll("tr").length;
  await openMenu(body, "Table");
  assert.equal((await body.findByRole("button", { name: "Row" })).disabled, false);
  fireEvent.click(await body.findByRole("button", { name: "Row" }));
  fireEvent.click(await body.findByRole("button", { name: "Insert row below" }));
  await waitFor(() => assert.equal(view.container.querySelectorAll("tr").length, rowsBefore + 1));

  // Row: Delete
  focusFirstTableCell(ref);
  const rowsNow = view.container.querySelectorAll("tr").length;
  await openMenu(body, "Table");
  fireEvent.click(await body.findByRole("button", { name: "Row" }));
  fireEvent.click(await body.findByRole("button", { name: "Delete row" }));
  await waitFor(() => assert.equal(view.container.querySelectorAll("tr").length, rowsNow - 1));

  // Column: Add right
  focusFirstTableCell(ref);
  const colsBefore = view.container.querySelector("tr").querySelectorAll("th,td").length;
  await openMenu(body, "Table");
  fireEvent.click(await body.findByRole("button", { name: "Column" }));
  fireEvent.click(await body.findByRole("button", { name: "Insert column right" }));
  await waitFor(() =>
    assert.equal(view.container.querySelector("tr").querySelectorAll("th,td").length, colsBefore + 1),
  );

  // Delete table
  focusFirstTableCell(ref);
  await new Promise((r) => setTimeout(r, 0));
  await openMenu(body, "Table");
  const deleteBtn = await body.findByRole("button", { name: "Delete table" });
  assert.equal(deleteBtn.disabled, false);
  fireEvent.click(deleteBtn);
  await waitFor(() => assert.equal(view.container.querySelector("table"), null));
});

// ─── 9. DropdownMenuSub ──────────────────────────────────────────────────────

test("DropdownMenuSub: opens on click, shows ChevronRight SVG, disabled when disabled=true", async () => {
  const UEditor = await loadUEditor();
  const user = userEvent.setup({ document: window.document });
  const view = renderWithMenuBar(UEditor, { content: "<p>sub</p>" });
  const editorEl = await getEditorSurface(view);
  const body = within(window.document.body);
  await user.click(editorEl);

  await openMenu(body, "Format");
  const wrapTrigger = await body.findByRole("button", { name: "Block" });
  assert.ok(wrapTrigger.querySelector("svg"), "ChevronRight SVG missing");
  fireEvent.click(wrapTrigger);
  fireEvent.click(await body.findByRole("button", { name: "Heading 1" }));
  await waitFor(() => assert.ok(view.container.querySelector("h1")));

  await openMenu(body, "Table");
  assert.equal((await body.findByRole("button", { name: "Row" })).disabled, true);
});

// ─── 10. i18n ────────────────────────────────────────────────────────────────

test("i18n: Vietnamese labels (vi) and Korean labels (ko)", async () => {
  const UEditor = await loadUEditor();
  const { TranslationProvider } = await importTsModule(path.join(contextsRoot, "TranslationContext.tsx"));

  // Vietnamese
  document.documentElement.lang = "vi";
  const view1 = render(
    React.createElement(
      TranslationProvider,
      { locale: "vi" },
      React.createElement(UEditor, {
        content: "",
        showMenuBar: true,
        showToolbar: false,
        showBubbleMenu: false,
        showFloatingMenu: false,
        showCharacterCount: false,
        onSave: () => {},
      }),
    ),
  );
  await getEditorSurface(view1);
  const body1 = within(window.document.body);
  for (const label of ["Tập tin", "Sửa", "Xem", "Thêm", "Định dạng", "Công cụ", "Bảng"]) {
    assert.ok(body1.queryByRole("button", { name: label }), `Missing VI: ${label}`);
  }
  await openMenu(body1, "Tập tin");
  assert.ok(await body1.findByRole("button", { name: /^Lưu/ }));
  assert.ok(body1.queryByRole("button", { name: "Xuất HTML" }));
  document.documentElement.lang = "";
  cleanup(); await new Promise((r) => setTimeout(r, 0));

  // Korean
  document.documentElement.lang = "ko";
  const view2 = render(
    React.createElement(
      TranslationProvider,
      { locale: "ko" },
      React.createElement(UEditor, {
        content: "",
        showMenuBar: true,
        showToolbar: false,
        showBubbleMenu: false,
        showFloatingMenu: false,
        showCharacterCount: false,
      }),
    ),
  );
  await getEditorSurface(view2);
  const body2 = within(window.document.body);
  assert.ok(body2.queryByRole("button", { name: "파일" }));
  assert.ok(body2.queryByRole("button", { name: "편집" }));
  document.documentElement.lang = "";
});

// ─── 11. Regression ──────────────────────────────────────────────────────────

test("Regression: showMenuBar=false keeps toolbar; true+toolbar shows both", async () => {
  const UEditor = await loadUEditor();

  render(React.createElement(UEditor, { content: "", showMenuBar: false, showBubbleMenu: false, showFloatingMenu: false, showCharacterCount: false }));
  await waitFor(() => assert.ok(document.querySelector(".ProseMirror")));
  const body = within(window.document.body);
  assert.ok(body.queryByRole("button", { name: /Bold/i }), "Toolbar missing");
  assert.equal(body.queryByRole("button", { name: "File" }), null, "Menu bar should be absent");
  cleanup(); await new Promise((r) => setTimeout(r, 0));

  const view2 = render(React.createElement(UEditor, { content: "", showMenuBar: true, showToolbar: true, showBubbleMenu: false, showFloatingMenu: false, showCharacterCount: false }));
  await getEditorSurface(view2);
  const body2 = within(window.document.body);
  assert.ok(body2.queryByRole("button", { name: "File" }), "Menu bar missing");
  assert.ok(await body2.findByRole("button", { name: /Bold/i }), "Toolbar missing");
});
