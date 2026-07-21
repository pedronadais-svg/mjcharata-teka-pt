import { NextResponse } from 'next/server';
import { readStore } from '@/lib/db/json-store';
import { requireAdmin, isNextResponse } from '@/lib/auth/admin-guard';

interface Product {
  id: string;
  status?: string;
  [key: string]: unknown;
}

interface Order {
  id: string;
  items: Array<{ productId: string; name: string; quantity: number; price: number }>;
  customer: { name: string; email: string; phone?: string; company?: string };
  total: number;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Article {
  id: string;
  status?: string;
  [key: string]: unknown;
}

interface User {
  id: string;
  isActive: boolean;
  [key: string]: unknown;
}

interface AuditEntry {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details?: string;
  [key: string]: unknown;
}

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (isNextResponse(auth)) return auth;

    console.log('[ADMIN] Obter dashboard stats');

    const [products, orders, articles, users, auditLog] = await Promise.all([
      readStore<Product[]>('products.json'),
      readStore<Order[]>('orders.json'),
      readStore<Article[]>('articles.json'),
      readStore<User[]>('users.json'),
      readStore<AuditEntry[]>('audit-log.json'),
    ]);

    const totalProducts = products.length;
    const activeProducts = products.filter(
      (p) => !p.status || p.status === 'active' || p.status === 'published'
    ).length;
    const draftProducts = products.filter((p) => p.status === 'draft').length;

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === 'pendente').length;

    const totalArticles = articles.length;
    const publishedArticles = articles.filter(
      (a) => !a.status || a.status === 'published'
    ).length;

    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.isActive).length;

    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    const recentActivity = auditLog
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    return NextResponse.json({
      totalProducts,
      activeProducts,
      draftProducts,
      totalOrders,
      pendingOrders,
      totalArticles,
      publishedArticles,
      totalUsers,
      activeUsers,
      recentOrders,
      recentActivity,
    });
  } catch (error) {
    console.log('[ADMIN] Erro ao obter dashboard:', error);
    return NextResponse.json({ error: 'Erro ao obter dados do dashboard' }, { status: 500 });
  }
}
