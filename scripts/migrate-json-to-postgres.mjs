// Migra os dados de src/data/db/*.json (+ conversas do chatbot) para o
// Postgres (Supabase). Corre-se uma vez, manualmente, contra o novo projeto:
//
//   npm run db:seed
//
// Usa DIRECT_URL (ligação direta, não o pooler) porque faz várias
// queries/inserts em sequência dentro de um script curto — não precisa de
// connection pooling.
import './load-env.mjs';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import * as schema from '../src/lib/db/schema.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Define DIRECT_URL (ou DATABASE_URL) no .env.local antes de correr o seed.');
  process.exit(1);
}

const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

// Coleções (linha por entidade, id obrigatório)
const COLLECTIONS = [
  { file: 'products.json', table: schema.products },
  { file: 'articles.json', table: schema.articles },
  { file: 'orders.json', table: schema.orders },
  { file: 'users.json', table: schema.users },
  { file: 'faqs.json', table: schema.faqs },
  { file: 'banners.json', table: schema.banners },
  { file: 'pages.json', table: schema.pages },
  { file: 'pdf-templates.json', table: schema.pdfTemplates },
  { file: 'categories.json', table: schema.categories },
  { file: 'audit-log.json', table: schema.auditLog },
];

// Documentos singleton (ficheiro inteiro = 1 linha em site_config)
const SINGLETONS = ['settings.json', 'seo.json', 'navigation.json'];

function readJson(path) {
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf-8'));
}

async function seedCollection(file, table) {
  const path = join(ROOT, 'src/data/db', file);
  const items = readJson(path);
  if (!items) {
    console.log(`  (sem ficheiro) ${file}`);
    return;
  }
  if (!Array.isArray(items) || items.length === 0) {
    console.log(`  0 registos — ${file}`);
    return;
  }
  const rows = items.map((item) => ({ id: item.id, data: item, updatedAt: new Date() }));
  await db
    .insert(table)
    .values(rows)
    .onConflictDoUpdate({
      target: table.id,
      set: { data: sql`excluded.data`, updatedAt: sql`excluded.updated_at` },
    });
  console.log(`  ${rows.length} registos — ${file}`);
}

async function seedSingleton(file) {
  const path = join(ROOT, 'src/data/db', file);
  const data = readJson(path);
  if (data === null) {
    console.log(`  (sem ficheiro) ${file}`);
    return;
  }
  await db
    .insert(schema.siteConfig)
    .values({ key: file, data, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: schema.siteConfig.key,
      set: { data, updatedAt: new Date() },
    });
  console.log(`  1 documento — ${file}`);
}

async function seedConversations() {
  const path = join(ROOT, 'src/data/chatbot/conversations.json');
  const items = readJson(path);
  if (!items || !Array.isArray(items) || items.length === 0) {
    console.log('  0 registos — chatbot/conversations.json');
    return;
  }
  const rows = items.map((item) => ({ id: item.id, data: item, updatedAt: new Date() }));
  await db
    .insert(schema.conversations)
    .values(rows)
    .onConflictDoUpdate({
      target: schema.conversations.id,
      set: { data: sql`excluded.data`, updatedAt: sql`excluded.updated_at` },
    });
  console.log(`  ${rows.length} registos — chatbot/conversations.json`);
}

async function main() {
  console.log('A migrar coleções...');
  for (const { file, table } of COLLECTIONS) {
    await seedCollection(file, table);
  }
  console.log('A migrar documentos singleton...');
  for (const file of SINGLETONS) {
    await seedSingleton(file);
  }
  console.log('A migrar conversas do chatbot...');
  await seedConversations();
  console.log('Concluído.');
  await client.end();
}

main().catch(async (error) => {
  console.error(error);
  await client.end();
  process.exit(1);
});
