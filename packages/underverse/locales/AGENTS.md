# I18n Agent Instructions (Package Locales)

When editing any locale JSON in this directory, read the locale-specific rule file first:

- `vi`: read `../../../i18n/Vietnamese_rule.md`
- `ko`: read `../../../i18n/Korean_rule.md`
- `ja`: read `../../../i18n/Japanese_rule.md`

For `en`, use concise, natural product UI English and keep terminology aligned with the component name.

These locales are bundled into the published npm package `@underverse-ui/underverse`. Keys here are component-level strings (labels, tooltips, aria text) — keep them concise and framework-agnostic.

Always translate by UI context, not literal word matching. Preserve JSON keys, placeholders, ICU syntax, and namespace structure exactly.
