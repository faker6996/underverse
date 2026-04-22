import assert from "node:assert/strict";
import path from "node:path";
import test, { after, afterEach } from "node:test";
import React from "./helpers/workspace-react.mjs";
import { cleanup, fireEvent, render, waitFor, within } from "@testing-library/react";
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

test("DataTable derives accessible labels from JSX column titles", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "DataTable/index.ts"));
  const DataTable = mod.default;
  const user = userEvent.setup({ document: window.document });

  render(
    React.createElement(DataTable, {
      columns: [
        {
          key: "status",
          title: React.createElement("span", null, "Status", React.createElement("strong", null, " Label")),
          dataIndex: "status",
          sortable: true,
          filter: { type: "text" },
        },
      ],
      data: [{ id: "1", status: "active" }],
      rowKey: "id",
      pageSize: 10,
      size: "md",
      stickyHeader: false,
    }),
  );

  const body = within(window.document.body);
  const sortButton = body.getByRole("button", { name: "Sort by Status Label" });
  const filterButton = body.getByRole("button", { name: "Filter by Status Label" });

  await user.click(filterButton);
  await body.findByPlaceholderText("Search Status Label");
  assert.equal(sortButton.getAttribute("title"), "Sort by Status Label");
  assert.equal(filterButton.getAttribute("title"), "Filter by Status Label");
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
  await user.click(body.getAllByRole("button", { name: /status/i }).find((element) => !/auto fit/i.test(element.getAttribute("aria-label") || "")) ?? (() => { throw new Error("Status toggle button not found"); })());
  await waitFor(() => {
    assert.equal(body.queryByRole("columnheader", { name: /status/i }), null);
    assert.equal(view.queryByText("active"), null);
    assert.deepEqual(getBodyTexts(body).map((text) => text.trim()), ["Alphaadmin"]);
  });
  await user.click(window.document.body);
});

test("DataTable shows full cell text on hover and focus for overflowing plain-text cells", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "DataTable/index.ts"));
  const DataTable = mod.default;
  const user = userEvent.setup({ document: window.document });
  const body = within(window.document.body);

  render(
    React.createElement(DataTable, {
      columns: [
        { key: "hash", title: "Password_hash", dataIndex: "hash", width: 160 },
      ],
      data: [
        { id: "1", hash: "$2a$11$9w9RjWXhGswmlZKSDA8A9JqjvT7L9r4u9o1e2t3u4v5w6x7y8z9" },
      ],
      rowKey: "id",
      pageSize: 10,
      size: "md",
      stickyHeader: false,
    }),
  );

  const cellTrigger = await body.findByRole("button", { name: /\$2a\$11\$9w9Rj/i });
  Object.defineProperty(cellTrigger, "clientWidth", { configurable: true, value: 120 });
  Object.defineProperty(cellTrigger, "scrollWidth", { configurable: true, value: 520 });

  await user.hover(cellTrigger);

  await user.unhover(cellTrigger);
  await user.click(cellTrigger);
  assert.equal(window.document.activeElement, cellTrigger);
  assert.equal(cellTrigger.getAttribute("title"), null);
});

