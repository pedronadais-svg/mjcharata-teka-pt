'use client';

import React, { useState } from 'react';
import {
  Type,
  ImageIcon,
  Table2,
  Square,
  Minus,
  CircleIcon,
  QrCode,
  Barcode,
  Braces,
  Hash,
  Calendar,
  Stamp,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Lock,
  LockOpen,
  ChevronUp,
  ChevronDown,
  GripVertical,
} from 'lucide-react';
import { PDFPage, PDFElement, HeaderFooterZone } from '@/lib/types/pdf-templates';

interface LayersPanelProps {
  pages: PDFPage[];
  header: HeaderFooterZone;
  footer: HeaderFooterZone;
  selectedPageId: string | null;
  selectedElementId: string | null;
  editingZone: 'page' | 'header' | 'footer';
  onSelectPage: (pageId: string) => void;
  onSelectElement: (elementId: string | null) => void;
  onSetEditingZone: (zone: 'page' | 'header' | 'footer') => void;
  onAddPage: () => void;
  onDeletePage: (pageId: string) => void;
  onReorderElement: (elementId: string, direction: 'up' | 'down') => void;
  onToggleVisibility: (elementId: string) => void;
  onLockElement: (elementId: string) => void;
  onDeleteElement: (elementId: string) => void;
  onRenamePage: (pageId: string, name: string) => void;
}

// Mapeamento de ícones por tipo de elemento
const getElementIcon = (type: string) => {
  const iconProps = { className: 'w-4 h-4' };

  switch (type) {
    case 'text':
      return <Type {...iconProps} />;
    case 'image':
      return <ImageIcon {...iconProps} />;
    case 'table':
      return <Table2 {...iconProps} />;
    case 'rectangle':
      return <Square {...iconProps} />;
    case 'line':
      return <Minus {...iconProps} />;
    case 'circle':
      return <CircleIcon {...iconProps} />;
    case 'qrcode':
      return <QrCode {...iconProps} />;
    case 'barcode':
      return <Barcode {...iconProps} />;
    case 'variable':
      return <Braces {...iconProps} />;
    case 'page-number':
      return <Hash {...iconProps} />;
    case 'date':
      return <Calendar {...iconProps} />;
    case 'logo':
      return <Stamp {...iconProps} />;
    default:
      return <Square {...iconProps} />;
  }
};

// Obter elementos da zona atual
const getZoneElements = (
  zone: 'page' | 'header' | 'footer',
  pages: PDFPage[],
  header: HeaderFooterZone,
  footer: HeaderFooterZone,
  selectedPageId: string | null
): PDFElement[] => {
  if (zone === 'header') {
    return header.elements || [];
  }
  if (zone === 'footer') {
    return footer.elements || [];
  }

  // Zona 'page'
  const page = pages.find(p => p.id === selectedPageId);
  return page?.elements || [];
};

