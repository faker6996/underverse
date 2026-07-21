import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(fs.readFileSync(path.join(packageRoot, "package.json"), "utf8"));
const packageName = packageJson.name;

const esmUEditor = await import(`${packageName}/ueditor`);
const cjsUEditor = require(`${packageName}/ueditor`);
const cjsRoot = require(packageName);

assert.ok(esmUEditor.default, "ESM UEditor subpath must expose the default editor component");
assert.ok(cjsUEditor.default, "CommonJS UEditor subpath must expose the default editor component");
assert.ok(cjsRoot.UEditor, "CommonJS package root must remain loadable and expose UEditor");

console.log("[verify:package-exports] Root and UEditor subpath load in ESM and CommonJS.");
