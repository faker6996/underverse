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

test("UEditor table formula suggestions filter spreadsheet functions", async () => {
  const suggestion = await importTsModule(path.join(componentsRoot, "UEditor/formula-suggestion.tsx"));

  assert.deepEqual(
    suggestion.buildFormulaSuggestionItems({ query: "" }).map((item) => item.name),
    ["SUM", "AVG", "MIN", "MAX", "COUNT"],
  );
  assert.deepEqual(
    suggestion.buildFormulaSuggestionItems({ query: "m" }).map((item) => item.name),
    ["MIN", "MAX"],
  );
  assert.deepEqual(
    suggestion.buildFormulaSuggestionItems({ query: "co" }).map((item) => item.name),
    ["COUNT"],
  );
  assert.deepEqual(suggestion.buildFormulaSuggestionItems({ query: "unknown" }), []);
});

test("UEditor table formula utilities detect draft formulas while users are typing", async () => {
  const formula = await importTsModule(path.join(componentsRoot, "UEditor/table-formula.ts"));

  assert.equal(formula.isDraftTableFormula("="), true);
  assert.equal(formula.isDraftTableFormula("=SUM()"), true);
  assert.equal(formula.isDraftTableFormula("=SUM("), true);
  assert.equal(formula.isDraftTableFormula("=A1+"), true);
  assert.equal(formula.isDraftTableFormula("=SUM(A1:A2)"), false);
  assert.equal(formula.isDraftTableFormula("=A1+B1"), false);
});

test("UEditor table formula utilities format computed display values", async () => {
  const formula = await importTsModule(path.join(componentsRoot, "UEditor/table-formula.ts"));

  assert.equal(formula.formatTableFormulaDisplayValue("1234.5", "number"), "1,234.5");
  assert.equal(formula.formatTableFormulaDisplayValue("1234.5", "currency"), "$1,234.50");
  assert.equal(formula.formatTableFormulaDisplayValue("0.125", "percent"), "12.5%");
  assert.equal(formula.formatTableFormulaDisplayValue("45658", "date"), "01/01/2025");
  assert.equal(formula.formatTableFormulaDisplayValue("#INVALID-REFERENCE", "currency"), "#INVALID-REFERENCE");
});

test("UEditor table formula utilities return controlled errors", async () => {
  const formula = await importTsModule(path.join(componentsRoot, "UEditor/table-formula.ts"));
  const getCellValue = (label) => (label === "A1" ? 10 : null);

  assert.deepEqual(formula.evaluateBasicTableFormula("", getCellValue), { value: null, error: "empty" });
  assert.deepEqual(formula.evaluateBasicTableFormula("=A1 / 0", getCellValue), { value: null, error: "division-by-zero" });
  assert.deepEqual(formula.evaluateBasicTableFormula("=A2 + 1", getCellValue), { value: null, error: "invalid-reference" });
  assert.deepEqual(formula.evaluateBasicTableFormula("=UNKNOWN(A1)", getCellValue), { value: null, error: "invalid-formula" });
});

test("UEditor table formula utilities treat text references as invalid in aggregates", async () => {
  const formula = await importTsModule(path.join(componentsRoot, "UEditor/table-formula.ts"));
  const values = new Map([
    ["A1", "hello"],
    ["A2", "10"],
  ]);
  const getCellValue = (label) => values.get(label);

  assert.deepEqual(formula.evaluateBasicTableFormula("=SUM(A1:A2)", getCellValue), { value: null, error: "invalid-reference" });
  assert.deepEqual(formula.evaluateBasicTableFormula("=COUNT(A1:A2)", getCellValue), { value: null, error: "invalid-reference" });
});

test("UEditor table formula utilities build dependency order and detect cycles", async () => {
  const formula = await importTsModule(path.join(componentsRoot, "UEditor/table-formula.ts"));

  assert.deepEqual(formula.getTableFormulaReferences("=SUM(A1:A2) + B1"), ["A1", "A2", "B1"]);

  const graph = formula.buildTableFormulaDependencyGraph([
    { label: "B1", formula: "=A1 * 2" },
    { label: "C1", formula: "=B1 + 5" },
  ]);
  assert.deepEqual(formula.getTableFormulaRecalculationOrder(graph), {
    order: ["B1", "C1"],
    circular: new Set(),
  });

  const circularGraph = formula.buildTableFormulaDependencyGraph([
    { label: "A1", formula: "=B1" },
    { label: "B1", formula: "=A1" },
    { label: "C1", formula: "=A1 + 1" },
  ]);
  const circularOrder = formula.getTableFormulaRecalculationOrder(circularGraph);
  assert.deepEqual(circularOrder.order, ["C1"]);
  assert.deepEqual(circularOrder.circular, new Set(["A1", "B1"]));
});

test("UEditor table formula dependency graph handles large linear chains", async () => {
  const formula = await importTsModule(path.join(componentsRoot, "UEditor/table-formula.ts"));
  const cells = Array.from({ length: 500 }, (_, index) => ({
    label: `A${index + 2}`,
    formula: index === 0 ? "=A1+1" : `=A${index + 1}+1`,
  }));
  const startedAt = performance.now();
  const graph = formula.buildTableFormulaDependencyGraph(cells);
  const order = formula.getTableFormulaRecalculationOrder(graph);
  const durationMs = performance.now() - startedAt;

  assert.equal(order.order.length, 500);
  assert.equal(order.order[0], "A2");
  assert.equal(order.order.at(-1), "A501");
  assert.equal(order.circular.size, 0);
  assert.ok(durationMs < 1000, `expected formula dependency graph to finish under 1000ms, got ${durationMs}ms`);
});
