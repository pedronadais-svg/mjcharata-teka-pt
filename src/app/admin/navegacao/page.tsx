'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, GripVertical, ArrowUp, ArrowDown, Save, Navigation } from 'lucide-react';
import { useToast } from '@/components/admin/Toast';

interface MenuItem {
  id: string;
  label: string;
  href: string;
  featured: boolean;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const defaultNavigation: MenuItem[] = [
  { id: '1', label: 'Cozinha', href: '/cozinha', featured: false },
  { id: '2', label: 'Lavandaria', href: '/lavandaria', featured: false },
  { id: '3', label: 'Ar Condicionado', href: '/ar-condicionado', featured: true },
  { id: '4', label: 'Termoacumuladores', href: '/termoacumuladores', featured: false },
  { id: '5', label: 'Novidades', href: '/novidades', featured: true },
  { id: '6', label: 'Onde Comprar', href: '/onde-comprar', featured: false },
  { id: '7', label: 'Suporte', href: '/suporte', featured: false },
];

export default function NavegaçãoPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchNavigation = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const json = await res.json();
        if (json.navigation && Array.isArray(json.navigation) && json.navigation.length > 0) {
          setItems(
            json.navigation.map((item: Partial<MenuItem>, i: number) => ({
              id: item.id || generateId() + i,
              label: item.label || '',
              href: item.href || '',
              featured: item.featured || false,
            }))
          );
        } else {
          // No navigation in settings, use defaults
          setItems(defaultNavigation);
        }
      } else {
        setItems(defaultNavigation);
      }
    } catch {
      setItems(defaultNavigation);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNavigation();
  }, [fetchNavigation]);

  function addItem() {
    setItems((prev) => [...prev, { id: generateId(), label: '', href: '', featured: false }]);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function updateItem(id: string, field: keyof MenuItem, value: string | boolean) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }

  function moveUp(index: number) {
    if (index <= 0) return;
    setItems((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }

  function moveDown(index: number) {
    setItems((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  }

  async function handleSave() {
    // Validate
    const invalid = items.some((item) => !item.label.trim() || !item.href.trim());
    if (invalid) {
      toast('error', 'Preencha todos os campos de label e link');
      return;
    }

    setSaving(true);
    try {
      // First fetch current settings, then merge navigation into them
      const getRes = await fetch('/api/admin/settings');
      let currentSettings = {};
      if (getRes.ok) {
        currentSettings = await getRes.json();
      }

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentSettings,
          navigation: items.map(({ id, label, href, featured }) => ({ id, label, href, featured })),
        }),
      });
      if (res.ok) {
        toast('success', 'Navegação guardada com sucesso');
      } else {
        toast('error', 'Erro ao guardar navegação');
      }
    } catch {
      toast('error', 'Erro ao guardar navegação');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="bg-white rounded-lg border border-gray-200 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 border-b border-gray-100 flex items-center px-4 gap-4">
              <div className="h-4 bg-gray-200 rounded w-6" />
              <div className="h-8 bg-gray-100 rounded flex-1" />
              <div className="h-8 bg-gray-100 rounded flex-1" />
              <div className="h-4 bg-gray-200 rounded w-16" />
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
            <Navigation className="h-6 w-6 text-teka-gray" />
            Navegação
          </h1>
          <p className="text-sm text-teka-gray mt-1">Editar o menu de navegação principal do site</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={addItem}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-teka-dark text-sm font-medium rounded border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Adicionar Item
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teka-red text-white text-sm font-medium rounded hover:bg-teka-red/90 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'A guardar...' : 'Guardar'}
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Header Row */}
        <div className="grid grid-cols-[40px_1fr_1fr_80px_80px] gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          <span />
          <span>Label</span>
          <span>Link</span>
          <span className="text-center">Destaque</span>
          <span />
        </div>

        {items.length === 0 ? (
          <div className="px-4 py-12 text-center text-gray-400 text-sm">
            Nenhum item de navegação. Clique em &quot;Adicionar Item&quot; para começar.
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={item.id}
              className="grid grid-cols-[40px_1fr_1fr_80px_80px] gap-3 px-4 py-3 border-b border-gray-100 items-center hover:bg-gray-50 transition-colors"
            >
              {/* Reorder */}
              <div className="flex flex-col items-center gap-0.5">
                <GripVertical className="h-4 w-4 text-gray-300" />
                <div className="flex gap-0.5">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="Mover para cima"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === items.length - 1}
                    className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    title="Mover para baixo"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Label */}
              <input
                type="text"
                value={item.label}
                onChange={(e) => updateItem(item.id, 'label', e.target.value)}
                placeholder="Nome do menu"
                className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teka-red/30 focus:border-teka-red"
              />

              {/* Href */}
              <input
                type="text"
                value={item.href}
                onChange={(e) => updateItem(item.id, 'href', e.target.value)}
                placeholder="/pagina"
                className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teka-red/30 focus:border-teka-red"
              />

              {/* Featured */}
              <div className="flex justify-center">
                <input
                  type="checkbox"
                  checked={item.featured}
                  onChange={(e) => updateItem(item.id, 'featured', e.target.checked)}
                  className="rounded border-gray-300"
                  title="Destaque"
                />
              </div>

              {/* Remove */}
              <div className="flex justify-center">
                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                  title="Remover"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info */}
      <p className="text-xs text-gray-400">
        Use as setas para reordenar os itens. Items com &quot;Destaque&quot; activado podem ser destacados visualmente no menu.
      </p>
    </div>
  );
}
