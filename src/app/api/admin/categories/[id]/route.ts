import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
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

interface Product {
  id: string;
  category: string;
  subcategory: string;
  [key: string]: unknown;
}

const updateCategorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  banner: z.string().optional(),
});

function findAndUpdateCategory(
  categories: Category[],
  id: string,
  updates: Record<string, unknown>
): { found: boolean; item?: Record<string, unknown> } {
  for (const cat of categories) {
    if (cat.id === id) {
      Object.assign(cat, updates);
      return { found: true, item: cat as unknown as Record<string, unknown> };
    }
    for (const sub of cat.subcategories) {
      if (sub.id === id) {
        Object.assign(sub, updates);
        return { found: true, item: sub as unknown as Record<string, unknown> };
      }
      if (sub.children) {
        for (const child of sub.children) {
          if (child.id === id) {
            Object.assign(child, updates);
            return { found: true, item: child as unknown as Record<string, unknown> };
          }
        }
      }
    }
  }
  return { found: false };
}

function findAndDeleteCategory(
  categories: Category[],
  id: string
): { found: boolean; categories: Category[] } {
  // Check top-level
  const topIndex = categories.findIndex((c) => c.id === id);
  if (topIndex !== -1) {
    categories.splice(topIndex, 1);
    return { found: true, categories };
  }

  for (const cat of categories) {
    const subIndex = cat.subcategories.findIndex((s) => s.id === id);
    if (subIndex !== -1) {
      cat.subcategories.splice(subIndex, 1);
      return { found: true, categories };
    }
    for (const sub of cat.subcategories) {
      if (sub.children) {
        const childIndex = sub.children.findIndex((c) => c.id === id);
        if (childIndex !== -1) {
          sub.children.splice(childIndex, 1);
          return { found: true, categories };
        }
      }
    }
  }

  return { found: false, categories };
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
    const parsed = updateCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.log('[ADMIN] Atualizar categoria:', id);
    const categories = await readStore<Category[]>('categories.json');
    const result = findAndUpdateCategory(categories, id, parsed.data);

    if (!result.found) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 });
    }

    await writeStore('categories.json', categories);
    revalidatePath('/admin/categories');

    return NextResponse.json(result.item);
  } catch (error) {
    console.log('[ADMIN] Erro ao atualizar categoria:', error);
    return NextResponse.json({ error: 'Erro ao atualizar categoria' }, { status: 500 });
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
    console.log('[ADMIN] Eliminar categoria:', id);

    // Check if any products use this category
    const products = await readStore<Product[]>('products.json');
    const hasProducts = products.some(
      (p) => p.category === id || p.subcategory === id
    );

    if (hasProducts) {
      return NextResponse.json(
        { error: 'Não é possível eliminar: existem produtos associados a esta categoria' },
        { status: 409 }
      );
    }

    const categories = await readStore<Category[]>('categories.json');
    const result = findAndDeleteCategory(categories, id);

    if (!result.found) {
      return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 });
    }

    await writeStore('categories.json', result.categories);
    revalidatePath('/admin/categories');

    return NextResponse.json({ message: 'Categoria eliminada com sucesso' });
  } catch (error) {
    console.log('[ADMIN] Erro ao eliminar categoria:', error);
    return NextResponse.json({ error: 'Erro ao eliminar categoria' }, { status: 500 });
  }
}
