const { chromium } = require('@playwright/test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const base = process.env.APP_URL || 'http://127.0.0.1:3000';
const executablePath = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].find((path) => fs.existsSync(path));

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath });
  try {
    const page = await browser.newPage();
    await page.goto(base + '/login');
    await page.locator('#username').fill('manager');
    await page.locator('#password').fill('123456');
    await page.locator('#login-form button').click();
    await page.waitForURL('**/dashboard');
    await page.route('**/api/v1/stocktakes/99100/warehouses/99101/lines', (route) =>
      route.fulfill({
        json: {
          data: {
            id: '99101',
            warehouse_name: 'Kho nguyên vật liệu',
            status: 'COUNTING',
            lines: [
              {
                id: '99102',
                item_id: '99103',
                item_name: 'Bột mì',
                lot_id: '99104',
                lot_code: 'NVL-TAM-ANH-BOT-MI-001',
                location_id: '99105',
                location_code: 'B10',
                location_name: 'Ô B10',
                unit_name: 'kg',
                quality_bucket: 'AVAILABLE',
                system_quantity: '35.000',
                actual_quantity: null,
                version: 1,
              },
            ],
          },
        },
      }),
    );
    await page.evaluate(() => countForm({ id: '99100' }, '99101'));
    const body = page.locator('#modal');
    await body.getByText('Kho nguyên vật liệu').waitFor();
    const text = await body.innerText();
    for (const expected of ['Bột mì', 'NVL-TAM-ANH-BOT-MI-001', 'B10', 'kg', 'Khả dụng'])
      assert.ok(text.includes(expected), `Expected readable value: ${expected}`);
    for (const internalId of ['99101', '99103', '99104', '99105'])
      assert.ok(!text.includes(internalId), `Internal ID must not be shown: ${internalId}`);
    await page.goto(base + '/reports/inventory');
    const warehouseFilter = page.locator('#warehouse_id');
    await warehouseFilter.waitFor();
    const warehouseOptions = await warehouseFilter.locator('option').allTextContents();
    assert.ok(warehouseOptions.length > 1, 'Warehouse report filter must offer named warehouses');
    assert.ok(warehouseOptions.slice(1).every((name) => !/^\d+$/.test(name.trim())));
    console.log('PASS: stocktake count form shows workshop-facing names, lot code, storage cell, unit, and translated quality; raw record IDs remain hidden.');
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
