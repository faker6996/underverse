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

    // Create a new buffer for RGBA (4 channels)
    const outBuffer = Buffer.alloc(width * height * 4);
    const threshold = options.threshold;
    const smooth = options.smooth;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idxIn = (y * width + x) * channels;
        const idxOut = (y * width + x) * 4;

        const r = data[idxIn];
        const g = data[idxIn + 1];
        const b = data[idxIn + 2];
        const originalAlpha = channels === 4 ? data[idxIn + 3] : 255;

        const dist = colorDistance(r, g, b, bgR, bgG, bgB);
        let alpha = 255;

        if (dist <= threshold) {
          alpha = 0;
        } else if (dist > threshold + smooth) {
          alpha = originalAlpha;
        } else {
          // Linear interpolation for smooth transition/feathering
          const ratio = (dist - threshold) / smooth;
          alpha = Math.round(ratio * originalAlpha);
        }

        outBuffer[idxOut] = r;
        outBuffer[idxOut + 1] = g;
        outBuffer[idxOut + 2] = b;
        outBuffer[idxOut + 3] = alpha;
      }
    }

    console.log(`[bg-remover] Processing transparency & saving to: ${outputPath}`);
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
