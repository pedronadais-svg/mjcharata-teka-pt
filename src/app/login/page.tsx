'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  // Issue #8 fix: redirect in useEffect, not during render
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(isAdmin ? '/admin' : '/');
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  if (isLoading || isAuthenticated) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (result.success) {
      router.push('/admin');
    } else {
      setError(result.error || 'Erro ao iniciar sessão.');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-6 bg-teka-light">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="font-heading font-extrabold text-3xl text-teka-dark">TEKA</span>
            <span className="block text-xs tracking-[0.2em] text-teka-gray uppercase -mt-1">Angola</span>
          </Link>
          <h1 className="font-heading font-bold text-2xl text-teka-dark mt-6">Área Reservada</h1>
          <p className="text-sm text-teka-gray mt-2">
            Acesso para distribuidores autorizados e administradores.
          </p>
        </div>

        <div className="bg-white border border-teka-border rounded p-6 lg:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-teka-dark mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teka-gray" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-teka-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-teka-red/20 focus:border-teka-red transition-colors"
                  placeholder="o.seu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-teka-dark mb-1.5">Palavra-passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-teka-gray" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-teka-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-teka-red/20 focus:border-teka-red transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-teka-red hover:bg-teka-red-dark text-white font-medium rounded transition-colors disabled:opacity-60"
            >
              {submitting ? 'A verificar...' : 'Iniciar Sessão'}
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-teka-gray mt-6">
          Para solicitar acesso, contacte{' '}
          <a href="mailto:teka@mdvmadeiras.com" className="text-teka-red hover:text-teka-red-dark">
            teka@mdvmadeiras.com
          </a>
        </p>
      </div>
    </div>
  );
}
