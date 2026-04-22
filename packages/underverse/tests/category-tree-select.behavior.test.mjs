import assert from "node:assert/strict";
import path from "node:path";
import test, { after, afterEach } from "node:test";
import React from "./helpers/workspace-react.mjs";
import { cleanup, render, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { importTsModule } from "./helpers/import-ts-module.mjs";
import { installJSDOM } from "./helpers/setup-jsdom.mjs";

const restoreDom = installJSDOM();
after(() => restoreDom());
afterEach(() => cleanup());

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

const deepCategories = [
  { id: 1, name: "Root" },
  { id: 2, name: "Parent", parent_id: 1 },
  { id: 3, name: "Child", parent_id: 2 },
  { id: 4, name: "Leaf", parent_id: 3 },
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

test("CategoryTreeSelect recursively selects ancestors and prunes them when deselecting a deep leaf", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "CategoryTreeSelect.tsx"));
  const CategoryTreeSelect = mod.CategoryTreeSelect;
  const user = userEvent.setup({ document: window.document });

  function Harness() {
    const [value, setValue] = React.useState([]);

    return React.createElement(CategoryTreeSelect, {
      categories: deepCategories,
      value,
      onChange: setValue,
      label: "Hierarchy",
      placeholder: "Choose",
      allowClear: true,
      defaultExpandedIds: [1, 2, 3],
      inline: true,
      helperText: value.join(","),
    });
  }

  render(React.createElement(Harness));
  const body = within(window.document.body);

  await user.click(body.getByText("Leaf"));

  await waitFor(() => {
    assert.ok(body.getByText("1,2,3,4"));
  });

  await user.click(body.getByText("Leaf"));

  await waitFor(() => {
    assert.ok(body.queryByText("1,2,3,4") === null);
  });
});
