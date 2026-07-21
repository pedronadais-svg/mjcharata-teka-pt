/**
 * Final enrichment: update products.ts with:
 * - Official product names from fullData
 * - ALL product images (no limit)
 * - Official descriptions
 */
const fs = require('fs');
const path = require('path');

const fullData = require(path.join(__dirname, '../src/data/product-full-data.json'));
const productsFile = path.join(__dirname, '../src/data/products.ts');
let content = fs.readFileSync(productsFile, 'utf-8');

let namesUpdated = 0;
let imagesUpdated = 0;

for (const [sku, data] of Object.entries(fullData)) {
  // 1. Update name with official fullName
  if (data.fullName && data.fullName.length > 10) {
    const safeName = data.fullName.replace(/'/g, "\\'").replace(/[\r\n]+/g, ' ').trim();

    const nameRegex = new RegExp(`(id: '${sku}',[\\s\\S]*?)name: '[^']*'`);
    if (nameRegex.test(content)) {
      content = content.replace(nameRegex, `$1name: '${safeName}'`);
    }

    // Update description
    const descRegex = new RegExp(`(id: '${sku}',[\\s\\S]*?)description: '[^']*'`);
    if (descRegex.test(content)) {
      content = content.replace(descRegex, `$1description: '${safeName}'`);
      namesUpdated++;
    }
  }

  // 2. Update images with ALL from fullData
  const fullImgs = (data.productImages || []).filter(u => !u.includes('Drawing'));
  if (fullImgs.length > 0) {
    const imgRegex = new RegExp(`(id: '${sku}',[\\s\\S]*?)images: \\[([^\\]]*)\\]`);
    const match = content.match(imgRegex);
    if (match) {
      const currentCount = match[2].split(',').filter(x => x.trim()).length;
      if (fullImgs.length > currentCount) {
        const imgsStr = fullImgs.map(url => `'${url}'`).join(', ');
        content = content.replace(imgRegex, `$1images: [${imgsStr}]`);

        // Also update thumbnail
        const thumbRegex = new RegExp(`(id: '${sku}',[\\s\\S]*?)thumbnail: '[^']*'`);
        content = content.replace(thumbRegex, `$1thumbnail: '${fullImgs[0]}'`);
        imagesUpdated++;
      }
    }
  }
}

// Fix any broken strings (newlines in single-quoted strings)
content = content.replace(/(name|shortDescription|description|refPhc): '([^']*)(\n|\r\n)([^']*')/g, (match, field, before, nl, after) => {
  return field + ": '" + before.trim() + ' ' + after;
});

fs.writeFileSync(productsFile, content);

console.log('Names/descriptions updated:', namesUpdated);
console.log('Images expanded:', imagesUpdated);

// Verify the key product
const check = content.match(/id: '111000096'[\s\S]*?images: \[([^\]]*)\]/);
if (check) {
  const count = check[1].split(',').filter(x => x.trim()).length;
  console.log('\nSKU 111000096 images in products.ts:', count);
}
