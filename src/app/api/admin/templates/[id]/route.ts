// ============================================================
// API: Templates PDF — Operações individuais
// GET    /api/admin/templates/[id] → Obter template
// PUT    /api/admin/templates/[id] → Actualizar template
// DELETE /api/admin/templates/[id] → Eliminar template
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { readStore, writeStore } from '@/lib/db/json-store';
import type { PDFTemplate } from '@/lib/types/pdf-templates';

const STORE_FILE = 'pdf-templates.json';

// GET — Obter template por ID
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const templates = await readStore<PDFTemplate[]>(STORE_FILE);
    const template = templates.find((t) => t.id === id);

    if (!template) {
      return NextResponse.json(
        { error: 'Template não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(template);
  } catch {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT — Actualizar template
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await req.json();
    const templates = await readStore<PDFTemplate[]>(STORE_FILE);
    const index = templates.findIndex((t) => t.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: 'Template não encontrado' },
        { status: 404 }
      );
    }

    // Actualizar template preservando o ID e metadados de criação
    templates[index] = {
      ...templates[index],
      ...updates,
      id, // Nunca alterar o ID
      createdAt: templates[index].createdAt,
      createdBy: templates[index].createdBy,
      updatedAt: new Date().toISOString(),
      version: (templates[index].version || 0) + 1,
    };

    await writeStore(STORE_FILE, templates);
    return NextResponse.json(templates[index]);
  } catch (error) {
    console.error('Erro ao actualizar template:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE — Eliminar template
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const templates = await readStore<PDFTemplate[]>(STORE_FILE);
    const filtered = templates.filter((t) => t.id !== id);

    if (filtered.length === templates.length) {
      return NextResponse.json(
        { error: 'Template não encontrado' },
        { status: 404 }
      );
    }

    await writeStore(STORE_FILE, filtered);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
