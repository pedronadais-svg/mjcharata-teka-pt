/**
 * Gera src/data/products.ts final com todos os 510 produtos do catálogo Excel
 * + imagens reais do CDN Teka + documentos mock
 */
const fs = require('fs');
const path = require('path');

const catalog = require(path.join(__dirname, '../src/data/catalog-mapped.json'));
const skuImages = require(path.join(__dirname, '../src/data/sku-images.json'));

function sanitize(text) {
  return (text || '').replace(/[\r\n]+/g, ' ').replace(/'/g, "\\'").trim();
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

// Build unique slug map (avoid duplicates)
const slugCount = {};
function uniqueSlug(base) {
  if (!slugCount[base]) {
    slugCount[base] = 1;
    return base;
  }
  slugCount[base]++;
  return `${base}-${slugCount[base]}`;
}

// Count products per subcategory for the categories array
const subCounts = {};
catalog.forEach(p => {
  const key = `${p.category}/${p.subcategory}`;
  subCounts[key] = (subCounts[key] || 0) + 1;
});

// Generate product entries
const productEntries = catalog.map((item, idx) => {
  const slug = uniqueSlug(slugify(item.name));
  const images = skuImages[item.sku] || [];
  const thumbnail = images[0] || '';
  const isNew = idx < 10; // First 10 overall are "new"

  const cleanName = sanitize(item.name);
  const cleanEan = sanitize(item.ean);
  const cleanRef = sanitize(item.refPhc);

  return `  {
    id: '${item.sku}',
    slug: '${slug}',
    name: '${cleanName}',
    reference: '${item.sku}',
    ean: '${cleanEan}',
    refPhc: '${cleanRef}',
    shortDescription: '${cleanName}',
    description: '${cleanName}',
    category: '${item.category}',
    subcategory: '${item.subcategory}',
    images: [${images.map(i => `'${i}'`).join(', ')}],
    thumbnail: '${thumbnail}',
    energyRating: undefined,
    priceAOA: ${item.priceAOA || 0},
    features: [],
    specifications: [],
    variants: [],
    documents: createDocuments('${item.sku}', '${item.subcategory}'),
    relatedProductIds: [],
    isNew: ${isNew},
    isPromoted: ${idx < 4},
    tags: ['${item.subcategory}'],
  }`;
});

const output = `import type { Product, ProductDocument, Category } from '@/lib/types';

// ============================================================
// Categorias
// ============================================================

export const categories: Category[] = [
  {
    id: 'cozinha',
    slug: 'cozinha',
    name: 'Cozinha',
    description: 'Eletrodomésticos de cozinha com tecnologia alemã e design premium.',
    image: '/images/categories/cozinha.jpg',
    banner: '/images/banners/cozinha-banner.jpg',
    subcategories: [
      { id: 'fornos', slug: 'fornos', name: 'Fornos', description: 'Fornos pirolíticos, multifunção e vapor', image: '/images/categories/fornos.jpg', productCount: ${subCounts['cozinha/fornos'] || 0} },
      { id: 'microondas', slug: 'microondas', name: 'Microondas', description: 'Microondas de encastrar e livre instalação', image: '/images/categories/microondas.jpg', productCount: ${subCounts['cozinha/microondas'] || 0} },
      { id: 'placas', slug: 'placas', name: 'Placas', description: 'Placas de indução, vitrocerâmica e gás', image: '/images/categories/placas.jpg', productCount: ${subCounts['cozinha/placas'] || 0} },
      { id: 'exaustores', slug: 'exaustores', name: 'Exaustores', description: 'Exaustores de parede, teto e integrados', image: '/images/categories/exaustores.jpg', productCount: ${subCounts['cozinha/exaustores'] || 0} },
      { id: 'frigorificos', slug: 'frigorificos', name: 'Frigoríficos', description: 'Combinados, americanos e de encastrar', image: '/images/categories/frigorificos.jpg', productCount: ${subCounts['cozinha/frigorificos'] || 0} },
      { id: 'lava-loica', slug: 'lava-loica', name: 'Lava-loiça', description: 'Lava-loiças em inox e materiais compostos', image: '/images/categories/lava-loica.jpg', productCount: ${subCounts['cozinha/lava-loica'] || 0} },
      { id: 'maquinas-lavar-loica', slug: 'maquinas-lavar-loica', name: 'Máquinas de lavar loiça', description: 'Máquinas de encastrar e livre instalação', image: '/images/categories/maquinas-loica.jpg', productCount: ${subCounts['cozinha/maquinas-lavar-loica'] || 0} },
      { id: 'misturadoras', slug: 'misturadoras', name: 'Misturadoras', description: 'Torneiras e misturadoras de cozinha', image: '/images/categories/misturadoras.jpg', productCount: ${subCounts['cozinha/misturadoras'] || 0} },
      { id: 'acessorios', slug: 'acessorios', name: 'Acessórios', description: 'Complementos para a sua cozinha Teka', image: '/images/categories/acessorios.jpg', productCount: ${subCounts['cozinha/acessorios'] || 0} },
    ],
  },
  {
    id: 'lavandaria',
    slug: 'lavandaria',
    name: 'Lavandaria',
    description: 'Soluções completas para o tratamento de roupa.',
    image: '/images/categories/lavandaria.jpg',
    banner: '/images/banners/lavandaria-banner.jpg',
    subcategories: [
      { id: 'maquinas-lavar-roupa', slug: 'maquinas-lavar-roupa', name: 'Máquinas de lavar roupa', description: 'Eficiência e cuidado com a roupa', image: '/images/categories/lavar-roupa.jpg', productCount: ${subCounts['lavandaria/maquinas-lavar-roupa'] || 0} },
      { id: 'maquinas-secar', slug: 'maquinas-secar', name: 'Máquinas de secar', description: 'Secadores com bomba de calor', image: '/images/categories/secar.jpg', productCount: ${subCounts['lavandaria/maquinas-secar'] || 0} },
      { id: 'maquinas-lavar-secar', slug: 'maquinas-lavar-secar', name: 'Máquinas de lavar e secar', description: 'Soluções 2 em 1', image: '/images/categories/lavar-secar.jpg', productCount: ${subCounts['lavandaria/maquinas-lavar-secar'] || 0} },
    ],
  },
  {
    id: 'termoacumuladores',
    slug: 'termoacumuladores',
    name: 'Termoacumuladores',
    description: 'Soluções de água quente para toda a casa.',
    image: '/images/categories/termoacumuladores.jpg',
    banner: '/images/banners/termoacumuladores-banner.jpg',
    subcategories: [
      { id: 'termoacumuladores', slug: 'termoacumuladores', name: 'Termoacumuladores', description: 'Água quente com eficiência', image: '/images/categories/termoacumuladores.jpg', productCount: ${subCounts['termoacumuladores/termoacumuladores'] || 0} },
    ],
  },
];

// ============================================================
// Documentos mock
// ============================================================

function createDocuments(productId: string, category: string): ProductDocument[] {
  return [
    { id: \`\${productId}-doc-1\`, name: 'Manual de Utilizador', type: 'manual', language: 'Português', format: 'pdf', size: '4.2 MB', url: \`/documents/\${category}/\${productId}/manual-utilizador.pdf\`, productId, category, order: 1 },
    { id: \`\${productId}-doc-2\`, name: 'Ficha Técnica', type: 'ficha-tecnica', language: 'Português', format: 'pdf', size: '1.8 MB', url: \`/documents/\${category}/\${productId}/ficha-tecnica.pdf\`, productId, category, order: 2 },
    { id: \`\${productId}-doc-3\`, name: 'Guia de Instalação', type: 'guia-instalacao', language: 'Português', format: 'pdf', size: '2.1 MB', url: \`/documents/\${category}/\${productId}/guia-instalacao.pdf\`, productId, category, order: 3 },
    { id: \`\${productId}-doc-4\`, name: 'Etiqueta Energética', type: 'etiqueta-energetica', language: 'Português', format: 'pdf', size: '320 KB', url: \`/documents/\${category}/\${productId}/etiqueta-energetica.pdf\`, productId, category, order: 4 },
    { id: \`\${productId}-doc-5\`, name: 'Ficha de Produto', type: 'ficha-produto', language: 'Português', format: 'pdf', size: '980 KB', url: \`/documents/\${category}/\${productId}/ficha-produto.pdf\`, productId, category, order: 5 },
    { id: \`\${productId}-doc-6\`, name: 'Desenho Técnico', type: 'desenho-tecnico', language: 'Multilíngue', format: 'pdf', size: '1.5 MB', url: \`/documents/\${category}/\${productId}/desenho-tecnico.pdf\`, productId, category, order: 6 },
    { id: \`\${productId}-doc-7\`, name: 'Declaração de Conformidade', type: 'declaracao-conformidade', language: 'Multilíngue', format: 'pdf', size: '420 KB', url: \`/documents/\${category}/\${productId}/declaracao-conformidade.pdf\`, productId, category, order: 7 },
  ];
}

// ============================================================
// Produtos — ${catalog.length} artigos do catálogo oficial
// ============================================================

export const products: Product[] = [
${productEntries.join(',\n')}
];

// ============================================================
// Helpers
// ============================================================

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getProductsBySubcategory(subcategory: string): Product[] {
  return products.filter((p) => p.subcategory === subcategory);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.isPromoted);
}

export function getNewProducts(): Product[] {
  return products.filter((p) => p.isNew);
}

export function getAllDocuments(): ProductDocument[] {
  return products.flatMap((p) => p.documents);
}

export function getDocumentsByProduct(productId: string): ProductDocument[] {
  return products.find((p) => p.id === productId)?.documents ?? [];
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
`;

fs.writeFileSync(path.join(__dirname, '../src/data/products.ts'), output);
console.log('Generated products.ts with', catalog.length, 'products');
console.log('Products with images:', Object.keys(skuImages).length);
