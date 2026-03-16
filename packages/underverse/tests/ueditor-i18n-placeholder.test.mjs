import assert from "node:assert/strict";
import path from "node:path";
import test, { after, afterEach } from "node:test";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { NextIntlClientProvider } from "next-intl";

import { importTsModule } from "./helpers/import-ts-module.mjs";
import { installJSDOM } from "./helpers/setup-jsdom.mjs";

const restoreDom = installJSDOM();
after(() => restoreDom());

let mountedRoots = [];

afterEach(async () => {
  for (const entry of mountedRoots) {
    await act(async () => {
      entry.root.unmount();
    });
    entry.container.remove();
  }
  mountedRoots = [];
  await new Promise((resolve) => setTimeout(resolve, 0));
});

const componentsRoot = path.resolve(import.meta.dirname, "../src/components");
const hooksRoot = path.resolve(import.meta.dirname, "../src/hooks");

function render(element) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  mountedRoots.push({ root, container });

  return act(async () => {
    root.render(element);
    await new Promise((resolve) => setTimeout(resolve, 0));
  }).then(() => ({ container, root }));
}

test("useSmartTranslations falls back to internal localized defaults when next-intl returns a raw key", async () => {
  const mod = await importTsModule(path.join(hooksRoot, "useSmartTranslations.tsx"));
  const { useSmartTranslations } = mod;

  function Probe() {
    const t = useSmartTranslations("UEditor");
    return React.createElement("div", null, t("toolbar.normal"));
  }

  const view = await render(
    React.createElement(
      NextIntlClientProvider,
      {
        locale: "vi",
        messages: {
          UEditor: {
            toolbar: {},
          },
        },
      },
      React.createElement(Probe),
    ),
  );

  assert.equal(view.container.textContent, "Văn bản thường");
});

test("UEditor does not attach placeholder decorations when the document contains a table", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "UEditor.tsx"));
  const UEditor = mod.default;

  const view = await render(
    React.createElement(UEditor, {
      content: "<table><tbody><tr><td><p></p></td></tr></tbody></table>",
      autofocus: true,
      showToolbar: false,
      showBubbleMenu: false,
      showFloatingMenu: false,
      showCharacterCount: false,
    }),
  );

  const editorElement = view.container.querySelector(".ProseMirror");
  assert.ok(editorElement);
  assert.ok(view.container.querySelector("table"));

  await act(async () => {
    const target = view.container.querySelector("td p") ?? editorElement;
    target.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    target.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
    target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    target.focus?.();
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  assert.equal(view.container.querySelector("[data-placeholder]"), null);
  assert.equal(view.container.querySelector(".is-editor-empty"), null);
  assert.equal(view.container.querySelector("table .is-empty, table.is-empty, table .is-editor-empty, table.is-editor-empty"), null);
});
