'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2, Plus, X, GripVertical } from 'lucide-react';
import { FormField } from '@/components/admin/FormField';
import { TagInput } from '@/components/admin/TagInput';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/admin/Toast';
import { StatusBadge } from '@/components/admin/StatusBadge';
import type { Category, Product, ProductSpecification } from '@/lib/types';

type TabKey = 'geral' | 'preco' | 'imagens' | 'especificacoes';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'geral', label: 'Geral' },
  { key: 'preco', label: 'Preço' },
  { key: 'imagens', label: 'Imagens' },
  { key: 'especificacoes', label: 'Especificações' },
];

const STATUS_OPTIONS = [
  { value: 'active', label: 'Activo' },
  { value: 'draft', label: 'Rascunho' },
  { value: 'archived', label: 'Arquivado' },
];

const ENERGY_RATING_OPTIONS = [
  { value: '', label: 'Sem classificacao' },
  { value: 'A+++', label: 'A+++' },
  { value: 'A++', label: 'A++' },
  { value: 'A+', label: 'A+' },
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' },
  { value: 'E', label: 'E' },
  { value: 'F', label: 'F' },
  { value: 'G', label: 'G' },
];

interface ProductForm {
  name: string;
  reference: string;
  ean: string;
  shortDescription: string;
  description: string;
  category: string;
  subcategory: string;
  status: string;
  tags: string[];
  isNew: boolean;
  isPromoted: boolean;
  priceAOA: string;
  refPhc: string;
  energyRating: string;
  thumbnail: string;
  images: string[];
  specifications: ProductSpecification[];
}

function emptyForm(): ProductForm {
  return {
    name: '',
    reference: '',
    ean: '',
    shortDescription: '',
    description: '',
    category: '',
    subcategory: '',
    status: 'draft',
    tags: [],
    isNew: false,
    isPromoted: false,
    priceAOA: '',
    refPhc: '',
    energyRating: '',
    thumbnail: '',
    images: [],
    specifications: [],
  };
}

