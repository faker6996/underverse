import fs from "fs";
import path from "path";
import sharp from "sharp";

async function removeBackground(inputPath, outputPath, overrideBgColor = null) {
  console.log(`Processing ${inputPath}...`);
  const image = sharp(inputPath);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // We want to create an RGBA output buffer
  const outBuffer = Buffer.alloc(width * height * 4);

  // Initialize outBuffer with original pixels (copying RGB, setting alpha to 255)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idxRaw = (y * width + x) * channels;
      const idxOut = (y * width + x) * 4;

      outBuffer[idxOut] = data[idxRaw];     // R
      outBuffer[idxOut + 1] = data[idxRaw + 1]; // G
      outBuffer[idxOut + 2] = data[idxRaw + 2]; // B
      outBuffer[idxOut + 3] = 255;          // A
    }
  }

  // Get background color from corner (0, 0)
  const cornerIdx = 0;
  const bgR = overrideBgColor ? overrideBgColor[0] : data[cornerIdx];
  const bgG = overrideBgColor ? overrideBgColor[1] : data[cornerIdx + 1];
  const bgB = overrideBgColor ? overrideBgColor[2] : data[cornerIdx + 2];
  console.log(`Detected background color: RGB(${bgR}, ${bgG}, ${bgB})`);

  // Flood fill from all 4 corners to find background pixels
  const visited = new Uint8Array(width * height);
  const queue = [];

  const addPoint = (x, y) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;

    const idxRaw = idx * channels;
    const r = data[idxRaw];
    const g = data[idxRaw + 1];
    const b = data[idxRaw + 2];

    // Calculate Euclidean distance in RGB space
    const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
    // Threshold: if close enough to background color, mark as background
    const threshold = 45; 

    if (dist <= threshold) {
      visited[idx] = 1;
      queue.push(x, y);
    }
  };

  // Add all 4 corners
  addPoint(0, 0);
  addPoint(width - 1, 0);
  addPoint(0, height - 1);
  addPoint(width - 1, height - 1);

  // Add entire border pixels to make sure we catch everything
  for (let x = 0; x < width; x++) {
    addPoint(x, 0);
    addPoint(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    addPoint(0, y);
    addPoint(width - 1, y);
  }

  // BFS Queue loop
  let head = 0;
  while (head < queue.length) {
    const x = queue[head++];
    const y = queue[head++];

    // Check 4 neighbors
    addPoint(x + 1, y);
    addPoint(x - 1, y);
    addPoint(x, y + 1);
    addPoint(x, y - 1);
  }

  // Now, set alpha to 0 for all visited pixels
  let transparentCount = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (visited[idx]) {
        const idxOut = idx * 4;
        outBuffer[idxOut + 3] = 0; // Alpha = 0 (Transparent)
        transparentCount++;
      }
    }
  }

  console.log(`Made ${transparentCount} pixels transparent out of ${width * height}`);

  // Create folder if it doesn't exist
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  // Save the result using sharp
  await sharp(outBuffer, {
    raw: {
      width,
      height,
      channels: 4,
    },
  })
    .png()
    .toFile(outputPath);

  console.log(`Saved transparent PNG to ${outputPath}\n`);
}

async function run() {
  const images = [
    // Goku Black pack (remaining 6 stickers)
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_goku_black_angry_1783169404126.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_goku_black/angry.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_goku_black_glare_1783169416550.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_goku_black/glare.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_goku_black_pain_1783169427314.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_goku_black/pain.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_goku_black_scythe_1783169464094.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_goku_black/cloning.png", // naming it cloning as per the plan
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_goku_black_confident_1783169483890.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_goku_black/confident.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_goku_black_pointing_1783169514846.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_goku_black/pointing.png",
    },
  ];

  for (const img of images) {
    if (fs.existsSync(img.input)) {
      await removeBackground(img.input, img.output, img.bgColor);
    } else {
      console.warn(`File not found: ${img.input}`);
    }
  }
  console.log("All done!");
}

run().catch(console.error);
