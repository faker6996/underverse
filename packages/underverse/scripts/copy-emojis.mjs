import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Thư mục chứa emoji nguồn trong package
const srcEmojisDir = path.resolve(__dirname, '../emojis');

// Các đường dẫn có khả năng là thư mục public của dự án tiêu thụ
const pathsToTry = [
  path.resolve(__dirname, '../../../../public'), // Cài đặt tiêu chuẩn: node_modules/@underverse-ui/underverse/scripts -> dự án
  path.resolve(__dirname, '../../../../../public'), // Monorepo / Cài đặt lồng nhau
  path.resolve(__dirname, '../../../public'),
  path.resolve(__dirname, '../../public'), // Môi trường dev local
];

let targetPublicDir = null;
for (const p of pathsToTry) {
  try {
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) {
      targetPublicDir = p;
      break;
    }
  } catch (e) {
    // Bỏ qua lỗi truy cập nếu có
  }
}

if (targetPublicDir && fs.existsSync(srcEmojisDir)) {
  const destEmojisDir = path.join(targetPublicDir, 'emojis');
  console.log(`[underverse] Automatically copying emoji assets to: ${destEmojisDir}`);
  
  try {
    fs.mkdirSync(destEmojisDir, { recursive: true });
    const files = fs.readdirSync(srcEmojisDir);
    let copiedCount = 0;
    
    for (const file of files) {
      const srcFile = path.join(srcEmojisDir, file);
      const destFile = path.join(destEmojisDir, file);
      if (fs.statSync(srcFile).isFile()) {
        fs.copyFileSync(srcFile, destFile);
        copiedCount++;
      }
    }
    console.log(`[underverse] Copied ${copiedCount} emoji assets successfully.`);
  } catch (err) {
    console.warn(`[underverse] Failed to automatically copy emoji assets: ${err.message}`);
  }
} else {
  console.log(`[underverse] Could not automatically locate target public/ directory. Please manually copy the 'emojis/' folder from '@underverse-ui/underverse/emojis' to your project's 'public/emojis' directory.`);
}
