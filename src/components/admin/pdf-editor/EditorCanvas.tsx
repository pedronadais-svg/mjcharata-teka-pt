'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  PDFPage,
  PDFElement,
  HeaderFooterZone,
  PageSettings,
  ElementType,
  TemplateVariable,
  TextStyle,
} from '@/lib/types/pdf-templates';
import { PAGE_DIMENSIONS } from '@/lib/types/pdf-templates';
import {
  Type,
  Image as ImageIcon,
  Square,
  Circle,
  Minus,
  Table as TableIcon,
  QrCode,
  Barcode,
  Variable,
  Hash,
  Calendar,
} from 'lucide-react';

interface EditorCanvasProps {
  page: PDFPage | null;
  header: HeaderFooterZone;
  footer: HeaderFooterZone;
  pageSettings: PageSettings;
  selectedElementId: string | null;
  editingZone: 'page' | 'header' | 'footer';
  zoom: number;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  variables: TemplateVariable[];
  onSelectElement: (elementId: string | null) => void;
  onMoveElement: (elementId: string, x: number, y: number) => void;
  onResizeElement: (
    elementId: string,
    width: number,
    height: number,
    x?: number,
    y?: number
  ) => void;
  onUpdateElement: (elementId: string, updates: Partial<PDFElement>) => void;
  onDropNewElement: (type: ElementType, x: number, y: number) => void;
}

// Escala: 1mm = 3.78px (a 100% zoom)
const MM_TO_PX = 3.78;

type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

interface DragState {
  elementId: string;
  startX: number;
  startY: number;
  initialX: number;
  initialY: number;
  isDragging: boolean;
}

