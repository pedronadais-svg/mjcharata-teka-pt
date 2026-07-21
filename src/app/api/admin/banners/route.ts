import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';
import { readStore, addStoreItem } from '@/lib/db/json-store';
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

const createBannerSchema = z.object({
  type: z.enum(['hero', 'promotional'], { message: 'Tipo é obrigatório' }),
  title: z.string().min(1, 'Título é obrigatório'),
  subtitle: z.string().optional().default(''),
  mediaType: z.enum(['video', 'image'], { message: 'Tipo de media é obrigatório' }),
  mediaUrl: z.string().min(1, 'URL da media é obrigatório'),
  posterUrl: z.string().optional().default(''),
  ctaText: z.string().optional().default(''),
  ctaLink: z.string().optional().default(''),
  order: z.number().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (isNextResponse(auth)) return auth;

    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type');

    let banners = await readStore<Banner[]>('banners.json');

    if (type) {
      banners = banners.filter((b) => b.type === type);
    }

    console.log(`[ADMIN] Listagem de banners: ${banners.length}`);

    return NextResponse.json({ data: banners });
  } catch (error) {
    console.log('[ADMIN] Erro ao listar banners:', error);
    return NextResponse.json(
      { error: 'Erro ao listar banners' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (isNextResponse(auth)) return auth;

    const body = await request.json();
    const parsed = createBannerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const banner: Banner = {
      id: nanoid(),
      type: parsed.data.type,
      title: parsed.data.title,
      subtitle: parsed.data.subtitle,
      mediaType: parsed.data.mediaType,
      mediaUrl: parsed.data.mediaUrl,
      posterUrl: parsed.data.posterUrl,
      ctaText: parsed.data.ctaText,
      ctaLink: parsed.data.ctaLink,
      order: parsed.data.order,
      isActive: parsed.data.isActive,
    };

    await addStoreItem<Banner>('banners.json', banner);
    revalidatePath('/');

    console.log(`[ADMIN] Banner criado: ${banner.id} (${banner.type})`);

    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    console.log('[ADMIN] Erro ao criar banner:', error);
    return NextResponse.json(
      { error: 'Erro ao criar banner' },
      { status: 500 }
    );
  }
}
