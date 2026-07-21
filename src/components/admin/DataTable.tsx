'use client';

import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (item: T) => React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  keyField?: string;
  sortKey?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  loading?: boolean;
  emptyMessage?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T = any>({
  columns,
  data,
  keyField = 'id',
  sortKey,
  sortOrder,
  onSort,
  selectable,
  selectedIds,
  onSelectionChange,
  loading,
  emptyMessage = 'Nenhum registo encontrado',
}: DataTableProps<T>) {
  const safeData = data ?? [];
  const safeColumns = columns ?? [];
  const allSelected = safeData.length > 0 && safeData.every((item) => selectedIds?.has((item as Record<string, unknown>)[keyField] as string));

  function toggleAll() {
    if (!onSelectionChange) return;
    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(safeData.map((item) => (item as Record<string, unknown>)[keyField] as string)));
    }
  }

  function toggleOne(id: string) {
    if (!onSelectionChange || !selectedIds) return;
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange(next);
  }

  if (loading) {
    return (
      <div className="bg-white rounded border border-gray-200 overflow-hidden">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-100 border-b" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 border-b border-gray-100 flex items-center px-4 gap-4">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/6" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded border border-gray-200 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {selectable && (
              <th className="w-10 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="rounded border-gray-300"
                />
              </th>
            )}
            {safeColumns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${
                  col.sortable ? 'cursor-pointer select-none hover:text-gray-700' : ''
                }`}
                style={col.width ? { width: col.width } : undefined}
                onClick={() => col.sortable && onSort?.(col.key)}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <span className="text-gray-400">
                      {sortKey === col.key ? (
                        sortOrder === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronsUpDown className="h-3.5 w-3.5" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {safeData.length === 0 ? (
            <tr>
              <td colSpan={safeColumns.length + (selectable ? 1 : 0)} className="px-4 py-12 text-center text-gray-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            safeData.map((item) => {
              const id = (item as Record<string, unknown>)[keyField] as string;
              const selected = selectedIds?.has(id);
              return (
                <tr
                  key={id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    selected ? 'bg-teka-red/5' : ''
                  }`}
                >
                  {selectable && (
                    <td className="w-10 px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selected || false}
                        onChange={() => toggleOne(id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                  )}
                  {safeColumns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-teka-dark">
                      {col.render
                        ? col.render(item)
                        : ((item as Record<string, unknown>)[col.key] as React.ReactNode) ?? '—'}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

// Pagination component
interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-sm text-gray-500">
        {total} registo{total !== 1 ? 's' : ''}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 text-sm rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
        >
          Anterior
        </button>
        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
          let p: number;
          if (totalPages <= 7) {
            p = i + 1;
          } else if (page <= 4) {
            p = i + 1;
          } else if (page >= totalPages - 3) {
            p = totalPages - 6 + i;
          } else {
            p = page - 3 + i;
          }
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 text-sm rounded ${
                p === page
                  ? 'bg-teka-red text-white'
                  : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}
            >
              {p}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1.5 text-sm rounded border border-gray-200 disabled:opacity-40 hover:bg-gray-50"
        >
          Seguinte
        </button>
      </div>
    </div>
  );
}
