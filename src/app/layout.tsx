import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { GoogleAnalytics } from '@/components/common/GoogleAnalytics';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { LazyChatWidget } from '@/components/common/LazyComponents';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://teka-angola.com';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-montserrat',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Eletrodomésticos de Cozinha & Lavandaria | Teka Angola',
    template: '%s | Teka Angola',
  },
  description:
    'Fornos, Placas, Exaustores, Frigoríficos, Máquinas de Lavar — Eletrodomésticos Teka de qualidade alemã. Entrega em Angola. Distribuído por MDV.',
  keywords: [
    'Teka', 'eletrodomésticos', 'cozinha', 'fornos', 'placas',
    'exaustores', 'frigoríficos', 'Angola', 'ar condicionado',
    'lavandaria', 'teka angola', 'mdv madeiras',
  ],
  openGraph: {
    type: 'website',
    locale: 'pt_PT',
    siteName: 'Teka Angola',
    title: 'Eletrodomésticos de Cozinha & Lavandaria | Teka Angola',
    description: 'Fornos, Placas, Exaustores, Frigoríficos, Máquinas de Lavar — Eletrodomésticos Teka de qualidade alemã. Entrega em Angola.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eletrodomésticos de Cozinha & Lavandaria | Teka Angola',
    description: 'Fornos, Placas, Exaustores, Frigoríficos — Eletrodomésticos Teka de qualidade alemã em Angola.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Teka Angola — MDV Madeiras e Derivados',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+244-933-302-752',
    email: 'teka@mdvmadeiras.com',
    contactType: 'customer service',
    availableLanguage: 'Portuguese',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Luanda',
    addressCountry: 'AO',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-PT" className={montserrat.variable}>
      <body className="min-h-screen flex flex-col font-sans antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[99999] focus:px-4 focus:py-2 focus:bg-teka-red focus:text-white focus:rounded">
          Saltar para o conteúdo principal
        </a>
        <AuthProvider>
          <CartProvider>
            <GoogleAnalytics />
            <Header />
            <main id="main-content" className="flex-1 pt-[54px]">{children}</main>
            <Footer />
            <LazyChatWidget />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
