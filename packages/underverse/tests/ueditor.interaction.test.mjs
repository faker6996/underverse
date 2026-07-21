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

function suppressTextSelectionEndpointWarning(run) {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (String(args[0] ?? "").includes("TextSelection endpoint not pointing into a node with inline content")) {
      return;
    }
    originalWarn(...args);
  };

  try {
    return run();
  } finally {
    console.warn = originalWarn;
  }
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

  assert.notEqual(found, null);
  return found;
}

function findNodePosition(editor, predicate) {
  let found = null;

  editor.state.doc.descendants((node, pos) => {
    if (found != null) return false;
    if (!predicate(node)) return true;

    found = pos;
    return false;
  });

  assert.notEqual(found, null);
  return found;
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

test("UEditor serializes only the output formats that have subscribers", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const jsonRef = React.createRef();
  let jsonUpdates = 0;

  render(
    React.createElement(UEditor, {
      ref: jsonRef,
      content: "<p>JSON only</p>",
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
      onJsonChange: () => {
        jsonUpdates += 1;
      },
    }),
  );

  await waitFor(() => assert.ok(jsonRef.current?.editor));
  const jsonEditor = jsonRef.current.editor;
  const originalGetHtml = jsonEditor.getHTML.bind(jsonEditor);
  let htmlSerializations = 0;
  jsonEditor.getHTML = (...args) => {
    htmlSerializations += 1;
    return originalGetHtml(...args);
  };

  jsonEditor.commands.focus("end");
  jsonEditor.commands.insertContent(" updated");
  await waitFor(() => assert.equal(jsonUpdates, 1));
  assert.equal(htmlSerializations, 0);

  cleanup();

  const htmlRef = React.createRef();
  let htmlUpdates = 0;
  render(
    React.createElement(UEditor, {
      ref: htmlRef,
      content: "<p>HTML only</p>",
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
      onHtmlChange: () => {
        htmlUpdates += 1;
      },
    }),
  );

  await waitFor(() => assert.ok(htmlRef.current?.editor));
  const htmlEditor = htmlRef.current.editor;
  const originalGetJson = htmlEditor.getJSON.bind(htmlEditor);
  let jsonSerializations = 0;
  htmlEditor.getJSON = (...args) => {
    jsonSerializations += 1;
    return originalGetJson(...args);
  };

  htmlEditor.commands.focus("end");
  htmlEditor.commands.insertContent(" updated");
  await waitFor(() => assert.equal(htmlUpdates, 1));
  assert.equal(jsonSerializations, 0);
});

test("UEditor shares equivalent global event listeners and removes the native listener after cleanup", async () => {
  const { subscribeSharedGlobalEvent } = await importTsModule(
    path.join(componentsRoot, "UEditor/shared-global-listeners.ts"),
  );
  let nativeAdds = 0;
  let nativeRemoves = 0;

  class CountingEventTarget extends window.EventTarget {
    addEventListener(...args) {
      nativeAdds += 1;
      return super.addEventListener(...args);
    }

    removeEventListener(...args) {
      nativeRemoves += 1;
      return super.removeEventListener(...args);
    }
  }

  const target = new CountingEventTarget();
  const calls = [];
  const unsubscribeFirst = subscribeSharedGlobalEvent(target, "resize", () => calls.push("first"));
  const unsubscribeSecond = subscribeSharedGlobalEvent(target, "resize", () => calls.push("second"));

  assert.equal(nativeAdds, 1);
  target.dispatchEvent(new window.Event("resize"));
  assert.deepEqual(calls, ["first", "second"]);

  unsubscribeFirst();
  target.dispatchEvent(new window.Event("resize"));
  assert.deepEqual(calls, ["first", "second", "second"]);
  assert.equal(nativeRemoves, 0);

  unsubscribeSecond();
  assert.equal(nativeRemoves, 1);
});

test("UEditor character and word counters stay in sync while typing", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();

  render(
    React.createElement(UEditor, {
      ref,
      content: "<p>one two</p>",
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
    }),
  );

  const body = within(window.document.body);
  await body.findByText("2 words");
  assert.ok(body.getByText("7 characters"));
  await waitFor(() => assert.ok(ref.current?.editor));

  ref.current.editor.commands.focus("end");
  ref.current.editor.commands.insertContent(" three");

  await body.findByText("3 words");
  assert.ok(body.getByText("13 characters"));
});

test("UEditor avoids full-document descendant scans while typing outside tables and code blocks", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();
  const paragraphs = Array.from({ length: 100 }, (_, index) => `<p>Performance paragraph ${index + 1}</p>`).join("");

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: [
        paragraphs,
        '<table><tbody><tr><td>10</td><td data-formula="=A1*2" data-computed-value="20">20</td></tr></tbody></table>',
      ].join(""),
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
      showFooter: false,
    }),
  );

  await waitFor(() => assert.ok(ref.current?.editor));
  const editor = ref.current.editor;
  await waitFor(() => {
    assert.ok(view.container.querySelector("td[data-formula-state='computed']"));
  });
  editor.commands.setTextSelection(findTextPosition(editor, "Performance paragraph 100") + "Performance paragraph 100".length);

  const nodePrototype = Object.getPrototypeOf(editor.state.doc);
  const originalDescendants = nodePrototype.descendants;
  let descendantCalls = 0;
  nodePrototype.descendants = function instrumentedDescendants(callback) {
    descendantCalls += 1;
    return originalDescendants.call(this, callback);
  };

  try {
    editor.commands.insertContent(" updated");
    await new Promise((resolve) => setTimeout(resolve, 0));
  } finally {
    nodePrototype.descendants = originalDescendants;
  }

  assert.equal(descendantCalls, 0);
});

test("UEditor keeps typing outside a newly applied link", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: "<p>Linked text</p>",
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await waitFor(() => {
    assert.ok(ref.current?.editor);
  });

  const linkCommands = await importTsModule(path.join(componentsRoot, "UEditor/link-commands.ts"));
  const linkTextPosition = findTextPosition(ref.current.editor, "Linked text");
  ref.current.editor.commands.setTextSelection({ from: linkTextPosition, to: linkTextPosition + "Linked text".length });
  linkCommands.applyEditorLink(ref.current.editor, "https://example.com");
  ref.current.editor.commands.insertContent(" continues");

  const link = view.container.querySelector('a[href="https://example.com"]');
  assert.ok(link);
  assert.equal(link.textContent, "Linked text");
  assert.equal(view.container.querySelector("p")?.textContent, "Linked text continues");
});

test("UEditor inserts the URL as linked text when no text is selected", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const linkCommands = await importTsModule(path.join(componentsRoot, "UEditor/link-commands.ts"));
  const UEditor = mod.default;
  const ref = React.createRef();

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: "<p></p>",
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await waitFor(() => {
    assert.ok(ref.current?.editor);
  });

  linkCommands.applyEditorLink(ref.current.editor, "https://example.com");
  ref.current.editor.commands.insertContent(" continues");

  const link = view.container.querySelector('a[href="https://example.com"]');
  assert.ok(link);
  assert.equal(link.textContent, "https://example.com");
  assert.equal(view.container.querySelector("p")?.textContent, "https://example.com continues");
});

test("UEditor link input reports invalid URLs and normalizes valid domains", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor/inputs.tsx"));
  const submittedUrls = [];
  const user = userEvent.setup({ document: window.document });
  const body = within(window.document.body);

  render(
    React.createElement(mod.LinkInput, {
      onSubmit: (url) => submittedUrls.push(url),
      onCancel: () => {},
    }),
  );

  const input = await body.findByPlaceholderText("Paste or type a link...");
  await user.type(input, "https://ádf");
  await user.keyboard("{Enter}");

  assert.deepEqual(submittedUrls, []);
  assert.equal((await body.findByRole("alert")).textContent, "Enter a valid link, such as https://example.com.");
  assert.equal(input.getAttribute("aria-invalid"), "true");

  await user.clear(input);
  await user.type(input, "example.com");
  assert.equal(body.queryByRole("alert"), null);
  await user.keyboard("{Enter}");

  assert.deepEqual(submittedUrls, ["https://example.com"]);
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

test("UEditor renders the floating menu only when the public option is enabled", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();

  render(
    React.createElement(UEditor, {
      ref,
      content: "<p></p>",
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: true,
      showCharacterCount: false,
    }),
  );

  await waitFor(() => assert.ok(ref.current?.editor));
  ref.current.editor.commands.blur();
  ref.current.editor.commands.focus("start");

  await within(window.document.body).findByRole("button", { name: "Add block" });
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

  // Since Undo and Redo were added to the minimal toolbar, Bold is at index 2 and Italic is at index 3
  const boldButton = toolbarButtons[2];
  const italicButton = toolbarButtons[3];
  assert.ok(boldButton && italicButton);

  await user.click(editorElement);
  await user.click(boldButton);
  await user.type(editorElement, "Bold");

  await waitFor(() => {
    assert.match(htmlUpdates.at(-1) ?? "", /<strong>Bold<\/strong>/);
  });

  await user.click(boldButton);
  await user.click(italicButton);
  await user.type(editorElement, "Italic");

  await waitFor(() => {
    const latestHtml = htmlUpdates.at(-1) ?? "";
    assert.match(latestHtml, /<strong>Bold<\/strong>/);
    assert.match(latestHtml, /<em>Italic<\/em>/);
  });
});

