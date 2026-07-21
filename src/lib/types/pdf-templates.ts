// ============================================================
// Sistema de Templates PDF — Modelos de dados
// ============================================================

// --- Tipos de Template ---
export type TemplateType =
  | 'plano-entregas'
  | 'guia-remessa'
  | 'factura-proforma'
  | 'nota-encomenda'
  | 'orcamento'
  | 'packing-list'
  | 'certificado-qualidade'
  | 'customizado';

export const TEMPLATE_TYPE_LABELS: Record<TemplateType, string> = {
  'plano-entregas': 'Plano de Entregas',
  'guia-remessa': 'Guia de Remessa',
  'factura-proforma': 'Factura Proforma',
  'nota-encomenda': 'Nota de Encomenda',
  'orcamento': 'Orçamento',
  'packing-list': 'Packing List',
  'certificado-qualidade': 'Certificado de Qualidade',
  'customizado': 'Customizado',
};

// --- Configurações de página ---
export type PageSize = 'A4' | 'A3' | 'Letter' | 'Legal';
export type PageOrientation = 'portrait' | 'landscape';

export interface PageMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface PageSettings {
  size: PageSize;
  orientation: PageOrientation;
  margins: PageMargins;
  headerHeight: number;   // altura da zona de cabeçalho em mm
  footerHeight: number;   // altura da zona de rodapé em mm
}

// Dimensões em mm para cada tamanho de página
export const PAGE_DIMENSIONS: Record<PageSize, { width: number; height: number }> = {
  'A4': { width: 210, height: 297 },
  'A3': { width: 297, height: 420 },
  'Letter': { width: 216, height: 279 },
  'Legal': { width: 216, height: 356 },
};

// --- Tipos de elementos ---
export type ElementType =
  | 'text'
  | 'image'
  | 'table'
  | 'rectangle'
  | 'line'
  | 'circle'
  | 'qrcode'
  | 'barcode'
  | 'variable'
  | 'page-number'
  | 'date'
  | 'logo';

// --- Estilos de texto ---
export interface TextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline' | 'line-through';
  textAlign: 'left' | 'center' | 'right' | 'justify';
  verticalAlign: 'top' | 'middle' | 'bottom';
  color: string;
  lineHeight: number;
  letterSpacing: number;
}

// --- Estilos de borda ---
export interface BorderStyle {
  width: number;
  color: string;
  style: 'solid' | 'dashed' | 'dotted' | 'none';
  radius: number;
}

// --- Estilos de sombra ---
export interface ShadowStyle {
  enabled: boolean;
  color: string;
  offsetX: number;
  offsetY: number;
  blur: number;
}

// --- Propriedades específicas por tipo de elemento ---

export interface TextProperties {
  content: string;
  style: TextStyle;
  padding: number;
}

export interface ImageProperties {
  src: string;
  objectFit: 'contain' | 'cover' | 'fill';
  opacity: number;
}

export interface TableProperties {
  columns: TableColumn[];
  rows: TableRow[];
  headerStyle: TextStyle;
  cellStyle: TextStyle;
  borderColor: string;
  borderWidth: number;
  alternateRowColor: string;
  headerBgColor: string;
  showHeader: boolean;
  dynamicSource?: string; // nome da variável de array para tabelas dinâmicas
}

export interface TableColumn {
  id: string;
  header: string;
  width: number; // percentagem
  field?: string; // campo da variável dinâmica
  align: 'left' | 'center' | 'right';
}

export interface TableRow {
  id: string;
  cells: string[];
}

export interface RectangleProperties {
  backgroundColor: string;
  border: BorderStyle;
  opacity: number;
}

export interface LineProperties {
  color: string;
  strokeWidth: number;
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  startCap: 'none' | 'arrow';
  endCap: 'none' | 'arrow';
}

export interface CircleProperties {
  backgroundColor: string;
  border: BorderStyle;
  opacity: number;
}

export interface QRCodeProperties {
  content: string;          // conteúdo estático ou {{variável}}
  size: number;
  foregroundColor: string;
  backgroundColor: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}

export interface BarcodeProperties {
  content: string;          // conteúdo estático ou {{variável}}
  format: 'CODE128' | 'CODE39' | 'EAN13' | 'EAN8' | 'UPC' | 'ITF14';
  showText: boolean;
  lineColor: string;
  backgroundColor: string;
  height: number;
}

export interface VariableProperties {
  variableName: string;
  style: TextStyle;
  format?: string;          // formato (ex: "dd/MM/yyyy" para datas, "#,##0.00" para números)
  fallback: string;         // valor por defeito se a variável estiver vazia
  padding: number;
}

