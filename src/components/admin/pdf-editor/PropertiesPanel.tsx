'use client';

import React, { useState } from 'react';
import {
  ChevronDown,
  Trash2,
  Copy,
  Lock,
  LockOpen,
  Plus,
  X
} from 'lucide-react';
import {
  PDFElement,
  PageSettings,
  TemplateVariable,
  TextElement,
  ImageElement,
  ShapeElement,
  LineElement,
  QRCodeElement,
  BarcodeElement,
  VariableElement,
  TableElement,
  PageNumberElement,
  DateElement
} from '@/lib/types/pdf-templates';

interface PropertiesPanelProps {
  element: PDFElement | null;
  pageSettings: PageSettings;
  variables: TemplateVariable[];
  onUpdateElement: (updates: Partial<PDFElement>) => void;
  onUpdatePageSettings: (updates: Partial<PageSettings>) => void;
  onDeleteElement: () => void;
  onDuplicateElement: () => void;
  onLockElement: () => void;
}

type TabType = 'propriedades' | 'posicao' | 'estilo';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

// Componente para secções colapsáveis
function CollapsibleSection({ title, children, defaultOpen = true }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-800 transition-colors"
      >
        <span className="text-sm font-medium text-gray-200">{title}</span>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className="px-3 py-2 space-y-3 bg-gray-900/50">
          {children}
        </div>
      )}
    </div>
  );
}

// Componente reutilizável para input de label + valor
interface LabeledInputProps {
  label: string;
  type?: string;
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

function LabeledInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  min,
  max,
  step
}: LabeledInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-400">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
      />
    </div>
  );
}

// Componente reutilizável para select
interface LabeledSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
}

function LabeledSelect({
  label,
  value,
  onChange,
  options
}: LabeledSelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-400">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// Componente para color picker (simples)
interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-400">{label}</label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-8 rounded border border-gray-700 cursor-pointer"
        />
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );
}

// Componente para toggle checkbox
interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border border-gray-700 bg-gray-800 cursor-pointer"
      />
      <label className="text-xs text-gray-300 cursor-pointer">{label}</label>
    </div>
  );
}

// Componente para slider
interface SliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

function Slider({ label, value, onChange, min = 0, max = 100, step = 1 }: SliderProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between">
        <label className="text-xs font-medium text-gray-400">{label}</label>
        <span className="text-xs text-gray-500">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
    </div>
  );
}

// Painel de configurações da página
function PageSettingsPanel({
  settings,
  onUpdate
}: {
  settings: PageSettings;
  onUpdate: (updates: Partial<PageSettings>) => void;
}) {
  return (
    <div className="space-y-2">
      <CollapsibleSection title="Tamanho e Orientação" defaultOpen>
        <LabeledSelect
          label="Tamanho"
          value={settings.pageSize || 'A4'}
          onChange={(value) => onUpdate({ pageSize: value as any })}
          options={[
            { label: 'A4', value: 'A4' },
            { label: 'A3', value: 'A3' },
            { label: 'Letter', value: 'Letter' },
            { label: 'Legal', value: 'Legal' }
          ]}
        />
        <LabeledSelect
          label="Orientação"
          value={settings.orientation || 'portrait'}
          onChange={(value) => onUpdate({ orientation: value as 'portrait' | 'landscape' })}
          options={[
            { label: 'Retrato', value: 'portrait' },
            { label: 'Paisagem', value: 'landscape' }
          ]}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Margens (mm)" defaultOpen>
        <div className="grid grid-cols-2 gap-2">
          <LabeledInput
            label="Superior"
            type="number"
            value={settings.margins?.top || 0}
            onChange={(value) => onUpdate({
              margins: { ...settings.margins, top: value as number }
            })}
            min={0}
            step={0.5}
          />
          <LabeledInput
            label="Direita"
            type="number"
            value={settings.margins?.right || 0}
            onChange={(value) => onUpdate({
              margins: { ...settings.margins, right: value as number }
            })}
            min={0}
            step={0.5}
          />
          <LabeledInput
            label="Inferior"
            type="number"
            value={settings.margins?.bottom || 0}
            onChange={(value) => onUpdate({
              margins: { ...settings.margins, bottom: value as number }
            })}
            min={0}
            step={0.5}
          />
          <LabeledInput
            label="Esquerda"
            type="number"
            value={settings.margins?.left || 0}
            onChange={(value) => onUpdate({
              margins: { ...settings.margins, left: value as number }
            })}
            min={0}
            step={0.5}
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Cabeçalho e Rodapé" defaultOpen>
        <LabeledInput
          label="Altura do Cabeçalho (mm)"
          type="number"
          value={settings.headerHeight || 0}
          onChange={(value) => onUpdate({ headerHeight: value as number })}
          min={0}
          step={0.5}
        />
        <LabeledInput
          label="Altura do Rodapé (mm)"
          type="number"
          value={settings.footerHeight || 0}
          onChange={(value) => onUpdate({ footerHeight: value as number })}
          min={0}
          step={0.5}
        />
      </CollapsibleSection>
    </div>
  );
}

