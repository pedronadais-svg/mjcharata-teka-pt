import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, isNextResponse } from '@/lib/auth/admin-guard';
import { readStore, writeStore } from '@/lib/db/json-store';
import { revalidatePath } from 'next/cache';

interface ProductDB {
  id: string;
  reference: string;
  ean?: string;
  priceAOA?: number;
  updatedAt: string;
  updatedBy?: string;
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin();
  if (isNextResponse(auth)) return auth;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Ficheiro CSV não fornecido' }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split('\n').filter((l) => l.trim());

    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV vazio ou sem dados' }, { status: 400 });
    }

    // Parse header
    const header = lines[0].toLowerCase().split(',').map((h) => h.trim());
    const refIndex = header.indexOf('reference') !== -1 ? header.indexOf('reference') : header.indexOf('referência');
    const eanIndex = header.indexOf('ean');
    const priceIndex = header.indexOf('priceaoa') !== -1 ? header.indexOf('priceaoa') : header.indexOf('preço aoa');

    if (refIndex === -1 && eanIndex === -1) {
      return NextResponse.json({ error: 'CSV deve ter coluna "reference" ou "ean"' }, { status: 400 });
    }

    if (priceIndex === -1) {
      return NextResponse.json({ error: 'CSV deve ter coluna "priceAOA" ou "preço aoa"' }, { status: 400 });
    }

    // Parse rows
    const updates: { reference?: string; ean?: string; price: number }[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
      const ref = refIndex !== -1 ? cols[refIndex] : undefined;
      const ean = eanIndex !== -1 ? cols[eanIndex] : undefined;
      const priceStr = cols[priceIndex];
      const price = parseFloat(priceStr);

      if (isNaN(price) || price < 0) continue;
      if (!ref && !ean) continue;

      updates.push({ reference: ref, ean, price });
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'Nenhuma linha válida encontrada no CSV' }, { status: 400 });
    }

    // Apply updates
    const products = await readStore<ProductDB[]>('products.json');
    let matched = 0;
    const now = new Date().toISOString();

    for (const upd of updates) {
      const product = products.find((p) =>
        (upd.reference && p.reference === upd.reference) ||
        (upd.ean && p.ean === upd.ean)
      );

      if (product) {
        product.priceAOA = upd.price;
        product.updatedAt = now;
        product.updatedBy = auth.id;
        matched++;
      }
    }

    if (matched > 0) {
      await writeStore('products.json', products);
      revalidatePath('/cozinha', 'layout');
      revalidatePath('/lavandaria', 'layout');
      revalidatePath('/', 'layout');
    }

    console.log(`[ADMIN] IMPORT CSV by ${auth.email} — ${matched}/${updates.length} matched`);

    return NextResponse.json({
      message: `${matched} produto(s) actualizado(s) de ${updates.length} linha(s) no CSV`,
      matched,
      total: updates.length,
      unmatched: updates.length - matched,
    });
  } catch (error) {
    console.error('[ADMIN] Import error:', error);
    return NextResponse.json({ error: 'Erro ao importar preços' }, { status: 500 });
  }
}
