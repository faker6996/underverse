#!/usr/bin/env node
import { execSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import process from 'node:process';

function run(cmd, opts = {}) {
  console.log(`$ ${cmd}`);
  return execSync(cmd, { stdio: 'inherit', ...opts });
}

function parseArgs(argv) {
  const out = { bump: 'patch', tag: null };
  for (const a of argv.slice(2)) {
    if ([
      'patch','minor','major','prerelease','prepatch','preminor','premajor'
    ].includes(a)) {
      out.bump = a;
      continue;
    }
    if (a.startsWith('--tag=')) {
      out.tag = a.slice('--tag='.length);
      continue;
    }
  }
  return out;
}

async function main() {
  // Ensure running inside the package dir
  const pkgDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
  process.chdir(pkgDir);
  const cleanTarballs = () => {
    try {
      const files = fs.readdirSync(pkgDir);
      for (const f of files) {
        if (f.endsWith('.tgz')) {
          fs.unlinkSync(path.join(pkgDir, f));
          console.log(`Removed tarball: ${f}`);
        }
      }
    } catch (e) {
      // ignore
    }
  };

  const { bump, tag } = parseArgs(process.argv);
  console.log(`Release starting in ${pkgDir}`);

  // Check npm auth (optional)
  try {
    run('npm whoami');
  } catch {
    console.warn('! Not logged in to npm. Run `npm login` before releasing.');
    process.exit(1);
  }

  // Clean any leftover tarballs (from npm pack)
  cleanTarballs();

  // Install deps (idempotent)
  try {
    run('npm install');
  } catch {}

  // Bump version without creating git tag
  run(`npm version ${bump} --no-git-tag-version`);

  // Optional: build explicitly (prepublishOnly also builds)
  run('npm run build');

  // Publish
  const publishCmd = `npm publish --access public${tag ? ` --tag ${tag}` : ''}`;
  run(publishCmd);

  // Clean tarballs again just in case
  cleanTarballs();

  console.log('Release completed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
