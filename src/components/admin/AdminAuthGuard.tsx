'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, session } = useAuth();
  const router = useRouter();

  const authState = !isAuthenticated
    ? 'unauthenticated'
    : !isAdmin
    ? 'unauthorized'
    : session
    ? 'ready'
    : 'loading';

  useEffect(() => {
    if (authState === 'unauthenticated') {
      router.replace('/login');
    } else if (authState === 'unauthorized') {
      router.replace('/');
    }
  }, [authState, router]);

  if (authState !== 'ready') {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-teka-red border-t-transparent" />
          <p className="text-sm text-teka-gray">A verificar sessão...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
