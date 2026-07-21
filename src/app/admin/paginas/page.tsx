'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, FileText, X } from 'lucide-react';
import { FormField } from '@/components/admin/FormField';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/admin/Toast';

interface PageBlock {
  id: string;
  page: string;
  section: string;
  title: string;
  subtitle: string;
  content: string;
  cta: string;
  ctaLink: string;
  order?: number;
}

interface BlockForm {
  page: string;
  section: string;
  title: string;
  subtitle: string;
  content: string;
  cta: string;
  ctaLink: string;
}

const emptyForm: BlockForm = {
  page: '',
  section: '',
  title: '',
  subtitle: '',
  content: '',
  cta: '',
  ctaLink: '',
};

const PAGE_OPTIONS = [
  { value: 'home', label: 'Home' },
  { value: 'sobre', label: 'Sobre' },
  { value: 'contacto', label: 'Contacto' },
  { value: 'suporte', label: 'Suporte' },
  { value: 'garantia', label: 'Garantia' },
  { value: 'downloads', label: 'Downloads' },
];

export default function AdminPaginasPage() {
  const { toast } = useToast();
  const [blocks, setBlocks] = useState<PageBlock[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<PageBlock | null>(null);
  const [form, setForm] = useState<BlockForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<PageBlock | null>(null);

  const fetchBlocks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/pages');
      if (!res.ok) throw new Error('Erro ao carregar blocos');
      const data = await res.json();
      setBlocks(Array.isArray(data.blocks) ? data.blocks : Array.isArray(data) ? data : []);
    } catch {
      toast('error', 'Erro ao carregar blocos de conteudo');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  // Group blocks by page
  const grouped: Record<string, PageBlock[]> = {};
  for (const block of blocks) {
    const key = block.page || 'sem-pagina';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(block);
  }
  const pages = Object.keys(grouped).sort();

  function openAddModal() {
    setEditingBlock(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEditModal(block: PageBlock) {
    setEditingBlock(block);
    setForm({
      page: block.page,
      section: block.section,
      title: block.title,
      subtitle: block.subtitle,
      content: block.content,
      cta: block.cta,
      ctaLink: block.ctaLink,
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingBlock(null);
    setForm(emptyForm);
  }

  async function handleSave() {
    if (!form.page || !form.section.trim()) {
      toast('error', 'Pagina e seccao sao obrigatorios');
      return;
    }
    setSaving(true);
    try {
      if (editingBlock) {
        const res = await fetch(`/api/admin/pages/${editingBlock.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Erro ao actualizar');
        toast('success', 'Bloco actualizado com sucesso');
      } else {
        const res = await fetch('/api/admin/pages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Erro ao criar');
        toast('success', 'Bloco criado com sucesso');
      }
      closeModal();
      fetchBlocks();
    } catch {
      toast('error', editingBlock ? 'Erro ao actualizar bloco' : 'Erro ao criar bloco');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/pages/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao eliminar');
      toast('success', 'Bloco eliminado com sucesso');
      setDeleteTarget(null);
      fetchBlocks();
    } catch {
      toast('error', 'Erro ao eliminar bloco');
    }
  }

  function getPageLabel(page: string): string {
    const opt = PAGE_OPTIONS.find((p) => p.value === page);
    return opt ? opt.label : page.charAt(0).toUpperCase() + page.slice(1);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
            <div className="h-4 bg-gray-100 rounded w-full mb-2" />
            <div className="h-4 bg-gray-100 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-teka-dark">Paginas</h1>
          <p className="text-sm text-teka-gray mt-1">Gerir blocos de conteudo das paginas do site</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teka-red text-white text-sm font-medium rounded hover:bg-teka-red/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Novo Bloco
        </button>
      </div>

      {/* Blocks grouped by page */}
      {pages.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 px-6 py-12 text-center text-gray-400">
          Nenhum bloco de conteudo encontrado. Clique em &quot;Novo Bloco&quot; para adicionar.
        </div>
      ) : (
        <div className="space-y-6">
          {pages.map((page) => {
            const pageBlocks = grouped[page];
            return (
              <div key={page} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Page header */}
                <div className="px-5 py-4 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <h2 className="font-heading font-semibold text-teka-dark">
                    {getPageLabel(page)}
                  </h2>
                  <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                    {pageBlocks.length} bloco{pageBlocks.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Section blocks */}
                <div className="divide-y divide-gray-100">
                  {pageBlocks.map((block) => (
                    <div key={block.id} className="px-5 py-4 hover:bg-gray-50/50 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                            {block.section}
                          </span>
                        </div>
                        <p className="font-medium text-teka-dark text-sm mt-1 truncate">
                          {block.title || '(sem titulo)'}
                        </p>
                        {block.subtitle && (
                          <p className="text-xs text-teka-gray mt-0.5 truncate">{block.subtitle}</p>
                        )}
                        {block.cta && (
                          <p className="text-xs text-gray-400 mt-1">
                            CTA: {block.cta} &rarr; {block.ctaLink}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openEditModal(block)}
                          className="p-1.5 text-gray-400 hover:text-teka-red rounded hover:bg-gray-100"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(block)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-semibold text-lg text-teka-dark">
                {editingBlock ? 'Editar Bloco' : 'Novo Bloco'}
              </h3>
              <button onClick={closeModal} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <FormField
                label="Pagina"
                name="block-page"
                type="select"
                value={form.page}
                onChange={(v) => setForm((prev) => ({ ...prev, page: v }))}
                options={PAGE_OPTIONS}
                required
              />
              <FormField
                label="Seccao"
                name="block-section"
                value={form.section}
                onChange={(v) => setForm((prev) => ({ ...prev, section: v }))}
                required
                placeholder="Ex: hero, about, features, cta..."
              />
              <FormField
                label="Titulo"
                name="block-title"
                value={form.title}
                onChange={(v) => setForm((prev) => ({ ...prev, title: v }))}
                placeholder="Titulo do bloco"
              />
              <FormField
                label="Subtitulo"
                name="block-subtitle"
                value={form.subtitle}
                onChange={(v) => setForm((prev) => ({ ...prev, subtitle: v }))}
                placeholder="Subtitulo (opcional)"
              />
              <FormField
                label="Conteudo"
                name="block-content"
                type="textarea"
                value={form.content}
                onChange={(v) => setForm((prev) => ({ ...prev, content: v }))}
                rows={6}
                placeholder="Conteudo do bloco..."
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Texto do CTA"
                  name="block-cta"
                  value={form.cta}
                  onChange={(v) => setForm((prev) => ({ ...prev, cta: v }))}
                  placeholder="Ex: Saber mais"
                />
                <FormField
                  label="Link do CTA"
                  name="block-ctaLink"
                  value={form.ctaLink}
                  onChange={(v) => setForm((prev) => ({ ...prev, ctaLink: v }))}
                  placeholder="/pagina-destino"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-teka-gray bg-gray-100 rounded hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-white bg-teka-red rounded hover:bg-teka-red/90 transition-colors disabled:opacity-50"
              >
                {saving ? 'A guardar...' : editingBlock ? 'Actualizar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar bloco"
        message={`Tem a certeza que deseja eliminar o bloco "${deleteTarget?.section}" da pagina "${deleteTarget ? getPageLabel(deleteTarget.page) : ''}"? Esta accao nao pode ser revertida.`}
        confirmText="Eliminar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
