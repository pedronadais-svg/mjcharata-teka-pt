// ============================================================
// API: Templates PDF — Listagem e Criação
// GET  /api/admin/templates → Lista todos os templates
// POST /api/admin/templates → Cria um novo template
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/db/json-store';
import type { PDFTemplate } from '@/lib/types/pdf-templates';
import {
  DEFAULT_PAGE_SETTINGS,
  TEMPLATE_DEFAULT_VARIABLES,
} from '@/lib/types/pdf-templates';

const STORE_FILE = 'pdf-templates.json';

// Gerar ID único
function generateId(): string {
  return `tpl_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// GET — Listar todos os templates
export async function GET() {
  try {
    const templates = await readStore<PDFTemplate[]>(STORE_FILE);
    // Ordenar por data de actualização (mais recente primeiro)
    templates.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return NextResponse.json(templates);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}

// POST — Criar novo template
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, type } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Nome e tipo são obrigatórios' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const id = generateId();
    const templateType = type as PDFTemplate['type'];

    const newTemplate: PDFTemplate = {
      id,
      name,
      description: description || '',
      type: templateType,
      version: 1,
      pageSettings: { ...DEFAULT_PAGE_SETTINGS },
      pages: [
        {
          id: `page_${Date.now()}`,
          name: 'Página 1',
          order: 0,
          elements: [],
        },
      ],
      header: {
        enabled: true,
        elements: [],
        height: 25,
      },
      footer: {
        enabled: true,
        elements: [],
        height: 15,
      },
      variables: TEMPLATE_DEFAULT_VARIABLES[templateType] || [],
      createdAt: now,
      updatedAt: now,
      createdBy: 'admin',
      isActive: true,
    };

    let templates: PDFTemplate[] = [];
    try {
      templates = await readStore<PDFTemplate[]>(STORE_FILE);
    } catch {
      templates = [];
    }

    templates.push(newTemplate);
    await writeStore(STORE_FILE, templates);

    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar template:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
