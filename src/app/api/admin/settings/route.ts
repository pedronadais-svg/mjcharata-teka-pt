import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { readStore, writeStore } from '@/lib/db/json-store';
import { requireAdmin, isNextResponse } from '@/lib/auth/admin-guard';

interface Settings {
  siteName: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  social: {
    facebook: string;
    instagram: string;
    youtube: string;
    linkedin: string;
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    ogImage: string;
  };
  features: {
    showPrices: boolean;
    enableChat: boolean;
    enableNewsletter: boolean;
    maintenanceMode: boolean;
  };
}

const updateSettingsSchema = z.object({
  siteName: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional(),
  address: z.string().optional(),
  whatsapp: z.string().optional(),
  social: z.object({
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    youtube: z.string().optional(),
    linkedin: z.string().optional(),
  }).optional(),
  seo: z.object({
    defaultTitle: z.string().optional(),
    defaultDescription: z.string().optional(),
    ogImage: z.string().optional(),
  }).optional(),
  features: z.object({
    showPrices: z.boolean().optional(),
    enableChat: z.boolean().optional(),
    enableNewsletter: z.boolean().optional(),
    maintenanceMode: z.boolean().optional(),
  }).optional(),
});

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (isNextResponse(auth)) return auth;

    console.log('[ADMIN] Obter definições');
    const settings = await readStore<Settings>('settings.json');
    return NextResponse.json(settings);
  } catch (error) {
    console.log('[ADMIN] Erro ao obter definições:', error);
    return NextResponse.json({ error: 'Erro ao obter definições' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (isNextResponse(auth)) return auth;

    const body = await request.json();
    const parsed = updateSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    console.log('[ADMIN] Atualizar definições');
    const current = await readStore<Settings>('settings.json');

    const updated: Settings = {
      ...current,
      ...parsed.data,
      social: { ...current.social, ...parsed.data.social },
      seo: { ...current.seo, ...parsed.data.seo },
      features: { ...current.features, ...parsed.data.features },
    };

    await writeStore('settings.json', updated);
    revalidatePath('/');
    revalidatePath('/admin/settings');

    return NextResponse.json(updated);
  } catch (error) {
    console.log('[ADMIN] Erro ao atualizar definições:', error);
    return NextResponse.json({ error: 'Erro ao atualizar definições' }, { status: 500 });
  }
}
