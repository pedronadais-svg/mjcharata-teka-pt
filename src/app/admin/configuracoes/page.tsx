'use client';

import { useEffect, useState, useCallback } from 'react';
import { Save, Building2, Share2, Settings2, Search } from 'lucide-react';
import { FormField } from '@/components/admin/FormField';
import { useToast } from '@/components/admin/Toast';

interface SiteSettings {
  siteName: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  whatsapp: string;
  social: {
    facebook: string;
    instagram: string;
    youtube: string;
    linkedin: string;
  };
  features: {
    showPrices: boolean;
    enableChat: boolean;
    enableNewsletter: boolean;
    maintenanceMode: boolean;
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    ogImage: string;
  };
}

const defaultSettings: SiteSettings = {
  siteName: '',
  company: '',
  phone: '',
  email: '',
  address: '',
  whatsapp: '',
  social: { facebook: '', instagram: '', youtube: '', linkedin: '' },
  features: { showPrices: true, enableChat: true, enableNewsletter: true, maintenanceMode: false },
  seo: { defaultTitle: '', defaultDescription: '', ogImage: '' },
};

export default function ConfiguraçõesPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const json = await res.json();
        setSettings({
          ...defaultSettings,
          ...json,
          social: { ...defaultSettings.social, ...json.social },
          features: { ...defaultSettings.features, ...json.features },
          seo: { ...defaultSettings.seo, ...json.seo },
        });
      }
    } catch {
      toast('error', 'Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  function update(field: string, value: string) {
    setSettings((prev) => ({ ...prev, [field]: value }));
  }

  function updateSocial(field: string, value: string) {
    setSettings((prev) => ({
      ...prev,
      social: { ...prev.social, [field]: value },
    }));
  }

  function updateFeature(field: string, checked: boolean) {
    setSettings((prev) => ({
      ...prev,
      features: { ...prev.features, [field]: checked },
    }));
  }

  function updateSeo(field: string, value: string) {
    setSettings((prev) => ({
      ...prev,
      seo: { ...prev.seo, [field]: value },
    }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        toast('success', 'Configurações guardadas com sucesso');
      } else {
        toast('error', 'Erro ao guardar configurações');
      }
    } catch {
      toast('error', 'Erro ao guardar configurações');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-32 mb-4" />
            <div className="space-y-3">
              <div className="h-10 bg-gray-100 rounded" />
              <div className="h-10 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const featureToggles: { key: keyof SiteSettings['features']; label: string; description: string }[] = [
    { key: 'showPrices', label: 'Mostrar Precos', description: 'Exibir precos dos produtos no site' },
    { key: 'enableChat', label: 'Activar Chat', description: 'Activar o chat de apoio ao cliente' },
    { key: 'enableNewsletter', label: 'Activar Newsletter', description: 'Exibir formulario de subscricao da newsletter' },
    { key: 'maintenanceMode', label: 'Modo de Manutencao', description: 'Colocar o site em modo de manutencao (apenas admins conseguem aceder)' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-teka-dark">Configurações</h1>
          <p className="text-sm text-teka-gray mt-1">Configurações gerais do site</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teka-red text-white text-sm font-medium rounded hover:bg-teka-red/90 transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'A guardar...' : 'Guardar'}
        </button>
      </div>

      {/* Empresa */}
      <section className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-teka-gray" />
          <h2 className="font-heading font-semibold text-teka-dark">Empresa</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Nome do Site" name="siteName" value={settings.siteName} onChange={(v) => update('siteName', v)} />
          <FormField label="Empresa" name="company" value={settings.company} onChange={(v) => update('company', v)} />
          <FormField label="Telefone" name="phone" value={settings.phone} onChange={(v) => update('phone', v)} />
          <FormField label="Email" name="email" type="email" value={settings.email} onChange={(v) => update('email', v)} />
          <FormField label="Morada" name="address" value={settings.address} onChange={(v) => update('address', v)} className="md:col-span-2" />
          <FormField label="WhatsApp" name="whatsapp" value={settings.whatsapp} onChange={(v) => update('whatsapp', v)} placeholder="+244 9XX XXX XXX" />
        </div>
      </section>

      {/* Redes Sociais */}
      <section className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
          <Share2 className="h-5 w-5 text-teka-gray" />
          <h2 className="font-heading font-semibold text-teka-dark">Redes Sociais</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Facebook" name="facebook" type="url" value={settings.social.facebook} onChange={(v) => updateSocial('facebook', v)} placeholder="https://facebook.com/..." />
          <FormField label="Instagram" name="instagram" type="url" value={settings.social.instagram} onChange={(v) => updateSocial('instagram', v)} placeholder="https://instagram.com/..." />
          <FormField label="YouTube" name="youtube" type="url" value={settings.social.youtube} onChange={(v) => updateSocial('youtube', v)} placeholder="https://youtube.com/..." />
          <FormField label="LinkedIn" name="linkedin" type="url" value={settings.social.linkedin} onChange={(v) => updateSocial('linkedin', v)} placeholder="https://linkedin.com/..." />
        </div>
      </section>

      {/* Funcionalidades */}
      <section className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-teka-gray" />
          <h2 className="font-heading font-semibold text-teka-dark">Funcionalidades</h2>
        </div>
        <div className="p-6 space-y-4">
          {featureToggles.map((ft) => (
            <label key={ft.key} className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.features[ft.key]}
                onChange={(e) => updateFeature(ft.key, e.target.checked)}
                className="mt-0.5 rounded border-gray-300"
              />
              <div>
                <p className="text-sm font-medium text-teka-dark">{ft.label}</p>
                <p className="text-xs text-teka-gray">{ft.description}</p>
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* SEO Global */}
      <section className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
          <Search className="h-5 w-5 text-teka-gray" />
          <h2 className="font-heading font-semibold text-teka-dark">SEO Global</h2>
        </div>
        <div className="p-6 space-y-4">
          <FormField label="Titulo Predefinido" name="seoTitle" value={settings.seo.defaultTitle} onChange={(v) => updateSeo('defaultTitle', v)} help="Usado quando uma pagina nao define titulo proprio" />
          <FormField label="Descricao Predefinida" name="seoDescription" type="textarea" value={settings.seo.defaultDescription} onChange={(v) => updateSeo('defaultDescription', v)} rows={3} maxLength={200} help="Aparece nos resultados do Google" />
          <FormField label="Imagem OG (URL)" name="seoOgImage" type="url" value={settings.seo.ogImage} onChange={(v) => updateSeo('ogImage', v)} help="Imagem partilhada nas redes sociais (1200x630 recomendado)" />
        </div>
      </section>
    </div>
  );
}
