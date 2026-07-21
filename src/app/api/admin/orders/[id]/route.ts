import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { readStoreItem, updateStoreItem } from '@/lib/db/json-store';
import { requireAdmin, isNextResponse } from '@/lib/auth/admin-guard';

interface Order {
  id: string;
  items: Array<{ productId: string; name: string; quantity: number; price: number }>;
  customer: { name: string; email: string; phone?: string; company?: string };
  total: number;
  status: 'pendente' | 'confirmada' | 'enviada' | 'entregue' | 'cancelada';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const updateOrderSchema = z.object({
  status: z.enum(['pendente', 'confirmada', 'enviada', 'entregue', 'cancelada'], {
    message: 'Estado inválido',
  }).optional(),
  notes: z.string().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdmin();
    if (isNextResponse(auth)) return auth;

    const { id } = await params;
    console.log('[ADMIN] Obter encomenda:', id);

    const order = await readStoreItem<Order>('orders.json', id);
    if (!order) {
      return NextResponse.json({ error: 'Encomenda não encontrada' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.log('[ADMIN] Erro ao obter encomenda:', error);
    return NextResponse.json({ error: 'Erro ao obter encomenda' }, { status: 500 });
  }
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
    const parsed = updateOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.log('[ADMIN] Atualizar encomenda:', id);
    const updated = await updateStoreItem<Order>('orders.json', id, {
      ...parsed.data,
      updatedAt: new Date().toISOString(),
    } as Partial<Order>);

    if (!updated) {
      return NextResponse.json({ error: 'Encomenda não encontrada' }, { status: 404 });
    }

    revalidatePath('/admin/orders');
    return NextResponse.json(updated);
  } catch (error) {
    console.log('[ADMIN] Erro ao atualizar encomenda:', error);
    return NextResponse.json({ error: 'Erro ao atualizar encomenda' }, { status: 500 });
  }
}
