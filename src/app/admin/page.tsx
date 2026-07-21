'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  ShoppingCart,
  FileText,
  Users,
  Plus,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { StatusBadge } from '@/components/admin/StatusBadge';

interface DashboardData {
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalArticles: number;
  publishedArticles: number;
  totalUsers: number;
  activeUsers: number;
  recentOrders: Array<{
    id: string;
    customer: { name: string; email: string };
    total: number;
    status: string;
    createdAt: string;
    items: Array<{ name: string; quantity: number }>;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    user: string;
    timestamp: string;
    details?: string;
  }>;
}

interface StatCard {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 0,
  }).format(value);
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/admin/dashboard');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
          <div className="flex gap-3">
            <div className="h-9 bg-gray-200 rounded w-28 animate-pulse" />
            <div className="h-9 bg-gray-200 rounded w-28 animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-gray-200 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <div className="h-6 bg-gray-200 rounded w-16" />
                  <div className="h-4 bg-gray-200 rounded w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-40 mb-4" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded mb-2" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-gray-500">
        Erro ao carregar dados do dashboard.
      </div>
    );
  }

  const stats: StatCard[] = [
    {
      label: 'Total Produtos',
      value: data.totalProducts,
      icon: <Package className="h-6 w-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Produtos Activos',
      value: data.activeProducts,
      icon: <Package className="h-6 w-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Total Encomendas',
      value: data.totalOrders,
      icon: <ShoppingCart className="h-6 w-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Encomendas Pendentes',
      value: data.pendingOrders,
      icon: <ShoppingCart className="h-6 w-6" />,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      label: 'Total Artigos',
      value: data.totalArticles,
      icon: <FileText className="h-6 w-6" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      label: 'Total Utilizadores',
      value: data.totalUsers,
      icon: <Users className="h-6 w-6" />,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-teka-dark">Dashboard</h1>
          <p className="text-sm text-teka-gray mt-1">Visao geral do painel de administracao</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/produtos/novo"
            className="inline-flex items-center gap-2 px-4 py-2 bg-teka-red text-white text-sm font-medium rounded hover:bg-teka-red/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Novo Produto
          </Link>
          <Link
            href="/admin/artigos/novo"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-teka-dark text-sm font-medium rounded border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Novo Artigo
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-teka-dark text-sm font-medium rounded border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Ver Site
          </a>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-lg ${stat.bgColor} ${stat.color} flex items-center justify-center`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-heading font-bold text-teka-dark">{stat.value}</p>
                <p className="text-sm text-teka-gray">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="font-heading font-semibold text-teka-dark flex items-center gap-2">
            <Clock className="h-5 w-5 text-teka-gray" />
            Encomendas Recentes
          </h2>
          <Link href="/admin/encomendas" className="text-sm text-teka-red hover:underline">
            Ver todas
          </Link>
        </div>
        {data.recentOrders.length === 0 ? (
          <div className="px-5 py-12 text-center text-gray-400 text-sm">
            Nenhuma encomenda registada.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono text-xs text-gray-500">{order.id.slice(0, 8)}</td>
                    <td className="px-5 py-3">
                      <div className="font-medium text-teka-dark">{order.customer.name}</div>
                      <div className="text-xs text-gray-400">{order.customer.email}</div>
                    </td>
                    <td className="px-5 py-3 font-medium text-teka-dark">{formatCurrency(order.total)}</td>
                    <td className="px-5 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {data.recentActivity.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200">
            <h2 className="font-heading font-semibold text-teka-dark">Actividade Recente</h2>
          </div>
          <ul className="divide-y divide-gray-100">
            {data.recentActivity.map((entry) => (
              <li key={entry.id} className="px-5 py-3 flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-teka-red mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-teka-dark">
                    <span className="font-medium">{entry.user}</span>{' '}
                    {entry.action}
                    {entry.details && <span className="text-teka-gray"> - {entry.details}</span>}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(entry.timestamp)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
