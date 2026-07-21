import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { updateStoreItem, deleteStoreItem } from '@/lib/db/json-store';
import { requireAdmin, isNextResponse } from '@/lib/auth/admin-guard';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const updateFaqSchema = z.object({
  question: z.string().min(1, 'Pergunta é obrigatória').optional(),
  answer: z.string().min(1, 'Resposta é obrigatória').optional(),
  category: z.string().optional(),
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
    const parsed = updateFaqSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await updateStoreItem<FAQ>('faqs.json', id, parsed.data);

    if (!updated) {
      return NextResponse.json(
        { error: 'FAQ não encontrada' },
        { status: 404 }
      );
    }

    revalidatePath('/suporte');

    console.log(`[ADMIN] FAQ atualizada: ${id}`);
    return NextResponse.json(updated);
  } catch (error) {
    console.log('[ADMIN] Erro ao atualizar FAQ:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar FAQ' },
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
    const deleted = await deleteStoreItem<FAQ>('faqs.json', id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'FAQ não encontrada' },
        { status: 404 }
      );
    }

    revalidatePath('/suporte');

    console.log(`[ADMIN] FAQ eliminada: ${id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log('[ADMIN] Erro ao eliminar FAQ:', error);
    return NextResponse.json(
      { error: 'Erro ao eliminar FAQ' },
      { status: 500 }
    );
  }
}
