# UEditor Advanced Table And Formula Plan

## Goal

Upgrade `UEditor` tables from document tables into a lightweight spreadsheet-capable table system while keeping the editor fast, predictable, and compatible with normal TipTap/ProseMirror table behavior.

The target is not a full Excel clone. The target is a stable document table with:

- merge/split, resize, add, duplicate, clear, and color operations that remain correct with `rowspan` and `colspan`.
- a single layout model for overlays, hover rails, drag handles, and command targets.
- optional spreadsheet metadata on each cell.
- formula support for common document use cases such as totals, averages, counts, and simple arithmetic.
- save/load/export behavior that preserves table metadata.

## Current Baseline

Table architecture is already moving in the right direction:

- `table-layout-model.ts` owns more of the table geometry.
- `table-controls.tsx` is split into smaller render pieces.
- row/column handles are merge-aware through the layout model.
- table command helpers live in `table-cell-commands.ts`.
- add rails and hover state now use visible table bounds instead of assuming `tableLeft + viewportWidth`.

Remaining fragile areas:

- table commands must keep using `TableMap` instead of DOM cell index assumptions.
- hover/add/resize visuals must read the same model instead of recomputing pixel regions locally.
- merged cells need consistent logical ownership rules so handles, menus, and operations do not double-render.
- formula data needs schema support before formula UI or calculation logic can be added safely.

## Architecture Direction

### 1. Table Layout Model

`table-layout-model.ts` should be the only place that combines:

- ProseMirror table node and `TableMap` for logical rows/columns.
- DOM rects for visible pixels.
- wrapper viewport and scroll clipping.
- merged cell ownership and visible spans.

All UI overlays should consume this model:

- corner menu.
- row handles.
- column handles.
- add row/add column rails.
- resize guides.
- drag preview.
- active cell highlight.

### 2. Command Layer

`table-cell-commands.ts` should own document mutations:

- merge/split.
- clear row/column/cell.
- duplicate row/column.
- insert/delete row/column.
- apply background/border/format.
- later: set formula, clear formula, recalculate table.

The UI should pass logical row/column/cell coordinates to commands. It should not mutate table nodes directly.

### 3. Formula Metadata

Each `td` and `th` should be able to persist:

- `data-cell-id`: stable address or generated id.
- `data-number-format`: text, number, currency, percent, date.
- `data-formula`: raw formula such as `=SUM(B2:B10)`.
- `data-computed-value`: last calculated raw value used by dependent formulas.

This metadata allows future formula features without losing data during save/load, paste cleanup, or export.

### 4. Formula Engine MVP

Start small and deterministic:

- supported references: `A1`, `B2`, `AA10`.
- supported ranges: `A1:A10`, `A1:C3`.
- supported functions: `SUM`, `AVG`, `MIN`, `MAX`, `COUNT`.
- supported arithmetic: `+`, `-`, `*`, `/`, parentheses.
- invalid formulas render a controlled error state, not a thrown runtime error.

Current formula semantics:

- References must resolve to numeric values for arithmetic and aggregate functions.
- `SUM(A1:A2)` returns `#INVALID-REFERENCE` when any referenced cell is non-numeric text. This is intentionally stricter than Excel, which may ignore text in some aggregate contexts.
- `COUNT(A1:A2)` follows spreadsheet-style numeric counting: text and empty cells are ignored, numeric cells are counted.
- Circular detection marks cells that are directly in the cycle as `#CIRCULAR-REFERENCE`.
- Formula cells that depend on a circular cell but are not part of the cycle currently evaluate that dependency as non-numeric and become `#INVALID-REFERENCE`.
- Text that starts with `=` inside a table cell is promoted into `data-formula` before recalculation.
- A bare `=` is treated as editable text, not as an empty formula. Legacy cells with `data-formula="="` and `#EMPTY` are cleared so users can edit or delete them normally.
- While the cursor is inside a formula cell, clicking another cell in the same table inserts that cell reference at the formula caret. Dragging from one cell to another inserts a range such as `A1:A3`.
- Formula range picking shows a lightweight overlay highlight while the mouse drag is active, then clears it after mouseup.
- Computed display text is rendered inside the cell content. `data-computed-value` stays raw so dependent formulas can keep using numeric values even when the visible text is formatted as currency, percent, or date.
- `recalculateAllTableFormulas()` recalculates all tables in one transaction and applies replacements from the end of the document backward so positions remain stable.
- Editor auto-recalculation is table-local first: when the selection is inside a table, only that active table is recalculated. It falls back to all-table recalculation only when no active table can be resolved.
- Within the active table, automatic recalculation uses the dependency graph to recalculate only the edited cell when it is a formula plus formulas that depend on the edited cell.
- Explicit formula commands (`setSelectedTableCellFormula`, `clearSelectedTableCellFormula`) also use active-table affected recalculation so dependent formula cells update after command-driven changes.

