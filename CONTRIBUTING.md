# Contributing to Underverse

## Development setup

Requirements:

- Node.js 24 for the repository toolchain.
- npm with lockfile support.

Install both dependency trees:

```bash
npm ci
npm --prefix packages/underverse ci
```

Start the documentation application:

```bash
npm run dev_v2
```

## Required checks

Before opening a pull request, run:

```bash
npm run check
npm run build
npm --prefix packages/underverse run build
```

`npm run check` covers lint, TypeScript, package boundaries, locale parity,
documentation contracts, component interaction tests, and smoke tests.

## Pull requests

- Keep changes scoped and preserve unrelated worktree changes.
- Add or update interaction tests when behavior changes.
- Update all supported locales when adding product UI copy.
- Keep generated API metadata synchronized with the public TypeScript API.
- Record user-facing package changes in `packages/underverse/CHANGELOG.md`.

Package publishing is automated from `main` after the repository and package
quality gates pass.
