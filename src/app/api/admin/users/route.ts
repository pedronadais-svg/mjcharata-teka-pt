import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { readStore, addStoreItem } from '@/lib/db/json-store';
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

const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  company: z.string().optional(),
  role: z.enum(['admin', 'distributor'], { message: 'Role deve ser admin ou distributor' }),
  password: z.string().min(6, 'Password deve ter pelo menos 6 caracteres'),
});

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (isNextResponse(auth)) return auth;

    console.log('[ADMIN] Listar utilizadores');
    const users = await readStore<User[]>('users.json');

    const sanitized = users.map(({ passwordHash, ...rest }) => rest);
    return NextResponse.json(sanitized);
  } catch (error) {
    console.log('[ADMIN] Erro ao listar utilizadores:', error);
    return NextResponse.json({ error: 'Erro ao listar utilizadores' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (isNextResponse(auth)) return auth;

    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email, name, company, role, password } = parsed.data;

    const users = await readStore<User[]>('users.json');
    if (users.some((u) => u.email === email)) {
      return NextResponse.json({ error: 'Email já registado' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const newUser: User = {
      id: nanoid(),
      email,
      name,
      company,
      role,
      passwordHash,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    await addStoreItem('users.json', newUser);
    console.log('[ADMIN] Utilizador criado:', newUser.id);
    revalidatePath('/admin/users');

    const { passwordHash: _, ...sanitized } = newUser;
    return NextResponse.json(sanitized, { status: 201 });
  } catch (error) {
    console.log('[ADMIN] Erro ao criar utilizador:', error);
    return NextResponse.json({ error: 'Erro ao criar utilizador' }, { status: 500 });
  }
}
