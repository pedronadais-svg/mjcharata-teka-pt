'use client';

import React, { useReducer, useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, Plus, Loader2, AlertCircle, RotateCcw, RotateCw } from 'lucide-react';
import { EditorToolbar } from './EditorToolbar';
import EditorCanvas from './EditorCanvas';
import LayersPanel from './LayersPanel';
import { PropertiesPanel } from './PropertiesPanel';
import type {
  PDFTemplate,
  PDFElement,
  PDFPage,
  ElementType,
} from '@/lib/types/pdf-templates';
import {
  DEFAULT_TEXT_STYLE,
  DEFAULT_BORDER,
  TEMPLATE_TYPE_LABELS,
} from '@/lib/types/pdf-templates';

interface PDFTemplateEditorProps {
  templateId: string;
}

interface EditorLocalState {
  template: PDFTemplate | null;
  selectedPageId: string | null;
  selectedElementId: string | null;
  editingZone: 'page' | 'header' | 'footer';
  zoom: number;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  showRulers: boolean;
  undoStack: string[];
  redoStack: string[];
  isDirty: boolean;
  isPreviewing: boolean;
  isSaving: boolean;
  isLoading: boolean;
  error: string | null;
  clipboardElement: PDFElement | null;
  lastSavedTime: number | null;
}

type EditorAction =
  | { type: 'SET_TEMPLATE'; payload: PDFTemplate }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SELECT_PAGE'; payload: string }
  | { type: 'SELECT_ELEMENT'; payload: string | null }
  | { type: 'SET_EDITING_ZONE'; payload: 'page' | 'header' | 'footer' }
  | { type: 'SET_ZOOM'; payload: number }
  | { type: 'TOGGLE_GRID' }
  | { type: 'TOGGLE_SNAP_TO_GRID' }
  | { type: 'TOGGLE_RULERS' }
  | { type: 'TOGGLE_PREVIEW' }
  | { type: 'ADD_ELEMENT'; payload: { type: ElementType; pageId: string } }
  | { type: 'UPDATE_ELEMENT'; payload: { elementId: string; updates: Partial<PDFElement> } }
  | { type: 'DELETE_ELEMENT'; payload: string }
  | { type: 'DUPLICATE_ELEMENT'; payload: string }
  | { type: 'MOVE_ELEMENT'; payload: { elementId: string; x: number; y: number } }
  | { type: 'RESIZE_ELEMENT'; payload: { elementId: string; width: number; height: number } }
  | { type: 'COPY_ELEMENT'; payload: PDFElement }
  | { type: 'PASTE_ELEMENT'; payload: string }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'UPDATE_TEMPLATE_NAME'; payload: string }
  | { type: 'MARK_SAVED' }
  | { type: 'PUSH_UNDO' };

// Default element dimensions (in mm)
const DEFAULT_DIMENSIONS: Record<ElementType, { width: number; height: number }> = {
  text: { width: 80, height: 15 },
  image: { width: 50, height: 50 },
  table: { width: 150, height: 60 },
  rectangle: { width: 60, height: 40 },
  line: { width: 80, height: 1 },
  circle: { width: 30, height: 30 },
  qrcode: { width: 30, height: 30 },
  barcode: { width: 60, height: 20 },
  variable: { width: 60, height: 10 },
  'page-number': { width: 30, height: 8 },
  date: { width: 40, height: 8 },
  logo: { width: 40, height: 20 },
};

const initialState: EditorLocalState = {
  template: null,
  selectedPageId: null,
  selectedElementId: null,
  editingZone: 'page',
  zoom: 100,
  showGrid: true,
  snapToGrid: true,
  gridSize: 5,
  showRulers: true,
  undoStack: [],
  redoStack: [],
  isDirty: false,
  isPreviewing: false,
  isSaving: false,
  isLoading: true,
  error: null,
  clipboardElement: null,
  lastSavedTime: null,
};

