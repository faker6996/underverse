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

## Overlay Scrollbars (recommended)

Use the exported provider to enable overlay scrollbars (no layout width loss):

```tsx
import "overlayscrollbars/overlayscrollbars.css";
import { OverlayScrollbarProvider } from "@underverse-ui/underverse";

export function App() {
  return (
    <>
      <OverlayScrollbarProvider
        enabled
        theme="os-theme-underverse"
        autoHide="leave"
      />
      {/* app */}
    </>
  );
}
```

Behavior:

- Provider initializes globally by default on common scroll selectors (`.overflow-*`, `textarea`) and `[data-os-scrollbar]`.
- Provider can run globally via custom `selector` (for example: `.overflow-auto, .overflow-y-auto, .overflow-x-auto, [data-os-scrollbar]`).
- Use `data-os-ignore` on a node to opt out.

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
