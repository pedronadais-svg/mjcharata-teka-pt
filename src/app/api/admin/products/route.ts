import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';
import { readStore, addStoreItem } from '@/lib/db/json-store';
import { requireAdmin, isNextResponse } from '@/lib/auth/admin-guard';
import type { Product } from '@/lib/types';

// ---------------------------------------------------------------------------
// Tipos internos
// ---------------------------------------------------------------------------

interface StoredProduct extends Product {
  updatedAt: string;
  status: 'active' | 'draft' | 'archived';
  updatedBy?: string;
}

// ---------------------------------------------------------------------------
// Validacao Zod para criacao de produto
// ---------------------------------------------------------------------------

const productCreateSchema = z.object({
  name: z.string().min(1, 'Nome e obrigatorio'),
  slug: z.string().min(1, 'Slug e obrigatorio'),
  reference: z.string().min(1, 'Referencia e obrigatoria'),
  shortDescription: z.string().default(''),
  description: z.string().default(''),
  category: z.string().min(1, 'Categoria e obrigatoria'),
  subcategory: z.string().min(1, 'Subcategoria e obrigatoria'),
  subfamily: z.string().optional(),
  images: z.array(z.string()).default([]),
  thumbnail: z.string().default(''),
  energyRating: z
    .enum(['A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'])
    .optional(),
  ean: z.string().optional(),
  refPhc: z.string().optional(),
  priceAOA: z.number().min(0, 'Preco deve ser positivo').optional(),
  features: z
    .array(
      z.object({
        icon: z.string().optional(),
        title: z.string(),
        description: z.string(),
      }),
    )
    .default([]),
  specifications: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
        group: z.string().optional(),
      }),
    )
    .default([]),
  variants: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        color: z.string().optional(),
        reference: z.string(),
        image: z.string().optional(),
      }),
    )
    .default([]),
  documents: z.array(z.any()).default([]),
  relatedProductIds: z.array(z.string()).default([]),
  isNew: z.boolean().optional(),
  isPromoted: z.boolean().optional(),
  tags: z.array(z.string()).default([]),
  color: z.string().optional(),
  edition: z.string().optional(),
  installation: z.string().optional(),
  width: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Remove diacriticos para permitir pesquisa insensivel a acentos.
 */
function removeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

const PRODUCTS_FILE = 'products.json';

// ---------------------------------------------------------------------------
// GET  /api/admin/products
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (isNextResponse(auth)) return auth;

    const { searchParams } = request.nextUrl;

    // Paginacao
    const page = Math.max(1, Number(searchParams.get('page') ?? 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? 25)));

    // Filtros
    const search = searchParams.get('search') ?? '';
    const category = searchParams.get('category') ?? '';
    const subcategory = searchParams.get('subcategory') ?? '';
    const status = searchParams.get('status') ?? '';

    // Ordenacao
    const sortField = searchParams.get('sort') ?? 'updatedAt';
    const sortOrder = searchParams.get('order') ?? 'desc';

    let products = await readStore<StoredProduct[]>(PRODUCTS_FILE);

    // --- Filtro por pesquisa (insensivel a acentos) ---
    if (search) {
      const needle = removeDiacritics(search).toLowerCase();
      products = products.filter((p) => {
        const haystack = removeDiacritics(
          `${p.name} ${p.reference} ${p.ean ?? ''}`,
        ).toLowerCase();
        return haystack.includes(needle);
      });
    }

    // --- Filtro por categoria ---
    if (category) {
      products = products.filter((p) => p.category === category);
    }

    // --- Filtro por subcategoria ---
    if (subcategory) {
      products = products.filter((p) => p.subcategory === subcategory);
    }

    // --- Filtro por status ---
    if (status) {
      products = products.filter((p) => p.status === status);
    }

    // --- Ordenacao ---
    const validSortFields = ['name', 'reference', 'priceAOA', 'updatedAt'] as const;
    const field = validSortFields.includes(sortField as typeof validSortFields[number])
      ? (sortField as keyof StoredProduct)
      : 'updatedAt';

    products.sort((a, b) => {
      const aVal = a[field] ?? '';
      const bVal = b[field] ?? '';

      let cmp: number;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        cmp = aVal - bVal;
      } else {
        cmp = String(aVal).localeCompare(String(bVal), 'pt');
      }

      return sortOrder === 'asc' ? cmp : -cmp;
    });

    // --- Paginacao ---
    const total = products.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paged = products.slice(start, start + limit);

    return NextResponse.json({
      products: paged,
      pagination: { page, limit, total, totalPages },
    });
  } catch (error) {
    console.error('[ADMIN] Erro ao listar produtos:', error);
    return NextResponse.json(
      { error: 'Erro interno ao listar produtos' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST  /api/admin/products
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (isNextResponse(auth)) return auth;

    const body = await request.json();
    const parsed = productCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados invalidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const newProduct: StoredProduct = {
      ...data,
      id: nanoid(),
      status: 'draft',
      updatedAt: new Date().toISOString(),
      updatedBy: auth.email,
    };

    await addStoreItem<StoredProduct>(PRODUCTS_FILE, newProduct);

    console.log(
      `[ADMIN] Produto criado: ${newProduct.id} (${newProduct.name}) por ${auth.email}`,
    );

    revalidatePath('/');
    revalidatePath('/cozinha');
    revalidatePath('/lavandaria');
    revalidatePath('/ar-condicionado');
    revalidatePath('/termoacumuladores');

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('[ADMIN] Erro ao criar produto:', error);
    return NextResponse.json(
      { error: 'Erro interno ao criar produto' },
      { status: 500 },
    );
  }
}
