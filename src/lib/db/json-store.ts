import { eq, sql } from 'drizzle-orm';
import { db } from './client';
import {
  products,
  articles,
  orders,
  users,
  faqs,
  banners,
  pages,
  pdfTemplates,
  categories,
  auditLog,
  conversations,
  siteConfig,
} from './schema';

// Substitui o antigo store baseado em ficheiros JSON (src/data/db/*.json) por
// Postgres via Drizzle, mantendo exatamente as mesmas assinaturas para que
// nenhuma rota de API precise de ser alterada.

type CollectionTable = typeof products;

const COLLECTIONS: Record<string, CollectionTable> = {
  'products.json': products,
  'articles.json': articles,
  'orders.json': orders,
  'users.json': users,
  'faqs.json': faqs,
  'banners.json': banners,
  'pages.json': pages,
  'pdf-templates.json': pdfTemplates,
  'categories.json': categories,
  'audit-log.json': auditLog,
  'conversations.json': conversations,
};

// Documentos únicos (não são listas de entidades com id) — sempre lidos e
// escritos por inteiro.
const SINGLETONS = new Set(['settings.json', 'seo.json', 'navigation.json']);

function getCollection(filename: string): CollectionTable {
  const table = COLLECTIONS[filename];
  if (!table) {
    throw new Error(`[json-store] Coleção desconhecida: ${filename}`);
  }
  return table;
}

async function readSingleton<T>(filename: string): Promise<T> {
  const [row] = await db
    .select()
    .from(siteConfig)
    .where(eq(siteConfig.key, filename))
    .limit(1);
  return (row?.data ?? null) as T;
}

async function writeSingleton<T>(filename: string, data: T): Promise<void> {
  await db
    .insert(siteConfig)
    .values({ key: filename, data: data as object, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: siteConfig.key,
      set: { data: data as object, updatedAt: new Date() },
    });
}

export async function readStore<T>(filename: string): Promise<T> {
  if (SINGLETONS.has(filename)) {
    return readSingleton<T>(filename);
  }
  const table = getCollection(filename);
  const rows = await db.select({ data: table.data }).from(table);
  return rows.map((r) => r.data) as T;
}

export async function writeStore<T>(filename: string, data: T): Promise<void> {
  if (SINGLETONS.has(filename)) {
    return writeSingleton(filename, data);
  }
  const table = getCollection(filename);
  const items = data as unknown as Array<{ id: string }>;
  await db.transaction(async (tx) => {
    await tx.delete(table);
    if (items.length > 0) {
      await tx.insert(table).values(
        items.map((item) => ({ id: item.id, data: item as object, updatedAt: new Date() })),
      );
    }
  });
}

export async function readStoreItem<T extends { id: string }>(
  filename: string,
  id: string,
): Promise<T | null> {
  const table = getCollection(filename);
  const [row] = await db.select({ data: table.data }).from(table).where(eq(table.id, id)).limit(1);
  return (row?.data as T) ?? null;
}

export async function updateStoreItem<T extends { id: string }>(
  filename: string,
  id: string,
  updates: Partial<T>,
): Promise<T | null> {
  const table = getCollection(filename);
  const safeUpdates: Partial<T> & { id?: string } = { ...updates };
  delete safeUpdates.id;
  const [row] = await db
    .update(table)
    .set({
      data: sql`${table.data} || ${JSON.stringify(safeUpdates)}::jsonb`,
      updatedAt: new Date(),
    })
    .where(eq(table.id, id))
    .returning({ data: table.data });
  return (row?.data as T) ?? null;
}

export async function deleteStoreItem<T extends { id: string }>(
  filename: string,
  id: string,
): Promise<boolean> {
  const table = getCollection(filename);
  const deleted = await db.delete(table).where(eq(table.id, id)).returning({ id: table.id });
  return deleted.length > 0;
}

export async function addStoreItem<T extends { id: string }>(filename: string, item: T): Promise<T> {
  const table = getCollection(filename);
  await db.insert(table).values({ id: item.id, data: item as object, updatedAt: new Date() });
  return item;
}
