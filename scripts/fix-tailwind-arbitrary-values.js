#!/usr/bin/env node

/**
 * Auto-fix Tailwind CSS arbitrary values to standard classes
 * Usage: node scripts/fix-tailwind-arbitrary-values.js [--dry-run]
 *
 * Converts patterns like:
 * - w-[400px] → w-100 (400 / 4 = 100)
 * - min-h-[200px] → min-h-50 (200 / 4 = 50)
 * - max-w-[320px] → max-w-80 (320 / 4 = 80)
 * - max-w-[32rem] → max-w-lg
 * - text-[18px] → text-lg
 * - rounded-[24px] → rounded-3xl
 */

import fs from "fs";
import path from "path";

const DRY_RUN = process.argv.includes("--dry-run");
const FAIL_ON_UNHANDLED = process.argv.includes("--fail-on-unhandled");

const NUMERIC_SIZE_UTILITY_PREFIXES = ["min-w", "max-w", "min-h", "max-h", "w", "h", "top", "left", "right", "bottom", "ml", "-ml"];
const CONVERTIBLE_UTILITY_PREFIXES = [...NUMERIC_SIZE_UTILITY_PREFIXES, "text", "rounded"];

const UTILITY_GROUP = CONVERTIBLE_UTILITY_PREFIXES.map(escapeRegExp)
  // Ensure longer prefixes match first (e.g. "min-w" before "w")
  .sort((a, b) => b.length - a.length)
  .join("|");

const TOKEN_BOUNDARY_REGEX_PART = "(^|[\\s\"'`{}()[\\],])";

// Match Tailwind arbitrary values, including variant prefixes like:
// - sm:w-[720px]  -> sm:w-180
// - dark:hover:min-w-[180px]! -> dark:hover:min-w-45!
// - max-w-[32rem] -> max-w-lg
//
// Notes:
// - We intentionally allow matching inside any string/template literal content
//   (not only `className="..."`) to cover common patterns like `cn("...")`.
// - We keep the "boundary" as a capture so the replacement doesn't eat
//   whitespace/quotes/punctuation.
const ARBITRARY_VALUE_REGEX = new RegExp(
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
    // 5) arbitrary value
    String.raw`-\[(\d+(?:\.\d+)?)(px|rem)\]`,
  "gm",
);

const ANY_ARBITRARY_VALUE_REGEX = new RegExp(
  TOKEN_BOUNDARY_REGEX_PART + String.raw`((?:(?:[\w-]+|\[[^\]]+\]):)*)` + String.raw`(!?)` + String.raw`([\w-]+)` + String.raw`-\[([^\]]+)\]`,
  "gm",
);

const MAX_WIDTH_CANONICAL_REM = {
  20: "xs",
  24: "sm",
  28: "md",
  32: "lg",
  36: "xl",
  42: "2xl",
  48: "3xl",
  56: "4xl",
  64: "5xl",
  72: "6xl",
  80: "7xl",
};

const TEXT_SIZE_CANONICAL = {
  "12px": "xs",
  "0.75rem": "xs",
  "14px": "sm",
  "0.875rem": "sm",
  "16px": "base",
  "1rem": "base",
  "18px": "lg",
  "1.125rem": "lg",
  "20px": "xl",
  "1.25rem": "xl",
  "24px": "2xl",
  "1.5rem": "2xl",
  "30px": "3xl",
  "1.875rem": "3xl",
  "36px": "4xl",
  "2.25rem": "4xl",
  "48px": "5xl",
  "3rem": "5xl",
  "60px": "6xl",
  "3.75rem": "6xl",
  "72px": "7xl",
  "4.5rem": "7xl",
  "96px": "8xl",
  "6rem": "8xl",
  "128px": "9xl",
  "8rem": "9xl",
};

const ROUNDED_CANONICAL = {
  "4px": "sm",
  "0.25rem": "sm",
  "6px": "md",
  "0.375rem": "md",
  "8px": "lg",
  "0.5rem": "lg",
  "12px": "xl",
  "0.75rem": "xl",
  "16px": "2xl",
  "1rem": "2xl",
  "24px": "3xl",
  "1.5rem": "3xl",
};

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

function remToTailwindUnit(rem) {
  const value = parseFloat(rem);
  const unit = value * 4;
  return unit % 1 === 0 ? unit.toString() : unit.toFixed(2).replace(/\.?0+$/, "");
}

function getCanonicalClassName(utility, rawValue, unit) {
  const normalizedKey = unit === "px" ? `${parseInt(rawValue, 10)}px` : `${String(parseFloat(rawValue))}rem`;

  if (utility === "text") {
    return TEXT_SIZE_CANONICAL[normalizedKey] ? `${utility}-${TEXT_SIZE_CANONICAL[normalizedKey]}` : null;
  }

  if (utility === "rounded") {
    return ROUNDED_CANONICAL[normalizedKey] ? `${utility}-${ROUNDED_CANONICAL[normalizedKey]}` : null;
  }

  if (unit === "rem" && utility === "max-w") {
    const parsed = parseFloat(rawValue);
    const canonical = MAX_WIDTH_CANONICAL_REM[parsed];
    if (canonical) {
      return `${utility}-${canonical}`;
    }
  }

  const tailwindUnit = unit === "px" ? pxToTailwindUnit(rawValue) : remToTailwindUnit(rawValue);
  return `${utility}-${tailwindUnit}`;
}

