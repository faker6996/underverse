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

function getBodyTexts(body) {
  return body.getAllByRole("row").slice(1).map((row) => row.textContent || "");
}

test("DataTable supports client-side sort, filter, and pagination interactions", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "DataTable/index.ts"));
  const DataTable = mod.default;
  const user = userEvent.setup({ document: window.document });

  const view = render(
    React.createElement(DataTable, {
      columns: [
        { key: "name", title: "Name", dataIndex: "name", sortable: true },
        { key: "status", title: "Status", dataIndex: "status", filter: { type: "text" } },
      ],
      data: [
        { id: "1", name: "Charlie", status: "archived" },
        { id: "2", name: "Alpha", status: "active" },
        { id: "3", name: "Bravo", status: "draft" },
      ],
      rowKey: "id",
      pageSize: 2,
      pageSizeOptions: [2, 5],
      size: "md",
      stickyHeader: false,
    }),
  );
  const body = within(window.document.body);

  assert.deepEqual(getBodyTexts(body).map((text) => text.trim()), ["Charliearchived", "Alphaactive"]);

  await user.click(view.getByTitle("Sort by Name"));
  await waitFor(() => {
    assert.deepEqual(getBodyTexts(body).map((text) => text.trim()), ["Alphaactive", "Bravodraft"]);
  });

  await user.click(body.getByRole("button", { name: "2" }));
  await waitFor(() => {
    assert.deepEqual(getBodyTexts(body).map((text) => text.trim()), ["Charliearchived"]);
  });

  await user.click(body.getByRole("button", { name: "1" }));
  await user.click(view.getByTitle("Filter by Status"));
  const filterInput = await body.findByPlaceholderText("Search Status");
  await user.type(filterInput, "draft");

  await waitFor(() => {
    assert.deepEqual(getBodyTexts(body).map((text) => text.trim()), ["Bravodraft"]);
  });
});

test("DataTable supports density and column visibility controls", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "DataTable/index.ts"));
  const DataTable = mod.default;
  const user = userEvent.setup({ document: window.document });

  const view = render(
    React.createElement(DataTable, {
      columns: [
        { key: "name", title: "Name", dataIndex: "name" },
        { key: "status", title: "Status", dataIndex: "status" },
        { key: "role", title: "Role", dataIndex: "role" },
      ],
      data: [{ id: "1", name: "Alpha", status: "active", role: "admin" }],
      rowKey: "id",
      pageSize: 10,
      size: "md",
      stickyHeader: false,
    }),
  );
  const body = within(window.document.body);

  const getFirstDataRow = () => body.getAllByRole("row")[1];
  assert.match(getFirstDataRow().className, /\bh-12\b/);

  await user.click(body.getByRole("button", { name: /density/i }));
  await user.click(body.getByRole("menuitem", { name: /comfortable/i }));
  await waitFor(() => {
    assert.match(getFirstDataRow().className, /\bh-14\b/);
  });

  await user.click(body.getByRole("button", { name: /columns/i }));
  await user.click(body.getByRole("button", { name: /status/i }));
  await waitFor(() => {
    assert.equal(body.queryByRole("columnheader", { name: /status/i }), null);
    assert.equal(view.queryByText("active"), null);
    assert.deepEqual(getBodyTexts(body).map((text) => text.trim()), ["Alphaadmin"]);
  });
  await user.click(window.document.body);
});
