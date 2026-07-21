'use client';

import { usePathname } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { AdminSidebarMobile } from './AdminSidebarMobile';

const breadcrumbMap: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/produtos': 'Produtos',
  '/admin/produtos/novo': 'Novo Produto',
  '/admin/categorias': 'Categorias',
  '/admin/artigos': 'Artigos',
  '/admin/artigos/novo': 'Novo Artigo',
  '/admin/paginas': 'Páginas',
  '/admin/banners': 'Banners',
  '/admin/faqs': 'FAQs',
  '/admin/encomendas': 'Encomendas',
  '/admin/utilizadores': 'Utilizadores',
  '/admin/chatbot': 'Chatbot',
  '/admin/configuracoes': 'Configurações',
  '/admin/seo': 'SEO',
  '/admin/navegacao': 'Navegação',
  '/admin/produtos/importar': 'Importar/Exportar',
};

export function AdminHeader() {
  const { session, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const pageTitle = breadcrumbMap[pathname] || 'Admin';

  return (
    <>
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 shrink-0">
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="font-heading font-semibold text-base text-teka-dark">
            {pageTitle}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-teka-dark">{session?.name}</p>
            <p className="text-xs text-teka-gray">{session?.role === 'admin' ? 'Administrador' : 'Distribuidor'}</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-teka-red/10 text-teka-red flex items-center justify-center text-sm font-bold">
            {session?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <button
            onClick={logout}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            aria-label="Terminar sessão"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <AdminSidebarMobile onClose={() => setMobileOpen(false)} />
      )}
    </>
  );
}
