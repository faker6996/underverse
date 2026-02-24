# Changelog

All notable changes to `@underverse-ui/underverse` are documented in this file.

## [1.0.34] - 2026-02-24

### Changed

- Switched OverlayScrollbars architecture to strict component-level opt-in.
- `OverlayScrollbarProvider` is now config-only (no global DOM scan, no global MutationObserver).
- Added dedicated `OverlayScrollArea` wrapper for heavy scroll zones.
- Added `useOverlayScrollbar?: boolean` (default `false`) on:
  - `ScrollArea`
  - `Table`
  - `DataTable`
  - `Combobox`
  - `MultiCombobox`
  - `CategoryTreeSelect`
- Hard skip safety kept for:
  - `html`, `body`
  - `[data-radix-portal]`
  - `[role=\"dialog\"]`
  - `[aria-modal=\"true\"]`
  - `[data-sonner-toaster]`
- Removed global selector behavior from docs/recipes and marked `selector` prop deprecated (ignored).

## [1.0.32] - 2026-02-24

### Changed

- Standardized OverlayScrollbars initialization to explicit marker targeting only:
  - Provider now initializes only on `[data-os-scrollbar]`.
  - Removed generic overflow class scanning (`.overflow-*`).
- Hardened provider behavior for production:
  - No initialization on `document.body` / `document.documentElement`.
  - Excludes portal / modal / toast trees:
    - `[data-radix-portal]`
    - `[role="dialog"]`
    - `[aria-modal="true"]`
    - `[data-sonner-toaster]`
  - Supports node-level opt-out with `data-os-ignore`.
- Added provider configuration props:
  - `enabled` (default `true`)
  - `theme` (default `os-theme-underverse`)
  - `visibility`
  - `autoHide`
  - `autoHideDelay`
  - `dragScroll`
  - `clickScroll`
  - `selector` (default `.overflow-auto, .overflow-y-auto, .overflow-x-auto, .overflow-scroll, .overflow-y-scroll, .overflow-x-scroll, textarea, [data-os-scrollbar]`)
  - `exclude` (default `html, body, [data-os-ignore], [data-radix-portal], [role='dialog'], [aria-modal='true'], [data-sonner-toaster]`)
- Exported provider prop type:
  - `OverlayScrollbarProviderProps`

### Updated Components

- Provider now covers common scrollable surfaces by default via global selector, so Underverse components do not require per-component manual marker wiring.

### Internal

- `Popover` now sets `role="dialog"` only when `modal=true`, avoiding accidental exclusion for non-modal popovers.
- Moved to default global selector behavior, so apps no longer need to add `data-os-scrollbar` manually to each Underverse component.

### Testing

- Added controller-level tests for:
  - selector initialization
  - exclude behavior
  - dynamic add/remove cleanup
  - portal safety with wide selectors
  - destroy cleanup (memory leak prevention)

### Migration

- Mount a single `OverlayScrollbarProvider` from the package at app root.
- Remove app-local DOM-scanning scrollbar providers.
- Keep `overlayscrollbars/overlayscrollbars.css` imported globally.
- Default is already global selector mode. Override `selector` only if you need custom scope.
- For app-specific opt-out nodes, use `data-os-ignore`.
