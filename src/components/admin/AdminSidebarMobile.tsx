'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, LayoutDashboard, Package, FolderTree, FileText, Layers, ImageIcon, HelpCircle, ShoppingBag, Users, Bot, Settings, Search, Navigation, Upload } from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Package, label: 'Produtos', href: '/admin/produtos' },
  { icon: FolderTree, label: 'Categorias', href: '/admin/categorias' },
  { icon: FileText, label: 'Artigos', href: '/admin/artigos' },
  { icon: Layers, label: 'Páginas', href: '/admin/paginas' },
  { icon: ImageIcon, label: 'Banners', href: '/admin/banners' },
  { icon: HelpCircle, label: 'FAQs', href: '/admin/faqs' },
  { icon: ShoppingBag, label: 'Encomendas', href: '/admin/encomendas' },
  { icon: Users, label: 'Utilizadores', href: '/admin/utilizadores' },
  { icon: Bot, label: 'Chatbot', href: '/admin/chatbot' },
  { icon: Settings, label: 'Configurações', href: '/admin/configuracoes' },
  { icon: Search, label: 'SEO', href: '/admin/seo' },
  { icon: Navigation, label: 'Navegação', href: '/admin/navegacao' },
];

export function AdminSidebarMobile({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute left-0 top-0 bottom-0 w-[260px] bg-[#0E0E0E] text-white flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="font-heading font-bold text-lg">TEKA</span>
            <span className="text-[10px] font-semibold bg-teka-red/90 px-1.5 py-0.5 rounded uppercase">Admin</span>
          </div>
          <button onClick={onClose} className="p-1 text-white/60 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-white/10 text-white border-l-2 border-teka-red'
                    : 'text-white/60 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
