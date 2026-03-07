import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const packageRoot = path.resolve(import.meta.dirname, "..");
const apiReferencePath = path.join(packageRoot, "api-reference.json");
const sourceEntryPath = path.join(packageRoot, "src/index.ts");
const apiReference = JSON.parse(fs.readFileSync(apiReferencePath, "utf8"));
const sourceEntry = fs.readFileSync(sourceEntryPath, "utf8");

test("public api metadata stays broad and excludes app-only exports", () => {
  const runtimeExports = (apiReference.exports || []).filter((entry) => entry.kind === "value" && entry.name !== "*");

  assert.ok(runtimeExports.length >= 100, `Expected broad runtime surface, got ${runtimeExports.length}`);
  assert.ok(runtimeExports.some((entry) => entry.name === "UEditor"), "UEditor should remain in public package API");
  assert.ok(runtimeExports.some((entry) => entry.name === "DataTable"), "DataTable should remain in public package API");
  assert.ok(runtimeExports.some((entry) => entry.name === "CalendarTimeline"), "CalendarTimeline should remain in public package API");
  assert.equal(runtimeExports.some((entry) => entry.name === "FloatingContacts"), false, "FloatingContacts should stay app-only");
});

test("package barrel stays isolated from app ui re-exports", () => {
  assert.equal(/components\/ui\//.test(sourceEntry), false);
  assert.equal(/FloatingContacts/.test(sourceEntry), false);
});
