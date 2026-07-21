'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, RotateCcw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const DEFAULT_PROMPT = `# Assistente Virtual Teka Angola

Tu és o assistente virtual da Teka Angola, distribuída pela MDV — Madeiras e Derivados, S.A.

## Regras
- Responde SEMPRE em Português de Portugal
- Usa "você" para tratamento formal
- Preços em Kwanzas (AOA)
- Sê conciso — máximo 3-4 parágrafos

## Contactos
- Telefone: +244 933 302 752
- Email: teka@mdvmadeiras.com`;

export default function PromptEditorPage() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) router.push('/login');
  }, [isAuthenticated, isAdmin, isLoading, router]);

  useEffect(() => {
    fetch('/api/admin/chatbot?type=prompt').then(r => r.json()).then(d => {
      if (d.content) setPrompt(d.content);
      else setPrompt(DEFAULT_PROMPT);
    }).catch(() => setPrompt(DEFAULT_PROMPT));
  }, []);

  const handleSave = async () => {
    await fetch('/api/admin/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'prompt', content: prompt }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const tokenEstimate = Math.ceil(prompt.length / 4);

  if (isLoading || !isAuthenticated || !isAdmin) return null;

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/chatbot" className="p-2 hover:bg-teka-light rounded"><ArrowLeft className="h-5 w-5 text-teka-gray" /></Link>
        <h1 className="font-heading font-bold text-2xl text-teka-dark">System Prompt</h1>
      </div>

      <div className="bg-white border border-teka-border rounded p-6">
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={20}
          className="w-full px-4 py-3 border border-teka-border rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teka-red/20 focus:border-teka-red resize-y"
        />
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-teka-gray">~{tokenEstimate} tokens estimados</span>
          <div className="flex gap-3">
            <button onClick={() => setPrompt(DEFAULT_PROMPT)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-teka-border rounded text-sm hover:bg-teka-light">
              <RotateCcw className="h-4 w-4" /> Repor Padrão
            </button>
            <button onClick={handleSave}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded text-sm text-white ${saved ? 'bg-teka-success' : 'bg-teka-red hover:bg-teka-red-dark'}`}>
              <Save className="h-4 w-4" /> {saved ? 'Guardado!' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
