'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function AnalyticsPage() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => { if (!isLoading && (!isAuthenticated || !isAdmin)) router.push('/login'); }, [isAuthenticated, isAdmin, isLoading, router]);

  if (isLoading || !isAuthenticated || !isAdmin) return null;

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/chatbot" className="p-2 hover:bg-teka-light rounded"><ArrowLeft className="h-5 w-5 text-teka-gray" /></Link>
        <h1 className="font-heading font-bold text-2xl text-teka-dark">Analytics</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[['Conversas', '0', '+0%'], ['Mensagens', '0', '+0%'], ['Tokens', '0', '+0%'], ['Custo', '$0.00', '+0%']].map(([label, value, change]) => (
          <div key={label} className="bg-white border border-teka-border rounded p-4">
            <p className="text-2xl font-heading font-bold text-teka-dark">{value}</p>
            <p className="text-xs text-teka-gray mt-1">{label}</p>
            <p className="text-xs text-teka-success mt-0.5">{change}</p>
          </div>
        ))}
      </div>

      <div className="text-center py-8">
        <BarChart3 className="h-12 w-12 text-teka-gray/20 mx-auto mb-4" />
        <p className="text-sm text-teka-gray">As métricas serão apresentadas quando o chatbot com IA estiver activo.</p>
        <p className="text-xs text-teka-gray mt-2">Custo estimado mensal com Sonnet: ~$25 para 500 conversas/mês</p>
      </div>
    </div>
  );
}
