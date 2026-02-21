#!/usr/bin/env node

/**
 * Auto-fix Tailwind CSS arbitrary values to standard classes
 * Usage: node scripts/fix-tailwind-arbitrary-values.js [--dry-run]
 *
 * Converts patterns like:
 * - w-[400px] → w-100 (400 / 4 = 100)
 * - min-h-[200px] → min-h-50 (200 / 4 = 50)
 * - max-w-[320px] → max-w-80 (320 / 4 = 80)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DRY_RUN = process.argv.includes("--dry-run");

const UTILITY_PREFIXES = ["min-w", "max-w", "min-h", "max-h", "w", "h"];

const UTILITY_GROUP = UTILITY_PREFIXES.map(escapeRegExp)
  // Ensure longer prefixes match first (e.g. "min-w" before "w")
  .sort((a, b) => b.length - a.length)
  .join("|");

const TOKEN_BOUNDARY_REGEX_PART = '(^|[\\s"\'`{}()[\\],])';

// Match Tailwind arbitrary px values, including variant prefixes like:
// - sm:w-[720px]  -> sm:w-180
// - dark:hover:min-w-[180px]! -> dark:hover:min-w-45!
//
// Notes:
// - We intentionally allow matching inside any string/template literal content
//   (not only `className="..."`) to cover common patterns like `cn("...")`.
// - We keep the "boundary" as a capture so the replacement doesn't eat
//   whitespace/quotes/punctuation.
const ARBITRARY_PX_REGEX = new RegExp(
  // 1) boundary (or start-of-line via m flag)
  TOKEN_BOUNDARY_REGEX_PART +
    // 2) variant chain: "sm:" | "dark:hover:" | "[&>p]:"
    String.raw`((?:(?:[\w-]+|\[[^\]]+\]):)*)` +
    // 3) optional important marker
    String.raw`(!?)` +
    // 4) utility prefix
    String.raw`(` +
    UTILITY_GROUP +
    String.raw`)` +
    // 5) arbitrary px value
    String.raw`-\[(\d+)px\]`,
  "gm"
);

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Convert px value to Tailwind spacing unit (divide by 4)
 * 400px → 100, 320px → 80, 18px → 4.5
 */
function pxToTailwindUnit(px) {
  const value = parseInt(px, 10);
  const unit = value / 4;
  return unit % 1 === 0 ? unit.toString() : unit.toFixed(1);
}

function getLineNumberFromIndex(content, index) {
  if (index < 0) return "?";
  return content.substring(0, index).split("\n").length;
}

function isValidTokenBoundaryChar(ch) {
  if (ch === undefined) return true;
  // If the next char is a "wordy" char, we're probably in the middle of a larger token.
  return !/[A-Za-z0-9_-]/.test(ch);
}

function replaceArbitraryPxValues(content) {
  const changes = [];

  const nextContent = content.replace(
    ARBITRARY_PX_REGEX,
    (match, boundary, variants, important, utility, pxValue, offset) => {
      const tokenStartIndex = offset + (boundary ? boundary.length : 0);
      const nextChar = content[offset + match.length];
      if (!isValidTokenBoundaryChar(nextChar)) return match;

      const tailwindUnit = pxToTailwindUnit(pxValue);
      const oldClass = `${variants}${important}${utility}-[${pxValue}px]`;
      const newClass = `${variants}${important}${utility}-${tailwindUnit}`;

      changes.push({
        old: oldClass,
        new: newClass,
        line: getLineNumberFromIndex(content, tokenStartIndex),
      });

      return `${boundary}${newClass}`;
    }
  );

  return { content: nextContent, changes };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  const result = replaceArbitraryPxValues(content);
  if (result.changes.length > 0) {
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, result.content, "utf8");
    }
    return { filePath, changes: result.changes };
  }

  return null;
}

/**
 * Recursively find files matching extensions
 */
function findFiles(dir, extensions, excludeDirs = ["node_modules", ".next", "dist", "build", "scripts"]) {
  const files = [];

  function walk(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        if (!excludeDirs.includes(entry.name)) {
          walk(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }

  walk(dir);
  return files;
}

/**
 * Main function
 */
async function main() {
  console.log("🔍 Scanning for arbitrary Tailwind values...\n");

  const files = findFiles(process.cwd(), [".ts", ".tsx", ".js", ".jsx"]);

  console.log(`Found ${files.length} files to check\n`);

  let totalChanges = 0;
  const modifiedFiles = [];

  files.forEach((file) => {
    const result = processFile(file);
    if (result) {
      modifiedFiles.push(result);
      totalChanges += result.changes.length;
    }
  });

  // Print results
  if (modifiedFiles.length === 0) {
    console.log("✅ No arbitrary values found! All classes are already using standard Tailwind units.\n");
    return;
  }

  console.log(`${DRY_RUN ? "📋 Would fix" : "✨ Fixed"} ${totalChanges} arbitrary values in ${modifiedFiles.length} files:\n`);

  modifiedFiles.forEach(({ filePath, changes }) => {
    const relativePath = path.relative(process.cwd(), filePath);
    console.log(`📄 ${relativePath}`);
    changes.forEach(({ old, new: newClass, line }) => {
      console.log(`   Line ~${line}: ${old} → ${newClass}`);
    });
    console.log("");
  });

  if (DRY_RUN) {
    console.log("💡 Run without --dry-run to apply changes\n");
  } else {
    console.log("✅ All changes applied!\n");
  }
}

// Run
try {
  await main();
} catch (error) {
  console.error("❌ Error:", error.message);
  process.exit(1);
}
