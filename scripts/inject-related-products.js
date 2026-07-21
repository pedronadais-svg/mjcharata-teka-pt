/**
 * Injeta produtos relacionados e verifica que o ProductRelated funciona.
 */
const fs = require('fs');
const path = require('path');

const fullData = require(path.join(__dirname, '../src/data/product-full-data.json'));
const productsFile = path.join(__dirname, '../src/data/products.ts');
let content = fs.readFileSync(productsFile, 'utf-8');

let updated = 0;

for (const [sku, data] of Object.entries(fullData)) {
  if (!data.relatedSkus || data.relatedSkus.length === 0) continue;

  // Only use SKUs that exist in our catalog
  const validRelated = data.relatedSkus
    .filter(rsku => content.includes(`id: '${rsku}'`))
    .slice(0, 8);

  if (validRelated.length === 0) continue;

  const relatedStr = validRelated.map(s => `'${s}'`).join(', ');
  const regex = new RegExp(`(id: '${sku}',[\\s\\S]*?)relatedProductIds: \\[[^\\]]*\\]`);

  if (regex.test(content)) {
    content = content.replace(regex, `$1relatedProductIds: [${relatedStr}]`);
    updated++;
  }
}

fs.writeFileSync(productsFile, content);
console.log('Related products updated:', updated);

// Verify
const check = content.match(/id: '111000096'[\s\S]*?relatedProductIds: \[([^\]]*)\]/);
if (check) {
  console.log('SKU 111000096 related:', check[1].split(',').filter(x => x.trim()).length, 'products');
}
