/**
 * Injeta features reais no products.ts a partir do product-details.json.
 * Substitui features: [] por features com dados reais.
 * Também verifica e corrige imagens cruzando com product-details.json.
 */
const fs = require('fs');
const path = require('path');

const details = require(path.join(__dirname, '../src/data/product-details.json'));
const productsFile = path.join(__dirname, '../src/data/products.ts');
let content = fs.readFileSync(productsFile, 'utf-8');

let featuresUpdated = 0;
let imagesUpdated = 0;

for (const [sku, detail] of Object.entries(details)) {
  // Deduplicate features
  const uniqueFeatures = [...new Set(detail.features || [])].filter(f => f.length > 5);

  if (uniqueFeatures.length > 0) {
    // Build features array string
    const featuresStr = uniqueFeatures.slice(0, 6).map(f => {
      const safe = f.replace(/'/g, "\\'").replace(/\n/g, ' ').trim();
      return `{ title: '${safe}', description: '' }`;
    }).join(',\n      ');

    // Replace features: [] for this specific product
    // Pattern: id: 'SKU', ... features: [], ...
    const regex = new RegExp(`(id: '${sku}',[\\s\\S]*?)features: \\[\\]`, 'm');
    if (regex.test(content)) {
      content = content.replace(regex, `$1features: [\n      ${featuresStr},\n    ]`);
      featuresUpdated++;
    }
  }

  // Update images if we have HD versions from scraping
  if (detail.images && detail.images.length > 0) {
    const currentImagesRegex = new RegExp(`(id: '${sku}',[\\s\\S]*?)images: \\[([^\\]]*)\\]`);
    const match = content.match(currentImagesRegex);
    if (match && (match[2].trim() === '' || match[2].split(',').length < detail.images.length)) {
      const imagesStr = detail.images.slice(0, 5).map(url => `'${url}'`).join(', ');
      content = content.replace(currentImagesRegex, `$1images: [${imagesStr}]`);

      // Also update thumbnail
      const thumbRegex = new RegExp(`(id: '${sku}',[\\s\\S]*?)thumbnail: '[^']*'`);
      content = content.replace(thumbRegex, `$1thumbnail: '${detail.images[0]}'`);
      imagesUpdated++;
    }
  }
}

fs.writeFileSync(productsFile, content);

console.log(`Features updated: ${featuresUpdated}`);
console.log(`Images updated: ${imagesUpdated}`);

// Verify results
const emptyFeatures = (content.match(/features: \[\]/g) || []).length;
const emptyImages = (content.match(/images: \[\]/g) || []).length;
console.log(`\nRemaining with empty features: ${emptyFeatures}`);
console.log(`Remaining with empty images: ${emptyImages}`);
