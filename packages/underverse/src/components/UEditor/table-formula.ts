export type TableCellAddress = {
  column: number;
  row: number;
  label: string;
};

export type TableCellRange = {
  from: TableCellAddress;
  to: TableCellAddress;
};

export type FormulaEvaluationResult =
  | {
      value: number;
      error: null;
    }
  | {
      value: null;
      error: "empty" | "invalid-reference" | "invalid-formula" | "division-by-zero" | "circular-reference";
    };

export type TableFormulaCell = {
  label: string;
  formula: string;
};

export type TableFormulaDependencyGraph = {
  dependencies: Map<string, Set<string>>;
  dependents: Map<string, Set<string>>;
  formulas: Map<string, string>;
};

export type TableNumberFormat = "text" | "number" | "currency" | "percent" | "date";

type FormulaToken =
  | { type: "number"; value: number }
  | { type: "cell"; value: string }
  | { type: "range"; value: string }
  | { type: "function"; value: string }
  | { type: "operator"; value: "+" | "-" | "*" | "/" }
  | { type: "paren"; value: "(" | ")" }
  | { type: "comma"; value: "," };

const CELL_ADDRESS_RE = /^([A-Z]+)([1-9]\d*)$/i;
const CELL_RANGE_RE = /^([A-Z]+[1-9]\d*):([A-Z]+[1-9]\d*)$/i;
const SUPPORTED_FUNCTIONS = new Set(["SUM", "AVG", "MIN", "MAX", "COUNT"]);

export function columnNameToIndex(columnName: string) {
  const normalized = columnName.trim().toUpperCase();
  if (!/^[A-Z]+$/.test(normalized)) {
    return -1;
  }

  let index = 0;
  for (const char of normalized) {
    index = index * 26 + char.charCodeAt(0) - 64;
  }
  return index - 1;
}

