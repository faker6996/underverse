# i18n — Claude Code Instructions

App-level translations for the Underverse docs/demo site (Next.js, next-intl).

## Locale files

`locales/{en,vi,ko,ja}.json` — keyed by namespace (e.g. `Common`, `UEditor`, `DataTable`).

## Rules before editing

Read the rule file for the target locale first:

- `vi` → `Vietnamese_rule.md`
- `ko` → `Korean_rule.md`
- `ja` → `Japanese_rule.md`
- `en` → concise, natural product UI English; keep terminology aligned with the component

## Constraints

- Preserve all JSON keys exactly — never rename or restructure.
- Preserve ICU syntax (`{count, plural, one {...} other {...}}`), `{variable}` placeholders.
- Translate by UI context (button, label, toast, error, placeholder…), not word-for-word.
- After editing, run `npm run i18n:check` from the project root to verify key sync.

## Relationship to package locales

`packages/underverse/locales/` is a separate set of strings bundled into the npm package (component-level labels, aria text). Edit them independently — same rules apply.
