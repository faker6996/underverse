import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

/**
 * Parses command line arguments.
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    input: '',
    output: '',
    threshold: 30,
    smooth: 15,
    bgColor: null,
    trim: true,
    flood: true, // Default to using BFS connected flood-fill
    seedThreshold: 25, // Distance threshold to auto-detect background seed pixels
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-i' || arg === '--input') {
      options.input = args[++i];
    } else if (arg === '-o' || arg === '--output') {
      options.output = args[++i];
    } else if (arg === '-t' || arg === '--threshold') {
      options.threshold = parseFloat(args[++i]);
    } else if (arg === '-s' || arg === '--smooth') {
      options.smooth = parseFloat(args[++i]);
    } else if (arg === '-c' || arg === '--color') {
      options.bgColor = args[++i];
    } else if (arg === '--no-trim') {
      options.trim = false;
    } else if (arg === '--simple') {
      options.flood = false;
    } else if (arg === '--seed-threshold') {
      options.seedThreshold = parseFloat(args[++i]);
    }
  }

  return options;
}

/**
 * Converts a hex color string to RGB.
 */
function hexToRgb(hex) {
  const cleanHex = hex.replace(/^#/, '');
  const bigint = parseInt(cleanHex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

/**
 * Calculates Euclidean distance between two RGB colors.
 */
function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

/**
 * Checks if a color matches the dominant channel characteristics of the background.
 * For chroma-key backdrops (like green-screen), this prevents neutral highlighted regions
 * from being erroneously keyed out.
 */
function matchesDominantChannel(r, g, b, bgR, bgG, bgB) {
  const maxBg = Math.max(bgR, bgG, bgB);
  const minBg = Math.min(bgR, bgG, bgB);
  
  // If the background is highly saturated chromatic color (like chroma key green/blue/red)
  if (maxBg - minBg > 50) {
    if (bgG === maxBg && bgG > bgR * 1.2 && bgG > bgB * 1.2) {
      // Green dominant background
      return g > r * 1.15 && g > b * 1.15 && g > 35;
    }
    if (bgB === maxBg && bgB > bgR * 1.2 && bgB > bgG * 1.2) {
      // Blue dominant background
      return b > r * 1.15 && b > g * 1.15 && b > 35;
    }
    if (bgR === maxBg && bgR > bgG * 1.2 && bgR > bgB * 1.2) {
      // Red dominant background
      return r > g * 1.15 && r > b * 1.15 && r > 35;
    }
  }
  
  // Fallback to true if background is neutral (black, white, gray)
  return true;
}

async function main() {
  const options = parseArgs();

  if (!options.input) {
    console.error('Error: Please specify an input file using -i or --input');
    process.exit(1);
  }

  if (!fs.existsSync(options.input)) {
    console.error(`Error: Input file does not exist: ${options.input}`);
    process.exit(1);
  }

  const outputPath = options.output || options.input.replace(/\.[^/.]+$/, '') + '_transparent.png';

  try {
    console.log(`[bg-remover] Loading image: ${options.input}`);
    const image = sharp(options.input);
    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
    
    const width = info.width;
    const height = info.height;
    const channels = info.channels;
    
    let bgR, bgG, bgB;

    if (options.bgColor) {
      const rgb = hexToRgb(options.bgColor);
      bgR = rgb.r;
      bgG = rgb.g;
      bgB = rgb.b;
      console.log(`[bg-remover] Using specified background color: RGB(${bgR}, ${bgG}, ${bgB})`);
    } else {
      // Auto-detect background color by sampling the 4 corners
      const corners = [
        getPixel(data, 0, 0, width, channels),
        getPixel(data, width - 1, 0, width, channels),
        getPixel(data, 0, height - 1, width, channels),
        getPixel(data, width - 1, height - 1, width, channels),
      ];

      // Average the corner colors
      bgR = Math.round(corners.reduce((sum, p) => sum + p.r, 0) / corners.length);
      bgG = Math.round(corners.reduce((sum, p) => sum + p.g, 0) / corners.length);
      bgB = Math.round(corners.reduce((sum, p) => sum + p.b, 0) / corners.length);
      console.log(`[bg-remover] Auto-detected background color from corners: RGB(${bgR}, ${bgG}, ${bgB})`);
    }

    const threshold = options.threshold;
    const smooth = options.smooth;

    let isBackground;

    if (options.flood) {
      console.log(`[bg-remover] Performing auto-seeded BFS connected flood-fill mask...`);
      isBackground = new Uint8Array(width * height);
      const queue = [];

      // Scan the entire image to find all seed pixels close to the background color.
      // This allows disconnected pockets (like between legs or inside hair loops) to be seeded.
      let seedsFound = 0;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const pixel = getPixel(data, x, y, width, channels);
          const dist = colorDistance(pixel.r, pixel.g, pixel.b, bgR, bgG, bgB);
          
          // Seed if it is close in distance AND matches the dominant color channel profile
          if (dist <= options.seedThreshold && matchesDominantChannel(pixel.r, pixel.g, pixel.b, bgR, bgG, bgB)) {
            const idx = y * width + x;
            isBackground[idx] = 1;
            queue.push({ x, y });
            seedsFound++;
          }
        }
      }
      
      // Also add any borders that are within threshold+smooth
      for (let x = 0; x < width; x++) {
        addSeed(x, 0);
        addSeed(x, height - 1);
      }
      for (let y = 1; y < height - 1; y++) {
        addSeed(0, y);
        addSeed(width - 1, y);
      }

      function addSeed(x, y) {
        const idx = y * width + x;
        if (isBackground[idx] === 0) {
          const pixel = getPixel(data, x, y, width, channels);
          const dist = colorDistance(pixel.r, pixel.g, pixel.b, bgR, bgG, bgB);
          if (dist <= threshold + smooth && matchesDominantChannel(pixel.r, pixel.g, pixel.b, bgR, bgG, bgB)) {
            isBackground[idx] = 1;
            queue.push({ x, y });
          }
        }
      }

      console.log(`[bg-remover] Auto-seeded ${seedsFound} background pixels. Propagating...`);

      let head = 0;
      while (head < queue.length) {
        const { x, y } = queue[head++];
        
        const neighbors = [
          { x: x - 1, y },
          { x: x + 1, y },
          { x, y: y - 1 },
          { x, y: y + 1 }
        ];

        for (const n of neighbors) {
          if (n.x >= 0 && n.x < width && n.y >= 0 && n.y < height) {
            const nIdx = n.y * width + n.x;
            if (isBackground[nIdx] === 0) {
              const pixel = getPixel(data, n.x, n.y, width, channels);
              const dist = colorDistance(pixel.r, pixel.g, pixel.b, bgR, bgG, bgB);
              
              if (dist <= threshold + smooth && matchesDominantChannel(pixel.r, pixel.g, pixel.b, bgR, bgG, bgB)) {
                isBackground[nIdx] = 1;
                queue.push(n);
              }
            }
          }
        }
      }
    } else {
      console.log(`[bg-remover] Performing simple per-pixel color keying (recommended for clean chroma-key)...`);
    }

    // Create a new buffer for RGBA (4 channels)
    const outBuffer = Buffer.alloc(width * height * 4);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idxIn = (y * width + x) * channels;
        const idxOut = (y * width + x) * 4;

        const r = data[idxIn];
        const g = data[idxIn + 1];
        const b = data[idxIn + 2];
        const originalAlpha = channels === 4 ? data[idxIn + 3] : 255;

        const idx = y * width + x;
        let alpha = originalAlpha;

        const dist = colorDistance(r, g, b, bgR, bgG, bgB);

        // A pixel is background if it matches the flood mask (or simple mode) AND has dominant channel match
        if ((!options.flood || isBackground[idx] === 1) && matchesDominantChannel(r, g, b, bgR, bgG, bgB)) {
          if (dist <= threshold) {
            alpha = 0;
          } else if (dist > threshold + smooth) {
            alpha = originalAlpha;
          } else {
            // Linear interpolation for smooth transition/feathering
            const ratio = (dist - threshold) / smooth;
            alpha = Math.round(ratio * originalAlpha);
          }
        }

        outBuffer[idxOut] = r;
        outBuffer[idxOut + 1] = g;
        outBuffer[idxOut + 2] = b;
        outBuffer[idxOut + 3] = alpha;
      }
    }

    console.log(`[bg-remover] Saving transparent PNG to: ${outputPath}`);
    let processedImage = sharp(outBuffer, {
      raw: {
        width,
        height,
        channels: 4,
      },
    });

    if (options.trim) {
      processedImage = processedImage.trim();
    }

    await processedImage.png().toFile(outputPath);
    console.log(`[bg-remover] Done! Background removed successfully.`);
  } catch (err) {
    console.error(`[bg-remover] Failed to remove background: ${err.message}`);
    process.exit(1);
  }
}

/**
 * Safely retrieves RGB values for a pixel in the buffer.
 */
function getPixel(buffer, x, y, width, channels) {
  const idx = (y * width + x) * channels;
  return {
    r: buffer[idx],
    g: buffer[idx + 1],
    b: buffer[idx + 2],
  };
}

main();
