#!/usr/bin/env node
import path from 'path';
import {
  listLocaleFiles,
  readJson,
  writeJson,
  flattenMessages,
  walkSourceFiles,
  readText,
  parseArgs,
} from './_utils.mjs';

const args = parseArgs();
const write = Boolean(args.write);
const targetLocale = args.locale; // optional: limit removal to a specific locale

function collectUsedKeysFromSource(code) {
  const used = new Set();

  // Pattern 1: const t = useTranslations('Namespace'); ... t('key')
  const nsAssignRe = /const\s+(\w+)\s*=\s*useTranslations\((['"])([^'"\)]+)\2\)/g;
  let m;
  const tVars = [];
  while ((m = nsAssignRe.exec(code))) {
    tVars.push({ name: m[1], ns: m[3] });
  }
  for (const { name, ns } of tVars) {
    const callRe = new RegExp(`${name}\\((['"])((?:\\\\.|[^\\\\])*?)\\1\\)`, 'g');
    let c;
    while ((c = callRe.exec(code))) {
      const key = c[2];
      if (key) used.add(`${ns}.${key}`);
    }
  }

  // Pattern 2: const t = useTranslations(); t('Namespace.key')
  const tAssignNoNs = /const\s+(\w+)\s*=\s*useTranslations\(\)/g;
  while ((m = tAssignNoNs.exec(code))) {
    const name = m[1];
    const callRe = new RegExp(`${name}\\((['"])((?:\\\\.|[^\\\\])*?)\\1\\)`, 'g');
    let c;
    while ((c = callRe.exec(code))) {
      const key = c[2];
      if (key) used.add(key);
    }
  }

  // Pattern 3: direct t('Namespace.key') (best-effort)
  const directT = /\bt\((['"])((?:\\\\.|[^\\\\])*?)\1\)/g;
  while ((m = directT.exec(code))) {
    if (m[2]) used.add(m[2]);
  }

  return used;
}

async function main() {
  const files = await walkSourceFiles(process.cwd());
  const used = new Set();
  for (const file of files) {
    const code = await readText(file);
    const s = collectUsedKeysFromSource(code);
    s.forEach((k) => used.add(k));
  }

  const localeFiles = await listLocaleFiles();
  for (const file of localeFiles) {
    const locale = path.basename(file, '.json');
    if (targetLocale && targetLocale !== locale) continue;
    const json = await readJson(file);
    const flat = flattenMessages(json);
    const keys = Object.keys(flat);
    const unused = keys.filter((k) => !used.has(k));

    if (!unused.length) {
      console.log(`[i18n:remove-unused] ${locale}: no unused keys.`);
      continue;
    }

    console.log(`\n[i18n:remove-unused] ${locale}: ${unused.length} unused keys found.`);
    unused.slice(0, 100).forEach((k) => console.log('  -', k));
    if (unused.length > 100) console.log(`  …and ${unused.length - 100} more`);

    if (write) {
      // Rebuild object without unused keys
      const keep = new Set(keys.filter((k) => used.has(k)));
      const next = {};
      for (const k of keep) {
        // Reconstruct nested structure
        const parts = k.split('.');
        let cur = next;
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i];
          if (i === parts.length - 1) cur[p] = flat[k];
          else cur = cur[p] || (cur[p] = {});
        }
      }
      await writeJson(file, next);
      console.log(`[i18n:remove-unused] ${locale}: removed unused keys and wrote file.`);
    } else {
      console.log(`[i18n:remove-unused] ${locale}: dry-run (use --write to apply).`);
    }
  }
}

main().catch((err) => {
  console.error('[i18n:remove-unused] Error:', err);
  process.exit(1);
});

