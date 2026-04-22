import assert from "node:assert/strict";
import path from "node:path";
import test, { after, afterEach } from "node:test";
import React, { createRoot } from "./helpers/workspace-react.mjs";

import { importTsModule, requireTempModule } from "./helpers/import-ts-module.mjs";
import { installJSDOM } from "./helpers/setup-jsdom.mjs";

const { act } = React;
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

const contextsRoot = path.resolve(import.meta.dirname, "../src/contexts");
const legacyAdapterPath = path.resolve(import.meta.dirname, "../src/contexts/translation-adapter.tsx");

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

test("UnderverseProvider keeps legacy translations overrides working", async () => {
  const adapterMod = await importTsModule(legacyAdapterPath);
  const { UnderverseProvider, useTranslations } = adapterMod;

  function Probe() {
    const t = useTranslations("Common");
    return React.createElement("div", null, t("close"));
  }

  const view = await render(
    React.createElement(
      UnderverseProvider,
      {
        locale: "vi",
        translations: {
          Common: {
            close: "Đóng ngay",
          },
        },
      },
      React.createElement(Probe),
    ),
  );

  assert.equal(view.container.textContent, "Đóng ngay");
});

test("legacy translation-adapter interpolates params from NextIntlAdapter", async () => {
  const adapterMod = await importTsModule(legacyAdapterPath);
  const bridgeMod = await importTsModule(path.join(contextsRoot, "NextIntlAdapter.tsx"));
  const { useTranslations } = adapterMod;
  const { NextIntlAdapter } = bridgeMod;

  function Probe() {
    const t = useTranslations("Pagination");
    return React.createElement("div", null, t("showingResults", { startItem: 1, endItem: 10, totalItems: 42 }));
  }

  const view = await render(
    React.createElement(
      NextIntlClientProvider,
      {
        locale: "en",
        onError: () => {},
        messages: {
          Pagination: {
            showingResults: "Showing {startItem}-{endItem} of {totalItems}",
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

  assert.equal(view.container.textContent, "Showing 1-10 of 42");
});

test("legacy translation-adapter locale follows NextIntlAdapter", async () => {
  const adapterMod = await importTsModule(legacyAdapterPath);
  const bridgeMod = await importTsModule(path.join(contextsRoot, "NextIntlAdapter.tsx"));
  const { useLocale } = adapterMod;
  const { NextIntlAdapter } = bridgeMod;

  function Probe() {
    return React.createElement("div", null, useLocale());
  }

  const view = await render(
    React.createElement(
      NextIntlClientProvider,
      {
        locale: "ja",
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

  assert.equal(view.container.textContent, "ja");
});
