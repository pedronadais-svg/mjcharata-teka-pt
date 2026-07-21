import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';
import { readStore, addStoreItem } from '@/lib/db/json-store';
import { requireAdmin, isNextResponse } from '@/lib/auth/admin-guard';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const createFaqSchema = z.object({
  question: z.string().min(1, 'Pergunta é obrigatória'),
  answer: z.string().min(1, 'Resposta é obrigatória'),
  category: z.string().min(1, 'Categoria é obrigatória'),
});

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (isNextResponse(auth)) return auth;

    const faqs = await readStore<FAQ[]>('faqs.json');

    const grouped: Record<string, FAQ[]> = {};
    for (const faq of faqs) {
      if (!grouped[faq.category]) {
        grouped[faq.category] = [];
      }
      grouped[faq.category].push(faq);
    }

    console.log(`[ADMIN] Listagem de FAQs: ${faqs.length} total`);

    return NextResponse.json({ data: grouped, total: faqs.length });
  } catch (error) {
    console.log('[ADMIN] Erro ao listar FAQs:', error);
    return NextResponse.json(
      { error: 'Erro ao listar FAQs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (isNextResponse(auth)) return auth;

    const body = await request.json();
    const parsed = createFaqSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const faq: FAQ = {
      id: nanoid(),
      question: parsed.data.question,
      answer: parsed.data.answer,
      category: parsed.data.category,
    };

    await addStoreItem<FAQ>('faqs.json', faq);
    revalidatePath('/suporte');

    console.log(`[ADMIN] FAQ criada: ${faq.id}`);

    return NextResponse.json(faq, { status: 201 });
  } catch (error) {
    console.log('[ADMIN] Erro ao criar FAQ:', error);
    return NextResponse.json(
      { error: 'Erro ao criar FAQ' },
      { status: 500 }
    );
  }
}
