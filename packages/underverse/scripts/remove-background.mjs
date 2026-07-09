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
    // Krillin pack (remaining 9 stickers to complete the pack)
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_krillin_fight_1783351278361.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_krillin/fight.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_krillin_solar_flare_1783351290171.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_krillin/solar_flare.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_krillin_happy_1783351298844.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_krillin/happy.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_krillin_shocked_1783351309008.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_krillin/shocked.png",
      bgColor: [0, 0, 0], // Force black background
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_krillin_injured_1783351318680.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_krillin/injured.png",
      bgColor: [255, 255, 255], // Force white background override
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_krillin_kamehameha_1783351360263.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_krillin/kamehameha.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_krillin_love_1783351373811.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_krillin/love.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_krillin_serious_1783351387584.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_krillin/serious.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_krillin_zen_1783351399591.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_krillin/zen.png",
    },
    // Master Roshi pack (remaining 9 stickers to complete the pack)
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_roshi_fight_1783584732694.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_roshi/fight.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_roshi_buff_1783584743404.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_roshi/buff.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_roshi_nosebleed_1783584751576.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_roshi/nosebleed.png",
      bgColor: [255, 255, 255], // Force white background override since the outline is very thick
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_roshi_kamehameha_1783584761737.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_roshi/kamehameha.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_roshi_laughing_1783584772207.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_roshi/laughing.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_roshi_wink_1783584895350.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_roshi/wink.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_roshi_peace_v2_1783584904734.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_roshi/peace_v2.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_roshi_thinking_1783585630520.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_roshi/thinking.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_roshi_sleeping_1783585640244.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_roshi/sleeping.png",
    },
    // Zamasu pack (10 stickers total)
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_zamasu_sinister_1783585649317.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_zamasu/sinister.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_zamasu_god_stance_1783585939183.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_zamasu/god_stance.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_zamasu_holy_wrath_1783585949211.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_zamasu/holy_wrath.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_zamasu_fusion_prep_1783585957064.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_zamasu/fusion_prep.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_zamasu_tears_1783585966034.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_zamasu/tears.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_zamasu_shocked_1783585977364.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_zamasu/shocked.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_zamasu_blade_1783586817060.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_zamasu/blade.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_zamasu_laughing_1783586825851.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_zamasu/laughing.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_zamasu_injured_1783586836770.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_zamasu/injured.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_zamasu_happy_1783586847502.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_zamasu/happy.png",
    },
    // Whis pack (10 stickers total)
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_whis_eating_1783586857200.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_whis/eating.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_whis_laughing_1783590986404.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_whis/laughing.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_whis_shocked_1783590997402.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_whis/shocked.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_whis_calm_1783591006640.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_whis/calm.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_whis_wink_1783591016210.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_whis/wink.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_whis_pointing_1783591061039.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_whis/pointing.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_whis_yawning_1783591070186.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_whis/yawning.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_whis_dodging_1783591080760.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_whis/dodging.png",
      bgColor: [0, 0, 0], // Force black background since there are energy trails
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_whis_sleeping_1783591090193.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_whis/sleeping.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_whis_sushi_1783591127251.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_whis/sushi.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_whis_tea_1783591349906.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_whis/tea.png",
      bgColor: [255, 255, 255], // Force white background override
    },
    // Shin pack (10 stickers total)
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_shin_shocked_1783591390472.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_shin/shocked.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_shin_fight_1783610372234.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_shin/fight.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_shin_telekinesis_1783610381227.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_shin/telekinesis.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_shin_happy_1783610389871.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_shin/happy.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_shin_scared_1783610400819.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_shin/scared.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_shin_thinking_1783610411000.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_shin/thinking.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_shin_potara_1783610443428.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_shin/potara.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_shin_katchin_1783610455909.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_shin/katchin.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_shin_angry_1783610464361.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_shin/angry.png",
    },
    {
      input: "/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_shin_zen_1783610473638.jpg",
      output: "/Users/tran_van_bach/Desktop/project/nextJs/underverse/packages/underverse/stickers/db_shin/zen.png",
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
