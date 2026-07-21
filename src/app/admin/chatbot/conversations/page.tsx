'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function ConversationsPage() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => { if (!isLoading && (!isAuthenticated || !isAdmin)) router.push('/login'); }, [isAuthenticated, isAdmin, isLoading, router]);

  if (isLoading || !isAuthenticated || !isAdmin) return null;

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/chatbot" className="p-2 hover:bg-teka-light rounded"><ArrowLeft className="h-5 w-5 text-teka-gray" /></Link>
        <h1 className="font-heading font-bold text-2xl text-teka-dark">Conversas</h1>
      </div>
      <div className="text-center py-16">
        <MessageSquare className="h-12 w-12 text-teka-gray/20 mx-auto mb-4" />
        <h2 className="font-heading font-semibold text-lg text-teka-dark">Histórico de Conversas</h2>
        <p className="text-sm text-teka-gray mt-2">As conversas do chatbot com IA serão registadas aqui quando a API key for configurada.</p>
        <p className="text-xs text-teka-gray mt-4">Ficheiro: <code className="bg-teka-light px-1 rounded">src/data/chatbot/conversations.json</code></p>
      </div>
    </div>
  );
}
