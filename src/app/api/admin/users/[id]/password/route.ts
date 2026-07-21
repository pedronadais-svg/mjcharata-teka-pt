import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { updateStoreItem, readStoreItem } from '@/lib/db/json-store';
import { requireAdmin, isNextResponse } from '@/lib/auth/admin-guard';

interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
  role: 'admin' | 'distributor';
  passwordHash: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

const changePasswordSchema = z.object({
  password: z.string().min(6, 'Password deve ter pelo menos 6 caracteres'),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (isNextResponse(auth)) return auth;

    const { id } = await params;
    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const user = await readStoreItem<User>('users.json', id);
    if (!user) {
      return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    await updateStoreItem<User>('users.json', id, { passwordHash } as Partial<User>);

    console.log('[ADMIN] Password alterada para utilizador:', id);
    return NextResponse.json({ message: 'Password alterada com sucesso' });
  } catch (error) {
    console.log('[ADMIN] Erro ao alterar password:', error);
    return NextResponse.json({ error: 'Erro ao alterar password' }, { status: 500 });
  }
}