interface ResizeState {
  elementId: string;
  startX: number;
  startY: number;
  initialX: number;
  initialY: number;
  initialWidth: number;
  initialHeight: number;
  handle: ResizeHandle;
  isResizing: boolean;
}

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
  page,
  header,
  footer,
  pageSettings,
  selectedElementId,
  editingZone,
  zoom,
  showGrid,
  snapToGrid,
  gridSize,
  variables,
  onSelectElement,
  onMoveElement,
  onResizeElement,
  onUpdateElement,
  onDropNewElement,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [resizeState, setResizeState] = useState<ResizeState | null>(null);

  // Obter dimensões da página em mm e converter para px
  const getPageDimensions = useCallback(() => {
    const size = pageSettings.size || 'A4';
    const orientation = pageSettings.orientation || 'portrait';
    const dimensions = PAGE_DIMENSIONS[size][orientation];
    return {
      widthMm: dimensions.width,
      heightMm: dimensions.height,
      widthPx: dimensions.width * MM_TO_PX * zoom,
      heightPx: dimensions.height * MM_TO_PX * zoom,
    };
  }, [pageSettings, zoom]);

  // Aplicar snapping à grid se habilitado
  const snapValue = useCallback(
    (value: number, gridSize: number): number => {
      if (!snapToGrid) return value;
      const gridPx = gridSize * MM_TO_PX * zoom;
      return Math.round(value / gridPx) * gridPx;
    },
    [snapToGrid, zoom]
  );

  // Converter px para mm, considerando zoom
  const pxToMm = useCallback(
    (px: number): number => {
      return px / (MM_TO_PX * zoom);
    },
    [zoom]
  );

  // Converter mm para px, considerando zoom
  const mmToPx = useCallback(
    (mm: number): number => {
      return mm * MM_TO_PX * zoom;
    },
    [zoom]
  );

  // Obter dimensões das zonas
  const getZoneDimensions = useCallback(() => {
    const pageDim = getPageDimensions();
    const headerHeightPx = mmToPx(header.height || 20);
    const footerHeightPx = mmToPx(footer.height || 20);

    return {
      headerHeightPx,
      footerHeightPx,
      contentHeightPx: pageDim.heightPx - headerHeightPx - footerHeightPx,
    };
  }, [header, footer, getPageDimensions, mmToPx]);

  // Renderizar ícone de tipo de elemento
  const getElementIcon = (type: ElementType) => {
    switch (type) {
      case 'text':
        return <Type size={16} />;
      case 'image':
      case 'logo':
        return <ImageIcon size={16} />;
      case 'rectangle':
        return <Square size={16} />;
      case 'circle':
        return <Circle size={16} />;
      case 'line':
        return <Minus size={16} />;
      case 'table':
        return <TableIcon size={16} />;
      case 'qrcode':
        return <QrCode size={16} />;
      case 'barcode':
        return <Barcode size={16} />;
      case 'variable':
        return <Variable size={16} />;
      case 'page-number':
        return <Hash size={16} />;
      case 'date':
        return <Calendar size={16} />;
      default:
        return <Square size={16} />;
    }
  };

  // Renderizar conteúdo do elemento
  const renderElementContent = (element: PDFElement) => {
    const style = element.textStyle || ({} as TextStyle);

    switch (element.type) {
      case 'text':
        return (
          <div
            style={{
              fontSize: `${mmToPx((style.fontSize || 12) / 4)}px`,
              fontFamily: style.fontFamily || 'Arial',
              color: style.color || '#000000',
              fontWeight: style.bold ? 'bold' : 'normal',
              fontStyle: style.italic ? 'italic' : 'normal',
              textDecoration: style.underline ? 'underline' : 'none',
              textAlign: (style.alignment || 'left') as any,
              overflow: 'hidden',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
            }}
            className="p-1"
          >
            {element.content || 'Texto'}
          </div>
        );

      case 'image':
      case 'logo':
        return (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 border border-gray-300">
            {element.imageUrl ? (
              <img
                src={element.imageUrl}
                alt="Imagem"
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon size={32} className="text-gray-400" />
            )}
          </div>
        );

      case 'rectangle':
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: element.backgroundColor || 'transparent',
              border: `${element.borderWidth || 1}px solid ${element.borderColor || '#000000'}`,
            }}
          />
        );

      case 'circle':
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: element.backgroundColor || 'transparent',
              border: `${element.borderWidth || 1}px solid ${element.borderColor || '#000000'}`,
              borderRadius: '50%',
            }}
          />
        );

      case 'line':
        return (
          <div
            style={{
              width: '100%',
              height: '100%',
              borderBottom: `${element.borderWidth || 1}px solid ${element.borderColor || '#000000'}`,
            }}
          />
        );

      case 'table':
        const rows = element.tableRows || 2;
        const cols = element.tableColumns || 2;
        return (
          <table
            style={{
              width: '100%',
              height: '100%',
              borderCollapse: 'collapse',
              border: `1px solid ${element.borderColor || '#000000'}`,
              fontSize: `${mmToPx(10 / 4)}px`,
            }}
          >
            <tbody>
              {Array.from({ length: rows }).map((_, rowIdx) => (
                <tr key={rowIdx}>
                  {Array.from({ length: cols }).map((_, colIdx) => (
                    <td
                      key={`${rowIdx}-${colIdx}`}
                      style={{
                        border: `1px solid ${element.borderColor || '#000000'}`,
                        padding: '4px',
                      }}
                    >
                      {rowIdx === 0 && colIdx === 0 ? 'Cabeçalho' : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'qrcode':
        return (
          <div className="w-full h-full flex items-center justify-center bg-white border border-gray-300">
            <div className="text-center">
              <QrCode size={32} className="mx-auto text-gray-400 mb-1" />
              <div className="text-xs text-gray-500">{element.content || 'QR Code'}</div>
            </div>
          </div>
        );

      case 'barcode':
        return (
          <div className="w-full h-full flex items-center justify-center bg-white border border-gray-300">
            <div className="text-center">
              <Barcode size={32} className="mx-auto text-gray-400 mb-1" />
              <div className="text-xs text-gray-500">{element.content || 'Código de barras'}</div>
            </div>
          </div>
        );

      case 'variable':
        const varName = element.content || 'variável';
        return (
          <div
            style={{
              fontSize: `${mmToPx(12 / 4)}px`,
              color: '#666666',
              fontFamily: 'monospace',
              backgroundColor: '#f0f0f0',
              padding: '2px 4px',
            }}
            className="truncate"
          >
            {`{{${varName}}}`}
          </div>
        );

      case 'page-number':
        return (
          <div
            style={{
              fontSize: `${mmToPx(12 / 4)}px`,
              color: '#666666',
              fontFamily: 'Arial',
            }}
          >
            1 / N
          </div>
        );

      case 'date':
        return (
          <div
            style={{
              fontSize: `${mmToPx(12 / 4)}px`,
              color: '#666666',
              fontFamily: 'Arial',
            }}
          >
            {new Date().toLocaleDateString('pt-PT')}
          </div>
        );

      default:
        return <div>Elemento desconhecido</div>;
    }
  };

  // Manipuladores de arrasto
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, elementId: string) => {
      if (e.button !== 0) return; // Apenas botão esquerdo
      e.preventDefault();
      e.stopPropagation();

      if (paperRef.current) {
        const rect = paperRef.current.getBoundingClientRect();
        setDragState({
          elementId,
          startX: e.clientX,
          startY: e.clientY,
          initialX: e.clientX - rect.left,
          initialY: e.clientY - rect.top,
          isDragging: true,
        });
      }

      onSelectElement(elementId);
    },
    [onSelectElement]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (dragState && dragState.isDragging) {
        if (!paperRef.current) return;

        const rect = paperRef.current.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        const deltaXPx = currentX - dragState.initialX;
        const deltaYPx = currentY - dragState.initialY;

        const element = page?.elements.find((el) => el.id === dragState.elementId);
        if (!element) return;

        let newX = element.x + pxToMm(deltaXPx);
        let newY = element.y + pxToMm(deltaYPx);

        if (snapToGrid) {
          newX = snapValue(newX * MM_TO_PX * zoom, gridSize) / (MM_TO_PX * zoom);
          newY = snapValue(newY * MM_TO_PX * zoom, gridSize) / (MM_TO_PX * zoom);
        }

        // Limitar à página
        newX = Math.max(0, Math.min(newX, getPageDimensions().widthMm - element.width));
        newY = Math.max(0, Math.min(newY, getPageDimensions().heightMm - element.height));

        setDragState((prev) =>
          prev
            ? {
                ...prev,
                initialX: currentX,
                initialY: currentY,
              }
            : null
        );

        onMoveElement(dragState.elementId, newX, newY);
      }

      if (resizeState && resizeState.isResizing) {
        if (!paperRef.current) return;

        const rect = paperRef.current.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        const deltaXPx = currentX - resizeState.startX;
        const deltaYPx = currentY - resizeState.startY;

        const deltaXMm = pxToMm(deltaXPx);
        const deltaYMm = pxToMm(deltaYPx);

        let newWidth = resizeState.initialWidth;
        let newHeight = resizeState.initialHeight;
        let newX = resizeState.initialX;
        let newY = resizeState.initialY;

        const MIN_SIZE = 5; // mm

        // Calcular novas dimensões baseadas no handle
        if (
          resizeState.handle === 'e' ||
          resizeState.handle === 'se' ||
          resizeState.handle === 'ne'
        ) {
          newWidth = Math.max(MIN_SIZE, resizeState.initialWidth + deltaXMm);
        }
        if (
          resizeState.handle === 'w' ||
          resizeState.handle === 'sw' ||
          resizeState.handle === 'nw'
        ) {
          newWidth = Math.max(MIN_SIZE, resizeState.initialWidth - deltaXMm);
          newX = resizeState.initialX + (resizeState.initialWidth - newWidth);
        }
        if (
          resizeState.handle === 's' ||
          resizeState.handle === 'se' ||
          resizeState.handle === 'sw'
        ) {
          newHeight = Math.max(MIN_SIZE, resizeState.initialHeight + deltaYMm);
        }
        if (
          resizeState.handle === 'n' ||
          resizeState.handle === 'ne' ||
          resizeState.handle === 'nw'
        ) {
          newHeight = Math.max(MIN_SIZE, resizeState.initialHeight - deltaYMm);
          newY = resizeState.initialY + (resizeState.initialHeight - newHeight);
        }

        if (snapToGrid) {
          newWidth = snapValue(newWidth * MM_TO_PX * zoom, gridSize) / (MM_TO_PX * zoom);
          newHeight = snapValue(newHeight * MM_TO_PX * zoom, gridSize) / (MM_TO_PX * zoom);
          newX = snapValue(newX * MM_TO_PX * zoom, gridSize) / (MM_TO_PX * zoom);
          newY = snapValue(newY * MM_TO_PX * zoom, gridSize) / (MM_TO_PX * zoom);
        }

        onResizeElement(resizeState.elementId, newWidth, newHeight, newX, newY);
      }
    },
    [dragState, resizeState, page, pxToMm, snapValue, snapToGrid, gridSize, onMoveElement, onResizeElement, getPageDimensions, zoom]
  );

  const handleMouseUp = useCallback(() => {
    setDragState((prev) =>
      prev ? { ...prev, isDragging: false } : null
    );
    setResizeState((prev) =>
      prev ? { ...prev, isResizing: false } : null
    );
  }, []);

  // Event listeners para drag global
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleResizeHandleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, elementId: string, handle: ResizeHandle) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();

      const element = page?.elements.find((el) => el.id === elementId);
      if (!element || !paperRef.current) return;

      const rect = paperRef.current.getBoundingClientRect();

      setResizeState({
        elementId,
        startX: e.clientX - rect.left,
        startY: e.clientY - rect.top,
        initialX: element.x,
        initialY: element.y,
        initialWidth: element.width,
        initialHeight: element.height,
        handle,
        isResizing: true,
      });

      onSelectElement(elementId);
    },
    [page, onSelectElement]
  );

  const handlePaperClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onSelectElement(null);
      }
    },
    [onSelectElement]
  );

  const pageDim = getPageDimensions();
  const zoneDim = getZoneDimensions();

  const gridPx = gridSize * MM_TO_PX * zoom;
  const gridBackground =
    showGrid && gridPx > 2
      ? `linear-gradient(0deg, transparent calc(100% - 1px), #d3d3d3 calc(100% - 1px)),
         linear-gradient(90deg, transparent calc(100% - 1px), #d3d3d3 calc(100% - 1px))`
      : 'transparent';

  const gridSize_ = `${gridPx}px`;

  return (
    <div
      ref={canvasRef}
      className="flex-1 overflow-auto bg-gray-700"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      {/* Papel/página */}
      <div
        ref={paperRef}
        onClick={handlePaperClick}
        style={{
          width: pageDim.widthPx,
          height: pageDim.heightPx,
          backgroundColor: 'white',
          position: 'relative',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
        }}
      >
        {/* Zona de cabeçalho */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: zoneDim.headerHeightPx,
            backgroundColor: editingZone === 'header' ? 'rgba(173, 216, 230, 0.3)' : 'transparent',
            borderBottom: '2px dashed #ccc',
            boxSizing: 'border-box',
            border: editingZone === 'header' ? '2px solid #87ceeb' : 'none',
          }}
        >
          {/* Elementos de cabeçalho */}
          {header.elements?.map((element) => (
            <div
              key={element.id}
              onClick={() => onSelectElement(element.id)}
              onMouseDown={(e) => handleMouseDown(e, element.id)}
              style={{
                position: 'absolute',
                left: mmToPx(element.x),
                top: mmToPx(element.y),
                width: mmToPx(element.width),
                height: mmToPx(element.height),
                cursor: 'move',
                border: selectedElementId === element.id ? '2px solid #2563eb' : 'none',
                boxSizing: 'border-box',
              }}
              className="group"
            >
              {renderElementContent(element)}

              {/* Badge do nome do elemento */}
              {selectedElementId === element.id && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-24px',
                    left: 0,
                    backgroundColor: '#2563eb',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontSize: '11px',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {getElementIcon(element.type)}
                  {element.name}
                </div>
              )}

              {/* Handles de redimensionamento */}
              {selectedElementId === element.id && (
                <>
                  {(['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'] as ResizeHandle[]).map((handle) => {
                    const handlePos = {
                      nw: { top: '-4px', left: '-4px' },
                      ne: { top: '-4px', right: '-4px' },
                      sw: { bottom: '-4px', left: '-4px' },
                      se: { bottom: '-4px', right: '-4px' },
                      n: { top: '-4px', left: '50%', transform: 'translateX(-50%)' },
                      s: { bottom: '-4px', left: '50%', transform: 'translateX(-50%)' },
                      e: { top: '50%', right: '-4px', transform: 'translateY(-50%)' },
                      w: { top: '50%', left: '-4px', transform: 'translateY(-50%)' },
                    };

                    const cursorMap: Record<ResizeHandle, string> = {
                      nw: 'nwse-resize',
                      ne: 'nesw-resize',
                      sw: 'nesw-resize',
                      se: 'nwse-resize',
                      n: 'ns-resize',
                      s: 'ns-resize',
                      e: 'ew-resize',
                      w: 'ew-resize',
                    };

                    return (
                      <div
                        key={handle}
                        onMouseDown={(e) => handleResizeHandleMouseDown(e, element.id, handle)}
                        style={{
                          position: 'absolute',
                          ...handlePos[handle],
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#2563eb',
                          border: '1px solid white',
                          borderRadius: '1px',
                          cursor: cursorMap[handle],
                        }}
                      />
                    );
                  })}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Grid background */}
        <div
          style={{
            position: 'absolute',
            top: zoneDim.headerHeightPx,
            left: 0,
            right: 0,
            height: zoneDim.contentHeightPx,
            background: gridBackground,
            backgroundSize: gridSize_,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />

        {/* Zona de conteúdo principal */}
        <div
          style={{
            position: 'absolute',
            top: zoneDim.headerHeightPx,
            left: 0,
            right: 0,
            height: zoneDim.contentHeightPx,
            backgroundColor: editingZone === 'page' ? 'rgba(255, 255, 255, 0.5)' : 'transparent',
            boxSizing: 'border-box',
            border: editingZone === 'page' ? '2px solid #fbbf24' : 'none',
            borderTop: 'none',
            borderBottom: 'none',
            zIndex: 1,
          }}
        >
          {/* Elementos da página */}
          {page?.elements?.map((element) => (
            <div
              key={element.id}
              onClick={() => onSelectElement(element.id)}
              onMouseDown={(e) => handleMouseDown(e, element.id)}
              style={{
                position: 'absolute',
                left: mmToPx(element.x),
                top: zoneDim.headerHeightPx + mmToPx(element.y),
                width: mmToPx(element.width),
                height: mmToPx(element.height),
                cursor: 'move',
                border: selectedElementId === element.id ? '2px solid #2563eb' : 'none',
                boxSizing: 'border-box',
                zIndex: 2,
              }}
              className="group"
            >
              {renderElementContent(element)}

              {/* Badge do nome */}
              {selectedElementId === element.id && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-24px',
                    left: 0,
                    backgroundColor: '#2563eb',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontSize: '11px',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {getElementIcon(element.type)}
                  {element.name}
                </div>
              )}

              {/* Handles de redimensionamento */}
              {selectedElementId === element.id && (
                <>
                  {(['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'] as ResizeHandle[]).map((handle) => {
                    const handlePos = {
                      nw: { top: '-4px', left: '-4px' },
                      ne: { top: '-4px', right: '-4px' },
                      sw: { bottom: '-4px', left: '-4px' },
                      se: { bottom: '-4px', right: '-4px' },
                      n: { top: '-4px', left: '50%', transform: 'translateX(-50%)' },
                      s: { bottom: '-4px', left: '50%', transform: 'translateX(-50%)' },
                      e: { top: '50%', right: '-4px', transform: 'translateY(-50%)' },
                      w: { top: '50%', left: '-4px', transform: 'translateY(-50%)' },
                    };

                    const cursorMap: Record<ResizeHandle, string> = {
                      nw: 'nwse-resize',
                      ne: 'nesw-resize',
                      sw: 'nesw-resize',
                      se: 'nwse-resize',
                      n: 'ns-resize',
                      s: 'ns-resize',
                      e: 'ew-resize',
                      w: 'ew-resize',
                    };

                    return (
                      <div
                        key={handle}
                        onMouseDown={(e) => handleResizeHandleMouseDown(e, element.id, handle)}
                        style={{
                          position: 'absolute',
                          ...handlePos[handle],
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#2563eb',
                          border: '1px solid white',
                          borderRadius: '1px',
                          cursor: cursorMap[handle],
                        }}
                      />
                    );
                  })}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Zona de rodapé */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: zoneDim.footerHeightPx,
            backgroundColor: editingZone === 'footer' ? 'rgba(144, 238, 144, 0.3)' : 'transparent',
            borderTop: '2px dashed #ccc',
            boxSizing: 'border-box',
            border: editingZone === 'footer' ? '2px solid #86efac' : 'none',
            zIndex: 1,
          }}
        >
          {/* Elementos de rodapé */}
          {footer.elements?.map((element) => (
            <div
              key={element.id}
              onClick={() => onSelectElement(element.id)}
              onMouseDown={(e) => handleMouseDown(e, element.id)}
              style={{
                position: 'absolute',
                left: mmToPx(element.x),
                top: mmToPx(element.y),
                width: mmToPx(element.width),
                height: mmToPx(element.height),
                cursor: 'move',
                border: selectedElementId === element.id ? '2px solid #2563eb' : 'none',
                boxSizing: 'border-box',
              }}
              className="group"
            >
              {renderElementContent(element)}

              {/* Badge do nome */}
              {selectedElementId === element.id && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-24px',
                    left: 0,
                    backgroundColor: '#2563eb',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontSize: '11px',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {getElementIcon(element.type)}
                  {element.name}
                </div>
              )}

              {/* Handles de redimensionamento */}
              {selectedElementId === element.id && (
                <>
                  {(['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'] as ResizeHandle[]).map((handle) => {
                    const handlePos = {
                      nw: { top: '-4px', left: '-4px' },
                      ne: { top: '-4px', right: '-4px' },
                      sw: { bottom: '-4px', left: '-4px' },
                      se: { bottom: '-4px', right: '-4px' },
                      n: { top: '-4px', left: '50%', transform: 'translateX(-50%)' },
                      s: { bottom: '-4px', left: '50%', transform: 'translateX(-50%)' },
                      e: { top: '50%', right: '-4px', transform: 'translateY(-50%)' },
                      w: { top: '50%', left: '-4px', transform: 'translateY(-50%)' },
                    };

                    const cursorMap: Record<ResizeHandle, string> = {
                      nw: 'nwse-resize',
                      ne: 'nesw-resize',
                      sw: 'nesw-resize',
                      se: 'nwse-resize',
                      n: 'ns-resize',
                      s: 'ns-resize',
                      e: 'ew-resize',
                      w: 'ew-resize',
                    };

                    return (
                      <div
                        key={handle}
                        onMouseDown={(e) => handleResizeHandleMouseDown(e, element.id, handle)}
                        style={{
                          position: 'absolute',
                          ...handlePos[handle],
                          width: '8px',
                          height: '8px',
                          backgroundColor: '#2563eb',
                          border: '1px solid white',
                          borderRadius: '1px',
                          cursor: cursorMap[handle],
                        }}
                      />
                    );
                  })}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Guias de margem */}
        <div
          style={{
            position: 'absolute',
            top: mmToPx(pageSettings.marginTop || 10),
            left: mmToPx(pageSettings.marginLeft || 10),
            right: mmToPx(pageSettings.marginRight || 10),
            bottom: mmToPx(pageSettings.marginBottom || 10),
            border: '2px dashed #e0e0e0',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      </div>
    </div>
  );
};

export default EditorCanvas;
