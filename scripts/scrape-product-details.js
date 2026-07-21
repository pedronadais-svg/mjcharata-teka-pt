/**
 * Extrai detalhes de produto (nome, features, cor, imagens HD)
 * das páginas de produto do site teka.com/pt-pt
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const catalog = require(path.join(__dirname, '../src/data/catalog-with-urls.json'));

function fetchPage(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { timeout: 12000 }, (res) => {
      let data = '';
      res.on('data', (d) => (data += d));
      res.on('end', () => resolve(data));
    });
    req.on('error', () => resolve(''));
    req.on('timeout', () => { req.destroy(); resolve(''); });
  });
}

function extractDetails(html, sku) {
  const details = {};

  // Product name (official)
  const nameMatch = html.match(new RegExp(`data-product-sku="${sku}"[^>]*data-product-name="([^"]+)"`)) ||
                     html.match(new RegExp(`data-product-name="([^"]+)"[^>]*data-product-sku="${sku}"`));
  // Try short name from page-level data
  const shortNameMatch = html.match(/data-short-product-name="([^"]+)"/);
  const fullNameMatch = html.match(/data-product-name="([^"]+)"/);
  const colorMatch = html.match(/data-color="([^"]+)"/);

  if (shortNameMatch) details.shortName = shortNameMatch[1];
  if (fullNameMatch) details.fullName = fullNameMatch[1];
  if (colorMatch) details.color = colorMatch[1];

  // Features from <li> tags (the first set, which are product features)
  const liMatches = html.match(/<li>[^<]{5,120}<\/li>/g) || [];
  details.features = liMatches
    .map(m => m.replace(/<\/?li>/g, '').trim())
    .filter(f => !f.includes('http') && !f.includes('{') && f.length > 5 && f.length < 120)
    .slice(0, 15);

  // All product images (data-fullscreen for HD)
  const hdImages = (html.match(/data-fullscreen="([^"]+)"/g) || [])
    .map(m => m.replace('data-fullscreen="', '').replace('"', ''))
    .filter(url => url.includes(sku));
  details.images = hdImages;

  // Feature icons
  const svgIcons = (html.match(/data-src="(https:\/\/d7rh5s3nxmpy4[^"]+\.svg)"/g) || [])
    .map(m => m.replace('data-src="', '').replace('"', ''));
  details.featureIcons = svgIcons;

  // Drawing/schematic
  const drawingMatch = html.match(/data-src="([^"]+Drawing[^"]+\.jpg)/);
  if (drawingMatch) details.drawing = drawingMatch[1];

  // Energy label
  const energyMatch = html.match(/data-src="([^"]+energy[^"]+\.jpg)/i);
  if (energyMatch) details.energyLabel = energyMatch[1];

  return details;
}

async function main() {
  const productDetails = {};
  const BATCH = 10;

  console.log(`Scraping details for ${catalog.length} products...\n`);

  for (let i = 0; i < catalog.length; i += BATCH) {
    const batch = catalog.slice(i, i + BATCH);
    const results = await Promise.all(batch.map(async (item) => {
      const html = await fetchPage(item.tekaUrl);
      if (!html) return { sku: item.sku, details: null };
      const details = extractDetails(html, item.sku);
      return { sku: item.sku, details };
    }));

    results.forEach(({ sku, details }) => {
      if (details && (details.features.length > 0 || details.fullName)) {
        productDetails[sku] = details;
      }
    });

    process.stderr.write(`  Scraped ${Math.min(i + BATCH, catalog.length)}/${catalog.length} (${Object.keys(productDetails).length} with data)\r`);
  }

  console.log(`\n\nDone! ${Object.keys(productDetails).length} products with details extracted.\n`);

  // Stats
  let withFeatures = 0, withName = 0, withImages = 0;
  Object.values(productDetails).forEach(d => {
    if (d.features.length > 0) withFeatures++;
    if (d.fullName) withName++;
    if (d.images.length > 0) withImages++;
  });
  console.log(`With features: ${withFeatures}`);
  console.log(`With official name: ${withName}`);
  console.log(`With HD images: ${withImages}`);

  fs.writeFileSync(
    path.join(__dirname, '../src/data/product-details.json'),
    JSON.stringify(productDetails, null, 2)
  );
  console.log('\nSaved to src/data/product-details.json');
}

main().catch(console.error);
