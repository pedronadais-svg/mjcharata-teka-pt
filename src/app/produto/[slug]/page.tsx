import { notFound } from 'next/navigation';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { ProductGallery } from '@/components/product/ProductGallery';
import { ProductInfo } from '@/components/product/ProductInfo';
import { ProductSpecifications } from '@/components/product/ProductSpecifications';
import { ProductDocuments } from '@/components/documents/ProductDocuments';
import { ProductRelated } from '@/components/product/ProductRelated';
import { ProductStickyNav } from '@/components/product/ProductStickyNav';
import { ProductEditorial } from '@/components/product/ProductEditorial';
import { ProductAccessories } from '@/components/product/ProductAccessories';
import { products, getProductBySlug, categories } from '@/data/products';
import { getProductImages } from '@/data/product-images';
import rawFullData from '@/data/product-full-data.json';
import type { Metadata } from 'next';

interface FullProductData {
  videos?: string[];
  drawing?: string;
  featureIcons?: string[];
  relatedSkus?: string[];
  fullName?: string;
  shortName?: string;
  color?: string;
  productImages?: string[];
  lifestyleImages?: string[];
  editorialSections?: { type: string; title?: string; text?: string; image?: string; videoUrl?: string }[];
  energyLabel?: string;
}

const fullDataMap = rawFullData as Record<string, FullProductData>;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  const fullData = fullDataMap[product.id];
  const title = fullData?.shortName || product.name;
  const description = fullData?.fullName || product.shortDescription;
  const image = product.images[0] || product.thumbnail || undefined;
  return {
    title,
    description,
    alternates: { canonical: `/produto/${slug}` },
    openGraph: { title, description, ...(image && { images: [{ url: image }] }) },
  };
}

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const fullData = fullDataMap[product.id] || {};

  // Breadcrumb
  const categoryMap: Record<string, { label: string; href: string }> = {
    'cozinha': { label: 'Cozinha', href: '/cozinha' },
    'lavandaria': { label: 'Lavandaria', href: '/lavandaria' },
    'termoacumuladores': { label: 'Termoacumuladores', href: '/termoacumuladores' },
    'ar-condicionado': { label: 'Ar Condicionado', href: '/ar-condicionado' },
  };
  const cat = categoryMap[product.category] || { label: product.category, href: '/' };
  const categoryData = categories.find((c) => c.slug === product.category);
  const subCategoryData = categoryData?.subcategories.find((s) => s.slug === product.subcategory);
  const subcategoryLabel = subCategoryData?.name || product.subcategory;
  const shortName = fullData.shortName || product.name;

  // Related products
  const relatedIds = (fullData.relatedSkus?.length ? fullData.relatedSkus : product.relatedProductIds).slice(0, 6);

  // Content checks
  const hasEditorial = (fullData.editorialSections && fullData.editorialSections.length > 0) ||
    (fullData.lifestyleImages && fullData.lifestyleImages.length > 0) ||
    (fullData.videos && fullData.videos.length > 0);

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: fullData.fullName || product.shortDescription,
    sku: product.reference,
    image: product.images[0] || product.thumbnail || undefined,
    brand: { '@type': 'Brand', name: 'Teka' },
    ...(product.priceAOA && product.priceAOA > 0 && {
      offers: {
        '@type': 'Offer',
        priceCurrency: 'AOA',
        price: product.priceAOA,
        availability: 'https://schema.org/InStock',
      },
    }),
    ...(product.energyRating && {
      additionalProperty: {
        '@type': 'PropertyValue',
        name: 'Classe Energética',
        value: product.energyRating,
      },
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Sticky Navigation */}
      <ProductStickyNav
        productName={shortName}
        sections={[
          { id: 'caracteristicas', label: 'Características', hasContent: !!hasEditorial },
          { id: 'especificacoes', label: 'Especificações', hasContent: product.specifications.length > 0 },
          { id: 'documentacao', label: 'Documentação', hasContent: product.documents.length > 0 },
          { id: 'acessorios', label: 'Acessórios', hasContent: true },
        ]}
      />

      <div className="max-w-[1440px] mx-auto px-6">
        {/* Breadcrumb — usa shortName */}
        <Breadcrumbs
          items={[
            cat,
            { label: subcategoryLabel, href: `${cat.href}/${product.subcategory}` },
            { label: shortName },
          ]}
        />

        {/* 1. HERO — Galeria + Info */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 pb-10">
          <ProductGallery
            images={getProductImages(product.id).length > 0 ? getProductImages(product.id) : product.images.filter(Boolean)}
            name={product.name}
            videos={fullData.videos}
            drawing={fullData.drawing}
          />
          <ProductInfo
            product={product}
            fullData={{
              shortName: fullData.shortName,
              fullName: fullData.fullName,
              color: fullData.color,
              featureIcons: fullData.featureIcons,
              energyLabel: fullData.energyLabel,
            }}
          />
        </div>

        {/* 2. CARACTERÍSTICAS EDITORIAIS (imagens lifestyle, vídeos) */}
        {hasEditorial && (
          <div id="caracteristicas" className="border-t border-teka-border">
            <ProductEditorial
              sections={(fullData.editorialSections || []) as { type: 'image-text' | 'text-image' | 'video' | 'full-width-image' | 'feature-grid'; title?: string; text?: string; image?: string; videoUrl?: string }[]}
              lifestyleImages={fullData.lifestyleImages || []}
              videos={fullData.videos || []}
            />
          </div>
        )}

        {/* 3. ESPECIFICAÇÕES (acordeões +) */}
        {(product.specifications.length > 0 || product.features.length > 0) && (
          <div id="especificacoes" className="py-10 border-t border-teka-border">
            <ProductSpecifications
              specifications={product.specifications}
              features={product.features}
              featureIcons={fullData.featureIcons || []}
            />
          </div>
        )}

        {/* 4. DOCUMENTAÇÃO */}
        {product.documents.length > 0 && (
          <div id="documentacao" className="py-10 border-t border-teka-border">
            <ProductDocuments documents={product.documents} productName={product.name} />
          </div>
        )}

        {/* 5. ACESSÓRIOS COMPATÍVEIS */}
        <div id="acessorios" className="py-10 border-t border-teka-border">
          <ProductAccessories productId={product.id} subcategory={product.subcategory} />
        </div>

        {/* 6. PRODUTOS RELACIONADOS */}
        <div className="py-10 border-t border-teka-border">
          <ProductRelated currentProductId={product.id} relatedIds={relatedIds} subcategory={product.subcategory} />
        </div>
      </div>
    </>
  );
}
