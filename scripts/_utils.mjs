import { promises as fs } from 'fs';
import path from 'path';

export async function listLocaleFiles(dir = path.join(process.cwd(), 'i18n', 'locales')) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith('.json'))
    .map((e) => path.join(dir, e.name));
}

export async function readJson(file) {
  const raw = await fs.readFile(file, 'utf8');
  return JSON.parse(raw);
}

export function sortObjectDeep(obj) {
  if (Array.isArray(obj)) return obj.map(sortObjectDeep);
  if (obj && typeof obj === 'object') {
    return Object.keys(obj)
      .sort()
      .reduce((acc, k) => {
        acc[k] = sortObjectDeep(obj[k]);
        return acc;
      }, {});
  }
  return obj;
}

export async function writeJson(file, data) {
  const sorted = sortObjectDeep(data);
  const content = JSON.stringify(sorted, null, 2) + '\n';
  await fs.writeFile(file, content, 'utf8');
}

export function flattenMessages(obj, prefix = '') {
  const out = {};
  for (const key of Object.keys(obj || {})) {
    const value = obj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(out, flattenMessages(value, fullKey));
    } else {
      out[fullKey] = value;
    }
  }
  return out;
}

export async function walkSourceFiles(startDir = process.cwd(), exts = ['.ts', '.tsx', '.js', '.jsx']) {
  const ignoreDirs = new Set(['node_modules', '.next', 'dist', 'build', '.git']);
  const files = [];

  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.name.startsWith('.')) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (!ignoreDirs.has(e.name)) await walk(full);
      } else if (exts.includes(path.extname(e.name))) {
        files.push(full);
      }
    }
  }
  await walk(startDir);
  return files;
}

export async function readText(file) {
  return fs.readFile(file, 'utf8');
}

export function unique(arr) {
  return Array.from(new Set(arr));
}

export function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--')) {
      const [k, v] = a.split('=');
      const key = k.replace(/^--/, '');
      if (v !== undefined) opts[key] = v;
      else if (i + 1 < args.length && !args[i + 1].startsWith('--')) opts[key] = args[++i];
      else opts[key] = true;
    }
  }
  return opts;
}

