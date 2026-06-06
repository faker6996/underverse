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

function activateTableCell(cell) {
  fireEvent.mouseOver(cell);
  fireEvent.mouseDown(cell);
  fireEvent.mouseUp(cell);
  fireEvent.click(cell);
}

function clipboardWithImageAndData({ html = "", text = "" } = {}) {
  const file = new File([new Uint8Array([137, 80, 78, 71])], "clipboard-preview.png", { type: "image/png" });

  return {
    files: [file],
    items: [
      {
        kind: "file",
        type: "image/png",
        getAsFile: () => file,
      },
    ],
    getData: (type) => {
      if (type === "text/html") return html;
      if (type === "text/plain") return text;
      return "";
    },
  };
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

test("UEditor updates editor content when the controlled content prop changes", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const user = userEvent.setup({ document: window.document });

  function Harness() {
    const [content, setContent] = React.useState("<p>Initial body</p>");

    return React.createElement(
      React.Fragment,
      null,
      React.createElement("button", { type: "button", onClick: () => setContent("<p>Updated body</p>") }, "Replace"),
      React.createElement(UEditor, {
        content,
        showBubbleMenu: false,
        showFloatingMenu: false,
        showCharacterCount: false,
      }),
    );
  }

  render(React.createElement(Harness));
  await within(window.document.body).findByText("Initial body");

  await user.click(within(window.document.body).getByRole("button", { name: "Replace" }));

  await waitFor(() => {
    assert.ok(within(window.document.body).getByText("Updated body"));
    assert.equal(within(window.document.body).queryByText("Initial body"), null);
  });
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

test("UEditor toolbar applies font family, font size, line height, and letter spacing while typing", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const user = userEvent.setup({ document: window.document });
  const htmlUpdates = [];

  const view = render(
    React.createElement(UEditor, {
      content: "",
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

  await user.click(editorElement);
  fireEvent.click(await view.findByRole("button", { name: "Font Family" }));
  fireEvent.click(await within(window.document.body).findByText("Georgia"));
  fireEvent.click(await view.findByRole("button", { name: "Font Size" }));
  fireEvent.click(await within(window.document.body).findByText("22"));
  fireEvent.click(await view.findByRole("button", { name: "Line Height" }));
  fireEvent.click(await within(window.document.body).findByText("1.75"));
  fireEvent.click(await view.findByRole("button", { name: "Letter Spacing" }));
  fireEvent.click(await within(window.document.body).findByText("0.05em"));
  await user.type(editorElement, "Styled text");

  await waitFor(() => {
    const latestHtml = htmlUpdates.at(-1) ?? "";
    assert.match(latestHtml, /font-family:\s*Georgia/i);
    assert.match(latestHtml, /font-size:\s*22px/i);
    assert.match(latestHtml, /line-height:\s*1.75/i);
    assert.match(latestHtml, /letter-spacing:\s*0.05em/i);
    assert.match(latestHtml, /Styled text/);
  });
});

test("UEditor toolbar upload inserts a selected image file", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const user = userEvent.setup({ document: window.document });
  const htmlUpdates = [];

  const view = render(
    React.createElement(UEditor, {
      content: "<p>Before image</p>",
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

  await user.click(editorElement);
  await user.click(within(view.container).getByRole("button", { name: "Insert Image" }));
  await user.click(await within(window.document.body).findByRole("button", { name: "Upload" }));

  const fileInput = await waitFor(() => {
    const input = window.document.body.querySelector('input[type="file"]');
    assert.ok(input, "image file input should stay mounted after clicking Upload");
    return input;
  });

  const file = new File([new Uint8Array([137, 80, 78, 71])], "tiny.png", { type: "image/png" });
  fireEvent.change(fileInput, { target: { files: [file] } });

  await waitFor(() => {
    const img = view.container.querySelector('img[alt="tiny.png"]');
    assert.ok(img);
    assert.match(img.getAttribute("src") ?? "", /^data:image\/png;base64,/);
    assert.match(htmlUpdates.at(-1) ?? "", /<img[^>]+tiny\.png/);
  });
});

test("UEditor pastes spreadsheet HTML as a table instead of the clipboard preview image", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const user = userEvent.setup({ document: window.document });

  const view = render(
    React.createElement(UEditor, {
      content: "<p>Paste target</p>",
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  const editorElement = await waitFor(() => {
    const element = view.container.querySelector(".ProseMirror");
    assert.ok(element);
    return element;
  });

  await user.click(editorElement);
  fireEvent.paste(editorElement, {
    clipboardData: clipboardWithImageAndData({
      html: [
        "<html><body>",
        "<!--StartFragment-->",
        "<table><tbody><tr><td>A1</td><td>B1</td></tr><tr><td>A2</td><td>B2</td></tr></tbody></table>",
        "<!--EndFragment-->",
        "</body></html>",
      ].join(""),
      text: "A1\tB1\nA2\tB2",
    }),
  });

  await waitFor(() => {
    assert.equal(view.container.querySelectorAll("table").length, 1);
    assert.equal(view.container.querySelectorAll("td").length, 4);
    assert.equal(view.container.querySelector("img"), null);
  });
});

test("UEditor converts spreadsheet TSV clipboard data to a table before handling preview images", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const user = userEvent.setup({ document: window.document });

  const view = render(
    React.createElement(UEditor, {
      content: "<p>Paste target</p>",
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  const editorElement = await waitFor(() => {
    const element = view.container.querySelector(".ProseMirror");
    assert.ok(element);
    return element;
  });

  await user.click(editorElement);
  fireEvent.paste(editorElement, {
    clipboardData: clipboardWithImageAndData({
      text: "A1\tB1\nA2\tB2",
    }),
  });

  await waitFor(() => {
    assert.equal(view.container.querySelectorAll("table").length, 1);
    assert.equal(view.container.querySelectorAll("td").length, 4);
    assert.equal(view.container.querySelector("img"), null);
  });
});

test("UEditor keeps quoted multiline spreadsheet TSV cells inside a single table row", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const user = userEvent.setup({ document: window.document });

  const view = render(
    React.createElement(UEditor, {
      content: "<p>Paste target</p>",
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  const editorElement = await waitFor(() => {
    const element = view.container.querySelector(".ProseMirror");
    assert.ok(element);
    return element;
  });

  const spreadsheetText = [
    "\tTên minigame\tPose to Hide: Tricky Puzzle\t\t",
    "\tRef\thttps://play.google.com/store/apps/details?id=com.human.posing.hf&hl=vi\t\t",
    "\tFigma demo\thttps://www.figma.com/design/maL1GYd2GAGOzkEyDzlQk0/25---Pose-to-Hide--Tricky-Puzzle\t\t",
    "\tGiới thiệu\tPose to Hide: Tricky Puzzle là một trò chơi vui nhộn.\t\t",
    "\tUSP\t\"- Lối chơi vui nhộn và dễ chơi\n- Nhân vật hoạt hình đáng yêu\n- Thử thách trí não hấp dẫn\n- Ghi nhớ và bắt chước để hoàn thành nhiệm vụ\"\t\t",
  ].join("\n");

  await user.click(editorElement);
  fireEvent.paste(editorElement, {
    clipboardData: clipboardWithImageAndData({
      text: spreadsheetText,
    }),
  });

  await waitFor(() => {
    const table = view.container.querySelector("table");
    assert.ok(table);
    assert.equal(table.querySelectorAll("tr").length, 5);
    assert.equal(view.container.querySelector("img"), null);

    const uspCells = table.querySelectorAll("tr")[4]?.querySelectorAll("td") ?? [];
    assert.equal(uspCells[1]?.textContent, "USP");
    assert.equal(uspCells[2]?.querySelectorAll("p").length, 4);
    assert.match(uspCells[2]?.textContent ?? "", /Ghi nhớ và bắt chước/);
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

test("UEditor image width presets preserve the image aspect ratio", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const user = userEvent.setup({ document: window.document });
  const ref = React.createRef();

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: `<p>Before</p><img src="data:image/png;base64,${ONE_PIXEL_PNG_BASE64}" alt="ratio" width="240" height="160" /><p>After</p>`,
      showToolbar: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await view.findByAltText("ratio");
  await waitFor(() => {
    assert.ok(ref.current?.editor);
  });

  const editor = ref.current.editor;
  let imagePos = null;
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === "image") {
      imagePos = pos;
      return false;
    }
    return true;
  });
  assert.equal(typeof imagePos, "number");

  editor.commands.focus();
  editor.commands.setNodeSelection(imagePos);
  await user.click(await within(window.document.body).findByRole("button", { name: "Image Width Large" }));

  await waitFor(() => {
    const attrs = editor.getAttributes("image");
    assert.equal(attrs.width, 380);
    assert.equal(attrs.height, 253);
  });

  const result = await ref.current.prepareContentForSave();
  assert.match(result.html, /width="380"/);
  assert.match(result.html, /height="253"/);
});

test("UEditor image resize handle preserves the image aspect ratio", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: `<p>Before</p><img src="data:image/png;base64,${ONE_PIXEL_PNG_BASE64}" alt="drag-ratio" width="200" height="100" /><p>After</p>`,
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  const image = await view.findByAltText("drag-ratio");
  const editorElement = await waitFor(() => {
    const element = view.container.querySelector(".ProseMirror");
    assert.ok(element);
    return element;
  });
  await waitFor(() => {
    assert.ok(ref.current?.editor);
  });

  editorElement.getBoundingClientRect = () => ({ width: 500, height: 300, top: 0, left: 0, right: 500, bottom: 300, x: 0, y: 0, toJSON() {} });
  image.getBoundingClientRect = () => ({ width: 200, height: 100, top: 0, left: 0, right: 200, bottom: 100, x: 0, y: 0, toJSON() {} });

  const editor = ref.current.editor;
  let imagePos = null;
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === "image") {
      imagePos = pos;
      return false;
    }
    return true;
  });
  assert.equal(typeof imagePos, "number");

  editor.commands.setNodeSelection(imagePos);
  const wrapper = image.closest("[data-image-layout]");
  assert.ok(wrapper);
  const handle = await waitFor(() => {
    const element = wrapper.querySelector('[aria-hidden="true"]');
    assert.ok(element);
    return element;
  });

  fireEvent.pointerDown(handle, { pointerId: 1, clientX: 0, clientY: 0 });
  fireEvent.pointerMove(handle, { pointerId: 1, clientX: 100, clientY: 0 });
  fireEvent.pointerUp(handle, { pointerId: 1, clientX: 100, clientY: 0 });

  await waitFor(() => {
    const attrs = editor.getAttributes("image");
    assert.equal(attrs.width, 300);
    assert.equal(attrs.height, 150);
  });
});

test("UEditor bubble menu applies quick line-height controls to selected text", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const user = userEvent.setup({ document: window.document });
  const htmlUpdates = [];
  const ref = React.createRef();

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: "<p>Quick spacing sample</p>",
      showToolbar: false,
      showFloatingMenu: false,
      showCharacterCount: false,
      onHtmlChange: (html) => htmlUpdates.push(html),
    }),
  );

  await view.findByText("Quick spacing sample");

  await waitFor(() => {
    assert.ok(ref.current?.editor);
  });
  const editor = ref.current.editor;

  editor.commands.focus();
  editor.commands.selectAll();

  const textStyleButton = await within(window.document.body).findByRole("button", { name: "Text Style" });
  await user.click(textStyleButton);
  await user.click(await within(window.document.body).findByText("1.75"));

  await waitFor(() => {
    const latestHtml = htmlUpdates.at(-1) ?? "";
    assert.match(latestHtml, /line-height:\s*1.75/i);
    assert.match(latestHtml, /Quick spacing sample/);
  });
});

test("UEditor preserves font family, font size, line height, and letter spacing from initial HTML", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: `<p><span style="font-family: serif; font-size: 24px; line-height: 1.75; letter-spacing: 0.05em;">Styled copy</span></p>`,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await view.findByText("Styled copy");
  await waitFor(() => {
    assert.ok(ref.current);
  });

  const result = await ref.current.prepareContentForSave();
  assert.match(result.html, /font-family:\s*serif/i);
  assert.match(result.html, /font-size:\s*24px/i);
  assert.match(result.html, /line-height:\s*1.75/i);
  assert.match(result.html, /letter-spacing:\s*0.05em/i);
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

test("UEditor menu bar preview uses editor table layout styles", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const body = within(window.document.body);

  render(
    React.createElement(UEditor, {
      content: "<p>Preview table</p><table><tbody><tr><td>A</td><td>B</td><td>C</td></tr></tbody></table>",
      showMenuBar: true,
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  fireEvent.click(await body.findByRole("button", { name: "View" }));
  const menuPreviewButtons = await body.findAllByRole("button", { name: "Preview" });
  const menuPreviewButton = menuPreviewButtons.find((button) => button.textContent?.trim() === "Preview");
  assert.ok(menuPreviewButton);
  fireEvent.click(menuPreviewButton);

  const previewContent = await body.findByTestId("preview-content");
  assert.match(previewContent.className, /overflow-y-auto/);

  const previewEditorContent = previewContent.firstElementChild;
  assert.ok(previewEditorContent);
  assert.match(previewEditorContent.className, /\[&_table\]:w-auto/);
  assert.match(previewEditorContent.className, /\[&_table\]:table-fixed/);

  const previewTable = previewContent.querySelector("table");
  assert.ok(previewTable);
  assert.doesNotMatch(previewTable.getAttribute("class") ?? "", /\bw-full\b/);
});

test("UEditor menu bar eye button opens preview directly", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const body = within(window.document.body);

  render(
    React.createElement(UEditor, {
      content: "<p>Direct preview body</p>",
      showMenuBar: true,
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  fireEvent.click(await body.findByRole("button", { name: "Preview" }));

  const previewContent = await body.findByTestId("preview-content");
  assert.match(previewContent.textContent ?? "", /Direct preview body/);
});

test("UEditor table toolbar inserts a custom-sized table from the grid picker", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const user = userEvent.setup({ document: window.document });
  const body = within(window.document.body);

  const view = render(
    React.createElement(UEditor, {
      content: "<p>Table grid</p>",
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  const editorElement = await waitFor(() => {
    const element = view.container.querySelector(".ProseMirror");
    assert.ok(element);
    return element;
  });

  await user.click(editorElement);
  await user.click(await view.findByRole("button", { name: "Insert Table" }));
  const gridCell = await body.findByRole("button", { name: "Insert 4×5 Table" });
  await user.hover(gridCell);
  await user.click(gridCell);

  await waitFor(() => {
    const rows = view.container.querySelectorAll("tr");
    assert.equal(rows.length, 4);
    const firstRowCells = rows[0]?.querySelectorAll("th,td") ?? [];
    assert.equal(firstRowCells.length, 5);
  });
});

test("UEditor table toolbar applies table alignment and preserves it in HTML", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const user = userEvent.setup({ document: window.document });
  const htmlUpdates = [];

  const view = render(
    React.createElement(UEditor, {
      content: "<table><tbody><tr><td>A1</td><td>B1</td></tr></tbody></table>",
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
      onHtmlChange: (html) => htmlUpdates.push(html),
    }),
  );

  const firstCell = await waitFor(() => {
    const element = view.container.querySelector("td");
    assert.ok(element);
    return element;
  });

  activateTableCell(firstCell);
  fireEvent.click(await view.findByRole("button", { name: "Insert Table" }));
  const alignCenterButton = await within(window.document.body).findByRole("button", { name: "Align Table Center" });
  assert.equal(alignCenterButton.disabled, false);
  fireEvent.click(alignCenterButton);

  await waitFor(() => {
    const table = view.container.querySelector("table");
    assert.ok(table);
    assert.equal(table.getAttribute("data-table-align"), "center");
    assert.match(table.getAttribute("style") ?? "", /margin-left:\s*auto/i);
    assert.match(table.getAttribute("style") ?? "", /margin-right:\s*auto/i);
    assert.match(table.getAttribute("style") ?? "", /width:\s*max-content/i);
    assert.match(htmlUpdates.at(-1) ?? "", /data-table-align="center"/);
  });
});

test("UEditor toolbar shows table quick actions for empty table cells", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const body = within(window.document.body);

  const view = render(
    React.createElement(UEditor, {
      content: [
        "<table><tbody>",
        '<tr><td colspan="2"></td><td>C1</td></tr>',
        "<tr><td>A2</td><td>B2</td><td>C2</td></tr>",
        "</tbody></table>",
      ].join(""),
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  const emptyMergedCell = await waitFor(() => {
    const element = view.container.querySelector("td[colspan='2']");
    assert.ok(element);
    return element;
  });

  activateTableCell(emptyMergedCell);
  fireEvent.focus(view.container.querySelector(".ProseMirror"));

  const addColumnBeforeButton = await body.findByRole("button", { name: "Add Column Before" });
  const addColumnAfterButton = await body.findByRole("button", { name: "Add Column After" });
  const addRowBeforeButton = await body.findByRole("button", { name: "Add Row Before" });
  const addRowAfterButton = await body.findByRole("button", { name: "Add Row After" });
  const splitCellButton = await body.findByRole("button", { name: "Split Cell" });

  assert.equal(addColumnBeforeButton.disabled, false);
  assert.equal(addColumnAfterButton.disabled, false);
  assert.equal(addRowBeforeButton.disabled, false);
  assert.equal(addRowAfterButton.disabled, false);
  assert.equal(splitCellButton.disabled, false);

  fireEvent.click(splitCellButton);

  await waitFor(() => {
    const firstRowCells = view.container.querySelectorAll("tr")[0]?.querySelectorAll("th,td") ?? [];
    assert.equal(firstRowCells.length, 3);
  });
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

  activateTableCell(firstCell);
  hoverTableMenuZone(view);

  const openControlsButton = await body.findByRole("button", { name: "Open Table Controls" });
  assert.ok(openControlsButton);

  fireEvent.click(openControlsButton);
  const toggleHeaderRowItem = await body.findByRole("menuitem", { name: "Toggle Header Row" });
  fireEvent.click(toggleHeaderRowItem);

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
  fireEvent.mouseDown(quickAddRowButton);
  fireEvent.mouseUp(window);
  await waitFor(() => {
    assert.equal(view.container.querySelectorAll("tr").length, 3);
  });

  hoverAddColumnRail(view);
  const quickAddColumnButton = await body.findByRole("button", { name: "Quick Add Column After" });
  assert.ok(quickAddColumnButton);
  assert.equal(quickAddColumnButton.disabled, false);
  assert.notEqual(quickAddColumnButton.style.height, "");
  fireEvent.mouseDown(quickAddColumnButton);
  fireEvent.mouseUp(window);
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

  activateTableCell(secondRowSecondCell);

  hoverTableMenuZone(view);
  const openControlsButton = await body.findByRole("button", { name: "Open Table Controls" });
  fireEvent.click(openControlsButton);
  fireEvent.click(await body.findByRole("menuitem", { name: "Toggle Header Column" }));

  await waitFor(() => {
    const secondRowCells = view.container.querySelectorAll("tr")[1]?.querySelectorAll("th,td") ?? [];
    assert.equal(secondRowCells[0]?.tagName, "TH");
    assert.equal(secondRowCells[1]?.tagName, "TD");
  });

  activateTableCell(view.container.querySelectorAll("tr")[1]?.querySelectorAll("th,td")[1]);
  hoverTableMenuZone(view);
  fireEvent.click(await body.findByRole("button", { name: "Open Table Controls" }));
  fireEvent.click(await body.findByRole("menuitem", { name: "Add Row Before" }));

  await waitFor(() => {
    assert.equal(view.container.querySelectorAll("tr").length, 3);
  });

  activateTableCell(view.container.querySelectorAll("tr")[1]?.querySelectorAll("th,td")[1]);
  hoverTableMenuZone(view);
  fireEvent.click(await body.findByRole("button", { name: "Open Table Controls" }));
  fireEvent.click(await body.findByRole("menuitem", { name: "Add Column Before" }));

  await waitFor(() => {
    const firstRowCells = view.container.querySelectorAll("tr")[0]?.querySelectorAll("th,td") ?? [];
    assert.equal(firstRowCells.length, 3);
  });

  activateTableCell(view.container.querySelectorAll("tr")[1]?.querySelectorAll("th,td")[1]);
  hoverTableMenuZone(view);
  fireEvent.click(await body.findByRole("button", { name: "Open Table Controls" }));
  fireEvent.click(await body.findByRole("menuitem", { name: "Delete Row" }));

  await waitFor(() => {
    assert.equal(view.container.querySelectorAll("tr").length, 2);
  });

  activateTableCell(view.container.querySelectorAll("tr")[0]?.querySelectorAll("th,td")[1]);
  hoverTableMenuZone(view);
  fireEvent.click(await body.findByRole("button", { name: "Open Table Controls" }));
  fireEvent.click(await body.findByRole("menuitem", { name: "Delete Column" }));

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

  activateTableCell(firstCell);

  hoverColumnHandle(view, 0);
  const columnHandle = await body.findByRole("button", { name: "Drag Column 1" });
  fireEvent.click(columnHandle);
  fireEvent.mouseLeave(view.container.querySelector(".ProseMirror"));
  fireEvent.mouseMove(window.document.body, { clientX: 0, clientY: 0 });
  await body.findByRole("menuitem", { name: "Duplicate Column" });
  await body.findByRole("menuitem", { name: "Duplicate Column" });
  fireEvent.click(body.getByRole("menuitem", { name: "Duplicate Column" }));

  await waitFor(() => {
    const firstRowCells = view.container.querySelectorAll("tr")[0]?.querySelectorAll("th,td") ?? [];
    assert.equal(firstRowCells.length, 3);
    assert.equal(firstRowCells[0]?.textContent?.trim(), "A1");
    assert.equal(firstRowCells[1]?.textContent?.trim(), "A1");
  });

  activateTableCell(view.container.querySelector("td"));
  hoverColumnHandle(view, 1);
  fireEvent.click(await body.findByRole("button", { name: "Drag Column 2" }));
  fireEvent.click(await body.findByRole("menuitem", { name: "Clear Column Contents" }));

  await waitFor(() => {
    const secondColumnCells = Array.from(view.container.querySelectorAll("tr")).map(
      (row) => row.querySelectorAll("th,td")[1]?.textContent?.trim() ?? "",
    );
    assert.deepEqual(secondColumnCells, ["", ""]);
  });

  activateTableCell(view.container.querySelector("td"));
  hoverRowHandle(view, 0);
  fireEvent.click(await body.findByRole("button", { name: "Drag Row 1" }));
  fireEvent.click(await body.findByRole("menuitem", { name: "Duplicate Row" }));

  await waitFor(() => {
    assert.equal(view.container.querySelectorAll("tr").length, 3);
  });

  activateTableCell(view.container.querySelector("td"));
  hoverRowHandle(view, 1);
  fireEvent.click(await body.findByRole("button", { name: "Drag Row 2" }));
  fireEvent.click(await body.findByRole("menuitem", { name: "Clear Row Contents" }));

  await waitFor(() => {
    const clearedRowCells = view.container.querySelectorAll("tr")[1]?.querySelectorAll("th,td") ?? [];
    assert.deepEqual(
      Array.from(clearedRowCells).map((cell) => cell.textContent?.trim() ?? ""),
      ["", "", ""],
    );
  });
});

test("UEditor table handles follow merged row and column spans", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const user = userEvent.setup({ document: window.document });
  const body = within(window.document.body);

  const view = render(
    React.createElement(UEditor, {
      content: [
        "<table><tbody>",
        '<tr><td colspan="2">Merged columns</td><td>C1</td></tr>',
        '<tr><td rowspan="2">Merged rows</td><td>B2</td><td>C2</td></tr>',
        "<tr><td>B3</td><td>C3</td></tr>",
        "</tbody></table>",
      ].join(""),
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

  activateTableCell(firstCell);

  await waitFor(() => {
    assert.ok(body.getByRole("button", { name: "Drag Column 1" }));
    assert.ok(body.getByRole("button", { name: "Drag Column 3" }));
    assert.equal(body.queryByRole("button", { name: "Drag Column 2" }), null);
    assert.ok(body.getByRole("button", { name: "Drag Row 1" }));
    assert.ok(body.getByRole("button", { name: "Drag Row 2" }));
    assert.equal(body.queryByRole("button", { name: "Drag Row 3" }), null);
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

test("UEditor split cell, drag preview, and layout updates after merged-cell edits", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const user = userEvent.setup({ document: window.document });
  const body = within(window.document.body);

  const view = render(
    React.createElement(UEditor, {
      content: [
        "<table><tbody>",
        '<tr><td colspan="2">Merged</td><td>C1</td></tr>',
        "<tr><td>A2</td><td>B2</td><td>C2</td></tr>",
        "</tbody></table>",
      ].join(""),
      showToolbar: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  const firstCell = await waitFor(() => {
    const element = view.container.querySelector("td");
    assert.ok(element);
    return element;
  });

  activateTableCell(firstCell);

  const paragraph = firstCell.querySelector("p") ?? firstCell;
  await user.tripleClick(paragraph);

  const editorElement = view.container.querySelector(".ProseMirror");
  assert.ok(editorElement);
  fireEvent.focus(editorElement);

  const splitCellButton = await body.findByRole("button", { name: "Split Cell" });
  assert.ok(splitCellButton);
  fireEvent.click(splitCellButton);

  await waitFor(() => {
    const firstRowCells = view.container.querySelectorAll("tr")[0]?.querySelectorAll("th,td") ?? [];
    assert.equal(firstRowCells.length, 3);
  });

  activateTableCell(view.container.querySelector("td"));
  hoverRowHandle(view, 0);

  const dragRowButton = await body.findByRole("button", { name: "Drag Row 1" });
  assert.ok(dragRowButton);

  fireEvent.mouseDown(dragRowButton, { clientY: 22 });
  fireEvent.mouseMove(window, { clientY: 110 });

  await waitFor(() => {
    assert.equal(body.getByRole("status").textContent?.trim(), "Drag Row 1 -> 2");
  });

  fireEvent.mouseUp(window, { clientY: 110 });
});

test("UEditor Callout extension rendering", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;

  const view = render(
    React.createElement(UEditor, {
      content: '<div data-type="callout" data-emoji="💡" data-background-color="var(--muted)"><p>Hello callout</p></div>',
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await view.findByText("Hello callout");
  await view.findByText("💡");
});

test("UEditor Bookmark Card rendering and auto-paste url on empty line", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: [
        '<div data-type="bookmark" href="https://example.com" data-title="Example Site" data-description="My description" data-publisher="example.com"></div>',
        '<p></p>',
      ].join(""),
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await view.findByText("Example Site");
  await view.findByText("My description");
  await view.findByText("example.com");

  await waitFor(() => {
    assert.ok(ref.current);
  });
  ref.current.editor.commands.focus("end");

  const editorElement = view.container.querySelector(".ProseMirror");
  assert.ok(editorElement);

  fireEvent.paste(editorElement, {
    clipboardData: {
      getData: (type) => (type === "text/plain" ? "https://newsite.com" : ""),
    },
  });

  await view.findAllByText("https://newsite.com");
});

test("UEditor CodeBlock language selector and copy function", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;

  let copiedText = "";
  const originalClipboard = navigator.clipboard;
  Object.defineProperty(navigator, "clipboard", {
    value: {
      writeText: async (text) => {
        copiedText = text;
      },
    },
    configurable: true,
  });

  const view = render(
    React.createElement(UEditor, {
      content: '<pre><code class="language-javascript">console.log("test");</code></pre>',
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  const dropdownButton = await view.findByText(/Plain Text|JavaScript/);
  assert.ok(dropdownButton);

  await waitFor(() => {
    const codeEl = view.container.querySelector("code");
    assert.ok(codeEl);
    assert.match(codeEl.textContent, /console\.log/);
  });

  const copyButton = view.container.querySelector('button[title="Copy code"]');
  assert.ok(copyButton);
  fireEvent.click(copyButton);

  await waitFor(() => {
    assert.equal(copiedText.trim(), 'console.log("test");');
  });

  if (originalClipboard) {
    Object.defineProperty(navigator, "clipboard", {
      value: originalClipboard,
      configurable: true,
    });
  } else {
    delete navigator.clipboard;
  }
});

test("UEditor FileCard rendering and save preparation", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();

  const mockPdfBase64 = "JVBERi0xLjQKJcfsj6yepw==";
  const dataUrl = `data:application/pdf;base64,${mockPdfBase64}`;

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: `<div data-type="file-card" data-src="${dataUrl}" data-file-name="test.pdf" data-file-size="15" data-file-type="application/pdf"></div>`,
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
      uploadFileForSave: async (file) => {
        return `https://storage.com/uploaded-${file.name}`;
      },
    }),
  );

  await view.findByText("test.pdf");
  await view.findByText("15 Bytes");

  await waitFor(() => {
    assert.ok(ref.current);
  });

  const result = await ref.current.prepareContentForSave({ throwOnError: true });
  assert.equal(result.errors.length, 0);
  assert.match(result.html, /https:\/\/storage\.com\/uploaded-test\.pdf/);
});

test("UEditor FileCard immediate background upload on insertion", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();

  const mockPdfBase64 = "JVBERi0xLjQKJcfsj6yepw==";
  const dataUrl = `data:application/pdf;base64,${mockPdfBase64}`;

  let uploadedFile = null;
  const view = render(
    React.createElement(UEditor, {
      ref,
      content: `<div data-type="file-card" data-src="${dataUrl}" data-file-name="immediate-test.pdf" data-file-size="15" data-file-type="application/pdf"></div>`,
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
      uploadFile: async (file) => {
        uploadedFile = file;
        return `https://storage.com/immediate-${file.name}`;
      },
    }),
  );

  await view.findByText("immediate-test.pdf");

  await waitFor(() => {
    assert.ok(uploadedFile);
    assert.equal(uploadedFile.name, "immediate-test.pdf");
  }, { timeout: 3000 });

  await waitFor(() => {
    const html = ref.current.editor.getHTML();
    assert.match(html, /https:\/\/storage\.com\/immediate-immediate-test\.pdf/);
  }, { timeout: 3000 });
});

test("UEditor Table cell custom borders are preserved in HTML", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: `
        <table>
          <tbody>
            <tr>
              <td data-border-color="#ff0000" data-border-style="dashed" data-border-width="3px">Cell 1</td>
              <td>Cell 2</td>
            </tr>
          </tbody>
        </table>
      `,
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await view.findByText("Cell 1");

  await waitFor(() => {
    assert.ok(ref.current);
  });

  const html = ref.current.editor.getHTML();
  assert.match(html, /data-border-color="#ff0000"/i);
  assert.match(html, /border-color:\s*(?:#ff0000|rgb\(255,\s*0,\s*0\))/i);
  assert.match(html, /border-style:\s*dashed/i);
  assert.match(html, /border-width:\s*3px/i);
});
