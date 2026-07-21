'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { Search, FileText, Download, Filter, Image, Archive, Ruler } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { getAllDocuments, products, categories } from '@/data/products';
import { DOCUMENT_TYPE_LABELS } from '@/lib/types';
import type { ProductDocument, DocumentType, DocumentFormat } from '@/lib/types';

const formatIcons: Record<DocumentFormat, React.ElementType> = {
  pdf: FileText, dwg: Ruler, dxf: Ruler, jpg: Image, png: Image, zip: Archive,
};

export default function DownloadsPage() {
  const allDocuments = useMemo(() => getAllDocuments(), []);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');

  const handleTypeChange = (v: string | null) => setTypeFilter(v ?? 'all');
  const handleCategoryChange = (v: string | null) => setCategoryFilter(v ?? 'all');
  const handleLanguageChange = (v: string | null) => setLanguageFilter(v ?? 'all');

  const documentTypes = [...new Set(allDocuments.map((d) => d.type))];
  const documentCategories = [...new Set(allDocuments.map((d) => d.category))];
  const documentLanguages = [...new Set(allDocuments.map((d) => d.language))];

  const filteredDocuments = useMemo(() => {
    return allDocuments.filter((doc) => {
      const product = products.find((p) => p.id === doc.productId);
      const matchesSearch =
        !search ||
        doc.name.toLowerCase().includes(search.toLowerCase()) ||
        product?.name.toLowerCase().includes(search.toLowerCase()) ||
        product?.reference.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === 'all' || doc.type === typeFilter;
      const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
      const matchesLanguage = languageFilter === 'all' || doc.language === languageFilter;
      return matchesSearch && matchesType && matchesCategory && matchesLanguage;
    });
  }, [allDocuments, search, typeFilter, categoryFilter, languageFilter]);

  const groupedByProduct = useMemo(() => {
    const groups: Record<string, { product: typeof products[0]; documents: ProductDocument[] }> = {};
    filteredDocuments.forEach((doc) => {
      const product = products.find((p) => p.id === doc.productId);
      if (!product) return;
      if (!groups[product.id]) groups[product.id] = { product, documents: [] };
      groups[product.id].documents.push(doc);
    });
    return Object.values(groups);
  }, [filteredDocuments]);

  return (
    <>
      {/* Banner */}
      <section className="relative bg-teka-dark py-16 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-teka-charcoal to-teka-dark" />
        <div className="relative max-w-[1440px] mx-auto px-6 text-center">
          <h1 className="font-heading font-extrabold text-4xl lg:text-5xl text-white">
            Centro de Downloads
          </h1>
          <p className="text-white/60 mt-3 max-w-lg mx-auto text-lg">
            Manuais, fichas técnicas, catálogos e toda a documentação dos produtos Teka.
          </p>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-6">
        <Breadcrumbs items={[{ label: 'Downloads' }]} />

        {/* Search & Filters */}
        <div className="py-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-teka-gray" />
            <input
              type="text"
              placeholder="Pesquisar por nome do produto, referência ou documento..."
              aria-label="Pesquisar documentos"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-teka-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-teka-red/20 focus:border-teka-red transition-colors"
            />
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-teka-gray">
              <Filter className="h-4 w-4" />
              <span>Filtrar por:</span>
            </div>

            <Select value={typeFilter} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-full sm:w-[200px] h-9 text-sm">
                <SelectValue placeholder="Tipo de documento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {documentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {DOCUMENT_TYPE_LABELS[type as DocumentType]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full sm:w-[180px] h-9 text-sm">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {documentCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={languageFilter} onValueChange={handleLanguageChange}>
              <SelectTrigger className="w-full sm:w-[160px] h-9 text-sm">
                <SelectValue placeholder="Idioma" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os idiomas</SelectItem>
                {documentLanguages.map((lang) => (
                  <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="text-sm text-teka-gray ml-auto">
              {filteredDocuments.length} documento{filteredDocuments.length !== 1 ? 's' : ''} encontrado{filteredDocuments.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Results */}
        <div className="pb-16 space-y-6">
          {groupedByProduct.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-12 w-12 text-teka-gray/30 mx-auto mb-4" />
              <h3 className="font-heading font-semibold text-lg text-teka-dark">Nenhum documento encontrado</h3>
              <p className="text-sm text-teka-gray mt-2">Tente ajustar os filtros ou termos de pesquisa.</p>
            </div>
          ) : (
            groupedByProduct.map(({ product, documents }) => (
              <div key={product.id} className="bg-white border border-teka-border rounded overflow-hidden">
                {/* Product Header */}
                <div className="flex items-center gap-4 p-4 bg-teka-light border-b border-teka-border">
                  <div className="relative w-12 h-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 shrink-0 overflow-hidden">
                    {(product.thumbnail || product.images?.[0]) && (
                      <NextImage src={product.thumbnail || product.images[0]} alt={product.name} fill sizes="48px" className="object-contain p-1" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/produto/${product.slug}`}
                      className="font-heading font-semibold text-teka-dark hover:text-teka-red transition-colors"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-teka-gray">{product.reference} · {product.subcategory}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {documents.length} doc{documents.length > 1 ? 's' : ''}
                  </Badge>
                </div>

                {/* Documents List */}
                <div className="divide-y divide-teka-border">
                  {documents.sort((a, b) => a.order - b.order).map((doc) => {
                    const Icon = formatIcons[doc.format] || FileText;
                    return (
                      <a
                        key={doc.id}
                        href={doc.url}
                        download
                        className="group flex items-center gap-4 p-4 hover:bg-teka-light/50 transition-colors"
                      >
                        <div className="shrink-0 w-9 h-9 rounded-lg bg-teka-red/10 flex items-center justify-center">
                          <Icon className="h-4 w-4 text-teka-red" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-teka-dark group-hover:text-teka-red transition-colors">
                            {doc.name}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-teka-gray">
                            <span>{DOCUMENT_TYPE_LABELS[doc.type]}</span>
                            <span>·</span>
                            <span>{doc.language}</span>
                            <span>·</span>
                            <span className="uppercase">{doc.format}</span>
                            {doc.size && (
                              <>
                                <span>·</span>
                                <span>{doc.size}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0 w-8 h-8 rounded-full border border-teka-border flex items-center justify-center group-hover:border-teka-red group-hover:bg-teka-red group-hover:text-white text-teka-gray transition-all">
                          <Download className="h-3.5 w-3.5" />
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
