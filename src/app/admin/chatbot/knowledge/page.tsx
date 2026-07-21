'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface KBEntry { id: string; topic: string; content: string }

export default function KnowledgePage() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [entries, setEntries] = useState<KBEntry[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (!isLoading && (!isAuthenticated || !isAdmin)) router.push('/login'); }, [isAuthenticated, isAdmin, isLoading, router]);

  useEffect(() => {
    fetch('/api/admin/chatbot?type=knowledge').then(r => r.json()).then(d => {
      try { const data = JSON.parse(d.content); setEntries(data.entries || []); } catch { setEntries([]); }
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    await fetch('/api/admin/chatbot', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'knowledge', content: JSON.stringify({ version: '1.0', lastUpdated: new Date().toISOString().slice(0, 10), entries }, null, 2) }),
    });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const addEntry = () => setEntries(p => [...p, { id: `kb-${Date.now()}`, topic: '', content: '' }]);
  const removeEntry = (id: string) => setEntries(p => p.filter(e => e.id !== id));
  const updateEntry = (id: string, field: 'topic' | 'content', value: string) => setEntries(p => p.map(e => e.id === id ? { ...e, [field]: value } : e));

  if (isLoading || !isAuthenticated || !isAdmin) return null;

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/chatbot" className="p-2 hover:bg-teka-light rounded"><ArrowLeft className="h-5 w-5 text-teka-gray" /></Link>
          <h1 className="font-heading font-bold text-2xl text-teka-dark">Base de Conhecimento</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={addEntry} className="inline-flex items-center gap-2 px-4 py-2 border border-teka-border rounded text-sm hover:bg-teka-light"><Plus className="h-4 w-4" /> Adicionar</button>
          <button onClick={handleSave} className={`inline-flex items-center gap-2 px-4 py-2 rounded text-sm text-white ${saved ? 'bg-teka-success' : 'bg-teka-red hover:bg-teka-red-dark'}`}><Save className="h-4 w-4" /> {saved ? 'Guardado!' : 'Guardar'}</button>
        </div>
      </div>

      <div className="space-y-4">
        {entries.map(entry => (
          <div key={entry.id} className="bg-white border border-teka-border rounded p-4">
            <div className="flex items-center justify-between mb-3">
              <input value={entry.topic} onChange={e => updateEntry(entry.id, 'topic', e.target.value)} placeholder="Tópico"
                className="font-semibold text-sm text-teka-dark bg-transparent border-b border-transparent hover:border-teka-border focus:border-teka-red focus:outline-none w-full mr-4" />
              <button onClick={() => removeEntry(entry.id)} className="text-teka-gray hover:text-teka-error shrink-0"><Trash2 className="h-4 w-4" /></button>
            </div>
            <textarea value={entry.content} onChange={e => updateEntry(entry.id, 'content', e.target.value)} rows={3} placeholder="Conteúdo..."
              className="w-full text-sm text-teka-gray border border-teka-border rounded px-3 py-2 focus:outline-none focus:border-teka-red resize-y" />
            <p className="text-xs text-teka-gray/60 mt-1">~{Math.ceil(entry.content.length / 4)} tokens</p>
          </div>
        ))}
        {entries.length === 0 && <p className="text-sm text-teka-gray text-center py-8">Nenhuma entrada. Clique em "Adicionar" para começar.</p>}
      </div>

      <p className="text-xs text-teka-gray mt-4">Total: {entries.length} entradas | ~{Math.ceil(entries.reduce((s, e) => s + e.content.length, 0) / 4)} tokens</p>
    </div>
  );
}
