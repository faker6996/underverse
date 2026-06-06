import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";

import { importTsModule } from "./helpers/import-ts-module.mjs";

const componentsRoot = path.resolve(import.meta.dirname, "../src/components");

test("UEditor table formula utilities parse cell addresses and ranges", async () => {
  const formula = await importTsModule(path.join(componentsRoot, "UEditor/table-formula.ts"));

  assert.equal(formula.columnNameToIndex("A"), 0);
  assert.equal(formula.columnNameToIndex("Z"), 25);
  assert.equal(formula.columnNameToIndex("AA"), 26);
  assert.equal(formula.indexToColumnName(27), "AB");

  assert.deepEqual(formula.parseTableCellAddress("AA12"), {
    column: 26,
    row: 11,
    label: "AA12",
  });

  const range = formula.parseTableCellRange("B3:A2");
  assert.ok(range);
  assert.deepEqual(formula.getTableCellRangeLabels(range), ["A2", "B2", "A3", "B3"]);
});

test("UEditor table formula utilities evaluate basic formulas", async () => {
  const formula = await importTsModule(path.join(componentsRoot, "UEditor/table-formula.ts"));
  const values = new Map([
    ["A1", "10"],
    ["A2", "20"],
    ["A3", "30"],
    ["B1", 5],
    ["B2", "15"],
  ]);
  const getCellValue = (label) => values.get(label);

  assert.deepEqual(formula.evaluateBasicTableFormula("=SUM(A1:A3)", getCellValue), { value: 60, error: null });
  assert.deepEqual(formula.evaluateBasicTableFormula("=AVG(A1:A3)", getCellValue), { value: 20, error: null });
  assert.deepEqual(formula.evaluateBasicTableFormula("=(A1 + B1) * 2", getCellValue), { value: 30, error: null });
  assert.deepEqual(formula.evaluateBasicTableFormula("=MAX(A1:A3, B2)", getCellValue), { value: 30, error: null });
  assert.deepEqual(formula.evaluateBasicTableFormula("=COUNT(A1:A3)", getCellValue), { value: 3, error: null });
});

test("UEditor table formula utilities return controlled errors", async () => {
  const formula = await importTsModule(path.join(componentsRoot, "UEditor/table-formula.ts"));
  const getCellValue = (label) => (label === "A1" ? 10 : null);

  assert.deepEqual(formula.evaluateBasicTableFormula("", getCellValue), { value: null, error: "empty" });
  assert.deepEqual(formula.evaluateBasicTableFormula("=A1 / 0", getCellValue), { value: null, error: "division-by-zero" });
  assert.deepEqual(formula.evaluateBasicTableFormula("=A2 + 1", getCellValue), { value: null, error: "invalid-reference" });
  assert.deepEqual(formula.evaluateBasicTableFormula("=UNKNOWN(A1)", getCellValue), { value: null, error: "invalid-formula" });
});
