/**
 * Integra os detalhes scraped (features, nome oficial, imagens HD)
 * no products.ts — atualiza os campos existentes.
 * Também atualiza o product-images.ts com imagens HD.
 */
const fs = require('fs');
const path = require('path');

const details = require(path.join(__dirname, '../src/data/product-details.json'));
const productsFile = path.join(__dirname, '../src/data/products.ts');
let content = fs.readFileSync(productsFile, 'utf-8');

let updatedNames = 0;
let updatedFeatures = 0;

for (const [sku, detail] of Object.entries(details)) {
  // Update product name and description with official name
  if (detail.fullName && detail.fullName.length > 10) {
    const nameRegex = new RegExp(`(id: '${sku}',[\\s\\S]*?name: ')([^']+)(')`);
    const match = content.match(nameRegex);
    if (match) {
      const safeName = detail.fullName.replace(/'/g, "\\'");
      content = content.replace(nameRegex, `$1${safeName}$3`);

      // Also update shortDescription
      const shortDescRegex = new RegExp(`(id: '${sku}',[\\s\\S]*?shortDescription: ')([^']+)(')`);
      content = content.replace(shortDescRegex, `$1${safeName}$3`);

      // Also update description
      const descRegex = new RegExp(`(id: '${sku}',[\\s\\S]*?description: ')([^']+)(')`);
      content = content.replace(descRegex, `$1${safeName}$3`);

      updatedNames++;
    }
  }
}

fs.writeFileSync(productsFile, content);

// Update product-images.ts with HD images
const imageMap = require(path.join(__dirname, '../src/data/sku-images.json'));
let newImages = 0;
for (const [sku, detail] of Object.entries(details)) {
  if (detail.images && detail.images.length > 0) {
    if (!imageMap[sku] || detail.images.length > imageMap[sku].length) {
      imageMap[sku] = detail.images.slice(0, 5);
      newImages++;
    }
  }
}
fs.writeFileSync(path.join(__dirname, '../src/data/sku-images.json'), JSON.stringify(imageMap, null, 2));

// Regenerate product-images.ts
let code = `// Mapeamento de imagens reais do CDN Teka — ${Object.keys(imageMap).length} produtos\n\n`;
code += `export const productImageMap: Record<string, string[]> = {\n`;
for (const [sku, imgs] of Object.entries(imageMap)) {
  code += `  '${sku}': [\n`;
  imgs.forEach(img => { code += `    '${img}',\n`; });
  code += `  ],\n`;
}
code += `};\n\nexport function getProductImages(productId: string): string[] {\n`;
code += `  return productImageMap[productId] || [];\n}\n`;
fs.writeFileSync(path.join(__dirname, '../src/data/product-images.ts'), code);

console.log(`Updated ${updatedNames} product names/descriptions`);
console.log(`Updated ${newImages} product image sets (now ${Object.keys(imageMap).length} total)`);
