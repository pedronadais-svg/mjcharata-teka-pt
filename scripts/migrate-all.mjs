/**
 * Migration script: Convert all static TypeScript data to JSON files in src/data/db/
 * Run: node scripts/migrate-all.mjs
 */

import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { hashSync } from 'bcryptjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DB_DIR = join(ROOT, 'src/data/db');

mkdirSync(DB_DIR, { recursive: true });

function writeJSON(filename, data) {
  const path = join(DB_DIR, filename);
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
  const count = Array.isArray(data) ? data.length : 'object';
  console.log(`  ✓ ${filename} (${count} items)`);
}

// ──────────────────────────────────────────────
// 1. PRODUCTS — Parse from TypeScript source
// ──────────────────────────────────────────────
async function migrateProducts() {
  console.log('\n=== Migrating Products ===');

  // Dynamic import of the TS file via tsx
  // Since we can't directly import TS, we'll use a workaround
  // The products.ts exports { products, categories }
  // We need to extract them

  const tsFile = join(ROOT, 'src/data/products.ts');
  const content = readFileSync(tsFile, 'utf-8');

  // Extract categories array
  const catMatch = content.match(/export const categories: Category\[\] = (\[[\s\S]*?\n\];)/);

  // For products, we'll use a different approach - run via tsx
  // Actually, let's create a temp extraction script
  const extractScript = `
    import { products, categories } from '../src/data/products.ts';
    import { writeFileSync } from 'fs';

    const now = new Date().toISOString();

    // Add DB fields to products
    const productsDB = products.map(p => ({
      ...p,
      updatedAt: now,
      status: 'active',
    }));

    writeFileSync('${DB_DIR.replace(/\\/g, '/')}/products.json', JSON.stringify(productsDB, null, 2));
    writeFileSync('${DB_DIR.replace(/\\/g, '/')}/categories.json', JSON.stringify(categories, null, 2));

    console.log('  ✓ products.json (' + productsDB.length + ' products)');
    console.log('  ✓ categories.json (' + categories.length + ' categories)');
  `;

  const tempFile = join(ROOT, 'scripts/_temp_extract.ts');
  writeFileSync(tempFile, extractScript);

  return tempFile;
}

// ──────────────────────────────────────────────
// 2. ARTICLES — Read from existing article TS files
// ──────────────────────────────────────────────
async function migrateArticles() {
  console.log('\n=== Migrating Articles ===');

  const extractScript = `
    import { articles } from '../src/data/articles/index.ts';
    import { writeFileSync } from 'fs';

    const now = new Date().toISOString();

    const articlesDB = articles.map((a, i) => ({
      ...a,
      status: 'published',
      updatedAt: now,
      order: i + 1,
    }));

    writeFileSync('${DB_DIR.replace(/\\/g, '/')}/articles.json', JSON.stringify(articlesDB, null, 2));
    console.log('  ✓ articles.json (' + articlesDB.length + ' articles)');
  `;

  const tempFile = join(ROOT, 'scripts/_temp_articles.ts');
  writeFileSync(tempFile, extractScript);
  return tempFile;
}

// ──────────────────────────────────────────────
// 3. FAQs
// ──────────────────────────────────────────────
async function migrateFaqs() {
  console.log('\n=== Migrating FAQs ===');

  const extractScript = `
    import { faqs } from '../src/data/articles.ts';
    import { writeFileSync } from 'fs';

    writeFileSync('${DB_DIR.replace(/\\/g, '/')}/faqs.json', JSON.stringify(faqs, null, 2));
    console.log('  ✓ faqs.json (' + faqs.length + ' FAQs)');
  `;

  const tempFile = join(ROOT, 'scripts/_temp_faqs.ts');
  writeFileSync(tempFile, extractScript);
  return tempFile;
}

// ──────────────────────────────────────────────
// 4. NAVIGATION
// ──────────────────────────────────────────────
async function migrateNavigation() {
  console.log('\n=== Migrating Navigation ===');

  const extractScript = `
    import { mainNavigation } from '../src/data/navigation.ts';
    import { writeFileSync } from 'fs';

    // Check if footerNavigation exists
    let footer = [];
    try {
      const mod = await import('../src/data/navigation.ts');
      if (mod.footerNavigation) footer = mod.footerNavigation;
    } catch {}

    const nav = { mainNavigation, footerNavigation: footer };
    writeFileSync('${DB_DIR.replace(/\\/g, '/')}/navigation.json', JSON.stringify(nav, null, 2));
    console.log('  ✓ navigation.json');
  `;

  const tempFile = join(ROOT, 'scripts/_temp_nav.ts');
  writeFileSync(tempFile, extractScript);
  return tempFile;
}

// ──────────────────────────────────────────────
// 5. USERS — Hash passwords with bcrypt
// ──────────────────────────────────────────────
function migrateUsers() {
  console.log('\n=== Migrating Users ===');

  const now = new Date().toISOString();
  const users = [
    {
      id: 'admin-1',
      email: 'admin@mdvmadeiras.com',
      name: 'Administrador MDV',
      company: 'MDV — Madeiras e Derivados',
      role: 'admin',
      passwordHash: hashSync('admin2024', 12),
      isActive: true,
      createdAt: now,
    },
    {
      id: 'dist-1',
      email: 'distribuidor@exemplo.com',
      name: 'Distribuidor Demo',
      company: 'Empresa Distribuidora Lda.',
      role: 'distributor',
      passwordHash: hashSync('demo2024', 12),
      isActive: true,
      createdAt: now,
    },
  ];

  writeJSON('users.json', users);
}

