import './scripts/load-env.mjs';
import { defineConfig } from 'drizzle-kit';

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Define DIRECT_URL (ou DATABASE_URL) no .env.local antes de correr drizzle-kit.');
}

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionString,
  },
});
