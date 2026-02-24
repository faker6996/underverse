#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const pkgDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const srcIndexPath = path.join(pkgDir, "src/index.ts");
const pkgJsonPath = path.join(pkgDir, "package.json");
const outPath = path.join(pkgDir, "api-reference.json");

const source = fs.readFileSync(srcIndexPath, "utf-8");
const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));

/** @type {Array<{name: string; kind: string; source: string | null; reexport: boolean; local: boolean; aliasOf?: string}>} */
const exportsList = [];
const seen = new Set();

const pushUnique = (entry) => {
  const key = `${entry.name}|${entry.kind}|${entry.source ?? ""}|${entry.aliasOf ?? ""}|${entry.reexport}|${entry.local}`;
  if (seen.has(key)) return;
  seen.add(key);
  exportsList.push(entry);
};

const parseNamedSpecifiers = (raw) => {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((item) => {
      const typePrefixed = item.startsWith("type ");
      const cleaned = typePrefixed ? item.replace(/^type\s+/, "") : item;
      const aliasMatch = cleaned.match(/^([A-Za-z_$][\w$]*)\s+as\s+([A-Za-z_$][\w$]*)$/);
      if (aliasMatch) {
        return {
          name: aliasMatch[2],
          aliasOf: aliasMatch[1],
          kind: typePrefixed ? "type" : "value",
        };
      }
      return { name: cleaned, kind: typePrefixed ? "type" : "value" };
    });
};

for (const match of source.matchAll(/export\s+(type\s+)?\{([\s\S]*?)\}\s+from\s+["']([^"']+)["'];?/g)) {
  const forceType = Boolean(match[1]);
  const rawSpecifiers = match[2];
  const from = match[3];
  const parsed = parseNamedSpecifiers(rawSpecifiers);
  parsed.forEach((item) => {
    pushUnique({
      name: item.name,
      kind: forceType ? "type" : item.kind,
      source: from,
      reexport: true,
      local: false,
      ...(item.aliasOf ? { aliasOf: item.aliasOf } : {}),
    });
  });
}

for (const match of source.matchAll(/export\s+\*\s+as\s+([A-Za-z_$][\w$]*)\s+from\s+["']([^"']+)["'];?/g)) {
  pushUnique({
    name: match[1],
    kind: "namespace",
    source: match[2],
    reexport: true,
    local: false,
  });
}

for (const match of source.matchAll(/export\s+\*\s+from\s+["']([^"']+)["'];?/g)) {
  pushUnique({
    name: "*",
    kind: "wildcard",
    source: match[1],
    reexport: true,
    local: false,
  });
}

for (const match of source.matchAll(/export\s+(const|function|class|type|interface|enum)\s+([A-Za-z_$][\w$]*)/g)) {
  const rawKind = match[1];
  const name = match[2];
  pushUnique({
    name,
    kind: rawKind === "function" || rawKind === "const" || rawKind === "class" ? "value" : "type",
    source: null,
    reexport: false,
    local: true,
  });
}

exportsList.sort((a, b) => a.name.localeCompare(b.name) || a.kind.localeCompare(b.kind));

const payload = {
  package: pkg.name,
  version: pkg.version,
  sourceEntry: "src/index.ts",
  totalExports: exportsList.length,
  exports: exportsList,
};

fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf-8");
console.log(`Generated ${path.relative(pkgDir, outPath)} with ${exportsList.length} exports.`);