test("UEditor increases and decreases paragraph and blockquote indentation from toolbar and keyboard", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();
  const user = userEvent.setup({ document: window.document });
  const view = render(
    React.createElement(UEditor, {
      ref,
      content: "<p>Plain text</p><blockquote><p>Quoted text</p></blockquote>",
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await waitFor(() => assert.ok(ref.current?.editor));
  const editor = ref.current.editor;
  const increaseButton = await view.findByRole("button", { name: "Increase Indent" });
  const decreaseButton = await view.findByRole("button", { name: "Decrease Indent" });

  editor.commands.focus();
  editor.commands.setTextSelection(findTextPosition(editor, "Plain text") + 1);
  await waitFor(() => {
    assert.equal(increaseButton.disabled, false);
    assert.equal(decreaseButton.disabled, true);
  });

  await user.click(increaseButton);
  await waitFor(() => {
    const paragraph = view.container.querySelector("p[data-indent='1']");
    assert.ok(paragraph);
    assert.equal(paragraph.style.marginLeft, "2rem");
    assert.equal(decreaseButton.disabled, false);
  });

  editor.commands.setTextSelection(findTextPosition(editor, "Plain text"));
  fireEvent.keyDown(editor.view.dom, { key: "Tab", code: "Tab" });
  await waitFor(() => {
    assert.ok(view.container.querySelector("p[data-indent='2']"));
  });

  fireEvent.keyDown(editor.view.dom, { key: "Tab", code: "Tab", shiftKey: true });
  await waitFor(() => {
    assert.ok(view.container.querySelector("p[data-indent='1']"));
  });

  await user.click(decreaseButton);
  await waitFor(() => {
    const paragraph = Array.from(view.container.querySelectorAll("p")).find((item) => item.textContent === "Plain text");
    assert.ok(paragraph);
    assert.equal(paragraph.hasAttribute("data-indent"), false);
    assert.equal(paragraph.style.marginLeft, "");
  });

  editor.commands.setTextSelection(findTextPosition(editor, "Plain text") + "Plain".length);
  fireEvent.keyDown(editor.view.dom, { key: "Tab", code: "Tab" });
  await waitFor(() => {
    const paragraph = Array.from(view.container.querySelectorAll("p")).find((item) => item.textContent?.includes("Plain"));
    assert.equal(paragraph?.textContent, `Plain${"\u00a0".repeat(4)} text`);
    assert.equal(paragraph?.hasAttribute("data-indent"), false);
    assert.match(editor.getHTML(), /Plain(?:&nbsp;){4} text/);
  });

  editor.commands.setContent(editor.getHTML());
  await waitFor(() => {
    const paragraph = Array.from(view.container.querySelectorAll("p")).find((item) => item.textContent?.includes("Plain"));
    assert.equal(paragraph?.textContent, `Plain${"\u00a0".repeat(4)} text`);
  });
  editor.commands.setTextSelection(findTextPosition(editor, "Plain") + "Plain".length + 4);

  fireEvent.keyDown(editor.view.dom, { key: "Tab", code: "Tab", shiftKey: true });
  await waitFor(() => {
    const paragraph = Array.from(view.container.querySelectorAll("p")).find((item) => item.textContent === "Plain text");
    assert.ok(paragraph);
    assert.equal(paragraph.hasAttribute("data-indent"), false);
  });

  editor.commands.setTextSelection(findTextPosition(editor, "Quoted text"));
  fireEvent.keyDown(editor.view.dom, { key: "Tab", code: "Tab" });
  await waitFor(() => {
    const quote = view.container.querySelector("blockquote[data-indent='1']");
    assert.ok(quote);
    assert.equal(quote.style.marginLeft, "2rem");
    assert.equal(quote.querySelector("p")?.hasAttribute("data-indent"), false);
  });

  fireEvent.keyDown(editor.view.dom, { key: "Tab", code: "Tab", shiftKey: true });
  await waitFor(() => {
    assert.equal(view.container.querySelector("blockquote")?.hasAttribute("data-indent"), false);
  });
});

test("UEditor removes inline tabs atomically with Backspace and Delete", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();
  const view = render(
    React.createElement(UEditor, {
      ref,
      content: "<p>Plain text</p>",
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await waitFor(() => assert.ok(ref.current?.editor));
  const editor = ref.current.editor;
  const tabText = `Plain${"\u00a0".repeat(4)} text`;

  editor.commands.focus();
  editor.commands.setTextSelection(findTextPosition(editor, "Plain text") + "Plain".length);
  fireEvent.keyDown(editor.view.dom, { key: "Tab", code: "Tab" });
  await waitFor(() => assert.equal(view.container.querySelector("p")?.textContent, tabText));

  fireEvent.keyDown(editor.view.dom, { key: "Backspace", code: "Backspace" });
  await waitFor(() => assert.equal(view.container.querySelector("p")?.textContent, "Plain text"));

  assert.equal(editor.commands.undo(), true);
  await waitFor(() => assert.equal(view.container.querySelector("p")?.textContent, tabText));
  assert.equal(editor.commands.redo(), true);
  await waitFor(() => assert.equal(view.container.querySelector("p")?.textContent, "Plain text"));

  editor.commands.setTextSelection(findTextPosition(editor, "Plain text") + "Plain".length);
  fireEvent.keyDown(editor.view.dom, { key: "Tab", code: "Tab" });
  await waitFor(() => assert.equal(view.container.querySelector("p")?.textContent, tabText));
  editor.commands.setTextSelection(findTextPosition(editor, "Plain") + "Plain".length);

  fireEvent.keyDown(editor.view.dom, { key: "Delete", code: "Delete" });
  await waitFor(() => assert.equal(view.container.querySelector("p")?.textContent, "Plain text"));
});

test("UEditor removes block indentation before merging or lifting content with Backspace", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();
  const view = render(
    React.createElement(UEditor, {
      ref,
      content: [
        "<p>Before</p>",
        '<p data-indent="2" style="margin-left: 4rem">Indented</p>',
        '<p data-indent="2" style="margin-left: 4rem"></p>',
        '<blockquote data-indent="1" style="margin-left: 2rem"><p>Quoted</p></blockquote>',
      ].join(""),
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await waitFor(() => assert.ok(ref.current?.editor));
  const editor = ref.current.editor;
  editor.commands.focus();
  editor.commands.setTextSelection(findTextPosition(editor, "Indented"));

  fireEvent.keyDown(editor.view.dom, { key: "Backspace", code: "Backspace" });
  await waitFor(() => {
    const paragraph = Array.from(view.container.querySelectorAll("p")).find((node) => node.textContent === "Indented");
    assert.equal(paragraph?.getAttribute("data-indent"), "1");
    assert.equal(paragraph?.style.marginLeft, "2rem");
  });

  fireEvent.keyDown(editor.view.dom, { key: "Backspace", code: "Backspace" });
  await waitFor(() => {
    const paragraph = Array.from(view.container.querySelectorAll("p")).find((node) => node.textContent === "Indented");
    assert.ok(paragraph);
    assert.equal(paragraph.hasAttribute("data-indent"), false);
    assert.equal(paragraph.style.marginLeft, "");
  });

  fireEvent.keyDown(editor.view.dom, { key: "Backspace", code: "Backspace" });
  await waitFor(() => {
    assert.ok(Array.from(view.container.querySelectorAll("p")).some((node) => node.textContent === "BeforeIndented"));
  });

  const emptyIndentedPos = findNodePosition(
    editor,
    (node) => node.type.name === "paragraph" && node.textContent === "" && node.attrs.indent === 2,
  );
  editor.commands.setTextSelection(emptyIndentedPos + 1);
  fireEvent.keyDown(editor.view.dom, { key: "Backspace", code: "Backspace" });
  await waitFor(() => {
    const emptyIndented = Array.from(view.container.querySelectorAll("p[data-indent='1']")).find(
      (node) => node.textContent === "",
    );
    assert.ok(emptyIndented);
  });

  fireEvent.keyDown(editor.view.dom, { key: "Backspace", code: "Backspace" });
  await waitFor(() => {
    const emptyParagraph = Array.from(view.container.querySelectorAll("p")).find((node) => node.textContent === "");
    assert.ok(emptyParagraph);
    assert.equal(emptyParagraph.hasAttribute("data-indent"), false);
  });

  editor.commands.setTextSelection(findTextPosition(editor, "Quoted"));
  fireEvent.keyDown(editor.view.dom, { key: "Backspace", code: "Backspace" });
  await waitFor(() => {
    const quote = view.container.querySelector("blockquote");
    assert.ok(quote);
    assert.equal(quote.hasAttribute("data-indent"), false);
    assert.equal(quote.textContent, "Quoted");
  });
});

test("UEditor indent controls preserve semantic nested bullet and numbered lists", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();
  const user = userEvent.setup({ document: window.document });
  const view = render(
    React.createElement(UEditor, {
      ref,
      content: [
        "<ul><li><p>Bullet one</p></li><li><p>Bullet two</p></li></ul>",
        "<ol><li><p>Number one</p></li><li><p>Number two</p></li></ol>",
      ].join(""),
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await waitFor(() => assert.ok(ref.current?.editor));
  const editor = ref.current.editor;
  const increaseButton = await view.findByRole("button", { name: "Increase Indent" });
  const decreaseButton = await view.findByRole("button", { name: "Decrease Indent" });

  editor.commands.focus();
  editor.commands.setTextSelection(findTextPosition(editor, "Bullet two") + 1);
  await waitFor(() => assert.equal(increaseButton.disabled, false));
  await user.click(increaseButton);

  await waitFor(() => {
    assert.equal(view.container.querySelectorAll("ul ul").length, 1);
    assert.equal(view.container.querySelectorAll("[data-indent]").length, 0);
  });

  await waitFor(() => assert.equal(decreaseButton.disabled, false));
  await user.click(decreaseButton);
  await waitFor(() => assert.equal(view.container.querySelectorAll("ul ul").length, 0));

  editor.commands.setTextSelection(findTextPosition(editor, "Number two") + 1);
  fireEvent.keyDown(editor.view.dom, { key: "Tab", code: "Tab" });
  await waitFor(() => {
    assert.equal(view.container.querySelectorAll("ol ol").length, 1);
    assert.match(editor.getHTML(), /<ol[^>]*>.*<ol[^>]*>/s);
  });

  fireEvent.keyDown(editor.view.dom, { key: "Tab", code: "Tab", shiftKey: true });
  await waitFor(() => assert.equal(view.container.querySelectorAll("ol ol").length, 0));
});

test("UEditor uses semantic Backspace behavior for nested lists", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();
  const view = render(
    React.createElement(UEditor, {
      ref,
      content: "<ul><li><p>Parent</p><ul><li><p>Nested</p></li></ul></li></ul>",
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await waitFor(() => assert.ok(ref.current?.editor));
  const editor = ref.current.editor;
  editor.commands.focus();
  editor.commands.setTextSelection(findTextPosition(editor, "Nested"));

  fireEvent.keyDown(editor.view.dom, { key: "Backspace", code: "Backspace" });
  await waitFor(() => {
    assert.equal(view.container.querySelectorAll("ul ul").length, 0);
    assert.equal(view.container.querySelectorAll("ul > li").length, 2);
    assert.match(editor.getHTML(), /<li[^>]*><p[^>]*>Nested<\/p><\/li>/);
  });
});

test("UEditor keeps Tab and Shift+Tab reserved for table cell navigation", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();
  const view = render(
    React.createElement(UEditor, {
      ref,
      content: "<table><tbody><tr><td>Cell A</td><td>Cell B</td></tr></tbody></table>",
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await waitFor(() => assert.ok(ref.current?.editor));
  const editor = ref.current.editor;
  editor.commands.focus();
  editor.commands.setTextSelection(findTextPosition(editor, "Cell A") + 1);

  fireEvent.keyDown(editor.view.dom, { key: "Tab", code: "Tab" });
  await waitFor(() => {
    const { $from } = editor.state.selection;
    const selectedCell = Array.from({ length: $from.depth }, (_, index) => $from.node($from.depth - index))
      .find((node) => node.type.name === "tableCell" || node.type.name === "tableHeader");
    assert.equal(selectedCell?.textContent, "Cell B");
    assert.equal(view.container.querySelectorAll("[data-indent]").length, 0);
  });

  fireEvent.keyDown(editor.view.dom, { key: "Tab", code: "Tab", shiftKey: true });
  await waitFor(() => {
    const { $from } = editor.state.selection;
    const selectedCell = Array.from({ length: $from.depth }, (_, index) => $from.node($from.depth - index))
      .find((node) => node.type.name === "tableCell" || node.type.name === "tableHeader");
    assert.equal(selectedCell?.textContent, "Cell A");
  });
});

test("UEditor preserves, batches, and clamps block indentation in HTML", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();
  const view = render(
    React.createElement(UEditor, {
      ref,
      content: '<p data-indent="2" style="margin-left: 4rem">First block</p><p>Second block</p>',
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await waitFor(() => assert.ok(ref.current?.editor));
  const editor = ref.current.editor;
  assert.match(editor.getHTML(), /data-indent="2"/);
  assert.match(editor.getHTML(), /margin-left: 4rem/);

  const firstPos = findTextPosition(editor, "First block");
  const secondPos = findTextPosition(editor, "Second block");
  editor.commands.setTextSelection({ from: firstPos, to: secondPos + "Second block".length });
  assert.equal(editor.commands.increaseIndent(), true);

  await waitFor(() => {
    const paragraphs = view.container.querySelectorAll("p");
    assert.equal(paragraphs[0]?.getAttribute("data-indent"), "3");
    assert.equal(paragraphs[1]?.getAttribute("data-indent"), "1");
  });

  editor.commands.setTextSelection(findTextPosition(editor, "First block") + 1);
  for (let index = 0; index < 10; index += 1) {
    editor.commands.increaseIndent();
  }

  await waitFor(() => {
    const firstParagraph = Array.from(view.container.querySelectorAll("p")).find((item) => item.textContent === "First block");
    assert.equal(firstParagraph?.getAttribute("data-indent"), "6");
    assert.equal(firstParagraph?.style.marginLeft, "12rem");
    assert.equal(editor.can().increaseIndent(), false);
  });
});

test("UEditor toolbar checkbox button inserts the same form checkbox as the slash command", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const user = userEvent.setup({ document: window.document });

  const view = render(
    React.createElement(UEditor, {
      content: "<p>Task item</p>",
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await user.click(await view.findByText("Task item"));
  await user.click(await view.findByRole("button", { name: "Form Checkbox" }));
  const squareCheckboxOption = await within(window.document.body).findByText("Form Checkbox");
  const squareCheckboxButton = squareCheckboxOption.closest("button");
  assert.ok(squareCheckboxButton);
  await user.click(squareCheckboxButton);

  await waitFor(() => {
    assert.ok(within(view.container).getByRole("checkbox"));
    assert.equal(view.container.querySelector('ul[data-type="taskList"]'), null);
  });
});

test("UEditor toolbar inserts a round checkbox variant", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();
  const user = userEvent.setup({ document: window.document });

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: "<p>Round task</p>",
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await user.click(await view.findByText("Round task"));
  await user.click(await view.findByRole("button", { name: "Form Checkbox" }));
  const roundCheckboxOption = await within(window.document.body).findByText("Round Checkbox");
  const roundCheckboxButton = roundCheckboxOption.closest("button");
  assert.ok(roundCheckboxButton);
  await user.click(roundCheckboxButton);

  await waitFor(() => {
    assert.ok(within(view.container).getByRole("checkbox"));
    assert.match(ref.current?.editor?.getHTML() ?? "", /data-variant="circle"/);
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
  const toolbar = view.getByRole("toolbar");
  assert.match(toolbar.className, /min-h-12/);
  assert.equal(view.queryByRole("button", { name: "Insert Emoji" }), null);
  assert.equal(view.getByRole("button", { name: "Text Style" }).querySelectorAll("svg").length, 1);
  assert.equal(view.getByRole("button", { name: "Alignment" }).querySelectorAll("svg").length, 1);
  assert.equal(view.getByRole("button", { name: "Bullet List" }).querySelectorAll("svg").length, 1);

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

test("UEditor normalizes empty spreadsheet HTML table cells before inserting the table", async () => {
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
        "<table><tbody><tr><td>Name</td><td>Value</td><td><span></span></td></tr><tr><td>USP</td><td><br></td><td><p></p></td></tr></tbody></table>",
        "<!--EndFragment-->",
        "</body></html>",
      ].join(""),
      text: "Name\tValue\t\nUSP\t\t",
    }),
  });

  await waitFor(() => {
    assert.equal(view.container.querySelectorAll("table").length, 1);
    assert.equal(view.container.querySelectorAll("td").length, 6);
    assert.equal(view.container.querySelector("img"), null);
  });

  const emptyCells = Array.from(view.container.querySelectorAll("td")).filter((cell) => cell.textContent === "");
  assert.ok(emptyCells.length >= 3);
  for (const cell of emptyCells) {
    assert.ok(cell.querySelector("p"));
  }
});

test("UEditor pads sparse spreadsheet rows to the widest TSV column count", async () => {
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
      text: 'Header\tBody\tMeta\tStatus\nUSP\t"- Easy to learn\n- Cute characters\n- Brain teasing"',
    }),
  });

  await waitFor(() => {
    assert.equal(view.container.querySelectorAll("table").length, 1);
    assert.equal(view.container.querySelectorAll("tr").length, 2);
    assert.equal(view.container.querySelectorAll("td").length, 8);
    assert.equal(view.container.querySelector("img"), null);
  });

  const secondRowCells = view.container.querySelectorAll("tr")[1]?.querySelectorAll("td");
  assert.ok(secondRowCells);
  assert.equal(secondRowCells.length, 4);
  assert.equal(secondRowCells[1].querySelectorAll("p").length, 3);
  assert.equal(secondRowCells[1].querySelectorAll("p")[0]?.textContent, "- Easy to learn");
  assert.equal(secondRowCells[1].querySelectorAll("p")[1]?.textContent, "- Cute characters");
  assert.equal(secondRowCells[1].querySelectorAll("p")[2]?.textContent, "- Brain teasing");
  assert.equal(secondRowCells[2].textContent, "");
  assert.equal(secondRowCells[3].textContent, "");
});

test("UEditor pastes the provided sparse Vietnamese spreadsheet clipboard as a valid table", async () => {
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

  const emptyTail = "\t".repeat(32);
  const spreadsheetText = [
    `\tTên minigame\tPose to Hide: Tricky Puzzle${emptyTail}`,
    `\tRef\thttps://play.google.com/store/apps/details?id=com.human.posing.hf&amp;hl=vi${emptyTail}`,
    `\tFigma demo\thttps://www.figma.com/design/maL1GYd2GAGOzkEyDzlQk0/25---Pose-to-Hide--Tricky-Puzzle?node-id=0-1&amp;p=f&amp;t=Afa0lYt0sA4kpf3w-0${emptyTail}`,
    `\tGiới thiệu\tPose to Hide: Tricky Puzzle là một trò chơi vui nhộn, trong đó bạn phải tránh sự chú ý của người canh giữ bằng cách thay đổi dáng pose của nhân vật và đặt vào vị trí thích hợp để hòa vào khung cảnh.${emptyTail}`,
    `\tUSP\t"- Lối chơi vui nhộn và dễ chơi\n- Nhân vật hoạt hình đáng yêu\n- Thử thách trí não hấp dẫn\n- Ghi nhớ và bắt chước để hoàn thành nhiệm vụ"${emptyTail}`,
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
  });

  const rows = view.container.querySelectorAll("tr");
  const firstRowCells = rows[0]?.querySelectorAll("td") ?? [];
  const uspCells = rows[4]?.querySelectorAll("td") ?? [];

  assert.ok(firstRowCells.length > 30);
  assert.equal(firstRowCells[0]?.textContent, "");
  assert.equal(firstRowCells[1]?.textContent, "Tên minigame");
  assert.equal(firstRowCells[2]?.textContent, "Pose to Hide: Tricky Puzzle");
  assert.equal(uspCells[1]?.textContent, "USP");
  assert.equal(uspCells[2]?.querySelectorAll("p").length, 4);
  assert.match(uspCells[2]?.textContent ?? "", /Ghi nhớ và bắt chước/);
  assert.ok(Array.from(uspCells).slice(3).every((cell) => cell.querySelector("p")));
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

test("UEditor preserves table formula metadata on cells and headers", async () => {
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
              <th data-cell-id="A1" data-number-format="text">Name</th>
              <th data-cell-id="B1" data-number-format="number" data-formula="=SUM(B2:B3)" data-computed-value="30">Total</th>
            </tr>
            <tr>
              <td data-cell-id="A2" data-number-format="text">Alpha</td>
              <td data-cell-id="B2" data-number-format="number" data-computed-value="10">10</td>
            </tr>
            <tr>
              <td data-cell-id="A3" data-number-format="text">Beta</td>
              <td data-cell-id="B3" data-number-format="number" data-computed-value="20">20</td>
            </tr>
          </tbody>
        </table>`,
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await view.findByText("Total");
  await waitFor(() => {
    assert.ok(ref.current);
  });

  const totalHeader = view.container.querySelector("th[data-cell-id='B1']");
  const valueCell = view.container.querySelector("td[data-cell-id='B2']");
  assert.equal(totalHeader?.getAttribute("data-formula"), "=SUM(B2:B3)");
  assert.equal(totalHeader?.getAttribute("data-computed-value"), "30");
  assert.equal(totalHeader?.getAttribute("data-formula-state"), "computed");
  assert.equal(valueCell?.getAttribute("data-number-format"), "number");

  const result = await ref.current.prepareContentForSave({ throwOnError: true });
  assert.match(result.html, /<th[^>]*data-cell-id="B1"[^>]*data-number-format="number"[^>]*data-formula="=SUM\(B2:B3\)"[^>]*data-computed-value="30"[^>]*data-formula-state="computed"/);
  assert.match(result.html, /<td[^>]*data-cell-id="B2"[^>]*data-number-format="number"[^>]*data-computed-value="10"/);
});

test("UEditor bubble menu opens the table formula panel", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const user = userEvent.setup({ document: window.document });
  const body = within(window.document.body);
  const ref = React.createRef();

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: "<table><tbody><tr><td>10</td><td>Total</td></tr><tr><td>20</td><td></td></tr></tbody></table>",
      showToolbar: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  const formulaCell = await waitFor(() => {
    const element = view.container.querySelectorAll("tr")[0]?.querySelectorAll("td")[1];
    assert.ok(element);
    return element;
  });
  await waitFor(() => {
    assert.ok(ref.current?.editor);
  });

  const cellPositions = [];
  ref.current.editor.state.doc.descendants((node, pos) => {
    if (node.type.name === "tableCell" || node.type.name === "tableHeader") {
      cellPositions.push(pos);
    }
    return true;
  });
  assert.equal(cellPositions.length, 4);
  assert.equal(
    ref.current.editor.commands.setCellSelection({ anchorCell: cellPositions[1], headCell: cellPositions[1] }),
    true,
  );
  ref.current.editor.view.focus();

  const formulaButton = await body.findByRole("button", { name: "Formula" });
  assert.equal(body.queryByRole("button", { name: "Bold" }), null);
  await user.click(formulaButton);

  const formulaInput = await body.findByRole("textbox", { name: "Formula" });
  assert.equal(formulaInput.getAttribute("placeholder"), "=SUM(A1:A3)");
  await body.findByText("Number Format");
  await body.findByRole("button", { name: "Text" });
  await body.findByRole("button", { name: "$" });
  await body.findByRole("button", { name: "%" });
  await body.findByRole("button", { name: "Date" });
  await body.findByRole("button", { name: "Apply" });
  await body.findByRole("button", { name: "Clear" });
  await body.findByRole("button", { name: "Recalculate" });
});

test("UEditor bubble menu applies spreadsheet-style borders to selected cell edges", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const user = userEvent.setup({ document: window.document });
  const body = within(window.document.body);
  const ref = React.createRef();

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: "<table><tbody><tr><td>A1</td><td>B1</td></tr><tr><td>A2</td><td>B2</td></tr></tbody></table>",
      showToolbar: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await waitFor(() => {
    assert.equal(view.container.querySelectorAll("td").length, 4);
  });
  await waitFor(() => {
    assert.ok(ref.current?.editor);
  });

  const getCellPositions = () => {
    const cellPositions = [];
    ref.current.editor.state.doc.descendants((node, pos) => {
      if (node.type.name === "tableCell" || node.type.name === "tableHeader") {
        cellPositions.push(pos);
      }
      return true;
    });
    assert.equal(cellPositions.length, 4);
    return cellPositions;
  };

  const selectCells = (anchorIndex, headIndex) => {
    const cellPositions = getCellPositions();
    assert.equal(
      ref.current.editor.commands.setCellSelection({ anchorCell: cellPositions[anchorIndex], headCell: cellPositions[headIndex] }),
      true,
    );
    ref.current.editor.view.focus();
  };

  selectCells(0, 0);

  await user.click(await body.findByRole("button", { name: "Cell Border" }));
  assert.equal(body.queryByRole("button", { name: "Done" }), null);
  assert.ok(body.getByRole("button", { name: "All borders" }).querySelector("[stroke-dasharray]"));

  await user.click(await body.findByRole("button", { name: "Dotted" }));
  await waitFor(() => {
    const cells = view.container.querySelectorAll("td");
    assert.equal(cells[0].getAttribute("data-border-style"), "dotted");
    assert.equal(cells[1].getAttribute("data-border-style"), "solid solid solid dotted");
    assert.equal(cells[2].getAttribute("data-border-style"), "dotted solid solid");
    assert.equal(cells[3].getAttribute("data-border-style"), null);
  });

  selectCells(0, 3);
  await user.click(await body.findByRole("button", { name: "Dashed" }));
  await waitFor(() => {
    const cells = view.container.querySelectorAll("td");
    for (const cell of cells) assert.equal(cell.getAttribute("data-border-style"), "dashed");
  });
  await user.click(await body.findByRole("button", { name: "3px" }));
  await waitFor(() => {
    const cells = view.container.querySelectorAll("td");
    for (const cell of cells) assert.equal(cell.getAttribute("data-border-width"), "3px");
  });
  await user.click(await body.findByRole("button", { name: "Border Color" }));
  await user.click(await body.findByRole("button", { name: "Black" }));
  await waitFor(() => {
    const cells = view.container.querySelectorAll("td");
    for (const cell of cells) {
      assert.equal(cell.getAttribute("data-border-style"), "dashed");
      assert.equal(cell.getAttribute("data-border-width"), "3px");
      assert.equal(cell.getAttribute("data-border-color"), "#000000");
      assert.match(cell.getAttribute("style") ?? "", /border-style:\s*dashed/i);
    }
  });

  await user.click(await body.findByRole("button", { name: "Hide borders" }));
  await user.click(await body.findByRole("button", { name: "Right border" }));
  await waitFor(() => {
    const cells = view.container.querySelectorAll("td");
    assert.equal(cells[0].getAttribute("data-border-style"), "dashed");
    assert.equal(cells[1].getAttribute("data-border-style"), "dashed none dashed dashed");
    assert.equal(cells[2].getAttribute("data-border-style"), "dashed");
    assert.equal(cells[3].getAttribute("data-border-style"), "dashed none dashed dashed");
  });

  await user.click(view.container);
  await waitFor(() => {
    assert.equal(body.queryByRole("button", { name: "Dotted" }), null);
  });

  const cells = view.container.querySelectorAll("td");
  await user.dblClick(cells[0]);
  await body.findByRole("button", { name: "Cell Border" });
  assert.equal(ref.current.editor.state.selection.constructor.name, "CellSelection");
  assert.equal(body.queryByRole("button", { name: "Bold" }), null);

  const firstCellText = cells[0].querySelector("p")?.firstChild;
  assert.ok(firstCellText);
  const firstCellTextPos = ref.current.editor.view.posAtDOM(firstCellText, 0);
  ref.current.editor.commands.focus();
  suppressTextSelectionEndpointWarning(() => {
    ref.current.editor.commands.setTextSelection({ from: firstCellTextPos, to: firstCellTextPos + 2 });
  });
  await body.findByRole("button", { name: "Bold" });
  assert.equal(body.queryByRole("button", { name: "Cell Border" }), null);
  assert.equal(body.queryByRole("button", { name: "Formula" }), null);

  selectCells(1, 1);
  await body.findByRole("button", { name: "Cell Border" });
  assert.equal(body.queryByRole("button", { name: "Bold" }), null);
});

test("UEditor table formula command writes formula metadata and computed value", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const formulaCommands = await importTsModule(path.join(componentsRoot, "UEditor/table-formula-commands.ts"));
  const UEditor = mod.default;
  const ref = React.createRef();

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: "<table><tbody><tr><td>10</td><td>Total</td></tr><tr><td>20</td><td></td></tr></tbody></table>",
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  const formulaCell = await waitFor(() => {
    const element = view.container.querySelectorAll("tr")[0]?.querySelectorAll("td")[1];
    assert.ok(element);
    return element;
  });
  await waitFor(() => {
    assert.ok(ref.current?.editor);
  });

  const totalTextNode = formulaCell.querySelector("p")?.firstChild;
  assert.ok(totalTextNode);
  const totalTextPos = ref.current.editor.view.posAtDOM(totalTextNode, 0);
  ref.current.editor.commands.focus();
  suppressTextSelectionEndpointWarning(() => {
    ref.current.editor.commands.setTextSelection({ from: totalTextPos, to: totalTextPos + "Total".length });
  });

  assert.equal(formulaCommands.setSelectedTableCellFormula(ref.current.editor, "=SUM(A1:A2)"), true);

  await waitFor(() => {
    const updatedFormulaCell = view.container.querySelectorAll("tr")[0]?.querySelectorAll("td")[1];
    assert.equal(updatedFormulaCell?.getAttribute("data-formula"), "=SUM(A1:A2)");
    assert.equal(updatedFormulaCell?.getAttribute("data-computed-value"), "30");
    assert.equal(updatedFormulaCell?.textContent?.trim(), "30");
  });

  const computedTextNode = view.container.querySelectorAll("tr")[0]?.querySelectorAll("td")[1]?.querySelector("p")?.firstChild;
  assert.ok(computedTextNode);
  const computedTextPos = ref.current.editor.view.posAtDOM(computedTextNode, 0);
  suppressTextSelectionEndpointWarning(() => {
    ref.current.editor.commands.setTextSelection({ from: computedTextPos, to: computedTextPos + "30".length });
  });

  assert.equal(formulaCommands.setSelectedTableCellNumberFormat(ref.current.editor, "currency"), true);
  await waitFor(() => {
    const updatedFormulaCell = view.container.querySelectorAll("tr")[0]?.querySelectorAll("td")[1];
    assert.equal(updatedFormulaCell?.getAttribute("data-number-format"), "currency");
    assert.equal(updatedFormulaCell?.getAttribute("data-computed-value"), "30");
    assert.equal(updatedFormulaCell?.textContent?.trim(), "$30.00");
  });

  const result = await ref.current.prepareContentForSave({ throwOnError: true });
  assert.match(result.html, /<td[^>]*data-number-format="currency"[^>]*data-formula="=SUM\(A1:A2\)"[^>]*data-computed-value="30"/);
});

test("UEditor table formula command recalculates dependent cells", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const formulaCommands = await importTsModule(path.join(componentsRoot, "UEditor/table-formula-commands.ts"));
  const UEditor = mod.default;
  const ref = React.createRef();

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: '<table><tbody><tr><td>10</td><td data-formula="=A1*2" data-computed-value="20">20</td><td data-formula="=B1+1" data-computed-value="21">21</td></tr></tbody></table>',
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  const dependentSourceCell = await waitFor(() => {
    const element = view.container.querySelectorAll("td")[1];
    assert.ok(element);
    return element;
  });
  await waitFor(() => {
    assert.ok(ref.current?.editor);
  });

  const sourceTextNode = dependentSourceCell.querySelector("p")?.firstChild;
  assert.ok(sourceTextNode);
  const sourceTextPos = ref.current.editor.view.posAtDOM(sourceTextNode, 0);
  ref.current.editor.commands.focus();
  suppressTextSelectionEndpointWarning(() => {
    ref.current.editor.commands.setTextSelection({ from: sourceTextPos, to: sourceTextPos + "20".length });
  });

  assert.equal(formulaCommands.setSelectedTableCellFormula(ref.current.editor, "=A1*3"), true);

  await waitFor(() => {
    const cells = view.container.querySelectorAll("td");
    assert.equal(cells[1]?.getAttribute("data-formula"), "=A1*3");
    assert.equal(cells[1]?.getAttribute("data-computed-value"), "30");
    assert.equal(cells[1]?.textContent?.trim(), "30");
    assert.equal(cells[2]?.getAttribute("data-computed-value"), "31");
    assert.equal(cells[2]?.textContent?.trim(), "31");
  });

  const updatedSourceTextNode = view.container.querySelectorAll("td")[1]?.querySelector("p")?.firstChild;
  assert.ok(updatedSourceTextNode);
  const updatedSourceTextPos = ref.current.editor.view.posAtDOM(updatedSourceTextNode, 0);
  suppressTextSelectionEndpointWarning(() => {
    ref.current.editor.commands.setTextSelection({ from: updatedSourceTextPos, to: updatedSourceTextPos + "30".length });
  });

  assert.equal(formulaCommands.clearSelectedTableCellFormula(ref.current.editor), true);

  await waitFor(() => {
    const cells = view.container.querySelectorAll("td");
    assert.equal(cells[1]?.getAttribute("data-formula"), null);
    assert.equal(cells[1]?.getAttribute("data-computed-value"), null);
    assert.equal(cells[1]?.textContent?.trim(), "");
    assert.equal(cells[2]?.getAttribute("data-computed-value"), "#INVALID-REFERENCE");
    assert.equal(cells[2]?.textContent?.trim(), "#INVALID-REFERENCE");
  });

  assert.equal(formulaCommands.setSelectedTableCellFormula(ref.current.editor, "=A1*4"), true);
  await waitFor(() => {
    const cells = view.container.querySelectorAll("td");
    assert.equal(cells[1]?.textContent?.trim(), "40");
    assert.equal(cells[2]?.textContent?.trim(), "41");
  });

  assert.equal(formulaCommands.convertSelectedTableCellFormulaToValue(ref.current.editor), true);
  await waitFor(() => {
    const cells = view.container.querySelectorAll("td");
    assert.equal(cells[1]?.getAttribute("data-formula"), null);
    assert.equal(cells[1]?.getAttribute("data-computed-value"), null);
    assert.equal(cells[1]?.textContent?.trim(), "40");
    assert.equal(cells[2]?.getAttribute("data-computed-value"), "41");
    assert.equal(cells[2]?.textContent?.trim(), "41");
  });
});

test("UEditor keeps the selected formula cell after earlier dependent values resize", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const formulaCommands = await importTsModule(path.join(componentsRoot, "UEditor/table-formula-commands.ts"));
  const UEditor = mod.default;
  const ref = React.createRef();

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: [
        "<table><tbody><tr>",
        "<td>10</td>",
        '<td data-formula="=C1+1" data-computed-value="21">21</td>',
        '<td data-formula="=A1*2" data-computed-value="20">20</td>',
        "</tr></tbody></table>",
      ].join(""),
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await waitFor(() => assert.ok(ref.current?.editor));
  ref.current.editor.commands.focus();
  const selectedFormulaPos = findTextPosition(ref.current.editor, "20");
  suppressTextSelectionEndpointWarning(() => {
    ref.current.editor.commands.setTextSelection(selectedFormulaPos);
  });

  assert.equal(formulaCommands.setSelectedTableCellFormula(ref.current.editor, "=A1*100000"), true);
  await waitFor(() => {
    const cells = view.container.querySelectorAll("td");
    assert.equal(cells[1]?.textContent?.trim(), "1000001");
    assert.equal(cells[2]?.textContent?.trim(), "1000000");
  });

  const selectedCell = formulaCommands.getSelectedTableFormulaCell(ref.current.editor);
  assert.equal(selectedCell?.label, "C1");
  assert.equal(selectedCell?.formula, "=A1*100000");
  assert.equal(formulaCommands.convertSelectedTableCellFormulaToValue(ref.current.editor), true);

  await waitFor(() => {
    const cells = view.container.querySelectorAll("td");
    assert.equal(cells[1]?.getAttribute("data-formula"), "=C1+1");
    assert.equal(cells[1]?.textContent?.trim(), "1000001");
    assert.equal(cells[2]?.getAttribute("data-formula"), null);
    assert.equal(cells[2]?.textContent?.trim(), "1000000");
  });
});

test("UEditor table formula recalculate follows dependencies and marks circular references", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const formulaCommands = await importTsModule(path.join(componentsRoot, "UEditor/table-formula-commands.ts"));
  const UEditor = mod.default;
  const ref = React.createRef();

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: `
        <table>
          <tbody>
            <tr>
              <td>10</td>
              <td data-formula="=A1*2" data-computed-value="0">0</td>
              <td data-formula="=B1+5" data-computed-value="0">0</td>
            </tr>
            <tr>
              <td data-formula="=B2" data-computed-value="0">0</td>
              <td data-formula="=A2" data-computed-value="0">0</td>
              <td>tail</td>
            </tr>
          </tbody>
        </table>`,
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
  await waitFor(() => {
    assert.ok(ref.current?.editor);
  });

  const firstTextNode = firstCell.querySelector("p")?.firstChild;
  assert.ok(firstTextNode);
  const firstTextPos = ref.current.editor.view.posAtDOM(firstTextNode, 0);
  ref.current.editor.commands.focus();
  suppressTextSelectionEndpointWarning(() => {
    ref.current.editor.commands.setTextSelection({ from: firstTextPos, to: firstTextPos + "10".length });
  });

  formulaCommands.recalculateSelectedTable(ref.current.editor);

  await waitFor(() => {
    const cells = view.container.querySelectorAll("td");
    assert.equal(cells[1]?.getAttribute("data-computed-value"), "20");
    assert.equal(cells[1]?.getAttribute("data-formula-state"), "computed");
    assert.equal(cells[1]?.textContent?.trim(), "20");
    assert.equal(cells[2]?.getAttribute("data-computed-value"), "25");
    assert.equal(cells[2]?.textContent?.trim(), "25");
    assert.equal(cells[3]?.getAttribute("data-computed-value"), "#CIRCULAR-REFERENCE");
    assert.equal(cells[3]?.getAttribute("data-formula-state"), "error");
    assert.equal(cells[3]?.textContent?.trim(), "#CIRCULAR-REFERENCE");
    assert.equal(cells[4]?.getAttribute("data-computed-value"), "#CIRCULAR-REFERENCE");
  });
});

test("UEditor automatically recalculates table formulas after cell edits", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();
  const htmlUpdates = [];

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: '<table><tbody><tr><td>10</td><td data-formula="=A1*2" data-computed-value="0">0</td></tr></tbody></table>',
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
      onHtmlChange: (html) => htmlUpdates.push(html),
    }),
  );

  const sourceCell = await waitFor(() => {
    const element = view.container.querySelector("td");
    assert.ok(element);
    return element;
  });
  await waitFor(() => {
    assert.ok(ref.current?.editor);
  });

  await waitFor(() => {
    const formulaCell = view.container.querySelectorAll("td")[1];
    assert.equal(formulaCell?.getAttribute("data-computed-value"), "20");
    assert.equal(formulaCell?.textContent?.trim(), "20");
  });
  htmlUpdates.length = 0;

  const sourceTextNode = sourceCell.querySelector("p")?.firstChild;
  assert.ok(sourceTextNode);
  const sourceTextPos = ref.current.editor.view.posAtDOM(sourceTextNode, 0);
  ref.current.editor.commands.focus();
  suppressTextSelectionEndpointWarning(() => {
    ref.current.editor.commands.setTextSelection({ from: sourceTextPos, to: sourceTextPos + "10".length });
  });
  ref.current.editor.commands.insertContent("15");

  await waitFor(() => {
    const formulaCell = view.container.querySelectorAll("td")[1];
    assert.equal(formulaCell?.getAttribute("data-computed-value"), "30");
    assert.equal(formulaCell?.textContent?.trim(), "30");
  });
  assert.equal(htmlUpdates.length, 1);
  assert.match(htmlUpdates[0] ?? "", /data-computed-value="30"/);
  assert.match(htmlUpdates[0] ?? "", />30<\/p>/);
});

test("UEditor recalculates dependencies for every cell changed in one transaction", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: [
        "<table><tbody><tr>",
        "<td>10</td>",
        "<td>20</td>",
        '<td data-formula="=B1*2" data-computed-value="0">0</td>',
        "</tr></tbody></table>",
      ].join(""),
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await waitFor(() => assert.ok(ref.current?.editor));
  const editor = ref.current.editor;
  await waitFor(() => {
    assert.equal(view.container.querySelectorAll("td")[2]?.textContent?.trim(), "40");
  });

  editor.commands.focus();
  const firstSourcePos = findTextPosition(editor, "10");
  const secondSourcePos = findTextPosition(editor, "20");
  editor.commands.setTextSelection(firstSourcePos);

  const transaction = editor.state.tr
    .insertText("7", secondSourcePos, secondSourcePos + 2)
    .insertText("3", firstSourcePos, firstSourcePos + 2);
  editor.view.dispatch(transaction);

  await waitFor(() => {
    const cells = view.container.querySelectorAll("td");
    assert.equal(cells[0]?.textContent?.trim(), "3");
    assert.equal(cells[1]?.textContent?.trim(), "7");
    assert.equal(cells[2]?.getAttribute("data-computed-value"), "14");
    assert.equal(cells[2]?.textContent?.trim(), "14");
  });
});

test("UEditor recalculates merged-table formulas with cell-scoped transactions", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: [
        "<table><tbody>",
        '<tr><td rowspan="2">2</td><td data-formula="=A1*2" data-computed-value="0">0</td></tr>',
        '<tr><td data-formula="=A1*3" data-computed-value="0">0</td></tr>',
        "</tbody></table>",
      ].join(""),
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await waitFor(() => assert.ok(ref.current?.editor));
  const editor = ref.current.editor;
  await waitFor(() => {
    const cells = view.container.querySelectorAll("td");
    assert.equal(cells[1]?.getAttribute("data-computed-value"), "4");
    assert.equal(cells[2]?.getAttribute("data-computed-value"), "6");
  });

  const formulaStepCounts = [];
  const trackFormulaTransaction = ({ appendedTransactions, transaction }) => {
    for (const candidate of [transaction, ...appendedTransactions]) {
      if (candidate.getMeta("ueditorTableFormulaRecalculate")) {
        formulaStepCounts.push(candidate.steps.length);
      }
    }
  };
  editor.on("transaction", trackFormulaTransaction);

  editor.commands.focus();
  const sourcePos = findTextPosition(editor, "2");
  editor.commands.setTextSelection({ from: sourcePos, to: sourcePos + 1 });
  editor.commands.insertContent("3");

  await waitFor(() => {
    const cells = view.container.querySelectorAll("td");
    assert.equal(cells[1]?.getAttribute("data-computed-value"), "6");
    assert.equal(cells[2]?.getAttribute("data-computed-value"), "9");
  });
  assert.equal(formulaStepCounts.at(-1), 2);
  editor.off("transaction", trackFormulaTransaction);
});

test("UEditor automatically recalculates only the active table after cell edits", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: [
        '<table><tbody><tr><td>10</td><td data-formula="=A1*2" data-computed-value="0">0</td></tr></tbody></table>',
        "<p>Between</p>",
        '<table><tbody><tr><td>100</td><td data-formula="=A1*2" data-computed-value="0">0</td></tr></tbody></table>',
      ].join(""),
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  const sourceCell = await waitFor(() => {
    const element = view.container.querySelector("td");
    assert.ok(element);
    return element;
  });
  await waitFor(() => {
    assert.ok(ref.current?.editor);
  });

  await waitFor(() => {
    const cells = view.container.querySelectorAll("td");
    assert.equal(cells[1]?.getAttribute("data-computed-value"), "20");
    assert.equal(cells[1]?.textContent?.trim(), "20");
    assert.equal(cells[3]?.getAttribute("data-computed-value"), "200");
    assert.equal(cells[3]?.textContent?.trim(), "200");
  });

  const sourceTextNode = sourceCell.querySelector("p")?.firstChild;
  assert.ok(sourceTextNode);
  const sourceTextPos = ref.current.editor.view.posAtDOM(sourceTextNode, 0);
  ref.current.editor.commands.focus();
  suppressTextSelectionEndpointWarning(() => {
    ref.current.editor.commands.setTextSelection({ from: sourceTextPos, to: sourceTextPos + "10".length });
  });
  ref.current.editor.commands.insertContent("15");

  await waitFor(() => {
    const cells = view.container.querySelectorAll("td");
    assert.equal(cells[1]?.getAttribute("data-computed-value"), "30");
    assert.equal(cells[1]?.textContent?.trim(), "30");
    assert.equal(cells[3]?.getAttribute("data-computed-value"), "200");
    assert.equal(cells[3]?.textContent?.trim(), "200");
  });
});

test("UEditor formats formula display values without changing raw computed values", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;

  const view = render(
    React.createElement(UEditor, {
      content: `
        <table>
          <tbody>
            <tr>
              <td>1234.5</td>
              <td data-number-format="currency" data-formula="=A1" data-computed-value="0">0</td>
              <td data-number-format="percent" data-formula="=A2" data-computed-value="0">0</td>
              <td data-number-format="date" data-formula="=A3" data-computed-value="0">0</td>
            </tr>
            <tr><td>0.125</td><td></td><td></td><td></td></tr>
            <tr><td>45658</td><td></td><td></td><td></td></tr>
          </tbody>
        </table>`,
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await waitFor(() => {
    const cells = view.container.querySelectorAll("td");
    assert.equal(cells[1]?.getAttribute("data-computed-value"), "1234.5");
    assert.equal(cells[1]?.textContent?.trim(), "$1,234.50");
    assert.equal(cells[2]?.getAttribute("data-computed-value"), "0.125");
    assert.equal(cells[2]?.textContent?.trim(), "12.5%");
    assert.equal(cells[3]?.getAttribute("data-computed-value"), "45658");
    assert.equal(cells[3]?.textContent?.trim(), "01/01/2025");
  });
});

test("UEditor promotes typed table formula text into computed formula cells", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;

  const view = render(
    React.createElement(UEditor, {
      content: "<table><tbody><tr><td>10</td><td>=SUM(A1:A2)</td></tr><tr><td>20</td><td></td></tr></tbody></table>",
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  const formulaCell = await waitFor(() => {
    const element = view.container.querySelectorAll("tr")[0]?.querySelectorAll("td")[1];
    assert.ok(element);
    return element;
  });
  assert.equal(formulaCell.textContent?.trim(), "=SUM(A1:A2)");

  await waitFor(() => {
    const updatedFormulaCell = view.container.querySelectorAll("tr")[0]?.querySelectorAll("td")[1];
    assert.equal(updatedFormulaCell?.getAttribute("data-formula"), "=SUM(A1:A2)");
    assert.equal(updatedFormulaCell?.getAttribute("data-computed-value"), "30");
    assert.equal(updatedFormulaCell?.getAttribute("data-formula-state"), "computed");
    assert.equal(updatedFormulaCell?.textContent?.trim(), "30");
  });
});

test("UEditor keeps a typed complete formula editable until the user leaves the cell", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: "<table><tbody><tr><td>10</td><td>draft</td></tr><tr><td>20</td><td></td></tr><tr><td>30</td><td></td></tr></tbody></table>",
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await waitFor(() => {
    assert.ok(ref.current?.editor);
  });

  const formulaCell = await waitFor(() => {
    const element = view.container.querySelectorAll("tr")[0]?.querySelectorAll("td")[1];
    assert.ok(element);
    return element;
  });
  const formulaTextPos = findTextPosition(ref.current.editor, "draft");

  ref.current.editor.commands.focus();
  suppressTextSelectionEndpointWarning(() => {
    ref.current.editor.commands.setTextSelection({ from: formulaTextPos, to: formulaTextPos + "draft".length + 2 });
  });
  ref.current.editor.commands.insertContent("=SUM(A1:A3)");

  await waitFor(() => {
    const activeFormulaCell = view.container.querySelectorAll("tr")[0]?.querySelectorAll("td")[1];
    assert.equal(activeFormulaCell?.textContent?.trim(), "=SUM(A1:A3)");
    assert.equal(activeFormulaCell?.getAttribute("data-formula"), null);
    assert.equal(activeFormulaCell?.getAttribute("data-computed-value"), null);
  });

  const nextTextPos = findTextPosition(ref.current.editor, "20");
  suppressTextSelectionEndpointWarning(() => {
    ref.current.editor.commands.setTextSelection(nextTextPos);
  });

  await waitFor(() => {
    const updatedFormulaCell = view.container.querySelectorAll("tr")[0]?.querySelectorAll("td")[1];
    assert.equal(updatedFormulaCell?.getAttribute("data-formula"), "=SUM(A1:A3)");
    assert.equal(updatedFormulaCell?.getAttribute("data-computed-value"), "60");
    assert.equal(updatedFormulaCell?.textContent?.trim(), "60");
  });
});

test("UEditor shows temporary table coordinates and references while editing a formula", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: "<table><tbody><tr><td>10</td><td>draft</td></tr><tr><td>20</td><td></td></tr><tr><td>30</td><td></td></tr></tbody></table>",
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await waitFor(() => {
    assert.ok(ref.current?.editor);
  });

  const tableCells = view.container.querySelectorAll("td");
  const secondRowFirstCell = tableCells[2];
  let referencedCellLeft = 100;
  secondRowFirstCell.getBoundingClientRect = () => ({
    x: referencedCellLeft,
    y: 60,
    left: referencedCellLeft,
    top: 60,
    right: referencedCellLeft + 80,
    bottom: 90,
    width: 80,
    height: 30,
    toJSON() {},
  });

  const formulaTextPos = findTextPosition(ref.current.editor, "draft");
  ref.current.editor.commands.focus();
  suppressTextSelectionEndpointWarning(() => {
    ref.current.editor.commands.setTextSelection({ from: formulaTextPos, to: formulaTextPos + "draft".length + 2 });
  });
  ref.current.editor.commands.insertContent("=SUM(A1:A3)");

  await waitFor(() => {
    const columnLabels = Array.from(view.container.querySelectorAll('[data-ueditor-formula-coordinate="column"]'), (node) => node.textContent);
    const rowLabels = Array.from(view.container.querySelectorAll('[data-ueditor-formula-coordinate="row"]'), (node) => node.textContent);
    const references = Array.from(view.container.querySelectorAll("[data-ueditor-formula-reference]"), (node) =>
      node.getAttribute("data-ueditor-formula-reference"),
    );
    assert.deepEqual(columnLabels, ["A", "B"]);
    assert.deepEqual(rowLabels, ["1", "2", "3"]);
    assert.deepEqual(references, ["A1", "A2", "A3"]);
    assert.equal(
      view.container.querySelector('[data-ueditor-formula-reference="A2"]')?.style.left,
      "102px",
    );
  });

  referencedCellLeft = 40;
  fireEvent.scroll(secondRowFirstCell.closest(".tableWrapper"));
  await waitFor(() => {
    assert.equal(
      view.container.querySelector('[data-ueditor-formula-reference="A2"]')?.style.left,
      "42px",
    );
  });

  const cells = view.container.querySelectorAll("td");
  fireEvent.mouseMove(cells[2]);
  await waitFor(() => {
    const hoverLabel = view.container.querySelector("[data-ueditor-formula-hover-label]");
    assert.equal(hoverLabel?.textContent, "A2");
    assert.equal(hoverLabel?.getAttribute("style")?.includes("display: block"), true);
  });

  const nextTextPos = findTextPosition(ref.current.editor, "20");
  suppressTextSelectionEndpointWarning(() => {
    ref.current.editor.commands.setTextSelection(nextTextPos);
  });
  await waitFor(() => {
    assert.equal(view.container.querySelector('[data-ueditor-formula-coordinate="column"]'), null);
    assert.equal(view.container.querySelector("[data-ueditor-formula-reference]"), null);
  });
});

test("UEditor does not promote a bare equals sign into an empty formula", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;

  const view = render(
    React.createElement(UEditor, {
      content: "<table><tbody><tr><td>10</td><td>=</td></tr></tbody></table>",
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await waitFor(() => {
    const formulaCell = view.container.querySelectorAll("td")[1];
    assert.equal(formulaCell?.textContent?.trim(), "=");
    assert.equal(formulaCell?.getAttribute("data-formula"), null);
    assert.equal(formulaCell?.getAttribute("data-computed-value"), null);
    assert.equal(formulaCell?.getAttribute("data-formula-state"), null);
  });
});

test("UEditor keeps function suggestion output editable until the formula is complete", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;

  const view = render(
    React.createElement(UEditor, {
      content: "<table><tbody><tr><td>10</td><td>=SUM()</td></tr></tbody></table>",
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await waitFor(() => {
    const formulaCell = view.container.querySelectorAll("td")[1];
    assert.equal(formulaCell?.textContent?.trim(), "=SUM()");
    assert.equal(formulaCell?.getAttribute("data-formula"), null);
    assert.equal(formulaCell?.getAttribute("data-computed-value"), null);
    assert.equal(formulaCell?.getAttribute("data-formula-state"), null);
  });
});

test("UEditor inserts a table cell reference into an active formula by clicking a cell", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: "<table><tbody><tr><td>10</td><td>=SUM()</td></tr><tr><td>20</td><td></td></tr><tr><td>30</td><td></td></tr></tbody></table>",
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await waitFor(() => {
    assert.ok(ref.current?.editor);
  });

  const formulaTextPos = findTextPosition(ref.current.editor, "=SUM()");
  ref.current.editor.commands.focus();
  suppressTextSelectionEndpointWarning(() => {
    ref.current.editor.commands.setTextSelection(formulaTextPos + "=SUM(".length + 2);
  });

  const cells = await waitFor(() => {
    const elements = view.container.querySelectorAll("td");
    assert.equal(elements.length, 6);
    return elements;
  });

  fireEvent.mouseDown(cells[0], { button: 0, buttons: 1 });

  await waitFor(() => {
    const formulaCell = view.container.querySelectorAll("td")[1];
    assert.equal(formulaCell?.textContent?.trim(), "=SUM(A1)");
    assert.equal(formulaCell?.getAttribute("data-formula"), null);
  });
});

test("UEditor separates table references selected by consecutive clicks", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: "<table><tbody><tr><td>10</td><td>=SUM()</td></tr><tr><td>20</td><td></td></tr><tr><td>30</td><td></td></tr></tbody></table>",
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await waitFor(() => assert.ok(ref.current?.editor));
  const formulaTextPos = findTextPosition(ref.current.editor, "=SUM()");
  ref.current.editor.commands.focus();
  suppressTextSelectionEndpointWarning(() => {
    ref.current.editor.commands.setTextSelection(formulaTextPos + "=SUM(".length + 2);
  });

  const cells = view.container.querySelectorAll("td");
  fireEvent.mouseDown(cells[0], { button: 0, buttons: 1 });
  fireEvent.mouseUp(cells[0], { button: 0, buttons: 0 });
  fireEvent.mouseDown(cells[2], { button: 0, buttons: 1 });
  fireEvent.mouseUp(cells[2], { button: 0, buttons: 0 });
  fireEvent.mouseDown(cells[4], { button: 0, buttons: 1 });
  fireEvent.mouseUp(cells[4], { button: 0, buttons: 0 });

  await waitFor(() => {
    assert.equal(view.container.querySelectorAll("td")[1]?.textContent?.trim(), "=SUM(A1,A2,A3)");
  });
});

test("UEditor blocks formula references that would create a circular dependency", async (t) => {
  const originalScrollBy = window.scrollBy;
  window.scrollBy = () => {};
  t.after(() => {
    window.scrollBy = originalScrollBy;
  });
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: '<table><tbody><tr><td data-formula="=B1" data-computed-value="0">0</td><td>draft</td></tr></tbody></table>',
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await waitFor(() => assert.ok(ref.current?.editor));
  const cells = view.container.querySelectorAll("td");
  const table = view.container.querySelector("table");
  table.getBoundingClientRect = () => ({
    x: 0, y: 0, left: 0, top: 0, right: 200, bottom: 30, width: 200, height: 30, toJSON() {},
  });
  cells[1].getBoundingClientRect = () => ({
    x: 100, y: 0, left: 100, top: 0, right: 200, bottom: 30, width: 100, height: 30, toJSON() {},
  });

  const draftTextPos = findTextPosition(ref.current.editor, "draft");
  ref.current.editor.commands.focus();
  suppressTextSelectionEndpointWarning(() => {
    ref.current.editor.commands.setTextSelection({ from: draftTextPos, to: draftTextPos + "draft".length + 2 });
  });
  ref.current.editor.commands.insertContent("=SUM()");

  await waitFor(() => {
    assert.ok(view.container.querySelector('[data-ueditor-formula-blocked-reference="A1"]'));
    assert.equal(view.container.querySelector("[data-ueditor-formula-actions]")?.style.top, "4px");
  });

  fireEvent.mouseDown(cells[0], { button: 0, buttons: 1 });
  await waitFor(() => {
    assert.equal(cells[1]?.textContent?.trim(), "=SUM()");
    assert.equal(
      view.container.querySelector("[data-ueditor-formula-range-highlight]")?.getAttribute("data-ueditor-formula-range-blocked"),
      "true",
    );
  });
  fireEvent.mouseUp(cells[0], { button: 0, buttons: 0 });
});

test("UEditor applies or cancels a formula with explicit actions", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: "<table><tbody><tr><td>10</td><td>draft</td></tr><tr><td>20</td><td></td></tr></tbody></table>",
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await waitFor(() => assert.ok(ref.current?.editor));
  const formulaTextPos = findTextPosition(ref.current.editor, "draft");
  ref.current.editor.commands.focus();
  suppressTextSelectionEndpointWarning(() => {
    ref.current.editor.commands.setTextSelection({ from: formulaTextPos, to: formulaTextPos + "draft".length + 2 });
  });
  ref.current.editor.commands.insertContent("=SUM(A1)");

  const applyButton = await waitFor(() => {
    const button = view.container.querySelector("[data-ueditor-formula-apply]");
    assert.ok(button);
    assert.equal(button.textContent, "✓ Apply (Enter)");
    assert.equal(button.disabled, false);
    return button;
  });
  fireEvent.mouseDown(applyButton, { button: 0 });
  fireEvent.click(applyButton);

  await waitFor(() => {
    const formulaCell = view.container.querySelectorAll("td")[1];
    assert.equal(formulaCell?.textContent?.trim(), "10");
    assert.equal(formulaCell?.getAttribute("data-formula"), "=SUM(A1)");
    assert.equal(view.container.querySelector("[data-ueditor-formula-actions]"), null);
  });

  const secondCellTextPos = findTextPosition(ref.current.editor, "20");
  suppressTextSelectionEndpointWarning(() => {
    ref.current.editor.commands.setTextSelection({ from: secondCellTextPos, to: secondCellTextPos + "20".length + 2 });
  });
  ref.current.editor.commands.insertContent("=SUM(");
  const cancelButton = await waitFor(() => {
    const button = view.container.querySelector("[data-ueditor-formula-cancel]");
    const disabledApply = view.container.querySelector("[data-ueditor-formula-apply]");
    assert.ok(button);
    assert.equal(disabledApply?.disabled, true);
    return button;
  });
  fireEvent.mouseDown(cancelButton, { button: 0 });
  fireEvent.click(cancelButton);

  await waitFor(() => {
    assert.equal(view.container.querySelectorAll("td")[2]?.textContent?.trim(), "");
    assert.equal(view.container.querySelector("[data-ueditor-formula-actions]"), null);
  });
});

test("UEditor applies a complete formula when Enter is pressed", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: "<table><tbody><tr><td>draft</td><td></td><td></td></tr></tbody></table>",
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await waitFor(() => assert.ok(ref.current?.editor));
  const formulaTextPos = findTextPosition(ref.current.editor, "draft");
  ref.current.editor.commands.focus();
  suppressTextSelectionEndpointWarning(() => {
    ref.current.editor.commands.setTextSelection({ from: formulaTextPos, to: formulaTextPos + "draft".length + 2 });
  });
  ref.current.editor.commands.insertContent("=SUM(B1,C1)");

  await waitFor(() => {
    assert.equal(view.container.querySelector("[data-ueditor-formula-apply]")?.disabled, false);
  });
  fireEvent.keyDown(ref.current.editor.view.dom, { key: "Enter", code: "Enter" });

  await waitFor(() => {
    const formulaCell = view.container.querySelectorAll("td")[0];
    assert.equal(formulaCell?.textContent?.trim(), "0");
    assert.equal(formulaCell?.getAttribute("data-formula"), "=SUM(B1,C1)");
    assert.equal(view.container.querySelector("[data-ueditor-formula-actions]"), null);
  });
});

test("UEditor uses Tab to accept a table formula autocomplete suggestion", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: "<table><tbody><tr><td>draft</td></tr></tbody></table>",
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await waitFor(() => assert.ok(ref.current?.editor));
  const formulaTextPos = findTextPosition(ref.current.editor, "draft");
  ref.current.editor.commands.focus();
  suppressTextSelectionEndpointWarning(() => {
    ref.current.editor.commands.setTextSelection({ from: formulaTextPos, to: formulaTextPos + "draft".length + 2 });
  });
  ref.current.editor.commands.insertContent("=sum");

  await within(window.document.body).findByText("SUM", { selector: "button span" });
  fireEvent.keyDown(ref.current.editor.view.dom, { key: "Tab", code: "Tab" });

  await waitFor(() => {
    const formulaCell = view.container.querySelector("td");
    assert.equal(formulaCell?.textContent?.trim(), "=SUM()");
    assert.equal(formulaCell?.getAttribute("data-formula"), null);
    assert.equal(formulaCell?.getAttribute("data-formula-state"), null);
  });
});

test("UEditor uses Enter to evaluate an incomplete table formula instead of accepting autocomplete", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: "<table><tbody><tr><td>draft</td></tr></tbody></table>",
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await waitFor(() => assert.ok(ref.current?.editor));
  const formulaTextPos = findTextPosition(ref.current.editor, "draft");
  ref.current.editor.commands.focus();
  suppressTextSelectionEndpointWarning(() => {
    ref.current.editor.commands.setTextSelection({ from: formulaTextPos, to: formulaTextPos + "draft".length + 2 });
  });
  ref.current.editor.commands.insertContent("=sum");

  await within(window.document.body).findByText("SUM", { selector: "button span" });
  fireEvent.keyDown(ref.current.editor.view.dom, { key: "Enter", code: "Enter" });

  await waitFor(() => {
    const formulaCell = view.container.querySelector("td");
    assert.equal(formulaCell?.textContent?.trim(), "#INVALID-FORMULA");
    assert.equal(formulaCell?.getAttribute("data-formula"), "=sum");
    assert.equal(formulaCell?.getAttribute("data-computed-value"), "#INVALID-FORMULA");
    assert.equal(formulaCell?.getAttribute("data-formula-state"), "error");
  });
});

test("UEditor formula bar edits, cancels, applies, and converts an existing formula", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const formulaCommands = await importTsModule(path.join(componentsRoot, "UEditor/table-formula-commands.ts"));
  const UEditor = mod.default;
  const ref = React.createRef();
  const user = userEvent.setup({ document: window.document });

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: '<table><tbody><tr><td>10</td><td data-formula="=A1*2" data-computed-value="20">20</td></tr></tbody></table>',
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await waitFor(() => assert.ok(ref.current?.editor));
  ref.current.editor.commands.focus();
  const formulaTextPos = findTextPosition(ref.current.editor, "20");
  suppressTextSelectionEndpointWarning(() => {
    ref.current.editor.commands.setTextSelection(formulaTextPos);
  });

  await waitFor(() => {
    assert.ok(formulaCommands.getSelectedTableFormulaCell(ref.current.editor));
  });

  const body = within(window.document.body);
  const formulaInput = await body.findByRole("textbox", { name: "Edit formula" });
  assert.equal(formulaInput.value, "=A1*2");
  assert.equal(view.container.querySelector("[data-ueditor-formula-cell-label]")?.textContent, "B1");

  fireEvent.doubleClick(view.container.querySelectorAll("td")[1]);
  await waitFor(() => assert.equal(window.document.activeElement, formulaInput));
  await user.clear(formulaInput);
  await user.type(formulaInput, "=A1*9");
  await user.keyboard("{Escape}");
  await waitFor(() => {
    assert.equal(view.container.querySelectorAll("td")[1]?.getAttribute("data-formula"), "=A1*2");
    assert.equal(formulaInput.value, "=A1*2");
  });

  await user.click(formulaInput);
  await user.clear(formulaInput);
  await user.type(formulaInput, "=A1*3");
  await user.keyboard("{Enter}");
  await waitFor(() => {
    const formulaCell = view.container.querySelectorAll("td")[1];
    assert.equal(formulaCell?.getAttribute("data-formula"), "=A1*3");
    assert.equal(formulaCell?.getAttribute("data-computed-value"), "30");
    assert.equal(formulaCell?.textContent?.trim(), "30");
  });

  fireEvent.click(await body.findByRole("button", { name: "Convert to value" }));
  await waitFor(() => {
    const formulaCell = view.container.querySelectorAll("td")[1];
    assert.equal(formulaCell?.getAttribute("data-formula"), null);
    assert.equal(formulaCell?.getAttribute("data-computed-value"), null);
    assert.equal(formulaCell?.textContent?.trim(), "30");
    assert.equal(view.container.querySelector("[data-ueditor-formula-bar]"), null);
  });
});

test("UEditor clears an invalid formula cell with Backspace and recalculates dependents", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: [
        "<table><tbody><tr>",
        "<td>10</td>",
        '<td data-formula="=sum" data-computed-value="#INVALID-FORMULA">#INVALID-FORMULA</td>',
        '<td data-formula="=B1+1" data-computed-value="#INVALID-REFERENCE">#INVALID-REFERENCE</td>',
        "</tr></tbody></table>",
      ].join(""),
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await waitFor(() => assert.ok(ref.current?.editor));
  ref.current.editor.commands.focus();
  const formulaTextPos = findTextPosition(ref.current.editor, "#INVALID-FORMULA");
  suppressTextSelectionEndpointWarning(() => {
    ref.current.editor.commands.setTextSelection(formulaTextPos);
  });

  await within(window.document.body).findByText("Formula error");
  fireEvent.keyDown(ref.current.editor.view.dom, { key: "Backspace", code: "Backspace" });

  await waitFor(() => {
    const cells = view.container.querySelectorAll("td");
    assert.equal(cells[1]?.getAttribute("data-formula"), null);
    assert.equal(cells[1]?.getAttribute("data-computed-value"), null);
    assert.equal(cells[1]?.textContent?.trim(), "");
    assert.equal(cells[2]?.getAttribute("data-formula"), "=B1+1");
    assert.equal(cells[2]?.getAttribute("data-computed-value"), "#INVALID-REFERENCE");
    assert.equal(cells[2]?.textContent?.trim(), "#INVALID-REFERENCE");
    assert.equal(view.container.querySelector("[data-ueditor-formula-bar]"), null);
  });
});

test("UEditor inserts a table cell range into an active formula by dragging cells", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: "<table><tbody><tr><td>10</td><td>=SUM()</td></tr><tr><td>20</td><td></td></tr><tr><td>30</td><td></td></tr></tbody></table>",
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await waitFor(() => {
    assert.ok(ref.current?.editor);
  });

  const formulaTextPos = findTextPosition(ref.current.editor, "=SUM()");
  ref.current.editor.commands.focus();
  suppressTextSelectionEndpointWarning(() => {
    ref.current.editor.commands.setTextSelection(formulaTextPos + "=SUM(".length + 2);
  });

  const cells = await waitFor(() => {
    const elements = view.container.querySelectorAll("td");
    assert.equal(elements.length, 6);
    return elements;
  });

  fireEvent.mouseDown(cells[0], { button: 0, buttons: 1 });

  await waitFor(() => {
    const formulaCell = view.container.querySelectorAll("td")[1];
    assert.equal(formulaCell?.textContent?.trim(), "=SUM(A1)");
    assert.ok(view.container.querySelector("[data-ueditor-formula-range-highlight]"));
  });

  fireEvent.mouseMove(cells[4], { buttons: 1 });

  await waitFor(() => {
    const formulaCell = view.container.querySelectorAll("td")[1];
    assert.equal(formulaCell?.textContent?.trim(), "=SUM(A1:A3)");
    assert.ok(view.container.querySelector("[data-ueditor-formula-range-highlight]"));
  });

  fireEvent.mouseUp(cells[4], { button: 0, buttons: 0 });

  await waitFor(() => {
    const formulaCell = view.container.querySelectorAll("td")[1];
    assert.equal(formulaCell?.textContent?.trim(), "=SUM(A1:A3)");
    assert.equal(formulaCell?.getAttribute("data-formula"), null);
    assert.equal(view.container.querySelector("[data-ueditor-formula-range-highlight]"), null);
  });
});

test("UEditor clears legacy empty formula metadata so the cell can be edited", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;

  const view = render(
    React.createElement(UEditor, {
      content: '<table><tbody><tr><td data-formula="=" data-computed-value="#EMPTY">#EMPTY</td></tr></tbody></table>',
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  await waitFor(() => {
    const formulaCell = view.container.querySelector("td");
    assert.equal(formulaCell?.textContent?.trim(), "");
    assert.equal(formulaCell?.getAttribute("data-formula"), null);
    assert.equal(formulaCell?.getAttribute("data-computed-value"), null);
    assert.equal(formulaCell?.getAttribute("data-formula-state"), null);
  });
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
    const element = wrapper.querySelector("[data-ueditor-image-resize-handle]");
    assert.ok(element);
    return element;
  });
  const preview = wrapper.querySelector("[data-ueditor-image-resize-preview]");
  assert.ok(preview);

  fireEvent.pointerDown(handle, { pointerId: 1, clientX: 0, clientY: 0 });
  fireEvent.pointerMove(handle, { pointerId: 1, clientX: 100, clientY: 0 });

  await waitFor(() => {
    assert.equal(image.style.width, "200px");
    assert.equal(image.style.height, "auto");
    assert.equal(image.style.aspectRatio, "200 / 100");
    assert.equal(preview.style.width, "200px");
    assert.equal(preview.style.height, "100px");
    assert.equal(preview.style.maxWidth, "none");
    assert.equal(preview.style.maxHeight, "none");
    assert.match(preview.style.transform, /scale\(1\.5,\s*1\.5\)/);
    assert.equal(preview.style.display, "block");
  });

  fireEvent.pointerUp(handle, { pointerId: 1, clientX: 100, clientY: 0 });

  await waitFor(() => {
    const attrs = editor.getAttributes("image");
    assert.equal(attrs.width, 300);
    assert.equal(attrs.height, 150);
    assert.equal(image.style.width, "300px");
    assert.equal(image.style.height, "auto");
    assert.equal(image.style.aspectRatio, "300 / 150");
    assert.equal(preview.style.display, "none");
  });
});

test("UEditor image resize uses a ghost preview and updates table highlight on drag end", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const domUtils = await importTsModule(path.join(componentsRoot, "UEditor/table-dom-utils.ts"));
  const UEditor = mod.default;
  const ref = React.createRef();

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: [
        "<table><tbody><tr><td>",
        `<img src="data:image/png;base64,${ONE_PIXEL_PNG_BASE64}" alt="table-drag-image" width="200" height="100" />`,
        "</td></tr></tbody></table>",
      ].join(""),
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  const image = await view.findByAltText("table-drag-image");
  const editorElement = await waitFor(() => {
    const element = view.container.querySelector(".ProseMirror");
    assert.ok(element);
    return element;
  });
  const surface = getEditorSurface(view);
  const cell = await waitFor(() => {
    const element = view.container.querySelector("td");
    assert.ok(element);
    return element;
  });
  const highlight = await waitFor(() => {
    const element = view.container.querySelector("[data-ueditor-active-cell-highlight]");
    assert.ok(element);
    return element;
  });
  await waitFor(() => {
    assert.ok(ref.current?.editor);
  });

  const rect = (width, height, left = 0, top = 0) => ({
    width,
    height,
    top,
    left,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON() {},
  });
  editorElement.getBoundingClientRect = () => rect(500, 400);
  surface.getBoundingClientRect = () => rect(500, 400);
  image.getBoundingClientRect = () => rect(200, 100);
  cell.getBoundingClientRect = () => {
    const width = Number.parseInt(image.style.width || "200", 10);
    const parsedHeight = Number.parseInt(image.style.height || "", 10);
    const height = Number.isFinite(parsedHeight) ? parsedHeight : Math.round(width / 2);
    return rect(width, height);
  };

  const editor = ref.current.editor;
  editor.commands.focus();
  fireEvent.mouseDown(cell);
  fireEvent.mouseUp(cell);
  fireEvent.click(cell);

  await waitFor(() => {
    assert.equal(highlight.style.display, "block");
    assert.equal(highlight.style.height, "100px");
  });

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
    const element = wrapper.querySelector("[data-ueditor-image-resize-handle]");
    assert.ok(element);
    return element;
  });
  const preview = wrapper.querySelector("[data-ueditor-image-resize-preview]");
  assert.ok(preview);

  let layoutEvents = 0;
  surface.addEventListener(domUtils.UEDITOR_TABLE_LAYOUT_CHANGE_EVENT, () => {
    layoutEvents += 1;
  });

  fireEvent.pointerDown(handle, { pointerId: 1, clientX: 0, clientY: 0 });
  fireEvent.pointerMove(handle, { pointerId: 1, clientX: 100, clientY: 0 });

  await waitFor(() => {
    assert.equal(preview.style.width, "200px");
    assert.equal(preview.style.height, "100px");
    assert.equal(preview.style.maxWidth, "none");
    assert.equal(preview.style.maxHeight, "none");
    assert.match(preview.style.transform, /scale\(1\.5,\s*1\.5\)/);
    assert.equal(preview.style.display, "block");
    assert.equal(image.style.width, "200px");
    assert.equal(image.style.height, "auto");
    assert.equal(image.style.aspectRatio, "200 / 100");
    assert.equal(highlight.style.height, "100px");
    assert.equal(layoutEvents, 0);
  });

  fireEvent.pointerUp(handle, { pointerId: 1, clientX: 100, clientY: 0 });

  await waitFor(() => {
    assert.equal(image.style.width, "300px");
    assert.equal(image.style.height, "auto");
    assert.equal(image.style.aspectRatio, "300 / 150");
    assert.equal(preview.style.display, "none");
    assert.equal(highlight.style.height, "150px");
    assert.ok(layoutEvents > 0);
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

test("UEditor menu bar opens top-level and nested menus on hover and closes outside", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const user = userEvent.setup({ document: window.document });
  const body = within(window.document.body);

  const view = render(
    React.createElement(UEditor, {
      content: "<p>Hover menu behavior</p>",
      showMenuBar: true,
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  const formatTrigger = await view.findByRole("button", { name: "Format" });
  fireEvent.mouseEnter(formatTrigger);
  await body.findByText("Bold");

  const blockTrigger = await body.findByRole("button", { name: "Block" });
  fireEvent.mouseEnter(blockTrigger);
  const paragraphButton = await body.findByRole("button", { name: "Paragraph" });
  const blockMenu = paragraphButton.closest("[data-dropdown-menu]");
  assert.ok(blockMenu);
  fireEvent.mouseLeave(blockTrigger);
  fireEvent.mouseEnter(blockMenu);
  await new Promise((resolve) => window.setTimeout(resolve, 180));
  assert.ok(body.getByRole("button", { name: "Paragraph" }));

  const alignTrigger = body.getByRole("button", { name: "Align" });
  fireEvent.mouseLeave(blockMenu);
  fireEvent.mouseEnter(alignTrigger);
  await body.findByRole("button", { name: "Left" });
  await new Promise((resolve) => window.setTimeout(resolve, 180));
  assert.equal(body.queryByRole("button", { name: "Paragraph" }), null);

  const insertTrigger = view.getByRole("button", { name: "Insert" });
  fireEvent.mouseEnter(insertTrigger);
  const imageButton = await body.findByRole("button", { name: "Image" });
  assert.equal(body.queryByText("Bold"), null);
  const insertMenu = imageButton.closest("[data-dropdown-menu]");
  assert.ok(insertMenu);
  fireEvent.mouseLeave(insertTrigger);
  fireEvent.mouseEnter(insertMenu);
  await new Promise((resolve) => window.setTimeout(resolve, 180));
  assert.ok(body.getByRole("button", { name: "Image" }));

  const editorElement = view.container.querySelector(".ProseMirror");
  assert.ok(editorElement);
  fireEvent.mouseLeave(insertMenu);
  fireEvent.mouseEnter(editorElement);
  await new Promise((resolve) => window.setTimeout(resolve, 180));
  assert.equal(body.queryByRole("button", { name: "Image" }), null);

  fireEvent.click(formatTrigger);
  await body.findByText("Bold");
  fireEvent.click(body.getByRole("button", { name: "Block" }));
  await body.findByRole("button", { name: "Paragraph" });
  fireEvent.mouseDown(editorElement);
  fireEvent.click(editorElement);
  assert.equal(body.queryByText("Bold"), null);
  assert.equal(body.queryByRole("button", { name: "Paragraph" }), null);
});

test("UEditor menu bar preview uses editor table layout styles", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const body = within(window.document.body);

  render(
    React.createElement(UEditor, {
      content: '<p>Preview table</p><table><tbody><tr data-row-height="72"><td>A</td><td>B</td><td>C</td></tr></tbody></table>',
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
  assert.doesNotMatch(previewContent.className, /px-/);

  const previewEditorContent = previewContent.firstElementChild;
  assert.ok(previewEditorContent);
  assert.match(previewEditorContent.className, /\[&_table\]:w-auto/);
  assert.match(previewEditorContent.className, /\[&_table\]:table-fixed/);

  const previewTable = previewContent.querySelector("table");
  assert.ok(previewTable);
  assert.doesNotMatch(previewTable.getAttribute("class") ?? "", /\bw-full\b/);
  assert.match(previewTable.getAttribute("style") ?? "", /width:\s*300px/i);
  assert.match(previewTable.getAttribute("style") ?? "", /table-layout:\s*fixed/i);

  const previewRow = previewTable.querySelector("tr");
  assert.ok(previewRow);
  assert.equal(previewRow.getAttribute("data-row-height"), "72");
  assert.match(previewRow.getAttribute("style") ?? "", /height:\s*72px/i);

  const previewColumns = previewContent.querySelectorAll("colgroup > col");
  assert.equal(previewColumns.length, 3);
  assert.deepEqual(
    Array.from(previewColumns).map((col) => col.getAttribute("width")),
    ["100", "100", "100"],
  );
});

test("UEditor preview table HTML keeps explicit column width ratios", async () => {
  const previewMod = await importTsModule(path.join(componentsRoot, "UEditor/preview-html.ts"));
  const html = previewMod.prepareUEditorPreviewHtml(
    '<table><colgroup><col style="width: 180px"><col style="width: 220px"></colgroup><tbody><tr><td>A</td><td>B</td></tr></tbody></table>',
  );

  const container = window.document.createElement("div");
  container.innerHTML = html;

  const table = container.querySelector("table");
  assert.ok(table);
  assert.match(table.getAttribute("style") ?? "", /width:\s*400px/i);

  const columns = Array.from(container.querySelectorAll("col"));
  assert.deepEqual(columns.map((col) => col.getAttribute("width")), ["180", "220"]);
  assert.deepEqual(
    Array.from(container.querySelectorAll("td")).map((cell) => cell.style.width),
    ["180px", "220px"],
  );
});

test("UEditor preview table HTML keeps empty rows and columns at editor size", async () => {
  const previewMod = await importTsModule(path.join(componentsRoot, "UEditor/preview-html.ts"));
  const html = previewMod.prepareUEditorPreviewHtml(
    [
      "<table><tbody>",
      "<tr><td><p></p></td><td><p></p></td><td><p></p></td></tr>",
      "<tr><td><p></p></td><td><p></p></td><td><p></p></td></tr>",
      "</tbody></table>",
    ].join(""),
  );

  const container = window.document.createElement("div");
  container.innerHTML = html;

  const table = container.querySelector("table");
  assert.ok(table);
  assert.match(table.getAttribute("style") ?? "", /width:\s*300px/i);
  assert.match(table.getAttribute("style") ?? "", /min-width:\s*300px/i);

  const columns = Array.from(container.querySelectorAll("col"));
  assert.equal(columns.length, 3);
  assert.deepEqual(columns.map((col) => col.getAttribute("width")), ["100", "100", "100"]);

  const rows = Array.from(container.querySelectorAll("tr"));
  assert.equal(rows.length, 2);
  assert.deepEqual(rows.map((row) => row.style.height), ["25px", "25px"]);

  const cells = Array.from(container.querySelectorAll("td"));
  assert.deepEqual(cells.map((cell) => cell.style.width), ["100px", "100px", "100px", "100px", "100px", "100px"]);
  assert.deepEqual(cells.map((cell) => cell.style.height), ["25px", "25px", "25px", "25px", "25px", "25px"]);
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

test("UEditor menu bar preview callback keeps the built-in preview fallback", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const body = within(window.document.body);
  let callbackHtml = "";

  render(
    React.createElement(UEditor, {
      content: "<p>Callback preview body</p>",
      showMenuBar: true,
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
      onPreview: (html) => {
        callbackHtml = html;
      },
    }),
  );

  fireEvent.click(await body.findByRole("button", { name: "Preview" }));

  assert.match(callbackHtml, /Callback preview body/);
  const previewContent = await body.findByTestId("preview-content");
  assert.match(previewContent.textContent ?? "", /Callback preview body/);
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
  const insertTableMenu = gridCell.closest("[data-dropdown-menu]");
  assert.ok(insertTableMenu);
  assert.equal(within(insertTableMenu).queryByText("Align Table Center"), null);
  assert.equal(within(insertTableMenu).queryByText("Add Row After"), null);
  assert.equal(within(insertTableMenu).queryByText("Delete Table"), null);
  await user.hover(gridCell);
  await user.click(gridCell);

  await waitFor(() => {
    const rows = view.container.querySelectorAll("tr");
    assert.equal(rows.length, 4);
    const firstRowCells = rows[0]?.querySelectorAll("th,td") ?? [];
    assert.equal(firstRowCells.length, 5);
  });
});

test("UEditor contextual table controls apply table alignment and preserve it in HTML", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
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
  hoverTableMenuZone(view);
  fireEvent.click(await view.findByRole("button", { name: "Open Table Controls" }));
  fireEvent.click(await within(window.document.body).findByRole("menuitem", { name: "Align Table Center" }));

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

test("UEditor table toolbar applies and removes vertical text direction", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const user = userEvent.setup({ document: window.document });
  const htmlUpdates = [];

  const view = render(
    React.createElement(UEditor, {
      content: "<table><tbody><tr><td>Vertical label</td><td>Value</td></tr></tbody></table>",
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
  await user.click(await view.findByRole("button", { name: "Text Direction" }));
  await user.click(await within(window.document.body).findByRole("button", { name: "Vertical Text" }));

  await waitFor(() => {
    const currentCell = view.container.querySelector("td");
    assert.ok(currentCell);
    assert.equal(currentCell.getAttribute("data-text-direction"), "vertical");
    assert.match(currentCell.getAttribute("style") ?? "", /writing-mode:\s*sideways-lr/i);
    assert.match(currentCell.getAttribute("style") ?? "", /text-orientation:\s*mixed/i);
    assert.match(htmlUpdates.at(-1) ?? "", /data-text-direction="vertical"/);
  });

  await user.click(await view.findByRole("button", { name: "Text Direction" }));
  await user.click(await within(window.document.body).findByRole("button", { name: "Horizontal Text" }));

  await waitFor(() => {
    const currentCell = view.container.querySelector("td");
    assert.ok(currentCell);
    assert.equal(currentCell.getAttribute("data-text-direction"), null);
    assert.doesNotMatch(currentCell.getAttribute("style") ?? "", /writing-mode/i);
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

test("UEditor resizes the whole table freely, locks Ctrl to one axis, and keeps Ctrl+Shift proportional", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const body = within(window.document.body);
  const ref = React.createRef();

  const view = render(
    React.createElement(UEditor, {
      ref,
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
  await waitFor(() => assert.ok(ref.current?.editor));
  activateTableCell(firstCell);

  const frame = await waitFor(() => {
    const element = view.container.querySelector("[data-table-resize-frame]");
    assert.ok(element);
    return element;
  });
  assert.equal(frame.style.width, "320px");
  assert.equal(frame.style.height, "50px");

  const dragResizeHandle = async ({ pointerId, deltaX = 0, deltaY = 0, ctrlKey = false, shiftKey = false, expectedWidth, expectedHeight }) => {
    const handle = await body.findByRole("button", { name: "Resize Table" });
    fireEvent.pointerDown(handle, { pointerId, button: 0, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(window, { pointerId, clientX: deltaX, clientY: deltaY, ctrlKey, shiftKey });

    await waitFor(() => {
      assert.equal(frame.getAttribute("data-resizing"), "true");
      assert.equal(frame.style.width, `${expectedWidth}px`);
      assert.equal(frame.style.height, `${expectedHeight}px`);
      assert.equal(body.getByRole("status").textContent?.trim(), `${expectedWidth} × ${expectedHeight}`);
    });

    fireEvent.pointerUp(window, { pointerId, clientX: deltaX, clientY: deltaY, ctrlKey, shiftKey });
    await waitFor(() => {
      assert.equal(frame.getAttribute("data-resizing"), "false");
    });
  };

  await dragResizeHandle({
    pointerId: 31,
    deltaX: 80,
    deltaY: 50,
    expectedWidth: 400,
    expectedHeight: 100,
  });

  await waitFor(() => {
    assert.deepEqual(
      Array.from(view.container.querySelectorAll("td"), (cell) => cell.getAttribute("colwidth")),
      ["200", "200", "200", "200"],
    );
    assert.deepEqual(
      Array.from(view.container.querySelectorAll("tr"), (row) => row.getAttribute("data-row-height")),
      ["50", "50"],
    );
  });

  await dragResizeHandle({
    pointerId: 32,
    deltaX: 80,
    deltaY: 30,
    ctrlKey: true,
    expectedWidth: 480,
    expectedHeight: 100,
  });

  await dragResizeHandle({
    pointerId: 33,
    deltaX: 10,
    deltaY: 20,
    ctrlKey: true,
    expectedWidth: 480,
    expectedHeight: 120,
  });

  await dragResizeHandle({
    pointerId: 34,
    deltaX: 20,
    deltaY: 30,
    ctrlKey: true,
    shiftKey: true,
    expectedWidth: 600,
    expectedHeight: 150,
  });

  await waitFor(() => {
    assert.deepEqual(
      Array.from(view.container.querySelectorAll("td"), (cell) => cell.getAttribute("colwidth")),
      ["300", "300", "300", "300"],
    );
    assert.deepEqual(
      Array.from(view.container.querySelectorAll("tr"), (row) => row.getAttribute("data-row-height")),
      ["75", "75"],
    );
  });

  const result = await ref.current.prepareContentForSave();
  assert.match(result.html, /colwidth="300"/);
  assert.match(result.html, /data-row-height="75"/);
});

test("UEditor keeps existing single-column and single-row resize behavior isolated", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const { columnResizingPluginKey } = await import("@tiptap/pm/tables");
  const UEditor = mod.default;
  const body = within(window.document.body);
  const ref = React.createRef();

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: "<table><tbody><tr><td>A1</td><td>B1</td></tr><tr><td>A2</td><td>B2</td></tr></tbody></table>",
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  const cells = await waitFor(() => {
    const elements = view.container.querySelectorAll("td");
    assert.equal(elements.length, 4);
    return elements;
  });
  const rows = view.container.querySelectorAll("tr");
  const table = view.container.querySelector("table");
  assert.ok(table);
  await waitFor(() => assert.ok(ref.current?.editor));

  const rect = (width, height, left = 0, top = 0) => ({
    width,
    height,
    left,
    top,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON() {},
  });
  table.getBoundingClientRect = () => rect(320, 50);
  rows[0].getBoundingClientRect = () => rect(320, 25, 0, 0);
  rows[1].getBoundingClientRect = () => rect(320, 25, 0, 25);
  cells.forEach((cell, index) => {
    const columnIndex = index % 2;
    const rowIndex = Math.floor(index / 2);
    cell.getBoundingClientRect = () => rect(160, 25, columnIndex * 160, rowIndex * 25);
    Object.defineProperty(cell, "offsetWidth", { configurable: true, value: 160 });
  });

  activateTableCell(cells[0]);
  const tableResizeHandle = await body.findByRole("button", { name: "Resize Table" });
  assert.equal(view.container.querySelectorAll("[data-table-resize-handle]").length, 1);
  assert.match(tableResizeHandle.className, /right-\[-30px\]/);
  assert.match(tableResizeHandle.className, /bottom-\[-28px\]/);
  assert.ok(tableResizeHandle.querySelector("svg"));
  assert.equal(body.queryByRole("button", { name: "Resize Table Width" }), null);
  assert.equal(body.queryByRole("button", { name: "Resize Table Height" }), null);

  let firstCellPos = null;
  ref.current.editor.state.doc.descendants((node, pos) => {
    if (firstCellPos == null && (node.type.name === "tableCell" || node.type.name === "tableHeader")) {
      firstCellPos = pos;
      return false;
    }
    return true;
  });
  assert.equal(typeof firstCellPos, "number");

  ref.current.editor.view.dispatch(
    ref.current.editor.state.tr.setMeta(columnResizingPluginKey, { setHandle: firstCellPos }),
  );
  fireEvent.mouseDown(cells[0], { button: 0, clientX: 160, clientY: 12 });
  fireEvent.mouseMove(window, { clientX: 200, clientY: 12, buttons: 1 });
  fireEvent.mouseUp(window, { clientX: 200, clientY: 12 });

  await waitFor(() => {
    assert.deepEqual(
      Array.from(view.container.querySelectorAll("td"), (cell) => cell.getAttribute("colwidth")),
      ["200", null, "200", null],
    );
  });

  const resizedCells = view.container.querySelectorAll("td");
  const resizedRows = view.container.querySelectorAll("tr");
  resizedRows[0].getBoundingClientRect = () => rect(360, 25, 0, 0);
  resizedRows[1].getBoundingClientRect = () => rect(360, 25, 0, 25);
  resizedCells.forEach((cell, index) => {
    const columnIndex = index % 2;
    const rowIndex = Math.floor(index / 2);
    const left = columnIndex === 0 ? 0 : 200;
    const width = columnIndex === 0 ? 200 : 160;
    cell.getBoundingClientRect = () => rect(width, 25, left, rowIndex * 25);
  });

  fireEvent.mouseMove(resizedCells[0], { clientX: 80, clientY: 24 });
  fireEvent.mouseDown(resizedCells[0], { button: 0, clientX: 80, clientY: 24 });
  fireEvent.pointerMove(document, { pointerId: 51, clientX: 80, clientY: 44 });
  fireEvent.pointerUp(document, { pointerId: 51, clientX: 80, clientY: 44 });

  await waitFor(() => {
    assert.deepEqual(
      Array.from(view.container.querySelectorAll("tr"), (row) => row.getAttribute("data-row-height")),
      ["45", "25"],
    );
    assert.deepEqual(
      Array.from(view.container.querySelectorAll("td"), (cell) => cell.getAttribute("colwidth")),
      ["200", null, "200", null],
    );
  });
});

test("UEditor opens cell formatting explicitly from table controls", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const body = within(window.document.body);
  const ref = React.createRef();

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: "<table><tbody><tr><td>A1</td><td>B1</td></tr></tbody></table>",
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
  await waitFor(() => assert.ok(ref.current?.editor));

  activateTableCell(firstCell);
  hoverTableMenuZone(view);
  fireEvent.click(await body.findByRole("button", { name: "Open Table Controls" }));
  fireEvent.click(await body.findByRole("menuitem", { name: "Cell Formatting" }));

  await body.findByRole("button", { name: "Cell Border" });
  assert.ok(body.getByRole("button", { name: "Cell Background" }));
  assert.equal(body.queryByRole("button", { name: "Bold" }), null);
  assert.equal(ref.current.editor.state.selection.constructor.name, "CellSelection");
});

test("UEditor keeps a single click in an empty cell editable and opens cell formatting on double-click", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const body = within(window.document.body);
  const ref = React.createRef();
  const user = userEvent.setup({ document: window.document });

  const view = render(
    React.createElement(UEditor, {
      ref,
      content: "<table><tbody><tr><td></td><td>Filled</td></tr></tbody></table>",
      showToolbar: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  const emptyCell = await waitFor(() => {
    const element = view.container.querySelector("td");
    assert.ok(element);
    return element;
  });
  await waitFor(() => assert.ok(ref.current?.editor));

  activateTableCell(emptyCell);
  ref.current.editor.view.focus();

  await new Promise((resolve) => window.setTimeout(resolve, 240));
  assert.notEqual(ref.current.editor.state.selection.constructor.name, "CellSelection");
  assert.equal(body.queryByRole("button", { name: "Cell Background" }), null);
  assert.equal(body.queryByRole("button", { name: "Merge Cells" }), null);

  await user.dblClick(emptyCell);
  await body.findByRole("button", { name: "Cell Background" });
  assert.equal(ref.current.editor.state.selection.constructor.name, "CellSelection");

  await user.click(body.getByRole("button", { name: "Cell Background" }));
  await user.click(await body.findByRole("button", { name: "Muted" }));

  await waitFor(() => {
    assert.equal(view.container.querySelector("td")?.getAttribute("data-background-color"), "var(--muted)");
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

test("UEditor column handle clear uses logical columns across rowspans", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const body = within(window.document.body);

  const view = render(
    React.createElement(UEditor, {
      content: [
        "<table><tbody>",
        '<tr><td rowspan="2">A merged</td><td>B1</td><td>C1</td></tr>',
        "<tr><td>B2</td><td>C2</td></tr>",
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
  hoverColumnHandle(view, 1);
  fireEvent.click(await body.findByRole("button", { name: "Drag Column 2" }));
  fireEvent.click(await body.findByRole("menuitem", { name: "Clear Column Contents" }));

  await waitFor(() => {
    const rows = view.container.querySelectorAll("tr");
    const firstRowCells = rows[0]?.querySelectorAll("th,td") ?? [];
    const secondRowCells = rows[1]?.querySelectorAll("th,td") ?? [];

    assert.equal(firstRowCells[0]?.textContent?.trim(), "A merged");
    assert.equal(firstRowCells[1]?.textContent?.trim(), "");
    assert.equal(firstRowCells[2]?.textContent?.trim(), "C1");
    assert.equal(secondRowCells[0]?.textContent?.trim(), "");
    assert.equal(secondRowCells[1]?.textContent?.trim(), "C2");
  });
});

test("UEditor column handle duplicate uses logical columns across rowspans", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const body = within(window.document.body);

  const view = render(
    React.createElement(UEditor, {
      content: [
        "<table><tbody>",
        '<tr><td rowspan="2">A merged</td><td>B1</td><td>C1</td></tr>',
        "<tr><td>B2</td><td>C2</td></tr>",
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
  hoverColumnHandle(view, 1);
  fireEvent.click(await body.findByRole("button", { name: "Drag Column 2" }));
  fireEvent.click(await body.findByRole("menuitem", { name: "Duplicate Column" }));

  await waitFor(() => {
    const rows = view.container.querySelectorAll("tr");
    const firstRowCells = rows[0]?.querySelectorAll("th,td") ?? [];
    const secondRowCells = rows[1]?.querySelectorAll("th,td") ?? [];

    assert.equal(firstRowCells[0]?.textContent?.trim(), "A merged");
    assert.deepEqual(
      Array.from(firstRowCells).map((cell) => cell.textContent?.trim() ?? ""),
      ["A merged", "B1", "B1", "C1"],
    );
    assert.deepEqual(
      Array.from(secondRowCells).map((cell) => cell.textContent?.trim() ?? ""),
      ["B2", "B2", "C2"],
    );
  });
});

test("UEditor column handle duplicate expands merged column spans", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
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
  fireEvent.click(await body.findByRole("button", { name: "Drag Column 1" }));
  fireEvent.click(await body.findByRole("menuitem", { name: "Duplicate Column" }));

  await waitFor(() => {
    const rows = view.container.querySelectorAll("tr");
    const firstRowCells = rows[0]?.querySelectorAll("th,td") ?? [];
    const secondRowCells = rows[1]?.querySelectorAll("th,td") ?? [];

    assert.equal(firstRowCells[0]?.textContent?.trim(), "Merged");
    assert.equal(firstRowCells[0]?.getAttribute("colspan"), "3");
    assert.equal(firstRowCells[1]?.textContent?.trim(), "C1");
    assert.deepEqual(
      Array.from(secondRowCells).map((cell) => cell.textContent?.trim() ?? ""),
      ["A2", "A2", "B2", "C2"],
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
    assert.equal(body.getByRole("status").textContent?.trim(), "+4R");
  });

  fireEvent.mouseUp(window, { clientY: 140 });

  await waitFor(() => {
    assert.equal(view.container.querySelectorAll("tr").length, 6);
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
  const body = within(window.document.body);
  const ref = React.createRef();

  const view = render(
    React.createElement(UEditor, {
      ref,
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
  await waitFor(() => assert.ok(ref.current?.editor));

  const mergedCellPos = [];
  ref.current.editor.state.doc.descendants((node, pos) => {
    if (node.type.name === "tableCell" || node.type.name === "tableHeader") {
      mergedCellPos.push(pos);
    }
    return true;
  });
  assert.ok(mergedCellPos[0] != null);
  assert.equal(
    ref.current.editor.commands.setCellSelection({ anchorCell: mergedCellPos[0], headCell: mergedCellPos[0] }),
    true,
  );
  ref.current.editor.view.focus();

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

test("UEditor Bookmark Card exposes retry after metadata fetch fails", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const user = userEvent.setup({ document: window.document });
  let attempts = 0;

  render(
    React.createElement(UEditor, {
      content: '<div data-type="bookmark" href="https://retry.example.com"></div>',
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
      fetchMetadata: async () => {
        attempts += 1;
        if (attempts === 1) {
          throw new Error("network");
        }
        return {
          title: "Retry Example",
          description: "Loaded after retry",
          publisher: "retry.example.com",
        };
      },
    }),
  );

  const body = within(window.document.body);
  await body.findByText("Preview failed to load");
  await user.click(await body.findByRole("button", { name: "Retry preview" }));

  await body.findByText("Retry Example");
  await body.findByText("Loaded after retry");
  assert.equal(attempts, 2);
});

test("UEditor CodeBlock language selector and copy function", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const ref = React.createRef();

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
      ref,
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
    assert.ok(codeEl.querySelector("[class*='hljs-']"));
  });

  await waitFor(() => assert.ok(ref.current?.editor));
  ref.current.editor.commands.focus("end");
  ref.current.editor.commands.insertContent("\nconst value = 1;");
  await waitFor(() => {
    const codeEl = view.container.querySelector("code");
    assert.match(codeEl?.textContent ?? "", /const value = 1/);
    assert.ok(codeEl?.querySelector("[class*='hljs-']"));
  });

  const copyButton = view.container.querySelector('button[title="Copy code"]');
  assert.ok(copyButton);
  fireEvent.click(copyButton);

  await waitFor(() => {
    assert.equal(copiedText.trim(), 'console.log("test");\nconst value = 1;');
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

test("UEditor FileCard upload error can be retried from the card", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;
  const user = userEvent.setup({ document: window.document });
  const ref = React.createRef();
  const mockPdfBase64 = "JVBERi0xLjQKJcfsj6yepw==";
  const dataUrl = `data:application/pdf;base64,${mockPdfBase64}`;
  let attempts = 0;
  const originalError = console.error;
  console.error = (...args) => {
    if (String(args[0] ?? "").includes("File upload failed")) {
      return;
    }
    originalError(...args);
  };

  try {
    render(
      React.createElement(UEditor, {
        ref,
        content: `<div data-type="file-card" data-src="${dataUrl}" data-file-name="retry-test.pdf" data-file-size="15" data-file-type="application/pdf"></div>`,
        showToolbar: false,
        showBubbleMenu: false,
        showFloatingMenu: false,
        showCharacterCount: false,
        uploadFile: async (file) => {
          attempts += 1;
          if (attempts === 1) {
            throw new Error("temporary failure");
          }
          return `https://storage.com/retry-${file.name}`;
        },
      }),
    );

    const body = within(window.document.body);
    await body.findByText(/Upload failed: temporary failure/);
    await user.click(await body.findByRole("button", { name: "Retry upload" }));

    await waitFor(() => {
      assert.equal(attempts, 2);
      assert.match(ref.current.editor.getHTML(), /https:\/\/storage\.com\/retry-retry-test\.pdf/);
    }, { timeout: 3000 });
  } finally {
    console.error = originalError;
  }
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
