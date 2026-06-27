import fileSystem from "fs";
import pathModule from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = pathModule.dirname(__filename);
const stickersDir = pathModule.resolve(__dirname, "../stickers");

const variants = [
  { name: "thumb", size: 128, quality: 75 },
  { name: "display", size: 256, quality: 80 },
];

async function loadSharp() {
  try {
    const mod = await import("sharp");
    return mod.default;
  } catch (error) {
    throw new Error(
      `The sticker derivative build requires the optional dev dependency "sharp". Install it before running prepare-stickers. ${error.message}`,
    );
  }
}

function listPngStickers(dir) {
  const entries = fileSystem.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = pathModule.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (variants.some((variant) => variant.name === entry.name)) {
        continue;
      }
      files.push(...listPngStickers(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".png")) {
      files.push(fullPath);
    }
  }

  return files;
}

function getPackRelativePath(sourcePath) {
  const relative = pathModule.relative(stickersDir, sourcePath);
  const parts = relative.split(pathModule.sep);
  const fileName = parts.pop();
  const stickerId = fileName.replace(/\.png$/i, "");
  return {
    packPath: parts.join(pathModule.sep),
    stickerId,
  };
}

async function build() {
  if (!fileSystem.existsSync(stickersDir)) {
    throw new Error(`Sticker source directory not found: ${stickersDir}`);
  }

  const sharp = await loadSharp();
  const sourceFiles = listPngStickers(stickersDir);
  let written = 0;

  for (const sourceFile of sourceFiles) {
    const { packPath, stickerId } = getPackRelativePath(sourceFile);

    for (const variant of variants) {
      const outputDir = pathModule.join(stickersDir, packPath, variant.name);
      const outputFile = pathModule.join(outputDir, `${stickerId}.webp`);
      fileSystem.mkdirSync(outputDir, { recursive: true });

      await sharp(sourceFile)
        .resize({
          width: variant.size,
          height: variant.size,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: variant.quality })
        .toFile(outputFile);

      written++;
    }
  }

  console.log(`[underverse] Built ${written} optimized sticker assets from ${sourceFiles.length} source PNG files.`);
}

build().catch((error) => {
  console.error(`[underverse] Failed to build sticker derivatives: ${error.message}`);
  process.exitCode = 1;
});
