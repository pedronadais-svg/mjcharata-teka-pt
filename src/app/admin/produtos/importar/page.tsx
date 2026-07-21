'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Upload, FileSpreadsheet, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/admin/Toast';

interface ImportResult {
  matched: number;
  total: number;
  unmatched: number;
}

export default function AdminProductsImportExportPage() {
  const { toast } = useToast();

  // Export state
  const [exporting, setExporting] = useState(false);

  // Import state
  const [importing, setImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export handler
  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch('/api/admin/products/export', { method: 'POST' });
      if (!res.ok) {
        toast('error', 'Erro ao exportar produtos');
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `produtos-teka-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast('success', 'Ficheiro CSV exportado com sucesso');
    } catch {
      toast('error', 'Erro ao exportar produtos');
    } finally {
      setExporting(false);
    }
  }

  // Import handler
  async function handleImport() {
    if (!selectedFile) {
      toast('error', 'Seleccione um ficheiro CSV');
      return;
    }

    setImporting(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('/api/admin/products/import', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        toast('error', err?.message ?? 'Erro ao importar ficheiro');
        return;
      }

      const result: ImportResult = await res.json();
      setImportResult(result);

      if (result.unmatched > 0) {
        toast('info', `Importacao concluida com ${result.unmatched} produto(s) nao correspondido(s)`);
      } else {
        toast('success', `${result.matched} produto(s) importado(s) com sucesso`);
      }
    } catch {
      toast('error', 'Erro ao importar ficheiro');
    } finally {
      setImporting(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    setImportResult(null);
  }

  function clearFile() {
    setSelectedFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/produtos"
          className="p-2 text-gray-400 hover:text-teka-red rounded hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold text-teka-dark">Importar / Exportar Produtos</h1>
          <p className="text-sm text-teka-gray mt-1">Gerir produtos em massa atraves de ficheiros CSV</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Section */}
        <div className="bg-white border border-gray-200 rounded p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <Download className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-heading font-semibold text-teka-dark">Exportar Produtos</h2>
              <p className="text-sm text-teka-gray">Descarregar todos os produtos em formato CSV</p>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            O ficheiro exportado contem todos os produtos do catalogo com as respectivas informacoes:
            nome, referencia, EAN, categoria, subcategoria, preco, estado e especificacoes.
          </p>

          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {exporting ? 'A exportar...' : 'Exportar CSV'}
          </button>
        </div>

        {/* Import Section */}
        <div className="bg-white border border-gray-200 rounded p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Upload className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-heading font-semibold text-teka-dark">Importar Produtos</h2>
              <p className="text-sm text-teka-gray">Actualizar produtos a partir de um ficheiro CSV</p>
            </div>
          </div>

          {/* File input */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="hidden"
              id="csv-upload"
            />

            {selectedFile ? (
              <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded">
                <FileSpreadsheet className="h-5 w-5 text-blue-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-teka-dark truncate">{selectedFile.name}</p>
                  <p className="text-xs text-gray-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  type="button"
                  onClick={clearFile}
                  className="text-xs text-gray-500 hover:text-red-500"
                >
                  Remover
                </button>
              </div>
            ) : (
              <label
                htmlFor="csv-upload"
                className="flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
              >
                <Upload className="h-8 w-8 text-gray-400" />
                <p className="text-sm text-teka-gray">
                  <span className="text-teka-red font-medium">Clique para escolher</span> ou arraste um ficheiro CSV
                </p>
                <p className="text-xs text-gray-400">Apenas ficheiros .csv</p>
              </label>
            )}
          </div>

          <button
            type="button"
            onClick={handleImport}
            disabled={importing || !selectedFile}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {importing ? 'A importar...' : 'Importar CSV'}
          </button>

          {/* Import Results */}
          {importResult && (
            <div className={`p-4 rounded border ${importResult.unmatched > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-center gap-2 mb-3">
                {importResult.unmatched > 0 ? (
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                ) : (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
                <p className="text-sm font-medium text-teka-dark">Resultado da importacao</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-teka-dark">{importResult.total}</p>
                  <p className="text-xs text-gray-500">Total de linhas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{importResult.matched}</p>
                  <p className="text-xs text-gray-500">Correspondidos</p>
                </div>
                <div className="text-center">
                  <p className={`text-2xl font-bold ${importResult.unmatched > 0 ? 'text-yellow-600' : 'text-gray-400'}`}>
                    {importResult.unmatched}
                  </p>
                  <p className="text-xs text-gray-500">Nao correspondidos</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Format Help */}
      <div className="bg-white border border-gray-200 rounded p-6 space-y-4">
        <h3 className="text-lg font-heading font-semibold text-teka-dark">Formato do ficheiro CSV</h3>
        <p className="text-sm text-gray-500">
          O ficheiro CSV deve conter as seguintes colunas, separadas por ponto e virgula (;) ou virgula (,).
          A primeira linha deve ser o cabecalho.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-gray-200 rounded">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Coluna</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Obrigatorio</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Descrição</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Exemplo</th>
              </tr>
            </thead>
            <tbody>
              {[
                { col: 'reference', req: 'Sim', desc: 'Referência do produto (chave de correspondência)', ex: 'TKA-1234' },
                { col: 'name', req: 'Não', desc: 'Nome do produto', ex: 'Forno Multifuncao HBB 735' },
                { col: 'ean', req: 'Não', desc: 'Codigo EAN/barras', ex: '8421152143001' },
                { col: 'category', req: 'Não', desc: 'Slug da categoria', ex: 'cozinha' },
                { col: 'subcategory', req: 'Não', desc: 'Slug da subcategoria', ex: 'fornos' },
                { col: 'priceAOA', req: 'Não', desc: 'Preço em Kwanzas', ex: '125000' },
                { col: 'status', req: 'Não', desc: 'Estado: active, draft, archived', ex: 'active' },
                { col: 'energyRating', req: 'Não', desc: 'Classificacao energetica', ex: 'A+' },
                { col: 'refPhc', req: 'Não', desc: 'Referência PHC', ex: 'PHC-001' },
              ].map((row) => (
                <tr key={row.col} className="border-b border-gray-100">
                  <td className="px-4 py-2 font-mono text-xs text-teka-dark">{row.col}</td>
                  <td className="px-4 py-2">
                    <span className={`text-xs font-medium ${row.req === 'Sim' ? 'text-red-600' : 'text-gray-400'}`}>
                      {row.req}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-600">{row.desc}</td>
                  <td className="px-4 py-2 font-mono text-xs text-gray-500">{row.ex}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-50 rounded p-4">
          <p className="text-xs font-medium text-gray-500 mb-2">Exemplo de CSV:</p>
          <pre className="text-xs text-gray-600 font-mono overflow-x-auto whitespace-pre">
{`reference;name;ean;category;subcategory;priceAOA;status;energyRating;refPhc
TKA-1234;Forno Multifuncao HBB 735;8421152143001;cozinha;fornos;125000;active;A+;PHC-001
TKA-5678;Placa de Inducao IBC 63010;8421152143018;cozinha;placas;98000;draft;A++;PHC-002`}
          </pre>
        </div>
      </div>
    </div>
  );
}
