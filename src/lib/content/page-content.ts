import { readStore } from '@/lib/db/json-store';

export interface PageBlock {
  id: string;
  page: string;
  section: string;
  title?: string;
  subtitle?: string;
  content?: string;
  cta?: string;
  ctaLink?: string;
}

export async function getPageContent(page: string): Promise<PageBlock[]> {
  const blocks = await readStore<PageBlock[]>('pages.json');
  return blocks.filter(b => b.page === page);
}

export async function getBlock(page: string, section: string): Promise<PageBlock | null> {
  const blocks = await readStore<PageBlock[]>('pages.json');
  return blocks.find(b => b.page === page && b.section === section) ?? null;
}
