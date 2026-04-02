#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, '..');
const PACKAGE_SRC = path.join(ROOT, 'packages/underverse/src');
const PACKAGE_COMPONENTS = path.join(PACKAGE_SRC, 'components');
const APP_UI = path.join(ROOT, 'components/ui');
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

  const pkgEntries = await fs.readdir(PACKAGE_COMPONENTS, { withFileTypes: true });
  const packageComponentNames = new Set(
    pkgEntries
      .filter((entry) => entry.isDirectory() || /\.(ts|tsx)$/.test(entry.name))
      .map((entry) => entry.name.replace(/\.(ts|tsx)$/, '')),
  );

  const uiEntries = await fs.readdir(APP_UI, { withFileTypes: true });
  for (const entry of uiEntries) {
    const componentName = entry.name.replace(/\.(ts|tsx)$/, '');
    if (!packageComponentNames.has(componentName)) continue;

    const full = path.join(APP_UI, entry.name);
    if (entry.isFile()) {
      const text = await fs.readFile(full, 'utf8');
      const expected = `packages/underverse/src/components/${componentName}`;
      if (!text.includes(expected)) {
        addViolation(full, 'app ui wrapper must re-export from package component source');
      }
      continue;
    }

    if (!entry.isDirectory()) continue;

    const nestedFiles = await walk(full);
    if (nestedFiles.length === 0) continue;

    for (const nestedFile of nestedFiles) {
      const relativeNested = path.relative(full, nestedFile).replace(/\\/g, '/');
      if (!/^index\.(ts|tsx)$/.test(relativeNested)) {
        addViolation(nestedFile, 'app ui component directory must not contain implementation files for package-owned component');
        continue;
      }

      const text = await fs.readFile(nestedFile, 'utf8');
      const expected = `packages/underverse/src/components/${componentName}`;
      if (!text.includes(expected)) {
        addViolation(nestedFile, 'app ui directory index must re-export from package component source');
      }
    }
  }

  if (violations.length > 0) {
    console.error('[check:package-boundaries] Violations found:');
    for (const violation of violations) console.error(`- ${violation}`);
    process.exit(1);
  }

  console.log('[check:package-boundaries] Package source is isolated and app ui wrappers are clean.');
}

main().catch((error) => {
  console.error('[check:package-boundaries] Error:', error);
  process.exit(1);
});
