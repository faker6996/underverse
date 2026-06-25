import fs from 'fs';
import path from 'url';
import fileSystem from 'fs';
import pathModule from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = pathModule.dirname(__filename);

// Source directory for stickers in the package
const srcStickersDir = pathModule.resolve(__dirname, '../stickers');

// Possible public directory paths in the consuming application
const pathsToTry = [
  pathModule.resolve(__dirname, '../../../../public'), // Standard npm install path
  pathModule.resolve(__dirname, '../../../../../public'), // Monorepo install path
  pathModule.resolve(__dirname, '../../../public'),
  pathModule.resolve(__dirname, '../../public'), // Local dev environment path
];

let targetPublicDir = null;
for (const p of pathsToTry) {
  try {
    if (fileSystem.existsSync(p) && fileSystem.statSync(p).isDirectory()) {
      targetPublicDir = p;
      break;
    }
  } catch (e) {
    // Ignore error and try next path
  }
}

function copyDirRecursive(src, dest) {
  fileSystem.mkdirSync(dest, { recursive: true });
  const entries = fileSystem.readdirSync(src, { withFileTypes: true });

  let copiedCount = 0;
  for (const entry of entries) {
    const srcPath = pathModule.join(src, entry.name);
    const destPath = pathModule.join(dest, entry.name);

    if (entry.isDirectory()) {
      copiedCount += copyDirRecursive(srcPath, destPath);
    } else if (entry.isFile()) {
      fileSystem.copyFileSync(srcPath, destPath);
      copiedCount++;
    }
  }
  return copiedCount;
}

if (targetPublicDir && fileSystem.existsSync(srcStickersDir)) {
  const destStickersDir = pathModule.join(targetPublicDir, 'stickers');
  console.log(`[underverse] Automatically copying sticker assets to: ${destStickersDir}`);
  
  try {
    const copiedCount = copyDirRecursive(srcStickersDir, destStickersDir);
    console.log(`[underverse] Copied ${copiedCount} sticker assets successfully.`);
  } catch (err) {
    console.warn(`[underverse] Failed to automatically copy sticker assets: ${err.message}`);
  }
} else {
  console.log(`[underverse] Could not automatically locate target public/ directory. Please manually copy the 'stickers/' folder from '@underverse-ui/underverse/stickers' to your project's 'public/stickers' directory.`);
}
