interface SerpPreviewProps {
  title: string;
  description: string;
  url: string;
}

export function SerpPreview({ title, description, url }: SerpPreviewProps) {
  const titleLen = title.length;
  const descLen = description.length;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <p className="text-xs text-gray-400 mb-2 font-medium">Preview do Google</p>
      <div className="space-y-0.5">
        <p className="text-sm text-green-700 truncate">{url || 'https://teka-angola.com/...'}</p>
        <h3 className="text-[#1a0dab] text-lg leading-snug hover:underline cursor-pointer truncate">
          {title || 'Título da página'}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2">
          {description || 'Descrição da página aparecerá aqui...'}
        </p>
      </div>
      <div className="flex gap-4 mt-3 text-xs">
        <span className={titleLen <= 60 ? 'text-green-600' : titleLen <= 70 ? 'text-yellow-600' : 'text-red-600'}>
          Título: {titleLen} caracteres {titleLen <= 60 ? '(bom)' : titleLen <= 70 ? '(aceitável)' : '(demasiado longo)'}
        </span>
        <span className={descLen <= 155 ? 'text-green-600' : descLen <= 170 ? 'text-yellow-600' : 'text-red-600'}>
          Descrição: {descLen} caracteres {descLen <= 155 ? '(bom)' : descLen <= 170 ? '(aceitável)' : '(demasiado longo)'}
        </span>
      </div>
    </div>
  );
}
