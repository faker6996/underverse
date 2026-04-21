import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import { importTsModule } from "./helpers/import-ts-module.mjs";

const componentsRoot = path.resolve(import.meta.dirname, "../src/components");

async function loadTabHelpers() {
  const mod = await importTsModule(path.join(componentsRoot, "Tab.tsx"));
  return {
    getTabsBaseId: mod.getTabsBaseId,
    getTabHref: mod.getTabHref,
    resolveTabValueFromHash: mod.resolveTabValueFromHash,
    shouldHandleTabClickLocally: mod.shouldHandleTabClickLocally,
  };
}

const tabs = [
  { value: "preview" },
  { value: "code" },
  { value: "docs" },
];

test("Tabs derive stable internal href targets for middle-click and context-menu open", async () => {
  const { getTabsBaseId, getTabHref } = await loadTabHelpers();

  const baseId = getTabsBaseId(tabs);
  assert.equal(baseId, "tabs-preview-code-docs");
  assert.equal(getTabsBaseId(tabs, "Button Example Tabs"), "tabs-button-example-tabs");
  assert.equal(getTabHref({}, `${baseId}-panel-1`), "#tabs-preview-code-docs-panel-1");
  assert.equal(getTabHref({ href: "/docs/tabs" }, `${baseId}-panel-1`), "/docs/tabs");
});

test("Tabs only hijack plain left click and leave modifier-click behavior to the browser", async () => {
  const { shouldHandleTabClickLocally } = await loadTabHelpers();

  assert.equal(shouldHandleTabClickLocally({ metaKey: false, ctrlKey: false, shiftKey: false, altKey: false }), true);
  assert.equal(shouldHandleTabClickLocally({ metaKey: false, ctrlKey: true, shiftKey: false, altKey: false }), false);
  assert.equal(shouldHandleTabClickLocally({ metaKey: true, ctrlKey: false, shiftKey: false, altKey: false }), false);
  assert.equal(shouldHandleTabClickLocally({ metaKey: false, ctrlKey: false, shiftKey: false, altKey: false }, "_blank"), false);
});

test("Tabs resolve the active value from the hash when a new browser tab opens on a tab link", async () => {
  const { getTabsBaseId, resolveTabValueFromHash } = await loadTabHelpers();

  const baseId = getTabsBaseId(tabs);

  assert.equal(resolveTabValueFromHash("#tabs-preview-code-docs-panel-2", tabs, baseId), "docs");
  assert.equal(resolveTabValueFromHash("#tabs-preview-code-docs-tab-1", tabs, baseId), "code");
  assert.equal(resolveTabValueFromHash("#unknown", tabs, baseId), null);
});
