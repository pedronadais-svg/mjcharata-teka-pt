'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileText, Database, HelpCircle, Settings, MessageSquare, BarChart3, Eye, EyeOff, Save, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const tabs = [
  { id: 'prompt', label: 'Prompt', icon: FileText, href: '/admin/chatbot/prompt', desc: 'Editar o system prompt do chatbot' },
  { id: 'knowledge', label: 'Knowledge', icon: Database, href: '/admin/chatbot/knowledge', desc: 'Gerir base de conhecimento' },
  { id: 'faqs', label: 'FAQs', icon: HelpCircle, href: '/admin/chatbot/faqs', desc: 'Gerir FAQs customizadas' },
  { id: 'config', label: 'Configuração', icon: Settings, href: '/admin/chatbot/config', desc: 'Tom, personalidade e modelo' },
  { id: 'conversations', label: 'Conversas', icon: MessageSquare, href: '/admin/chatbot/conversations', desc: 'Histórico de conversas' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/admin/chatbot/analytics', desc: 'Métricas e custos' },
];

export default function ChatbotAdminPage() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  const [aiEnabled, setAiEnabled] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [keyStatus, setKeyStatus] = useState<'unknown' | 'valid' | 'invalid' | 'missing' | 'configured'>('unknown');

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) router.push('/login');
  }, [isAuthenticated, isAdmin, isLoading, router]);

  // Carregar estado actual do servidor
  useEffect(() => {
    if (isAdmin) {
      fetch('/api/admin/chatbot/ai-config')
        .then(r => r.json())
        .then(data => {
          setAiEnabled(data.aiEnabled || false);
          setApiKey(data.apiKeyMasked || '');
          setKeyStatus(data.keyStatus || 'missing');
        })
        .catch(() => {});
    }
  }, [isAdmin]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/chatbot/ai-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiEnabled, apiKey: apiKey.startsWith('sk-') ? apiKey : undefined }),
      });
      const data = await res.json();
      setKeyStatus(data.keyStatus || 'unknown');
      if (data.apiKeyMasked) setApiKey(data.apiKeyMasked);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {} finally {
      setSaving(false);
    }
  };

  if (isLoading || !isAuthenticated || !isAdmin) return null;

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="p-2 hover:bg-teka-light rounded"><ArrowLeft className="h-5 w-5 text-teka-gray" /></Link>
        <div>
          <h1 className="font-heading font-bold text-2xl text-teka-dark">Gestão do Chatbot</h1>
          <p className="text-sm text-teka-gray">Configure o assistente virtual Teka Angola</p>
        </div>
      </div>

      {/* Modo IA + API Key */}
      <div className="bg-white border border-teka-border rounded p-6 mb-6">
        <h2 className="font-heading font-semibold text-lg text-teka-dark mb-4">Modo de Funcionamento</h2>

        <div className="space-y-5">
          {/* Toggle IA */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm text-teka-dark">Modo IA (Claude API)</p>
              <p className="text-xs text-teka-gray mt-0.5">
                {aiEnabled
                  ? 'O chatbot usa inteligência artificial para responder com linguagem natural.'
                  : 'O chatbot usa respostas pré-definidas (sem custos, funciona offline).'}
              </p>
            </div>
            <button
              onClick={() => setAiEnabled(!aiEnabled)}
              className={`relative w-12 h-7 rounded-full transition-colors ${aiEnabled ? 'bg-teka-red' : 'bg-teka-gray/30'}`}
              aria-label={aiEnabled ? 'Desactivar modo IA' : 'Activar modo IA'}
            >
              <span className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${aiEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {/* API Key input — só visível quando IA activada */}
          {aiEnabled && (
            <div className="border-t border-teka-border pt-4">
              <label className="block text-sm font-medium text-teka-dark mb-1.5">
                Chave API do Claude (Anthropic)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={e => { setApiKey(e.target.value); setKeyStatus('unknown'); }}
                    placeholder="sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-4 py-2.5 pr-10 border border-teka-border rounded text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teka-red/20 focus:border-teka-red"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-teka-gray hover:text-teka-dark"
                    aria-label={showKey ? 'Ocultar chave' : 'Mostrar chave'}
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded text-sm font-medium text-white transition-colors shrink-0 ${
                    saved ? 'bg-teka-success' : 'bg-teka-red hover:bg-teka-red-dark'
                  } disabled:opacity-60`}
                >
                  {saved ? <><Check className="h-4 w-4" /> Guardado</> : <><Save className="h-4 w-4" /> {saving ? 'A guardar...' : 'Guardar'}</>}
                </button>
              </div>

              {/* Status da chave */}
              <div className="flex items-center gap-2 mt-2 text-xs">
                {keyStatus === 'valid' && <><span className="w-2 h-2 bg-teka-success rounded-full" /><span className="text-teka-success">Chave válida e configurada</span></>}
                {keyStatus === 'invalid' && <><span className="w-2 h-2 bg-teka-error rounded-full" /><span className="text-teka-error">Chave inválida</span></>}
                {keyStatus === 'missing' && <><span className="w-2 h-2 bg-teka-warning rounded-full" /><span className="text-teka-warning">Nenhuma chave configurada</span></>}
                {keyStatus === 'configured' && <><span className="w-2 h-2 bg-teka-success rounded-full" /><span className="text-teka-success">Chave configurada</span></>}
                {keyStatus === 'unknown' && <><span className="w-2 h-2 bg-teka-gray/30 rounded-full" /><span className="text-teka-gray">Guarde para verificar</span></>}
              </div>

              <p className="text-xs text-teka-gray mt-3">
                Obtenha a sua chave em{' '}
                <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" className="text-teka-red hover:underline">
                  console.anthropic.com/settings/keys
                </a>.
                O custo estimado é ~$25/mês para 500 conversas com o modelo Sonnet.
              </p>
            </div>
          )}

          {/* Guardar quando desactivar IA */}
          {!aiEnabled && keyStatus !== 'missing' && (
            <button onClick={handleSave} disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teka-red hover:bg-teka-red-dark text-white rounded text-sm disabled:opacity-60">
              <Save className="h-4 w-4" /> {saving ? 'A guardar...' : 'Guardar alteração'}
            </button>
          )}
        </div>
      </div>

      {/* Secções do backoffice */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tabs.map(tab => (
          <Link key={tab.id} href={tab.href}
            className="group flex items-center gap-4 p-5 bg-white border border-teka-border rounded hover:border-teka-red/30 hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded bg-teka-red/10 flex items-center justify-center group-hover:bg-teka-red/20">
              <tab.icon className="h-5 w-5 text-teka-red" />
            </div>
            <div>
              <h2 className="font-heading font-semibold text-teka-dark group-hover:text-teka-red">{tab.label}</h2>
              <p className="text-xs text-teka-gray mt-0.5">{tab.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Estado resumido */}
      <div className="mt-6 p-4 bg-teka-light border border-teka-border rounded flex items-center gap-3">
        <span className={`w-3 h-3 rounded-full shrink-0 ${aiEnabled && keyStatus === 'configured' ? 'bg-teka-success' : aiEnabled ? 'bg-teka-warning' : 'bg-teka-gray/40'}`} />
        <div className="text-sm text-teka-gray">
          {aiEnabled && keyStatus === 'configured' && <span className="text-teka-success font-medium">Modo IA activo</span>}
          {aiEnabled && keyStatus !== 'configured' && <span className="text-teka-warning font-medium">Modo IA activado mas chave em falta</span>}
          {!aiEnabled && <span>Modo automático (regras pré-definidas, sem custos)</span>}
          <span className="mx-2">·</span>
          <span>Modelo: Sonnet · 6 tools · 510+ produtos indexados</span>
        </div>
      </div>
    </div>
  );
}
