import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src/data/chatbot');

const FILE_MAP: Record<string, string> = {
  prompt: 'system-prompt.md',
  knowledge: 'knowledge-base.json',
  faqs: 'custom-faqs.json',
  config: 'tone-config.json',
  blocked: 'blocked-topics.json',
};

async function checkAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get('teka_session');
  if (!session?.value) return false;
  try {
    const user = JSON.parse(session.value);
    return user.role === 'admin';
  } catch { return false; }
}

export async function GET(request: Request) {
  if (!(await checkAdmin())) return Response.json({ error: 'Não autorizado' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'prompt';
  const filename = FILE_MAP[type];
  if (!filename) return Response.json({ error: 'Tipo inválido' }, { status: 400 });

  try {
    const content = fs.readFileSync(path.join(DATA_DIR, filename), 'utf-8');
    return Response.json({ content, type });
  } catch {
    return Response.json({ content: '', type });
  }
}

export async function POST(request: Request) {
  if (!(await checkAdmin())) return Response.json({ error: 'Não autorizado' }, { status: 401 });

  const { type, content } = await request.json();
  const filename = FILE_MAP[type];
  if (!filename) return Response.json({ error: 'Tipo inválido' }, { status: 400 });

  try {
    fs.writeFileSync(path.join(DATA_DIR, filename), content, 'utf-8');
    return Response.json({ success: true });
  } catch (e) {
    return Response.json({ error: 'Erro ao guardar' }, { status: 500 });
  }
}
