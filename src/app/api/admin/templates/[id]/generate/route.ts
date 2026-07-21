// ============================================================
// API: Geração de PDF a partir de template
// POST /api/admin/templates/[id]/generate
// Body: { variables: Record<string, any> }
// Returns: PDF file (application/pdf)
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { readStore } from '@/lib/db/json-store';
import type { PDFTemplate, PDFElement, TextStyle } from '@/lib/types/pdf-templates';
import { PAGE_DIMENSIONS } from '@/lib/types/pdf-templates';

const STORE_FILE = 'pdf-templates.json';

// Função auxiliar para substituir variáveis no texto
function replaceVariables(text: string, variables: Record<string, unknown>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, varName) => {
    const value = variables[varName];
    if (value === undefined || value === null) return '';
    return String(value);
  });
}

// Converter mm para pontos PDF (1mm = 2.835pt)
function mmToPt(mm: number): number {
  return mm * 2.835;
}

// Gerar conteúdo pdfmake a partir de um elemento
function elementToContent(element: PDFElement, variables: Record<string, unknown>): Record<string, unknown> | null {
  const props = element.properties;

  switch (props.type) {
    case 'text': {
      const content = replaceVariables(props.data.content, variables);
      return {
        text: content,
        fontSize: props.data.style.fontSize,
        bold: props.data.style.fontWeight === 'bold',
        italics: props.data.style.fontStyle === 'italic',
        color: props.data.style.color,
        alignment: props.data.style.textAlign,
        lineHeight: props.data.style.lineHeight,
        absolutePosition: { x: mmToPt(element.x), y: mmToPt(element.y) },
      };
    }

    case 'variable': {
      const varValue = variables[props.data.variableName];
      const displayValue = varValue !== undefined && varValue !== null
        ? String(varValue)
        : props.data.fallback;
      return {
        text: displayValue,
        fontSize: props.data.style.fontSize,
        bold: props.data.style.fontWeight === 'bold',
        italics: props.data.style.fontStyle === 'italic',
        color: props.data.style.color,
        alignment: props.data.style.textAlign,
        absolutePosition: { x: mmToPt(element.x), y: mmToPt(element.y) },
      };
    }

    case 'table': {
      const tableData = props.data;
      const headers = tableData.columns.map((col) => ({
        text: col.header,
        bold: true,
        fontSize: tableData.headerStyle?.fontSize || 10,
        color: tableData.headerStyle?.color || '#FFFFFF',
        fillColor: tableData.headerBgColor || '#333333',
        alignment: col.align,
      }));

      let bodyRows: Record<string, unknown>[][] = [];

      // Se tem source dinâmico, usar dados das variáveis
      if (tableData.dynamicSource) {
        const arrayData = variables[tableData.dynamicSource];
        if (Array.isArray(arrayData)) {
          bodyRows = arrayData.map((item: Record<string, unknown>, rowIdx: number) =>
            tableData.columns.map((col) => ({
              text: col.field ? String(item[col.field] ?? '') : '',
              fontSize: tableData.cellStyle?.fontSize || 9,
              color: tableData.cellStyle?.color || '#333333',
              fillColor: rowIdx % 2 === 1 ? (tableData.alternateRowColor || '#F5F5F5') : undefined,
              alignment: col.align,
            }))
          );
        }
      } else {
        // Linhas estáticas
        bodyRows = tableData.rows.map((row, rowIdx: number) =>
          row.cells.map((cell, colIdx) => ({
            text: replaceVariables(cell, variables),
            fontSize: tableData.cellStyle?.fontSize || 9,
            color: tableData.cellStyle?.color || '#333333',
            fillColor: rowIdx % 2 === 1 ? (tableData.alternateRowColor || '#F5F5F5') : undefined,
            alignment: tableData.columns[colIdx]?.align || 'left',
          }))
        );
      }

      const tableBody = tableData.showHeader ? [headers, ...bodyRows] : bodyRows;

      return {
        table: {
          headerRows: tableData.showHeader ? 1 : 0,
          widths: tableData.columns.map((col) => `${col.width}%`),
          body: tableBody.length > 0 ? tableBody : [[{ text: '(sem dados)', colSpan: tableData.columns.length }]],
        },
        layout: {
          hLineWidth: () => tableData.borderWidth || 0.5,
          vLineWidth: () => tableData.borderWidth || 0.5,
          hLineColor: () => tableData.borderColor || '#CCCCCC',
          vLineColor: () => tableData.borderColor || '#CCCCCC',
        },
        absolutePosition: { x: mmToPt(element.x), y: mmToPt(element.y) },
      };
    }

    case 'rectangle': {
      return {
        canvas: [
          {
            type: 'rect',
            x: 0,
            y: 0,
            w: mmToPt(element.width),
            h: mmToPt(element.height),
            color: props.data.backgroundColor || '#FFFFFF',
            lineWidth: element.border?.width || 0,
            lineColor: element.border?.color || '#000000',
          },
        ],
        absolutePosition: { x: mmToPt(element.x), y: mmToPt(element.y) },
      };
    }

    case 'line': {
      return {
        canvas: [
          {
            type: 'line',
            x1: 0,
            y1: 0,
            x2: mmToPt(element.width),
            y2: 0,
            lineWidth: props.data.strokeWidth || 1,
            lineColor: props.data.color || '#000000',
            dash: props.data.strokeStyle === 'dashed' ? { length: 5 } : undefined,
          },
        ],
        absolutePosition: { x: mmToPt(element.x), y: mmToPt(element.y) },
      };
    }

    case 'page-number': {
      const prefix = props.data.prefix || '';
      const suffix = props.data.suffix || '';
      return {
        text: `${prefix}1${suffix}`,
        fontSize: props.data.style.fontSize,
        color: props.data.style.color,
        alignment: props.data.style.textAlign,
        absolutePosition: { x: mmToPt(element.x), y: mmToPt(element.y) },
      };
    }

    case 'date': {
      const dateValue = props.data.useCurrentDate
        ? new Date().toLocaleDateString('pt-PT')
        : (variables[props.data.variableName || ''] as string) || new Date().toLocaleDateString('pt-PT');
      return {
        text: dateValue,
        fontSize: props.data.style.fontSize,
        color: props.data.style.color,
        alignment: props.data.style.textAlign,
        absolutePosition: { x: mmToPt(element.x), y: mmToPt(element.y) },
      };
    }

    case 'qrcode': {
      const qrContent = replaceVariables(props.data.content, variables);
      return {
        qr: qrContent || 'https://mdv.ao',
        fit: mmToPt(Math.min(element.width, element.height)),
        foreground: props.data.foregroundColor || '#000000',
        background: props.data.backgroundColor || '#FFFFFF',
        absolutePosition: { x: mmToPt(element.x), y: mmToPt(element.y) },
      };
    }

    default:
      return null;
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const variables: Record<string, unknown> = body.variables || {};

    // Obter template
    const templates = await readStore<PDFTemplate[]>(STORE_FILE);
    const template = templates.find((t) => t.id === id);

    if (!template) {
      return NextResponse.json(
        { error: 'Template não encontrado' },
        { status: 404 }
      );
    }

    // Calcular dimensões da página
    const dims = PAGE_DIMENSIONS[template.pageSettings.size];
    const isLandscape = template.pageSettings.orientation === 'landscape';
    const pageWidth = isLandscape ? dims.height : dims.width;
    const pageHeight = isLandscape ? dims.width : dims.height;

    // Construir definição do documento pdfmake
    const docDefinition = {
      pageSize: template.pageSettings.size,
      pageOrientation: template.pageSettings.orientation,
      pageMargins: [
        mmToPt(template.pageSettings.margins.left),
        mmToPt(template.pageSettings.margins.top + template.header.height),
        mmToPt(template.pageSettings.margins.right),
        mmToPt(template.pageSettings.margins.bottom + template.footer.height),
      ],
      // Conteúdo das páginas
      content: template.pages.flatMap((page, pageIndex) => {
        const elements = page.elements
          .filter((el) => el.visible)
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((el) => elementToContent(el, variables))
          .filter(Boolean);

        if (pageIndex > 0) {
          return [{ text: '', pageBreak: 'before' as const }, ...elements];
        }
        return elements;
      }),
      // Cabeçalho (repetido em todas as páginas)
      header: template.header.enabled
        ? () => {
            return {
              stack: template.header.elements
                .filter((el) => el.visible)
                .sort((a, b) => a.zIndex - b.zIndex)
                .map((el) => elementToContent(el, variables))
                .filter(Boolean),
              margin: [
                mmToPt(template.pageSettings.margins.left),
                mmToPt(template.pageSettings.margins.top),
                mmToPt(template.pageSettings.margins.right),
                0,
              ],
            };
          }
        : undefined,
      // Rodapé (repetido em todas as páginas)
      footer: template.footer.enabled
        ? (currentPage: number, pageCount: number) => {
            const footerVars = { ...variables, pagina_actual: currentPage, total_paginas: pageCount };
            return {
              stack: template.footer.elements
                .filter((el) => el.visible)
                .sort((a, b) => a.zIndex - b.zIndex)
                .map((el) => elementToContent(el, footerVars))
                .filter(Boolean),
              margin: [
                mmToPt(template.pageSettings.margins.left),
                0,
                mmToPt(template.pageSettings.margins.right),
                mmToPt(template.pageSettings.margins.bottom),
              ],
            };
          }
        : undefined,
      defaultStyle: {
        font: 'Helvetica',
        fontSize: 10,
      },
      info: {
        title: replaceVariables(template.name, variables),
        author: 'MDV - Madeiras e Derivados, S.A.',
        subject: template.description,
        creator: 'MailTrade Pro - Template Editor',
      },
    };

    // Retornar a definição do documento como JSON
    // (o cliente pode usar pdfmake no browser para gerar o PDF,
    // ou podemos usar pdfmake no servidor quando instalado)
    return NextResponse.json({
      success: true,
      docDefinition,
      template: {
        id: template.id,
        name: template.name,
        type: template.type,
      },
    });
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return NextResponse.json(
      { error: 'Erro interno ao gerar PDF' },
      { status: 500 }
    );
  }
}