// Painel de propriedades por tipo de elemento
function ElementPropertiesPanel({
  element,
  variables,
  onUpdate
}: {
  element: PDFElement;
  variables: TemplateVariable[];
  onUpdate: (updates: Partial<PDFElement>) => void;
}) {
  return (
    <div className="space-y-2">
      {element.type === 'text' && (
        <>
          <CollapsibleSection title="Conteúdo" defaultOpen>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-400">Texto</label>
              <textarea
                value={(element as TextElement).content || ''}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder="Introduza o texto..."
                className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none h-20"
              />
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Fonte">
            <LabeledSelect
              label="Família"
              value={(element as TextElement).fontFamily || 'Arial'}
              onChange={(value) => onUpdate({ fontFamily: value })}
              options={[
                { label: 'Arial', value: 'Arial' },
                { label: 'Times New Roman', value: 'Times New Roman' },
                { label: 'Courier New', value: 'Courier New' },
                { label: 'Helvetica', value: 'Helvetica' },
                { label: 'Georgia', value: 'Georgia' }
              ]}
            />
            <LabeledInput
              label="Tamanho (pt)"
              type="number"
              value={(element as TextElement).fontSize || 12}
              onChange={(value) => onUpdate({ fontSize: value as number })}
              min={6}
              max={72}
              step={1}
            />
            <div className="space-y-2">
              <Toggle
                label="Negrito"
                checked={(element as TextElement).bold || false}
                onChange={(checked) => onUpdate({ bold: checked })}
              />
              <Toggle
                label="Itálico"
                checked={(element as TextElement).italic || false}
                onChange={(checked) => onUpdate({ italic: checked })}
              />
              <Toggle
                label="Sublinhado"
                checked={(element as TextElement).underline || false}
                onChange={(checked) => onUpdate({ underline: checked })}
              />
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Alinhamento">
            <LabeledSelect
              label="Alinhamento"
              value={(element as TextElement).textAlign || 'left'}
              onChange={(value) => onUpdate({ textAlign: value as any })}
              options={[
                { label: 'Esquerda', value: 'left' },
                { label: 'Centro', value: 'center' },
                { label: 'Direita', value: 'right' },
                { label: 'Justificado', value: 'justify' }
              ]}
            />
            <LabeledInput
              label="Altura de linha"
              type="number"
              value={(element as TextElement).lineHeight || 1.5}
              onChange={(value) => onUpdate({ lineHeight: value as number })}
              min={0.5}
              max={3}
              step={0.1}
            />
          </CollapsibleSection>

          <CollapsibleSection title="Cor">
            <ColorPicker
              label="Cor do texto"
              value={(element as TextElement).color || '#000000'}
              onChange={(value) => onUpdate({ color: value })}
            />
          </CollapsibleSection>
        </>
      )}

      {(element.type === 'image' || element.type === 'logo') && (
        <>
          <CollapsibleSection title="Imagem" defaultOpen>
            <LabeledInput
              label="URL/Caminho"
              value={(element as ImageElement).src || ''}
              onChange={(value) => onUpdate({ src: value as string })}
              placeholder="/imagens/logo.png"
            />
            <LabeledSelect
              label="Ajuste"
              value={(element as ImageElement).objectFit || 'cover'}
              onChange={(value) => onUpdate({ objectFit: value as any })}
              options={[
                { label: 'Cobrir', value: 'cover' },
                { label: 'Conter', value: 'contain' },
                { label: 'Esticar', value: 'fill' },
                { label: 'Escalado', value: 'scale-down' }
              ]}
            />
            <Slider
              label="Opacidade"
              value={(element as ImageElement).opacity || 1}
              onChange={(value) => onUpdate({ opacity: value })}
              min={0}
              max={1}
              step={0.05}
            />
          </CollapsibleSection>
        </>
      )}

      {(element.type === 'rectangle' || element.type === 'circle') && (
        <>
          <CollapsibleSection title="Preenchimento">
            <ColorPicker
              label="Cor de fundo"
              value={(element as ShapeElement).backgroundColor || '#FFFFFF'}
              onChange={(value) => onUpdate({ backgroundColor: value })}
            />
            <Slider
              label="Opacidade"
              value={(element as ShapeElement).opacity || 1}
              onChange={(value) => onUpdate({ opacity: value })}
              min={0}
              max={1}
              step={0.05}
            />
          </CollapsibleSection>

          <CollapsibleSection title="Fronteira">
            <LabeledInput
              label="Largura (mm)"
              type="number"
              value={(element as ShapeElement).borderWidth || 0}
              onChange={(value) => onUpdate({ borderWidth: value as number })}
              min={0}
              step={0.1}
            />
            <ColorPicker
              label="Cor"
              value={(element as ShapeElement).borderColor || '#000000'}
              onChange={(value) => onUpdate({ borderColor: value })}
            />
            <LabeledSelect
              label="Estilo"
              value={(element as ShapeElement).borderStyle || 'solid'}
              onChange={(value) => onUpdate({ borderStyle: value as any })}
              options={[
                { label: 'Sólida', value: 'solid' },
                { label: 'Tracejada', value: 'dashed' },
                { label: 'Pontilhada', value: 'dotted' }
              ]}
            />
            {element.type === 'rectangle' && (
              <LabeledInput
                label="Raio da borda (mm)"
                type="number"
                value={(element as ShapeElement).borderRadius || 0}
                onChange={(value) => onUpdate({ borderRadius: value as number })}
                min={0}
                step={0.1}
              />
            )}
          </CollapsibleSection>
        </>
      )}

      {element.type === 'line' && (
        <>
          <CollapsibleSection title="Linha" defaultOpen>
            <ColorPicker
              label="Cor"
              value={(element as LineElement).strokeColor || '#000000'}
              onChange={(value) => onUpdate({ strokeColor: value })}
            />
            <LabeledInput
              label="Largura (mm)"
              type="number"
              value={(element as LineElement).strokeWidth || 1}
              onChange={(value) => onUpdate({ strokeWidth: value as number })}
              min={0.1}
              max={10}
              step={0.1}
            />
            <LabeledSelect
              label="Estilo"
              value={(element as LineElement).strokeStyle || 'solid'}
              onChange={(value) => onUpdate({ strokeStyle: value as any })}
              options={[
                { label: 'Sólida', value: 'solid' },
                { label: 'Tracejada', value: 'dashed' },
                { label: 'Pontilhada', value: 'dotted' }
              ]}
            />
            <LabeledSelect
              label="Caps de seta"
              value={(element as LineElement).arrowCaps || 'none'}
              onChange={(value) => onUpdate({ arrowCaps: value as any })}
              options={[
                { label: 'Nenhuma', value: 'none' },
                { label: 'Seta', value: 'arrow' },
                { label: 'Círculo', value: 'circle' }
              ]}
            />
          </CollapsibleSection>
        </>
      )}

      {element.type === 'qrcode' && (
        <>
          <CollapsibleSection title="QR Code" defaultOpen>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-400">Conteúdo</label>
              <textarea
                value={(element as QRCodeElement).content || ''}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder="Introduza o conteúdo ou {{variavel}}"
                className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none h-16"
              />
              <span className="text-xs text-gray-500">Use {{variavel}} para inserir variáveis</span>
            </div>

            <LabeledInput
              label="Tamanho (mm)"
              type="number"
              value={(element as QRCodeElement).size || 50}
              onChange={(value) => onUpdate({ size: value as number })}
              min={10}
              max={200}
              step={1}
            />

            <LabeledSelect
              label="Correção de erros"
              value={(element as QRCodeElement).errorCorrection || 'M'}
              onChange={(value) => onUpdate({ errorCorrection: value as any })}
              options={[
                { label: 'L (7%)', value: 'L' },
                { label: 'M (15%)', value: 'M' },
                { label: 'Q (25%)', value: 'Q' },
                { label: 'H (30%)', value: 'H' }
              ]}
            />

            <ColorPicker
              label="Cor (foreground)"
              value={(element as QRCodeElement).foreground || '#000000'}
              onChange={(value) => onUpdate({ foreground: value })}
            />
            <ColorPicker
              label="Cor (background)"
              value={(element as QRCodeElement).background || '#FFFFFF'}
              onChange={(value) => onUpdate({ background: value })}
            />
          </CollapsibleSection>
        </>
      )}

      {element.type === 'barcode' && (
        <>
          <CollapsibleSection title="Código de Barras" defaultOpen>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-400">Conteúdo</label>
              <textarea
                value={(element as BarcodeElement).content || ''}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder="Introduza o conteúdo ou {{variavel}}"
                className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none h-16"
              />
            </div>

            <LabeledSelect
              label="Formato"
              value={(element as BarcodeElement).format || 'CODE128'}
              onChange={(value) => onUpdate({ format: value })}
              options={[
                { label: 'CODE128', value: 'CODE128' },
                { label: 'CODE39', value: 'CODE39' },
                { label: 'EAN13', value: 'EAN13' },
                { label: 'EAN8', value: 'EAN8' },
                { label: 'UPC', value: 'UPC' }
              ]}
            />

            <Toggle
              label="Mostrar texto"
              checked={(element as BarcodeElement).displayValue || true}
              onChange={(checked) => onUpdate({ displayValue: checked })}
            />

            <ColorPicker
              label="Cor das barras"
              value={(element as BarcodeElement).foreground || '#000000'}
              onChange={(value) => onUpdate({ foreground: value })}
            />
            <ColorPicker
              label="Cor de fundo"
              value={(element as BarcodeElement).background || '#FFFFFF'}
              onChange={(value) => onUpdate({ background: value })}
            />
          </CollapsibleSection>
        </>
      )}

      {element.type === 'variable' && (
        <>
          <CollapsibleSection title="Variável" defaultOpen>
            <LabeledSelect
              label="Nome da variável"
              value={(element as VariableElement).variableName || ''}
              onChange={(value) => onUpdate({ variableName: value })}
              options={[
                { label: 'Selecione uma variável', value: '' },
                ...variables.map((v) => ({ label: v.name, value: v.name }))
              ]}
            />

            <LabeledInput
              label="Formato"
              value={(element as VariableElement).format || ''}
              onChange={(value) => onUpdate({ format: value as string })}
              placeholder="Ex: dd/MM/yyyy"
            />

            <LabeledInput
              label="Valor padrão"
              value={(element as VariableElement).fallback || ''}
              onChange={(value) => onUpdate({ fallback: value as string })}
              placeholder="Se variável vazia"
            />
          </CollapsibleSection>

          <CollapsibleSection title="Estilo do texto">
            <LabeledSelect
              label="Família"
              value={(element as VariableElement).fontFamily || 'Arial'}
              onChange={(value) => onUpdate({ fontFamily: value })}
              options={[
                { label: 'Arial', value: 'Arial' },
                { label: 'Times New Roman', value: 'Times New Roman' },
                { label: 'Courier New', value: 'Courier New' }
              ]}
            />
            <LabeledInput
              label="Tamanho (pt)"
              type="number"
              value={(element as VariableElement).fontSize || 12}
              onChange={(value) => onUpdate({ fontSize: value as number })}
              min={6}
              max={72}
              step={1}
            />
            <ColorPicker
              label="Cor"
              value={(element as VariableElement).color || '#000000'}
              onChange={(value) => onUpdate({ color: value })}
            />
          </CollapsibleSection>
        </>
      )}

      {element.type === 'table' && (
        <>
          <CollapsibleSection title="Colunas" defaultOpen>
            <div className="space-y-2">
              {((element as TableElement).columns || []).map((col, idx) => (
                <div key={idx} className="border border-gray-700 rounded p-2 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-300">Coluna {idx + 1}</span>
                    <button
                      onClick={() => {
                        const newCols = ((element as TableElement).columns || []).filter((_, i) => i !== idx);
                        onUpdate({ columns: newCols });
                      }}
                      className="p-1 hover:bg-gray-700 rounded text-red-400"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <LabeledInput
                    label="Cabeçalho"
                    value={col.header || ''}
                    onChange={(value) => {
                      const newCols = [...((element as TableElement).columns || [])];
                      newCols[idx] = { ...newCols[idx], header: value as string };
                      onUpdate({ columns: newCols });
                    }}
                  />
                  <LabeledInput
                    label="Largura (%)"
                    type="number"
                    value={col.width || 0}
                    onChange={(value) => {
                      const newCols = [...((element as TableElement).columns || [])];
                      newCols[idx] = { ...newCols[idx], width: value as number };
                      onUpdate({ columns: newCols });
                    }}
                    min={0}
                    max={100}
                  />
                  <LabeledInput
                    label="Campo de dados"
                    value={col.fieldBinding || ''}
                    onChange={(value) => {
                      const newCols = [...((element as TableElement).columns || [])];
                      newCols[idx] = { ...newCols[idx], fieldBinding: value as string };
                      onUpdate({ columns: newCols });
                    }}
                  />
                </div>
              ))}
              <button
                onClick={() => {
                  const newCols = [
                    ...((element as TableElement).columns || []),
                    { header: 'Nova coluna', width: 25, fieldBinding: '' }
                  ];
                  onUpdate({ columns: newCols });
                }}
                className="w-full flex items-center justify-center gap-1 px-2 py-1 bg-gray-800 border border-gray-700 rounded hover:bg-gray-700 text-xs text-gray-300"
              >
                <Plus size={14} /> Adicionar coluna
              </button>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Estilo da tabela">
            <ColorPicker
              label="Cor do cabeçalho"
              value={(element as TableElement).headerBackground || '#f0f0f0'}
              onChange={(value) => onUpdate({ headerBackground: value })}
            />
            <LabeledInput
              label="Altura da linha"
              type="number"
              value={(element as TableElement).rowHeight || 20}
              onChange={(value) => onUpdate({ rowHeight: value as number })}
              min={10}
              step={1}
            />
            <ColorPicker
              label="Cor de linha alternada"
              value={(element as TableElement).alternateRowColor || '#f9f9f9'}
              onChange={(value) => onUpdate({ alternateRowColor: value })}
            />
          </CollapsibleSection>

          <CollapsibleSection title="Fronteira">
            <LabeledInput
              label="Largura (mm)"
              type="number"
              value={(element as TableElement).borderWidth || 0.5}
              onChange={(value) => onUpdate({ borderWidth: value as number })}
              min={0}
              step={0.1}
            />
            <ColorPicker
              label="Cor"
              value={(element as TableElement).borderColor || '#000000'}
              onChange={(value) => onUpdate({ borderColor: value })}
            />
          </CollapsibleSection>
        </>
      )}

      {element.type === 'pagenumber' && (
        <>
          <CollapsibleSection title="Número de página" defaultOpen>
            <LabeledSelect
              label="Formato"
              value={(element as PageNumberElement).format || 'decimal'}
              onChange={(value) => onUpdate({ format: value })}
              options={[
                { label: 'Números (1, 2, 3)', value: 'decimal' },
                { label: 'Romanos (I, II, III)', value: 'roman' },
                { label: 'Letras (A, B, C)', value: 'letter' }
              ]}
            />
            <LabeledInput
              label="Prefixo"
              value={(element as PageNumberElement).prefix || ''}
              onChange={(value) => onUpdate({ prefix: value as string })}
              placeholder="Ex: Página"
            />
            <LabeledInput
              label="Sufixo"
              value={(element as PageNumberElement).suffix || ''}
              onChange={(value) => onUpdate({ suffix: value as string })}
              placeholder="Ex: de {totalPages}"
            />
          </CollapsibleSection>

          <CollapsibleSection title="Estilo">
            <LabeledSelect
              label="Família"
              value={(element as PageNumberElement).fontFamily || 'Arial'}
              onChange={(value) => onUpdate({ fontFamily: value })}
              options={[
                { label: 'Arial', value: 'Arial' },
                { label: 'Times New Roman', value: 'Times New Roman' },
                { label: 'Courier New', value: 'Courier New' }
              ]}
            />
            <LabeledInput
              label="Tamanho (pt)"
              type="number"
              value={(element as PageNumberElement).fontSize || 12}
              onChange={(value) => onUpdate({ fontSize: value as number })}
              min={6}
              max={72}
              step={1}
            />
            <ColorPicker
              label="Cor"
              value={(element as PageNumberElement).color || '#000000'}
              onChange={(value) => onUpdate({ color: value })}
            />
          </CollapsibleSection>
        </>
      )}

      {element.type === 'date' && (
        <>
          <CollapsibleSection title="Data" defaultOpen>
            <LabeledInput
              label="Formato"
              value={(element as DateElement).format || 'dd/MM/yyyy'}
              onChange={(value) => onUpdate({ format: value as string })}
              placeholder="dd/MM/yyyy"
            />
            <Toggle
              label="Usar data atual"
              checked={(element as DateElement).useCurrentDate || false}
              onChange={(checked) => onUpdate({ useCurrentDate: checked })}
            />
          </CollapsibleSection>

          <CollapsibleSection title="Estilo">
            <LabeledSelect
              label="Família"
              value={(element as DateElement).fontFamily || 'Arial'}
              onChange={(value) => onUpdate({ fontFamily: value })}
              options={[
                { label: 'Arial', value: 'Arial' },
                { label: 'Times New Roman', value: 'Times New Roman' },
                { label: 'Courier New', value: 'Courier New' }
              ]}
            />
            <LabeledInput
              label="Tamanho (pt)"
              type="number"
              value={(element as DateElement).fontSize || 12}
              onChange={(value) => onUpdate({ fontSize: value as number })}
              min={6}
              max={72}
              step={1}
            />
            <ColorPicker
              label="Cor"
              value={(element as DateElement).color || '#000000'}
              onChange={(value) => onUpdate({ color: value })}
            />
          </CollapsibleSection>
        </>
      )}
    </div>
  );
}

