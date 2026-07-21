'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Minus, Send, Bot } from 'lucide-react';

const AI_MODE = !!process.env.NEXT_PUBLIC_AI_CHAT;

interface FbMsg {
  id: string;
  role: string;
  text: string;
  quickReplies?: string[];
  productCards?: Array<{ id: string; slug: string; name: string; image: string; subcategory: string }>;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // AI mode (manual fetch with streaming)
  const [aiMsgs, setAiMsgs] = useState<Array<{ id: string; role: 'user' | 'assistant'; content: string }>>([
    { id: 'w', role: 'assistant', content: 'Olá! Sou o Assistente Teka. Como posso ajudar hoje?' },
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const sendAi = useCallback(async (text: string) => {
    if (!text.trim() || aiLoading) return;
    const userMsg = { id: `u-${Date.now()}`, role: 'user' as const, content: text.trim() };
    const newMsgs = [...aiMsgs, userMsg];
    setAiMsgs(newMsgs);
    setAiInput('');
    setAiLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMsgs.map(m => ({ role: m.role, content: m.content })) }),
      });

      if (!res.ok) throw new Error('API error');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';
      const assistantId = `a-${Date.now()}`;

      setAiMsgs(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          // Parse SSE data lines
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('0:')) {
              try {
                const text = JSON.parse(line.slice(2));
                assistantText += text;
                setAiMsgs(prev => prev.map(m => m.id === assistantId ? { ...m, content: assistantText } : m));
              } catch {}
            }
          }
        }
      }
    } catch {
      setAiMsgs(prev => [...prev, { id: `e-${Date.now()}`, role: 'assistant', content: 'Peço desculpa, ocorreu um erro. Tente novamente.' }]);
    } finally {
      setAiLoading(false);
    }
  }, [aiMsgs, aiLoading]);

  // Fallback mode
  const [fbMsgs, setFbMsgs] = useState<FbMsg[]>([]);
  const [fbState, setFbState] = useState({ flow: 'idle', step: 0, context: {} as Record<string, string> });
  const [fbInput, setFbInput] = useState('');
  const [fbTyping, setFbTyping] = useState(false);
  const [fbInit, setFbInit] = useState(false);

  useEffect(() => {
    if (isOpen && !AI_MODE && !fbInit) {
      setFbMsgs([{
        id: 'w', role: 'bot', text: 'Olá! Sou o Assistente Teka Angola. Como posso ajudar?',
        quickReplies: ['Encontrar Produto', 'Suporte Técnico', 'Comparar Produtos', 'FAQ'],
      }]);
      setFbInit(true);
    }
  }, [isOpen, fbInit]);

  const sendFb = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setFbMsgs(p => [...p, { id: `u-${Date.now()}`, role: 'user', text: text.trim() }]);
    setFbInput('');
    setFbTyping(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim(), state: fbState }),
      });
      const data = await res.json();
      await new Promise(r => setTimeout(r, 500));
      if (data.response) { setFbMsgs(p => [...p, data.response]); setFbState(data.state); }
    } catch {
      setFbMsgs(p => [...p, { id: `e-${Date.now()}`, role: 'bot', text: 'Erro. Tente novamente.', quickReplies: ['Voltar ao início'] }]);
    } finally { setFbTyping(false); }
  }, [fbState]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [aiMsgs, fbMsgs]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.altKey && e.key === 'c') { setIsOpen(p => !p); setIsMinimized(false); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const loading = AI_MODE ? aiLoading : fbTyping;

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} whileHover={{ scale: 1.1 }}
            onClick={() => { setIsOpen(true); setIsMinimized(false); }}
            aria-label="Abrir chat de assistência"
            className="fixed bottom-6 right-6 w-[60px] h-[60px] bg-teka-red hover:bg-teka-red-dark text-white rounded-full shadow-lg flex items-center justify-center z-[9999]">
            <MessageCircle className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            role="region" aria-label="Chat de assistência"
            className="fixed bottom-6 right-6 w-[calc(100%-48px)] sm:w-[400px] h-[85vh] sm:h-[560px] max-h-[650px] bg-white rounded shadow-2xl border border-teka-border flex flex-col z-[9999] overflow-hidden">

            <div className="flex items-center justify-between px-4 py-3 bg-teka-red text-white shrink-0">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                <span className="font-semibold text-sm">Assistente Teka</span>
                {AI_MODE && <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded">AI</span>}
              </div>
              <div className="flex gap-1">
                <button aria-label="Minimizar" onClick={() => setIsMinimized(true)} className="w-7 h-7 rounded hover:bg-white/20 flex items-center justify-center"><Minus className="h-4 w-4" /></button>
                <button aria-label="Fechar" onClick={() => setIsOpen(false)} className="w-7 h-7 rounded hover:bg-white/20 flex items-center justify-center"><X className="h-4 w-4" /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" aria-live="polite">
              {AI_MODE ? aiMsgs.map(m => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-teka-red text-white' : 'bg-[#F0F4F8] text-teka-dark'}`}>
                    {m.content || '...'}
                  </div>
                </div>
              )) : fbMsgs.map(m => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[85%]">
                    <div className={`px-3 py-2 rounded text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-teka-red text-white' : 'bg-[#F0F4F8] text-teka-dark'}`}>{m.text}</div>
                    {m.productCards && m.productCards.length > 0 && (
                      <div className="mt-2 space-y-1.5">
                        {m.productCards.map(c => (
                          <Link key={c.id} href={`/produto/${c.slug}`} onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 p-2 bg-white border border-teka-border rounded hover:border-teka-red/30">
                            {c.image && <div className="relative w-10 h-10 bg-teka-light rounded shrink-0 overflow-hidden"><Image src={c.image} alt="" fill sizes="40px" className="object-contain p-0.5" /></div>}
                            <div className="min-w-0"><p className="text-xs font-medium text-teka-dark truncate">{c.name}</p><p className="text-[10px] text-teka-gray">{c.subcategory}</p></div>
                          </Link>
                        ))}
                      </div>
                    )}
                    {m.quickReplies && m.quickReplies.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {m.quickReplies.map((r, i) => (
                          <motion.button key={r} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }}
                            onClick={() => sendFb(r)}
                            className="px-3 py-1.5 text-xs font-medium text-teka-red bg-white border border-teka-red/30 rounded-full hover:bg-teka-red hover:text-white transition-colors">
                            {r}
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex gap-1 px-3 py-2 bg-[#F0F4F8] rounded w-fit">
                  {[0, 1, 2].map(i => (<motion.span key={i} className="w-1.5 h-1.5 bg-teka-gray/50 rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {AI_MODE ? (
              <form onSubmit={e => { e.preventDefault(); sendAi(aiInput); }} className="shrink-0 border-t border-teka-border px-3 py-2">
                <div className="flex items-center gap-2">
                  <input value={aiInput} onChange={e => setAiInput(e.target.value)} placeholder="Escreva a sua mensagem..." aria-label="Mensagem" disabled={aiLoading}
                    className="flex-1 px-3 py-2 text-sm bg-teka-light border border-teka-border rounded focus:outline-none focus:border-teka-red disabled:opacity-50" />
                  <button type="submit" disabled={!aiInput.trim() || aiLoading} aria-label="Enviar"
                    className="w-9 h-9 bg-teka-red hover:bg-teka-red-dark text-white rounded flex items-center justify-center disabled:opacity-40 shrink-0"><Send className="h-4 w-4" /></button>
                </div>
                <div className="flex items-center justify-between mt-1.5 text-[10px] text-teka-gray/60">
                  <span>Assistente IA</span>
                  <Link href="/suporte/contacto" onClick={() => setIsOpen(false)} className="hover:text-teka-red">Falar com humano</Link>
                </div>
              </form>
            ) : (
              <form onSubmit={e => { e.preventDefault(); sendFb(fbInput); }} className="shrink-0 border-t border-teka-border px-3 py-2">
                <div className="flex items-center gap-2">
                  <input value={fbInput} onChange={e => setFbInput(e.target.value)} placeholder="Escreva a sua mensagem..." aria-label="Mensagem" disabled={fbTyping}
                    className="flex-1 px-3 py-2 text-sm bg-teka-light border border-teka-border rounded focus:outline-none focus:border-teka-red disabled:opacity-50" />
                  <button type="submit" disabled={!fbInput.trim() || fbTyping} aria-label="Enviar"
                    className="w-9 h-9 bg-teka-red hover:bg-teka-red-dark text-white rounded flex items-center justify-center disabled:opacity-40 shrink-0"><Send className="h-4 w-4" /></button>
                </div>
                <div className="flex items-center justify-between mt-1.5 text-[10px] text-teka-gray/60">
                  <span>Assistente automático</span>
                  <Link href="/suporte/contacto" onClick={() => setIsOpen(false)} className="hover:text-teka-red">Falar com humano</Link>
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && isMinimized && (
          <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            onClick={() => setIsMinimized(false)}
            className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2.5 bg-teka-red text-white rounded shadow-lg z-[9999] hover:bg-teka-red-dark">
            <Bot className="h-4 w-4" /><span className="text-sm font-medium">Assistente Teka</span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
