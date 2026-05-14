import assert from "node:assert/strict";
import path from "node:path";
import test, { after, afterEach } from "node:test";
import React from "./helpers/workspace-react.mjs";
import { cleanup, fireEvent, render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { importTsModule } from "./helpers/import-ts-module.mjs";
import { installJSDOM } from "./helpers/setup-jsdom.mjs";

const restoreDom = installJSDOM();
after(() => restoreDom());
afterEach(() => cleanup());

const componentsRoot = path.resolve(import.meta.dirname, "../src/components");

const largeOptions = Array.from({ length: 1000 }, (_, index) => ({
  label: `User ${index + 1}`,
  value: `user-${index + 1}`,
}));

test("Combobox virtualized rendering does not render every large-list option", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "Combobox.tsx"));
  const user = userEvent.setup({ document: window.document });
  let renderCount = 0;

  render(
    React.createElement(mod.Combobox, {
      options: largeOptions,
      value: null,
      onChange: () => {},
      label: "User",
      usePortal: false,
      virtualized: true,
      maxHeight: 120,
      estimatedItemHeight: 40,
      overscan: 2,
      renderOption: (option) => {
        renderCount += 1;
        return React.createElement("span", null, option.label);
      },
    }),
  );

  await user.click(within(window.document.body).getByRole("combobox", { name: /user/i }));

  assert.ok(renderCount > 0, "Expected visible options to render");
  assert.ok(renderCount < 40, `Expected virtualized rendering to avoid all options, got ${renderCount}`);
});

test("Combobox manual search can prompt before minimum query length", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "Combobox.tsx"));
  const user = userEvent.setup({ document: window.document });
  const queries = [];

  render(
    React.createElement(mod.Combobox, {
      options: largeOptions,
      value: null,
      onChange: () => {},
      label: "Assignee",
      usePortal: false,
      searchMode: "manual",
      onSearchChange: (query) => queries.push(query),
      minSearchLength: 2,
      showSearchPromptWhenEmptyQuery: true,
      renderOption: (option) => React.createElement("span", null, option.label),
    }),
  );

  await user.click(within(window.document.body).getByRole("combobox", { name: /assignee/i }));

  assert.ok(within(window.document.body).getByText("Type at least 2 characters to search"));
  assert.equal(window.document.body.textContent.includes("User 1"), false);

  await user.type(within(window.document.body).getByPlaceholderText("Search…"), "ab");

  assert.ok(queries.includes("ab"));
});

test("Combobox uses selectedOption only when it matches value", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "Combobox.tsx"));

  render(
    React.createElement("div", null,
      React.createElement(mod.Combobox, {
        id: "selected-from-options",
        options: [{ label: "Correct User", value: "user-1" }],
        selectedOption: { label: "Wrong User", value: "user-2" },
        value: "user-1",
        onChange: () => {},
      }),
      React.createElement(mod.Combobox, {
        id: "selected-from-fallback",
        options: [],
        selectedOption: { label: "Fallback User", value: "user-3" },
        value: "user-3",
        onChange: () => {},
      }),
    ),
  );

  assert.ok(window.document.body.textContent.includes("Correct User"));
  assert.ok(window.document.body.textContent.includes("Fallback User"));
  assert.equal(window.document.body.textContent.includes("Wrong User"), false);
});

test("Combobox listbox id and option ids are scoped per instance", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "Combobox.tsx"));
  const user = userEvent.setup({ document: window.document });

  render(
    React.createElement("div", null,
      React.createElement(mod.Combobox, {
        id: "first-combobox",
        options: ["Alpha"],
        value: null,
        onChange: () => {},
        label: "First",
        usePortal: false,
      }),
      React.createElement(mod.Combobox, {
        id: "second-combobox",
        options: ["Alpha"],
        value: null,
        onChange: () => {},
        label: "Second",
        usePortal: false,
      }),
    ),
  );

  const body = within(window.document.body);
  const firstTrigger = body.getByRole("combobox", { name: /first/i });
  const secondTrigger = body.getByRole("combobox", { name: /second/i });

  await user.click(firstTrigger);
  await user.click(secondTrigger);

  assert.equal(firstTrigger.getAttribute("aria-controls"), "first-combobox-listbox");
  assert.equal(secondTrigger.getAttribute("aria-controls"), "second-combobox-listbox");
  assert.equal(window.document.getElementById("first-combobox-listbox")?.getAttribute("role"), "listbox");
  assert.equal(window.document.getElementById("second-combobox-listbox")?.getAttribute("role"), "listbox");
  assert.ok(window.document.getElementById("first-combobox-item-0"));
  assert.ok(window.document.getElementById("second-combobox-item-0"));
  assert.equal(window.document.querySelectorAll("#combobox-item-0").length, 0);
});

test("MultiCombobox virtualized rendering does not render every large-list option", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "MultiCombobox.tsx"));
  const user = userEvent.setup({ document: window.document });
  let renderCount = 0;

  render(
    React.createElement(mod.MultiCombobox, {
      options: largeOptions,
      value: [],
      onChange: () => {},
      label: "Users",
      virtualized: true,
      maxHeight: 120,
      estimatedItemHeight: 40,
      overscan: 2,
      renderOption: (option) => {
        renderCount += 1;
        return React.createElement("span", null, option.label);
      },
    }),
  );

  await user.click(within(window.document.body).getByRole("combobox", { name: /users/i }));
  fireEvent.scroll(within(window.document.body).getByRole("listbox"), { target: { scrollTop: 200 } });

  const listbox = within(window.document.body).getByRole("listbox");
  const virtualRows = Array.from(listbox.querySelectorAll("[data-index]"));
  assert.ok(virtualRows.length > 0, "Expected virtual rows to render");
  assert.equal(listbox.hasAttribute("data-os-ignore"), true);
  assert.equal(
    virtualRows.some((row) => row.classList.contains("dropdown-item")),
    false,
    "Virtual-positioned rows must not use dropdown-item because its transform animation overrides translateY",
  );
  assert.equal(
    virtualRows.every((row) => row.firstElementChild?.classList.contains("dropdown-item")),
    true,
    "Dropdown item animation should stay on an inner element instead of the virtual-positioned row",
  );

  assert.ok(renderCount > 0, "Expected visible options to render");
  assert.ok(renderCount < 80, `Expected virtualized rendering to avoid all options, got ${renderCount}`);
});
