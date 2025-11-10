#!/usr/bin/env node
import path from 'path';
import { walkSourceFiles, readText, parseArgs } from './_utils.mjs';
import { promises as fs } from 'fs';

const args = parseArgs();
const write = Boolean(args.write);
const includeWarnError = Boolean(args.all);

const patterns = includeWarnError
  ? [/console\.(log|debug|info|warn|error)\s*\(/g]
  : [/console\.(log|debug|info)\s*\(/g];

function removeConsole(content) {
  let changed = false;
  let updated = content;
  for (const re of patterns) {
    if (re.test(updated)) {
      changed = true;
      // Remove the entire statement line. This is a simple, line-based approach.
      updated = updated
        .split('\n')
        .filter((line) => !re.test(line))
        .join('\n');
    }
  }
  return { changed, updated };
}

async function main() {
  const files = await walkSourceFiles(process.cwd());
  let count = 0;
  for (const file of files) {
    const content = await readText(file);
    const { changed, updated } = removeConsole(content);
    if (changed) {
      count++;
      if (write) {
        await fs.writeFile(file, updated, 'utf8');
        console.log(`[cleanup:console] Updated: ${path.relative(process.cwd(), file)}`);
      } else {
        console.log(`[cleanup:console] Would modify: ${path.relative(process.cwd(), file)}`);
      }
    }
  }
  if (!count) console.log('[cleanup:console] No console statements matched.');
  else if (!write) console.log(`[cleanup:console] Dry-run. Use --write to apply. (${count} files)`);
}

main().catch((err) => {
  console.error('[cleanup:console] Error:', err);
  process.exit(1);
});

