/**
 * Verifica se as imagens no nosso mapa correspondem às imagens
 * reais nas páginas de produto do site teka.com/pt-pt.
 *
 * Para cada produto:
 * 1. Busca imagens do site Teka (data-fullscreen + data-normal com SKU)
 * 2. Compara com o nosso mapa
 * 3. Se diferente, atualiza
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const catalog = require(path.join(__dirname, '../src/data/catalog-with-urls.json'));
const currentImages = require(path.join(__dirname, '../src/data/sku-images.json'));

function fetchPage(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', (d) => (data += d));
      res.on('end', () => resolve(data));
    });
    req.on('error', () => resolve(''));
    req.on('timeout', () => { req.destroy(); resolve(''); });
  });
}

function extractImages(html, sku) {
  // Get data-fullscreen images matching this SKU
  const fullscreen = (html.match(/data-fullscreen="([^"]+)"/g) || [])
    .map(m => m.replace('data-fullscreen="', '').replace('"', ''))
    .filter(url => url.includes(sku));

  // If no fullscreen, get data-normal
  const normal = (html.match(/data-normal="([^"]+)"/g) || [])
    .map(m => m.replace('data-normal="', '').replace('"', ''))
    .filter(url => url.includes(sku));

  // Also check data-src for product images
  const dataSrc = (html.match(/data-src="(https:\/\/teka\.b-cdn\.net\/[^"]+)"/g) || [])
    .map(m => m.replace('data-src="', '').replace('"', ''))
    .filter(url => url.includes(sku) && /SZ[12]/.test(url));

  // Merge and deduplicate, prefer fullscreen
  const all = [...new Set([...fullscreen, ...normal, ...dataSrc])];
  return all.slice(0, 6);
}

async function main() {
  let correct = 0, updated = 0, noImages = 0, errors = 0;
  const updatedMap = { ...currentImages };
  const BATCH = 15;

  console.log(`Verifying images for ${catalog.length} products...\n`);

  for (let i = 0; i < catalog.length; i += BATCH) {
    const batch = catalog.slice(i, i + BATCH);
    const results = await Promise.all(batch.map(async (item) => {
      const html = await fetchPage(item.tekaUrl);
      if (!html) return { sku: item.sku, status: 'error' };

      const tekaImages = extractImages(html, item.sku);
      const ourImages = currentImages[item.sku] || [];

      if (tekaImages.length === 0 && ourImages.length === 0) {
        return { sku: item.sku, status: 'no-images' };
      }

      if (tekaImages.length === 0) {
        return { sku: item.sku, status: 'correct' }; // Keep ours
      }

      // Check if our images match Teka's
      const ourSet = new Set(ourImages);
      const tekaSet = new Set(tekaImages);
      const allMatch = tekaImages.every(img => ourSet.has(img));

      if (!allMatch || tekaImages.length > ourImages.length) {
        // Update with Teka's images
        updatedMap[item.sku] = tekaImages;
        return { sku: item.sku, status: 'updated', from: ourImages.length, to: tekaImages.length };
      }

      return { sku: item.sku, status: 'correct' };
    }));

    results.forEach(r => {
      if (r.status === 'correct') correct++;
      else if (r.status === 'updated') updated++;
      else if (r.status === 'no-images') noImages++;
      else errors++;
    });

    process.stderr.write(`  Verified ${Math.min(i + BATCH, catalog.length)}/${catalog.length} (correct: ${correct}, updated: ${updated}, no-images: ${noImages})\r`);
  }

  console.log(`\n\nResults:`);
  console.log(`  Correct: ${correct}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  No images: ${noImages}`);
  console.log(`  Errors: ${errors}`);

  if (updated > 0) {
    fs.writeFileSync(
      path.join(__dirname, '../src/data/sku-images.json'),
      JSON.stringify(updatedMap, null, 2)
    );
    console.log(`\nSaved updated image map (${Object.keys(updatedMap).length} products)`);

    // Regenerate product-images.ts
    let code = `// Mapeamento de imagens reais do CDN Teka — ${Object.keys(updatedMap).length} produtos\n// Verificado contra o site oficial em ${new Date().toISOString().slice(0,10)}\n\n`;
    code += `export const productImageMap: Record<string, string[]> = {\n`;
    for (const [sku, imgs] of Object.entries(updatedMap)) {
      code += `  '${sku}': [\n`;
      imgs.forEach(img => { code += `    '${img}',\n`; });
      code += `  ],\n`;
    }
    code += `};\n\nexport function getProductImages(productId: string): string[] {\n`;
    code += `  return productImageMap[productId] || [];\n}\n`;
    fs.writeFileSync(path.join(__dirname, '../src/data/product-images.ts'), code);
    console.log('Regenerated product-images.ts');
  }
}

main().catch(console.error);
