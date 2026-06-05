# Package Locales — Claude Code Instructions

Component-level translations bundled into the published npm package `@underverse-ui/underverse`.

## Locale files

`{en,vi,ko,ja}.json` — keyed by component namespace (e.g. `Common`, `DataTable`, `UEditor`).

## Rules before editing

Read the rule file for the target locale first:

- `vi` → `../../../i18n/Vietnamese_rule.md`
- `ko` → `../../../i18n/Korean_rule.md`
- `ja` → `../../../i18n/Japanese_rule.md`
- `en` → concise, natural product UI English; keep strings framework-agnostic

## Constraints

- Strings here are component-level: button labels, aria text, tooltips, status messages.
- Keep them short and generic — they ship to all consumers of the package.
- Preserve JSON keys, ICU syntax, and `{variable}` placeholders exactly.
- Translate by UI context, not word-for-word.
- After editing, run `npm run i18n:check` from the project root to verify key sync.
