# Underverse — Claude Code Instructions

## Project overview

Underverse UI is a React/Next.js component library (78+ components) maintained as a monorepo. It ships both a **Next.js demo/docs app** and a **publishable npm package** (`@underverse-ui/underverse`).

## Architecture

```
underverse/
├── app/                    # Next.js App Router — demo & docs site
├── components/ui/          # 78+ source UI components (the source of truth)
├── i18n/                   # next-intl config + app-level locale messages
│   └── locales/            # {en,vi,ko,ja}.json — app translations
├── packages/underverse/    # Published npm package
│   ├── src/                # Re-exports from components/ui
│   ├── dist/               # Build output (do not edit)
│   └── locales/            # {en,vi,ko,ja}.json — component-level translations
├── lib/                    # Utilities and helpers
├── hooks/                  # Custom React hooks
├── contexts/               # React context providers
├── tests/                  # Playwright E2E tests
└── scripts/                # i18n check/cleanup scripts
```

## Key commands

```bash
npm run dev              # Start dev server
npm run build            # Build Next.js app
npm run typecheck        # Run tsc across all packages
npm run lint             # ESLint
npm run i18n:check       # Validate all locale keys are in sync
npm run i18n:dedupe      # Remove duplicate keys
npm run release:underverse  # Patch release of the npm package
```

## Component conventions

- Components live in `components/ui/`. The package at `packages/underverse/src/` re-exports them — never add logic there, only re-exports.
- Do not deep-import from `packages/underverse/dist/` or internal paths.
- Tailwind CSS 4 — use CSS custom properties for theming, not hardcoded colors.
- React 19 + Next.js App Router — no legacy patterns (`getServerSideProps`, etc.).

## i18n — IMPORTANT

There are two separate locale directories:

| Path | Purpose |
|---|---|
| `i18n/locales/{en,vi,ko,ja}.json` | App-level (docs site, pages) |
| `packages/underverse/locales/{en,vi,ko,ja}.json` | Component strings (bundled in npm package) |

**Before editing any locale file, read the matching rule file:**

- `vi` → `i18n/Vietnamese_rule.md`
- `ko` → `i18n/Korean_rule.md`
- `ja` → `i18n/Japanese_rule.md`
- `en` → use concise, natural product UI English

After editing locales, run `npm run i18n:check` to verify key sync.

## Testing

Tests use Playwright. Run a specific suite with e.g. `npm run test:ueditor`. Always run `npm run typecheck` before considering a task done.