export interface PageNumberProperties {
  format: 'number' | 'x-of-y' | 'roman';
  style: TextStyle;
  prefix: string;
  suffix: string;
}

export interface DateProperties {
  format: string;           // formato da data (ex: "dd/MM/yyyy")
  style: TextStyle;
  useCurrentDate: boolean;
  variableName?: string;    // se não usar data actual
}

export interface LogoProperties {
  src: string;
  objectFit: 'contain' | 'cover';
  opacity: number;
}

// Mapa de propriedades por tipo
export type ElementProperties =
  | { type: 'text'; data: TextProperties }
  | { type: 'image'; data: ImageProperties }
  | { type: 'table'; data: TableProperties }
  | { type: 'rectangle'; data: RectangleProperties }
  | { type: 'line'; data: LineProperties }
  | { type: 'circle'; data: CircleProperties }
  | { type: 'qrcode'; data: QRCodeProperties }
  | { type: 'barcode'; data: BarcodeProperties }
  | { type: 'variable'; data: VariableProperties }
  | { type: 'page-number'; data: PageNumberProperties }
  | { type: 'date'; data: DateProperties }
  | { type: 'logo'; data: LogoProperties };

// --- Elemento PDF ---
export interface PDFElement {
  id: string;
  type: ElementType;
  name: string;             // nome amigável no painel de layers
  x: number;                // posição X em mm
  y: number;                // posição Y em mm
  width: number;            // largura em mm
  height: number;           // altura em mm
  rotation: number;         // rotação em graus
  locked: boolean;
  visible: boolean;
  zIndex: number;
  properties: ElementProperties;
  // Estilos comuns
  backgroundColor?: string;
  border?: BorderStyle;
  shadow?: ShadowStyle;
}

// --- Zona de cabeçalho/rodapé ---
export interface HeaderFooterZone {
  enabled: boolean;
  elements: PDFElement[];
  height: number;           // altura em mm
}

// --- Página do template ---
export interface PDFPage {
  id: string;
  name: string;
  order: number;
  elements: PDFElement[];
}

// --- Variáveis de template ---
export type VariableType = 'string' | 'number' | 'date' | 'boolean' | 'array' | 'image';

export interface TemplateVariable {
  id: string;
  name: string;             // nome da variável (ex: "cliente_nome")
  label: string;            // label amigável (ex: "Nome do Cliente")
  type: VariableType;
  defaultValue: string;
  description: string;
  required: boolean;
  // Para arrays (tabelas dinâmicas)
  arrayFields?: { name: string; label: string; type: 'string' | 'number' | 'date' }[];
}

// --- Template PDF completo ---
export interface PDFTemplate {
  id: string;
  name: string;
  description: string;
  type: TemplateType;
  version: number;
  pageSettings: PageSettings;
  pages: PDFPage[];
  header: HeaderFooterZone;
  footer: HeaderFooterZone;
  variables: TemplateVariable[];
  // Metadados
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isActive: boolean;
  thumbnail?: string;
}

// --- Estado do editor ---
export interface EditorState {
  template: PDFTemplate;
  selectedPageId: string | null;
  selectedElementId: string | null;
  selectedElements: string[];
  clipboard: PDFElement[];
  zoom: number;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  showRulers: boolean;
  showGuides: boolean;
  editingZone: 'page' | 'header' | 'footer';
  undoStack: PDFTemplate[];
  redoStack: PDFTemplate[];
  isDirty: boolean;
  isPreviewing: boolean;
}

