#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

const ROOT = '/Users/tran_van_bach/Desktop/project/nextJs/underverse';
const PACKAGE_SRC = path.join(ROOT, 'packages/underverse/src');
const INDEX_FILE = path.join(PACKAGE_SRC, 'index.ts');

const violations = [];

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(full));
    } else if (/\.(ts|tsx|mts|cts)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

function addViolation(file, message) {
  violations.push(`${path.relative(ROOT, file)}: ${message}`);
}

async function main() {
  const indexText = await fs.readFile(INDEX_FILE, 'utf8');
  if (/from\s+["'][^"']*components\/ui\//.test(indexText)) {
    addViolation(INDEX_FILE, 'must not re-export from app ui source');
  }

  const files = await walk(PACKAGE_SRC);
  for (const file of files) {
    const text = await fs.readFile(file, 'utf8');
    if (/from\s+["']@\//.test(text)) addViolation(file, 'must not import from @/ alias');
    if (/from\s+["'][^"']*components\/ui\//.test(text)) addViolation(file, 'must not import from app ui source');
  }

  if (violations.length > 0) {
    console.error('[check:package-boundaries] Violations found:');
    for (const violation of violations) console.error(`- ${violation}`);
    process.exit(1);
  }

  console.log('[check:package-boundaries] Package source is isolated from app ui aliases.');
}

main().catch((error) => {
  console.error('[check:package-boundaries] Error:', error);
  process.exit(1);
});
