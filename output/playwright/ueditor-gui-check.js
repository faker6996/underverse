const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/google-chrome' }).catch(() => chromium.launch({ headless: true }));
  const page = await browser.newPage({ viewport: { width: 1600, height: 1400 } });
  const logs = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.type() === 'warning') {
      logs.push(msg.type() + ': ' + msg.text());
    }
  });

  await page.goto('http://localhost:3001/vi/docs/underverse#ueditor', { waitUntil: 'networkidle' });

  const section = page.locator('#ueditor');
  const card = section.locator('.space-y-3').filter({ has: page.getByText('Notion Style', { exact: true }) }).first();
  await card.scrollIntoViewIfNeeded();

  const editorRoot = card.locator('.ProseMirror').first();
  const table = editorRoot.locator('table').first();
  await table.locator('tr').nth(1).locator('td').first().click();

  const before = await table.evaluate((tableEl) => ({
    rows: Array.from(tableEl.rows).map((row) => Array.from(row.cells).map((cell) => cell.textContent?.trim() || '')),
    rowCount: tableEl.rows.length,
    colCount: tableEl.rows[0]?.cells.length || 0,
  }));

  const buttonLabels = await card.locator('button[aria-label]').evaluateAll((els) => els.map((el) => el.getAttribute('aria-label')));

  const rowHandle = card.getByRole('button', { name: /Kéo hàng 2|Drag Row 2/i }).first();
  const colHandle = card.getByRole('button', { name: /Kéo cột 1|Drag Column 1/i }).first();
  const expandHandle = card.getByRole('button', { name: /Mở rộng bảng|Expand Table/i }).first();

  async function dragAndRead(locator, moveX, moveY) {
    const box = await locator.boundingBox();
    if (box == null) return null;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + moveX, box.y + box.height / 2 + moveY, { steps: 16 });
    const statuses = await card.getByRole('status').allTextContents().catch(() => []);
    await page.mouse.up();
    return { box, statuses };
  }

  const rowDrag = await dragAndRead(rowHandle, 0, 120);
  await table.locator('tr').nth(1).locator('td').first().click();
  const colDrag = await dragAndRead(colHandle, 220, 0);
  await table.locator('tr').nth(1).locator('td').first().click();
  const expandDrag = await dragAndRead(expandHandle, 220, 140);

  const after = await table.evaluate((tableEl) => ({
    rows: Array.from(tableEl.rows).map((row) => Array.from(row.cells).map((cell) => cell.textContent?.trim() || '')),
    rowCount: tableEl.rows.length,
    colCount: tableEl.rows[0]?.cells.length || 0,
  }));

  await page.screenshot({ path: 'output/playwright/ueditor-table-gui-scoped.png', fullPage: true });
  console.log(JSON.stringify({ before, after, rowDrag, colDrag, expandDrag, buttonLabels, logs: logs.slice(0, 20) }, null, 2));
  await browser.close();
})();
