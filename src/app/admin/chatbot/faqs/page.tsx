'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface CustomFAQ { id: string; question: string; answer: string; category: string }

export default function FAQsPage() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [faqs, setFaqs] = useState<CustomFAQ[]>([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (!isLoading && (!isAuthenticated || !isAdmin)) router.push('/login'); }, [isAuthenticated, isAdmin, isLoading, router]);

  useEffect(() => {
    fetch('/api/admin/chatbot?type=faqs').then(r => r.json()).then(d => {
      try { const data = JSON.parse(d.content); setFaqs(data.faqs || []); } catch { setFaqs([]); }
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    await fetch('/api/admin/chatbot', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'faqs', content: JSON.stringify({ version: '1.0', faqs }, null, 2) }),
    });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const addFaq = () => setFaqs(p => [...p, { id: `faq-${Date.now()}`, question: '', answer: '', category: 'Geral' }]);
  const removeFaq = (id: string) => setFaqs(p => p.filter(f => f.id !== id));
  const updateFaq = (id: string, field: keyof CustomFAQ, value: string) => setFaqs(p => p.map(f => f.id === id ? { ...f, [field]: value } : f));

  if (isLoading || !isAuthenticated || !isAdmin) return null;

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/chatbot" className="p-2 hover:bg-teka-light rounded"><ArrowLeft className="h-5 w-5 text-teka-gray" /></Link>
          <h1 className="font-heading font-bold text-2xl text-teka-dark">FAQs Customizadas</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={addFaq} className="inline-flex items-center gap-2 px-4 py-2 border border-teka-border rounded text-sm hover:bg-teka-light"><Plus className="h-4 w-4" /> Adicionar</button>
          <button onClick={handleSave} className={`inline-flex items-center gap-2 px-4 py-2 rounded text-sm text-white ${saved ? 'bg-teka-success' : 'bg-teka-red hover:bg-teka-red-dark'}`}><Save className="h-4 w-4" /> {saved ? 'Guardado!' : 'Guardar'}</button>
        </div>
      </div>

      <div className="space-y-4">
        {faqs.map(faq => (
          <div key={faq.id} className="bg-white border border-teka-border rounded p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-2">
                <input value={faq.question} onChange={e => updateFaq(faq.id, 'question', e.target.value)} placeholder="Pergunta..."
                  className="w-full px-3 py-2 border border-teka-border rounded text-sm font-medium focus:outline-none focus:border-teka-red" />
                <textarea value={faq.answer} onChange={e => updateFaq(faq.id, 'answer', e.target.value)} rows={2} placeholder="Resposta..."
                  className="w-full px-3 py-2 border border-teka-border rounded text-sm focus:outline-none focus:border-teka-red resize-y" />
                <select value={faq.category} onChange={e => updateFaq(faq.id, 'category', e.target.value)}
                  className="px-3 py-1.5 border border-teka-border rounded text-xs bg-white">
                  {['Geral', 'Garantias', 'Compras', 'Serviços', 'Produtos', 'Assistência'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button onClick={() => removeFaq(faq.id)} className="text-teka-gray hover:text-teka-error shrink-0 mt-2"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {faqs.length === 0 && <p className="text-sm text-teka-gray text-center py-8">Nenhuma FAQ customizada. Clique em &quot;Adicionar&quot;.</p>}
      </div>
    </div>
  );
}
