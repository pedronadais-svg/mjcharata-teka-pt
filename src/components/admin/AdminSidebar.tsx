'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  FileText,
  Layers,
  ImageIcon,
  HelpCircle,
  ShoppingBag,
  Users,
  Bot,
  Settings,
  Search,
  Navigation,
  Upload,
} from 'lucide-react';

const navSections = [
  {
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    ],
  },
  {
    title: 'Catálogo',
    items: [
      { icon: Package, label: 'Produtos', href: '/admin/produtos' },
      { icon: FolderTree, label: 'Categorias', href: '/admin/categorias' },
      { icon: Upload, label: 'Importar/Exportar', href: '/admin/produtos/importar' },
    ],
  },
  {
    title: 'Conteúdo',
    items: [
      { icon: FileText, label: 'Artigos', href: '/admin/artigos' },
      { icon: Layers, label: 'Páginas', href: '/admin/paginas' },
      { icon: ImageIcon, label: 'Banners', href: '/admin/banners' },
      { icon: HelpCircle, label: 'FAQs', href: '/admin/faqs' },
    ],
  },
  {
    items: [
      { icon: ShoppingBag, label: 'Encomendas', href: '/admin/encomendas' },
      { icon: Users, label: 'Utilizadores', href: '/admin/utilizadores' },
      { icon: Bot, label: 'Chatbot', href: '/admin/chatbot' },
    ],
  },
  {
    title: 'Configurações',
    items: [
      { icon: Settings, label: 'Geral', href: '/admin/configuracoes' },
      { icon: Search, label: 'SEO', href: '/admin/seo' },
      { icon: Navigation, label: 'Navegação', href: '/admin/navegacao' },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  }

  return (
    <aside className="hidden lg:flex flex-col w-[240px] bg-[#0E0E0E] text-white shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="font-heading font-bold text-lg tracking-wide">TEKA</div>
        <span className="text-[10px] font-semibold bg-teka-red/90 text-white px-1.5 py-0.5 rounded uppercase tracking-wider">
          Admin
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navSections.map((section, si) => (
          <div key={si} className="mb-2">
            {section.title && (
              <p className="px-5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/40">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-5 py-2.5 text-[13px] font-medium transition-colors ${
                    active
                      ? 'bg-white/10 text-white border-l-2 border-teka-red'
                      : 'text-white/60 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                  }`}
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/10">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-white/40 hover:text-white/70 transition-colors"
        >
          Ver site
        </Link>
      </div>
    </aside>
  );
}
