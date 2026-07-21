'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, X } from 'lucide-react';
import { FormField } from '@/components/admin/FormField';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/admin/Toast';

interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
  order?: number;
}

interface FAQForm {
  category: string;
  question: string;
  answer: string;
}

const emptyForm: FAQForm = { category: '', question: '', answer: '' };

export default function AdminFAQsPage() {
  const { toast } = useToast();
  const [grouped, setGrouped] = useState<Record<string, FAQ[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [form, setForm] = useState<FAQForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<FAQ | null>(null);

  const fetchFAQs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/faqs');
      if (!res.ok) throw new Error('Erro ao carregar FAQs');
      const data = await res.json();
      setGrouped(data.grouped || {});
      // Expand all categories on first load
      setExpandedCategories(new Set(Object.keys(data.grouped || {})));
    } catch {
      toast('error', 'Erro ao carregar FAQs');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchFAQs();
  }, [fetchFAQs]);

  function toggleCategory(cat: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  function openAddModal() {
    setEditingFaq(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEditModal(faq: FAQ) {
    setEditingFaq(faq);
    setForm({ category: faq.category, question: faq.question, answer: faq.answer });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingFaq(null);
    setForm(emptyForm);
  }

  async function handleSave() {
    if (!form.question.trim() || !form.answer.trim() || !form.category.trim()) {
      toast('error', 'Todos os campos sao obrigatorios');
      return;
    }
    setSaving(true);
    try {
      if (editingFaq) {
        const res = await fetch(`/api/admin/faqs/${editingFaq.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Erro ao actualizar');
        toast('success', 'FAQ actualizada com sucesso');
      } else {
        const res = await fetch('/api/admin/faqs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Erro ao criar');
        toast('success', 'FAQ criada com sucesso');
      }
      closeModal();
      fetchFAQs();
    } catch {
      toast('error', editingFaq ? 'Erro ao actualizar FAQ' : 'Erro ao criar FAQ');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/faqs/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao eliminar');
      toast('success', 'FAQ eliminada com sucesso');
      setDeleteTarget(null);
      fetchFAQs();
    } catch {
      toast('error', 'Erro ao eliminar FAQ');
    }
  }

  const categories = Object.keys(grouped);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-40 mb-3" />
            <div className="h-4 bg-gray-100 rounded w-full mb-2" />
            <div className="h-4 bg-gray-100 rounded w-3/4" />
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
          <h1 className="text-2xl font-heading font-bold text-teka-dark">Perguntas Frequentes</h1>
          <p className="text-sm text-teka-gray mt-1">Gerir FAQs agrupadas por categoria</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teka-red text-white text-sm font-medium rounded hover:bg-teka-red/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nova FAQ
        </button>
      </div>

      {/* FAQ Accordion */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 px-6 py-12 text-center text-gray-400">
          Nenhuma FAQ encontrada. Clique em &quot;Nova FAQ&quot; para adicionar.
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => {
            const isExpanded = expandedCategories.has(category);
            const faqs = grouped[category];
            return (
              <div key={category} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                    <h2 className="font-heading font-semibold text-teka-dark">{category}</h2>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                      {faqs.length}
                    </span>
                  </div>
                </button>

                {/* FAQ items */}
                {isExpanded && (
                  <div className="border-t border-gray-100 divide-y divide-gray-100">
                    {faqs.map((faq) => (
                      <div key={faq.id} className="px-5 py-4 hover:bg-gray-50/50">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-teka-dark text-sm">{faq.question}</p>
                            <p className="text-sm text-teka-gray mt-1 line-clamp-2">{faq.answer}</p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => openEditModal(faq)}
                              className="p-1.5 text-gray-400 hover:text-teka-red rounded hover:bg-gray-100"
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(faq)}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-semibold text-lg text-teka-dark">
                {editingFaq ? 'Editar FAQ' : 'Nova FAQ'}
              </h3>
              <button onClick={closeModal} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <FormField
                label="Categoria"
                name="faq-category"
                value={form.category}
                onChange={(v) => setForm((prev) => ({ ...prev, category: v }))}
                required
                placeholder="Ex: Produtos, Entregas, Garantia..."
              />
              <FormField
                label="Pergunta"
                name="faq-question"
                value={form.question}
                onChange={(v) => setForm((prev) => ({ ...prev, question: v }))}
                required
                placeholder="Qual e a pergunta?"
              />
              <FormField
                label="Resposta"
                name="faq-answer"
                type="textarea"
                value={form.answer}
                onChange={(v) => setForm((prev) => ({ ...prev, answer: v }))}
                required
                rows={5}
                placeholder="Escreva a resposta..."
              />
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
                {saving ? 'A guardar...' : editingFaq ? 'Actualizar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar FAQ"
        message={`Tem a certeza que deseja eliminar esta FAQ? Esta accao nao pode ser revertida.`}
        confirmText="Eliminar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
