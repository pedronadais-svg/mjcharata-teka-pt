import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export interface AdminSession {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'distributor';
}

export async function requireAdmin(): Promise<AdminSession | NextResponse> {
  const cookieStore = await cookies();
  const session = cookieStore.get('teka_session');

  if (!session?.value) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  try {
    const parsed = JSON.parse(session.value) as AdminSession;
    if (parsed.role !== 'admin') {
      return NextResponse.json({ error: 'Sem permissões' }, { status: 403 });
    }
    return parsed;
  } catch {
    return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 });
  }
}

export async function requireAuth(): Promise<AdminSession | NextResponse> {
  const cookieStore = await cookies();
  const session = cookieStore.get('teka_session');

  if (!session?.value) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
  }

  try {
    return JSON.parse(session.value) as AdminSession;
  } catch {
    return NextResponse.json({ error: 'Sessão inválida' }, { status: 401 });
  }
}

export function isNextResponse(value: AdminSession | NextResponse): value is NextResponse {
  return value instanceof NextResponse;
}
