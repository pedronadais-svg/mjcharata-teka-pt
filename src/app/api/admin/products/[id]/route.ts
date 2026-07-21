import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import {
  readStoreItem,
  updateStoreItem,
} from '@/lib/db/json-store';
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
// Validacao Zod para atualizacao de produto (todos os campos opcionais)
// ---------------------------------------------------------------------------

const productUpdateSchema = z.object({
  name: z.string().min(1, 'Nome nao pode estar vazio').optional(),
  slug: z.string().min(1, 'Slug nao pode estar vazio').optional(),
  reference: z.string().min(1, 'Referencia nao pode estar vazia').optional(),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  subfamily: z.string().optional(),
  images: z.array(z.string()).optional(),
  thumbnail: z.string().optional(),
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
    .optional(),
  specifications: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
        group: z.string().optional(),
      }),
    )
    .optional(),
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
    .optional(),
  documents: z.array(z.any()).optional(),
  relatedProductIds: z.array(z.string()).optional(),
  isNew: z.boolean().optional(),
  isPromoted: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  color: z.string().optional(),
  edition: z.string().optional(),
  installation: z.string().optional(),
  width: z.string().optional(),
  status: z.enum(['active', 'draft', 'archived']).optional(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PRODUCTS_FILE = 'products.json';

type RouteContext = { params: Promise<{ id: string }> };

// ---------------------------------------------------------------------------
// GET  /api/admin/products/[id]
// ---------------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const auth = await requireAdmin();
    if (isNextResponse(auth)) return auth;

    const { id } = await params;

    const product = await readStoreItem<StoredProduct>(PRODUCTS_FILE, id);

    if (!product) {
      return NextResponse.json(
        { error: 'Produto nao encontrado' },
        { status: 404 },
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('[ADMIN] Erro ao obter produto:', error);
    return NextResponse.json(
      { error: 'Erro interno ao obter produto' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// PUT  /api/admin/products/[id]
// ---------------------------------------------------------------------------

export async function PUT(
  request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const auth = await requireAdmin();
    if (isNextResponse(auth)) return auth;

    const { id } = await params;

    // Verificar se o produto existe
    const existing = await readStoreItem<StoredProduct>(PRODUCTS_FILE, id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Produto nao encontrado' },
        { status: 404 },
      );
    }

    const body = await request.json();
    const parsed = productUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados invalidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const updates = {
      ...parsed.data,
      updatedAt: new Date().toISOString(),
      updatedBy: auth.email,
    };

    const updated = await updateStoreItem<StoredProduct>(
      PRODUCTS_FILE,
      id,
      updates,
    );

    if (!updated) {
      return NextResponse.json(
        { error: 'Erro ao atualizar produto' },
        { status: 500 },
      );
    }

    console.log(
      `[ADMIN] Produto atualizado: ${id} (${updated.name}) por ${auth.email}`,
    );

    revalidatePath('/');
    revalidatePath('/cozinha');
    revalidatePath('/lavandaria');
    revalidatePath('/ar-condicionado');
    revalidatePath('/termoacumuladores');
    revalidatePath(`/produto/${updated.slug}`);

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[ADMIN] Erro ao atualizar produto:', error);
    return NextResponse.json(
      { error: 'Erro interno ao atualizar produto' },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// DELETE  /api/admin/products/[id]  (soft delete — arquivar)
// ---------------------------------------------------------------------------

export async function DELETE(
  _request: NextRequest,
  { params }: RouteContext,
) {
  try {
    const auth = await requireAdmin();
    if (isNextResponse(auth)) return auth;

    const { id } = await params;

    const existing = await readStoreItem<StoredProduct>(PRODUCTS_FILE, id);
    if (!existing) {
      return NextResponse.json(
        { error: 'Produto nao encontrado' },
        { status: 404 },
      );
    }

    const archived = await updateStoreItem<StoredProduct>(PRODUCTS_FILE, id, {
      status: 'archived',
      updatedAt: new Date().toISOString(),
      updatedBy: auth.email,
    } as Partial<StoredProduct>);

    if (!archived) {
      return NextResponse.json(
        { error: 'Erro ao arquivar produto' },
        { status: 500 },
      );
    }

    console.log(
      `[ADMIN] Produto arquivado: ${id} (${existing.name}) por ${auth.email}`,
    );

    revalidatePath('/');
    revalidatePath('/cozinha');
    revalidatePath('/lavandaria');
    revalidatePath('/ar-condicionado');
    revalidatePath('/termoacumuladores');
    revalidatePath(`/produto/${existing.slug}`);

    return NextResponse.json({ message: 'Produto arquivado com sucesso' });
  } catch (error) {
    console.error('[ADMIN] Erro ao arquivar produto:', error);
    return NextResponse.json(
      { error: 'Erro interno ao arquivar produto' },
      { status: 500 },
    );
  }
}
