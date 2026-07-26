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
const exampleDirectory = path.join(
  repositoryRoot,
  "app/[locale]/(pages)/docs/underverse/_examples",
);
const apiManifestPath = path.join(
  repositoryRoot,
  "app/[locale]/(pages)/docs/underverse/_data/component-api.generated.json",
);
const componentPagePath = path.join(
  repositoryRoot,
  "app/[locale]/(pages)/docs/underverse/[slug]/page.tsx",
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
  /component\("([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*\[([^\]]*)\],\s*"([^"]+)"/g,
)].map((match) => ({
  slug: match[1],
  translationKey: match[2],
  category: match[3],
  importNames: [...match[4].matchAll(/"([^"]+)"/g)].map((nameMatch) => nameMatch[1]),
  sourceFile: match[5],
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
const exampleEntries = [
  ...exampleMapSource.matchAll(
    /^\s*(?:"([^"]+)"|([a-zA-Z][\w-]*)):\s*load\(\(\) => import\("\.\.\/_examples\/([^"]+)"\)/gm,
  ),
].map((match) => ({
  slug: match[1] || match[2],
  exampleFile: `${match[3]}.tsx`,
}));
const exampleSlugs = new Set(exampleEntries.map((entry) => entry.slug));
for (const slug of seenSlugs) {
  if (!exampleSlugs.has(slug)) fail(`Registry item ${slug} has no real demo in ComponentExample.tsx.`);
}
for (const slug of exampleSlugs) {
  if (!seenSlugs.has(slug)) fail(`ComponentExample.tsx contains an undocumented demo: ${slug}.`);
}

const apiManifest = JSON.parse(fs.readFileSync(apiManifestPath, "utf8"));
const componentPageSource = fs.readFileSync(componentPagePath, "utf8");
if (!/<ComponentApiReference\b/.test(componentPageSource)) {
  fail("The shared component page must render the generated ComponentApiReference.");
}

for (const entry of entries) {
  const contract = apiManifest.components?.[entry.slug];
  if (!contract) {
    fail(`Registry item ${entry.slug} has no generated API contract.`);
    continue;
  }
  if (!Array.isArray(contract.apis) || contract.apis.length === 0) {
    fail(`Registry item ${entry.slug} has an empty generated API contract.`);
  }

  const apiNames = new Set((contract.apis ?? []).map((api) => api.name));
  for (const importName of entry.importNames) {
    if (!apiNames.has(importName)) {
      fail(`${entry.slug} imports ${importName}, but the generated API contract does not expose it.`);
    }
  }
}

for (const { slug, exampleFile } of exampleEntries) {
  const examplePath = path.join(exampleDirectory, exampleFile);
  const source = fs.readFileSync(examplePath, "utf8");
  if (!/<Tabs\b/.test(source)) {
    fail(`${slug} must use the shared Tabs documentation layout in ${exampleFile}.`);
  }
  if (!/value:\s*["']preview["']/.test(source)) {
    fail(`${slug} is missing a preview example in ${exampleFile}.`);
  }
  if (!/value:\s*["']code["']/.test(source)) {
    fail(`${slug} is missing source code for its example in ${exampleFile}.`);
  }

  const templateLiterals = [...source.matchAll(/`([\s\S]*?)`/g)].map((match) => match[1]);
  const internalImports = templateLiterals.flatMap((literal) =>
    [...literal.matchAll(/(?:from\s+|import\s+)["'](@\/components\/ui\/[^"']+)["']/g)]
      .map((match) => match[1]),
  );
  if (internalImports.length) {
    fail(
      `${slug} exposes internal imports in ${exampleFile}: ${[...new Set(internalImports)].join(", ")}`,
    );
  }
}

if (!process.exitCode) {
  console.log(
    `[docs:check] ${entries.length} component pages, ${exampleSlugs.size} demos, and ${base.size} translation keys are aligned across ${locales.length} locales.`,
  );
}
