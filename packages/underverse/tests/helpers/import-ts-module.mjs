import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";

const packageRoot = path.resolve(import.meta.dirname, "../..");
const workspaceRoot = path.resolve(packageRoot, "../..");
const tempBaseDir = path.join(os.tmpdir(), "underverse-test-build");
fs.mkdirSync(tempBaseDir, { recursive: true });
const tempRoot = fs.mkdtempSync(path.join(tempBaseDir, "run-"));
const packageNodeModules = path.join(packageRoot, "node_modules");
const workspaceNodeModules = path.join(workspaceRoot, "node_modules");
const tempNodeModules = path.join(tempRoot, "node_modules");

function linkNodeModulesEntries(fromDir) {
  if (!fs.existsSync(fromDir)) return;
  for (const entry of fs.readdirSync(fromDir)) {
    const source = path.join(fromDir, entry);
    const target = path.join(tempNodeModules, entry);
    if (fs.existsSync(target)) continue;
    fs.symlinkSync(source, target, fs.statSync(source).isDirectory() ? "dir" : "file");
  }
}

function linkScopedEntries(fromDir, scopeName) {
  const scopeDir = path.join(fromDir, scopeName);
  const tempScopeDir = path.join(tempNodeModules, scopeName);
  if (!fs.existsSync(scopeDir)) return;
  fs.mkdirSync(tempScopeDir, { recursive: true });
  for (const entry of fs.readdirSync(scopeDir)) {
    const source = path.join(scopeDir, entry);
    const target = path.join(tempScopeDir, entry);
    if (fs.existsSync(target)) continue;
    fs.symlinkSync(source, target, fs.statSync(source).isDirectory() ? "dir" : "file");
  }
}

if (!fs.existsSync(tempNodeModules)) {
  fs.mkdirSync(tempNodeModules, { recursive: true });
  for (const entry of ["react", "react-dom", "scheduler"]) {
    const source = fs.existsSync(path.join(packageNodeModules, entry))
      ? path.join(packageNodeModules, entry)
      : path.join(workspaceNodeModules, entry);
    const target = path.join(tempNodeModules, entry);
    if (fs.existsSync(source) && !fs.existsSync(target)) {
      fs.symlinkSync(source, target, fs.statSync(source).isDirectory() ? "dir" : "file");
    }
  }
  linkNodeModulesEntries(packageNodeModules);
  linkScopedEntries(packageNodeModules, "@tiptap");
  linkNodeModulesEntries(workspaceNodeModules);
  linkScopedEntries(workspaceNodeModules, "@tiptap");
}

const compiledCache = new Map();
const inProgress = new Set();

function ensureJsExtension(specifier) {
  return specifier.replace(/\.[cm]?[jt]sx?$/, ".mjs").replace(/\.json$/, ".mjs");
}

function resolveRelativeImport(fromFile, specifier) {
  const base = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.jsx`,
    `${base}.json`,
    path.join(base, "index.ts"),
    path.join(base, "index.tsx"),
    path.join(base, "index.js"),
    path.join(base, "index.jsx"),
    path.join(base, "index.json"),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }

  throw new Error(`Unable to resolve ${specifier} from ${fromFile}`);
}

function getOutputPath(filePath) {
  const relativePath = path.relative(packageRoot, filePath);
  return path.join(tempRoot, relativePath).replace(/\.[cm]?[jt]sx?$/, ".mjs").replace(/\.json$/, ".mjs");
}

function rewriteRelativeSpecifiers(sourceText, sourceFile, outFile) {
  const rewrite = (_match, prefix, quote, specifier) => {
    const resolved = resolveRelativeImport(sourceFile, specifier);
    const rewritten = ensureJsExtension(path.relative(path.dirname(outFile), getOutputPath(resolved)).replaceAll(path.sep, "/"));
    const normalized = rewritten.startsWith(".") ? rewritten : `./${rewritten}`;
    return `${prefix}${quote}${normalized}${quote}`;
  };

  return sourceText
    .replace(/(from\s*)(["'])(\.{1,2}\/[^"']+)(\2)/g, rewrite)
    .replace(/(import\s*)(["'])(\.{1,2}\/[^"']+)(\2)/g, rewrite);
}

function compileModule(filePath) {
  const normalizedPath = path.resolve(filePath);
  const cached = compiledCache.get(normalizedPath);
  if (cached) return cached;
  if (inProgress.has(normalizedPath)) return getOutputPath(normalizedPath);

  const sourceText = fs.readFileSync(normalizedPath, "utf8");
  const outFile = getOutputPath(normalizedPath);
  inProgress.add(normalizedPath);

  try {
    if (normalizedPath.endsWith(".json")) {
      fs.mkdirSync(path.dirname(outFile), { recursive: true });
      fs.writeFileSync(outFile, `export default ${sourceText.trim()};\n`, "utf8");
      compiledCache.set(normalizedPath, outFile);
      return outFile;
    }

    const preprocessed = ts.preProcessFile(sourceText, true, true);
    for (const imported of preprocessed.importedFiles) {
      const specifier = imported.fileName;
      if (!specifier.startsWith(".")) continue;
      const resolved = resolveRelativeImport(normalizedPath, specifier);
      compileModule(resolved);
    }

    const rewrittenSource = rewriteRelativeSpecifiers(sourceText, normalizedPath, outFile);
    const transpiled = ts.transpileModule(rewrittenSource, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2020,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
      fileName: normalizedPath,
    });

    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    fs.writeFileSync(outFile, transpiled.outputText, "utf8");
    compiledCache.set(normalizedPath, outFile);
    return outFile;
  } catch (error) {
    compiledCache.delete(normalizedPath);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to transpile ${normalizedPath}: ${message}`);
  } finally {
    inProgress.delete(normalizedPath);
  }
}

export async function importTsModule(filePath) {
  const outFile = compileModule(filePath);
  return import(pathToFileURL(outFile).href);
}
