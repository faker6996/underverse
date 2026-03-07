import assert from "node:assert/strict";
import test from "node:test";

import { getColumnWidth } from "../src/components/DataTable/utils/columns.ts";
import {
  buildHeaderRows,
  filterVisibleColumns,
  getHeaderDepth,
  getLeafColumns,
  getLeafColumnsWithFixedInheritance,
} from "../src/components/DataTable/utils/headers.ts";
import { validateColumns } from "../src/components/DataTable/utils/validation.ts";

const groupedColumns = [
  {
    key: "identity",
    title: "Identity",
    fixed: "left",
    children: [
      { key: "name", title: "Name", width: 120 },
      { key: "email", title: "Email", width: "200px" },
    ],
  },
  {
    key: "meta",
    title: "Meta",
    children: [
      { key: "status", title: "Status", width: 100 },
      { key: "created", title: "Created", width: 160 },
    ],
  },
  { key: "actions", title: "Actions", width: 90, fixed: "right" },
];

test("header utilities build correct leaf/header structure for grouped columns", () => {
  assert.equal(getHeaderDepth(groupedColumns), 2);
  assert.deepEqual(getLeafColumns(groupedColumns).map((column) => column.key), ["name", "email", "status", "created", "actions"]);

  const headerRows = buildHeaderRows(groupedColumns);
  assert.equal(headerRows.length, 2);
  assert.deepEqual(
    headerRows[0].map((cell) => ({ key: cell.column.key, colSpan: cell.colSpan, rowSpan: cell.rowSpan })),
    [
      { key: "identity", colSpan: 2, rowSpan: 1 },
      { key: "meta", colSpan: 2, rowSpan: 1 },
      { key: "actions", colSpan: 1, rowSpan: 2 },
    ],
  );
  assert.deepEqual(
    headerRows[1].map((cell) => cell.column.key),
    ["name", "email", "status", "created"],
  );
});

test("filterVisibleColumns preserves groups that still have visible descendants", () => {
  const filtered = filterVisibleColumns(groupedColumns, new Set(["email", "created", "actions"]));

  assert.deepEqual(filtered.map((column) => column.key), ["identity", "meta", "actions"]);
  assert.deepEqual(filtered[0].children?.map((column) => column.key), ["email"]);
  assert.deepEqual(filtered[1].children?.map((column) => column.key), ["created"]);
});

test("sticky inheritance and width helpers resolve group defaults correctly", () => {
  const leaves = getLeafColumnsWithFixedInheritance(groupedColumns);

  assert.deepEqual(
    leaves.map((column) => ({ key: column.key, fixed: column.fixed })),
    [
      { key: "name", fixed: "left" },
      { key: "email", fixed: "left" },
      { key: "status", fixed: undefined },
      { key: "created", fixed: undefined },
      { key: "actions", fixed: "right" },
    ],
  );

  assert.equal(getColumnWidth(groupedColumns[0]), 320);
  assert.equal(getColumnWidth(groupedColumns[1]), 260);
  assert.equal(getColumnWidth({ key: "fallback", title: "Fallback" }), 150);
});

test("validateColumns reports structural and UX warnings for risky configurations", () => {
  const warnings = validateColumns([
    {
      key: "group",
      title: "Group",
      dataIndex: "ignored",
      sortable: true,
      filter: { type: "text" },
      render: () => "x",
      fixed: "left",
      colSpan: 1,
      children: [
        { key: "child-a", title: "Child A", fixed: "right" },
        { key: "child-b", title: "Child B" },
      ],
    },
    {
      key: "duplicate",
      title: "Duplicate",
      children: [{ key: "duplicate", title: "Leaf duplicate", children: [] }],
    },
    {
      key: "d1",
      title: "Depth 1",
      children: [
        {
          key: "d2",
          title: "Depth 2",
          children: [
            {
              key: "d3",
              title: "Depth 3",
              children: [
                {
                  key: "d4",
                  title: "Depth 4",
                  children: [{ key: "d5", title: "Depth 5" }],
                },
              ],
            },
          ],
        },
      ],
    },
  ]);

  assert.ok(warnings.some((warning) => warning.includes('Group column "group" has dataIndex')));
  assert.ok(warnings.some((warning) => warning.includes('Group column "group" has sortable')));
  assert.ok(warnings.some((warning) => warning.includes('Group column "group" has filter')));
  assert.ok(warnings.some((warning) => warning.includes('Group column "group" has render function')));
  assert.ok(warnings.some((warning) => warning.includes('Column "group" has colSpan=1 but structure suggests 2')));
  assert.ok(warnings.some((warning) => warning.includes('children have different fixed values: child-a')));
  assert.ok(warnings.some((warning) => warning.includes('Leaf column "duplicate.duplicate" has children property')));
  assert.ok(warnings.some((warning) => warning.includes('Duplicate key "duplicate"')));
  assert.ok(warnings.some((warning) => warning.includes('Header depth is 5 rows')));
  assert.ok(warnings.some((warning) => warning.includes('mixed sticky children')));
});
