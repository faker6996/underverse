import fileSystem from 'fs';
import pathModule from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = pathModule.dirname(__filename);

// Source directory for stickers in the package
const srcStickersDir = pathModule.resolve(__dirname, '../stickers');
const derivedVariantDirs = new Set(['thumb', 'display']);
const shouldCopyOriginals = process.env.UNDERVERSE_COPY_ORIGINAL_STICKERS === '1';

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

function copyDirRecursive(src, dest, options = {}) {
  fileSystem.mkdirSync(dest, { recursive: true });
  const entries = fileSystem.readdirSync(src, { withFileTypes: true });

  let copiedCount = 0;
  for (const entry of entries) {
    const srcPath = pathModule.join(src, entry.name);
    const destPath = pathModule.join(dest, entry.name);

    if (entry.isDirectory()) {
      if (options.includeOnlyDerived && !derivedVariantDirs.has(entry.name)) {
        copiedCount += copyDirRecursive(srcPath, destPath, options);
        continue;
      }
      if (options.skipDerived && derivedVariantDirs.has(entry.name)) {
        continue;
      }
      copiedCount += copyDirRecursive(srcPath, destPath, options);
    } else if (entry.isFile()) {
      if (options.includeOnlyDerived && pathModule.extname(entry.name) !== '.webp') {
        continue;
      }
      if (options.copyOnlyOriginals && pathModule.extname(entry.name) !== '.png') {
        continue;
      }
      fileSystem.copyFileSync(srcPath, destPath);
      copiedCount++;
    }
  }
  return copiedCount;
}

if (targetPublicDir && fileSystem.existsSync(srcStickersDir)) {
  const destStickersDir = pathModule.join(targetPublicDir, 'stickers');
  console.log(`[underverse] Automatically copying optimized sticker assets to: ${destStickersDir}`);
  
  try {
    let copiedCount = copyDirRecursive(srcStickersDir, destStickersDir, { includeOnlyDerived: true });

    if (shouldCopyOriginals) {
      copiedCount += copyDirRecursive(srcStickersDir, destStickersDir, { copyOnlyOriginals: true, skipDerived: true });
      console.log(`[underverse] Copied original PNG sticker assets because UNDERVERSE_COPY_ORIGINAL_STICKERS=1.`);
    }

    console.log(`[underverse] Copied ${copiedCount} sticker assets successfully.`);
  } catch (err) {
    console.warn(`[underverse] Failed to automatically copy sticker assets: ${err.message}`);
  }
} else {
  console.log(`[underverse] Could not automatically locate target public/ directory. Please manually copy the optimized 'stickers/' derivative folders from '@underverse-ui/underverse/stickers' to your project's 'public/stickers' directory.`);
}
