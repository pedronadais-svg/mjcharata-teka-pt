'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Search, Plus, Trash2, Edit, ChevronDown } from 'lucide-react';
import { DataTable, Pagination, type Column } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/admin/Toast';
import type { Category } from '@/lib/types';

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  reference: string;
  category: string;
  subcategory: string;
  thumbnail: string;
  priceAOA?: number;
  status: string;
  updatedAt: string;
  [key: string]: unknown;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function formatPrice(value?: number) {
  if (!value || value <= 0) return '--';
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 0,
  }).format(value);
}

export default function AdminProductsPage() {
  const { toast } = useToast();

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({ page: 1, limit: 25, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selection & bulk
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<ProductRow | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Debounce ref
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [search]);

  // Fetch categories
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch {
        // ignore
      }
    }
    load();
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '25');
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (categoryFilter) params.set('category', categoryFilter);
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setPagination(data.pagination);
      }
    } catch {
      toast('error', 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, categoryFilter, statusFilter, toast]);

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  function handlePageChange(page: number) {
    setSelectedIds(new Set());
    fetchProducts(page);
  }

  // Delete single product
  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/products/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast('success', `Produto "${deleteTarget.name}" arquivado`);
        setDeleteTarget(null);
        fetchProducts(pagination.page);
      } else {
        toast('error', 'Erro ao arquivar produto');
      }
    } catch {
      toast('error', 'Erro ao arquivar produto');
    }
  }

  // Bulk status change
  async function handleBulkStatus(status: string) {
    setBulkMenuOpen(false);
    let success = 0;
    for (const id of selectedIds) {
      try {
        const res = await fetch(`/api/admin/products/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });
        if (res.ok) success++;
      } catch {
        // continue
      }
    }
    toast('success', `${success} produto(s) actualizado(s)`);
    setSelectedIds(new Set());
    fetchProducts(pagination.page);
  }

  // Bulk delete
  async function handleBulkDelete() {
    setBulkDeleteOpen(false);
    let success = 0;
    for (const id of selectedIds) {
      try {
        const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
        if (res.ok) success++;
      } catch {
        // continue
      }
    }
    toast('success', `${success} produto(s) arquivado(s)`);
    setSelectedIds(new Set());
    fetchProducts(pagination.page);
  }

  const columns: Column<ProductRow>[] = [
    {
      key: 'thumbnail',
      label: '',
      width: '56px',
      render: (item) => (
        <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden shrink-0">
          {item.thumbnail ? (
            <img src={item.thumbnail} alt="" className="w-full h-full object-contain p-0.5" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-[8px]">--</div>
          )}
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Nome',
      sortable: true,
      render: (item) => (
        <div className="max-w-[260px]">
          <p className="font-medium text-teka-dark truncate">{item.name}</p>
        </div>
      ),
    },
    {
      key: 'reference',
      label: 'Referência',
      sortable: true,
      render: (item) => <span className="font-mono text-xs text-gray-500">{item.reference}</span>,
    },
    {
      key: 'category',
      label: 'Categoria',
      render: (item) => <span className="text-teka-gray text-sm">{item.subcategory || item.category}</span>,
    },
    {
      key: 'priceAOA',
      label: 'Preço',
      sortable: true,
      render: (item) => <span className="font-medium text-sm">{formatPrice(item.priceAOA)}</span>,
    },
    {
      key: 'status',
      label: 'Estado',
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'actions',
      label: '',
      width: '100px',
      render: (item) => (
        <div className="flex items-center gap-1">
          <Link
            href={`/admin/produtos/${item.id}`}
            className="p-1.5 text-gray-400 hover:text-teka-red rounded hover:bg-gray-100 transition-colors"
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </Link>
          <button
            onClick={(e) => { e.stopPropagation(); setDeleteTarget(item); }}
            className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
            title="Arquivar"
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
          <h1 className="text-2xl font-heading font-bold text-teka-dark">Produtos</h1>
          <p className="text-sm text-teka-gray mt-1">{pagination.total} produto(s) no catalogo</p>
        </div>
        <Link
          href="/admin/produtos/novo"
          className="inline-flex items-center gap-2 px-4 py-2 bg-teka-red text-white text-sm font-medium rounded hover:bg-teka-red/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Novo Produto
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por nome, referencia ou EAN..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-teka-red/30 focus:border-teka-red"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teka-red/30"
        >
          <option value="">Todas as categorias</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>{cat.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teka-red/30"
        >
          <option value="">Todos os estados</option>
          <option value="active">Activo</option>
          <option value="draft">Rascunho</option>
          <option value="archived">Arquivado</option>
        </select>
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 bg-teka-red/5 border border-teka-red/20 rounded px-4 py-2.5">
          <span className="text-sm font-medium text-teka-dark">
            {selectedIds.size} seleccionado(s)
          </span>
          <div className="relative">
            <button
              onClick={() => setBulkMenuOpen(!bulkMenuOpen)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded text-sm hover:bg-gray-50"
            >
              Alterar estado <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {bulkMenuOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 min-w-[140px]">
                <button onClick={() => handleBulkStatus('active')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Activo</button>
                <button onClick={() => handleBulkStatus('draft')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Rascunho</button>
                <button onClick={() => handleBulkStatus('archived')} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Arquivado</button>
              </div>
            )}
          </div>
          <button
            onClick={() => setBulkDeleteOpen(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Arquivar
          </button>
        </div>
      )}

      {/* Table */}
      <DataTable
        columns={columns}
        data={products}
        keyField="id"
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        loading={loading}
        emptyMessage="Nenhum produto encontrado"
      />

      {/* Pagination */}
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        total={pagination.total}
        onPageChange={handlePageChange}
      />

      {/* Delete single confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Arquivar produto"
        message={`Tem a certeza que deseja arquivar "${deleteTarget?.name}"? O produto deixara de aparecer no site.`}
        confirmText="Arquivar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Bulk delete confirm */}
      <ConfirmDialog
        open={bulkDeleteOpen}
        title="Arquivar produtos"
        message={`Tem a certeza que deseja arquivar ${selectedIds.size} produto(s)?`}
        confirmText="Arquivar todos"
        onConfirm={handleBulkDelete}
        onCancel={() => setBulkDeleteOpen(false)}
      />
    </div>
  );
}
