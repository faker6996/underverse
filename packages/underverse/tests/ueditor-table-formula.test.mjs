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

test("UEditor table formula utilities evaluate common decimal and unary-plus syntax", async () => {
  const formula = await importTsModule(path.join(componentsRoot, "UEditor/table-formula.ts"));

  assert.deepEqual(formula.evaluateBasicTableFormula("=.5 + .25", () => null), { value: 0.75, error: null });
  assert.deepEqual(formula.evaluateBasicTableFormula("=+1 + +.5", () => null), { value: 1.5, error: null });
});

test("UEditor table formula utilities parse formatted cell values without accepting partial numbers", async () => {
  const formula = await importTsModule(path.join(componentsRoot, "UEditor/table-formula.ts"));
  const values = new Map([
    ["A1", "1,234.5"],
    ["A2", "$2,000.25"],
    ["A3", "12.5%"],
    ["A4", "12abc"],
  ]);
  const getCellValue = (label) => values.get(label);

  assert.deepEqual(formula.evaluateBasicTableFormula("=A1 + 1", getCellValue), { value: 1235.5, error: null });
  assert.deepEqual(formula.evaluateBasicTableFormula("=A2 + 1", getCellValue), { value: 2001.25, error: null });
  assert.deepEqual(formula.evaluateBasicTableFormula("=A3 * 2", getCellValue), { value: 0.25, error: null });
  assert.deepEqual(formula.evaluateBasicTableFormula("=A4 + 1", getCellValue), { value: null, error: "invalid-reference" });
});

test("UEditor table formula utilities reject non-finite results", async () => {
  const formula = await importTsModule(path.join(componentsRoot, "UEditor/table-formula.ts"));
  const hugeNumber = "9".repeat(400);
  const largeFiniteNumber = "1" + "0".repeat(308);

  assert.deepEqual(formula.evaluateBasicTableFormula(`=${hugeNumber}`, () => null), { value: null, error: "invalid-formula" });
  assert.deepEqual(formula.evaluateBasicTableFormula(`=${largeFiniteNumber} * 100`, () => null), {
    value: null,
    error: "invalid-formula",
  });
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
  assert.equal(suggestion.isFormulaFunctionSuggestionQuery("SUM"), true);
  assert.equal(suggestion.isFormulaFunctionSuggestionQuery("SUM("), false);
  assert.equal(suggestion.isFormulaFunctionSuggestionQuery("SUM(A2:A3)"), false);
  assert.deepEqual(suggestion.buildFormulaSuggestionItems({ query: "SUM(A2:A3)" }), []);
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

test("UEditor table formula utilities handle text references in aggregates", async () => {
  const formula = await importTsModule(path.join(componentsRoot, "UEditor/table-formula.ts"));
  const values = new Map([
    ["A1", "hello"],
    ["A2", "10"],
    ["A3", ""],
  ]);
  const getCellValue = (label) => values.get(label);

  assert.deepEqual(formula.evaluateBasicTableFormula("=SUM(A1:A3)", getCellValue), { value: 10, error: null });
  assert.deepEqual(formula.evaluateBasicTableFormula("=SUM(A3)", getCellValue), { value: 0, error: null });
  assert.deepEqual(formula.evaluateBasicTableFormula("=AVG(A1:A3)", getCellValue), { value: 10, error: null });
  assert.deepEqual(formula.evaluateBasicTableFormula("=COUNT(A1:A3)", getCellValue), { value: 1, error: null });
  assert.deepEqual(formula.evaluateBasicTableFormula("=COUNT(A1)", getCellValue), { value: 0, error: null });
});

test("UEditor table formula utilities build dependency order and detect cycles", async () => {
  const formula = await importTsModule(path.join(componentsRoot, "UEditor/table-formula.ts"));

  assert.deepEqual(formula.getTableFormulaReferences("=SUM(A1:A2) + B1"), ["A1", "A2", "B1"]);

  const graph = formula.buildTableFormulaDependencyGraph([
    { label: "B1", formula: "=A1 * 2" },
    { label: "C1", formula: "=B1 + 5" },
    { label: "D1", formula: "=Z1 + 1" },
  ]);
  assert.deepEqual(formula.getTableFormulaRecalculationOrder(graph), {
    order: ["B1", "C1", "D1"],
    circular: new Set(),
  });
  assert.deepEqual(formula.getAffectedTableFormulaLabels(graph, ["A1"]), new Set(["B1", "C1"]));
  assert.deepEqual(formula.getAffectedTableFormulaLabels(graph, ["C1"]), new Set(["C1"]));

  const sharedDependencyGraph = formula.buildTableFormulaDependencyGraph([
    { label: "A1", formula: "=B1+C1" },
    { label: "B1", formula: "=C1+1" },
    { label: "C1", formula: "=D1+1" },
  ]);
  assert.deepEqual(formula.getTableFormulaRecalculationOrder(sharedDependencyGraph), {
    order: ["C1", "B1", "A1"],
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

  const overlappingCycleGraph = formula.buildTableFormulaDependencyGraph([
    { label: "A1", formula: "=A1+E1+F1" },
    { label: "C1", formula: "=A1" },
    { label: "D1", formula: "=F1" },
    { label: "E1", formula: "=A1+C1+D1" },
    { label: "F1", formula: "=C1" },
  ]);
  assert.deepEqual(
    formula.getTableFormulaRecalculationOrder(overlappingCycleGraph).circular,
    new Set(["A1", "C1", "D1", "E1", "F1"]),
  );
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

test("UEditor table formula dependency graph avoids stack overflow for reverse-ordered chains", async () => {
  const formula = await importTsModule(path.join(componentsRoot, "UEditor/table-formula.ts"));
  const cellCount = 10_000;
  const cells = Array.from({ length: cellCount }, (_, index) => {
    const row = cellCount - index + 1;
    return { label: `A${row}`, formula: `=A${row - 1}+1` };
  });

  const graph = formula.buildTableFormulaDependencyGraph(cells);
  const order = formula.getTableFormulaRecalculationOrder(graph);

  assert.equal(order.order.length, cellCount);
  assert.equal(order.order[0], "A2");
  assert.equal(order.order.at(-1), `A${cellCount + 1}`);
  assert.equal(order.circular.size, 0);
});
