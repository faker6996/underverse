#!/usr/bin/env node
import path from 'path';
import {
  listLocaleFiles,
  readJson,
  flattenMessages,
  parseArgs,
} from './_utils.mjs';

const args = parseArgs();
const baseLocale = (args.base || process.env.BASE_LOCALE || 'vi').toLowerCase();

async function main() {
  const files = await listLocaleFiles();
  const map = new Map();
  for (const file of files) {
    const locale = path.basename(file, '.json');
    map.set(locale, flattenMessages(await readJson(file)));
  }

  if (!map.has(baseLocale)) {
    console.warn(`[i18n:check] Base locale '${baseLocale}' not found. Using first locale as base.`);
  }
  const base = map.get(baseLocale) || map.values().next().value || {};
  const baseKeys = new Set(Object.keys(base));

  let hasMissing = false;
  for (const [locale, msgs] of map.entries()) {
    const keys = new Set(Object.keys(msgs));
    const missing = [...baseKeys].filter((k) => !keys.has(k));
    const extra = [...keys].filter((k) => !baseKeys.has(k));

    if (missing.length) {
      hasMissing = true;
      console.log(`\n[${locale}] Missing keys (${missing.length}):`);
      missing.slice(0, 100).forEach((k) => console.log('  -', k));
      if (missing.length > 100) console.log(`  …and ${missing.length - 100} more`);
    }
    if (extra.length) {
      console.log(`\n[${locale}] Extra keys (not in base: ${baseLocale}) (${extra.length}):`);
      extra.slice(0, 50).forEach((k) => console.log('  +', k));
      if (extra.length > 50) console.log(`  …and ${extra.length - 50} more`);
    }
  }

  if (hasMissing) process.exitCode = 1;
}

main().catch((err) => {
  console.error('[i18n:check] Error:', err);
  process.exit(1);
});