export function indexToColumnName(index: number) {
  if (!Number.isInteger(index) || index < 0) {
    return "";
  }

  let value = index + 1;
  let name = "";
  while (value > 0) {
    const remainder = (value - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    value = Math.floor((value - 1) / 26);
  }
  return name;
}

export function parseTableCellAddress(input: string): TableCellAddress | null {
  const match = input.trim().match(CELL_ADDRESS_RE);
  if (!match) {
    return null;
  }

  const column = columnNameToIndex(match[1] ?? "");
  const row = Number.parseInt(match[2] ?? "", 10) - 1;
  if (column < 0 || row < 0) {
    return null;
  }

  return {
    column,
    row,
    label: `${indexToColumnName(column)}${row + 1}`,
  };
}

export function parseTableCellRange(input: string): TableCellRange | null {
  const match = input.trim().match(CELL_RANGE_RE);
  if (!match) {
    return null;
  }

  const from = parseTableCellAddress(match[1] ?? "");
  const to = parseTableCellAddress(match[2] ?? "");
  if (!from || !to) {
    return null;
  }

  return { from, to };
}

export function getTableCellRangeLabels(range: TableCellRange) {
  const startColumn = Math.min(range.from.column, range.to.column);
  const endColumn = Math.max(range.from.column, range.to.column);
  const startRow = Math.min(range.from.row, range.to.row);
  const endRow = Math.max(range.from.row, range.to.row);
  const labels: string[] = [];

  for (let row = startRow; row <= endRow; row += 1) {
    for (let column = startColumn; column <= endColumn; column += 1) {
      labels.push(`${indexToColumnName(column)}${row + 1}`);
    }
  }

  return labels;
}

export function normalizeTableFormula(formula: string) {
  return formula.trim().replace(/^=/, "").trim();
}

export function formatFormulaError(error: NonNullable<FormulaEvaluationResult["error"]>) {
  return `#${error.toUpperCase()}`;
}

export function normalizeTableNumberFormat(format: unknown): TableNumberFormat {
  return format === "text" || format === "number" || format === "currency" || format === "percent" || format === "date"
    ? format
    : "text";
}

export function formatTableFormulaDisplayValue(value: string | number, numberFormat: unknown) {
  const stringValue = String(value);
  if (stringValue.startsWith("#")) {
    return stringValue;
  }

  const normalizedFormat = normalizeTableNumberFormat(numberFormat);
  if (normalizedFormat === "text") {
    return stringValue;
  }

  const numericValue = typeof value === "number" ? value : Number.parseFloat(stringValue.replace(/,/g, ""));
  if (!Number.isFinite(numericValue)) {
    return stringValue;
  }

  if (normalizedFormat === "number") {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 }).format(numericValue);
  }

  if (normalizedFormat === "currency") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(numericValue);
  }

  if (normalizedFormat === "percent") {
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      maximumFractionDigits: 2,
    }).format(numericValue);
  }

  const excelEpochMs = Date.UTC(1899, 11, 30);
  const date = new Date(excelEpochMs + numericValue * 24 * 60 * 60 * 1000);
  if (Number.isNaN(date.getTime())) {
    return stringValue;
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

export function getTableFormulaReferences(formula: string) {
  const normalized = normalizeTableFormula(formula);
  if (!normalized) return [];

  const tokens = tokenizeFormula(normalized);
  if (!tokens) return [];

  const references = new Set<string>();
  for (const token of tokens) {
    if (token.type === "cell") {
      references.add(token.value);
    } else if (token.type === "range") {
      const range = parseTableCellRange(token.value);
      if (!range) continue;
      for (const label of getTableCellRangeLabels(range)) {
        references.add(label);
      }
    }
  }

  return Array.from(references);
}

export function buildTableFormulaDependencyGraph(cells: TableFormulaCell[]): TableFormulaDependencyGraph {
  const dependencies = new Map<string, Set<string>>();
  const dependents = new Map<string, Set<string>>();
  const formulas = new Map<string, string>();

  for (const cell of cells) {
    const label = cell.label.toUpperCase();
    formulas.set(label, cell.formula);
    dependencies.set(label, new Set(getTableFormulaReferences(cell.formula)));
    if (!dependents.has(label)) {
      dependents.set(label, new Set());
    }
  }

  for (const [label, refs] of dependencies) {
    for (const ref of refs) {
      if (!dependents.has(ref)) {
        dependents.set(ref, new Set());
      }
      dependents.get(ref)?.add(label);
    }
  }

  return { dependencies, dependents, formulas };
}

export function getTableFormulaCircularReferences(graph: TableFormulaDependencyGraph) {
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const circular = new Set<string>();
  const stack: string[] = [];

  const visit = (label: string) => {
    if (visiting.has(label)) {
      const start = stack.indexOf(label);
      for (const cycleLabel of start >= 0 ? stack.slice(start) : [label]) {
        circular.add(cycleLabel);
      }
      return;
    }
    if (visited.has(label)) return;

    visiting.add(label);
    stack.push(label);

    for (const ref of graph.dependencies.get(label) ?? []) {
      if (graph.formulas.has(ref)) {
        visit(ref);
      }
    }

    stack.pop();
    visiting.delete(label);
    visited.add(label);
  };

  for (const label of graph.formulas.keys()) {
    visit(label);
  }

  return circular;
}

export function getTableFormulaRecalculationOrder(graph: TableFormulaDependencyGraph) {
  const circular = getTableFormulaCircularReferences(graph);
  const visited = new Set<string>();
  const order: string[] = [];

  const visit = (label: string) => {
    if (visited.has(label) || circular.has(label)) return;
    visited.add(label);

    for (const ref of graph.dependencies.get(label) ?? []) {
      if (graph.formulas.has(ref)) {
        visit(ref);
      }
    }

    order.push(label);
  };

  for (const label of graph.formulas.keys()) {
    visit(label);
  }

  return { order, circular };
}

export function evaluateBasicTableFormula(
  formula: string,
  getCellValue: (label: string) => string | number | null | undefined,
): FormulaEvaluationResult {
  const normalized = normalizeTableFormula(formula);
  if (!normalized) {
    return { value: null, error: "empty" };
  }

  const tokens = tokenizeFormula(normalized);
  if (!tokens) {
    return { value: null, error: "invalid-formula" };
  }

  const parser = new FormulaParser(tokens, getCellValue);
  const result = parser.parseExpression();
  if (result.error) {
    return result;
  }
  if (!parser.isComplete()) {
    return { value: null, error: "invalid-formula" };
  }
  return result;
}

function tokenizeFormula(formula: string): FormulaToken[] | null {
  const tokens: FormulaToken[] = [];
  let index = 0;

  while (index < formula.length) {
    const char = formula[index];
    if (!char) break;

    if (/\s/.test(char)) {
      index += 1;
      continue;
    }

    if (char === "," || char === "+" || char === "-" || char === "*" || char === "/" || char === "(" || char === ")") {
      if (char === ",") tokens.push({ type: "comma", value: char });
      else if (char === "(" || char === ")") tokens.push({ type: "paren", value: char });
      else tokens.push({ type: "operator", value: char });
      index += 1;
      continue;
    }

    const numberMatch = formula.slice(index).match(/^\d+(?:\.\d+)?/);
    if (numberMatch?.[0]) {
      tokens.push({ type: "number", value: Number.parseFloat(numberMatch[0]) });
      index += numberMatch[0].length;
      continue;
    }

    const identifierMatch = formula.slice(index).match(/^[A-Z]+[1-9]\d*(?::[A-Z]+[1-9]\d*)?|^[A-Z]+/i);
    if (identifierMatch?.[0]) {
      const value = identifierMatch[0].toUpperCase();
      if (CELL_RANGE_RE.test(value)) tokens.push({ type: "range", value });
      else if (parseTableCellAddress(value)) tokens.push({ type: "cell", value });
      else if (SUPPORTED_FUNCTIONS.has(value)) tokens.push({ type: "function", value });
      else return null;
      index += identifierMatch[0].length;
      continue;
    }

    return null;
  }

  return tokens;
}

class FormulaParser {
  private index = 0;

  constructor(
    private tokens: FormulaToken[],
    private getCellValue: (label: string) => string | number | null | undefined,
  ) {}

  isComplete() {
    return this.index >= this.tokens.length;
  }

  parseExpression(): FormulaEvaluationResult {
    let left = this.parseTerm();

    while (!left.error) {
      const operator = this.peekOperator(["+", "-"]);
      if (!operator) break;
      this.index += 1;

      const right = this.parseTerm();
      if (right.error) return right;
      left = {
        value: operator.value === "+" ? left.value + right.value : left.value - right.value,
        error: null,
      };
    }

    return left;
  }

  private parseTerm(): FormulaEvaluationResult {
    let left = this.parseFactor();

    while (!left.error) {
      const operator = this.peekOperator(["*", "/"]);
      if (!operator) break;
      this.index += 1;

      const right = this.parseFactor();
      if (right.error) return right;
      if (operator.value === "/" && right.value === 0) {
        return { value: null, error: "division-by-zero" };
      }
      left = {
        value: operator.value === "*" ? left.value * right.value : left.value / right.value,
        error: null,
      };
    }

    return left;
  }

  private parseFactor(): FormulaEvaluationResult {
    const token = this.tokens[this.index];
    if (!token) {
      return { value: null, error: "invalid-formula" };
    }

    if (token.type === "operator" && token.value === "-") {
      this.index += 1;
      const value = this.parseFactor();
      if (value.error) return value;
      return { value: -value.value, error: null };
    }

    if (token.type === "number") {
      this.index += 1;
      return { value: token.value, error: null };
    }

    if (token.type === "cell") {
      this.index += 1;
      return this.readCellNumber(token.value);
    }

    if (token.type === "function") {
      return this.parseFunction(token.value);
    }

    if (token.type === "paren" && token.value === "(") {
      this.index += 1;
      const value = this.parseExpression();
      if (value.error) return value;
      if (!this.consumeParen(")")) {
        return { value: null, error: "invalid-formula" };
      }
      return value;
    }

    return { value: null, error: "invalid-formula" };
  }

  private parseFunction(name: string): FormulaEvaluationResult {
    this.index += 1;
    if (!this.consumeParen("(")) {
      return { value: null, error: "invalid-formula" };
    }

    const values: number[] = [];
    while (true) {
      const token = this.tokens[this.index];
      if (!token) {
        return { value: null, error: "invalid-formula" };
      }

      if (token.type === "range") {
        this.index += 1;
        const range = parseTableCellRange(token.value);
        if (!range) return { value: null, error: "invalid-reference" };
        for (const label of getTableCellRangeLabels(range)) {
          const cellValue = this.readCellNumber(label);
          if (cellValue.error) return cellValue;
          values.push(cellValue.value);
        }
      } else {
        const value = this.parseExpression();
        if (value.error) return value;
        values.push(value.value);
      }

      if (this.consumeComma()) {
        continue;
      }
      if (this.consumeParen(")")) {
        break;
      }
      return { value: null, error: "invalid-formula" };
    }

    if (values.length === 0) {
      return { value: null, error: "invalid-formula" };
    }

    if (name === "SUM") return { value: values.reduce((sum, value) => sum + value, 0), error: null };
    if (name === "AVG") return { value: values.reduce((sum, value) => sum + value, 0) / values.length, error: null };
    if (name === "MIN") return { value: Math.min(...values), error: null };
    if (name === "MAX") return { value: Math.max(...values), error: null };
    if (name === "COUNT") return { value: values.length, error: null };

    return { value: null, error: "invalid-formula" };
  }

  private readCellNumber(label: string): FormulaEvaluationResult {
    const value = this.getCellValue(label);
    const parsed = typeof value === "number" ? value : Number.parseFloat(String(value ?? "").trim());
    if (!Number.isFinite(parsed)) {
      return { value: null, error: "invalid-reference" };
    }
    return { value: parsed, error: null };
  }

  private peekOperator(operators: Array<"+" | "-" | "*" | "/">) {
    const token = this.tokens[this.index];
    return token?.type === "operator" && operators.includes(token.value) ? token : null;
  }

  private consumeComma() {
    if (this.tokens[this.index]?.type !== "comma") {
      return false;
    }
    this.index += 1;
    return true;
  }

  private consumeParen(value: "(" | ")") {
    const token = this.tokens[this.index];
    if (token?.type !== "paren" || token.value !== value) {
      return false;
    }
    this.index += 1;
    return true;
  }
}
