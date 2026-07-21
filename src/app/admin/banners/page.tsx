'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Image, Video, X } from 'lucide-react';
import { FormField } from '@/components/admin/FormField';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { useToast } from '@/components/admin/Toast';

interface Banner {
  id: string;
  type: 'hero' | 'promotional';
  title: string;
  subtitle: string;
  mediaType: 'image' | 'video';
  mediaUrl: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
  order?: number;
}

interface BannerForm {
  type: string;
  title: string;
  subtitle: string;
  mediaType: string;
  mediaUrl: string;
  ctaText: string;
  ctaLink: string;
  isActive: boolean;
}

const emptyForm: BannerForm = {
  type: 'hero',
  title: '',
  subtitle: '',
  mediaType: 'image',
  mediaUrl: '',
  ctaText: '',
  ctaLink: '',
  isActive: true,
};

const TYPE_OPTIONS = [
  { value: 'hero', label: 'Hero Slide' },
  { value: 'promotional', label: 'Banner Promocional' },
];

const MEDIA_OPTIONS = [
  { value: 'image', label: 'Imagem' },
  { value: 'video', label: 'Video' },
];

export default function AdminBannersPage() {
  const { toast } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [form, setForm] = useState<BannerForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/banners');
      if (!res.ok) throw new Error('Erro ao carregar banners');
      const data = await res.json();
      setBanners(Array.isArray(data.banners) ? data.banners : Array.isArray(data) ? data : []);
    } catch {
      toast('error', 'Erro ao carregar banners');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  function openAddModal() {
    setEditingBanner(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEditModal(banner: Banner) {
    setEditingBanner(banner);
    setForm({
      type: banner.type,
      title: banner.title,
      subtitle: banner.subtitle,
      mediaType: banner.mediaType,
      mediaUrl: banner.mediaUrl,
      ctaText: banner.ctaText,
      ctaLink: banner.ctaLink,
      isActive: banner.isActive,
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingBanner(null);
    setForm(emptyForm);
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast('error', 'O titulo e obrigatorio');
      return;
    }
    setSaving(true);
    try {
      if (editingBanner) {
        const res = await fetch(`/api/admin/banners/${editingBanner.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Erro ao actualizar');
        toast('success', 'Banner actualizado com sucesso');
      } else {
        const res = await fetch('/api/admin/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Erro ao criar');
        toast('success', 'Banner criado com sucesso');
      }
      closeModal();
      fetchBanners();
    } catch {
      toast('error', editingBanner ? 'Erro ao actualizar banner' : 'Erro ao criar banner');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(banner: Banner) {
    try {
      const res = await fetch(`/api/admin/banners/${banner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...banner, isActive: !banner.isActive }),
      });
      if (!res.ok) throw new Error('Erro ao actualizar');
      toast('success', banner.isActive ? 'Banner desactivado' : 'Banner activado');
      fetchBanners();
    } catch {
      toast('error', 'Erro ao actualizar estado do banner');
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/banners/${deleteTarget.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao eliminar');
      toast('success', 'Banner eliminado com sucesso');
      setDeleteTarget(null);
      fetchBanners();
    } catch {
      toast('error', 'Erro ao eliminar banner');
    }
  }

  const heroSlides = banners.filter((b) => b.type === 'hero');
  const promotional = banners.filter((b) => b.type === 'promotional');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
              <div className="h-32 bg-gray-100 rounded mb-3" />
              <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderBannerCard(banner: Banner) {
    return (
      <div
        key={banner.id}
        className={`bg-white rounded-lg border overflow-hidden transition-shadow hover:shadow-sm ${
          banner.isActive ? 'border-gray-200' : 'border-gray-200 opacity-60'
        }`}
      >
        {/* Media preview */}
        <div className="h-36 bg-gray-100 relative">
          {banner.mediaType === 'video' ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <Video className="h-10 w-10 text-gray-400" />
              <span className="absolute bottom-2 left-2 text-xs bg-black/60 text-white px-2 py-0.5 rounded">
                Video
              </span>
            </div>
          ) : banner.mediaUrl ? (
            <img
              src={banner.mediaUrl}
              alt={banner.title}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.svg'; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Image className="h-10 w-10 text-gray-300" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-teka-dark text-sm truncate">{banner.title}</p>
              {banner.subtitle && (
                <p className="text-xs text-teka-gray mt-0.5 truncate">{banner.subtitle}</p>
              )}
            </div>
          </div>

          {banner.ctaText && (
            <p className="text-xs text-gray-400 mt-2">
              CTA: {banner.ctaText} &rarr; {banner.ctaLink}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={banner.isActive}
                onChange={() => handleToggleActive(banner)}
                className="rounded border-gray-300 text-teka-red focus:ring-teka-red/30"
              />
              <span className="text-xs text-gray-500">{banner.isActive ? 'Activo' : 'Inactivo'}</span>
            </label>
            <div className="flex items-center gap-1">
              <button
                onClick={() => openEditModal(banner)}
                className="p-1.5 text-gray-400 hover:text-teka-red rounded hover:bg-gray-100"
                title="Editar"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDeleteTarget(banner)}
                className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"
                title="Eliminar"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-teka-dark">Banners</h1>
          <p className="text-sm text-teka-gray mt-1">Gerir slides hero e banners promocionais</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teka-red text-white text-sm font-medium rounded hover:bg-teka-red/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Novo Banner
        </button>
      </div>

      {/* Hero Slides */}
      <div>
        <h2 className="font-heading font-semibold text-teka-dark mb-4">Hero Slides</h2>
        {heroSlides.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 px-6 py-8 text-center text-gray-400 text-sm">
            Nenhum hero slide configurado.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {heroSlides.map(renderBannerCard)}
          </div>
        )}
      </div>

      {/* Promotional Banners */}
      <div>
        <h2 className="font-heading font-semibold text-teka-dark mb-4">Banners Promocionais</h2>
        {promotional.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 px-6 py-8 text-center text-gray-400 text-sm">
            Nenhum banner promocional configurado.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {promotional.map(renderBannerCard)}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          <div className="relative bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-heading font-semibold text-lg text-teka-dark">
                {editingBanner ? 'Editar Banner' : 'Novo Banner'}
              </h3>
              <button onClick={closeModal} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <FormField
                label="Tipo"
                name="banner-type"
                type="select"
                value={form.type}
                onChange={(v) => setForm((prev) => ({ ...prev, type: v }))}
                options={TYPE_OPTIONS}
                required
              />
              <FormField
                label="Titulo"
                name="banner-title"
                value={form.title}
                onChange={(v) => setForm((prev) => ({ ...prev, title: v }))}
                required
                placeholder="Titulo do banner"
              />
              <FormField
                label="Subtitulo"
                name="banner-subtitle"
                value={form.subtitle}
                onChange={(v) => setForm((prev) => ({ ...prev, subtitle: v }))}
                placeholder="Subtitulo (opcional)"
              />
              <FormField
                label="Tipo de media"
                name="banner-mediaType"
                type="select"
                value={form.mediaType}
                onChange={(v) => setForm((prev) => ({ ...prev, mediaType: v, mediaUrl: '' }))}
                options={MEDIA_OPTIONS}
              />

              {form.mediaType === 'image' ? (
                <ImageUploader
                  label="Imagem"
                  value={form.mediaUrl}
                  onChange={(url) => setForm((prev) => ({ ...prev, mediaUrl: url }))}
                />
              ) : (
                <FormField
                  label="URL do video"
                  name="banner-mediaUrl"
                  type="url"
                  value={form.mediaUrl}
                  onChange={(v) => setForm((prev) => ({ ...prev, mediaUrl: v }))}
                  placeholder="https://..."
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Texto do CTA"
                  name="banner-ctaText"
                  value={form.ctaText}
                  onChange={(v) => setForm((prev) => ({ ...prev, ctaText: v }))}
                  placeholder="Ex: Ver mais"
                />
                <FormField
                  label="Link do CTA"
                  name="banner-ctaLink"
                  value={form.ctaLink}
                  onChange={(v) => setForm((prev) => ({ ...prev, ctaLink: v }))}
                  placeholder="/pagina-destino"
                />
              </div>

              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-gray-300 text-teka-red focus:ring-teka-red/30"
                />
                <span className="text-sm text-teka-dark">Activo</span>
              </label>
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
                {saving ? 'A guardar...' : editingBanner ? 'Actualizar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar banner"
        message={`Tem a certeza que deseja eliminar "${deleteTarget?.title}"? Esta accao nao pode ser revertida.`}
        confirmText="Eliminar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
