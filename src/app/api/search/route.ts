import { products } from '@/data/products';
import { getProductImages } from '@/data/product-images';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') || '';

  if (q.length < 2) {
    return Response.json({ results: [] });
  }

  const results = products
    .filter((p) => {
      const searchable = `${p.name} ${p.reference} ${p.ean || ''} ${p.subcategory} ${p.category} ${p.tags.join(' ')}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      return searchable.includes(q);
    })
    .slice(0, 8)
    .map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      reference: p.reference,
      subcategory: p.subcategory,
      image: getProductImages(p.id)[0] || p.thumbnail || '',
    }));

  return Response.json({ results });
}