function editorReducer(state: EditorLocalState, action: EditorAction): EditorLocalState {
  switch (action.type) {
    case 'SET_TEMPLATE':
      return { ...state, template: action.payload, isLoading: false };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_SAVING':
      return { ...state, isSaving: action.payload };

    case 'SELECT_PAGE':
      return { ...state, selectedPageId: action.payload, selectedElementId: null };

    case 'SELECT_ELEMENT':
      return { ...state, selectedElementId: action.payload };

    case 'SET_EDITING_ZONE':
      return { ...state, editingZone: action.payload, selectedElementId: null };

    case 'SET_ZOOM':
      return { ...state, zoom: Math.max(25, Math.min(200, action.payload)) };

    case 'TOGGLE_GRID':
      return { ...state, showGrid: !state.showGrid };

    case 'TOGGLE_SNAP_TO_GRID':
      return { ...state, snapToGrid: !state.snapToGrid };

    case 'TOGGLE_RULERS':
      return { ...state, showRulers: !state.showRulers };

    case 'TOGGLE_PREVIEW':
      return { ...state, isPreviewing: !state.isPreviewing };

    case 'PUSH_UNDO': {
      if (!state.template) return state;
      return {
        ...state,
        undoStack: [...state.undoStack, JSON.stringify(state.template)],
        redoStack: [],
      };
    }

    case 'ADD_ELEMENT': {
      if (!state.template) return state;
      const templateCopy = JSON.parse(JSON.stringify(state.template)) as PDFTemplate;

      // Determinar onde adicionar o elemento
      let targetElements: PDFElement[];
      if (state.editingZone === 'header') {
        targetElements = templateCopy.header.elements;
      } else if (state.editingZone === 'footer') {
        targetElements = templateCopy.footer.elements;
      } else {
        const page = templateCopy.pages.find((p) => p.id === action.payload.pageId);
        if (!page) return state;
        targetElements = page.elements;
      }

      const dimensions = DEFAULT_DIMENSIONS[action.payload.type];
      const elemType = action.payload.type;

      // Criar propriedades tipadas correctamente
      let properties: PDFElement['properties'];
      switch (elemType) {
        case 'text':
          properties = { type: 'text', data: { content: 'Novo Texto', style: { ...DEFAULT_TEXT_STYLE }, padding: 2 } };
          break;
        case 'variable':
          properties = { type: 'variable', data: { variableName: '', style: { ...DEFAULT_TEXT_STYLE }, fallback: '', padding: 2 } };
          break;
        case 'image':
          properties = { type: 'image', data: { src: '', objectFit: 'contain', opacity: 1 } };
          break;
        case 'logo':
          properties = { type: 'logo', data: { src: '', objectFit: 'contain', opacity: 1 } };
          break;
        case 'rectangle':
          properties = { type: 'rectangle', data: { backgroundColor: '#E5E7EB', border: { ...DEFAULT_BORDER }, opacity: 1 } };
          break;
        case 'circle':
          properties = { type: 'circle', data: { backgroundColor: '#E5E7EB', border: { ...DEFAULT_BORDER }, opacity: 1 } };
          break;
        case 'line':
          properties = { type: 'line', data: { color: '#000000', strokeWidth: 1, strokeStyle: 'solid', startCap: 'none', endCap: 'none' } };
          break;
        case 'table':
          properties = {
            type: 'table',
            data: {
              columns: [
                { id: 'c1', header: 'Coluna 1', width: 33, align: 'left' },
                { id: 'c2', header: 'Coluna 2', width: 34, align: 'left' },
                { id: 'c3', header: 'Coluna 3', width: 33, align: 'left' },
              ],
              rows: [{ id: 'r1', cells: ['', '', ''] }],
              headerStyle: { ...DEFAULT_TEXT_STYLE, fontWeight: 'bold', color: '#FFFFFF' },
              cellStyle: { ...DEFAULT_TEXT_STYLE, fontSize: 9 },
              borderColor: '#D1D5DB',
              borderWidth: 0.5,
              alternateRowColor: '#F9FAFB',
              headerBgColor: '#374151',
              showHeader: true,
            },
          };
          break;
        case 'qrcode':
          properties = { type: 'qrcode', data: { content: 'https://mdv.ao', size: 30, foregroundColor: '#000000', backgroundColor: '#FFFFFF', errorCorrectionLevel: 'M' } };
          break;
        case 'barcode':
          properties = { type: 'barcode', data: { content: '123456789', format: 'CODE128', showText: true, lineColor: '#000000', backgroundColor: '#FFFFFF', height: 20 } };
          break;
        case 'page-number':
          properties = { type: 'page-number', data: { format: 'x-of-y', style: { ...DEFAULT_TEXT_STYLE, fontSize: 9, textAlign: 'center' }, prefix: 'Página ', suffix: '' } };
          break;
        case 'date':
          properties = { type: 'date', data: { format: 'dd/MM/yyyy', style: { ...DEFAULT_TEXT_STYLE, fontSize: 9 }, useCurrentDate: true } };
          break;
        default:
          properties = { type: 'text', data: { content: '', style: { ...DEFAULT_TEXT_STYLE }, padding: 2 } };
      }

      const newElement: PDFElement = {
        id: `elem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        type: elemType,
        name: `${elemType.charAt(0).toUpperCase() + elemType.slice(1)} ${targetElements.length + 1}`,
        x: 20,
        y: 20,
        width: dimensions.width,
        height: dimensions.height,
        rotation: 0,
        locked: false,
        visible: true,
        zIndex: targetElements.length,
        properties,
      };

      targetElements.push(newElement);

      return {
        ...state,
        template: templateCopy,
        undoStack: [...state.undoStack, JSON.stringify(state.template)],
        redoStack: [],
        isDirty: true,
        selectedElementId: newElement.id,
      };
    }

    case 'UPDATE_ELEMENT': {
      if (!state.template) return state;
      const tplCopy = JSON.parse(JSON.stringify(state.template)) as PDFTemplate;

      // Procurar o elemento em todas as zonas
      const findAndUpdate = (elements: PDFElement[]) => {
        const el = elements.find((e) => e.id === action.payload.elementId);
        if (el) Object.assign(el, action.payload.updates);
        return !!el;
      };

      let found = false;
      // Procurar na página actual
      const pg = tplCopy.pages.find((p) => p.id === state.selectedPageId);
      if (pg) found = findAndUpdate(pg.elements);
      // Procurar no header/footer se não encontrado
      if (!found) found = findAndUpdate(tplCopy.header.elements);
      if (!found) findAndUpdate(tplCopy.footer.elements);

      return { ...state, template: tplCopy, isDirty: true };
    }

    case 'DELETE_ELEMENT': {
      if (!state.template) return state;
      const tplCopy = JSON.parse(JSON.stringify(state.template)) as PDFTemplate;

      const removeFrom = (elements: PDFElement[]) => {
        const idx = elements.findIndex((e) => e.id === action.payload);
        if (idx !== -1) { elements.splice(idx, 1); return true; }
        return false;
      };

      let removed = false;
      if (state.editingZone === 'header') {
        removed = removeFrom(tplCopy.header.elements);
      } else if (state.editingZone === 'footer') {
        removed = removeFrom(tplCopy.footer.elements);
      } else {
        const pg = tplCopy.pages.find((p) => p.id === state.selectedPageId);
        if (pg) removed = removeFrom(pg.elements);
      }

      if (!removed) return state;
      return {
        ...state,
        template: tplCopy,
        undoStack: [...state.undoStack, JSON.stringify(state.template)],
        redoStack: [],
        isDirty: true,
        selectedElementId: null,
      };
    }

    case 'DUPLICATE_ELEMENT': {
      if (!state.template) return state;
      const tplCopy = JSON.parse(JSON.stringify(state.template)) as PDFTemplate;

      const duplicateIn = (elements: PDFElement[]) => {
        const el = elements.find((e) => e.id === action.payload);
        if (!el) return null;
        const dup: PDFElement = {
          ...JSON.parse(JSON.stringify(el)),
          id: `elem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          name: `${el.name} (cópia)`,
          x: el.x + 5,
          y: el.y + 5,
        };
        elements.push(dup);
        return dup.id;
      };

      let newId: string | null = null;
      if (state.editingZone === 'header') {
        newId = duplicateIn(tplCopy.header.elements);
      } else if (state.editingZone === 'footer') {
        newId = duplicateIn(tplCopy.footer.elements);
      } else {
        const pg = tplCopy.pages.find((p) => p.id === state.selectedPageId);
        if (pg) newId = duplicateIn(pg.elements);
      }

      if (!newId) return state;
      return {
        ...state,
        template: tplCopy,
        undoStack: [...state.undoStack, JSON.stringify(state.template)],
        redoStack: [],
        isDirty: true,
        selectedElementId: newId,
      };
    }

    case 'MOVE_ELEMENT': {
      if (!state.template) return state;
      const tplCopy = JSON.parse(JSON.stringify(state.template)) as PDFTemplate;

      const moveIn = (elements: PDFElement[]) => {
        const el = elements.find((e) => e.id === action.payload.elementId);
        if (el) { el.x = action.payload.x; el.y = action.payload.y; return true; }
        return false;
      };

      if (state.editingZone === 'header') moveIn(tplCopy.header.elements);
      else if (state.editingZone === 'footer') moveIn(tplCopy.footer.elements);
      else {
        const pg = tplCopy.pages.find((p) => p.id === state.selectedPageId);
        if (pg) moveIn(pg.elements);
      }

      return { ...state, template: tplCopy, isDirty: true };
    }

    case 'RESIZE_ELEMENT': {
      if (!state.template) return state;
      const tplCopy = JSON.parse(JSON.stringify(state.template)) as PDFTemplate;

      const resizeIn = (elements: PDFElement[]) => {
        const el = elements.find((e) => e.id === action.payload.elementId);
        if (el) { el.width = action.payload.width; el.height = action.payload.height; return true; }
        return false;
      };

      if (state.editingZone === 'header') resizeIn(tplCopy.header.elements);
      else if (state.editingZone === 'footer') resizeIn(tplCopy.footer.elements);
      else {
        const pg = tplCopy.pages.find((p) => p.id === state.selectedPageId);
        if (pg) resizeIn(pg.elements);
      }

      return { ...state, template: tplCopy, isDirty: true };
    }

    case 'COPY_ELEMENT': {
      return { ...state, clipboardElement: JSON.parse(JSON.stringify(action.payload)) };
    }

    case 'PASTE_ELEMENT': {
      if (!state.clipboardElement || !state.template) return state;
      const tplCopy = JSON.parse(JSON.stringify(state.template)) as PDFTemplate;

      const pasted: PDFElement = {
        ...JSON.parse(JSON.stringify(state.clipboardElement)),
        id: `elem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        x: state.clipboardElement.x + 10,
        y: state.clipboardElement.y + 10,
      };

      if (state.editingZone === 'header') tplCopy.header.elements.push(pasted);
      else if (state.editingZone === 'footer') tplCopy.footer.elements.push(pasted);
      else {
        const pg = tplCopy.pages.find((p) => p.id === state.selectedPageId);
        if (pg) pg.elements.push(pasted);
      }

      return {
        ...state,
        template: tplCopy,
        undoStack: [...state.undoStack, JSON.stringify(state.template)],
        redoStack: [],
        isDirty: true,
        selectedElementId: pasted.id,
      };
    }

    case 'UNDO': {
      if (state.undoStack.length === 0 || !state.template) return state;
      const newRedoStack = [...state.redoStack, JSON.stringify(state.template)];
      const lastUndo = state.undoStack[state.undoStack.length - 1];
      const newTemplate = JSON.parse(lastUndo) as PDFTemplate;

      return {
        ...state,
        template: newTemplate,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: newRedoStack,
        isDirty: true,
        selectedElementId: null,
      };
    }

    case 'REDO': {
      if (state.redoStack.length === 0) return state;
      const newUndoStack = [
        ...state.undoStack,
        JSON.stringify(state.template),
      ];
      const lastRedo = state.redoStack[state.redoStack.length - 1];
      const newTemplate = JSON.parse(lastRedo) as PDFTemplate;

      return {
        ...state,
        template: newTemplate,
        undoStack: newUndoStack,
        redoStack: state.redoStack.slice(0, -1),
        isDirty: true,
        selectedElementId: null,
      };
    }

    case 'UPDATE_TEMPLATE_NAME': {
      if (!state.template) return state;
      return {
        ...state,
        template: { ...state.template, name: action.payload },
        isDirty: true,
      };
    }

    case 'MARK_SAVED': {
      return { ...state, isDirty: false, lastSavedTime: Date.now() };
    }

    default:
      return state;
  }
}

export default function PDFTemplateEditor({ templateId }: PDFTemplateEditorProps) {
  const [state, dispatch] = useReducer(editorReducer, initialState);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [editingTemplateName, setEditingTemplateName] = useState(false);

  // Fetch template on mount
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const response = await fetch(`/api/admin/templates/${templateId}`);

        if (!response.ok) {
          throw new Error('Falha ao carregar modelo');
        }

        const template: PDFTemplate = await response.json();
        dispatch({ type: 'SET_TEMPLATE', payload: template });

        // Select first page
        if (template.pages.length > 0) {
          dispatch({ type: 'SELECT_PAGE', payload: template.pages[0].id });
        }
      } catch (error) {
        dispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Erro desconhecido',
        });
      }
    };

    fetchTemplate();
  }, [templateId]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!state.template || state.isSaving) return;

    try {
      dispatch({ type: 'SET_SAVING', payload: true });

      const response = await fetch(`/api/admin/templates/${templateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.template),
      });

      if (!response.ok) {
        throw new Error('Falha ao guardar modelo');
      }

      dispatch({ type: 'MARK_SAVED' });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'Erro ao guardar',
      });
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  }, [state.template, state.isSaving, templateId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S - Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }

      // Ctrl+Z - Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: 'UNDO' });
      }

      // Ctrl+Shift+Z / Ctrl+Y - Redo
      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') ||
        ((e.ctrlKey || e.metaKey) && e.key === 'y')
      ) {
        e.preventDefault();
        dispatch({ type: 'REDO' });
      }

      // Delete / Backspace - Delete selected element
      if ((e.key === 'Delete' || e.key === 'Backspace') && state.selectedElementId) {
        e.preventDefault();
        dispatch({ type: 'DELETE_ELEMENT', payload: state.selectedElementId });
      }

      // Ctrl+D - Duplicate
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && state.selectedElementId) {
        e.preventDefault();
        dispatch({ type: 'DUPLICATE_ELEMENT', payload: state.selectedElementId });
      }

      // Ctrl+C - Copy
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && state.selectedElementId && state.template) {
        e.preventDefault();
        // Procurar elemento na zona activa
        let elements: PDFElement[] = [];
        if (state.editingZone === 'header') elements = state.template.header.elements;
        else if (state.editingZone === 'footer') elements = state.template.footer.elements;
        else {
          const page = state.template.pages.find((p) => p.id === state.selectedPageId);
          if (page) elements = page.elements;
        }
        const element = elements.find((el) => el.id === state.selectedElementId);
        if (element) {
          dispatch({ type: 'COPY_ELEMENT', payload: element });
        }
      }

      // Ctrl+V - Paste
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && state.clipboardElement) {
        e.preventDefault();
        dispatch({ type: 'PASTE_ELEMENT', payload: state.selectedPageId || '' });
      }

      // Escape - Deselect / Close preview
      if (e.key === 'Escape') {
        if (state.isPreviewing) {
          dispatch({ type: 'TOGGLE_PREVIEW' });
        } else {
          dispatch({ type: 'SELECT_ELEMENT', payload: null });
        }
      }

      // + / - Zoom
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        dispatch({ type: 'SET_ZOOM', payload: state.zoom + 10 });
      }

      if (e.key === '-') {
        e.preventDefault();
        dispatch({ type: 'SET_ZOOM', payload: state.zoom - 10 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, handleSave]);

  // Format last saved time
  const getLastSavedText = () => {
    if (!state.lastSavedTime) return 'Alterações por guardar';
    const diffMs = Date.now() - state.lastSavedTime;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins === 0) return 'Guardado agora';
    if (diffMins === 1) return 'Guardado há 1 minuto';
    return `Guardado há ${diffMins} minutos`;
  };

  if (state.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Carregando modelo...</p>
        </div>
      </div>
    );
  }

  if (state.error && !state.template) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-6 shadow">
          <AlertCircle className="h-8 w-8 text-red-600" />
          <p className="text-gray-700">{state.error}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  if (!state.template) {
    return null;
  }

  // Derivar dados para os sub-componentes
  const currentPage = state.template.pages.find((p) => p.id === state.selectedPageId) || null;

  // Encontrar o elemento seleccionado na zona activa
  const findSelectedElement = (): PDFElement | null => {
    if (!state.selectedElementId) return null;
    let elements: PDFElement[] = [];
    if (state.editingZone === 'header') {
      elements = state.template!.header.elements;
    } else if (state.editingZone === 'footer') {
      elements = state.template!.footer.elements;
    } else if (currentPage) {
      elements = currentPage.elements;
    }
    return elements.find((el) => el.id === state.selectedElementId) || null;
  };

  const selectedElement = findSelectedElement();

  return (
    <div className="flex h-screen flex-col bg-gray-100">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <a
            href="/admin/templates-pdf"
            className="text-gray-600 hover:text-gray-900"
            title="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </a>

          {editingTemplateName ? (
            <input
              autoFocus
              value={state.template.name}
              onChange={(e) => dispatch({ type: 'UPDATE_TEMPLATE_NAME', payload: e.target.value })}
              onBlur={() => setEditingTemplateName(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setEditingTemplateName(false);
              }}
              className="rounded border px-2 py-1 font-semibold"
            />
          ) : (
            <h1
              onClick={() => setEditingTemplateName(true)}
              className="cursor-pointer font-semibold text-gray-900 hover:text-blue-600"
            >
              {state.template.name}
            </h1>
          )}

          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
            {TEMPLATE_TYPE_LABELS[state.template.type] || state.template.type}
          </span>

          <span className="text-xs text-gray-400">v{state.template.version}</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {state.isDirty ? '● Alterações por guardar' : getLastSavedText()}
          </span>
        </div>
      </div>

      {/* Toolbar — passa props compatíveis com EditorToolbarProps */}
      <EditorToolbar
        onAddElement={(type) => {
          if (state.selectedPageId) {
            dispatch({
              type: 'ADD_ELEMENT',
              payload: { type, pageId: state.selectedPageId },
            });
          }
        }}
        zoom={state.zoom}
        onZoomChange={(zoom) => dispatch({ type: 'SET_ZOOM', payload: zoom })}
        showGrid={state.showGrid}
        onToggleGrid={() => dispatch({ type: 'TOGGLE_GRID' })}
        snapToGrid={state.snapToGrid}
        onToggleSnap={() => dispatch({ type: 'TOGGLE_SNAP_TO_GRID' })}
        showRulers={state.showRulers}
        onToggleRulers={() => dispatch({ type: 'TOGGLE_RULERS' })}
        onUndo={() => dispatch({ type: 'UNDO' })}
        onRedo={() => dispatch({ type: 'REDO' })}
        canUndo={state.undoStack.length > 0}
        canRedo={state.redoStack.length > 0}
        isDirty={state.isDirty}
        onPreview={() => dispatch({ type: 'TOGGLE_PREVIEW' })}
        onSave={handleSave}
      />

      {/* Main Content */}
      {state.isPreviewing ? (
        <div className="relative flex-1 overflow-hidden bg-gray-900">
          {/* Canvas em modo preview */}
          <EditorCanvas
            page={currentPage}
            header={state.template.header}
            footer={state.template.footer}
            pageSettings={state.template.pageSettings}
            selectedElementId={null}
            editingZone={state.editingZone}
            zoom={state.zoom}
            showGrid={false}
            snapToGrid={false}
            gridSize={state.gridSize}
            variables={state.template.variables}
            onSelectElement={() => {}}
            onMoveElement={() => {}}
            onResizeElement={() => {}}
            onUpdateElement={() => {}}
            onDropNewElement={() => {}}
          />

          <button
            onClick={() => dispatch({ type: 'TOGGLE_PREVIEW' })}
            className="absolute right-4 top-4 rounded bg-white px-4 py-2 text-gray-900 hover:bg-gray-100 shadow-lg"
          >
            Fechar Pré-visualização
          </button>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Layers Panel — passa props compatíveis com LayersPanelProps */}
          <LayersPanel
            pages={state.template.pages}
            header={state.template.header}
            footer={state.template.footer}
            selectedPageId={state.selectedPageId}
            selectedElementId={state.selectedElementId}
            editingZone={state.editingZone}
            onSelectPage={(pageId) => dispatch({ type: 'SELECT_PAGE', payload: pageId })}
            onSelectElement={(elementId) => dispatch({ type: 'SELECT_ELEMENT', payload: elementId })}
            onSetEditingZone={(zone) => dispatch({ type: 'SET_EDITING_ZONE', payload: zone })}
            onAddPage={() => {
              // Adicionar nova página ao template
              if (!state.template) return;
              const newPage: PDFPage = {
                id: `page_${Date.now()}`,
                name: `Página ${state.template.pages.length + 1}`,
                order: state.template.pages.length,
                elements: [],
              };
              dispatch({
                type: 'SET_TEMPLATE',
                payload: {
                  ...state.template,
                  pages: [...state.template.pages, newPage],
                },
              });
              dispatch({ type: 'SELECT_PAGE', payload: newPage.id });
            }}
            onDeletePage={(pageId) => {
              if (!state.template || state.template.pages.length <= 1) return;
              const filtered = state.template.pages.filter((p) => p.id !== pageId);
              dispatch({
                type: 'SET_TEMPLATE',
                payload: { ...state.template, pages: filtered },
              });
              if (state.selectedPageId === pageId && filtered.length > 0) {
                dispatch({ type: 'SELECT_PAGE', payload: filtered[0].id });
              }
            }}
            onReorderElement={(elementId, direction) => {
              // Simplificado — apenas log por agora
              console.log('reorder', elementId, direction);
            }}
            onToggleVisibility={(elementId) => {
              const el = findSelectedElement();
              if (el) {
                dispatch({
                  type: 'UPDATE_ELEMENT',
                  payload: { elementId, updates: { visible: !el.visible } },
                });
              }
            }}
            onLockElement={(elementId) => {
              const el = findSelectedElement();
              if (el) {
                dispatch({
                  type: 'UPDATE_ELEMENT',
                  payload: { elementId, updates: { locked: !el.locked } },
                });
              }
            }}
            onDeleteElement={(elementId) => dispatch({ type: 'DELETE_ELEMENT', payload: elementId })}
            onRenamePage={(pageId, name) => {
              if (!state.template) return;
              const pages = state.template.pages.map((p) =>
                p.id === pageId ? { ...p, name } : p
              );
              dispatch({
                type: 'SET_TEMPLATE',
                payload: { ...state.template, pages },
              });
            }}
          />

          {/* Editor Canvas — passa props compatíveis com EditorCanvasProps */}
          <div ref={canvasRef} className="flex-1 overflow-auto bg-gray-200">
            <EditorCanvas
              page={currentPage}
              header={state.template.header}
              footer={state.template.footer}
              pageSettings={state.template.pageSettings}
              selectedElementId={state.selectedElementId}
              editingZone={state.editingZone}
              zoom={state.zoom}
              showGrid={state.showGrid}
              snapToGrid={state.snapToGrid}
              gridSize={state.gridSize}
              variables={state.template.variables}
              onSelectElement={(elementId) => dispatch({ type: 'SELECT_ELEMENT', payload: elementId })}
              onMoveElement={(elementId, x, y) =>
                dispatch({ type: 'MOVE_ELEMENT', payload: { elementId, x, y } })
              }
              onResizeElement={(elementId, width, height) =>
                dispatch({ type: 'RESIZE_ELEMENT', payload: { elementId, width, height } })
              }
              onUpdateElement={(elementId, updates) =>
                dispatch({ type: 'UPDATE_ELEMENT', payload: { elementId, updates } })
              }
              onDropNewElement={(type, x, y) => {
                if (state.selectedPageId) {
                  dispatch({
                    type: 'ADD_ELEMENT',
                    payload: { type, pageId: state.selectedPageId },
                  });
                }
              }}
            />
          </div>

          {/* Properties Panel — passa props compatíveis com PropertiesPanelProps */}
          <PropertiesPanel
            element={selectedElement}
            pageSettings={state.template.pageSettings}
            variables={state.template.variables}
            onUpdateElement={(updates) => {
              if (state.selectedElementId) {
                dispatch({
                  type: 'UPDATE_ELEMENT',
                  payload: { elementId: state.selectedElementId, updates },
                });
              }
            }}
            onUpdatePageSettings={(updates) => {
              if (!state.template) return;
              dispatch({
                type: 'SET_TEMPLATE',
                payload: {
                  ...state.template,
                  pageSettings: { ...state.template.pageSettings, ...updates },
                },
              });
            }}
            onDeleteElement={() => {
              if (state.selectedElementId) {
                dispatch({ type: 'DELETE_ELEMENT', payload: state.selectedElementId });
              }
            }}
            onDuplicateElement={() => {
              if (state.selectedElementId) {
                dispatch({ type: 'DUPLICATE_ELEMENT', payload: state.selectedElementId });
              }
            }}
            onLockElement={() => {
              if (state.selectedElementId && selectedElement) {
                dispatch({
                  type: 'UPDATE_ELEMENT',
                  payload: {
                    elementId: state.selectedElementId,
                    updates: { locked: !selectedElement.locked },
                  },
                });
              }
            }}
          />
        </div>
      )}

      {/* Error Toast */}
      {state.error && state.template && (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 rounded-lg bg-red-100 px-4 py-3 text-red-800 shadow-lg z-50">
          <AlertCircle className="h-5 w-5" />
          <span>{state.error}</span>
          <button
            onClick={() => dispatch({ type: 'SET_ERROR', payload: null })}
            className="ml-2 font-semibold hover:text-red-900"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
