import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { nanoid } from 'nanoid';
import { requireAdmin, isNextResponse } from '@/lib/auth/admin-guard';

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/svg+xml': '.svg',
  };
  return map[mimeType] ?? '.jpg';
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin();
    if (isNextResponse(auth)) return auth;

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum ficheiro enviado' }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de ficheiro não permitido. Apenas imagens (JPEG, PNG, WebP, GIF, SVG).' },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'Ficheiro demasiado grande. Tamanho máximo: 5MB.' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = getExtension(file.type);
    const filename = `${nanoid()}${ext}`;
    const uploadDir = join(process.cwd(), 'public/uploads');

    await mkdir(uploadDir, { recursive: true });

    let finalBuffer: Buffer = buffer;

    // Try to resize with sharp if available (skip for SVGs)
    if (file.type !== 'image/svg+xml') {
      try {
        const sharp = (await import('sharp')).default;
        const metadata = await sharp(buffer).metadata();

        if (metadata.width && metadata.width > 1200) {
          finalBuffer = await sharp(buffer)
            .resize({ width: 1200, withoutEnlargement: true })
            .toBuffer();
          console.log('[ADMIN] Imagem redimensionada de', metadata.width, 'para 1200px');
        }
      } catch {
        console.log('[ADMIN] Sharp não disponível, a guardar imagem sem redimensionar');
      }
    }

    const filePath = join(uploadDir, filename);
    await writeFile(filePath, finalBuffer);

    console.log('[ADMIN] Ficheiro carregado:', filename);

    return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
  } catch (error) {
    console.log('[ADMIN] Erro ao carregar ficheiro:', error);
    return NextResponse.json({ error: 'Erro ao carregar ficheiro' }, { status: 500 });
  }
}
