/**
 * Generates UEditor-HuongDanSuDung.pdf from the HTML guide template.
 * Run: node generate-pdf.mjs
 */
import { chromium } from "/Users/tran_van_bach/Desktop/project/nextJs/underverse/node_modules/@playwright/test/index.mjs";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const CHROME = "/Users/tran_van_bach/Library/Caches/ms-playwright/chromium-1208/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";
const __dir = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dir, "UEditor-HuongDanSuDung.html");
const pdfPath = path.join(__dir, "UEditor-HuongDanSuDung.pdf");

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();
await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle", timeout: 30000 });
await page.waitForTimeout(1500); // let images render

await page.pdf({
  path: pdfPath,
  format: "A4",
  margin: { top: "20mm", bottom: "20mm", left: "18mm", right: "18mm" },
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: `<div style="font-size:8px;color:#999;width:100%;text-align:center;font-family:sans-serif">Hướng Dẫn Sử Dụng UEditor — Underverse UI</div>`,
  footerTemplate: `<div style="font-size:8px;color:#999;width:100%;text-align:center;font-family:sans-serif">Trang <span class="pageNumber"></span> / <span class="totalPages"></span></div>`,
});

await browser.close();
console.log(`✅ PDF saved: ${pdfPath}`);