export default function AdminProductEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const productId = params.id as string;

  const [form, setForm] = useState<ProductForm>(emptyForm());
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('geral');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Derived subcategories
  const selectedCategory = categories.find((c) => c.slug === form.category);
  const subcategoryOptions = selectedCategory?.subcategories.map((s) => ({ value: s.slug, label: s.name })) ?? [];

  // Fetch product + categories
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch(`/api/admin/products/${productId}`),
        fetch('/api/admin/categories'),
      ]);

      if (!prodRes.ok) {
        toast('error', 'Produto não encontrado');
        router.push('/admin/produtos');
        return;
      }

      const prodData = await prodRes.json();
      const catData: Category[] = catRes.ok ? await catRes.json() : [];

      const p: Product = prodData.product ?? prodData;
      setForm({
        name: p.name ?? '',
        reference: p.reference ?? '',
        ean: p.ean ?? '',
        shortDescription: p.shortDescription ?? '',
        description: p.description ?? '',
        category: p.category ?? '',
        subcategory: p.subcategory ?? '',
        status: (p as unknown as Record<string, string>).status ?? 'draft',
        tags: p.tags ?? [],
        isNew: p.isNew ?? false,
        isPromoted: p.isPromoted ?? false,
        priceAOA: p.priceAOA != null ? String(p.priceAOA) : '',
        refPhc: p.refPhc ?? '',
        energyRating: p.energyRating ?? '',
        thumbnail: p.thumbnail ?? '',
        images: p.images ?? [],
        specifications: p.specifications ?? [],
      });
      setCategories(catData);
    } catch {
      toast('error', 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [productId, router, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Field updater
  function setField<K extends keyof ProductForm>(key: K, value: ProductForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Save
  async function handleSave() {
    if (!form.name.trim()) {
      toast('error', 'O nome do produto e obrigatorio');
      return;
    }

    setSaving(true);
    try {
      const body = {
        name: form.name,
        reference: form.reference,
        ean: form.ean,
        shortDescription: form.shortDescription,
        description: form.description,
        category: form.category,
        subcategory: form.subcategory,
        status: form.status,
        tags: form.tags,
        isNew: form.isNew,
        isPromoted: form.isPromoted,
        priceAOA: form.priceAOA ? Number(form.priceAOA) : undefined,
        refPhc: form.refPhc,
        energyRating: form.energyRating || undefined,
        thumbnail: form.thumbnail,
        images: form.images,
        specifications: form.specifications,
      };

      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast('success', 'Produto guardado com sucesso');
      } else {
        const err = await res.json().catch(() => null);
        toast('error', err?.message ?? 'Erro ao guardar produto');
      }
    } catch {
      toast('error', 'Erro ao guardar produto');
    } finally {
      setSaving(false);
    }
  }

  // Delete
  async function handleDelete() {
    setDeleteOpen(false);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' });
      if (res.ok) {
        toast('success', 'Produto eliminado');
        router.push('/admin/produtos');
      } else {
        toast('error', 'Erro ao eliminar produto');
      }
    } catch {
      toast('error', 'Erro ao eliminar produto');
    }
  }

  // Spec helpers
  function addSpec() {
    setField('specifications', [...form.specifications, { label: '', value: '', group: '' }]);
  }

  function updateSpec(index: number, key: keyof ProductSpecification, value: string) {
    const updated = form.specifications.map((s, i) => (i === index ? { ...s, [key]: value } : s));
    setField('specifications', updated);
  }

  function removeSpec(index: number) {
    setField('specifications', form.specifications.filter((_, i) => i !== index));
  }

  // Image helpers
  function addImage() {
    const url = newImageUrl.trim();
    if (url && !form.images.includes(url)) {
      setField('images', [...form.images, url]);
      setNewImageUrl('');
    }
  }

  function removeImage(index: number) {
    setField('images', form.images.filter((_, i) => i !== index));
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="bg-white border border-gray-200 rounded p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/produtos"
            className="p-2 text-gray-400 hover:text-teka-red rounded hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-heading font-bold text-teka-dark">{form.name || 'Editar Produto'}</h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={form.status} />
              <span className="text-xs text-gray-400 font-mono">{form.reference}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDeleteOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 text-sm font-medium rounded hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Eliminar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 bg-teka-red text-white text-sm font-medium rounded hover:bg-teka-red/90 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'A guardar...' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-0 -mb-px">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-teka-red text-teka-red'
                  : 'border-transparent text-gray-500 hover:text-teka-dark hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-gray-200 rounded p-6">
        {/* --- Tab Geral --- */}
        {activeTab === 'geral' && (
          <div className="space-y-5 max-w-2xl">
            <FormField
              label="Nome do produto"
              name="name"
              value={form.name}
              onChange={(v) => setField('name', v)}
              required
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Referência"
                name="reference"
                value={form.reference}
                onChange={(v) => setField('reference', v)}
              />
              <FormField
                label="EAN"
                name="ean"
                value={form.ean}
                onChange={(v) => setField('ean', v)}
              />
            </div>
            <FormField
              label="Descrição curta"
              name="shortDescription"
              type="textarea"
              value={form.shortDescription}
              onChange={(v) => setField('shortDescription', v)}
              maxLength={500}
              rows={3}
            />
            <FormField
              label="Descrição completa"
              name="description"
              type="textarea"
              value={form.description}
              onChange={(v) => setField('description', v)}
              rows={6}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Categoria"
                name="category"
                type="select"
                value={form.category}
                onChange={(v) => {
                  setField('category', v);
                  setField('subcategory', '');
                }}
                options={categories.map((c) => ({ value: c.slug, label: c.name }))}
                required
              />
              <FormField
                label="Subcategoria"
                name="subcategory"
                type="select"
                value={form.subcategory}
                onChange={(v) => setField('subcategory', v)}
                options={subcategoryOptions}
                required
              />
            </div>
            <FormField
              label="Estado"
              name="status"
              type="select"
              value={form.status}
              onChange={(v) => setField('status', v)}
              options={STATUS_OPTIONS}
            />
            <TagInput
              label="Tags"
              tags={form.tags}
              onChange={(v) => setField('tags', v)}
            />
            <div className="flex items-center gap-6 pt-2">
              <label className="inline-flex items-center gap-2 text-sm text-teka-dark cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isNew}
                  onChange={(e) => setField('isNew', e.target.checked)}
                  className="rounded border-gray-300 text-teka-red focus:ring-teka-red"
                />
                Produto novo
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-teka-dark cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isPromoted}
                  onChange={(e) => setField('isPromoted', e.target.checked)}
                  className="rounded border-gray-300 text-teka-red focus:ring-teka-red"
                />
                Produto em destaque
              </label>
            </div>
          </div>
        )}

        {/* --- Tab Preco --- */}
        {activeTab === 'preco' && (
          <div className="space-y-5 max-w-md">
            <FormField
              label="Preço (AOA)"
              name="priceAOA"
              type="number"
              value={form.priceAOA}
              onChange={(v) => setField('priceAOA', v)}
              help="Preço em Kwanzas angolanos"
            />
            <FormField
              label="Referência PHC"
              name="refPhc"
              value={form.refPhc}
              onChange={(v) => setField('refPhc', v)}
              help="Codigo interno no sistema PHC"
            />
            <FormField
              label="Classificacao energetica"
              name="energyRating"
              type="select"
              value={form.energyRating}
              onChange={(v) => setField('energyRating', v)}
              options={ENERGY_RATING_OPTIONS}
            />
          </div>
        )}

        {/* --- Tab Imagens --- */}
        {activeTab === 'imagens' && (
          <div className="space-y-6 max-w-2xl">
            <ImageUploader
              label="Imagem principal (thumbnail)"
              value={form.thumbnail}
              onChange={(v) => setField('thumbnail', v)}
            />

            <div>
              <label className="block text-sm font-medium text-teka-dark mb-2">Galeria de imagens</label>

              {form.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  {form.images.map((img, i) => (
                    <div key={i} className="relative group rounded border border-gray-200 overflow-hidden bg-gray-50">
                      <img
                        src={img}
                        alt={`Imagem ${i + 1}`}
                        className="w-full h-32 object-contain p-1"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.svg'; }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 p-1 bg-white/90 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 text-gray-500 hover:text-red-500"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <div className="absolute bottom-1 left-1 p-1 text-gray-400">
                        <GripVertical className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }}
                  placeholder="https://... URL da imagem"
                  className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teka-red/30 focus:border-teka-red"
                />
                <button
                  type="button"
                  onClick={addImage}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-teka-red text-white text-sm rounded hover:bg-teka-red/90 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Cole o URL de uma imagem e clique em Adicionar</p>
            </div>
          </div>
        )}

        {/* --- Tab Especificacoes --- */}
        {activeTab === 'especificacoes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-teka-gray">
                {form.specifications.length} especificacao(es)
              </p>
              <button
                type="button"
                onClick={addSpec}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-teka-red text-white text-sm rounded hover:bg-teka-red/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Adicionar linha
              </button>
            </div>

            {form.specifications.length > 0 ? (
              <div className="border border-gray-200 rounded overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Grupo</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Label</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Valor</th>
                      <th className="w-12"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.specifications.map((spec, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={spec.group ?? ''}
                            onChange={(e) => updateSpec(i, 'group', e.target.value)}
                            placeholder="Grupo"
                            className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-teka-red/30"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={spec.label}
                            onChange={(e) => updateSpec(i, 'label', e.target.value)}
                            placeholder="Ex: Capacidade"
                            className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-teka-red/30"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={spec.value}
                            onChange={(e) => updateSpec(i, 'value', e.target.value)}
                            placeholder="Ex: 8 kg"
                            className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-teka-red/30"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeSpec(i)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-red-50 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 text-sm border border-dashed border-gray-200 rounded">
                Nenhuma especificacao adicionada. Clique em &quot;Adicionar linha&quot; para começar.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteOpen}
        title="Eliminar produto"
        message={`Tem a certeza que deseja eliminar "${form.name}"? Esta accao nao pode ser revertida.`}
        confirmText="Eliminar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
