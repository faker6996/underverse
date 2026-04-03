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
const ONE_PIXEL_PNG_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7Z5eUAAAAASUVORK5CYII=";

function getEditorSurface(view) {
  const surface = view.container.querySelector(".relative.flex-1.overflow-y-auto");
  assert.ok(surface);
  return surface;
}

function hoverTableMenuZone(view) {
  fireEvent.mouseMove(getEditorSurface(view), { clientX: 12, clientY: 8 });
}

function hoverAddColumnRail(view) {
  fireEvent.mouseMove(getEditorSurface(view), { clientX: 332, clientY: 40 });
}

function hoverAddRowRail(view) {
  fireEvent.mouseMove(getEditorSurface(view), { clientX: 40, clientY: 96 });
}

function hoverColumnHandle(view, index = 0) {
  fireEvent.mouseMove(getEditorSurface(view), { clientX: 80 + index * 160, clientY: -10 });
}

function hoverRowHandle(view, index = 0) {
  fireEvent.mouseMove(getEditorSurface(view), { clientX: -10, clientY: 22 + index * 44 });
}

test("UEditor renders content and reuses the same in-flight prepareContentForSave promise", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: `<p>Hello editor</p><img src="data:image/png;base64,${ONE_PIXEL_PNG_BASE64}" alt="inline" />`,
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );
  const body = within(window.document.body);

  await view.findByText("Hello editor");
  assert.equal(body.queryByText(/loading/i), null);

  await waitFor(() => {
    assert.ok(ref.current);
  });

  const [first, second] = await Promise.all([
    ref.current.prepareContentForSave(),
    ref.current.prepareContentForSave(),
  ]);

  assert.equal(first, second);
  assert.equal(first.html, second.html);
  assert.match(first.html, /Hello editor/);
});

test("UEditor prepareContentForSave resolves cleanly for plain content", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();

  render(
    React.createElement(UEditor, {
      ref,
      content: `<p>Plain text only</p>`,
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await waitFor(() => {
    assert.ok(ref.current);
  });

  const result = await ref.current.prepareContentForSave({ throwOnError: true });
  assert.equal(result.errors.length, 0);
  assert.match(result.html, /Plain text only/);
});

test("UEditor minimal toolbar applies bold and italic formatting while typing", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const user = userEvent.setup({ document: window.document });
  const htmlUpdates = [];

  const view = render(
    React.createElement(UEditor, {
      content: "",
      variant: "minimal",
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
      onHtmlChange: (html) => htmlUpdates.push(html),
    }),
  );

  const editorElement = await waitFor(() => {
    const element = view.container.querySelector(".ProseMirror");
    assert.ok(element);
    return element;
  });
  const toolbarButtons = view.container.querySelectorAll("button[type='button']");

  assert.ok(toolbarButtons.length >= 2);

  await user.click(editorElement);
  await user.click(toolbarButtons[0]);
  await user.type(editorElement, "Bold");

  await waitFor(() => {
    assert.match(htmlUpdates.at(-1) ?? "", /<strong>Bold<\/strong>/);
  });

  await user.click(toolbarButtons[0]);
  await user.click(toolbarButtons[1]);
  await user.type(editorElement, "Italic");

  await waitFor(() => {
    const latestHtml = htmlUpdates.at(-1) ?? "";
    assert.match(latestHtml, /<strong>Bold<\/strong>/);
    assert.match(latestHtml, /<em>Italic<\/em>/);
  });
});

test("UEditor preserves wrapped image layout in editor DOM and saved HTML", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: `<p>Lead paragraph</p><img src="data:image/png;base64,${ONE_PIXEL_PNG_BASE64}" alt="wrapped" data-image-layout="left" data-image-size="md" width="240" /><p>Body copy wraps next to the image.</p>`,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  const img = await view.findByAltText("wrapped");
  const wrapper = img.closest("[data-node-view-wrapper]");
  assert.ok(wrapper);
  assert.match(wrapper.className, /float-left/);

  await waitFor(() => {
    assert.ok(ref.current);
  });

  const result = await ref.current.prepareContentForSave();
  assert.match(result.html, /data-image-layout="left"/);
  assert.match(result.html, /data-image-size="md"/);
  assert.match(result.html, /float:\s*left/i);
});

