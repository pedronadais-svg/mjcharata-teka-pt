// Loader minimalista de .env.local / .env — evita depender do pacote dotenv
// só para os scripts standalone (drizzle-kit, seed) correrem fora do Next.js.
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

function loadFile(path) {
  if (!existsSync(path)) return;
  const content = readFileSync(path, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadFile(join(process.cwd(), '.env'));
loadFile(join(process.cwd(), '.env.local'));
