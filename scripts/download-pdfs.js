/**
 * Extrai URLs de PDFs das páginas de produto da Teka e descarrega-os.
 * Gera também um mapeamento SKU -> PDFs para integrar no site.
 */
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const catalog = require(path.join(__dirname, '../src/data/catalog-with-urls.json'));
const DOCS_DIR = path.join(__dirname, '../public/documents');
const PDF_PATTERN = /\/\/d7rh5s3nxmpy4\.cloudfront\.net\/CMP1219\/files\/[^"'>\s]+\.pdf/g;

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

function downloadFile(url, dest) {
  return new Promise((resolve) => {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    if (fs.existsSync(dest)) { resolve(true); return; } // Skip if exists

    const file = fs.createWriteStream(dest);
    https.get(url, { timeout: 15000 }, (res) => {
      if (res.statusCode !== 200) { file.close(); fs.unlinkSync(dest); resolve(false); return; }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(true); });
    }).on('error', () => { file.close(); if (fs.existsSync(dest)) fs.unlinkSync(dest); resolve(false); });
  });
}

function classifyPdf(filename) {
  const f = filename.toLowerCase();
  if (f.includes('manual') || f.includes('usermanual')) return 'manual';
  if (f.includes('productfiche') || f.includes('product_fiche')) return 'ficha-produto';
  if (f.includes('installation') || f.includes('instalacao')) return 'guia-instalacao';
  if (f.includes('cooking') || f.includes('guide')) return 'guia-utilizacao';
  if (f.includes('energy') || f.includes('energetica')) return 'etiqueta-energetica';
  if (f.includes('drawing') || f.includes('desenho')) return 'desenho-tecnico';
  if (f.includes('declaration') || f.includes('conformidade')) return 'declaracao-conformidade';
  if (f.includes('folheto') || f.includes('catalogo') || f.includes('catalogue')) return 'catalogo';
  return 'ficha-tecnica'; // default
}

async function main() {
  const pdfMap = {}; // sku -> [{url, filename, type, localPath}]
  let totalPdfs = 0;
  let downloaded = 0;
  let failed = 0;
  let skipped = 0;

  console.log(`Processing ${catalog.length} products...\n`);

  // Phase 1: Extract PDF URLs
  const BATCH = 10;
  for (let i = 0; i < catalog.length; i += BATCH) {
    const batch = catalog.slice(i, i + BATCH);
    const results = await Promise.all(batch.map(async (item) => {
      const html = await fetchPage(item.tekaUrl);
      const matches = html.match(PDF_PATTERN) || [];
      const unique = [...new Set(matches.map(m => 'https:' + m))];
      return { sku: item.sku, subcategory: item.subcategory, pdfs: unique };
    }));

    results.forEach(({ sku, subcategory, pdfs }) => {
      if (pdfs.length > 0) {
        pdfMap[sku] = pdfs.map(url => {
          const filename = decodeURIComponent(url.split('/').pop());
          const type = classifyPdf(filename);
          const localDir = path.join(DOCS_DIR, subcategory, sku);
          const localPath = path.join(localDir, filename);
          const webPath = `/documents/${subcategory}/${sku}/${filename}`;
          return { url, filename, type, localPath, webPath };
        });
        totalPdfs += pdfs.length;
      }
    });

    process.stderr.write(`  Scanned ${Math.min(i + BATCH, catalog.length)}/${catalog.length} products (${totalPdfs} PDFs found)\r`);
  }

  console.log(`\n\nPhase 1 complete: ${totalPdfs} PDFs found across ${Object.keys(pdfMap).length} products\n`);

  // Phase 2: Download PDFs
  console.log('Phase 2: Downloading PDFs...\n');
  const allDownloads = [];
  for (const [sku, docs] of Object.entries(pdfMap)) {
    for (const doc of docs) {
      allDownloads.push({ sku, ...doc });
    }
  }

  for (let i = 0; i < allDownloads.length; i += 5) {
    const batch = allDownloads.slice(i, i + 5);
    const results = await Promise.all(batch.map(async (doc) => {
      if (fs.existsSync(doc.localPath)) { skipped++; return true; }
      const ok = await downloadFile(doc.url, doc.localPath);
      if (ok) downloaded++; else failed++;
      return ok;
    }));
    process.stderr.write(`  Downloaded ${downloaded + skipped}/${allDownloads.length} (skipped: ${skipped}, failed: ${failed})\r`);
  }

  console.log(`\n\nPhase 2 complete: ${downloaded} downloaded, ${skipped} skipped (exist), ${failed} failed\n`);

  // Phase 3: Save mapping
  fs.writeFileSync(
    path.join(__dirname, '../src/data/pdf-map.json'),
    JSON.stringify(pdfMap, null, 2)
  );
  console.log(`Mapping saved to src/data/pdf-map.json (${Object.keys(pdfMap).length} products)`);

  // Stats
  const byType = {};
  Object.values(pdfMap).flat().forEach(d => { byType[d.type] = (byType[d.type] || 0) + 1; });
  console.log('\nPDFs by type:');
  Object.entries(byType).sort((a,b) => b[1]-a[1]).forEach(([t, c]) => console.log(`  ${t}: ${c}`));
}

main().catch(console.error);