test("UEditor preserves table row height from content HTML", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: `<table><tbody><tr data-row-height="72"><td>Wide row</td><td>Cell</td></tr></tbody></table>`,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  const row = await waitFor(() => {
    const element = view.container.querySelector("tr");
    assert.ok(element);
    return element;
  });

  assert.equal(row.getAttribute("data-row-height"), "72");
  assert.match(row.getAttribute("style") ?? "", /height:\s*72px/i);

  await waitFor(() => {
    assert.ok(ref.current);
  });

  const result = await ref.current.prepareContentForSave();
  assert.match(result.html, /data-row-height="72"/);
  assert.match(result.html, /height:\s*72px/i);
});

test("UEditor shows contextual table controls and applies table actions near the active cell", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const user = userEvent.setup({ document: window.document });
  const body = within(window.document.body);

  const view = render(
    React.createElement(UEditor, {
      content: "<table><tbody><tr><td>A1</td><td>B1</td></tr><tr><td>A2</td><td>B2</td></tr></tbody></table>",
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  const firstCell = await waitFor(() => {
    const element = view.container.querySelector("td");
    assert.ok(element);
    return element;
  });

  await user.click(firstCell);
  hoverTableMenuZone(view);

  const openControlsButton = await body.findByRole("button", { name: "Open Table Controls" });
  assert.ok(openControlsButton);

  fireEvent.click(openControlsButton);
  const toggleHeaderRowItem = await body.findByRole("menuitem", { name: "Toggle Header Row" });
  await user.click(toggleHeaderRowItem);

  await waitFor(() => {
    const headerCells = view.container.querySelectorAll("th");
    assert.equal(headerCells.length, 2);
    assert.equal(headerCells[0]?.textContent?.trim(), "A1");
  });

  hoverAddRowRail(view);
  const quickAddRowButton = await body.findByRole("button", { name: "Quick Add Row After" });
  assert.ok(quickAddRowButton);
  assert.equal(quickAddRowButton.disabled, false);
  assert.notEqual(quickAddRowButton.style.width, "");
  await user.click(quickAddRowButton);
  await waitFor(() => {
    assert.equal(view.container.querySelectorAll("tr").length, 3);
  });

  hoverAddColumnRail(view);
  const quickAddColumnButton = await body.findByRole("button", { name: "Quick Add Column After" });
  assert.ok(quickAddColumnButton);
  assert.equal(quickAddColumnButton.disabled, false);
  assert.notEqual(quickAddColumnButton.style.height, "");
  await user.click(quickAddColumnButton);
  await waitFor(() => {
    const firstRowCells = view.container.querySelectorAll("tr")[0]?.querySelectorAll("th,td") ?? [];
    assert.equal(firstRowCells.length, 3);
  });
});

test("UEditor table context menu applies header column and structural actions", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const user = userEvent.setup({ document: window.document });
  const body = within(window.document.body);

  const view = render(
    React.createElement(UEditor, {
      content: "<table><tbody><tr><td>A1</td><td>B1</td></tr><tr><td>A2</td><td>B2</td></tr></tbody></table>",
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  const secondRowSecondCell = await waitFor(() => {
    const element = view.container.querySelectorAll("tr")[1]?.querySelectorAll("td")[1];
    assert.ok(element);
    return element;
  });

  await user.click(secondRowSecondCell);

  hoverTableMenuZone(view);
  const openControlsButton = await body.findByRole("button", { name: "Open Table Controls" });
  fireEvent.click(openControlsButton);
  await user.click(await body.findByRole("menuitem", { name: "Toggle Header Column" }));

  await waitFor(() => {
    const secondRowCells = view.container.querySelectorAll("tr")[1]?.querySelectorAll("th,td") ?? [];
    assert.equal(secondRowCells[0]?.tagName, "TH");
    assert.equal(secondRowCells[1]?.tagName, "TD");
  });

  hoverTableMenuZone(view);
  fireEvent.click(await body.findByRole("button", { name: "Open Table Controls" }));
  await user.click(await body.findByRole("menuitem", { name: "Add Row Before" }));

  await waitFor(() => {
    assert.equal(view.container.querySelectorAll("tr").length, 3);
  });

  hoverTableMenuZone(view);
  fireEvent.click(await body.findByRole("button", { name: "Open Table Controls" }));
  await user.click(await body.findByRole("menuitem", { name: "Add Column Before" }));

  await waitFor(() => {
    const firstRowCells = view.container.querySelectorAll("tr")[0]?.querySelectorAll("th,td") ?? [];
    assert.equal(firstRowCells.length, 3);
  });

  hoverTableMenuZone(view);
  fireEvent.click(await body.findByRole("button", { name: "Open Table Controls" }));
  await user.click(await body.findByRole("menuitem", { name: "Delete Row" }));

  await waitFor(() => {
    assert.equal(view.container.querySelectorAll("tr").length, 2);
  });

  hoverTableMenuZone(view);
  fireEvent.click(await body.findByRole("button", { name: "Open Table Controls" }));
  await user.click(await body.findByRole("menuitem", { name: "Delete Column" }));

  await waitFor(() => {
    const firstRowCells = view.container.querySelectorAll("tr")[0]?.querySelectorAll("th,td") ?? [];
    assert.equal(firstRowCells.length, 2);
  });
});

test("UEditor row and column handle menus expose notion-like structural actions", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const user = userEvent.setup({ document: window.document });
  const body = within(window.document.body);

  const view = render(
    React.createElement(UEditor, {
      content: "<table><tbody><tr><td>A1</td><td>B1</td></tr><tr><td>A2</td><td>B2</td></tr></tbody></table>",
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  const firstCell = await waitFor(() => {
    const element = view.container.querySelector("td");
    assert.ok(element);
    return element;
  });

  await user.click(firstCell);

  hoverColumnHandle(view, 0);
  const columnHandle = await body.findByRole("button", { name: "Drag Column 1" });
  fireEvent.click(columnHandle);
  fireEvent.mouseLeave(view.container.querySelector(".ProseMirror"));
  fireEvent.mouseMove(window.document.body, { clientX: 0, clientY: 0 });
  await body.findByRole("menuitem", { name: "Duplicate Column" });
  await body.findByRole("menuitem", { name: "Duplicate Column" });
  await user.click(body.getByRole("menuitem", { name: "Duplicate Column" }));

  await waitFor(() => {
    const firstRowCells = view.container.querySelectorAll("tr")[0]?.querySelectorAll("th,td") ?? [];
    assert.equal(firstRowCells.length, 3);
    assert.equal(firstRowCells[0]?.textContent?.trim(), "A1");
    assert.equal(firstRowCells[1]?.textContent?.trim(), "A1");
  });

  hoverColumnHandle(view, 1);
  fireEvent.click(await body.findByRole("button", { name: "Drag Column 2" }));
  await user.click(await body.findByRole("menuitem", { name: "Clear Column Contents" }));

  await waitFor(() => {
    const secondColumnCells = Array.from(view.container.querySelectorAll("tr")).map(
      (row) => row.querySelectorAll("th,td")[1]?.textContent?.trim() ?? "",
    );
    assert.deepEqual(secondColumnCells, ["", ""]);
  });

  hoverRowHandle(view, 0);
  fireEvent.click(await body.findByRole("button", { name: "Drag Row 1" }));
  await user.click(await body.findByRole("menuitem", { name: "Duplicate Row" }));

  await waitFor(() => {
    assert.equal(view.container.querySelectorAll("tr").length, 3);
  });

  hoverRowHandle(view, 1);
  fireEvent.click(await body.findByRole("button", { name: "Drag Row 2" }));
  await user.click(await body.findByRole("menuitem", { name: "Clear Row Contents" }));

  await waitFor(() => {
    const clearedRowCells = view.container.querySelectorAll("tr")[1]?.querySelectorAll("th,td") ?? [];
    assert.deepEqual(
      Array.from(clearedRowCells).map((cell) => cell.textContent?.trim() ?? ""),
      ["", "", ""],
    );
  });
});

test("UEditor row drag handle reorders table rows", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const body = within(window.document.body);

  const view = render(
    React.createElement(UEditor, {
      content: "<table><tbody><tr><td>A1</td><td>B1</td></tr><tr><td>A2</td><td>B2</td></tr></tbody></table>",
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  const firstCell = await waitFor(() => {
    const element = view.container.querySelector("td");
    assert.ok(element);
    return element;
  });

  fireEvent.click(firstCell);
  hoverRowHandle(view, 0);

  const dragRowButton = await body.findByRole("button", { name: "Drag Row 1" });
  fireEvent.mouseDown(dragRowButton, { clientY: 24 });
  fireEvent.mouseMove(window, { clientY: 160 });

  await waitFor(() => {
    assert.equal(body.getByRole("status").textContent?.trim(), "Drag Row 1 -> 2");
  });

  fireEvent.mouseUp(window, { clientY: 160 });

  await waitFor(() => {
    const firstRowCells = view.container.querySelectorAll("tr")[0]?.querySelectorAll("th,td") ?? [];
    assert.equal(firstRowCells[0]?.textContent?.trim(), "A2");
    assert.equal(firstRowCells[1]?.textContent?.trim(), "B2");
  });
});

test("UEditor column drag handle reorders table columns", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const body = within(window.document.body);

  const view = render(
    React.createElement(UEditor, {
      content: "<table><tbody><tr><td>A1</td><td>B1</td></tr><tr><td>A2</td><td>B2</td></tr></tbody></table>",
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  const firstCell = await waitFor(() => {
    const element = view.container.querySelector("td");
    assert.ok(element);
    return element;
  });

  fireEvent.click(firstCell);
  hoverColumnHandle(view, 0);

  const dragColumnButton = await body.findByRole("button", { name: "Drag Column 1" });
  fireEvent.mouseDown(dragColumnButton, { clientX: 80 });
  fireEvent.mouseMove(window, { clientX: 420 });

  await waitFor(() => {
    assert.equal(body.getByRole("status").textContent?.trim(), "Drag Column 1 -> 2");
  });

  fireEvent.mouseUp(window, { clientX: 420 });

  await waitFor(() => {
    const firstRowCells = view.container.querySelectorAll("tr")[0]?.querySelectorAll("th,td") ?? [];
    assert.equal(firstRowCells[0]?.textContent?.trim(), "B1");
    assert.equal(firstRowCells[1]?.textContent?.trim(), "A1");
  });
});

test("UEditor edge rails preview expands table by the previewed rows and columns", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const body = within(window.document.body);

  const view = render(
    React.createElement(UEditor, {
      content: "<table><tbody><tr><td>A1</td><td>B1</td></tr><tr><td>A2</td><td>B2</td></tr></tbody></table>",
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  const firstCell = await waitFor(() => {
    const element = view.container.querySelector("td");
    assert.ok(element);
    return element;
  });

  fireEvent.click(firstCell);

  hoverAddRowRail(view);
  const quickAddRowButton = await body.findByRole("button", { name: "Quick Add Row After" });
  assert.equal(quickAddRowButton.disabled, false);

  fireEvent.mouseDown(quickAddRowButton, { clientY: 88 });
  fireEvent.mouseMove(window, { clientY: 140 });

  await waitFor(() => {
    assert.equal(body.getByRole("status").textContent?.trim(), "+2R");
  });

  fireEvent.mouseUp(window, { clientY: 140 });

  await waitFor(() => {
    assert.equal(view.container.querySelectorAll("tr").length, 4);
  });

  hoverAddColumnRail(view);
  const quickAddColumnButton = await body.findByRole("button", { name: "Quick Add Column After" });
  assert.equal(quickAddColumnButton.disabled, false);

  fireEvent.mouseDown(quickAddColumnButton, { clientX: 320 });
  fireEvent.mouseMove(window, { clientX: 500 });

  await waitFor(() => {
    assert.equal(body.getByRole("status").textContent?.trim(), "+2C");
  });

  fireEvent.mouseUp(window, { clientX: 500 });

  await waitFor(() => {
    const firstRowCells = view.container.querySelectorAll("tr")[0]?.querySelectorAll("th,td") ?? [];
    assert.equal(firstRowCells.length, 4);
  });
});
