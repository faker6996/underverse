import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import test, { after, afterEach } from "node:test";
import React from "./helpers/workspace-react.mjs";

import { importTsModule, requireTempModule } from "./helpers/import-ts-module.mjs";
import { installJSDOM } from "./helpers/setup-jsdom.mjs";

const { act } = React;
const requireWorkspace = createRequire(path.resolve(import.meta.dirname, "../../../package.json"));
const { createRoot } = requireWorkspace("react-dom/client");
const { NextIntlClientProvider } = requireTempModule("next-intl");

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
const contextsRoot = path.resolve(import.meta.dirname, "../src/contexts");
const ueditorRoot = path.resolve(import.meta.dirname, "../src/components/UEditor");

async function render(element) {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  mountedRoots.push({ root, container });

  await act(async () => {
    root.render(element);
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  return { container, root };
}

test("useSmartTranslations falls back to internal localized defaults when NextIntlAdapter receives a raw key", async () => {
  document.documentElement.lang = "vi";
  const hooksMod = await importTsModule(path.join(hooksRoot, "useSmartTranslations.tsx"));
  const adapterMod = await importTsModule(path.join(contextsRoot, "NextIntlAdapter.tsx"));
  const { useSmartTranslations } = hooksMod;
  const { NextIntlAdapter } = adapterMod;

  function Probe() {
    const t = useSmartTranslations("UEditor");
    return React.createElement("div", null, t("toolbar.normal"));
  }

  const view = await render(
    React.createElement(
      NextIntlClientProvider,
      {
        locale: "vi",
        onError: () => {},
        messages: {
          UEditor: {
            toolbar: {},
          },
        },
      },
      React.createElement(
        NextIntlAdapter,
        null,
        React.createElement(Probe),
      ),
    ),
  );

  assert.equal(view.container.textContent, "Văn bản thường");
});

test("useSmartLocale prefers the NextIntlAdapter locale over the document locale", async () => {
  document.documentElement.lang = "ko";
  const hooksMod = await importTsModule(path.join(hooksRoot, "useSmartTranslations.tsx"));
  const adapterMod = await importTsModule(path.join(contextsRoot, "NextIntlAdapter.tsx"));
  const { useSmartLocale } = hooksMod;
  const { NextIntlAdapter } = adapterMod;

  function Probe() {
    const locale = useSmartLocale();
    return React.createElement("div", null, locale);
  }

  const view = await render(
    React.createElement(
      NextIntlClientProvider,
      {
        locale: "vi",
        onError: () => {},
        messages: {},
      },
      React.createElement(
        NextIntlAdapter,
        null,
        React.createElement(Probe),
      ),
    ),
  );

  assert.equal(view.container.textContent, "vi");
});

test("useSmartLocale falls back to the document locale without NextIntlAdapter", async () => {
  document.documentElement.lang = "ko";
  const hooksMod = await importTsModule(path.join(hooksRoot, "useSmartTranslations.tsx"));
  const { useSmartLocale } = hooksMod;

  function Probe() {
    const locale = useSmartLocale();
    return React.createElement("div", null, locale);
  }

  const view = await render(React.createElement(Probe));

  assert.equal(view.container.textContent, "ko");
});

test("useSmartLocale preserves an explicit internal locale without NextIntlAdapter", async () => {
  document.documentElement.lang = "en";
  const hooksMod = await importTsModule(path.join(hooksRoot, "useSmartTranslations.tsx"));
  const contextMod = await importTsModule(path.join(path.resolve(import.meta.dirname, "../src/contexts"), "TranslationContext.tsx"));
  const { useSmartLocale } = hooksMod;
  const { TranslationProvider } = contextMod;

  function Probe() {
    const locale = useSmartLocale();
    return React.createElement("div", null, locale);
  }

  const view = await render(
    React.createElement(
      TranslationProvider,
      { locale: "ja" },
      React.createElement(Probe),
    ),
  );

  assert.equal(view.container.textContent, "ja");
});

test("NextIntlAdapter degrades gracefully when no next-intl provider is mounted", async () => {
  document.documentElement.lang = "vi";
  const hooksMod = await importTsModule(path.join(hooksRoot, "useSmartTranslations.tsx"));
  const adapterMod = await importTsModule(path.join(contextsRoot, "NextIntlAdapter.tsx"));
  const { useSmartLocale } = hooksMod;
  const { NextIntlAdapter } = adapterMod;

  function Probe() {
    return React.createElement("div", null, useSmartLocale());
  }

  const originalConsoleError = console.error;
  console.error = () => {};

  try {
    const view = await render(
      React.createElement(
        NextIntlAdapter,
        null,
        React.createElement(Probe),
      ),
    );

    assert.equal(view.container.textContent, "vi");
  } finally {
    console.error = originalConsoleError;
  }
});

test("NextIntlAdapter uses explicit locale and messages without relying on next-intl context", async () => {
  const hooksMod = await importTsModule(path.join(hooksRoot, "useSmartTranslations.tsx"));
  const adapterMod = await importTsModule(path.join(contextsRoot, "NextIntlAdapter.tsx"));
  const { useSmartTranslations, useSmartLocale } = hooksMod;
  const { NextIntlAdapter } = adapterMod;

  function Probe() {
    const t = useSmartTranslations("UEditor");
    const locale = useSmartLocale();
    return React.createElement("div", null, `${locale}:${t("toolbar.normal")}`);
  }

  const view = await render(
    React.createElement(
      NextIntlAdapter,
      {
        locale: "vi",
        messages: {
          UEditor: {
            toolbar: {
              normal: "Văn bản thường từ adapter",
            },
          },
        },
      },
      React.createElement(Probe),
    ),
  );

  assert.equal(view.container.textContent, "vi:Văn bản thường từ adapter");
});

test("UEditor table extension allows selecting the full table node", async () => {
  const mod = await importTsModule(path.join(ueditorRoot, "extensions.ts"));
  const extensions = mod.buildUEditorExtensions({
    placeholder: "Placeholder",
    translate: (key) => key,
    editable: true,
  });

  const tableExtension = extensions.find((extension) => extension.name === "table");

  assert.ok(tableExtension);
  assert.equal(tableExtension.options.allowTableNodeSelection, true);
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