Merged cells should follow spreadsheet-style ownership:

- the top-left logical cell owns the merged value and formula.
- covered cells do not keep independent content.
- split does not need to restore old covered-cell content.

### 5. Recalculation Model

Recalculation should be table-local first:

- build a dependency graph from formula references.
- recalculate only affected cells after a cell edit.
- detect circular references and mark affected cells as invalid.
- debounce recalculation during typing.
- keep calculation pure and testable outside React.

### 6. UI Integration

Formula UI should be incremental:

1. Bubble menu command: "Formula" opens a small input.
2. Cell inspector state shows formula when active cell has `data-formula`.
3. Entering `=...` in a cell can promote the value into `data-formula`.
4. A table-level recalculate command appears in the table menu.
5. Typing `=` inside a table cell opens a compact function suggestion menu for `SUM`, `AVG`, `MIN`, `MAX`, and `COUNT`; selecting a function inserts `=FUNCTION()` and places the cursor inside the parentheses.
6. While editing a formula, selecting table cells inserts references directly into the formula text. Dragging across cells inserts a range and shows a temporary range highlight.

### 7. Clipboard And Export

Clipboard/export should preserve metadata where possible:

- internal copy/paste keeps `data-*` attrs.
- paste from Excel/Sheets reads values first, formulas later only when safe.
- HTML export keeps `data-formula` and `data-computed-value`.
- plain text export uses computed display values.

## Implementation Checklist

- [x] Move overlay geometry toward `table-layout-model.ts`.
- [x] Make visible add/hover rails respect wrapper clipping.
- [x] Make clear column and duplicate column use `TableMap` logical columns.
- [x] Add regression tests for column clear/duplicate with `rowspan`.
- [x] Make duplicate column expand an existing `colspan` when duplicating inside a merged cell.
- [x] Add cell/header schema attrs for formula metadata.
- [x] Add save/load regression test for formula metadata.
- [x] Add pure formula address/range parser.
- [x] Add pure formula evaluator MVP.
- [x] Add table-local dependency graph and circular reference handling.
- [x] Add command helpers: set formula, clear formula, recalculate table.
- [x] Add formula input UI in the bubble menu.
- [x] Add automatic formula recalculation after table edits.
- [x] Promote typed `=...` cell text into formula metadata.
- [x] Render formula computed values inside cell content.
- [x] Format computed values with `number`, `currency`, `percent`, and `date` cell formats.
- [x] Add bubble menu controls for formula number formats.
- [x] Add formula formatting states for error/computed cells.
- [x] Add `=` formula function suggestions inside table cells.
- [x] Add formula range picking by clicking or dragging table cells while editing a formula.
- [x] Add visual range highlight while formula range picking is active.
- [x] Make automatic formula recalculation table-local for the active table before falling back to all-document recalculation.
- [x] Add affected formula label discovery from the dependency graph for active-table recalculation.
- [x] Make explicit set/clear formula commands recalculate dependent cells through the same affected-cell path.
- [x] Align `COUNT` aggregate behavior with spreadsheet-style numeric counting for text/empty references.
- [x] Add clipboard/export tests for formula metadata.
- [x] Add performance tests for large tables with formulas.

## Near-Term Work Order

1. Finish command hardening for all row/column operations with `TableMap`.
2. Make every overlay visual consume `TableLayoutModel` output directly.
3. Extend affected-cell recalculation to structural edits and paste where the changed labels are broader than the current selection cell.
4. Decide whether `SUM`, `AVG`, `MIN`, and `MAX` should stay strict on text cells or move closer to spreadsheet-style text ignoring.
5. Add browser/manual visual cases for merge + scroll + resize + formula picker interactions.
6. Upgrade formula range highlight from one bounding box to per-cell segments when merged cells or clipped scroll containers need more exact rendering.

## Non-Goals For The First Version

- multi-sheet references.
- remote collaborative formula conflict resolution.
- full Excel formula compatibility.
- charting.
- pivot tables.
- volatile functions such as `NOW()` or `RAND()`.
