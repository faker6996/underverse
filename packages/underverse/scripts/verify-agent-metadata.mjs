#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const pkgDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

const requiredFiles = ["AGENTS.md", "llms.txt", "api-reference.json", "agent-recipes.json"];

for (const file of requiredFiles) {
  const target = path.join(pkgDir, file);
  if (!fs.existsSync(target)) {
    throw new Error(`Missing required metadata file: ${file}`);
  }
}

const api = JSON.parse(fs.readFileSync(path.join(pkgDir, "api-reference.json"), "utf-8"));
if (!Array.isArray(api.exports) || api.exports.length === 0) {
  throw new Error("api-reference.json must contain a non-empty `exports` array.");
}

const recipes = JSON.parse(fs.readFileSync(path.join(pkgDir, "agent-recipes.json"), "utf-8"));
if (!Array.isArray(recipes.recipes) || recipes.recipes.length === 0) {
  throw new Error("agent-recipes.json must contain a non-empty `recipes` array.");
}

const agentsText = fs.readFileSync(path.join(pkgDir, "AGENTS.md"), "utf-8").trim();
if (!agentsText) {
  throw new Error("AGENTS.md must not be empty.");
}

const llmsText = fs.readFileSync(path.join(pkgDir, "llms.txt"), "utf-8").trim();
if (!llmsText) {
  throw new Error("llms.txt must not be empty.");
}

console.log("Agent metadata verified.");

