import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import {
  readStoreItem,
  updateStoreItem,
  deleteStoreItem,
} from '@/lib/db/json-store';
import { requireAdmin, isNextResponse } from '@/lib/auth/admin-guard';

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  tags: string[];
  status: 'published' | 'draft';
  updatedAt: string;
  order: number;
}

const updateArticleSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').optional(),
  slug: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  image: z.string().optional(),
  category: z.string().optional(),
  author: z.string().optional(),
  date: z.string().optional(),
  readTime: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['published', 'draft']).optional(),
  order: z.number().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (isNextResponse(auth)) return auth;

    const { id } = await params;
    const article = await readStoreItem<Article>('articles.json', id);

    if (!article) {
      return NextResponse.json(
        { error: 'Artigo não encontrado' },
        { status: 404 }
      );
    }

    console.log(`[ADMIN] Artigo consultado: ${id}`);
    return NextResponse.json(article);
  } catch (error) {
    console.log('[ADMIN] Erro ao consultar artigo:', error);
    return NextResponse.json(
      { error: 'Erro ao consultar artigo' },
      { status: 500 }
    );
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
    const parsed = updateArticleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updates = {
      ...parsed.data,
      updatedAt: new Date().toISOString(),
    };

    const updated = await updateStoreItem<Article>('articles.json', id, updates);

    if (!updated) {
      return NextResponse.json(
        { error: 'Artigo não encontrado' },
        { status: 404 }
      );
    }

    revalidatePath('/');
    revalidatePath('/novidades');
    revalidatePath(`/novidades/${updated.slug}`);

    console.log(`[ADMIN] Artigo atualizado: ${id}`);
    return NextResponse.json(updated);
  } catch (error) {
    console.log('[ADMIN] Erro ao atualizar artigo:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar artigo' },
      { status: 500 }
    );
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
    const deleted = await deleteStoreItem<Article>('articles.json', id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Artigo não encontrado' },
        { status: 404 }
      );
    }

    revalidatePath('/');
    revalidatePath('/novidades');

    console.log(`[ADMIN] Artigo eliminado: ${id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log('[ADMIN] Erro ao eliminar artigo:', error);
    return NextResponse.json(
      { error: 'Erro ao eliminar artigo' },
      { status: 500 }
    );
  }
}
