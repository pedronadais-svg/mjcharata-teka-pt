// ============================================================
// Teka PT — Modelos de dados centrais
// ============================================================

// --- Documentos ---

export type DocumentType =
  | 'manual'
  | 'ficha-tecnica'
  | 'guia-instalacao'
  | 'etiqueta-energetica'
  | 'ficha-produto'
  | 'desenho-tecnico'
  | 'declaracao-conformidade'
  | 'catalogo'
  | 'certificado'
  | 'outro';

export type DocumentFormat = 'pdf' | 'dwg' | 'dxf' | 'jpg' | 'png' | 'zip';

export interface ProductDocument {
  id: string;
  name: string;
  type: DocumentType;
  language: string;
  format: DocumentFormat;
  size?: string;
  url: string;
  productId: string;
  category: string;
  order: number;
}

// --- Produtos ---

export type EnergyRating = 'A+++' | 'A++' | 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export interface ProductSpecification {
  label: string;
  value: string;
  group?: string;
}

export interface ProductFeature {
  icon?: string;
  title: string;
  description: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  color?: string;
  reference: string;
  image?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  reference: string;
  shortDescription: string;
  description: string;
  category: string;
  subcategory: string;
  subfamily?: string;
  images: string[];
  thumbnail: string;
  energyRating?: EnergyRating;
  ean?: string;
  refPhc?: string;
  priceAOA?: number;
  features: ProductFeature[];
  specifications: ProductSpecification[];
  variants: ProductVariant[];
  documents: ProductDocument[];
  relatedProductIds: string[];
  isNew?: boolean;
  isPromoted?: boolean;
  tags: string[];
  color?: string;
  edition?: string;
  installation?: string;
  width?: string;
}

// --- Categorias ---

export interface SubSubCategory {
  id: string;
  slug: string;
  name: string;
}

export interface SubCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
  children?: SubSubCategory[];
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  banner?: string;
  subcategories: SubCategory[];
}

// --- Configuração de Filtros por Família ---

export type FilterType = 'dropdown-checkbox';

export interface FilterConfig {
  id: string;
  label: string;
  field: string;
  type: FilterType;
  hidden?: boolean;
  extractFrom: 'field' | 'specs' | 'name' | 'custom';
  specLabel?: string;
  customValues?: string[];
}

export interface FamilyFilterConfig {
  familySlug: string;
  filters: FilterConfig[];
}

// --- Navegação ---

export interface MenuItem {
  label: string;
  href: string;
  children?: MenuItem[];
  featured?: boolean;
  image?: string;
  description?: string;
}

// --- Conteúdo Editorial ---

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  tags: string[];
}

// --- Suporte ---

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface SupportSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
}

// --- Breadcrumbs ---

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// --- Filtros ---

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
  type: 'checkbox' | 'radio' | 'range';
}

// --- Mapa de tipos de documento para labels ---

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  'manual': 'Manual de Utilizador',
  'ficha-tecnica': 'Ficha Técnica',
  'guia-instalacao': 'Guia de Instalação',
  'etiqueta-energetica': 'Etiqueta Energética',
  'ficha-produto': 'Ficha de Produto',
  'desenho-tecnico': 'Desenho Técnico',
  'declaracao-conformidade': 'Declaração de Conformidade',
  'catalogo': 'Catálogo',
  'certificado': 'Certificado',
  'outro': 'Outro',
};

export const DOCUMENT_FORMAT_ICONS: Record<DocumentFormat, string> = {
  pdf: 'FileText',
  dwg: 'Ruler',
  dxf: 'Ruler',
  jpg: 'Image',
  png: 'Image',
  zip: 'Archive',
};
