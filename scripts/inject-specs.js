/**
 * Injeta especificações técnicas reais no products.ts
 * a partir do product-specs.json (scraped via Playwright).
 */
const fs = require('fs');
const path = require('path');

const specs = require(path.join(__dirname, '../src/data/product-specs.json'));
const productsFile = path.join(__dirname, '../src/data/products.ts');
let content = fs.readFileSync(productsFile, 'utf-8');

let updated = 0;

for (const [sku, specList] of Object.entries(specs)) {
  if (!specList || specList.length === 0) continue;

  // Build specifications array
  const specsStr = specList.map(s => {
    const label = s.label.replace(/'/g, "\\'").replace(/\n/g, ' ').trim();
    const value = s.value.replace(/'/g, "\\'").replace(/\n/g, ' ').trim();
    const group = (s.group || '').replace(/'/g, "\\'").replace(/\n/g, ' ').trim();
    return `{ label: '${label}', value: '${value}', group: '${group}' }`;
  }).join(',\n      ');

  // Replace specifications: [] for this product
  const regex = new RegExp(`(id: '${sku}',[\\s\\S]*?)specifications: \\[\\]`, 'm');
  if (regex.test(content)) {
    content = content.replace(regex, `$1specifications: [\n      ${specsStr},\n    ]`);
    updated++;
  }
}

fs.writeFileSync(productsFile, content);

// Verify
const remaining = (content.match(/specifications: \[\]/g) || []).length;
console.log(`Specs injected: ${updated} products`);
console.log(`Remaining with empty specs: ${remaining}`);
console.log(`Total specs entries: ${Object.values(specs).flat().length}`);
