# UEditor Table Architecture Audit

## Current Problems

`UEditor` table features are currently split across TipTap/ProseMirror plugins, custom DOM interaction hooks, and a React overlay. This makes the feature set flexible, but it also means table state is inferred from multiple sources at the same time.

The most fragile area is the table overlay. `table-controls.tsx` handles layout measurement, hover state, drag state, add-row/add-column rails, row/column menus, and ProseMirror commands in one large component. When cells are merged, the DOM grid no longer maps one-to-one to logical table columns and rows, so overlay handles, resize guides, and command targets can drift.

## Main Risks

1. Multiple sources of truth
   - DOM APIs: `getBoundingClientRect()`, `table.rows`, `cellIndex`, `colgroup`.
   - ProseMirror APIs: `TableMap`, `selectedRect`, `posAtDOM`, `nodeDOM`.
   - React state: `layout`, `hoverState`, `dragPreview`, open menu state.
   - TipTap table resize plugin state.

2. Large components
   - `table-controls.tsx` is too large and mixes data modeling with rendering and commands.
   - `toolbar.tsx` and `menus.tsx` are also large enough that active-state updates can become expensive.

3. Merge-aware behavior is not centralized
   - Merged cells require `colSpan` and `rowSpan` aware handles.
   - Overlay handles, hover rails, resize guides, and drag targets should all read the same table layout model.

4. DOM measurement is scattered
   - Several files measure table/cell rectangles independently.
   - Mouse move, selection changes, scroll, resize, merge, and row resize can all trigger layout sync.

5. Performance pressure
   - Continuous pointer movement should avoid frequent React state updates.
   - Layout reads and DOM writes should be batched in a single animation frame where possible.

## Improvement Direction

1. Create a central table layout model
   - Build one `TableLayoutModel` from `TableMap` plus DOM rects.
   - Treat ProseMirror/TableMap as the logic source.
   - Treat DOM rects as the pixel source only.

2. Split table controls
   - Extract layout building out of `table-controls.tsx`.
   - Then split render/control pieces into smaller components and hooks.

3. Normalize table commands
   - Keep merge, split, add, delete, duplicate, resize, and clear commands in a command layer.
   - UI should call commands instead of directly manipulating transactions in many places.

4. Use one layout sync scheduler
   - Selection updates, scroll, resize, merge/split, and row/column resize should share one scheduled layout refresh.

5. Reduce state updates during hover and drag
   - Keep hot pointer state in refs where possible.
   - Use React state only for visible semantic state such as open menus and active layout changes.

## Incremental Refactor Checklist

- [x] Extract table layout model helpers from `table-controls.tsx`.
- [x] Make row and column handles merge-aware through the shared layout model.
- [x] Move table command helpers into a dedicated command layer.
- [x] Add a local RAF scheduler for `TableControls` selection/layout refreshes.
- [x] Move hover-state measurement out of `TableControls`.
- [ ] Reduce direct DOM measurements outside the layout model.
- [ ] Split `TableControls` into smaller render components.
  - [x] Extract drag/add preview rendering.
  - [x] Extract quick add rails rendering.
  - [x] Extract table menu trigger rendering.
  - [x] Extract row and column handle rendering.
- [ ] Add regression tests for merge, split, resize, and overlay handle alignment.
  - [x] Cover merged row/column spans so handles follow the visible merged cells.
  - [ ] Cover split-cell, resize guides, and drag preview after merged-cell edits.
