import { pgTable, text, jsonb, timestamp } from 'drizzle-orm/pg-core';

// Uma linha por entidade. `data` guarda o objeto completo (mesma forma que
// tinha no ficheiro JSON); colunas tipadas/índices ficam para depois, se
// vierem a ser precisos para performance.
function collectionTable(name: string) {
  return pgTable(name, {
    id: text('id').primaryKey(),
    data: jsonb('data').notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  });
}

export const products = collectionTable('products');
export const articles = collectionTable('articles');
export const orders = collectionTable('orders');
export const users = collectionTable('users');
export const faqs = collectionTable('faqs');
export const banners = collectionTable('banners');
export const pages = collectionTable('pages');
export const pdfTemplates = collectionTable('pdf_templates');
export const categories = collectionTable('categories');
export const auditLog = collectionTable('audit_log');
export const conversations = collectionTable('conversations');

// Documentos "singleton" (settings.json, seo.json, navigation.json) — sempre
// lidos/escritos por inteiro, nunca por item individual.
export const siteConfig = pgTable('site_config', {
  key: text('key').primaryKey(),
  data: jsonb('data').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
