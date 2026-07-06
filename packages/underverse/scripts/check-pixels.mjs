import sharp from "sharp";

async function analyze(inputPath) {
  console.log(`=== Analyzing ${inputPath} ===`);
  const image = sharp(inputPath);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  
  const getRGB = (x, y) => {
    const idx = (y * width + x) * channels;
    return `(${data[idx]}, ${data[idx+1]}, ${data[idx+2]})`;
  };
  
  console.log("Top-Left (0,0):", getRGB(0, 0));
  console.log("Top-Right (w-1,0):", getRGB(width - 1, 0));
  console.log("Bottom-Left (0,h-1):", getRGB(0, height - 1));
  console.log("Bottom-Right (w-1,h-1):", getRGB(width - 1, height - 1));
  
  console.log("Sample Edge Top (w/2, 0):", getRGB(Math.floor(width/2), 0));
  console.log("Sample Edge Bottom (w/2, h-1):", getRGB(Math.floor(width/2), height - 1));
}

async function run() {
  await analyze("/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_frieza_kicked_1783266154475.jpg");
  await analyze("/Users/tran_van_bach/.gemini/antigravity/brain/39800cef-db21-4c96-8b70-e4bbef8c20ad/db_frieza_death_ball_1783266073026.jpg");
}

run().catch(console.error);