// --- Acções do editor ---
export type EditorAction =
  | { type: 'SELECT_ELEMENT'; elementId: string | null }
  | { type: 'SELECT_MULTI'; elementIds: string[] }
  | { type: 'ADD_ELEMENT'; element: PDFElement }
  | { type: 'UPDATE_ELEMENT'; elementId: string; updates: Partial<PDFElement> }
  | { type: 'DELETE_ELEMENT'; elementId: string }
  | { type: 'DUPLICATE_ELEMENT'; elementId: string }
  | { type: 'MOVE_ELEMENT'; elementId: string; x: number; y: number }
  | { type: 'RESIZE_ELEMENT'; elementId: string; width: number; height: number }
  | { type: 'REORDER_ELEMENT'; elementId: string; direction: 'up' | 'down' | 'top' | 'bottom' }
  | { type: 'LOCK_ELEMENT'; elementId: string; locked: boolean }
  | { type: 'TOGGLE_VISIBILITY'; elementId: string }
  | { type: 'ADD_PAGE' }
  | { type: 'DELETE_PAGE'; pageId: string }
  | { type: 'SELECT_PAGE'; pageId: string }
  | { type: 'REORDER_PAGE'; pageId: string; direction: 'up' | 'down' }
  | { type: 'UPDATE_PAGE_SETTINGS'; settings: Partial<PageSettings> }
  | { type: 'SET_ZOOM'; zoom: number }
  | { type: 'TOGGLE_GRID' }
  | { type: 'TOGGLE_SNAP' }
  | { type: 'TOGGLE_RULERS' }
  | { type: 'SET_EDITING_ZONE'; zone: 'page' | 'header' | 'footer' }
  | { type: 'UPDATE_HEADER'; updates: Partial<HeaderFooterZone> }
  | { type: 'UPDATE_FOOTER'; updates: Partial<HeaderFooterZone> }
  | { type: 'ADD_VARIABLE'; variable: TemplateVariable }
  | { type: 'UPDATE_VARIABLE'; variableId: string; updates: Partial<TemplateVariable> }
  | { type: 'DELETE_VARIABLE'; variableId: string }
  | { type: 'UPDATE_TEMPLATE'; updates: Partial<PDFTemplate> }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'COPY' }
  | { type: 'PASTE' }
  | { type: 'SET_PREVIEW'; isPreviewing: boolean };

// --- Defaults ---
export const DEFAULT_TEXT_STYLE: TextStyle = {
  fontFamily: 'Helvetica',
  fontSize: 12,
  fontWeight: 'normal',
  fontStyle: 'normal',
  textDecoration: 'none',
  textAlign: 'left',
  verticalAlign: 'top',
  color: '#000000',
  lineHeight: 1.4,
  letterSpacing: 0,
};

export const DEFAULT_BORDER: BorderStyle = {
  width: 0,
  color: '#000000',
  style: 'solid',
  radius: 0,
};

export const DEFAULT_PAGE_SETTINGS: PageSettings = {
  size: 'A4',
  orientation: 'portrait',
  margins: { top: 15, right: 15, bottom: 15, left: 15 },
  headerHeight: 25,
  footerHeight: 15,
};

// --- Fontes disponíveis ---
export const AVAILABLE_FONTS = [
  'Helvetica',
  'Times New Roman',
  'Courier New',
  'Arial',
  'Georgia',
  'Verdana',
  'Trebuchet MS',
  'Arial Black',
  'Impact',
  'Lucida Console',
];

// --- Cores predefinidas ---
export const PRESET_COLORS = [
  '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF',
  '#FF0000', '#FF6600', '#FFCC00', '#33CC33', '#0066FF', '#9933FF',
  '#CC0000', '#CC6600', '#CC9900', '#009900', '#003399', '#660099',
  '#FF6666', '#FFAA66', '#FFEE66', '#66FF66', '#66AAFF', '#CC66FF',
  '#1a1a2e', '#16213e', '#0f3460', '#e94560', // Tema escuro
  '#2d3436', '#636e72', '#b2bec3', '#dfe6e9', // Neutros
];

