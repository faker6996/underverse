/**
 * Generates UEditor-HuongDanSuDung.pdf from the HTML guide template.
 * Run: node generate-pdf.mjs
 */
import { chromium } from "@playwright/test";
import { fileURLToPath } from "url";
import path from "path";

const __dir = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dir, "UEditor-HuongDanSuDung.html");
const pdfPath = path.join(__dir, "UEditor-HuongDanSuDung.pdf");

const launchOptions = { headless: true };
if (process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH) {
  launchOptions.executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;
}

const browser = await chromium.launch(launchOptions);
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
