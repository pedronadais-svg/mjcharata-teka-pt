import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';
import { readStore, addStoreItem } from '@/lib/db/json-store';
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

const createPageBlockSchema = z.object({
  page: z.string().min(1, 'Página é obrigatória'),
  section: z.string().min(1, 'Secção é obrigatória'),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  content: z.string().optional(),
  cta: z.string().optional(),
  ctaLink: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (isNextResponse(auth)) return auth;

    const { searchParams } = request.nextUrl;
    const page = searchParams.get('page');

    let blocks = await readStore<PageBlock[]>('pages.json');

    if (page) {
      blocks = blocks.filter((b) => b.page === page);
    }

    console.log(`[ADMIN] Listagem de blocos de página: ${blocks.length}`);

    return NextResponse.json({ data: blocks });
  } catch (error) {
    console.log('[ADMIN] Erro ao listar blocos de página:', error);
    return NextResponse.json(
      { error: 'Erro ao listar blocos de página' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (isNextResponse(auth)) return auth;

    const body = await request.json();
    const parsed = createPageBlockSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const block: PageBlock = {
      id: nanoid(),
      page: parsed.data.page,
      section: parsed.data.section,
      title: parsed.data.title,
      subtitle: parsed.data.subtitle,
      content: parsed.data.content,
      cta: parsed.data.cta,
      ctaLink: parsed.data.ctaLink,
    };

    await addStoreItem<PageBlock>('pages.json', block);
    revalidatePath('/');
    revalidatePath(`/${block.page}`);

    console.log(`[ADMIN] Bloco de página criado: ${block.id} (${block.page}/${block.section})`);

    return NextResponse.json(block, { status: 201 });
  } catch (error) {
    console.log('[ADMIN] Erro ao criar bloco de página:', error);
    return NextResponse.json(
      { error: 'Erro ao criar bloco de página' },
      { status: 500 }
    );
  }
}
