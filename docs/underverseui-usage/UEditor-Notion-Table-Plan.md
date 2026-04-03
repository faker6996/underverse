# UEditor Notion-Like Table Plan

## Goal

Make `UEditor` tables behave closer to Notion simple tables without changing the saved content format.

This phase targets the interaction layer only. The editor still stores standard Tiptap/HTML table markup.

## Scope

### Ship in Phase 1

- Contextual table controls that appear when the caret or hover is inside a table
- Quick add column action near the active column
- Quick add row action near the active row
- Row drag handles for reorder
- Column drag handles for reorder
- Bottom-right corner drag-preview handle for table expansion
- Table context menu with:
  - add row before
  - add row after
  - add column before
  - add column after
  - toggle header row
  - toggle header column
  - delete row
  - delete column
  - delete table
- Reuse Tiptap table commands instead of custom table transactions where possible

### Explicitly Out of Scope for Phase 1

- Full drag ghost/animation parity with Notion
- Merge-aware handle geometry for complex rowspan/colspan tables
- Database table behavior
- Custom persistence format for tables

## UX Model

When the user enters a table, `UEditor` shows a light interaction layer:

- a top-left context button for the whole table
- a quick add button above the active column
- a quick add button beside the active row
- drag handles for every visible row and column
- a corner handle that previews the added size before commit
- drag badges and target highlights so reorder intent is visible while moving

This keeps the existing global toolbar, but the primary table workflow moves next to the table itself.

## Technical Design

### New Module

Create a dedicated `table-controls.tsx` module instead of mixing more table UI into `toolbar.tsx` or `UEditor.tsx`.

Responsibilities:

- detect the active table cell from selection or hover
- compute overlay positions relative to the editor scroll container
- run Tiptap commands against the active cell
- render quick actions and a compact context menu

### Command Strategy

Use built-in Tiptap table commands:

- `addRowBefore`
- `addRowAfter`
- `addColumnBefore`
- `addColumnAfter`
- `toggleHeaderRow`
- `toggleHeaderColumn`
- `deleteRow`
- `deleteColumn`
- `deleteTable`
- `setTextSelection`

Before a contextual action runs, the control layer should restore a text selection inside the active cell so the command applies to the expected row or column.

### Positioning Strategy

Use the existing `editorContentRef` scroll container as the positioning surface.

Store the active cell position and recompute overlay geometry when:

- selection changes
- hover changes to another table cell
- the editor surface scrolls
- the window resizes

## Testing

Add interaction coverage for:

- contextual controls appear when a table cell is focused
- header row toggle converts the first row into header cells
- quick add row/column actions modify table structure
- row drag reorder changes row order
- column drag reorder changes column order
- corner preview reflects the number of rows and columns that will be added

## Follow-Up Milestones

### Phase 2

- better keyboard parity with Notion
- stronger visuals for drag ghost and insertion animation
- merged-cell aware overlay geometry

### Phase 3

- corner drag-to-expand
- richer hover affordances and animation polish
- table-specific floating toolbar variants
