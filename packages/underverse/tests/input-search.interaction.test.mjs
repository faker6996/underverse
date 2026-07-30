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

const inputModulePath = path.resolve(import.meta.dirname, "../src/components/Input.tsx");

test("SearchInput button mode searches explicitly and exposes attached clear/search actions", async () => {
  const { SearchInput } = await importTsModule(inputModulePath);
  const user = userEvent.setup({ document: window.document });
  const searches = [];

  render(
    React.createElement(SearchInput, {
      mode: "button",
      defaultValue: "jgdjdfdfdg",
      onSearch: (value) => searches.push(value),
      searchDelay: 0,
      searchButtonLabel: "Run search",
    }),
  );

  const body = within(window.document.body);
  const input = body.getByRole("searchbox");
  const searchButton = body.getByRole("button", { name: "Run search" });

  assert.equal(input.value, "jgdjdfdfdg");
  assert.match(searchButton.className, /border-l/);
  assert.match(searchButton.className, /cursor-pointer/);
  await waitFor(() => assert.deepEqual(searches, []));

  await user.click(searchButton);
  assert.deepEqual(searches, ["jgdjdfdfdg"]);

  await user.click(body.getByRole("button", { name: "Clear input" }));
  assert.equal(input.value, "");

  await user.type(input, "underverse");
  assert.deepEqual(searches, ["jgdjdfdfdg"]);

  await user.keyboard("{Enter}");
  assert.deepEqual(searches, ["jgdjdfdfdg", "underverse"]);
});

test("SearchInput button mode can clear a controlled value through onChange", async () => {
  const { SearchInput } = await importTsModule(inputModulePath);
  const user = userEvent.setup({ document: window.document });

  function Harness() {
    const [value, setValue] = React.useState("controlled");

    return React.createElement(SearchInput, {
      mode: "button",
      value,
      onChange: (event) => setValue(event.target.value),
    });
  }

  render(React.createElement(Harness));
  const body = within(window.document.body);
  const input = body.getByRole("searchbox");

  await user.click(body.getByRole("button", { name: "Clear input" }));
  await waitFor(() => assert.equal(input.value, ""));
});

test("SearchInput default mode keeps debounced search behavior", async () => {
  const { SearchInput } = await importTsModule(inputModulePath);
  const user = userEvent.setup({ document: window.document });
  const searches = [];

  render(
    React.createElement(SearchInput, {
      searchDelay: 0,
      onSearch: (value) => searches.push(value),
      searchButtonLabel: "Run search",
    }),
  );

  const body = within(window.document.body);
  const input = body.getByRole("searchbox");
  assert.equal(body.queryByRole("button", { name: "Run search" }), null);

  await user.type(input, "query");
  await waitFor(() => assert.equal(searches.at(-1), "query"));
});
