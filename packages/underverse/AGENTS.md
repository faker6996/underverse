# Underverse Agent Guide

This file is for coding agents and automation tools that need to use `@underverse-ui/underverse` quickly and correctly.

## Package Summary

- Package: `@underverse-ui/underverse`
- Runtime: React 18+ (supports Next.js and standalone React)
- Main entry: `@underverse-ui/underverse`
- Type definitions: `dist/index.d.ts`
- Machine-readable API snapshot: `api-reference.json`
- Quick LLM context: `llms.txt`
- Task recipes: `agent-recipes.json`

## Install

```bash
npm i @underverse-ui/underverse
```

Common peers:

```bash
npm i react react-dom
```

Next.js projects may also need:

```bash
npm i next next-intl
```

## Quick Usage

```tsx
import { Button } from "@underverse-ui/underverse";

export function Example() {
  return <Button>Click</Button>;
}
```

## Overlay Scrollbars (opt-in)

Underverse uses component-level overlay scrollbars. No global selector scan and no app-wide MutationObserver.

```tsx
import "overlayscrollbars/overlayscrollbars.css";
import { OverlayScrollbarProvider, ScrollArea, DataTable } from "@underverse-ui/underverse";

export function App() {
  return (
    <OverlayScrollbarProvider theme="os-theme-underverse" autoHide="leave">
      <ScrollArea className="h-56" useOverlayScrollbar />
      <DataTable columns={columns} data={rows} useOverlayScrollbar />
    </OverlayScrollbarProvider>
  );
}
```

Behavior:

- Provider is config-only (context defaults), not an auto-mount global scanner.
- Enable per component via `useOverlayScrollbar`.
- Hard skip: `html`, `body`, `[data-radix-portal]`, `[role="dialog"]`, `[aria-modal="true"]`, `[data-sonner-toaster]`.
- Use `data-os-ignore` on a node to opt out.

Useful APIs:

- `OverlayScrollArea` (dedicated heavy-scroll wrapper)
- `useOverlayScrollbarTarget(ref, options)` for custom component internals

## i18n Notes

- Components work without `next-intl` using fallback translations.
- For app-level i18n integration:
  - Use `TranslationProvider` / `UnderverseProvider`.
  - Use `underverseMessages` or `getUnderverseMessages(locale)` for message bundles.

## Form Notes

- Form components are exported from main entry and depend on `react-hook-form` ecosystem peers.
- If an app does not use form features, those peers can often be omitted.

## API Discovery

Preferred order for automated tooling:

1. `api-reference.json` (fast machine parse).
2. `dist/index.d.ts` (accurate TS API surface).
3. `agent-recipes.json` / `llms.txt` (ready-to-apply usage).
4. `README.md` (integration guidance and additional context).

## Agent Rules

- Do not deep-import internal source paths from this package.
- Always import from `@underverse-ui/underverse`.
- Prefer exported `Props` types when generating wrappers or stories.
- Keep usage compatible with React 18+ and Next.js app router defaults.
