import assert from "node:assert/strict";
import path from "node:path";
import test, { after, afterEach } from "node:test";
import React from "react";
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
  { id: 4, name: "Tablets", parent_id: 1 },
  { id: 5, name: "Monitors", parent_id: 1 },
  { id: 6, name: "Audio" },
  { id: 7, name: "Headphones", parent_id: 6 },
  { id: 8, name: "Speakers", parent_id: 6 },
  { id: 9, name: "Accessories" },
  { id: 10, name: "Watches", parent_id: 9 },
  { id: 11, name: "Cameras" },
];

test("CategoryTreeSelect supports label, helper/error text, search, and clear interactions", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "CategoryTreeSelect.tsx"));
  const CategoryTreeSelect = mod.CategoryTreeSelect;
  const user = userEvent.setup({ document: window.document });

  function Harness() {
    const [value, setValue] = React.useState([]);

    return React.createElement(CategoryTreeSelect, {
      categories,
      value,
      onChange: setValue,
      label: "Departments",
      helperText: value.length > 0 ? "Selection is valid." : undefined,
      error: value.length === 0 ? "Pick at least one department." : undefined,
      placeholder: "Choose departments",
      allowClear: true,
      size: "md",
      variant: "outline",
    });
  }

  render(React.createElement(Harness));
  const body = within(window.document.body);

  const trigger = body.getByRole("combobox", { name: /departments/i });
  assert.equal(trigger.getAttribute("aria-invalid"), "true");
  assert.ok(body.getByText("Pick at least one department."));

  await user.click(trigger);
  const searchInput = await body.findByPlaceholderText("Search...");
  await user.type(searchInput, "cam");
  await user.click(body.getByText("Cameras"));

  await waitFor(() => {
    assert.equal(trigger.getAttribute("aria-invalid"), "false");
    assert.ok(body.getByText("Selection is valid."));
    assert.match(trigger.textContent || "", /Cameras/);
  });

  const clearButton = body.getByRole("button", { name: "Clear selection" });
  await user.click(clearButton);

  await waitFor(() => {
    assert.equal(trigger.getAttribute("aria-invalid"), "true");
    assert.ok(body.getByText("Pick at least one department."));
    assert.match(trigger.textContent || "", /Choose departments/);
  });
});

test("CategoryTreeSelect single-select mode can select and clear one node", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "CategoryTreeSelect.tsx"));
  const CategoryTreeSelect = mod.CategoryTreeSelect;
  const user = userEvent.setup({ document: window.document });

  function Harness() {
    const [value, setValue] = React.useState(null);

    return React.createElement(CategoryTreeSelect, {
      categories,
      value,
      onChange: setValue,
      label: "Primary category",
      placeholder: "Select one category",
      allowClear: true,
      singleSelect: true,
    });
  }

  render(React.createElement(Harness));
  const body = within(window.document.body);

  const trigger = body.getByRole("combobox", { name: /primary category/i });
  await user.click(trigger);
  await user.click(body.getByText("Audio"));

  await waitFor(() => {
    assert.match(trigger.textContent || "", /Audio/);
  });

  await user.click(body.getByRole("button", { name: "Clear selection" }));

  await waitFor(() => {
    assert.match(trigger.textContent || "", /Select one category/);
  });
});
