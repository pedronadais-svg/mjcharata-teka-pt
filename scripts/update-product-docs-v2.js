/**
 * Reescreve a função createDocuments em products.ts para
 * importar pdf-map.json e usar documentos reais.
 */
const fs = require('fs');
const path = require('path');

const productsFile = path.join(__dirname, '../src/data/products.ts');
let content = fs.readFileSync(productsFile, 'utf-8');

// Remove ALL old _pdfMap blocks and createDocuments
// Find everything between "// Documentos" or "// PDF map" comment and "// ===...Produtos"
content = content.replace(
  /\/\/ =+\n\/\/ Documentos[\s\S]*?(?=\/\/ =+\n\/\/ Produtos|\/\/ =+\n\/\/ Ar Condicionado)/,
  ''
);

// Also remove duplicate PDF map blocks
content = content.replace(
  /\n\/\/ PDF map loaded from real[\s\S]*?function createDocuments[\s\S]*?\n\}/g,
  ''
);

// Now insert clean version after categories closing
const insertPoint = '];\n\n// ==';
const firstOccurrence = content.indexOf(insertPoint);
if (firstOccurrence === -1) {
  console.error('Could not find insertion point');
  process.exit(1);
}

const newBlock = `];\n
// ============================================================
// Documentos — PDFs reais descarregados do site Teka
// ============================================================

import pdfMapData from './pdf-map.json';
const _pdfMap = pdfMapData as Record<string, Array<{url: string; filename: string; type: string; webPath: string}>>;

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
  return [];
}

// ==`;

content = content.substring(0, firstOccurrence) + newBlock + content.substring(firstOccurrence + insertPoint.length);

fs.writeFileSync(productsFile, content);
console.log('Updated products.ts with import-based createDocuments');
