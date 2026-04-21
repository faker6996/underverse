import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import { importTsModule } from "./helpers/import-ts-module.mjs";

const componentsRoot = path.resolve(import.meta.dirname, "../src/components");

const categories = [
  { id: 1, name: "Electronics" },
  { id: 2, name: "Phones", parent_id: 1 },
  { id: 3, name: "Laptops", parent_id: 1 },
  { id: 6, name: "Audio", parent_id: 1 },
  { id: 7, name: "Headphones", parent_id: 6 },
  { id: 8, name: "Speakers", parent_id: 6 },
  { id: 9, name: "Accessories" },
  { id: 10, name: "Watches", parent_id: 9 },
];

async function loadHelpers() {
  const mod = await importTsModule(path.join(componentsRoot, "CategoryTreeSelect.tsx"));
  return {
    getAncestorPathIds: mod.getAncestorPathIds,
    getInitialExpandedNodes: mod.getInitialExpandedNodes,
    getExpandedNodesState: mod.getExpandedNodesState,
  };
}

test("CategoryTreeSelect expands the ancestor path for expandToId", async () => {
  const { getAncestorPathIds, getInitialExpandedNodes } = await loadHelpers();

  assert.deepEqual(Array.from(getAncestorPathIds(categories, 7)).sort((a, b) => a - b), [1, 6, 7]);

  const expanded = getInitialExpandedNodes(categories, {
    defaultExpanded: false,
    defaultExpandedIds: undefined,
    expandToId: 7,
    viewOnly: false,
    inline: true,
  });

  assert.deepEqual(Array.from(expanded).sort((a, b) => a - b), [1, 6, 7]);
});

test("CategoryTreeSelect can expand explicit branch ids without expanding unrelated paths", async () => {
  const { getInitialExpandedNodes } = await loadHelpers();

  const expanded = getInitialExpandedNodes(categories, {
    defaultExpanded: false,
    defaultExpandedIds: [1, 9],
    expandToId: null,
    viewOnly: false,
    inline: true,
  });

  assert.deepEqual(Array.from(expanded).sort((a, b) => a - b), [1, 9]);
});

test("CategoryTreeSelect keeps existing defaultExpanded behavior for inline or view-only trees", async () => {
  const { getInitialExpandedNodes } = await loadHelpers();

  const expanded = getInitialExpandedNodes(categories, {
    defaultExpanded: true,
    defaultExpandedIds: undefined,
    expandToId: null,
    viewOnly: true,
    inline: false,
  });

  assert.deepEqual(Array.from(expanded).sort((a, b) => a - b), [1, 6, 9]);
});

test("CategoryTreeSelect treats expandedIds as controlled state, including an empty array", async () => {
  const { getExpandedNodesState } = await loadHelpers();

  const uncontrolled = new Set([1, 6]);

  assert.deepEqual(Array.from(getExpandedNodesState([9], uncontrolled)).sort((a, b) => a - b), [9]);
  assert.deepEqual(Array.from(getExpandedNodesState([], uncontrolled)).sort((a, b) => a - b), []);
  assert.deepEqual(Array.from(getExpandedNodesState(undefined, uncontrolled)).sort((a, b) => a - b), [1, 6]);
});
