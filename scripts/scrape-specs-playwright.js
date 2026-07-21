/**
 * Extrai especificações técnicas de todas as páginas de produto
 * do site teka.com/pt-pt usando Playwright (browser headless).
 * Clica nas secções colapsáveis para expandir e ler os valores.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const catalog = require(path.join(__dirname, '../src/data/catalog-with-urls.json'));
const SPECS_FILE = path.join(__dirname, '../src/data/product-specs.json');

// Load existing specs to resume if interrupted
let allSpecs = {};
if (fs.existsSync(SPECS_FILE)) {
  allSpecs = JSON.parse(fs.readFileSync(SPECS_FILE, 'utf-8'));
}

const SPEC_GROUPS = [
  'Medidas interiores', 'Medidas gerais', 'Características particulares',
  'Ligação elétrica', 'Consumo de energia', 'Sistema de segurança',
  'Sistema de limpeza', 'Acessórios', 'Eficiência energética',
  'Desempenho', 'Design', 'Funções', 'Motor', 'Iluminação',
  'Conectividade', 'Refrigerante', 'Capacidade', 'Dimensões',
  'Tecnologia', 'Material', 'Instalação',
];

async function extractSpecs(page, url, sku) {
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(3000);

    // Click on all spec group headers to expand them
    for (const group of SPEC_GROUPS) {
      try {
        const el = page.locator(`text="${group}"`).first();
        if (await el.isVisible({ timeout: 500 })) {
          await el.click({ timeout: 1000 });
          await page.waitForTimeout(300);
        }
      } catch {}
    }

    await page.waitForTimeout(1500);

    // Extract all visible text and parse specs
    const text = await page.innerText('body');
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

    // Find spec section boundaries
    const startIdx = lines.findIndex(l => /^(Medidas interiores|Medidas gerais|Características|Capacidade|Dimensões|Desempenho)$/i.test(l));
    const endIdx = lines.findIndex((l, i) => i > startIdx && /^(Documentação|Complete o seu|Produtos relacionados)$/i.test(l));

    if (startIdx === -1) return null;
    const end = endIdx > startIdx ? endIdx : Math.min(startIdx + 100, lines.length);

    const specs = [];
    let currentGroup = '';

    for (let i = startIdx; i < end; i++) {
      const line = lines[i];

      // Check if this is a group header (no colon, short text)
      if (SPEC_GROUPS.some(g => g.toLowerCase() === line.toLowerCase()) ||
          (!line.includes(':') && line.length < 40 && line.length > 3 && !/^(Sim|Não|[0-9])/.test(line))) {
        currentGroup = line;
        continue;
      }

      // Parse "Label: Value" or "Label : Value"
      const match = line.match(/^(.+?)\s*:\s*(.+)$/);
      if (match) {
        const label = match[1].trim();
        const value = match[2].trim();
        if (label.length > 2 && label.length < 80 && value.length < 200) {
          specs.push({ label, value, group: currentGroup });
        }
      }
    }

    return specs.length > 0 ? specs : null;
  } catch (e) {
    return null;
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  });

  // Use 3 pages in parallel
  const pages = await Promise.all([context.newPage(), context.newPage(), context.newPage()]);

  const toProcess = catalog.filter(p => !allSpecs[p.sku]);
  console.log(`Total: ${catalog.length}, Already done: ${Object.keys(allSpecs).length}, To process: ${toProcess.length}\n`);

  let processed = 0;
  let withSpecs = Object.keys(allSpecs).length;

  for (let i = 0; i < toProcess.length; i += 3) {
    const batch = toProcess.slice(i, i + 3);
    const results = await Promise.all(batch.map(async (item, j) => {
      const specs = await extractSpecs(pages[j], item.tekaUrl, item.sku);
      return { sku: item.sku, specs };
    }));

    results.forEach(({ sku, specs }) => {
      if (specs) {
        allSpecs[sku] = specs;
        withSpecs++;
      }
      processed++;
    });

    // Save every 30 products
    if (processed % 30 === 0 || i + 3 >= toProcess.length) {
      fs.writeFileSync(SPECS_FILE, JSON.stringify(allSpecs, null, 2));
    }

    process.stderr.write(`  ${processed}/${toProcess.length} processed (${withSpecs} with specs)\r`);
  }

  await browser.close();

  // Final save
  fs.writeFileSync(SPECS_FILE, JSON.stringify(allSpecs, null, 2));

  console.log(`\n\nDone!`);
  console.log(`Products with specs: ${Object.keys(allSpecs).length}`);

  // Stats
  const avgSpecs = Object.values(allSpecs).reduce((sum, s) => sum + s.length, 0) / Object.keys(allSpecs).length;
  console.log(`Average specs per product: ${avgSpecs.toFixed(1)}`);
}

main().catch(console.error);
