'use client';

import Link from 'next/link';
import { ArrowLeft, Construction } from 'lucide-react';

// O editor visual (src/components/admin/pdf-editor/) ainda está em
// desenvolvimento — desativado temporariamente para não bloquear o build.
export default function TemplateEditorPage() {
  return (
    <div className="h-screen flex items-center justify-center bg-[#1e1e1e]">
      <div className="flex flex-col items-center gap-3 text-center px-6">
        <Construction className="h-10 w-10 text-white/40" />
        <p className="text-white/80 text-sm">O editor visual de templates ainda está em desenvolvimento.</p>
        <Link
          href="/admin/templates-pdf"
          className="flex items-center gap-2 text-white/60 hover:text-white text-sm mt-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
      </div>
    </div>
  );
}
