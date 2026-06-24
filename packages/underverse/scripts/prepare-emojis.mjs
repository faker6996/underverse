import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Thư mục đích chứa emojis trong package
const destEmojisDir = path.resolve(__dirname, '../emojis');

// Các đường dẫn có khả năng chứa bộ ảnh nguồn từ gói emoji-datasource-apple (do hoisting)
const pathsToTry = [
  path.resolve(__dirname, '../node_modules/emoji-datasource-apple/img/apple/64'),
  path.resolve(__dirname, '../../../node_modules/emoji-datasource-apple/img/apple/64'),
];

let srcEmojisDir = null;
for (const p of pathsToTry) {
  try {
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) {
      srcEmojisDir = p;
      break;
    }
  } catch (e) {
    // Bỏ qua lỗi truy cập nếu có
  }
}

if (srcEmojisDir) {
  console.log(`[underverse] Preparing emojis for publish. Copying from: ${srcEmojisDir}`);
  try {
    fs.mkdirSync(destEmojisDir, { recursive: true });
    const files = fs.readdirSync(srcEmojisDir);
    let copiedCount = 0;
    
    for (const file of files) {
      if (file.endsWith('.png')) {
        const srcFile = path.join(srcEmojisDir, file);
        const destFile = path.join(destEmojisDir, file);
        fs.copyFileSync(srcFile, destFile);
        copiedCount++;
      }
    }
    console.log(`[underverse] Successfully prepared ${copiedCount} emojis in package emojis/ directory.`);
  } catch (err) {
    console.error(`[underverse] Failed to copy emojis for publish: ${err.message}`);
    process.exit(1);
  }
} else {
  console.error(`[underverse] Error: Could not locate 'emoji-datasource-apple' in node_modules. Please ensure it is installed.`);
  process.exit(1);
}
