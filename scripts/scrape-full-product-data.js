/**
 * Extrai dados COMPLETOS de cada produto do site teka.com/pt-pt:
 * - Todas as imagens HD (product + lifestyle)
 * - Vídeos YouTube
 * - Ícones SVG de features
 * - Desenho técnico
 * - Etiqueta energética
 * - Nome completo e cor
 * - Descrição do produto
 * - Produtos relacionados
 *
 * Usa Playwright com 3 tabs em paralelo.
 * Salva resultados incrementalmente.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const catalog = require(path.join(__dirname, '../src/data/catalog-with-urls.json'));
const OUTPUT = path.join(__dirname, '../src/data/product-full-data.json');

let allData = {};
if (fs.existsSync(OUTPUT)) {
  allData = JSON.parse(fs.readFileSync(OUTPUT, 'utf-8'));
}

async function extractProduct(page, url, sku) {
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(3000);

    return await page.evaluate((productSku) => {
      const r = {};

      // Names
      r.shortName = document.querySelector('[data-short-product-name]')?.getAttribute('data-short-product-name') || '';
      r.fullName = document.querySelector('[data-product-name]')?.getAttribute('data-product-name') || '';
      r.color = document.querySelector('[data-color]')?.getAttribute('data-color') || '';

      // ALL images (fullscreen HD) - both product and lifestyle
      r.productImages = [];
      r.lifestyleImages = [];
      document.querySelectorAll('[data-fullscreen]').forEach(el => {
        const url = el.getAttribute('data-fullscreen');
        if (!url) return;
        if (url.includes(productSku)) {
          r.productImages.push(url);
        } else if (!url.includes('Drawing')) {
          r.lifestyleImages.push(url);
        }
      });

      // Also get data-normal images as backup
      if (r.productImages.length === 0) {
        document.querySelectorAll('[data-normal]').forEach(el => {
          const url = el.getAttribute('data-normal');
          if (url && url.includes(productSku)) r.productImages.push(url);
        });
      }

      // Also check data-src for product images
      document.querySelectorAll('img[data-src]').forEach(el => {
        const src = el.getAttribute('data-src');
        if (src && src.includes(productSku) && src.includes('teka.b-cdn.net') && !r.productImages.includes(src)) {
          r.productImages.push(src);
        }
      });

      // Feature icons (SVG)
      r.featureIcons = [];
      document.querySelectorAll('img[data-src]').forEach(el => {
        const src = el.getAttribute('data-src');
        if (src && src.endsWith('.svg')) r.featureIcons.push(src);
      });

      // Videos (YouTube)
      r.videos = [];
      document.querySelectorAll('a[href]').forEach(el => {
        if (el.href && el.href.includes('youtube.com/watch') && !r.videos.includes(el.href)) {
          r.videos.push(el.href);
        }
      });

      // Drawing
      r.drawing = '';
      document.querySelectorAll('img[data-src]').forEach(el => {
        const src = el.getAttribute('data-src');
        if (src && /Drawing/i.test(src)) r.drawing = src;
      });

      // Energy label image
      r.energyLabel = '';
      document.querySelectorAll('img[data-src]').forEach(el => {
        const src = el.getAttribute('data-src');
        if (src && /energy/i.test(src) && src.endsWith('.jpg')) r.energyLabel = src;
      });

      // Related product SKUs (from the page)
      r.relatedSkus = [];
      const seen = new Set();
      document.querySelectorAll('[data-product-sku]').forEach(el => {
        const s = el.getAttribute('data-product-sku');
        if (s && s !== productSku && !seen.has(s)) {
          seen.add(s);
          r.relatedSkus.push(s);
        }
      });

      return r;
    }, sku);
  } catch {
    return null;
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  });
  const pages = await Promise.all([context.newPage(), context.newPage(), context.newPage()]);

  const toProcess = catalog.filter(p => !allData[p.sku]);
  console.log(`Total: ${catalog.length}, Done: ${Object.keys(allData).length}, To process: ${toProcess.length}\n`);

  let processed = 0;
  let withData = Object.keys(allData).length;

  for (let i = 0; i < toProcess.length; i += 3) {
    const batch = toProcess.slice(i, i + 3);
    const results = await Promise.all(batch.map(async (item, j) => {
      const data = await extractProduct(pages[j], item.tekaUrl, item.sku);
      return { sku: item.sku, data };
    }));

    results.forEach(({ sku, data }) => {
      if (data && (data.productImages.length > 0 || data.fullName)) {
        allData[sku] = data;
        withData++;
      }
      processed++;
    });

    if (processed % 30 === 0 || i + 3 >= toProcess.length) {
      fs.writeFileSync(OUTPUT, JSON.stringify(allData, null, 2));
    }

    process.stderr.write(`  ${processed}/${toProcess.length} (${withData} with data)\r`);
  }

  await browser.close();
  fs.writeFileSync(OUTPUT, JSON.stringify(allData, null, 2));

  // Stats
  let totalImgs = 0, totalVids = 0, totalIcons = 0, totalDrawings = 0;
  Object.values(allData).forEach(d => {
    totalImgs += (d.productImages?.length || 0);
    totalVids += (d.videos?.length || 0);
    totalIcons += (d.featureIcons?.length || 0);
    if (d.drawing) totalDrawings++;
  });

  console.log(`\n\nDone! ${Object.keys(allData).length} products with data`);
  console.log(`Total product images: ${totalImgs} (avg ${(totalImgs / Object.keys(allData).length).toFixed(1)}/product)`);
  console.log(`Total videos: ${totalVids}`);
  console.log(`Total feature icons: ${totalIcons}`);
  console.log(`Products with drawing: ${totalDrawings}`);
}

main().catch(console.error);
