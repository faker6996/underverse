#!/usr/bin/env node
import path from 'path';
import { listLocaleFiles, readJson, writeJson } from './_utils.mjs';

async function main() {
  const files = await listLocaleFiles();
  let changed = 0;
  for (const file of files) {
    const before = await readJson(file);
    // Sorting keys deterministically is a safe "dedupe" step for JSON messages
    await writeJson(file, before);
    changed++;
    console.log(`[i18n:dedupe] Sorted keys: ${path.basename(file)}`);
  }
  console.log(`[i18n:dedupe] Processed ${changed} locale files.`);
}

main().catch((err) => {
  console.error('[i18n:dedupe] Error:', err);
  process.exit(1);
});

