'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Search, Menu, X, ChevronDown, Phone, Mail, User, LogOut, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchOverlay } from '@/components/common/SearchOverlay';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { mainNavigation } from '@/data/navigation';
import type { MenuItem } from '@/lib/types';

// Imagens representativas por subcategoria para o mega menu
const subcategoryImages: Record<string, string> = {
  '/cozinha/fornos': 'https://teka.b-cdn.net/CMP1219/2/PR426732BI45038_111000096_Van_Gogh_HLB_84_P_VG_SZ1.png',
  '/cozinha/microondas': 'https://teka.b-cdn.net/CMP1219/1/PR426735BI45050_112030021_Van_Gogh_ML_82_VG_SZ1.png',
  '/cozinha/placas': 'https://teka.b-cdn.net/CMP1219/1/PR426765BI45109_112510047_Van_Gogh_IBF_95_FST_VG_SZ1.png',
  '/cozinha/exaustores': 'https://teka.b-cdn.net/CMP1219/2/PR426739BI45053_112930075_Van_Gogh_DVT_98660_TOS_VG_SZ1.png',
  '/cozinha/frigorificos': 'https://teka.b-cdn.net/CMP1219/PR426938BI45136_113400045_Van_Gogh_RBF_88670_VG_SZ1.png',
  '/cozinha/lava-loica': 'https://teka.b-cdn.net/CMP1219/2/PR112655BI28175_115000056_American_Professional_80_M_XP_1B_SZ1.png',
  '/cozinha/maquinas-lavar-loica': 'https://teka.b-cdn.net/CMP1219/1/PR427054BI48169_114270048_DFI_86850_XL_SZ1.png',
  '/cozinha/misturadoras': 'https://teka.b-cdn.net/CMP1219/1/PR18718BI22084_116030004_ICC_915_SZ2.png',
  '/cozinha/acessorios': 'https://teka.b-cdn.net/CMP1219/1/PR1439BI36423_239381200_ARK_938_SZ2.png',
  '/lavandaria/maquinas-lavar-roupa': 'https://teka.b-cdn.net/CMP1219/3/PR414960BI33965_113900011_AutoDose_WMK_81050_DSS_SZ1.png',
  '/lavandaria/maquinas-secar': 'https://teka.b-cdn.net/CMP1219/3/PR414960BI33965_113900011_AutoDose_WMK_81050_DSS_SZ1.png',
  '/lavandaria/maquinas-lavar-secar': 'https://teka.b-cdn.net/CMP1219/3/PR414960BI33965_113900011_AutoDose_WMK_81050_DSS_SZ1.png',
};

// TopBar removida — o site oficial Teka não tem topbar

function MegaMenu({ item, isOpen }: { item: MenuItem; isOpen: boolean }) {
  if (!item.children?.length) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
          className="absolute top-full left-0 w-full bg-white shadow-lg border-t border-teka-gray-border z-50"
        >
          <div className="max-w-[1440px] mx-auto px-6 py-8">
            <div className="grid grid-cols-3 lg:grid-cols-4 gap-6">
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  className="group flex flex-col gap-3 p-4 rounded-lg hover:bg-teka-light transition-colors"
                >
                  <div className="relative w-full aspect-square bg-teka-light rounded-md overflow-hidden">
                    {subcategoryImages[child.href] ? (
                      <Image
                        src={subcategoryImages[child.href]}
                        alt={child.label}
                        fill
                        sizes="200px"
                        className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-teka-dark group-hover:text-teka-red transition-colors">
                      {child.label}
                    </h3>
                    {child.description && (
                      <p className="text-sm text-teka-gray mt-1 line-clamp-2">{child.description}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-teka-border">
              <Link
                href={item.href}
                className="text-sm font-medium text-teka-red hover:text-teka-red-dark transition-colors"
              >
                Ver tudo em {item.label} →
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MobileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white z-50 overflow-y-auto lg:hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-teka-border">
              <span className="font-heading font-bold text-lg text-teka-dark">Menu</span>
              <button aria-label="Fechar menu" onClick={onClose} className="p-2 hover:bg-teka-light rounded-md transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-4">
              {mainNavigation.map((item) => (
                <div key={item.href} className="border-b border-teka-border last:border-0">
                  {item.children ? (
                    <>
                      <button
                        onClick={() => setExpandedItem(expandedItem === item.label ? null : item.label)}
                        className="w-full flex items-center justify-between py-3 font-medium text-teka-dark"
                      >
                        {item.label}
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${expandedItem === item.label ? 'rotate-180' : ''}`}
                        />
                      </button>
                      <AnimatePresence>
                        {expandedItem === item.label && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="pb-3 pl-4 space-y-2">
                              {item.children.map((child) => (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  onClick={onClose}
                                  className="block py-2 text-sm text-teka-gray hover:text-teka-red transition-colors"
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="block py-3 font-medium text-teka-dark hover:text-teka-red transition-colors"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function Header() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHomepage = pathname === '/';
  const { session, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-40">
      <div className={`transition-all duration-300 relative ${
        scrolled || !isHomepage
          ? 'bg-teka-black/95 backdrop-blur-sm shadow-md'
          : 'bg-transparent'
      }`}>
        <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between h-[54px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="bg-teka-red px-2.5 py-1.5 flex flex-col items-center">
              <span className="font-heading font-extrabold text-lg tracking-tight text-white leading-none">
                TEKA
              </span>
              <span className="text-[7px] font-medium tracking-[0.15em] text-white/80 uppercase leading-none mt-0.5">
                Angola
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {mainNavigation.map((item) => (
              <div
                key={item.href}
                onMouseEnter={() => item.children && setActiveMenu(item.label)}
                onMouseLeave={() => setActiveMenu(null)}
                className="relative"
              >
                <Link
                  href={item.href}
                  className={`
                    flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors
                    ${item.featured ? 'text-white hover:text-white/70' : 'text-white hover:text-white/70'}
                    ${activeMenu === item.label ? 'text-white/70' : ''}
                  `}
                >
                  {item.label}
                  {item.featured && (
                    <span className="ml-1 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-teka-success text-white rounded-sm leading-none">
                      Novo
                    </span>
                  )}
                  {item.children && <ChevronDown className="h-3.5 w-3.5" />}
                </Link>
              </div>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-white hover:text-white/70 hover:bg-white/10"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Cart */}
            {isAuthenticated && (
              <Link href="/carrinho" className="relative">
                <Button variant="ghost" size="icon" className="text-white hover:text-white/70 hover:bg-white/10">
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-teka-red text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </Link>
            )}

            {isAuthenticated ? (
              <div className="hidden lg:flex items-center gap-1">
                <Link href="/admin">
                  <Button variant="ghost" size="sm" className="text-white hover:text-white/70 hover:bg-white/10 gap-1.5 text-xs">
                    <User className="h-4 w-4" />
                    {session?.name.split(' ')[0]}
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => logout()}
                  className="text-white hover:text-white/70 hover:bg-white/10"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Link href="/login" className="hidden lg:block">
                <Button variant="ghost" size="sm" className="text-white hover:text-white/70 hover:bg-white/10 gap-1.5 text-xs">
                  <User className="h-4 w-4" />
                  Entrar
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-white hover:text-white/70 hover:bg-white/10"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mega Menu Dropdowns */}
        {mainNavigation.map((item) => (
          <div
            key={`mega-${item.href}`}
            onMouseEnter={() => item.children && setActiveMenu(item.label)}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <MegaMenu item={item} isOpen={activeMenu === item.label} />
          </div>
        ))}

      </div>

      {/* Search Overlay */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
