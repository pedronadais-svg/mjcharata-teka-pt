import Link from 'next/link';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center py-24 px-6">
      <div className="text-center max-w-md">
        <div className="text-8xl font-heading font-extrabold text-teka-red/20 mb-4">404</div>
        <h1 className="font-heading font-bold text-2xl text-teka-dark">Página não encontrada</h1>
        <p className="text-teka-gray mt-3 leading-relaxed">
          A página que procura não existe ou foi movida. Verifique o endereço ou navegue para uma das opções abaixo.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-teka-red hover:bg-teka-red-dark text-white font-medium rounded-lg transition-colors"
          >
            <Home className="h-4 w-4" />
            Ir para o início
          </Link>
          <Link
            href="/downloads"
            className="inline-flex items-center gap-2 px-6 py-3 border border-teka-border text-teka-charcoal hover:bg-teka-light font-medium rounded-lg transition-colors"
          >
            <Search className="h-4 w-4" />
            Centro de Downloads
          </Link>
        </div>
      </div>
    </div>
  );
}
