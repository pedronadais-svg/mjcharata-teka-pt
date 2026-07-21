import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { readStoreItem, updateStoreItem } from '@/lib/db/json-store';
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

const updateUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').optional(),
  email: z.string().email('Email inválido').optional(),
  company: z.string().optional(),
  role: z.enum(['admin', 'distributor'], { message: 'Role deve ser admin ou distributor' }).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (isNextResponse(auth)) return auth;

    const { id } = await params;
    console.log('[ADMIN] Obter utilizador:', id);

    const user = await readStoreItem<User>('users.json', id);
    if (!user) {
      return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 });
    }

    const { passwordHash, ...sanitized } = user;
    return NextResponse.json(sanitized);
  } catch (error) {
    console.log('[ADMIN] Erro ao obter utilizador:', error);
    return NextResponse.json({ error: 'Erro ao obter utilizador' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (isNextResponse(auth)) return auth;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.log('[ADMIN] Atualizar utilizador:', id);
    const updated = await updateStoreItem<User>('users.json', id, parsed.data);

    if (!updated) {
      return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 });
    }

    revalidatePath('/admin/users');
    const { passwordHash, ...sanitized } = updated;
    return NextResponse.json(sanitized);
  } catch (error) {
    console.log('[ADMIN] Erro ao atualizar utilizador:', error);
    return NextResponse.json({ error: 'Erro ao atualizar utilizador' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (isNextResponse(auth)) return auth;

    const { id } = await params;
    console.log('[ADMIN] Desativar utilizador:', id);

    const updated = await updateStoreItem<User>('users.json', id, { isActive: false } as Partial<User>);

    if (!updated) {
      return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 });
    }

    revalidatePath('/admin/users');
    const { passwordHash, ...sanitized } = updated;
    return NextResponse.json(sanitized);
  } catch (error) {
    console.log('[ADMIN] Erro ao desativar utilizador:', error);
    return NextResponse.json({ error: 'Erro ao desativar utilizador' }, { status: 500 });
  }
}
