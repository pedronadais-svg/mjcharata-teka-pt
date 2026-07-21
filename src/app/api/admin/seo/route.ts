import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { readStore, writeStore } from '@/lib/db/json-store';
import { requireAdmin, isNextResponse } from '@/lib/auth/admin-guard';

interface SeoEntry {
  route: string;
  title: string;
  description: string;
  ogImage: string;
}

const updateSeoSchema = z.object({
  route: z.string().min(1, 'Rota é obrigatória'),
  title: z.string().optional(),
  description: z.string().optional(),
  ogImage: z.string().optional(),
});

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (isNextResponse(auth)) return auth;

    console.log('[ADMIN] Listar SEO');
    const seoEntries = await readStore<SeoEntry[]>('seo.json');
    return NextResponse.json(seoEntries);
  } catch (error) {
    console.log('[ADMIN] Erro ao listar SEO:', error);
    return NextResponse.json({ error: 'Erro ao listar dados de SEO' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (isNextResponse(auth)) return auth;

    const body = await request.json();
    const parsed = updateSeoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.log('[ADMIN] Atualizar SEO para rota:', parsed.data.route);
    const entries = await readStore<SeoEntry[]>('seo.json');

    const index = entries.findIndex((e) => e.route === parsed.data.route);

    if (index === -1) {
      entries.push({
        route: parsed.data.route,
        title: parsed.data.title ?? '',
        description: parsed.data.description ?? '',
        ogImage: parsed.data.ogImage ?? '',
      });
    } else {
      entries[index] = {
        ...entries[index],
        ...parsed.data,
      };
    }

    await writeStore('seo.json', entries);
    revalidatePath(parsed.data.route);
    revalidatePath('/admin/seo');

    return NextResponse.json(entries.find((e) => e.route === parsed.data.route));
  } catch (error) {
    console.log('[ADMIN] Erro ao atualizar SEO:', error);
    return NextResponse.json({ error: 'Erro ao atualizar dados de SEO' }, { status: 500 });
  }
}
