# UEditor Optimization Plan

## Goals

Harden `UEditor` for production use without breaking the existing public API.

## Priorities

1. Security hardening
   - Sanitize link URLs and image URLs before inserting them through editor controls.
   - Configure the Tiptap link extension to reject unsafe protocols.
   - Keep relative URLs, anchors, `http`, `https`, `mailto`, and `tel` for links.
   - Keep only `http`, `https`, relative URLs, and safe image `data:` URLs for images.

2. Image handling controls
   - Expose max file size and MIME type settings through `UEditorProps`.
   - Apply the same settings to paste, drop, and toolbar file insertion.
   - Keep base64 editing as the default for backward compatibility.

3. Save-time image upload performance
   - Add a concurrency limit to `prepareContentForSave()`.
   - Avoid uploading every inline base64 image at once.
   - Preserve existing result shape and error behavior.

4. Table row resize performance
   - Keep row height live while dragging so the table layout follows the pointer.
   - Throttle ProseMirror row-height updates through `requestAnimationFrame`.
   - Mark drag-preview transactions outside history to avoid filling undo history with every mousemove.
   - Notify contextual table controls after layout changes so handles stay aligned.

5. Follow-up refactors
   - Extract table DOM/resize helpers from `UEditor.tsx`.
   - Extract editor content class names into a separate module.
   - Extract table resize event wiring from `UEditor.tsx` into a dedicated hook.
   - Consider splitting active-cell highlight into a smaller hook if the table interaction hook grows further.
   - Consider a DOMParser-based HTML transform for `prepareContentForSave()`.
   - Add browser-level tests for URL sanitization.

6. Transaction and output performance
   - Keep translation callbacks referentially stable across unrelated renders.
   - Avoid rebuilding the editor extension configuration when locale inputs have not changed.
   - Preserve immediate output callbacks by default for backward compatibility.
   - Allow large controlled documents to debounce HTML/JSON serialization.
   - Flush pending debounced output when focus leaves the editor.
   - Benchmark immediate and debounced HTML output separately.

## Current Implementation Batch

- Add shared URL sanitizer helpers.
- Add public image validation props.
- Add upload concurrency support.
- Optimize row resize transaction frequency while preserving live row-height feedback.
- Update docs and focused tests.
- Extract table DOM helpers into `table-dom-utils.ts`.
- Extract ProseMirror content styling into `editor-styles.ts`.
- Extract table interaction event wiring into `use-table-interactions.ts`.
- Extract row-height resize state and RAF commit behavior into `use-table-row-resize.ts`.
- Add a browser-level docs e2e test for live table row resize.
- Share equivalent global listeners between editor instances and verify cleanup.
- Lazy-load optional menu bar, emoji data, emoji picker, and syntax grammars.
- Scope formula recalculation to changed source cells and active tables.
- Add `outputDebounceMs` for coalesced HTML/JSON output callbacks.
- Stabilize translation callback identity so extension configuration memoization remains effective.
- Extend the benchmark with immediate and debounced output scenarios.

## Latest Benchmark Snapshot

Measured with the package benchmark on a document containing 1,500 paragraphs and 25 consecutive edits:

| Output mode | Average edit time | P95 edit time | Output callbacks |
| --- | ---: | ---: | ---: |
| Immediate HTML output | `9.63ms` | `11.52ms` | `1.00/edit` |
| HTML output with `100ms` debounce | `0.72ms` | `1.03ms` | `0.04/edit` |

The debounced case coalesced 25 document updates into one serialization and reduced the measured edit critical path by about 92%. Immediate output remains the default; consumers opt into this optimization with `outputDebounceMs`.

## Deferred

- DOMParser-based save transform: deferred because the current implementation intentionally preserves the original HTML and only replaces image `src` attributes. A DOMParser serializer can reorder/normalize markup, which is a behavior change for consumers that diff or store exact HTML.
- Smaller active-cell/table-guide hooks: optional follow-up if `use-table-interactions.ts` grows further. Row resize is already isolated.
