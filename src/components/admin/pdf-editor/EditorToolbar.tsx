'use client';

import React from 'react';
import {
  Type,
  Image as ImageIcon,
  Table2,
  Square,
  Minus,
  Circle,
  QrCode,
  Barcode,
  Braces,
  Hash,
  Calendar,
  ZoomOut,
  ZoomIn,
  Maximize,
  Grid3X3,
  Magnet,
  Ruler,
  Undo2,
  Redo2,
  Eye,
  Save,
} from 'lucide-react';
import { ElementType } from '@/lib/types/pdf-templates';

interface EditorToolbarProps {
  zoom: number;
  showGrid: boolean;
  snapToGrid: boolean;
  showRulers: boolean;
  canUndo: boolean;
  canRedo: boolean;
  isDirty: boolean;
  onAddElement: (type: ElementType) => void;
  onZoomChange: (zoom: number) => void;
  onToggleGrid: () => void;
  onToggleSnap: () => void;
  onToggleRulers: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onPreview: () => void;
  onSave: () => void;
}

// Mapeamento de tipos de elementos para ícones e nomes em português
const ELEMENT_TOOLS: Array<{
  type: ElementType;
  icon: React.ReactNode;
  label: string;
}> = [
  { type: 'text', icon: <Type size={18} />, label: 'Texto' },
  { type: 'image', icon: <ImageIcon size={18} />, label: 'Imagem' },
  { type: 'table', icon: <Table2 size={18} />, label: 'Tabela' },
  { type: 'rectangle', icon: <Square size={18} />, label: 'Retângulo' },
  { type: 'line', icon: <Minus size={18} />, label: 'Linha' },
  { type: 'circle', icon: <Circle size={18} />, label: 'Círculo' },
  { type: 'qrcode', icon: <QrCode size={18} />, label: 'Código QR' },
  { type: 'barcode', icon: <Barcode size={18} />, label: 'Código de Barras' },
  { type: 'variable', icon: <Braces size={18} />, label: 'Variável' },
  { type: 'pagenumber', icon: <Hash size={18} />, label: 'Número de Página' },
  { type: 'date', icon: <Calendar size={18} />, label: 'Data' },
  { type: 'logo', icon: <ImageIcon size={18} />, label: 'Logótipo' },
];

export function EditorToolbar({
  zoom,
  showGrid,
  snapToGrid,
  showRulers,
  canUndo,
  canRedo,
  isDirty,
  onAddElement,
  onZoomChange,
  onToggleGrid,
  onToggleSnap,
  onToggleRulers,
  onUndo,
  onRedo,
  onPreview,
  onSave,
}: EditorToolbarProps) {
  // Calcula novos valores de zoom
  const handleZoomOut = () => {
    const newZoom = Math.max(25, zoom - 10);
    onZoomChange(newZoom);
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(200, zoom + 10);
    onZoomChange(newZoom);
  };

  const handleFitToPage = () => {
    onZoomChange(100);
  };

  return (
    <div className="flex items-center gap-2 bg-[#0E0E0E] border-b border-gray-800 px-4 py-3 overflow-x-auto">
      {/* Ferramentas de Elementos - Esquerda */}
      <div className="flex items-center gap-1">
        {ELEMENT_TOOLS.map((tool) => (
          <button
            key={tool.type}
            onClick={() => onAddElement(tool.type)}
            title={tool.label}
            className="p-2 rounded hover:bg-gray-700 active:bg-gray-600 transition-colors text-gray-300 hover:text-white"
            aria-label={`Adicionar ${tool.label}`}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      {/* Divisor */}
      <div className="w-px h-6 bg-gray-700 mx-2" />

      {/* Controles de Canvas - Centro */}
      <div className="flex items-center gap-1">
        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          title="Reduzir Zoom"
          className="p-2 rounded hover:bg-gray-700 active:bg-gray-600 transition-colors text-gray-300 hover:text-white"
          aria-label="Reduzir zoom"
        >
          <ZoomOut size={18} />
        </button>

        {/* Zoom Display */}
        <div className="px-3 py-2 text-sm text-gray-300 min-w-[50px] text-center font-medium">
          {zoom}%
        </div>

        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          title="Aumentar Zoom"
          className="p-2 rounded hover:bg-gray-700 active:bg-gray-600 transition-colors text-gray-300 hover:text-white"
          aria-label="Aumentar zoom"
        >
          <ZoomIn size={18} />
        </button>

        {/* Fit to Page */}
        <button
          onClick={handleFitToPage}
          title="Ajustar à Página"
          className="p-2 rounded hover:bg-gray-700 active:bg-gray-600 transition-colors text-gray-300 hover:text-white"
          aria-label="Ajustar à página"
        >
          <Maximize size={18} />
        </button>

        {/* Divisor */}
        <div className="w-px h-6 bg-gray-700 mx-2" />

        {/* Toggle Grid */}
        <button
          onClick={onToggleGrid}
          title={showGrid ? 'Ocultar Grade' : 'Mostrar Grade'}
          className={`p-2 rounded transition-colors ${
            showGrid
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
          aria-label="Alternar grade"
          aria-pressed={showGrid}
        >
          <Grid3X3 size={18} />
        </button>

        {/* Toggle Snap to Grid */}
        <button
          onClick={onToggleSnap}
          title={snapToGrid ? 'Desativar Alinhar à Grade' : 'Ativar Alinhar à Grade'}
          className={`p-2 rounded transition-colors ${
            snapToGrid
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
          aria-label="Alternar alinhamento à grade"
          aria-pressed={snapToGrid}
        >
          <Magnet size={18} />
        </button>

        {/* Toggle Rulers */}
        <button
          onClick={onToggleRulers}
          title={showRulers ? 'Ocultar Réguas' : 'Mostrar Réguas'}
          className={`p-2 rounded transition-colors ${
            showRulers
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
          aria-label="Alternar réguas"
          aria-pressed={showRulers}
        >
          <Ruler size={18} />
        </button>
      </div>

      {/* Divisor */}
      <div className="w-px h-6 bg-gray-700 mx-2" />

      {/* Ações - Direita */}
      <div className="flex items-center gap-1 ml-auto">
        {/* Undo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          title="Desfazer"
          className={`p-2 rounded transition-colors ${
            canUndo
              ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
              : 'text-gray-600 cursor-not-allowed'
          }`}
          aria-label="Desfazer"
        >
          <Undo2 size={18} />
        </button>

        {/* Redo */}
        <button
          onClick={onRedo}
          disabled={!canRedo}
          title="Refazer"
          className={`p-2 rounded transition-colors ${
            canRedo
              ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
              : 'text-gray-600 cursor-not-allowed'
          }`}
          aria-label="Refazer"
        >
          <Redo2 size={18} />
        </button>

        {/* Divisor */}
        <div className="w-px h-6 bg-gray-700 mx-2" />

        {/* Preview */}
        <button
          onClick={onPreview}
          title="Pré-visualizar"
          className="p-2 rounded hover:bg-gray-700 active:bg-gray-600 transition-colors text-gray-300 hover:text-white"
          aria-label="Pré-visualizar"
        >
          <Eye size={18} />
        </button>

        {/* Save */}
        <button
          onClick={onSave}
          title={isDirty ? 'Guardar (alterações por guardar)' : 'Guardar'}
          className={`p-2 rounded transition-colors ${
            isDirty
              ? 'text-yellow-400 hover:bg-yellow-900/30 hover:text-yellow-300'
              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
          }`}
          aria-label="Guardar"
        >
          <Save size={18} />
        </button>
      </div>
    </div>
  );
}
