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
   - Preview row height with DOM styles while dragging.
   - Commit a single ProseMirror transaction when the pointer is released.
   - Avoid filling undo history with every mousemove.

5. Follow-up refactors
   - Extract table resize logic from `UEditor.tsx` into a dedicated hook.
   - Extract editor content class names into a separate module.
   - Consider a DOMParser-based HTML transform for `prepareContentForSave()`.
   - Add browser-level tests for row resize and URL sanitization.

## Current Implementation Batch

- Add shared URL sanitizer helpers.
- Add public image validation props.
- Add upload concurrency support.
- Optimize row resize transaction frequency.
- Update docs and focused tests.
