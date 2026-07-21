import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'src/data/chatbot/ai-config.json');

interface AIConfig {
  aiEnabled: boolean;
  apiKey: string;
}

function loadConfig(): AIConfig {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    }
  } catch {}
  return { aiEnabled: false, apiKey: '' };
}

function saveConfig(config: AIConfig) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

function maskKey(key: string): string {
  if (!key || key.length < 12) return '';
  return key.substring(0, 7) + '...' + key.substring(key.length - 4);
}

async function checkAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get('teka_session');
  if (!session?.value) return false;
  try { return JSON.parse(session.value).role === 'admin'; } catch { return false; }
}

export async function GET() {
  if (!(await checkAdmin())) return Response.json({ error: 'Não autorizado' }, { status: 401 });

  const config = loadConfig();
  // Também verificar se a env var está definida (tem prioridade)
  const envKey = process.env.ANTHROPIC_API_KEY;

  return Response.json({
    aiEnabled: config.aiEnabled || !!envKey,
    apiKeyMasked: envKey ? maskKey(envKey) : config.apiKey ? maskKey(config.apiKey) : '',
    keyStatus: (envKey || config.apiKey) ? 'configured' : 'missing',
    source: envKey ? 'env' : config.apiKey ? 'backoffice' : 'none',
  });
}

export async function POST(request: Request) {
  if (!(await checkAdmin())) return Response.json({ error: 'Não autorizado' }, { status: 401 });

  const { aiEnabled, apiKey } = await request.json();
  const config = loadConfig();

  config.aiEnabled = aiEnabled ?? config.aiEnabled;

  // Só actualizar a key se foi fornecida uma nova (começa com sk-)
  if (apiKey && apiKey.startsWith('sk-')) {
    config.apiKey = apiKey;
  }

  saveConfig(config);

  // Definir na env para que a API route do chat a use
  if (config.apiKey) {
    process.env.ANTHROPIC_API_KEY = config.apiKey;
  }
  if (config.aiEnabled) {
    process.env.NEXT_PUBLIC_AI_CHAT = 'true';
  } else {
    delete process.env.NEXT_PUBLIC_AI_CHAT;
  }

  return Response.json({
    success: true,
    aiEnabled: config.aiEnabled,
    apiKeyMasked: config.apiKey ? maskKey(config.apiKey) : '',
    keyStatus: config.apiKey ? 'configured' : 'missing',
  });
}
