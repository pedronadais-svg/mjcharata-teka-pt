'use client';

import { useState, useRef, type DragEvent } from 'react';
import { Upload, X, Link as LinkIcon } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
}

export function ImageUploader({ label, value, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    if (file.size > 5 * 1024 * 1024) {
      alert('Ficheiro demasiado grande (máx. 5 MB)');
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Apenas ficheiros de imagem são permitidos');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload falhou');
      const data = await res.json();
      onChange(data.url);
    } catch (err) {
      alert('Erro ao fazer upload da imagem');
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-teka-dark mb-1">{label}</label>

      {value ? (
        <div className="relative rounded border border-gray-200 overflow-hidden bg-gray-50">
          <img
            src={value}
            alt="Preview"
            className="w-full h-48 object-contain"
            onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.svg'; }}
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow hover:bg-red-50 text-gray-500 hover:text-red-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            dragOver ? 'border-teka-red bg-teka-red/5' : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-teka-red border-t-transparent" />
              <p className="text-sm text-teka-gray">A enviar...</p>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-teka-gray">
                Arraste uma imagem ou <span className="text-teka-red font-medium">clique para escolher</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP (máx. 5 MB)</p>
            </>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadFile(file);
        }}
      />

      {/* URL input toggle */}
      <div className="mt-2">
        {showUrlInput ? (
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://..."
              className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-sm"
            />
            <button
              type="button"
              onClick={() => { if (urlInput) { onChange(urlInput); setUrlInput(''); setShowUrlInput(false); } }}
              className="px-3 py-1.5 bg-teka-red text-white text-sm rounded hover:bg-teka-red/90"
            >
              Usar URL
            </button>
            <button
              type="button"
              onClick={() => setShowUrlInput(false)}
              className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowUrlInput(true)}
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-teka-red"
          >
            <LinkIcon className="h-3 w-3" />
            Ou colar URL
          </button>
        )}
      </div>
    </div>
  );
}