export default function LayersPanel({
  pages,
  header,
  footer,
  selectedPageId,
  selectedElementId,
  editingZone,
  onSelectPage,
  onSelectElement,
  onSetEditingZone,
  onAddPage,
  onDeletePage,
  onReorderElement,
  onToggleVisibility,
  onLockElement,
  onDeleteElement,
  onRenamePage,
}: LayersPanelProps) {
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [pageNameInput, setPageNameInput] = useState('');
  const [variablesExpanded, setVariablesExpanded] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const currentElements = getZoneElements(editingZone, pages, header, footer, selectedPageId || '');
  const sortedElements = [...currentElements].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));

  const handlePageDoubleClick = (pageId: string, pageName: string) => {
    setEditingPageId(pageId);
    setPageNameInput(pageName);
  };

  const handlePageNameSave = (pageId: string) => {
    if (pageNameInput.trim()) {
      onRenamePage(pageId, pageNameInput);
    }
    setEditingPageId(null);
    setPageNameInput('');
  };

  const handleDeletePage = (pageId: string) => {
    onDeletePage(pageId);
    setDeleteConfirm(null);
  };

  const handleSelectPage = (pageId: string) => {
    onSelectPage(pageId);
    onSelectElement(null);
  };

  // Variáveis de exemplo (seria preenchido dinamicamente)
  const templateVariables = [
    { name: 'customer_name', type: 'text' },
    { name: 'invoice_date', type: 'date' },
    { name: 'total_amount', type: 'number' },
    { name: 'company_logo', type: 'image' },
  ];

  return (
    <div className="w-60 bg-[#1a1a1a] border-r border-gray-800 flex flex-col h-screen overflow-hidden">
      {/* Abas de Zona */}
      <div className="flex border-b border-gray-800">
        <button
          onClick={() => onSetEditingZone('header')}
          className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
            editingZone === 'header'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Cabeçalho
        </button>
        <button
          onClick={() => onSetEditingZone('page')}
          className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
            editingZone === 'page'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Página
        </button>
        <button
          onClick={() => onSetEditingZone('footer')}
          className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
            editingZone === 'footer'
              ? 'bg-blue-600 text-white'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Rodapé
        </button>
      </div>

      {/* Conteúdo da Panel */}
      <div className="flex-1 overflow-y-auto">
        {/* Secção de Páginas (apenas visível na zona 'page') */}
        {editingZone === 'page' && (
          <div className="border-b border-gray-800">
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
                  Páginas
                </h3>
                <button
                  onClick={onAddPage}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                  title="Adicionar página"
                >
                  <Plus className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="space-y-1">
                {pages.map((page) => (
                  <div
                    key={page.id}
                    className={`relative group rounded transition-colors ${
                      selectedPageId === page.id
                        ? 'bg-blue-600 bg-opacity-30 border border-blue-500'
                        : 'bg-gray-800 hover:bg-gray-700 border border-gray-700'
                    }`}
                  >
                    {editingPageId === page.id ? (
                      <input
                        autoFocus
                        type="text"
                        value={pageNameInput}
                        onChange={(e) => setPageNameInput(e.target.value)}
                        onBlur={() => handlePageNameSave(page.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handlePageNameSave(page.id);
                          if (e.key === 'Escape') setEditingPageId(null);
                        }}
                        className="w-full px-2 py-1 bg-gray-700 text-white text-sm rounded outline-none"
                      />
                    ) : (
                      <div
                        onDoubleClick={() => handlePageDoubleClick(page.id, page.name)}
                        onClick={() => handleSelectPage(page.id)}
                        className="px-2 py-1 text-sm text-gray-200 cursor-pointer flex items-center justify-between"
                      >
                        <span className="truncate flex-1">{page.name}</span>
                        {deleteConfirm === page.id ? (
                          <div className="flex gap-1 opacity-100">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePage(page.id);
                              }}
                              className="px-2 py-0.5 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                            >
                              Sim
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirm(null);
                              }}
                              className="px-2 py-0.5 bg-gray-600 text-white text-xs rounded hover:bg-gray-500"
                            >
                              Não
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm(page.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600 rounded transition-colors"
                            title="Eliminar página"
                          >
                            <Trash2 className="w-3 h-3 text-gray-400" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Secção de Elementos */}
        <div className="p-3">
          <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-wide mb-2">
            Elementos
          </h3>

          {sortedElements.length === 0 ? (
            <p className="text-xs text-gray-500 italic">Sem elementos</p>
          ) : (
            <div className="space-y-1">
              {sortedElements.map((element) => (
                <div
                  key={element.id}
                  onClick={() => onSelectElement(element.id)}
                  className={`group rounded p-2 flex items-center gap-2 cursor-pointer transition-colors ${
                    selectedElementId === element.id
                      ? 'bg-blue-600 border border-blue-400'
                      : 'bg-gray-800 hover:bg-gray-700 border border-transparent'
                  }`}
                >
                  {/* Ícone de tipo */}
                  <div className="flex-shrink-0 text-gray-400">
                    {getElementIcon(element.type)}
                  </div>

                  {/* Nome do elemento */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-200 truncate font-medium">
                      {element.name}
                    </p>
                  </div>

                  {/* Acções no lado direito */}
                  <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Visibilidade */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleVisibility(element.id);
                      }}
                      className="p-1 hover:bg-gray-600 rounded transition-colors"
                      title={element.visible ? 'Ocultar' : 'Mostrar'}
                    >
                      {element.visible ? (
                        <Eye className="w-3.5 h-3.5 text-gray-400" />
                      ) : (
                        <EyeOff className="w-3.5 h-3.5 text-gray-500" />
                      )}
                    </button>

                    {/* Bloqueio */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLockElement(element.id);
                      }}
                      className="p-1 hover:bg-gray-600 rounded transition-colors"
                      title={element.locked ? 'Desbloquear' : 'Bloquear'}
                    >
                      {element.locked ? (
                        <Lock className="w-3.5 h-3.5 text-gray-400" />
                      ) : (
                        <LockOpen className="w-3.5 h-3.5 text-gray-500" />
                      )}
                    </button>

                    {/* Reordenação */}
                    <div className="flex gap-0.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onReorderElement(element.id, 'up');
                        }}
                        className="p-1 hover:bg-gray-600 rounded transition-colors"
                        title="Trazer para frente"
                      >
                        <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onReorderElement(element.id, 'down');
                        }}
                        className="p-1 hover:bg-gray-600 rounded transition-colors"
                        title="Enviar para trás"
                      >
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    </div>

                    {/* Eliminar */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteElement(element.id);
                      }}
                      className="p-1 hover:bg-red-600 hover:bg-opacity-30 rounded transition-colors"
                      title="Eliminar elemento"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Secção de Variáveis */}
        <div className="border-t border-gray-800 p-3">
          <button
            onClick={() => setVariablesExpanded(!variablesExpanded)}
            className="flex items-center gap-2 w-full mb-2 text-xs font-semibold text-gray-300 uppercase tracking-wide hover:text-gray-200 transition-colors"
          >
            <ChevronUp
              className={`w-4 h-4 transition-transform ${
                variablesExpanded ? '' : '-rotate-90'
              }`}
            />
            Variáveis
          </button>

          {variablesExpanded && (
            <div className="space-y-1 text-xs text-gray-400">
              {templateVariables.length === 0 ? (
                <p className="italic">Sem variáveis disponíveis</p>
              ) : (
                templateVariables.map((variable) => (
                  <div
                    key={variable.name}
                    draggable
                    className="p-2 bg-gray-800 rounded cursor-move hover:bg-gray-700 transition-colors flex items-center gap-2"
                    title="Arraste para o canvas"
                  >
                    <GripVertical className="w-3 h-3 text-gray-600" />
                    <span className="flex-1 truncate font-mono text-gray-300">
                      {variable.name}
                    </span>
                    <span className="text-xs bg-gray-700 px-1.5 py-0.5 rounded text-gray-400">
                      {variable.type}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
