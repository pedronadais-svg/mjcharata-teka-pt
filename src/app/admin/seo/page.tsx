'use client';

import { useEffect, useState, useCallback } from 'react';
import { Pencil, Search } from 'lucide-react';
import { DataTable } from '@/components/admin/DataTable';
import type { Column } from '@/components/admin/DataTable';
import { FormField } from '@/components/admin/FormField';
import { SerpPreview } from '@/components/admin/SerpPreview';
import { useToast } from '@/components/admin/Toast';

interface SeoEntry {
  route: string;
  title: string;
  description: string;
  ogImage: string;
}

export default function SeoPage() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<SeoEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editEntry, setEditEntry] = useState<SeoEntry | null>(null);
  const [form, setForm] = useState<SeoEntry>({ route: '', title: '', description: '', ogImage: '' });
  const [saving, setSaving] = useState(false);

  const fetchSeo = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/seo');
      if (res.ok) {
        const json = await res.json();
        setEntries(Array.isArray(json) ? json : json.data ?? []);
      }
    } catch {
      toast('error', 'Erro ao carregar dados SEO');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSeo();
  }, [fetchSeo]);

  function openEdit(entry: SeoEntry) {
    setForm({ ...entry });
    setEditEntry(entry);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/seo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast('success', 'SEO actualizado com sucesso');
        setEditEntry(null);
        fetchSeo();
      } else {
        toast('error', 'Erro ao actualizar SEO');
      }
    } catch {
      toast('error', 'Erro ao actualizar SEO');
    } finally {
      setSaving(false);
    }
  }

  function charCountColor(len: number, greenMax: number, yellowMax: number) {
    if (len <= greenMax) return 'text-green-600';
    if (len <= yellowMax) return 'text-yellow-600';
    return 'text-red-600';
  }

  const columns: Column<SeoEntry>[] = [
    {
      key: 'route',
      label: 'Rota',
      render: (e) => <span className="font-mono text-xs text-gray-500">{e.route}</span>,
    },
    {
      key: 'title',
      label: 'Titulo',
      render: (e) => (
        <div>
          <span className="text-sm text-teka-dark">{e.title || <span className="text-gray-400 italic">Sem titulo</span>}</span>
          <span className={`ml-2 text-xs ${charCountColor(e.title.length, 60, 70)}`}>
            ({e.title.length})
          </span>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Descricao',
      render: (e) => (
        <div>
          <span className="text-sm text-teka-dark truncate block max-w-xs">
            {e.description || <span className="text-gray-400 italic">Sem descricao</span>}
          </span>
          <span className={`text-xs ${charCountColor(e.description.length, 155, 170)}`}>
            ({e.description.length})
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: '',
      width: '60px',
      render: (e) => (
        <button
          onClick={() => openEdit(e)}
          className="p-1.5 text-gray-400 hover:text-teka-dark rounded hover:bg-gray-100"
          title="Editar"
        >
          <Pencil className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-heading font-bold text-teka-dark flex items-center gap-2">
          <Search className="h-6 w-6 text-teka-gray" />
          SEO por Pagina
        </h1>
        <p className="text-sm text-teka-gray mt-1">Optimize os titulos e descricoes de cada pagina para motores de busca</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-green-500" /> Bom
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-yellow-500" /> Aceitavel
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-red-500" /> Demasiado longo
        </span>
        <span className="text-gray-400">
          Titulo: &lt;60 bom, 60-70 aceitavel, &gt;70 longo | Descricao: &lt;155 bom, 155-170 aceitavel, &gt;170 longo
        </span>
      </div>

      {/* Table */}
      <DataTable columns={columns} data={entries} keyField="route" loading={loading} />

      {/* Edit Modal */}
      {editEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditEntry(null)} />
          <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-heading font-semibold text-teka-dark mb-4">Editar SEO</h2>

            <div className="space-y-4">
              <FormField
                label="Rota"
                name="route"
                value={form.route}
                onChange={() => {}}
                disabled
              />
              <div>
                <FormField
                  label="Titulo"
                  name="title"
                  value={form.title}
                  onChange={(v) => setForm((prev) => ({ ...prev, title: v }))}
                  maxLength={100}
                />
                <p className={`text-xs mt-1 ${charCountColor(form.title.length, 60, 70)}`}>
                  {form.title.length} caracteres {form.title.length <= 60 ? '(bom)' : form.title.length <= 70 ? '(aceitavel)' : '(demasiado longo)'}
                </p>
              </div>
              <div>
                <FormField
                  label="Descricao"
                  name="description"
                  type="textarea"
                  value={form.description}
                  onChange={(v) => setForm((prev) => ({ ...prev, description: v }))}
                  rows={3}
                  maxLength={250}
                />
                <p className={`text-xs mt-1 ${charCountColor(form.description.length, 155, 170)}`}>
                  {form.description.length} caracteres {form.description.length <= 155 ? '(bom)' : form.description.length <= 170 ? '(aceitavel)' : '(demasiado longo)'}
                </p>
              </div>
              <FormField
                label="Imagem OG (URL)"
                name="ogImage"
                type="url"
                value={form.ogImage}
                onChange={(v) => setForm((prev) => ({ ...prev, ogImage: v }))}
                help="Imagem para partilha nas redes sociais (1200x630 recomendado)"
              />

              {/* Google Preview */}
              <SerpPreview
                title={form.title}
                description={form.description}
                url={`https://teka-angola.com${form.route}`}
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setEditEntry(null)} className="px-4 py-2 text-sm text-teka-gray bg-gray-100 rounded hover:bg-gray-200">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm text-white bg-teka-red rounded hover:bg-teka-red/90 disabled:opacity-50">
                {saving ? 'A guardar...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
