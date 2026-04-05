/**
 * Script to fetch real Teka Portugal inspiration articles from WordPress REST API.
 * Fetches the best articles across all categories and generates TypeScript data files.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const API_BASE = 'https://www.teka.com/pt-pt/wp-json/wp/v2';

// WordPress category IDs mapped to our categories
const WP_CATEGORIES = {
  592: 'Cozinhar',
  593: 'Design',
  595: 'Inovação',
  646: 'Dicas',
  647: 'Curiosidades',
  614: null, // Inspiracao - generic, map by other categories
  876: 'Cozinhar', // Receitas → Cozinhar
};

// Fetch posts from a WordPress category
async function fetchCategoryPosts(catId, perPage = 100) {
  const allPosts = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const url = `${API_BASE}/posts?per_page=${perPage}&page=${page}&categories=${catId}&_fields=id,date,slug,title,content,excerpt,featured_media,categories`;
    const res = await fetch(url);
    if (!res.ok) break;
    totalPages = parseInt(res.headers.get('X-WP-TotalPages') || '1');
    const posts = await res.json();
    allPosts.push(...posts);
    page++;
  }

  return allPosts;
}

// Fetch featured image URL
async function fetchMediaUrl(mediaId) {
  if (!mediaId) return '';
  try {
    const res = await fetch(`${API_BASE}/media/${mediaId}?_fields=source_url`);
    if (!res.ok) return '';
    const data = await res.json();
    return data.source_url || '';
  } catch {
    return '';
  }
}

// Determine category based on WP categories array
function determineCategory(wpCategories) {
  // Priority order: specific categories first
  const priorityMap = [
    [593, 'Design'],
    [595, 'Inovação'],
    [647, 'Curiosidades'],
    [646, 'Dicas'],
    [592, 'Cozinhar'],
    [876, 'Cozinhar'],
  ];

  for (const [catId, category] of priorityMap) {
    if (wpCategories.includes(catId)) return category;
  }

  return 'Cozinhar'; // Default
}

// Clean HTML content
function cleanHtml(html) {
  if (!html) return '';
  let clean = html;

  clean = clean.replace(/<script[\s\S]*?<\/script>/gi, '');
  clean = clean.replace(/<style[\s\S]*?<\/style>/gi, '');
  clean = clean.replace(/<iframe(?![\s\S]*?youtube)[\s\S]*?<\/iframe>/gi, '');
  clean = clean.replace(/\s+data-[\w-]+="[^"]*"/g, '');
  clean = clean.replace(/\s+class="[^"]*"/g, '');
  clean = clean.replace(/\s+style="[^"]*"/g, '');
  clean = clean.replace(/\s+srcset="[^"]*"/g, '');
  clean = clean.replace(/\s+sizes="[^"]*"/g, '');
  clean = clean.replace(/\s+(width|height)="\d+"/g, '');
  clean = clean.replace(/\s+decoding="[^"]*"/g, '');
  clean = clean.replace(/\s+role="[^"]*"/g, '');
  clean = clean.replace(/<span[^>]*>([\s\S]*?)<\/span>/g, '$1');
  clean = clean.replace(/<div[^>]*>/g, '');
  clean = clean.replace(/<\/div>/g, '');
  // Remove <article> tags (CMS artifacts)
  clean = clean.replace(/<article[^>]*>/g, '');
  clean = clean.replace(/<\/article>/g, '');
  clean = clean.replace(/<img\s+(?!loading)/g, '<img loading="lazy" ');
  clean = clean.replace(/(loading="lazy"\s*){2,}/g, 'loading="lazy" ');
  clean = clean.replace(/<p[^>]*>\s*<\/p>/g, '');
  clean = clean.replace(/\n{3,}/g, '\n\n');
  clean = clean.replace(/&amp;/g, '&');

  return clean.trim();
}

// Calculate read time
function calcReadTime(html) {
  const text = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const words = text.split(' ').filter(w => w.length > 0).length;
  return `${Math.max(1, Math.ceil(words / 200))} min`;
}

// Extract excerpt
function extractExcerpt(htmlExcerpt, htmlContent) {
  let text = (htmlExcerpt || htmlContent || '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#8211;/g, '–')
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8216;|&#8217;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim();
  if (text.length > 200) text = text.substring(0, 197) + '...';
  return text;
}

// Decode HTML entities in title
function decodeTitle(title) {
  return title
    .replace(/&amp;/g, '&')
    .replace(/&#8211;/g, '–')
    .replace(/&#8220;|&#8221;/g, '"')
    .replace(/&#8216;|&#8217;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8230;/g, '...');
}

// Generate URL-friendly slug from title
function generateSlug(title) {
  let slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  // Truncate at word boundary (last hyphen before 70 chars)
  if (slug.length > 70) {
    slug = slug.substring(0, 70);
    const lastHyphen = slug.lastIndexOf('-');
    if (lastHyphen > 30) slug = slug.substring(0, lastHyphen);
  }
  return slug;
}

// Derive tags from category and title
function deriveTags(category, title) {
  const tags = [category];
  const t = title.toLowerCase();
  if (t.includes('receita') || t.includes('cozinhar') || t.includes('carne') || t.includes('bife')) tags.push('Receitas');
  if (t.includes('dica') || t.includes('conselho') || t.includes('como')) tags.push('Dicas');
  if (t.includes('forno')) tags.push('Fornos');
  if (t.includes('design') || t.includes('moderna') || t.includes('tendência')) tags.push('Design');
  if (t.includes('energia') || t.includes('poupar') || t.includes('sustentá')) tags.push('Poupança');
  if (t.includes('vapor')) tags.push('Vapor');
  return [...new Set(tags)];
}

// Escape for TypeScript template literal
function escapeForTS(str) {
  return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

// Generate TypeScript for a category
function generateCategoryFile(categoryName, articles) {
  const safeVar = {
    Cozinhar: 'articlesCozinhar',
    Dicas: 'articlesDicas',
    'Inovação': 'articlesInovacao',
    Design: 'articlesDesign',
    Curiosidades: 'articlesCuriosidades',
  }[categoryName];

  let out = `import type { Article } from '@/lib/types';\n\nexport const ${safeVar}: Article[] = [\n`;

  for (const a of articles) {
    out += `  {\n`;
    out += `    id: '${a.id}',\n`;
    out += `    slug: '${a.slug}',\n`;
    out += `    title: '${escapeForTS(a.title.replace(/'/g, "\\'"))}',\n`;
    out += `    excerpt: '${escapeForTS(a.excerpt.replace(/'/g, "\\'"))}',\n`;
    out += `    content: \`${escapeForTS(a.content)}\`,\n`;
    out += `    image: '${a.image}',\n`;
    out += `    category: '${a.category}',\n`;
    out += `    author: '${a.author}',\n`;
    out += `    date: '${a.date}',\n`;
    out += `    readTime: '${a.readTime}',\n`;
    out += `    tags: [${a.tags.map(t => `'${t}'`).join(', ')}],\n`;
    out += `  },\n`;
  }

  out += `];\n`;
  return out;
}

async function main() {
  console.log('=== Fetching ALL posts from WordPress API ===\n');

  // Fetch from all relevant categories
  const allPosts = new Map(); // id → post

  for (const catId of [614, 592, 593, 595, 646, 647]) {
    console.log(`Fetching category ${catId}...`);
    const posts = await fetchCategoryPosts(catId);
    console.log(`  → ${posts.length} posts`);
    for (const p of posts) {
      if (!allPosts.has(p.id)) allPosts.set(p.id, p);
    }
  }

  console.log(`\nTotal unique posts: ${allPosts.size}`);

  // Categorize and filter posts
  // Only keep posts that have real content (not just recipes with ingredients lists)
  const categorized = {
    Cozinhar: [],
    Dicas: [],
    'Inovação': [],
    Design: [],
    Curiosidades: [],
  };

  for (const post of allPosts.values()) {
    const contentLength = (post.content?.rendered || '').replace(/<[^>]+>/g, '').length;
    if (contentLength < 200) continue; // Skip very short posts

    // Skip non-editorial content
    const title = (post.title?.rendered || '').toLowerCase();
    if (title.includes('regulamento') || title.includes('passatempo') ||
        title.includes('concurso') || title.includes('expodeco') ||
        title.includes('condições gerais') || title.includes('bases legales')) continue;

    const category = determineCategory(post.categories || []);
    categorized[category].push(post);
  }

  // Sort each category by date (newest first) and take target count
  const targets = { Cozinhar: 15, Dicas: 12, 'Inovação': 10, Design: 8, Curiosidades: 6 };

  for (const cat of Object.keys(categorized)) {
    categorized[cat].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const target = targets[cat];
    categorized[cat] = categorized[cat].slice(0, target);
    console.log(`${cat}: ${categorized[cat].length}/${target} articles`);
  }

  // Process articles and fetch images
  console.log('\n=== Processing articles ===\n');

  const outputDir = join(__dirname, '..', 'src', 'data', 'articles');
  mkdirSync(outputDir, { recursive: true });

  const fileMap = {
    Cozinhar: 'cozinhar',
    Dicas: 'dicas',
    'Inovação': 'inovacao',
    Design: 'design',
    Curiosidades: 'curiosidades',
  };

  let artNum = 1;

  for (const [category, posts] of Object.entries(categorized)) {
    console.log(`\n--- ${category} (${posts.length} articles) ---`);
    const articles = [];

    for (const post of posts) {
      const title = decodeTitle(post.title.rendered);
      const rawContent = post.content?.rendered || '';
      const rawExcerpt = post.excerpt?.rendered || '';
      const content = cleanHtml(rawContent);
      const excerpt = extractExcerpt(rawExcerpt, rawContent);
      const date = post.date.split('T')[0];
      const readTime = calcReadTime(rawContent);
      const slug = generateSlug(title);
      const tags = deriveTags(category, title);

      let image = '';
      if (post.featured_media) {
        image = await fetchMediaUrl(post.featured_media);
      }

      const id = `art-${String(artNum).padStart(2, '0')}`;
      artNum++;

      console.log(`  ${id}: ${title.substring(0, 65)}... (${readTime})`);

      articles.push({
        id,
        slug,
        title,
        excerpt,
        content,
        image,
        category,
        author: 'Teka',
        date,
        readTime,
        tags,
      });
    }

    // Write category file
    const fileSlug = fileMap[category];
    const fileContent = generateCategoryFile(category, articles);
    const filePath = join(outputDir, `${fileSlug}.ts`);
    writeFileSync(filePath, fileContent, 'utf8');
    console.log(`  → ${fileSlug}.ts written (${articles.length} articles)`);
  }

  // Write index.ts
  const indexContent = `import type { Article } from '@/lib/types';
import { articlesCozinhar } from './cozinhar';
import { articlesDicas } from './dicas';
import { articlesInovacao } from './inovacao';
import { articlesDesign } from './design';
import { articlesCuriosidades } from './curiosidades';

export const articles: Article[] = [
  ...articlesCozinhar,
  ...articlesDicas,
  ...articlesInovacao,
  ...articlesDesign,
  ...articlesCuriosidades,
];
`;
  writeFileSync(join(outputDir, 'index.ts'), indexContent, 'utf8');
  console.log('\n→ index.ts written');

  // Summary
  const total = Object.values(categorized).reduce((sum, arr) => sum + arr.length, 0);
  console.log(`\n=== SUMMARY ===`);
  console.log(`Total articles: ${total}`);
  for (const [cat, posts] of Object.entries(categorized)) {
    console.log(`  ${cat}: ${posts.length}`);
  }
}

main().catch(console.error);
