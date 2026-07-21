import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { updateStoreItem, deleteStoreItem } from '@/lib/db/json-store';
import { requireAdmin, isNextResponse } from '@/lib/auth/admin-guard';

interface PageBlock {
  id: string;
  page: string;
  section: string;
  title?: string;
  subtitle?: string;
  content?: string;
  cta?: string;
  ctaLink?: string;
}

const updatePageBlockSchema = z.object({
  page: z.string().optional(),
  section: z.string().optional(),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  content: z.string().optional(),
  cta: z.string().optional(),
  ctaLink: z.string().optional(),
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
    const parsed = updatePageBlockSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await updateStoreItem<PageBlock>('pages.json', id, parsed.data);

    if (!updated) {
      return NextResponse.json(
        { error: 'Bloco de página não encontrado' },
        { status: 404 }
      );
    }

    revalidatePath('/');
    revalidatePath(`/${updated.page}`);

    console.log(`[ADMIN] Bloco de página atualizado: ${id}`);
    return NextResponse.json(updated);
  } catch (error) {
    console.log('[ADMIN] Erro ao atualizar bloco de página:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar bloco de página' },
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
    const deleted = await deleteStoreItem<PageBlock>('pages.json', id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Bloco de página não encontrado' },
        { status: 404 }
      );
    }

    revalidatePath('/');

    console.log(`[ADMIN] Bloco de página eliminado: ${id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log('[ADMIN] Erro ao eliminar bloco de página:', error);
    return NextResponse.json(
      { error: 'Erro ao eliminar bloco de página' },
      { status: 500 }
    );
  }
}
