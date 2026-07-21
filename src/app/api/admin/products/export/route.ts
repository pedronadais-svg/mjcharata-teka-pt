import { NextResponse } from 'next/server';
import { requireAdmin, isNextResponse } from '@/lib/auth/admin-guard';
import { readStore } from '@/lib/db/json-store';

interface ProductDB {
  id: string;
  name: string;
  reference: string;
  ean?: string;
  category: string;
  subcategory: string;
  priceAOA?: number;
  status: string;
  images: string[];
  slug: string;
}

export async function GET() {
  const auth = await requireAdmin();
  if (isNextResponse(auth)) return auth;

  try {
    const products = await readStore<ProductDB[]>('products.json');

    const header = 'ID,Nome,Referência,EAN,Categoria,Subcategoria,Preço AOA,Estado,Imagens,URL';
    const rows = products.map((p) => {
      const fields = [
        p.id,
        `"${(p.name || '').replace(/"/g, '""')}"`,
        p.reference || '',
        p.ean || '',
        p.category || '',
        p.subcategory || '',
        p.priceAOA?.toString() || '',
        p.status || '',
        (p.images?.length || 0).toString(),
        `/produto/${p.slug}`,
      ];
      return fields.join(',');
    });

    const csv = [header, ...rows].join('\n');

    console.log(`[ADMIN] EXPORT CSV by ${auth.email} — ${products.length} products`);

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="teka-produtos-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('[ADMIN] Export error:', error);
    return NextResponse.json({ error: 'Erro ao exportar produtos' }, { status: 500 });
  }
}
