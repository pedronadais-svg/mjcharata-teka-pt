import { NextRequest, NextResponse } from 'next/server';
import { readStore } from '@/lib/db/json-store';
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

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (isNextResponse(auth)) return auth;

    console.log('[ADMIN] Listar encomendas');
    const orders = await readStore<Order[]>('orders.json');

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    let filtered = orders;

    if (status) {
      filtered = filtered.filter((o) => o.status === status);
    }

    if (dateFrom) {
      const from = new Date(dateFrom);
      filtered = filtered.filter((o) => new Date(o.createdAt) >= from);
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter((o) => new Date(o.createdAt) <= to);
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(filtered);
  } catch (error) {
    console.log('[ADMIN] Erro ao listar encomendas:', error);
    return NextResponse.json({ error: 'Erro ao listar encomendas' }, { status: 500 });
  }
}
