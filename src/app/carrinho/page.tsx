'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

export default function CarrinhoPage() {
  const { isAuthenticated } = useAuth();
  const { items, itemCount, total, updateQuantity, removeItem, clearCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  if (items.length === 0) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 py-16 text-center">
        <ShoppingCart className="h-16 w-16 text-teka-gray/20 mx-auto mb-4" />
        <h1 className="font-heading font-bold text-2xl text-teka-dark">Carrinho vazio</h1>
        <p className="text-teka-gray mt-2">Ainda não adicionou produtos ao carrinho.</p>
        <Link href="/cozinha" className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-teka-red hover:bg-teka-red-dark text-white font-medium rounded transition-colors">
          Explorar produtos <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      <h1 className="font-heading font-bold text-2xl text-teka-dark mb-6">
        Carrinho ({itemCount} {itemCount === 1 ? 'artigo' : 'artigos'})
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center gap-4 p-4 bg-white border border-teka-border rounded">
              <div className="relative w-16 h-16 bg-teka-light rounded shrink-0 overflow-hidden">
                {item.image ? (
                  <Image src={item.image} alt="" fill sizes="64px" className="object-contain p-1" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-teka-gray/20 text-xs">—</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/produto/${item.slug}`} className="text-sm font-medium text-teka-dark hover:text-teka-red transition-colors line-clamp-1">
                  {item.name}
                </Link>
                <p className="text-xs text-teka-gray mt-0.5">{item.reference}</p>
                {item.priceAOA > 0 && (
                  <p className="text-sm font-semibold text-teka-dark mt-1">
                    {new Intl.NumberFormat('pt-AO').format(item.priceAOA)} Kz
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button aria-label="Diminuir quantidade" onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="w-7 h-7 rounded border border-teka-border flex items-center justify-center hover:bg-teka-light">
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                <button aria-label="Aumentar quantidade" onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="w-7 h-7 rounded border border-teka-border flex items-center justify-center hover:bg-teka-light">
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              <div className="text-right shrink-0 w-24">
                {item.priceAOA > 0 && (
                  <p className="text-sm font-semibold text-teka-dark">
                    {new Intl.NumberFormat('pt-AO').format(item.priceAOA * item.quantity)} Kz
                  </p>
                )}
              </div>
              <button aria-label="Remover do carrinho" onClick={() => removeItem(item.productId)} className="text-teka-gray hover:text-red-500 transition-colors shrink-0">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          <div className="flex items-center justify-between pt-4">
            <Link href="/cozinha" className="inline-flex items-center gap-2 text-sm text-teka-gray hover:text-teka-red transition-colors">
              <ArrowLeft className="h-4 w-4" /> Continuar a comprar
            </Link>
            <button onClick={clearCart} className="text-sm text-teka-gray hover:text-red-500 transition-colors">
              Limpar carrinho
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white border border-teka-border rounded p-6 h-fit sticky top-24">
          <h2 className="font-heading font-semibold text-lg text-teka-dark mb-4">Resumo</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-teka-gray">Subtotal ({itemCount} artigos)</span>
              <span className="font-medium text-teka-dark">
                {total > 0 ? `${new Intl.NumberFormat('pt-AO').format(total)} Kz` : 'Sob consulta'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-teka-gray">IVA</span>
              <span className="text-teka-gray">Calculado no checkout</span>
            </div>
            <div className="border-t border-teka-border pt-3 flex justify-between font-semibold">
              <span className="text-teka-dark">Total</span>
              <span className="text-teka-dark text-lg">
                {total > 0 ? `${new Intl.NumberFormat('pt-AO').format(total)} Kz` : 'Sob consulta'}
              </span>
            </div>
          </div>
          <Link
            href="/checkout"
            className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-teka-red hover:bg-teka-red-dark text-white font-medium rounded transition-colors"
          >
            Finalizar encomenda
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="text-xs text-teka-gray text-center mt-3">Preços sem IVA. Instalação não incluída.</p>
        </div>
      </div>
    </div>
  );
}
