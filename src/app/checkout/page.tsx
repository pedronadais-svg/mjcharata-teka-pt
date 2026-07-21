'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

export default function CheckoutPage() {
  const { session, isAuthenticated } = useAuth();
  const { items, total, itemCount, placeOrder } = useCart();
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState('');

  const [form, setForm] = useState({
    name: session?.name || '',
    email: session?.email || '',
    phone: '',
    company: session?.company || '',
    notes: '',
  });

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
    if (items.length === 0 && !submitted) router.push('/carrinho');
  }, [isAuthenticated, items.length, submitted, router]);

  useEffect(() => {
    if (session) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || session.name,
        email: prev.email || session.email,
        company: prev.company || session.company || '',
      }));
    }
  }, [session]);

  if (!isAuthenticated) return null;

  if (submitted) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 py-16 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="font-heading font-bold text-2xl text-teka-dark">Encomenda Confirmada</h1>
        <p className="text-teka-gray mt-2">A sua encomenda <span className="font-semibold text-teka-dark">{orderId}</span> foi registada com sucesso.</p>
        <p className="text-sm text-teka-gray mt-4">Receberá um contacto da equipa MDV para confirmar detalhes e entrega.</p>
        <div className="flex items-center justify-center gap-4 mt-8">
          <Link href="/" className="px-6 py-3 bg-teka-red hover:bg-teka-red-dark text-white font-medium rounded transition-colors">
            Voltar ao início
          </Link>
          <Link href="/admin" className="px-6 py-3 border border-teka-border text-teka-dark hover:bg-teka-light font-medium rounded transition-colors">
            Ver encomendas
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const order = placeOrder(form);
    setOrderId(order.id);
    setSubmitted(true);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      <Link href="/carrinho" className="inline-flex items-center gap-2 text-sm text-teka-gray hover:text-teka-red transition-colors mb-6">
        <ArrowLeft className="h-4 w-4" /> Voltar ao carrinho
      </Link>

      <h1 className="font-heading font-bold text-2xl text-teka-dark mb-6">Finalizar Encomenda</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-teka-border rounded p-6">
            <h2 className="font-heading font-semibold text-lg text-teka-dark mb-4">Dados de Contacto</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-teka-dark mb-1.5">Nome completo *</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-teka-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-teka-red/20 focus:border-teka-red" />
              </div>
              <div>
                <label className="block text-sm font-medium text-teka-dark mb-1.5">Email *</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-teka-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-teka-red/20 focus:border-teka-red" />
              </div>
              <div>
                <label className="block text-sm font-medium text-teka-dark mb-1.5">Telefone *</label>
                <input type="tel" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+244 900 000 000"
                  className="w-full px-4 py-2.5 border border-teka-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-teka-red/20 focus:border-teka-red" />
              </div>
              <div>
                <label className="block text-sm font-medium text-teka-dark mb-1.5">Empresa</label>
                <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                  className="w-full px-4 py-2.5 border border-teka-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-teka-red/20 focus:border-teka-red" />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-teka-dark mb-1.5">Notas / Observações</label>
              <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Instruções especiais, morada de entrega, etc."
                className="w-full px-4 py-2.5 border border-teka-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-teka-red/20 focus:border-teka-red resize-none" />
            </div>
          </div>

          <button type="submit"
            className="w-full px-8 py-3.5 bg-teka-red hover:bg-teka-red-dark text-white font-semibold rounded transition-colors">
            Confirmar Encomenda
          </button>
        </form>

        {/* Order Summary */}
        <div className="bg-white border border-teka-border rounded p-6 h-fit sticky top-24">
          <h2 className="font-heading font-semibold text-lg text-teka-dark mb-4">Resumo ({itemCount} artigos)</h2>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center justify-between text-sm">
                <span className="text-teka-gray truncate max-w-[180px]">{item.name} × {item.quantity}</span>
                {item.priceAOA > 0 && (
                  <span className="font-medium text-teka-dark shrink-0 ml-2">
                    {new Intl.NumberFormat('pt-AO').format(item.priceAOA * item.quantity)} Kz
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="border-t border-teka-border mt-4 pt-4 flex justify-between font-semibold text-teka-dark">
            <span>Total</span>
            <span>{total > 0 ? `${new Intl.NumberFormat('pt-AO').format(total)} Kz` : 'Sob consulta'}</span>
          </div>
          <p className="text-xs text-teka-gray mt-3">Preços sem IVA. A equipa MDV contactará para confirmar disponibilidade e entrega.</p>
        </div>
      </div>
    </div>
  );
}