function collectUnhandledArbitraryValues(content) {
  const remaining = [];

  for (const match of content.matchAll(ANY_ARBITRARY_VALUE_REGEX)) {
    const [fullMatch, boundary, variants, important, utility, rawValue] = match;
    const offset = match.index ?? 0;
    const tokenStartIndex = offset + (boundary ? boundary.length : 0);
    const nextChar = content[offset + fullMatch.length];
    if (!isValidTokenBoundaryChar(nextChar)) continue;

    remaining.push({
      token: `${variants}${important}${utility}-[${rawValue}]`,
      line: getLineNumberFromIndex(content, tokenStartIndex),
    });
  }

  return remaining;
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

  const nextContent = content.replace(ARBITRARY_VALUE_REGEX, (match, boundary, variants, important, utility, rawValue, rawUnit, offset) => {
    const tokenStartIndex = offset + (boundary ? boundary.length : 0);
    const nextChar = content[offset + match.length];
    if (!isValidTokenBoundaryChar(nextChar)) return match;

    const oldClass = `${variants}${important}${utility}-[${rawValue}${rawUnit}]`;
    const canonicalClassName = getCanonicalClassName(utility, rawValue, rawUnit);
    if (!canonicalClassName) return match;

    const newClass = `${variants}${important}${canonicalClassName}`;

    changes.push({
      old: oldClass,
      new: newClass,
      line: getLineNumberFromIndex(content, tokenStartIndex),
    });

    return `${boundary}${newClass}`;
  });

  return { content: nextContent, changes };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");

  const result = replaceArbitraryPxValues(content);
  const unhandled = collectUnhandledArbitraryValues(result.content);
  if (result.changes.length > 0) {
    if (!DRY_RUN) {
      fs.writeFileSync(filePath, result.content, "utf8");
    }
    return { filePath, changes: result.changes, unhandled };
  }

  return unhandled.length > 0 ? { filePath, changes: [], unhandled } : null;
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
  const unhandledTokens = new Map();

  files.forEach((file) => {
    const result = processFile(file);
    if (result) {
      modifiedFiles.push(result);
      totalChanges += result.changes.length;
      result.unhandled.forEach(({ token, line }) => {
        const existing = unhandledTokens.get(token);
        const fileRef = path.relative(process.cwd(), file);
        if (existing) {
          existing.count += 1;
          existing.examples.push({ file: fileRef, line });
        } else {
          unhandledTokens.set(token, {
            count: 1,
            examples: [{ file: fileRef, line }],
          });
        }
      });
    }
  });

  // Print results
  if (modifiedFiles.length === 0) {
    console.log("✅ No arbitrary values found! All classes are already using standard Tailwind units.\n");
    return;
  }

  if (totalChanges > 0) {
    console.log(`${DRY_RUN ? "📋 Would fix" : "✨ Fixed"} ${totalChanges} arbitrary values in ${modifiedFiles.length} files:\n`);
  } else {
    console.log("ℹ️ No auto-fixable arbitrary values found.\n");
  }

  modifiedFiles.forEach(({ filePath, changes }) => {
    if (changes.length === 0) return;
    const relativePath = path.relative(process.cwd(), filePath);
    console.log(`📄 ${relativePath}`);
    changes.forEach(({ old, new: newClass, line }) => {
      console.log(`   Line ~${line}: ${old} → ${newClass}`);
    });
    console.log("");
  });

  if (unhandledTokens.size > 0) {
    console.log("⚠️ Remaining arbitrary values that still need manual review or new script coverage:\n");

    [...unhandledTokens.entries()]
      .sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]))
      .forEach(([token, info]) => {
        const preview = info.examples
          .slice(0, 3)
          .map((example) => `${example.file}:~${example.line}`)
          .join(", ");

        console.log(`   ${token}  (${info.count}x)`);
        console.log(`      e.g. ${preview}`);
      });

    console.log("");
  }

  if (DRY_RUN) {
    console.log("💡 Run without --dry-run to apply changes\n");
  } else {
    console.log("✅ All changes applied!\n");
  }

  if (FAIL_ON_UNHANDLED && unhandledTokens.size > 0) {
    console.error("❌ Unhandled arbitrary values remain. Run with --dry-run to inspect them.");
    process.exit(2);
  }
}

// Run
try {
  await main();
} catch (error) {
  console.error("❌ Error:", error.message);
  process.exit(1);
}
