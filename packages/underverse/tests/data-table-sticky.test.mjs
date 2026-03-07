import assert from "node:assert/strict";
import test from "node:test";

import {
  buildStickyLayout,
  resolveGroupStickyPosition,
  resolveStickyPosition,
} from "../src/components/DataTable/utils/sticky.ts";

const columns = [
  {
    key: "identity",
    title: "Identity",
    fixed: "left",
    children: [
      { key: "name", title: "Name", width: 120 },
      { key: "email", title: "Email", width: 200 },
    ],
  },
  { key: "role", title: "Role", width: 140 },
  {
    key: "actions-group",
    title: "Actions",
    fixed: "right",
    children: [
      { key: "status", title: "Status", width: 110 },
      { key: "actions", title: "Actions", width: 90 },
    ],
  },
];

test("buildStickyLayout computes offsets and boundary keys from leaf columns", () => {
  const layout = buildStickyLayout(columns);

  assert.deepEqual(layout.positions.name, { left: 0 });
  assert.deepEqual(layout.positions.email, { left: 120 });
  assert.deepEqual(layout.positions.actions, { right: 0 });
  assert.deepEqual(layout.positions.status, { right: 90 });
  assert.equal(layout.leftBoundaryKey, "email");
  assert.equal(layout.rightBoundaryKey, "status");
});

test("resolveStickyPosition only returns offsets for fixed columns", () => {
  const layout = buildStickyLayout(columns);
  const fixedLeaf = { ...columns[0].children[0], fixed: "left" };
  const rightLeaf = { ...columns[2].children[1], fixed: "right" };

  assert.deepEqual(resolveStickyPosition(fixedLeaf, layout.positions), { left: 0 });
  assert.equal(resolveStickyPosition(columns[0].children[0], layout.positions), undefined);
  assert.equal(resolveStickyPosition(columns[1], layout.positions), undefined);
  assert.deepEqual(resolveStickyPosition(rightLeaf, layout.positions), { right: 0 });
});

test("resolveGroupStickyPosition anchors left and right groups to their sticky descendants", () => {
  const layout = buildStickyLayout(columns);

  assert.deepEqual(resolveGroupStickyPosition(columns[0], layout.positions), { left: 0 });
  assert.deepEqual(resolveGroupStickyPosition(columns[2], layout.positions), { right: 0 });
  assert.equal(resolveGroupStickyPosition(columns[1], layout.positions), undefined);
});
