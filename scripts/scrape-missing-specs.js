/**
 * Re-scrape specs for the 107 products that are missing.
 * Uses longer timeouts and more aggressive section expansion.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const catalog = require(path.join(__dirname, '../src/data/catalog-with-urls.json'));
const SPECS_FILE = path.join(__dirname, '../src/data/product-specs.json');
const specs = JSON.parse(fs.readFileSync(SPECS_FILE, 'utf-8'));

const GROUPS = [
  'Medidas interiores', 'Medidas gerais', 'Características particulares',
  'Ligação elétrica', 'Consumo de energia', 'Sistema de segurança',
  'Sistema de limpeza', 'Acessórios', 'Eficiência energética',
  'Desempenho', 'Design', 'Motor', 'Instalação', 'Capacidade',
  'Medidas', 'Dimensões', 'Potência',
];

const missing = catalog.filter(p => !specs[p.sku]);
console.log(`Missing specs: ${missing.length}\n`);

async function extractSpecs(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
  await page.waitForTimeout(6000);

  // Click "Especificações" tab if exists
  try { await page.click('text=Especificações', { timeout: 2000 }); } catch {}
  await page.waitForTimeout(1000);

  // Click all group headers
  for (const group of GROUPS) {
    try {
      const el = page.locator(`text="${group}"`).first();
      if (await el.isVisible({ timeout: 300 })) {
        await el.click({ timeout: 500 });
        await page.waitForTimeout(200);
      }
    } catch {}
  }
  await page.waitForTimeout(1500);

  const text = await page.innerText('body');
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  const startIdx = lines.findIndex(l =>
    GROUPS.some(g => g.toLowerCase() === l.toLowerCase())
  );
  if (startIdx === -1) return null;

  const endIdx = lines.findIndex((l, i) =>
    i > startIdx && /^(Documentação|Complete o seu|Produtos relacionados)$/i.test(l)
  );
  const end = endIdx > startIdx ? endIdx : Math.min(startIdx + 120, lines.length);

  const results = [];
  let currentGroup = '';

  for (let i = startIdx; i < end; i++) {
    const line = lines[i];
    if (GROUPS.some(g => g.toLowerCase() === line.toLowerCase())) {
      currentGroup = line;
      continue;
    }
    const match = line.match(/^(.+?)\s*:\s*(.+)$/);
    if (match) {
      const label = match[1].trim();
      const value = match[2].trim();
      if (label.length > 2 && label.length < 80 && value.length < 200) {
        results.push({ label, value, group: currentGroup });
      }
    }
  }

  return results.length > 0 ? results : null;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  let scraped = 0;

  for (let i = 0; i < missing.length; i++) {
    const item = missing[i];
    try {
      const result = await extractSpecs(page, item.tekaUrl);
      if (result) {
        specs[item.sku] = result;
        scraped++;
      }
    } catch {}

    if ((i + 1) % 10 === 0 || i === missing.length - 1) {
      fs.writeFileSync(SPECS_FILE, JSON.stringify(specs, null, 2));
      process.stderr.write(`  ${i + 1}/${missing.length} (${scraped} scraped)\r`);
    }
  }

  await browser.close();
  fs.writeFileSync(SPECS_FILE, JSON.stringify(specs, null, 2));
  console.log(`\n\nDone! Scraped ${scraped}/${missing.length} missing products`);
  console.log(`Total products with specs: ${Object.keys(specs).length}`);
}

main().catch(console.error);
