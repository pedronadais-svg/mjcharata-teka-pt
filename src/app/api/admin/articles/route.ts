import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';
import { readStore, addStoreItem } from '@/lib/db/json-store';
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

const createArticleSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  excerpt: z.string().min(1, 'Resumo é obrigatório'),
  content: z.string().min(1, 'Conteúdo é obrigatório'),
  image: z.string().optional().default(''),
  category: z.string().min(1, 'Categoria é obrigatória'),
  author: z.string().optional().default('Teka Portugal'),
  date: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  status: z.enum(['published', 'draft']).optional().default('draft'),
  order: z.number().optional().default(0),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function estimateReadTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min`;
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (isNextResponse(auth)) return auth;

    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    let articles = await readStore<Article[]>('articles.json');

    if (category) {
      articles = articles.filter((a) => a.category === category);
    }
    if (status) {
      articles = articles.filter((a) => a.status === status);
    }

    const total = articles.length;
    const start = (page - 1) * limit;
    const paginated = articles.slice(start, start + limit);

    console.log(`[ADMIN] Listagem de artigos: ${paginated.length}/${total}`);

    return NextResponse.json({
      data: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.log('[ADMIN] Erro ao listar artigos:', error);
    return NextResponse.json(
      { error: 'Erro ao listar artigos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (isNextResponse(auth)) return auth;

    const body = await request.json();
    const parsed = createArticleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const now = new Date().toISOString();

    const article: Article = {
      id: nanoid(),
      slug: slugify(data.title),
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      image: data.image,
      category: data.category,
      author: data.author,
      date: data.date || now.split('T')[0],
      readTime: estimateReadTime(data.content),
      tags: data.tags,
      status: data.status,
      updatedAt: now,
      order: data.order,
    };

    await addStoreItem<Article>('articles.json', article);
    revalidatePath('/');
    revalidatePath('/novidades');

    console.log(`[ADMIN] Artigo criado: ${article.id} - ${article.title}`);

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.log('[ADMIN] Erro ao criar artigo:', error);
    return NextResponse.json(
      { error: 'Erro ao criar artigo' },
      { status: 500 }
    );
  }
}