// --- Variáveis pré-definidas por tipo de template ---
export const TEMPLATE_DEFAULT_VARIABLES: Record<TemplateType, TemplateVariable[]> = {
  'plano-entregas': [
    { id: 'v1', name: 'numero_documento', label: 'Nº Documento', type: 'string', defaultValue: '', description: 'Número do plano de entregas', required: true },
    { id: 'v2', name: 'data_emissao', label: 'Data de Emissão', type: 'date', defaultValue: '', description: 'Data de emissão do documento', required: true },
    { id: 'v3', name: 'cliente_nome', label: 'Nome do Cliente', type: 'string', defaultValue: '', description: 'Nome ou razão social do cliente', required: true },
    { id: 'v4', name: 'cliente_nif', label: 'NIF do Cliente', type: 'string', defaultValue: '', description: 'Número de identificação fiscal', required: false },
    { id: 'v5', name: 'cliente_morada', label: 'Morada do Cliente', type: 'string', defaultValue: '', description: 'Endereço completo do cliente', required: false },
    { id: 'v6', name: 'cliente_contacto', label: 'Contacto do Cliente', type: 'string', defaultValue: '', description: 'Telefone ou email', required: false },
    { id: 'v7', name: 'data_entrega', label: 'Data de Entrega', type: 'date', defaultValue: '', description: 'Data prevista de entrega', required: true },
    { id: 'v8', name: 'local_entrega', label: 'Local de Entrega', type: 'string', defaultValue: '', description: 'Endereço de entrega', required: true },
    { id: 'v9', name: 'observacoes', label: 'Observações', type: 'string', defaultValue: '', description: 'Notas adicionais', required: false },
    { id: 'v10', name: 'itens', label: 'Itens', type: 'array', defaultValue: '[]', description: 'Lista de itens para entrega', required: true,
      arrayFields: [
        { name: 'referencia', label: 'Referência', type: 'string' },
        { name: 'descricao', label: 'Descrição', type: 'string' },
        { name: 'quantidade', label: 'Quantidade', type: 'number' },
        { name: 'unidade', label: 'Unidade', type: 'string' },
        { name: 'peso', label: 'Peso (kg)', type: 'number' },
      ]
    },
    { id: 'v11', name: 'total_volumes', label: 'Total Volumes', type: 'number', defaultValue: '0', description: 'Número total de volumes', required: false },
    { id: 'v12', name: 'peso_total', label: 'Peso Total (kg)', type: 'number', defaultValue: '0', description: 'Peso total da carga', required: false },
  ],
  'guia-remessa': [
    { id: 'v1', name: 'numero_guia', label: 'Nº Guia', type: 'string', defaultValue: '', description: 'Número da guia de remessa', required: true },
    { id: 'v2', name: 'data_emissao', label: 'Data de Emissão', type: 'date', defaultValue: '', description: '', required: true },
    { id: 'v3', name: 'cliente_nome', label: 'Nome do Cliente', type: 'string', defaultValue: '', description: '', required: true },
    { id: 'v4', name: 'cliente_nif', label: 'NIF', type: 'string', defaultValue: '', description: '', required: false },
    { id: 'v5', name: 'cliente_morada', label: 'Morada', type: 'string', defaultValue: '', description: '', required: false },
    { id: 'v6', name: 'local_carga', label: 'Local de Carga', type: 'string', defaultValue: '', description: '', required: true },
    { id: 'v7', name: 'local_descarga', label: 'Local de Descarga', type: 'string', defaultValue: '', description: '', required: true },
    { id: 'v8', name: 'matricula', label: 'Matrícula Viatura', type: 'string', defaultValue: '', description: '', required: false },
    { id: 'v9', name: 'itens', label: 'Itens', type: 'array', defaultValue: '[]', description: 'Lista de mercadorias', required: true,
      arrayFields: [
        { name: 'referencia', label: 'Referência', type: 'string' },
        { name: 'descricao', label: 'Descrição', type: 'string' },
        { name: 'quantidade', label: 'Qtd', type: 'number' },
        { name: 'unidade', label: 'Un.', type: 'string' },
        { name: 'preco_unitario', label: 'Preço Unit.', type: 'number' },
        { name: 'total', label: 'Total', type: 'number' },
      ]
    },
  ],
  'factura-proforma': [
    { id: 'v1', name: 'numero_factura', label: 'Nº Factura', type: 'string', defaultValue: '', description: '', required: true },
    { id: 'v2', name: 'data_emissao', label: 'Data', type: 'date', defaultValue: '', description: '', required: true },
    { id: 'v3', name: 'validade', label: 'Validade', type: 'date', defaultValue: '', description: 'Data de validade da proforma', required: true },
    { id: 'v4', name: 'cliente_nome', label: 'Cliente', type: 'string', defaultValue: '', description: '', required: true },
    { id: 'v5', name: 'cliente_nif', label: 'NIF', type: 'string', defaultValue: '', description: '', required: false },
    { id: 'v6', name: 'cliente_morada', label: 'Morada', type: 'string', defaultValue: '', description: '', required: false },
    { id: 'v7', name: 'moeda', label: 'Moeda', type: 'string', defaultValue: 'AOA', description: '', required: true },
    { id: 'v8', name: 'itens', label: 'Itens', type: 'array', defaultValue: '[]', description: 'Linhas da factura', required: true,
      arrayFields: [
        { name: 'referencia', label: 'Ref.', type: 'string' },
        { name: 'descricao', label: 'Descrição', type: 'string' },
        { name: 'quantidade', label: 'Qtd', type: 'number' },
        { name: 'unidade', label: 'Un.', type: 'string' },
        { name: 'preco_unitario', label: 'Preço Unit.', type: 'number' },
        { name: 'desconto', label: 'Desc. %', type: 'number' },
        { name: 'total', label: 'Total', type: 'number' },
      ]
    },
    { id: 'v9', name: 'subtotal', label: 'Subtotal', type: 'number', defaultValue: '0', description: '', required: false },
    { id: 'v10', name: 'iva', label: 'IVA', type: 'number', defaultValue: '0', description: '', required: false },
    { id: 'v11', name: 'total', label: 'Total', type: 'number', defaultValue: '0', description: '', required: false },
    { id: 'v12', name: 'condicoes_pagamento', label: 'Condições Pagamento', type: 'string', defaultValue: '', description: '', required: false },
    { id: 'v13', name: 'iban', label: 'IBAN', type: 'string', defaultValue: '', description: '', required: false },
  ],
  'nota-encomenda': [
    { id: 'v1', name: 'numero_encomenda', label: 'Nº Encomenda', type: 'string', defaultValue: '', description: '', required: true },
    { id: 'v2', name: 'data_emissao', label: 'Data', type: 'date', defaultValue: '', description: '', required: true },
    { id: 'v3', name: 'fornecedor_nome', label: 'Fornecedor', type: 'string', defaultValue: '', description: '', required: true },
    { id: 'v4', name: 'data_entrega_prevista', label: 'Entrega Prevista', type: 'date', defaultValue: '', description: '', required: false },
    { id: 'v5', name: 'itens', label: 'Itens', type: 'array', defaultValue: '[]', description: '', required: true,
      arrayFields: [
        { name: 'referencia', label: 'Ref.', type: 'string' },
        { name: 'descricao', label: 'Descrição', type: 'string' },
        { name: 'quantidade', label: 'Qtd', type: 'number' },
        { name: 'preco_unitario', label: 'Preço Unit.', type: 'number' },
        { name: 'total', label: 'Total', type: 'number' },
      ]
    },
    { id: 'v6', name: 'total', label: 'Total', type: 'number', defaultValue: '0', description: '', required: false },
  ],
  'orcamento': [
    { id: 'v1', name: 'numero_orcamento', label: 'Nº Orçamento', type: 'string', defaultValue: '', description: '', required: true },
    { id: 'v2', name: 'data_emissao', label: 'Data', type: 'date', defaultValue: '', description: '', required: true },
    { id: 'v3', name: 'validade', label: 'Validade', type: 'date', defaultValue: '', description: '', required: true },
    { id: 'v4', name: 'cliente_nome', label: 'Cliente', type: 'string', defaultValue: '', description: '', required: true },
    { id: 'v5', name: 'itens', label: 'Itens', type: 'array', defaultValue: '[]', description: '', required: true,
      arrayFields: [
        { name: 'referencia', label: 'Ref.', type: 'string' },
        { name: 'descricao', label: 'Descrição', type: 'string' },
        { name: 'quantidade', label: 'Qtd', type: 'number' },
        { name: 'preco_unitario', label: 'Preço Unit.', type: 'number' },
        { name: 'total', label: 'Total', type: 'number' },
      ]
    },
    { id: 'v6', name: 'total', label: 'Total', type: 'number', defaultValue: '0', description: '', required: false },
  ],
  'packing-list': [
    { id: 'v1', name: 'numero_documento', label: 'Nº Documento', type: 'string', defaultValue: '', description: '', required: true },
    { id: 'v2', name: 'data_emissao', label: 'Data', type: 'date', defaultValue: '', description: '', required: true },
    { id: 'v3', name: 'destinatario', label: 'Destinatário', type: 'string', defaultValue: '', description: '', required: true },
    { id: 'v4', name: 'volumes', label: 'Volumes', type: 'array', defaultValue: '[]', description: '', required: true,
      arrayFields: [
        { name: 'numero_volume', label: 'Nº Volume', type: 'string' },
        { name: 'conteudo', label: 'Conteúdo', type: 'string' },
        { name: 'peso_bruto', label: 'Peso Bruto', type: 'number' },
        { name: 'peso_liquido', label: 'Peso Líquido', type: 'number' },
        { name: 'dimensoes', label: 'Dimensões', type: 'string' },
      ]
    },
  ],
  'certificado-qualidade': [
    { id: 'v1', name: 'numero_certificado', label: 'Nº Certificado', type: 'string', defaultValue: '', description: '', required: true },
    { id: 'v2', name: 'data_emissao', label: 'Data', type: 'date', defaultValue: '', description: '', required: true },
    { id: 'v3', name: 'produto', label: 'Produto', type: 'string', defaultValue: '', description: '', required: true },
    { id: 'v4', name: 'lote', label: 'Lote', type: 'string', defaultValue: '', description: '', required: false },
    { id: 'v5', name: 'norma', label: 'Norma', type: 'string', defaultValue: '', description: '', required: false },
  ],
  'customizado': [],
};