test("DataTable auto-fits a leaf column on header double click", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "DataTable/index.ts"));
  const DataTable = mod.default;

  const view = render(
    React.createElement(DataTable, {
      columns: [
        { key: "email", title: "Email", dataIndex: "email", width: 120 },
      ],
      data: [
        { id: "1", email: "avery.long.email.alias.for.autofit@example-enterprise.com" },
      ],
      rowKey: "id",
      pageSize: 10,
      size: "md",
      stickyHeader: false,
    }),
  );

  const headerCell = await waitFor(() => {
    const element = view.container.querySelector('th[data-underverse-column-key="email"]');
    assert.ok(element);
    return element;
  });

  const bodyCell = await waitFor(() => {
    const element = view.container.querySelector('td[data-underverse-column-key="email"]');
    assert.ok(element);
    return element;
  });

  const bodyContent = bodyCell.querySelector("button");
  assert.ok(bodyContent);

  Object.defineProperty(headerCell, "scrollWidth", { configurable: true, value: 160 });
  Object.defineProperty(bodyCell, "scrollWidth", { configurable: true, value: 340 });
  Object.defineProperty(bodyContent, "scrollWidth", { configurable: true, value: 340 });
  Object.defineProperty(headerCell, "clientWidth", { configurable: true, value: 120 });
  Object.defineProperty(bodyCell, "clientWidth", { configurable: true, value: 120 });
  Object.defineProperty(bodyContent, "clientWidth", { configurable: true, value: 120 });
  headerCell.getBoundingClientRect = () => ({ width: 120, height: 48, top: 0, left: 0, right: 120, bottom: 48, x: 0, y: 0, toJSON() {} });
  bodyCell.getBoundingClientRect = () => ({ width: 120, height: 48, top: 0, left: 0, right: 120, bottom: 48, x: 0, y: 0, toJSON() {} });
  bodyContent.getBoundingClientRect = () => ({ width: 120, height: 24, top: 0, left: 0, right: 120, bottom: 24, x: 0, y: 0, toJSON() {} });

  const autoFitHandle = within(headerCell).getByRole("button", { name: "Auto fit Email" });

  fireEvent.doubleClick(autoFitHandle);

  const widthAfterFit = Number.parseFloat(headerCell.style.width);
  await waitFor(() => {
    assert.ok(Number.isFinite(Number.parseFloat(headerCell.style.width)));
    assert.ok(Number.parseFloat(headerCell.style.width) > 120);
  });

  fireEvent.doubleClick(headerCell);

  await waitFor(() => {
    assert.equal(Number.parseFloat(headerCell.style.width), widthAfterFit);
  });

  fireEvent.doubleClick(autoFitHandle);

  await waitFor(() => {
    assert.equal(Number.parseFloat(headerCell.style.width), widthAfterFit);
  });
});

test("DataTable skips auto-fit when a column is already wide enough", async () => {
  const mod = await importTsModule(path.join(componentsRoot, "DataTable/index.ts"));
  const DataTable = mod.default;

  const view = render(
    React.createElement(DataTable, {
      columns: [
        { key: "email", title: "Email", dataIndex: "email", width: 420 },
      ],
      data: [
        { id: "1", email: "already.roomy.column@example-enterprise.com" },
      ],
      rowKey: "id",
      pageSize: 10,
      size: "md",
      stickyHeader: false,
    }),
  );

  const headerCell = await waitFor(() => {
    const element = view.container.querySelector('th[data-underverse-column-key="email"]');
    assert.ok(element);
    return element;
  });

  const bodyCell = await waitFor(() => {
    const element = view.container.querySelector('td[data-underverse-column-key="email"]');
    assert.ok(element);
    return element;
  });

  const bodyContent = bodyCell.querySelector("button");
  assert.ok(bodyContent);

  Object.defineProperty(headerCell, "scrollWidth", { configurable: true, value: 160 });
  Object.defineProperty(bodyCell, "scrollWidth", { configurable: true, value: 342 });
  Object.defineProperty(bodyContent, "scrollWidth", { configurable: true, value: 342 });
  Object.defineProperty(headerCell, "clientWidth", { configurable: true, value: 420 });
  Object.defineProperty(bodyCell, "clientWidth", { configurable: true, value: 420 });
  Object.defineProperty(bodyContent, "clientWidth", { configurable: true, value: 342 });
  headerCell.getBoundingClientRect = () => ({ width: 420, height: 48, top: 0, left: 0, right: 420, bottom: 48, x: 0, y: 0, toJSON() {} });
  bodyCell.getBoundingClientRect = () => ({ width: 420, height: 48, top: 0, left: 0, right: 420, bottom: 48, x: 0, y: 0, toJSON() {} });
  bodyContent.getBoundingClientRect = () => ({ width: 342, height: 24, top: 0, left: 0, right: 342, bottom: 24, x: 0, y: 0, toJSON() {} });

  const autoFitHandle = within(headerCell).getByRole("button", { name: "Auto fit Email" });
  fireEvent.doubleClick(autoFitHandle);

  await waitFor(() => {
    assert.equal(headerCell.style.width, "420px");
  });
});
