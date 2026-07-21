'use client';

import { FileText, Download, Image, Archive, Ruler } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { ProductDocument, DocumentFormat } from '@/lib/types';
import { DOCUMENT_TYPE_LABELS } from '@/lib/types';

const formatIcons: Record<DocumentFormat, React.ElementType> = {
  pdf: FileText,
  dwg: Ruler,
  dxf: Ruler,
  jpg: Image,
  png: Image,
  zip: Archive,
};

interface ProductDocumentsProps {
  documents: ProductDocument[];
  productName?: string;
}

export function ProductDocuments({ documents, productName }: ProductDocumentsProps) {
  if (!documents.length) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-bold text-xl text-teka-dark">
          Documentação e Downloads
        </h3>
        {productName && (
          <span className="text-sm text-teka-gray">{documents.length} documento{documents.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      <div className="border border-teka-border rounded overflow-hidden divide-y divide-teka-border">
        {documents
          .sort((a, b) => a.order - b.order)
          .map((doc) => {
            const Icon = formatIcons[doc.format] || FileText;
            return (
              <a
                key={doc.id}
                href={doc.url}
                download
                className="group flex items-center gap-4 p-4 hover:bg-teka-light transition-colors"
              >
                {/* Icon */}
                <div className="shrink-0 w-10 h-10 rounded-lg bg-teka-red/10 flex items-center justify-center group-hover:bg-teka-red/20 transition-colors">
                  <Icon className="h-5 w-5 text-teka-red" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-teka-dark group-hover:text-teka-red transition-colors truncate">
                      {doc.name}
                    </span>
                    <Badge variant="secondary" className="text-[10px] shrink-0">
                      {DOCUMENT_TYPE_LABELS[doc.type]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-teka-gray">
                    <span>{doc.language}</span>
                    <span>•</span>
                    <span className="uppercase">{doc.format}</span>
                    {doc.size && (
                      <>
                        <span>•</span>
                        <span>{doc.size}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Download */}
                <div className="shrink-0">
                  <div className="w-9 h-9 rounded-full border border-teka-border flex items-center justify-center group-hover:border-teka-red group-hover:bg-teka-red group-hover:text-white text-teka-gray transition-all">
                    <Download className="h-4 w-4" />
                  </div>
                </div>
              </a>
            );
          })}
      </div>
    </div>
  );
}
