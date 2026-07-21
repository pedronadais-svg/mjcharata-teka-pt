'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { DataTable, Pagination, type Column } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/admin/Toast';

interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  date: string;
  status: string;
  coverImage?: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const CATEGORIES = [
  { value: '', label: 'Todas as categorias' },
  { value: 'Cozinhar', label: 'Cozinhar' },
  { value: 'Dicas', label: 'Dicas' },
  { value: 'Inovação', label: 'Inovação' },
  { value: 'Design', label: 'Design' },
  { value: 'Curiosidades', label: 'Curiosidades' },
];

const STATUSES = [
  { value: '', label: 'Todos os estados' },
  { value: 'published', label: 'Publicado' },
  { value: 'draft', label: 'Rascunho' },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function AdminArtigosPage() {
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);

  const fetchArticles = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (categoryFilter) params.set('category', categoryFilter);
      if (statusFilter) params.set('status', statusFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/admin/articles?${params}`);
      if (!res.ok) throw new Error('Erro ao carregar artigos');
      const data = await res.json();
      setArticles(data.articles || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch {
      toast('error', 'Erro ao carregar artigos');
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, statusFilter, search, toast]);

  useEffect(() => {
    fetchArticles(1);
  }, [fetchArticles]);

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/articles/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao eliminar');
      toast('success', 'Artigo eliminado com sucesso');
      setDeleteTarget(null);
      fetchArticles(pagination.page);
    } catch {
      toast('error', 'Erro ao eliminar artigo');
    }
  }

  const columns: Column<Article>[] = [
    {
      key: 'title',
      label: 'Titulo',
      sortable: true,
      render: (item) => (
        <div>
          <p className="font-medium text-teka-dark truncate max-w-xs">{item.title}</p>
          <p className="text-xs text-gray-400 truncate">{item.slug}</p>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Categoria',
      width: '120px',
      render: (item) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-xs font-medium text-gray-700">
          {item.category}
        </span>
      ),
    },
    { key: 'author', label: 'Autor', width: '140px' },
    {
      key: 'date',
      label: 'Data',
      width: '110px',
      sortable: true,
      render: (item) => <span className="text-sm text-gray-500">{formatDate(item.date)}</span>,
    },
    {
      key: 'status',
      label: 'Estado',
      width: '110px',
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      label: '',
      width: '100px',
      render: (item) => (
        <div className="flex items-center gap-2 justify-end">
          <Link
            href={`/admin/artigos/${item.id}`}
            className="p-1.5 text-gray-400 hover:text-teka-red rounded hover:bg-gray-100"
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            onClick={() => setDeleteTarget(item)}
            className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-teka-dark">Artigos</h1>
          <p className="text-sm text-teka-gray mt-1">Gerir artigos do blog e conteudo editorial</p>
        </div>
        <Link
          href="/admin/artigos/novo"
          className="inline-flex items-center gap-2 px-4 py-2 bg-teka-red text-white text-sm font-medium rounded hover:bg-teka-red/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Novo Artigo
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar artigos..."
            className="w-full pl-9 pr-3 py-2 text-sm rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teka-red/30 focus:border-teka-red"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-teka-red/30 focus:border-teka-red"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-teka-red/30 focus:border-teka-red"
        >
          {STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={articles} loading={loading} emptyMessage="Nenhum artigo encontrado" />

      {/* Pagination */}
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onPageChange={(p) => fetchArticles(p)}
      />

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar artigo"
        message={`Tem a certeza que deseja eliminar "${deleteTarget?.title}"? Esta accao nao pode ser revertida.`}
        confirmText="Eliminar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
