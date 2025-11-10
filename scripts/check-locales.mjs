#!/usr/bin/env node
import path from 'path';
import { listLocaleFiles, readJson, flattenMessages, parseArgs } from './_utils.mjs';

const args = parseArgs();
const baseLocale = (args.base || process.env.BASE_LOCALE || 'vi').toLowerCase();

async function main() {
  const files = await listLocaleFiles();
  const map = new Map();
  for (const file of files) {
    const locale = path.basename(file, '.json');
    try {
      const json = await readJson(file);
      map.set(locale, json);
    } catch (e) {
      console.error(`[i18n:check-locales] Invalid JSON: ${file}`);
      throw e;
    }
  }

  if (!map.has(baseLocale)) {
    console.warn(`[i18n:check-locales] Base locale '${baseLocale}' not found. Using first locale as base.`);
  }
  const base = map.get(baseLocale) || map.values().next().value || {};
  const baseFlat = flattenMessages(base);
  let hasTypeMismatch = false;

  for (const [locale, obj] of map.entries()) {
    const flat = flattenMessages(obj);
    for (const key of Object.keys(baseFlat)) {
      if (!(key in flat)) continue;
      const a = baseFlat[key];
      const b = flat[key];
      const ta = Array.isArray(a) ? 'array' : typeof a;
      const tb = Array.isArray(b) ? 'array' : typeof b;
      if (ta !== tb) {
        hasTypeMismatch = true;
        console.log(`[${locale}] Type mismatch for '${key}': expected ${ta}, got ${tb}`);
      }
    }
  }

  if (!hasTypeMismatch) console.log('[i18n:check-locales] All locale files parsed OK and types align with base.');
  if (hasTypeMismatch) process.exitCode = 1;
}

main().catch((err) => {
  console.error('[i18n:check-locales] Error:', err);
  process.exit(1);
});

