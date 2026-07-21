/**
 * Atualiza products.ts para usar os PDFs reais descarregados.
 * Lê o pdf-map.json e gera documentos reais para cada produto.
 */
const fs = require('fs');
const path = require('path');

const pdfMap = require(path.join(__dirname, '../src/data/pdf-map.json'));
const productsFile = path.join(__dirname, '../src/data/products.ts');

let content = fs.readFileSync(productsFile, 'utf-8');

// Replace the createDocuments function to also check pdf-map
const newCreateDocs = `
// PDF map loaded from real Teka downloads
const _pdfMap: Record<string, Array<{url: string; filename: string; type: string; webPath: string}>> = ${JSON.stringify(pdfMap, null, 2)};

function createDocuments(productId: string, category: string): ProductDocument[] {
  const realDocs = _pdfMap[productId];
  if (realDocs && realDocs.length > 0) {
    return realDocs.map((doc, i) => ({
      id: \`\${productId}-doc-\${i + 1}\`,
      name: doc.filename.replace(/\\.pdf$/i, '').replace(/[_-]+/g, ' '),
      type: doc.type as ProductDocument['type'],
      language: doc.filename.toLowerCase().includes('-pt') ? 'Português' : 'Multilíngue',
      format: 'pdf' as const,
      size: '',
      url: doc.webPath,
      productId,
      category,
      order: i + 1,
    }));
  }
  // Fallback: no documents
  return [];
}`;

// Replace old createDocuments
content = content.replace(
  /function createDocuments\(productId: string, category: string\): ProductDocument\[\] \{[\s\S]*?\n\}/,
  newCreateDocs
);

fs.writeFileSync(productsFile, content);

// Count products with real docs vs without
const allSkus = content.match(/id: '(\d+)'/g)?.map(m => m.replace("id: '", "").replace("'", "")) || [];
const withDocs = allSkus.filter(sku => pdfMap[sku]);
const withoutDocs = allSkus.filter(sku => !pdfMap[sku]);

console.log('Products with real PDFs:', withDocs.length);
console.log('Products without PDFs:', withoutDocs.length);
console.log('Total unique PDFs in map:', Object.values(pdfMap).flat().length);
