import { readStore } from '@/lib/db/json-store';
import type { Product } from '@/lib/types';

interface ProductDB extends Product {
  updatedAt: string;
  updatedBy?: string;
  status: 'active' | 'draft' | 'archived';
}

let cache: Product[] | null = null;

export async function getProducts(): Promise<Product[]> {
  if (cache) return cache;
  try {
    const products = await readStore<ProductDB[]>('products.json');
    cache = products.filter(p => p.status === 'active');
    return cache;
  } catch {
    // Fallback to static import if JSON doesn't exist yet
    const { products } = await import('@/data/products');
    return products;
  }
}

export async function getAllProducts(): Promise<ProductDB[]> {
  return readStore<ProductDB[]>('products.json');
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getProducts();
  return products.find(p => p.slug === slug) ?? null;
}

export async function getProductById(id: string): Promise<ProductDB | null> {
  const products = await readStore<ProductDB[]>('products.json');
  return products.find(p => p.id === id) ?? null;
}

export function invalidateProductCache() {
  cache = null;
}
