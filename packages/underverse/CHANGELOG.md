# Changelog

All notable changes to `@underverse-ui/underverse` are documented in this file.

## Unreleased

### Added

- `CategoryTreeSelect` now supports `showTreeLines` to show or hide dashed hierarchy guide lines in recursive and virtualized trees.
- `DataTable` columns now support `headerAlign` for per-column header alignment.

### Changed

- `DataTable` headers now default to centered alignment.
- `DataTable` body cells now default to left alignment, with per-column overrides through `align`.

## [2.0.0] - 2026-07-26

### Highlights

- Preserved the existing `@underverse-ui/underverse` entry while adding the explicit `@underverse-ui/underverse/ueditor` entry for editor-focused applications.
- Hardened UEditor table, selection, indentation, formula, resize, text-wrap, and output-serialization behavior with interaction coverage.
- Added generated API contracts, package export verification, bundle budgets, and multi-version Node.js quality gates.
- Reworked the GitHub and npm READMEs around consumer installation, Tailwind setup, imports, i18n, and compatibility.

### Changed

- `Avatar` now defaults to a native `<img>` element (`imageStrategy="img"`) instead of SmartImage/next/image. This eliminates `/_next/image` requests on remount and prevents avatar flicker in dense chat/message lists. Pass `imageStrategy="next-image"` to restore the previous behaviour for large avatars that need CDN optimization.
- `Avatar` image element now has `draggable={false}` to prevent accidental drag in UI.
- `Avatar` `fallback` prop now displays only the first character (uppercased). Any string is accepted; only the first character is rendered.
- `Avatar` is now wrapped in `React.memo` to skip re-renders when props are stable.
- `Avatar` exposes `imageLoading` (`"lazy" | "eager"`, default `"lazy"`) and `imageFetchPriority` (`"high" | "low" | "auto"`) props for above-the-fold or priority avatars.
- `SmartImage` `transition` prop added (default `false`). Previous hardcoded `transition-all duration-300` made image reloads visually obvious; transition is now opt-in.
- `SmartImage` `unoptimized` prop added (default `false`). Passes through to next/image to skip CDN optimization when not needed.
- `SmartImage` `normalize` is now stable via `useCallback([fallbackSrc])` and the sync `useEffect` uses a functional update to skip redundant state writes.
- `SmartImage` error handler now also catches `.jpeg` extensions (previously only `.jpg`) and converts them to `.png`.

### Fixed

- `Tooltip` now closes immediately when its trigger is pressed, when `Escape` is pressed, or when document-level pointer interactions show the pointer is outside the trigger. This prevents portal tooltips from sticking on screen after opening dropdowns, popovers, modals, or when a modal/portal layout misses the trigger `mouseleave`.

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
