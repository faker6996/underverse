#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const locales = ["en", "vi", "ko", "ja"];
const registryPath = path.join(
  repositoryRoot,
  "app/[locale]/(pages)/docs/underverse/_data/docs-registry.ts",
);
const exampleMapPath = path.join(
  repositoryRoot,
  "app/[locale]/(pages)/docs/underverse/_components/ComponentExample.tsx",
);

function flatten(value, prefix = "", output = new Map()) {
  for (const [key, nestedValue] of Object.entries(value)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (nestedValue && typeof nestedValue === "object" && !Array.isArray(nestedValue)) {
      flatten(nestedValue, fullKey, output);
    } else {
      output.set(fullKey, nestedValue);
    }
  }
  return output;
}

function fail(message) {
  console.error(`[docs:check] ${message}`);
  process.exitCode = 1;
}

const messages = new Map();
for (const locale of locales) {
  const localePath = path.join(repositoryRoot, `i18n/locales/${locale}.json`);
  const json = JSON.parse(fs.readFileSync(localePath, "utf8"));
  if (!json.DocsUnderverse) {
    fail(`${localePath} does not contain DocsUnderverse.`);
    continue;
  }
  messages.set(locale, flatten(json.DocsUnderverse));
}

const base = messages.get("en") ?? new Map();
for (const locale of locales.slice(1)) {
  const candidate = messages.get(locale) ?? new Map();
  const missing = [...base.keys()].filter((key) => !candidate.has(key));
  const extra = [...candidate.keys()].filter((key) => !base.has(key));
  if (missing.length) fail(`${locale} is missing DocsUnderverse keys:\n  ${missing.join("\n  ")}`);
  if (extra.length) fail(`${locale} has extra DocsUnderverse keys:\n  ${extra.join("\n  ")}`);
}

const registrySource = fs.readFileSync(registryPath, "utf8");
const entries = [...registrySource.matchAll(
  /component\("([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*\[[^\]]*\],\s*"([^"]+)"/g,
)].map((match) => ({
  slug: match[1],
  translationKey: match[2],
  category: match[3],
  sourceFile: match[4],
}));

if (!entries.length) fail(`No component entries were parsed from ${registryPath}.`);

const seenSlugs = new Set();
for (const entry of entries) {
  if (seenSlugs.has(entry.slug)) fail(`Duplicate registry slug: ${entry.slug}`);
  seenSlugs.add(entry.slug);

  const sourcePath = path.join(repositoryRoot, "packages/underverse/src", entry.sourceFile);
  if (!fs.existsSync(sourcePath)) fail(`${entry.slug} points to missing source file: ${sourcePath}`);

  for (const locale of locales) {
    const localeMessages = messages.get(locale);
    if (!localeMessages?.has(`sections.${entry.translationKey}.title`)) {
      fail(`${locale} is missing title for registry item ${entry.slug}: sections.${entry.translationKey}.title`);
    }
    if (!localeMessages?.has(`tocGroups.${entry.category}`)) {
      fail(`${locale} is missing category for registry item ${entry.slug}: tocGroups.${entry.category}`);
    }
  }
}

const exampleMapSource = fs.readFileSync(exampleMapPath, "utf8");
const exampleSlugs = new Set(
  [...exampleMapSource.matchAll(/^\s*(?:"([^"]+)"|([a-zA-Z][\w-]*)):\s*load\(/gm)].map(
    (match) => match[1] || match[2],
  ),
);
for (const slug of seenSlugs) {
  if (!exampleSlugs.has(slug)) fail(`Registry item ${slug} has no real demo in ComponentExample.tsx.`);
}
for (const slug of exampleSlugs) {
  if (!seenSlugs.has(slug)) fail(`ComponentExample.tsx contains an undocumented demo: ${slug}.`);
}

if (!process.exitCode) {
  console.log(
    `[docs:check] ${entries.length} component pages, ${exampleSlugs.size} demos, and ${base.size} translation keys are aligned across ${locales.length} locales.`,
  );
}
