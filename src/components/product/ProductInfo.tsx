'use client';

import { useState } from 'react';
import { Zap, Check, Share2, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import type { Product } from '@/lib/types';

interface FullData {
  shortName?: string;
  fullName?: string;
  color?: string;
  featureIcons?: string[];
  energyLabel?: string;
}

interface ProductInfoProps {
  product: Product;
  fullData?: FullData;
}

export function ProductInfo({ product, fullData }: ProductInfoProps) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]?.id ?? null);
  const [addedToCart, setAddedToCart] = useState(false);
  const { isAuthenticated, isAdmin, isDistributor } = useAuth();
  const { addItem } = useCart();
  const showPrice = isAuthenticated && (isAdmin || isDistributor);

  const shortName = fullData?.shortName || product.name;
  const fullName = fullData?.fullName || product.description;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      reference: product.reference,
      image: product.thumbnail || product.images?.[0] || '',
      priceAOA: product.priceAOA || 0,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        {product.isNew && (
          <Badge className="bg-teka-red text-white border-0 text-[10px] rounded">NOVO</Badge>
        )}
        {product.energyRating && (
          <Badge variant="secondary" className="font-semibold text-xs">
            <Zap className="h-3 w-3 mr-1" />
            {product.energyRating}
          </Badge>
        )}
        <Badge variant="outline" className="text-xs">{product.reference}</Badge>
      </div>

      {/* Modelo (h2, cinza) + Nome completo (h1, bold) — como no site oficial */}
      <div>
        <h2 className="text-teka-gray text-base font-normal tracking-wide">
          {shortName}
        </h2>
        <h1 className="font-heading font-bold text-2xl lg:text-3xl text-teka-dark leading-tight mt-1">
          {fullName}
        </h1>
      </div>

      {/* CTA principal — full width como no site oficial */}
      {isAuthenticated ? (
        <Button
          size="lg"
          onClick={handleAddToCart}
          className={`w-full h-12 text-sm ${addedToCart ? 'bg-green-600 hover:bg-green-700' : 'bg-teka-red hover:bg-teka-red-dark'} text-white`}
        >
          {addedToCart ? (
            <><Check className="h-4 w-4 mr-2" /> ADICIONADO</>
          ) : (
            <><ShoppingCart className="h-4 w-4 mr-2" /> ADICIONAR AO CARRINHO</>
          )}
        </Button>
      ) : (
        <Button size="lg" className="w-full h-12 text-sm bg-teka-red hover:bg-teka-red-dark text-white">
          COMPRAR
        </Button>
      )}

      {/* Features como bullet list (▪) — como no site oficial */}
      {product.features.length > 0 && (
        <ul className="space-y-1.5">
          {product.features.map((f) => (
            <li key={f.title} className="flex items-start gap-2 text-sm text-teka-dark">
              <span className="text-teka-gray mt-0.5 text-xs">▪</span>
              <span>{f.title}{f.description ? `: ${f.description}` : ''}</span>
            </li>
          ))}
        </ul>
      )}

      {/* REF + EAN na mesma linha — como no site oficial */}
      <div className="text-sm text-teka-gray flex gap-4">
        <span>REF. {product.reference}</span>
        {product.ean && <span>EAN. {product.ean}</span>}
      </div>

      {/* Variantes / seletor de cor */}
      {product.variants.length > 0 && (
        <div>
          <p className="text-xs font-medium text-teka-gray mb-2">Selecione uma cor:</p>
          <div className="flex gap-2">
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant.id)}
                className={`flex items-center gap-2 px-3 py-2 border-2 rounded transition-colors text-sm ${
                  selectedVariant === variant.id
                    ? 'border-teka-red bg-teka-red/5'
                    : 'border-teka-border hover:border-teka-gray'
                }`}
              >
                {variant.color && (
                  <div className="w-4 h-4 rounded-full border border-teka-border" style={{ backgroundColor: variant.color }} />
                )}
                <span className="font-medium">{variant.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Etiqueta energética */}
      {product.energyRating && (
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-14 border border-teka-border rounded text-xs font-bold text-teka-dark">
            {product.energyRating}
          </div>
          <span className="text-xs text-teka-gray">Ficha técnica EU</span>
        </div>
      )}

      {/* Preço (autenticado) */}
      {showPrice && (product.priceAOA ?? 0) > 0 && (
        <div className="p-4 bg-teka-light rounded border border-teka-border">
          <p className="text-xs text-teka-gray uppercase tracking-wider">Preço (sem IVA)</p>
          <p className="font-heading font-bold text-2xl text-teka-dark mt-1">
            {new Intl.NumberFormat('pt-AO').format(product.priceAOA!)} <span className="text-sm font-normal text-teka-gray">Kz</span>
          </p>
        </div>
      )}

      {/* Partilhar */}
      <Button variant="outline" size="sm" className="w-fit gap-2">
        <Share2 className="h-4 w-4" /> PARTILHAR
      </Button>

      {/* Quick stats */}
      <div className="flex items-center gap-6 text-xs text-teka-gray border-t border-teka-border pt-3">
        <span>{product.documents.length} documentos</span>
        <span>{product.specifications.length} especificações</span>
      </div>
    </div>
  );
}
