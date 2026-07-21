'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { FormField } from '@/components/admin/FormField';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { TagInput } from '@/components/admin/TagInput';
import { useToast } from '@/components/admin/Toast';

interface ArticleForm {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: string;
  status: string;
  coverImage: string;
  tags: string[];
}

const CATEGORY_OPTIONS = [
  { value: 'Cozinhar', label: 'Cozinhar' },
  { value: 'Dicas', label: 'Dicas' },
  { value: 'Inovação', label: 'Inovação' },
  { value: 'Design', label: 'Design' },
  { value: 'Curiosidades', label: 'Curiosidades' },
];

const STATUS_OPTIONS = [
  { value: 'published', label: 'Publicado' },
  { value: 'draft', label: 'Rascunho' },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function calcReadTime(html: string): string {
  const text = html.replace(/<[^>]+>/g, '');
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.ceil(words / 200) + ' min';
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export default function AdminNewArticlePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState<ArticleForm>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    author: '',
    date: todayISO(),
    status: 'draft',
    coverImage: '',
    tags: [],
  });
  const [saving, setSaving] = useState(false);
  const [slugManual, setSlugManual] = useState(false);

  function updateField(field: keyof ArticleForm) {
    return (value: string) => {
      setForm((prev) => {
        const next = { ...prev, [field]: value };
        if (field === 'title' && !slugManual) {
          next.slug = slugify(value);
        }
        return next;
      });
    };
  }

  async function handleSave() {
    if (!form.title.trim()) {
      toast('error', 'O titulo e obrigatorio');
      return;
    }
    if (!form.category) {
      toast('error', 'A categoria e obrigatoria');
      return;
    }
    setSaving(true);
    try {
      const readTime = calcReadTime(form.content);
      const res = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, readTime }),
      });
      if (!res.ok) throw new Error('Erro ao criar artigo');
      toast('success', 'Artigo criado com sucesso');
      router.push('/admin/artigos');
    } catch {
      toast('error', 'Erro ao criar artigo');
    } finally {
      setSaving(false);
    }
  }

  const readTime = calcReadTime(form.content);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/artigos"
            className="p-2 text-gray-400 hover:text-teka-dark rounded hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-heading font-bold text-teka-dark">Novo Artigo</h1>
            <p className="text-sm text-teka-gray mt-0.5">
              Tempo de leitura estimado: {readTime}
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-teka-red text-white text-sm font-medium rounded hover:bg-teka-red/90 transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? 'A criar...' : 'Criar Artigo'}
        </button>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
        <FormField
          label="Titulo"
          name="title"
          value={form.title}
          onChange={updateField('title')}
          required
          placeholder="Titulo do artigo"
        />

        <FormField
          label="Slug"
          name="slug"
          value={form.slug}
          onChange={(v) => { setSlugManual(true); updateField('slug')(v); }}
          help="Gerado automaticamente a partir do titulo"
          placeholder="slug-do-artigo"
        />

        <FormField
          label="Excerto"
          name="excerpt"
          type="textarea"
          value={form.excerpt}
          onChange={updateField('excerpt')}
          maxLength={300}
          rows={3}
          placeholder="Breve resumo do artigo (max. 300 caracteres)"
        />

        <FormField
          label="Conteudo (HTML)"
          name="content"
          type="textarea"
          value={form.content}
          onChange={updateField('content')}
          rows={16}
          placeholder="<p>Conteudo do artigo em HTML...</p>"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField
            label="Categoria"
            name="category"
            type="select"
            value={form.category}
            onChange={updateField('category')}
            options={CATEGORY_OPTIONS}
            required
          />
          <FormField
            label="Autor"
            name="author"
            value={form.author}
            onChange={updateField('author')}
            placeholder="Nome do autor"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField
            label="Data de publicacao"
            name="date"
            type="date"
            value={form.date}
            onChange={updateField('date')}
          />
          <FormField
            label="Estado"
            name="status"
            type="select"
            value={form.status}
            onChange={updateField('status')}
            options={STATUS_OPTIONS}
          />
        </div>

        <ImageUploader
          label="Imagem de capa"
          value={form.coverImage}
          onChange={(url) => setForm((prev) => ({ ...prev, coverImage: url }))}
        />

        <TagInput
          label="Tags"
          tags={form.tags}
          onChange={(tags) => setForm((prev) => ({ ...prev, tags }))}
        />
      </div>
    </div>
  );
}
