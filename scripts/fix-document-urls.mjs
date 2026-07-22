// Atualiza os URLs dos documentos (manuais PDF) dos produtos na Postgres:
// de caminho local /documents/... (fora do deploy, 3.3GB) para o novo
// alojamento em www.mdvmadeiras.com/documents/... (cPanel).
import './load-env.mjs';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { eq, sql } from 'drizzle-orm';
import * as schema from '../src/lib/db/schema.ts';

const NEW_BASE = 'https://www.mdvmadeiras.com';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Define DIRECT_URL (ou DATABASE_URL) no .env.local.');
  process.exit(1);
}

const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

async function main() {
  const rows = await db.select().from(schema.products);
  console.log(`A processar ${rows.length} produtos...`);

  let productsUpdated = 0;
  let docsUpdated = 0;

  for (const row of rows) {
    const product = row.data;
    const documents = product.documents;
    if (!Array.isArray(documents) || documents.length === 0) continue;

    let changed = false;
    const newDocuments = documents.map((doc) => {
      if (doc && typeof doc.url === 'string' && doc.url.startsWith('/documents/')) {
        changed = true;
        docsUpdated++;
        return { ...doc, url: NEW_BASE + doc.url };
      }
      return doc;
    });

    if (changed) {
      const updated = { ...product, documents: newDocuments };
      await db
        .update(schema.products)
        .set({ data: updated, updatedAt: new Date() })
        .where(eq(schema.products.id, row.id));
      productsUpdated++;
    }
  }

  console.log(`Concluído: ${productsUpdated} produtos atualizados, ${docsUpdated} documentos corrigidos.`);
  await client.end();
}

main().catch(async (error) => {
  console.error(error);
  await client.end();
  process.exit(1);
});