// ──────────────────────────────────────────────
// 6. NEW FILES — pages, banners, settings, seo, orders, audit-log
// ──────────────────────────────────────────────
function createNewFiles() {
  console.log('\n=== Creating New Files ===');

  // Pages (editable content blocks)
  writeJSON('pages.json', [
    {
      id: 'home-hero',
      page: 'home',
      section: 'hero',
      title: 'Uma receita para a vida',
      subtitle: 'Eletrodomésticos Teka de qualidade alemã',
      cta: 'Ver produtos',
      ctaLink: '/cozinha/fornos',
    },
    {
      id: 'home-categories-title',
      page: 'home',
      section: 'categories',
      title: 'Explore por Categoria',
      subtitle: 'Encontre o eletrodoméstico perfeito para a sua casa',
    },
    {
      id: 'about-intro',
      page: 'sobre',
      section: 'intro',
      title: 'Sobre a Teka Angola',
      content: 'A Teka é uma marca alemã com mais de 100 anos de história, presente em Angola através da MDV — Madeiras e Derivados. Oferecemos soluções completas para cozinha, lavandaria e climatização.',
    },
    {
      id: 'contact-info',
      page: 'contacto',
      section: 'info',
      title: 'Contacte-nos',
      content: 'Estamos disponíveis para ajudar com qualquer questão sobre os nossos produtos e serviços.',
    },
  ]);

  // Banners
  writeJSON('banners.json', [
    {
      id: 'hero-1',
      type: 'hero',
      title: 'Van Gogh Collection',
      subtitle: 'Design que inspira, tecnologia que simplifica',
      mediaType: 'video',
      mediaUrl: '/videos/van-gogh.mp4',
      posterUrl: '/images/hero/van-gogh-poster.jpg',
      ctaText: 'Explorar',
      ctaLink: '/cozinha/fornos',
      order: 1,
      isActive: true,
    },
    {
      id: 'hero-2',
      type: 'hero',
      title: 'Ar Condicionado Teka',
      subtitle: 'Conforto térmico para a sua casa em Angola',
      mediaType: 'image',
      mediaUrl: '/images/hero/ar-condicionado.jpg',
      posterUrl: '',
      ctaText: 'Ver gama',
      ctaLink: '/ar-condicionado',
      order: 2,
      isActive: true,
    },
  ]);

  // Settings
  const settings = {
    siteName: 'Teka Angola',
    company: 'MDV — Madeiras e Derivados, S.A.',
    phone: '+244 933 302 752',
    email: 'teka@mdvmadeiras.com',
    address: 'Luanda, Angola',
    whatsapp: '+244 933 302 752',
    social: {
      facebook: 'https://facebook.com/tekaangola',
      instagram: 'https://instagram.com/tekaangola',
      youtube: '',
      linkedin: '',
    },
    seo: {
      defaultTitle: 'Eletrodomésticos de Cozinha & Lavandaria | Teka Angola',
      defaultDescription: 'Fornos, Placas, Exaustores, Frigoríficos, Máquinas de Lavar e mais. Qualidade alemã Teka distribuída pela MDV em Angola.',
      ogImage: '/og-image.jpg',
    },
    features: {
      showPrices: true,
      enableChat: true,
      enableNewsletter: true,
      maintenanceMode: false,
    },
  };
  writeJSON('settings.json', settings);

  // SEO per route
  writeJSON('seo.json', [
    { route: '/', title: 'Eletrodomésticos de Cozinha & Lavandaria | Teka Angola', description: 'Fornos, Placas, Exaustores, Frigoríficos, Máquinas de Lavar e mais. Qualidade alemã distribuída pela MDV em Angola.', ogImage: '/og-image.jpg' },
    { route: '/cozinha', title: 'Cozinha — Eletrodomésticos Teka', description: 'Fornos pirolíticos, placas de indução, exaustores e mais para a sua cozinha.', ogImage: '' },
    { route: '/lavandaria', title: 'Lavandaria — Máquinas de Lavar e Secar Teka', description: 'Máquinas de lavar roupa, secar e lavar e secar com tecnologia alemã.', ogImage: '' },
    { route: '/inspiracao', title: 'Dicas, Receitas e Tendências de Cozinha | Inspiração Teka', description: 'Artigos, receitas e tendências de cozinha e design em Angola.', ogImage: '' },
    { route: '/sobre', title: 'Sobre a Teka Angola — MDV Madeiras e Derivados', description: 'A história da Teka em Angola, distribuída pela MDV.', ogImage: '' },
    { route: '/suporte', title: 'Suporte Teka Angola — Garantias e Assistência Técnica', description: 'Perguntas frequentes, garantias, assistência técnica e contactos.', ogImage: '' },
  ]);

  // Orders (empty initially)
  writeJSON('orders.json', []);

  // Audit log (empty initially)
  writeJSON('audit-log.json', []);
}

// ──────────────────────────────────────────────
// MAIN
// ──────────────────────────────────────────────
async function main() {
  console.log('══════════════════════════════════════');
  console.log('  MIGRAÇÃO DE DADOS — TEKA ANGOLA');
  console.log('══════════════════════════════════════');

  // Create files that don't need TS imports
  migrateUsers();
  createNewFiles();

  // Create temp extraction scripts for TS imports
  const tempProducts = await migrateProducts();
  const tempArticles = await migrateArticles();
  const tempFaqs = await migrateFaqs();
  const tempNav = await migrateNavigation();

  console.log('\n=== Running TypeScript extractions ===');
  console.log('Run the following commands:');
  console.log(`  npx tsx ${tempProducts}`);
  console.log(`  npx tsx ${tempArticles}`);
  console.log(`  npx tsx ${tempFaqs}`);
  console.log(`  npx tsx ${tempNav}`);
  console.log('\nOr run: npm run migrate:extract');
}

main().catch(console.error);
