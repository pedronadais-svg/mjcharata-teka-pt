import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';
import { readStore, writeStore } from '@/lib/db/json-store';
import { requireAdmin, isNextResponse } from '@/lib/auth/admin-guard';

interface SubcategoryChild {
  id: string;
  slug: string;
  name: string;
}

interface Subcategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
  children?: SubcategoryChild[];
}

interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  banner: string;
  subcategories: Subcategory[];
}

const createSubcategorySchema = z.object({
  parentId: z.string().min(1, 'ID da categoria pai é obrigatório'),
  subcategoryId: z.string().optional(),
  slug: z.string().min(1, 'Slug é obrigatório'),
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  image: z.string().optional(),
});

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (isNextResponse(auth)) return auth;

    console.log('[ADMIN] Listar categorias');
    const categories = await readStore<Category[]>('categories.json');
    return NextResponse.json(categories);
  } catch (error) {
    console.log('[ADMIN] Erro ao listar categorias:', error);
    return NextResponse.json({ error: 'Erro ao listar categorias' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (isNextResponse(auth)) return auth;

    const body = await request.json();
    const parsed = createSubcategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { parentId, subcategoryId, slug, name, description, image } = parsed.data;
    const categories = await readStore<Category[]>('categories.json');

    const parentIndex = categories.findIndex((c) => c.id === parentId);
    if (parentIndex === -1) {
      return NextResponse.json({ error: 'Categoria pai não encontrada' }, { status: 404 });
    }

    const newId = nanoid();

    if (subcategoryId) {
      // Add as child of a subcategory
      const subIndex = categories[parentIndex].subcategories.findIndex(
        (s) => s.id === subcategoryId
      );
      if (subIndex === -1) {
        return NextResponse.json({ error: 'Subcategoria não encontrada' }, { status: 404 });
      }
      if (!categories[parentIndex].subcategories[subIndex].children) {
        categories[parentIndex].subcategories[subIndex].children = [];
      }
      categories[parentIndex].subcategories[subIndex].children!.push({
        id: newId,
        slug,
        name,
      });
    } else {
      // Add as subcategory of parent
      categories[parentIndex].subcategories.push({
        id: newId,
        slug,
        name,
        description: description ?? '',
        image: image ?? '',
        productCount: 0,
      });
    }

    await writeStore('categories.json', categories);
    console.log('[ADMIN] Subcategoria criada:', newId);
    revalidatePath('/admin/categories');
    revalidatePath(`/${parentId}`);

    return NextResponse.json({ id: newId, slug, name }, { status: 201 });
  } catch (error) {
    console.log('[ADMIN] Erro ao criar subcategoria:', error);
    return NextResponse.json({ error: 'Erro ao criar subcategoria' }, { status: 500 });
  }
}
