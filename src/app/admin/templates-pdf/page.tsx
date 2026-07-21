'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  FileText,
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  Eye,
  Search,
  Filter,
  Download,
  Loader2,
  FileSpreadsheet,
  Truck,
  ClipboardList,
  Receipt,
  ShoppingCart,
  Package,
  Award,
  File,
} from 'lucide-react';
import type { PDFTemplate, TemplateType } from '@/lib/types/pdf-templates';
import { TEMPLATE_TYPE_LABELS } from '@/lib/types/pdf-templates';

// Ícones por tipo de template
const TYPE_ICONS: Record<TemplateType, typeof FileText> = {
  'plano-entregas': Truck,
  'guia-remessa': ClipboardList,
  'factura-proforma': Receipt,
  'nota-encomenda': ShoppingCart,
  'orcamento': FileSpreadsheet,
  'packing-list': Package,
  'certificado-qualidade': Award,
  'customizado': File,
};

// Cores por tipo
const TYPE_COLORS: Record<TemplateType, string> = {
  'plano-entregas': 'bg-blue-500/20 text-blue-400',
  'guia-remessa': 'bg-green-500/20 text-green-400',
  'factura-proforma': 'bg-purple-500/20 text-purple-400',
  'nota-encomenda': 'bg-orange-500/20 text-orange-400',
  'orcamento': 'bg-yellow-500/20 text-yellow-400',
  'packing-list': 'bg-cyan-500/20 text-cyan-400',
  'certificado-qualidade': 'bg-emerald-500/20 text-emerald-400',
  'customizado': 'bg-gray-500/20 text-gray-400',
};

