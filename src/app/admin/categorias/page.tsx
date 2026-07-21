'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, ChevronRight, ChevronDown, FolderTree } from 'lucide-react';
import { FormField } from '@/components/admin/FormField';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/admin/Toast';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount?: number;
  subcategories?: Category[];
  children?: Category[];
}

interface CategoryForm {
  name: string;
  description: string;
  image: string;
}

const emptyForm: CategoryForm = { name: '', description: '', image: '' };

export default function CategoriasPage() {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // Modals
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [addParentId, setAddParentId] = useState<string | null>(null);
  const [showAddRoot, setShowAddRoot] = useState(false);
  const [deleteCat, setDeleteCat] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/categories');
      if (res.ok) {
        const json = await res.json();
        setCategories(Array.isArray(json) ? json : json.data ?? []);
      }
    } catch {
      toast('error', 'Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function openEdit(cat: Category) {
    setForm({ name: cat.name, description: cat.description || '', image: cat.image || '' });
    setEditCat(cat);
  }

  function openAddSub(parentId: string) {
    setForm(emptyForm);
    setAddParentId(parentId);
  }

  function openAddRoot() {
    setForm(emptyForm);
    setShowAddRoot(true);
  }

  async function handleSaveEdit() {
    if (!editCat) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/categories/${editCat.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast('success', 'Categoria actualizada');
        setEditCat(null);
        fetchCategories();
      } else {
        toast('error', 'Erro ao actualizar categoria');
      }
    } catch {
      toast('error', 'Erro ao actualizar categoria');
    } finally {
      setSaving(false);
    }
  }

  async function handleCreate(parentId?: string) {
    if (!form.name) {
      toast('error', 'O nome e obrigatorio');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, parentId: parentId || null }),
      });
      if (res.ok) {
        toast('success', 'Categoria criada com sucesso');
        setAddParentId(null);
        setShowAddRoot(false);
        fetchCategories();
      } else {
        toast('error', 'Erro ao criar categoria');
      }
    } catch {
      toast('error', 'Erro ao criar categoria');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteCat) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/categories/${deleteCat.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast('success', 'Categoria eliminada');
        setDeleteCat(null);
        fetchCategories();
      } else {
        toast('error', 'Erro ao eliminar categoria');
      }
    } catch {
      toast('error', 'Erro ao eliminar categoria');
    } finally {
      setSaving(false);
    }
  }

  function getChildren(cat: Category): Category[] {
    return cat.subcategories ?? cat.children ?? [];
  }

  function renderTree(items: Category[], depth: number = 0) {
    return items.map((cat) => {
      const children = getChildren(cat);
      const hasChildren = children.length > 0;
      const isExpanded = expanded.has(cat.id);

      return (
        <div key={cat.id}>
          <div
            className="flex items-center gap-2 py-2.5 px-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
            style={{ paddingLeft: `${depth * 24 + 16}px` }}
          >
            {/* Expand toggle */}
            <button
              onClick={() => toggle(cat.id)}
              className={`p-0.5 rounded text-gray-400 hover:text-gray-600 ${!hasChildren ? 'invisible' : ''}`}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-teka-dark">{cat.name}</span>
                <span className="text-xs text-gray-400 font-mono">/{cat.slug}</span>
                {cat.productCount !== undefined && (
                  <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                    {cat.productCount} produtos
                  </span>
                )}
              </div>
              {cat.description && (
                <p className="text-xs text-teka-gray mt-0.5 truncate max-w-md">{cat.description}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => openAddSub(cat.id)}
                className="p-1.5 text-gray-400 hover:text-teka-dark rounded hover:bg-gray-100"
                title="Adicionar subcategoria"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                onClick={() => openEdit(cat)}
                className="p-1.5 text-gray-400 hover:text-teka-dark rounded hover:bg-gray-100"
                title="Editar"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDeleteCat(cat)}
                className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                title="Eliminar"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Render children */}
          {hasChildren && isExpanded && renderTree(children, depth + 1)}
        </div>
      );
    });
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="bg-white rounded-lg border border-gray-200 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 border-b border-gray-100 flex items-center px-4 gap-3">
              <div className="h-4 bg-gray-200 rounded w-4" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-teka-dark flex items-center gap-2">
            <FolderTree className="h-6 w-6 text-teka-gray" />
            Categorias
          </h1>
          <p className="text-sm text-teka-gray mt-1">Gestao da arvore de categorias</p>
        </div>
        <button
          onClick={openAddRoot}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teka-red text-white text-sm font-medium rounded hover:bg-teka-red/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nova Categoria
        </button>
      </div>

      {/* Tree */}
      <div className="bg-white rounded-lg border border-gray-200">
        {categories.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-400 text-sm">
            Nenhuma categoria encontrada.
          </div>
        ) : (
          renderTree(categories)
        )}
      </div>

      {/* Edit Modal */}
      {editCat && (
        <Modal title="Editar Categoria" onClose={() => setEditCat(null)}>
          <div className="space-y-4">
            <FormField label="Nome" name="edit-cat-name" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} required />
            <FormField label="Descricao" name="edit-cat-desc" type="textarea" value={form.description} onChange={(v) => setForm((p) => ({ ...p, description: v }))} rows={3} />
            <FormField label="Imagem (URL)" name="edit-cat-image" type="url" value={form.image} onChange={(v) => setForm((p) => ({ ...p, image: v }))} />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setEditCat(null)} className="px-4 py-2 text-sm text-teka-gray bg-gray-100 rounded hover:bg-gray-200">Cancelar</button>
            <button onClick={handleSaveEdit} disabled={saving} className="px-4 py-2 text-sm text-white bg-teka-red rounded hover:bg-teka-red/90 disabled:opacity-50">
              {saving ? 'A guardar...' : 'Guardar'}
            </button>
          </div>
        </Modal>
      )}

      {/* Add Subcategory Modal */}
      {addParentId && (
        <Modal title="Nova Subcategoria" onClose={() => setAddParentId(null)}>
          <div className="space-y-4">
            <FormField label="Nome" name="add-sub-name" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} required />
            <FormField label="Descricao" name="add-sub-desc" type="textarea" value={form.description} onChange={(v) => setForm((p) => ({ ...p, description: v }))} rows={3} />
            <FormField label="Imagem (URL)" name="add-sub-image" type="url" value={form.image} onChange={(v) => setForm((p) => ({ ...p, image: v }))} />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setAddParentId(null)} className="px-4 py-2 text-sm text-teka-gray bg-gray-100 rounded hover:bg-gray-200">Cancelar</button>
            <button onClick={() => handleCreate(addParentId)} disabled={saving} className="px-4 py-2 text-sm text-white bg-teka-red rounded hover:bg-teka-red/90 disabled:opacity-50">
              {saving ? 'A guardar...' : 'Criar'}
            </button>
          </div>
        </Modal>
      )}

      {/* Add Root Category Modal */}
      {showAddRoot && (
        <Modal title="Nova Categoria" onClose={() => setShowAddRoot(false)}>
          <div className="space-y-4">
            <FormField label="Nome" name="add-root-name" value={form.name} onChange={(v) => setForm((p) => ({ ...p, name: v }))} required />
            <FormField label="Descricao" name="add-root-desc" type="textarea" value={form.description} onChange={(v) => setForm((p) => ({ ...p, description: v }))} rows={3} />
            <FormField label="Imagem (URL)" name="add-root-image" type="url" value={form.image} onChange={(v) => setForm((p) => ({ ...p, image: v }))} />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setShowAddRoot(false)} className="px-4 py-2 text-sm text-teka-gray bg-gray-100 rounded hover:bg-gray-200">Cancelar</button>
            <button onClick={() => handleCreate()} disabled={saving} className="px-4 py-2 text-sm text-white bg-teka-red rounded hover:bg-teka-red/90 disabled:opacity-50">
              {saving ? 'A guardar...' : 'Criar'}
            </button>
          </div>
        </Modal>
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteCat}
        title="Eliminar Categoria"
        message={`Tem a certeza que deseja eliminar a categoria "${deleteCat?.name}"? Esta accao nao pode ser desfeita.`}
        confirmText="Eliminar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteCat(null)}
      />
    </div>
  );
}

/* ---- Inline Modal ---- */
function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-heading font-semibold text-teka-dark mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}
