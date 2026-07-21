import { tool } from 'ai';
import { z } from 'zod';
import { products, getProductBySlug } from '@/data/products';
import { faqs, articles } from '@/data/articles';

function normalizeText(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function loadCustomFaqs(): Array<{ question: string; answer: string; category: string }> {
  try {
    const data = require('@/data/chatbot/custom-faqs.json');
    return data.faqs || [];
  } catch { return []; }
}

export const chatTools = {
  search_products: tool({
    description: 'Pesquisa produtos no catálogo Teka. Usa sempre que o cliente pergunte sobre produtos ou queira recomendações.',
    inputSchema: z.object({
      query: z.string().describe('Texto livre de pesquisa ou nome do produto'),
    }),
    execute: async ({ query }) => {
      const q = normalizeText(query);
      const results = products.filter(p =>
        normalizeText(p.name).includes(q) ||
        normalizeText(p.shortDescription).includes(q) ||
        p.tags.some(t => normalizeText(t).includes(q)) ||
        p.reference.toLowerCase().includes(q) ||
        p.subcategory.includes(q) ||
        p.category.includes(q)
      );
      return {
        totalFound: results.length,
        products: results.slice(0, 6).map(p => ({
          id: p.id, slug: p.slug, name: p.name, reference: p.reference,
          subcategory: p.subcategory, priceAOA: p.priceAOA,
          energyRating: p.energyRating,
          thumbnail: p.thumbnail || p.images[0] || '',
          shortDescription: p.shortDescription, isNew: p.isNew,
          url: `/produto/${p.slug}`,
        })),
      };
    },
  }),

  get_product_details: tool({
    description: 'Obtém detalhes completos de um produto: especificações, funcionalidades, documentos.',
    inputSchema: z.object({
      reference: z.string().describe('Referência, SKU ou slug do produto'),
    }),
    execute: async ({ reference }) => {
      const product = getProductBySlug(reference) ||
        products.find(p => p.reference === reference || p.id === reference ||
          normalizeText(p.name).includes(normalizeText(reference)));
      if (!product) return { found: false as const, message: 'Produto não encontrado' };
      return {
        found: true as const,
        product: {
          name: product.name, reference: product.reference, ean: product.ean,
          category: product.category, subcategory: product.subcategory,
          shortDescription: product.shortDescription, description: product.description,
          priceAOA: product.priceAOA, energyRating: product.energyRating,
          thumbnail: product.thumbnail || product.images[0] || '',
          features: product.features.slice(0, 8),
          specifications: product.specifications.slice(0, 15),
          documents: product.documents.map(d => ({ name: d.name, type: d.type, url: d.url })),
          isNew: product.isNew, url: `/produto/${product.slug}`,
        },
      };
    },
  }),

  compare_products: tool({
    description: 'Compara 2 ou 3 produtos lado a lado com especificações e preços.',
    inputSchema: z.object({
      productRefs: z.array(z.string()).describe('Array com 2-3 referências ou slugs de produtos'),
    }),
    execute: async ({ productRefs }) => {
      const found = productRefs
        .map(ref => getProductBySlug(ref) || products.find(p => p.reference === ref || p.id === ref))
        .filter((p): p is NonNullable<typeof p> => p != null);
      if (found.length < 2) return { success: false as const, message: 'Não encontrei produtos suficientes.' };
      const allLabels = new Set<string>();
      found.forEach(p => p.specifications.forEach(s => allLabels.add(s.label)));
      return {
        success: true as const,
        products: found.map(p => ({
          name: p.name, reference: p.reference, priceAOA: p.priceAOA,
          energyRating: p.energyRating, thumbnail: p.thumbnail || p.images[0] || '',
          url: `/produto/${p.slug}`,
        })),
        comparison: Array.from(allLabels).slice(0, 12).map(label => ({
          spec: label,
          values: found.map(p => p.specifications.find(s => s.label === label)?.value || '—'),
        })),
      };
    },
  }),

  search_faqs: tool({
    description: 'Pesquisa nas Perguntas Frequentes. Usa para garantias, entregas, assistência, pagamentos.',
    inputSchema: z.object({
      query: z.string().describe('Pergunta ou tema a pesquisar'),
    }),
    execute: async ({ query }) => {
      const allFaqs = [...faqs, ...loadCustomFaqs()];
      const q = normalizeText(query);
      const matches = allFaqs.filter(f =>
        normalizeText(f.question).includes(q) || normalizeText(f.answer).includes(q)
      );
      return {
        found: matches.length > 0,
        results: matches.slice(0, 3).map(f => ({ question: f.question, answer: f.answer, category: f.category })),
      };
    },
  }),

  search_articles: tool({
    description: 'Pesquisa artigos de inspiração, dicas e receitas.',
    inputSchema: z.object({
      query: z.string().describe('Texto de pesquisa'),
    }),
    execute: async ({ query }) => {
      const q = normalizeText(query);
      const results = articles.filter(a =>
        normalizeText(a.title).includes(q) || normalizeText(a.excerpt).includes(q) ||
        a.tags.some(t => normalizeText(t).includes(q)) || normalizeText(a.category).includes(q)
      );
      return {
        found: results.length > 0,
        articles: results.slice(0, 4).map(a => ({
          title: a.title, excerpt: a.excerpt, category: a.category,
          readTime: a.readTime, url: `/inspiracao/${a.slug}`,
        })),
      };
    },
  }),

  get_support_info: tool({
    description: 'Retorna informações de suporte e contacto.',
    inputSchema: z.object({
      type: z.enum(['contacto', 'assistencia', 'garantia', 'entrega', 'pagamento']).describe('Tipo de informação'),
    }),
    execute: async ({ type }) => {
      const info: Record<string, Record<string, unknown>> = {
        contacto: { telefone: '+244 933 302 752', email: 'teka@mdvmadeiras.com', horario: 'Seg-Sex 8h-17h', morada: 'Luanda, Angola' },
        assistencia: { telefone: '+244 933 302 752', cobertura: 'Luanda (direto), províncias (parceiros)', processo: 'Contactar com referência do produto.' },
        garantia: { periodo: '12 meses', cobertura: 'Defeitos de fabrico, peças e mão de obra', ativacao: 'Guardar fatura de compra' },
        entrega: { luanda: '3-5 dias úteis', provincias: '7-15 dias úteis', instalacao: 'Disponível mediante orçamento' },
        pagamento: { metodos: ['Transferência bancária', 'Multicaixa Express', 'Pagamento na entrega (Luanda)'], prestacoes: 'Compras > 500.000 Kz' },
      };
      return info[type] || info.contacto;
    },
  }),
};