export default function TemplatesPDFPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<PDFTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TemplateType | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Novo template state
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newType, setNewType] = useState<TemplateType>('plano-entregas');
  const [isCreating, setIsCreating] = useState(false);

  // Carregar templates
  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    try {
      const res = await fetch('/api/admin/templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    } finally {
      setIsLoading(false);
    }
  }

  // Criar template
  async function handleCreate() {
    if (!newName.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch('/api/admin/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          description: newDescription,
          type: newType,
        }),
      });
      if (res.ok) {
        const template = await res.json();
        router.push(`/admin/templates-pdf/${template.id}`);
      }
    } catch (error) {
      console.error('Erro ao criar template:', error);
    } finally {
      setIsCreating(false);
    }
  }

  // Duplicar template
  async function handleDuplicate(template: PDFTemplate) {
    try {
      const res = await fetch('/api/admin/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${template.name} (cópia)`,
          description: template.description,
          type: template.type,
        }),
      });
      if (res.ok) {
        const newTemplate = await res.json();
        // Copiar o conteúdo completo
        await fetch(`/api/admin/templates/${newTemplate.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...template,
            id: newTemplate.id,
            name: `${template.name} (cópia)`,
          }),
        });
        fetchTemplates();
      }
    } catch (error) {
      console.error('Erro ao duplicar:', error);
    }
    setOpenMenuId(null);
  }

  // Eliminar template
  async function handleDelete(id: string) {
    try {
      await fetch(`/api/admin/templates/${id}`, { method: 'DELETE' });
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Erro ao eliminar:', error);
    }
    setDeleteConfirmId(null);
    setOpenMenuId(null);
  }

  // Filtrar templates
  const filtered = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  // Formatação de data
  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Templates PDF</h1>
          <p className="text-sm text-gray-500 mt-1">
            Crie e edite templates para documentos comerciais — planos de entregas, guias, facturas e mais.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          Novo Template
        </button>
      </div>

      {/* Barra de pesquisa e filtros */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as TemplateType | 'all')}
            className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 appearance-none bg-white"
          >
            <option value="all">Todos os tipos</option>
            {Object.entries(TEMPLATE_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Estado de carregamento */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      )}

      {/* Estado vazio */}
      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-1">
            {searchTerm || filterType !== 'all'
              ? 'Nenhum template encontrado'
              : 'Ainda não tem templates'}
          </h3>
          <p className="text-sm text-gray-400 mb-6">
            {searchTerm || filterType !== 'all'
              ? 'Tente ajustar os filtros de pesquisa.'
              : 'Crie o seu primeiro template PDF para começar a gerar documentos.'}
          </p>
          {!searchTerm && filterType === 'all' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              Criar Primeiro Template
            </button>
          )}
        </div>
      )}

      {/* Grid de templates */}
      {!isLoading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((template) => {
            const TypeIcon = TYPE_ICONS[template.type] || File;
            const typeColor = TYPE_COLORS[template.type] || TYPE_COLORS.customizado;

            return (
              <div
                key={template.id}
                className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all"
              >
                {/* Preview / thumbnail area */}
                <Link href={`/admin/templates-pdf/${template.id}`}>
                  <div className="h-40 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative">
                    {/* Miniatura do "documento" */}
                    <div className="w-20 h-28 bg-white border border-gray-200 rounded shadow-sm flex flex-col items-center justify-center gap-1">
                      <TypeIcon className="h-6 w-6 text-gray-400" />
                      <div className="w-12 h-1 bg-gray-200 rounded" />
                      <div className="w-10 h-1 bg-gray-200 rounded" />
                      <div className="w-8 h-1 bg-gray-200 rounded" />
                    </div>
                    {/* Badge de páginas */}
                    <div className="absolute bottom-2 left-2 text-[10px] text-gray-400 bg-white/80 px-1.5 py-0.5 rounded">
                      {template.pages.length} {template.pages.length === 1 ? 'página' : 'páginas'}
                    </div>
                    {/* Overlay de hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/90 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm">
                        <Pencil className="h-3 w-3" />
                        Editar
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <Link href={`/admin/templates-pdf/${template.id}`}>
                        <h3 className="font-semibold text-gray-900 text-sm truncate hover:text-red-600 transition-colors">
                          {template.name}
                        </h3>
                      </Link>
                      {template.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                          {template.description}
                        </p>
                      )}
                    </div>

                    {/* Menu de acções */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === template.id ? null : template.id)}
                        className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {openMenuId === template.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-44">
                            <Link
                              href={`/admin/templates-pdf/${template.id}`}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Editar
                            </Link>
                            <button
                              onClick={() => handleDuplicate(template)}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                            >
                              <Copy className="h-3.5 w-3.5" />
                              Duplicar
                            </button>
                            <button
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Pré-visualizar
                            </button>
                            <button
                              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                            >
                              <Download className="h-3.5 w-3.5" />
                              Exportar PDF
                            </button>
                            <div className="border-t border-gray-100 my-1" />
                            <button
                              onClick={() => setDeleteConfirmId(template.id)}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Eliminar
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Tipo e data */}
                  <div className="flex items-center justify-between mt-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${typeColor}`}
                    >
                      <TypeIcon className="h-3 w-3" />
                      {TEMPLATE_TYPE_LABELS[template.type]}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {formatDate(template.updatedAt)}
                    </span>
                  </div>
                </div>

                {/* Confirmação de eliminação */}
                {deleteConfirmId === template.id && (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center p-6 z-30">
                    <div className="text-center">
                      <Trash2 className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <p className="text-sm font-medium text-gray-900 mb-1">Eliminar template?</p>
                      <p className="text-xs text-gray-500 mb-4">
                        Esta acção não pode ser revertida.
                      </p>
                      <div className="flex items-center gap-2 justify-center">
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de criação */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Novo Template PDF</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Configure as definições iniciais do seu template.
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Template *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Plano de Entregas MDV"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  autoFocus
                />
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Documento *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(TEMPLATE_TYPE_LABELS).map(([value, label]) => {
                    const Icon = TYPE_ICONS[value as TemplateType] || File;
                    const isSelected = newType === value;
                    return (
                      <button
                        key={value}
                        onClick={() => setNewType(value as TemplateType)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-sm transition-all ${
                          isSelected
                            ? 'border-red-500 bg-red-50 text-red-700 ring-1 ring-red-500'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Descrição breve do template (opcional)..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewName('');
                  setNewDescription('');
                  setNewType('plano-entregas');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={!newName.trim() || isCreating}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    A criar...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Criar e Abrir Editor
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