// Painel principal
export function PropertiesPanel({
  element,
  pageSettings,
  variables,
  onUpdateElement,
  onUpdatePageSettings,
  onDeleteElement,
  onDuplicateElement,
  onLockElement
}: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('propriedades');

  const hasNoElement = !element;

  return (
    <div className="w-[280px] bg-[#1a1a1a] border-l border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700">
        <h2 className="text-sm font-semibold text-white">
          {hasNoElement ? 'Configurações da página' : 'Propriedades do elemento'}
        </h2>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 overflow-y-auto">
        {hasNoElement ? (
          <div className="p-3">
            <PageSettingsPanel
              settings={pageSettings}
              onUpdate={onUpdatePageSettings}
            />
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-gray-700 sticky top-0 bg-[#1a1a1a] z-10">
              {(['propriedades', 'posicao', 'estilo'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'text-blue-400 border-blue-500'
                      : 'text-gray-400 border-transparent hover:text-gray-300'
                  }`}
                >
                  {tab === 'propriedades' && 'Propriedades'}
                  {tab === 'posicao' && 'Posição'}
                  {tab === 'estilo' && 'Estilo'}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="p-3">
              {activeTab === 'propriedades' && (
                <ElementPropertiesPanel
                  element={element}
                  variables={variables}
                  onUpdate={onUpdateElement}
                />
              )}

              {activeTab === 'posicao' && (
                <div className="space-y-2">
                  <CollapsibleSection title="Posição e tamanho" defaultOpen>
                    <div className="grid grid-cols-2 gap-2">
                      <LabeledInput
                        label="X (mm)"
                        type="number"
                        value={element.x || 0}
                        onChange={(value) => onUpdateElement({ x: value as number })}
                        step={0.5}
                      />
                      <LabeledInput
                        label="Y (mm)"
                        type="number"
                        value={element.y || 0}
                        onChange={(value) => onUpdateElement({ y: value as number })}
                        step={0.5}
                      />
                      <LabeledInput
                        label="Largura (mm)"
                        type="number"
                        value={element.width || 0}
                        onChange={(value) => onUpdateElement({ width: value as number })}
                        min={1}
                        step={0.5}
                      />
                      <LabeledInput
                        label="Altura (mm)"
                        type="number"
                        value={element.height || 0}
                        onChange={(value) => onUpdateElement({ height: value as number })}
                        min={1}
                        step={0.5}
                      />
                    </div>
                  </CollapsibleSection>

                  <CollapsibleSection title="Transformação">
                    <LabeledInput
                      label="Rotação (°)"
                      type="number"
                      value={element.rotation || 0}
                      onChange={(value) => onUpdateElement({ rotation: value as number })}
                      min={-360}
                      max={360}
                      step={1}
                    />
                    <LabeledInput
                      label="Z-Index"
                      type="number"
                      value={element.zIndex || 0}
                      onChange={(value) => onUpdateElement({ zIndex: value as number })}
                      step={1}
                    />
                  </CollapsibleSection>
                </div>
              )}

              {activeTab === 'estilo' && (
                <div className="space-y-2">
                  <CollapsibleSection title="Aparência geral" defaultOpen>
                    <ColorPicker
                      label="Cor de fundo"
                      value={element.backgroundColor || ''}
                      onChange={(value) => onUpdateElement({ backgroundColor: value })}
                    />
                  </CollapsibleSection>

                  <CollapsibleSection title="Fronteira">
                    <LabeledInput
                      label="Largura (mm)"
                      type="number"
                      value={element.borderWidth || 0}
                      onChange={(value) => onUpdateElement({ borderWidth: value as number })}
                      min={0}
                      step={0.1}
                    />
                    <ColorPicker
                      label="Cor"
                      value={element.borderColor || '#000000'}
                      onChange={(value) => onUpdateElement({ borderColor: value })}
                    />
                    <LabeledSelect
                      label="Estilo"
                      value={element.borderStyle || 'solid'}
                      onChange={(value) => onUpdateElement({ borderStyle: value as any })}
                      options={[
                        { label: 'Sólida', value: 'solid' },
                        { label: 'Tracejada', value: 'dashed' },
                        { label: 'Pontilhada', value: 'dotted' }
                      ]}
                    />
                    <LabeledInput
                      label="Raio (mm)"
                      type="number"
                      value={element.borderRadius || 0}
                      onChange={(value) => onUpdateElement({ borderRadius: value as number })}
                      min={0}
                      step={0.1}
                    />
                  </CollapsibleSection>

                  <CollapsibleSection title="Sombra">
                    <Toggle
                      label="Ativar sombra"
                      checked={!!element.shadow}
                      onChange={(checked) =>
                        onUpdateElement({
                          shadow: checked
                            ? { color: '#000000', offsetX: 2, offsetY: 2, blur: 4 }
                            : undefined
                        })
                      }
                    />
                    {element.shadow && (
                      <>
                        <ColorPicker
                          label="Cor da sombra"
                          value={element.shadow.color || '#000000'}
                          onChange={(value) =>
                            onUpdateElement({
                              shadow: { ...element.shadow!, color: value }
                            })
                          }
                        />
                        <LabeledInput
                          label="Desvio X (mm)"
                          type="number"
                          value={element.shadow.offsetX || 2}
                          onChange={(value) =>
                            onUpdateElement({
                              shadow: { ...element.shadow!, offsetX: value as number }
                            })
                          }
                          step={0.5}
                        />
                        <LabeledInput
                          label="Desvio Y (mm)"
                          type="number"
                          value={element.shadow.offsetY || 2}
                          onChange={(value) =>
                            onUpdateElement({
                              shadow: { ...element.shadow!, offsetY: value as number }
                            })
                          }
                          step={0.5}
                        />
                        <LabeledInput
                          label="Desfoque (mm)"
                          type="number"
                          value={element.shadow.blur || 4}
                          onChange={(value) =>
                            onUpdateElement({
                              shadow: { ...element.shadow!, blur: value as number }
                            })
                          }
                          min={0}
                          step={0.5}
                        />
                      </>
                    )}
                  </CollapsibleSection>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer com ações */}
      {!hasNoElement && (
        <div className="px-3 py-3 border-t border-gray-700 space-y-2">
          <div className="flex gap-1">
            <button
              onClick={onDuplicateElement}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-300 transition-colors"
              title="Duplicar elemento"
            >
              <Copy size={14} />
            </button>
            <button
              onClick={onLockElement}
              className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs transition-colors ${
                element.locked
                  ? 'bg-blue-900 hover:bg-blue-800 text-blue-300'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
              }`}
              title="Bloquear/desbloquear elemento"
            >
              {element.locked ? <Lock size={14} /> : <LockOpen size={14} />}
            </button>
            <button
              onClick={onDeleteElement}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-red-900 hover:bg-red-800 rounded text-xs text-red-300 transition-colors"
              title="Eliminar elemento"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
