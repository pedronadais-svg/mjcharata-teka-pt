import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { updateStoreItem, deleteStoreItem } from '@/lib/db/json-store';
import { requireAdmin, isNextResponse } from '@/lib/auth/admin-guard';

interface Banner {
  id: string;
  type: 'hero' | 'promotional';
  title: string;
  subtitle: string;
  mediaType: 'video' | 'image';
  mediaUrl: string;
  posterUrl: string;
  ctaText: string;
  ctaLink: string;
  order: number;
  isActive: boolean;
}

const updateBannerSchema = z.object({
  type: z.enum(['hero', 'promotional']).optional(),
  title: z.string().min(1, 'Título é obrigatório').optional(),
  subtitle: z.string().optional(),
  mediaType: z.enum(['video', 'image']).optional(),
  mediaUrl: z.string().optional(),
  posterUrl: z.string().optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  order: z.number().optional(),
  isActive: z.boolean().optional(),
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
    const parsed = updateBannerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await updateStoreItem<Banner>('banners.json', id, parsed.data);

    if (!updated) {
      return NextResponse.json(
        { error: 'Banner não encontrado' },
        { status: 404 }
      );
    }

    revalidatePath('/');

    console.log(`[ADMIN] Banner atualizado: ${id}`);
    return NextResponse.json(updated);
  } catch (error) {
    console.log('[ADMIN] Erro ao atualizar banner:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar banner' },
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
    const deleted = await deleteStoreItem<Banner>('banners.json', id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Banner não encontrado' },
        { status: 404 }
      );
    }

    revalidatePath('/');

    console.log(`[ADMIN] Banner eliminado: ${id}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log('[ADMIN] Erro ao eliminar banner:', error);
    return NextResponse.json(
      { error: 'Erro ao eliminar banner' },
      { status: 500 }
    );
  }
}
