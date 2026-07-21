'use client';

import { useState, useEffect, useCallback } from 'react';
import { Package, Search, X, ChevronDown } from 'lucide-react';
import { DataTable, Pagination, type Column } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { useToast } from '@/components/admin/Toast';

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  [key: string]: unknown;
  id: string;
  items: OrderItem[];
  customer: { name: string; email: string; phone?: string; company?: string };
  total: number;
  status: 'pendente' | 'confirmada' | 'enviada' | 'entregue' | 'cancelada';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const allStatuses = [
  { value: '', label: 'Todos os estados' },
  { value: 'pendente', label: 'Pendente' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'enviada', label: 'Enviada' },
  { value: 'entregue', label: 'Entregue' },
  { value: 'cancelada', label: 'Cancelada' },
];

const statusOptions = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'enviada', label: 'Enviada' },
  { value: 'entregue', label: 'Entregue' },
  { value: 'cancelada', label: 'Cancelada' },
];

function formatCurrency(value: number): string {
  if (value <= 0) return 'Sob consulta';
  return `${new Intl.NumberFormat('pt-AO').format(value)} Kz`;
}

export default function EncomendasPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Detail modal
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      toast('error', 'Erro ao carregar encomendas');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filtered = orders.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.customer.name.toLowerCase().includes(q) ||
      o.customer.email.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  async function updateStatus(orderId: string, status: string) {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao atualizar');
      }
      toast('success', 'Estado atualizado com sucesso');
      // Update local state
      const updated = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (detailOrder?.id === orderId) {
        setDetailOrder(updated);
      }
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Erro ao atualizar estado');
    } finally {
      setUpdatingStatus(false);
    }
  }

  const columns: Column<Order>[] = [
    {
      key: 'id',
      label: 'ID',
      render: (o) => (
        <button
          onClick={() => setDetailOrder(o)}
          className="text-sm font-medium text-teka-red hover:underline"
        >
          {o.id.slice(0, 10)}...
        </button>
      ),
    },
    {
      key: 'customer',
      label: 'Cliente',
      render: (o) => (
        <div>
          <p className="text-sm font-medium text-teka-dark">{o.customer.name}</p>
          <p className="text-xs text-teka-gray">{o.customer.email}</p>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Data',
      sortable: true,
      render: (o) =>
        new Date(o.createdAt).toLocaleDateString('pt-PT', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
    },
    {
      key: 'total',
      label: 'Total',
      render: (o) => <span className="font-medium">{formatCurrency(o.total)}</span>,
    },
    {
      key: 'status',
      label: 'Estado',
      render: (o) => <StatusBadge status={o.status} />,
    },
    {
      key: 'actions',
      label: 'A\u00e7\u00f5es',
      width: '160px',
      render: (o) => (
        <div className="relative">
          <select
            value={o.status}
            onChange={(e) => updateStatus(o.id, e.target.value)}
            disabled={updatingStatus}
            className="text-xs border border-gray-300 rounded px-2 py-1 pr-6 bg-white focus:outline-none focus:ring-1 focus:ring-teka-red/30 appearance-none cursor-pointer"
          >
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-2xl text-teka-dark">Encomendas</h1>
          <p className="text-sm text-teka-gray mt-1">
            {orders.length} encomenda{orders.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar por ID, nome ou email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teka-red/30 focus:border-teka-red"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="text-sm border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-teka-red/30 focus:border-teka-red"
        >
          {allStatuses.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <DataTable columns={columns} data={paginated} loading={loading} emptyMessage="Nenhuma encomenda encontrada" />
      <Pagination page={page} totalPages={totalPages} total={filtered.length} onPageChange={setPage} />

      {/* Detail Modal */}
      {detailOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDetailOrder(null)} />
          <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-heading font-semibold text-lg text-teka-dark">Detalhes da Encomenda</h2>
                <p className="text-xs text-teka-gray mt-0.5">ID: {detailOrder.id}</p>
              </div>
              <button onClick={() => setDetailOrder(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm text-teka-gray">Estado:</span>
              <StatusBadge status={detailOrder.status} />
              <div className="ml-auto relative">
                <select
                  value={detailOrder.status}
                  onChange={(e) => updateStatus(detailOrder.id, e.target.value)}
                  disabled={updatingStatus}
                  className="text-sm border border-gray-300 rounded px-3 py-1.5 pr-8 bg-white focus:outline-none focus:ring-1 focus:ring-teka-red/30 appearance-none cursor-pointer"
                >
                  {statusOptions.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Customer */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-medium text-teka-dark mb-2">Cliente</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-teka-gray">Nome:</span>{' '}
                  <span className="text-teka-dark">{detailOrder.customer.name}</span>
                </div>
                <div>
                  <span className="text-teka-gray">Email:</span>{' '}
                  <span className="text-teka-dark">{detailOrder.customer.email}</span>
                </div>
                {detailOrder.customer.phone && (
                  <div>
                    <span className="text-teka-gray">Telefone:</span>{' '}
                    <span className="text-teka-dark">{detailOrder.customer.phone}</span>
                  </div>
                )}
                {detailOrder.customer.company && (
                  <div>
                    <span className="text-teka-gray">Empresa:</span>{' '}
                    <span className="text-teka-dark">{detailOrder.customer.company}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Items */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-teka-dark mb-2">Artigos</h3>
              <div className="border border-gray-200 rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Produto</th>
                      <th className="text-center px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Qtd</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Pre\u00e7o Unit.</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailOrder.items.map((item) => (
                      <tr key={item.productId} className="border-b border-gray-100">
                        <td className="px-3 py-2 text-teka-dark">{item.name}</td>
                        <td className="px-3 py-2 text-center text-teka-gray">{item.quantity}</td>
                        <td className="px-3 py-2 text-right text-teka-gray">{formatCurrency(item.price)}</td>
                        <td className="px-3 py-2 text-right font-medium text-teka-dark">{formatCurrency(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50">
                      <td colSpan={3} className="px-3 py-2 text-right font-semibold text-teka-dark">Total</td>
                      <td className="px-3 py-2 text-right font-bold text-teka-dark">{formatCurrency(detailOrder.total)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Notes */}
            {detailOrder.notes && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-medium text-teka-dark mb-1">Notas</h3>
                <p className="text-sm text-teka-gray">{detailOrder.notes}</p>
              </div>
            )}

            {/* Dates */}
            <div className="flex items-center gap-6 text-xs text-gray-400">
              <span>
                Criada: {new Date(detailOrder.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
              <span>
                Atualizada: {new Date(detailOrder.updatedAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
