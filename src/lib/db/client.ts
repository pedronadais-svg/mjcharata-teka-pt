import 'server-only';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

declare global {
  var __teka_pg_client__: ReturnType<typeof postgres> | undefined;
}

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL não está definida — configura o .env.local (ver .env.local.example)');
  }
  // prepare:false é necessário quando se liga através do connection pooler
  // (pgbouncer / Supavisor em modo transaction) do Supabase.
  return postgres(connectionString, { prepare: false });
}

// Cache em globalThis para não abrir novas ligações a cada hot-reload em dev.
const client = globalThis.__teka_pg_client__ ?? createClient();
if (process.env.NODE_ENV !== 'production') {
  globalThis.__teka_pg_client__ = client;
}

export const db = drizzle(client, { schema });
