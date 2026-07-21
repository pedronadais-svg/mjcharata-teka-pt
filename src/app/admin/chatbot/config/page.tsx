'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function ConfigPage() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [config, setConfig] = useState({
    personality: 'profissional-acolhedor',
    formality: 'formal',
    greeting: 'Olá! Sou o Assistente Teka. Como posso ajudar hoje?',
    farewell: 'Obrigado por contactar a Teka!',
    errorMessage: 'Peço desculpa, ocorreu um erro.',
    escalationMessage: 'Contacte +244 933 302 752 ou teka@mdvmadeiras.com.',
    model: 'sonnet',
    temperature: 0.7,
    maxTokens: 1024,
    useEmojis: true,
    quickRepliesEnabled: true,
    productCardsEnabled: true,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (!isLoading && (!isAuthenticated || !isAdmin)) router.push('/login'); }, [isAuthenticated, isAdmin, isLoading, router]);

  useEffect(() => {
    fetch('/api/admin/chatbot?type=config').then(r => r.json()).then(d => {
      try { const data = JSON.parse(d.content); setConfig(prev => ({ ...prev, ...data })); } catch {}
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    await fetch('/api/admin/chatbot', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'config', content: JSON.stringify(config, null, 2) }),
    });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  if (isLoading || !isAuthenticated || !isAdmin) return null;

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/chatbot" className="p-2 hover:bg-teka-light rounded"><ArrowLeft className="h-5 w-5 text-teka-gray" /></Link>
        <h1 className="font-heading font-bold text-2xl text-teka-dark">Configuração do Chatbot</h1>
      </div>

      <div className="bg-white border border-teka-border rounded p-6 space-y-6 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-teka-dark mb-2">Personalidade</label>
          <div className="space-y-2">
            {['profissional-acolhedor', 'formal-tecnico', 'casual-amigavel'].map(p => (
              <label key={p} className="flex items-center gap-2 text-sm">
                <input type="radio" checked={config.personality === p} onChange={() => setConfig(c => ({ ...c, personality: p }))} />
                {p === 'profissional-acolhedor' ? 'Profissional-Acolhedor (recomendado)' : p === 'formal-tecnico' ? 'Formal-Técnico' : 'Casual-Amigável'}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-teka-dark mb-2">Formalidade</label>
          <div className="flex gap-4">
            {['formal', 'informal'].map(f => (
              <label key={f} className="flex items-center gap-2 text-sm">
                <input type="radio" checked={config.formality === f} onChange={() => setConfig(c => ({ ...c, formality: f }))} />
                {f === 'formal' ? 'Formal ("você")' : 'Informal ("tu")'}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-teka-dark mb-1.5">Saudação</label>
          <input value={config.greeting} onChange={e => setConfig(c => ({ ...c, greeting: e.target.value }))}
            className="w-full px-3 py-2 border border-teka-border rounded text-sm focus:outline-none focus:border-teka-red" />
        </div>

        <div>
          <label className="block text-sm font-medium text-teka-dark mb-1.5">Despedida</label>
          <input value={config.farewell} onChange={e => setConfig(c => ({ ...c, farewell: e.target.value }))}
            className="w-full px-3 py-2 border border-teka-border rounded text-sm focus:outline-none focus:border-teka-red" />
        </div>

        <div>
          <label className="block text-sm font-medium text-teka-dark mb-2">Modelo Claude</label>
          <div className="space-y-2">
            {[['sonnet', 'Sonnet 4.6 (recomendado — melhor custo-benefício)'], ['haiku', 'Haiku 4.5 (mais barato)'], ['opus', 'Opus 4.6 (mais inteligente, mais caro)']].map(([id, label]) => (
              <label key={id} className="flex items-center gap-2 text-sm">
                <input type="radio" checked={config.model === id} onChange={() => setConfig(c => ({ ...c, model: id }))} />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-teka-dark mb-1.5">Temperatura ({config.temperature})</label>
            <input type="range" min={0} max={1} step={0.1} value={config.temperature} onChange={e => setConfig(c => ({ ...c, temperature: parseFloat(e.target.value) }))} className="w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-teka-dark mb-1.5">Max Tokens</label>
            <input type="number" value={config.maxTokens} onChange={e => setConfig(c => ({ ...c, maxTokens: parseInt(e.target.value) || 1024 }))}
              className="w-full px-3 py-2 border border-teka-border rounded text-sm focus:outline-none focus:border-teka-red" />
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          {[['useEmojis', 'Emojis'], ['quickRepliesEnabled', 'Quick Replies'], ['productCardsEnabled', 'Product Cards']].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={config[key as keyof typeof config] as boolean}
                onChange={e => setConfig(c => ({ ...c, [key]: e.target.checked }))} />
              {label}
            </label>
          ))}
        </div>

        <button onClick={handleSave}
          className={`inline-flex items-center gap-2 px-6 py-2.5 rounded text-sm text-white ${saved ? 'bg-teka-success' : 'bg-teka-red hover:bg-teka-red-dark'}`}>
          <Save className="h-4 w-4" /> {saved ? 'Guardado!' : 'Guardar Configuração'}
        </button>
      </div>
    </div>
  );
}
