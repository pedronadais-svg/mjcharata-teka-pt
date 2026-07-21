/**
 * Script para remover imagens duplicadas dos produtos.
 *
 * Problema: Muitos produtos têm a mesma foto em 3 tamanhos:
 *   _SZ1 (pequeno/pixelizado), _SZ2 (médio/bom), _SZ3 (grande)
 *
 * Solução: Para cada foto base, manter apenas SZ2. Se SZ2 não existir, manter SZ3. Se nenhum, manter SZ1.
 * Imagens sem sufixo SZ são mantidas.
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'data', 'products.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Extract the base image ID from a URL
// e.g. "PR426944BI46705_111070000_NEO_HSF_9000_SS_SZ2.png" -> "PR426944BI46705_111070000_NEO_HSF_9000_SS"
function getBaseId(url) {
  const filename = url.split('/').pop();
  if (!filename) return url;
  // Remove _SZ1, _SZ2, _SZ3 suffix and extension
  return filename.replace(/_(SZ[123])\.(png|jpg|jpeg|webp)/i, '');
}

function getSzLevel(url) {
  if (/_SZ1\./i.test(url)) return 1;
  if (/_SZ2\./i.test(url)) return 2;
  if (/_SZ3\./i.test(url)) return 3;
  return 0; // no SZ suffix
}

// Process images array: deduplicate by base ID, prefer SZ2
function dedupeImages(images) {
  const groups = new Map(); // baseId -> { sz1, sz2, sz3, noSz }

  for (const url of images) {
    const sz = getSzLevel(url);
    if (sz === 0) {
      // No SZ suffix - always keep
      const key = 'nosz_' + url;
      groups.set(key, { url, sz: 0 });
      continue;
    }

    const baseId = getBaseId(url);
    if (!groups.has(baseId)) {
      groups.set(baseId, {});
    }
    const group = groups.get(baseId);
    group['sz' + sz] = url;
  }

  // Build deduplicated list
  const result = [];
  for (const [key, val] of groups) {
    if (key.startsWith('nosz_')) {
      result.push(val.url);
    } else {
      // Prefer SZ2, then SZ3, then SZ1
      const best = val.sz2 || val.sz3 || val.sz1;
      if (best) result.push(best);
    }
  }

  return result;
}

// Parse the images arrays in the file using regex
let totalBefore = 0;
let totalAfter = 0;
let productsFixed = 0;

content = content.replace(/images: \[([^\]]+)\]/g, (match, inner) => {
  // Extract URLs
  const urls = [];
  const urlRegex = /'([^']+)'/g;
  let m;
  while ((m = urlRegex.exec(inner)) !== null) {
    urls.push(m[1]);
  }

  if (urls.length === 0) return match;

  totalBefore += urls.length;
  const deduped = dedupeImages(urls);
  totalAfter += deduped.length;

  if (deduped.length < urls.length) {
    productsFixed++;
  }

  // Rebuild the images array
  const newInner = deduped.map(u => `'${u}'`).join(', ');
  return `images: [${newInner}]`;
});

// Also update thumbnails: ensure they point to SZ2 version
content = content.replace(/thumbnail: '([^']*_SZ[13]\.[^']*)'/g, (match, url) => {
  // Replace SZ1 or SZ3 with SZ2
  const newUrl = url.replace(/_SZ[13]\./, '_SZ2.');
  return `thumbnail: '${newUrl}'`;
});

console.log(`Images before: ${totalBefore}`);
console.log(`Images after:  ${totalAfter}`);
console.log(`Removed:       ${totalBefore - totalAfter} duplicates`);
console.log(`Products fixed: ${productsFixed}`);

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Done!');
