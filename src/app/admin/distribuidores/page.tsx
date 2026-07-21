'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Shield, Building } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

interface SafeUser {
  id: string;
  email: string;
  name: string;
  company?: string;
  role: string;
}

export default function DistribuidoresPage() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<SafeUser[]>([]);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.push('/login');
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  // Fetch users from API (server-side, no credentials exposed)
  useEffect(() => {
    if (isAdmin) {
      fetch('/api/admin/users')
        .then((res) => res.json())
        .then((data) => { if (data.users) setUsers(data.users); })
        .catch(() => {});
    }
  }, [isAdmin]);

  if (isLoading || !isAuthenticated || !isAdmin) return null;

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin" className="p-2 hover:bg-teka-light rounded transition-colors">
          <ArrowLeft className="h-5 w-5 text-teka-gray" />
        </Link>
        <div>
          <h1 className="font-heading font-bold text-2xl text-teka-dark">Distribuidores</h1>
          <p className="text-sm text-teka-gray">Gerir acessos de distribuidores autorizados</p>
        </div>
      </div>

      <div className="bg-white border border-teka-border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-teka-light border-b border-teka-border">
              <th className="text-left px-4 py-3 font-semibold text-teka-dark">Utilizador</th>
              <th className="text-left px-4 py-3 font-semibold text-teka-dark">Email</th>
              <th className="text-left px-4 py-3 font-semibold text-teka-dark">Empresa</th>
              <th className="text-left px-4 py-3 font-semibold text-teka-dark">Perfil</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-teka-border">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-teka-light/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teka-red/10 flex items-center justify-center">
                      {user.role === 'admin' ? (
                        <Shield className="h-4 w-4 text-teka-red" />
                      ) : (
                        <User className="h-4 w-4 text-teka-gray" />
                      )}
                    </div>
                    <span className="font-medium text-teka-dark">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-teka-gray">{user.email}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-teka-gray">
                    <Building className="h-3.5 w-3.5" />
                    {user.company || '—'}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className={user.role === 'admin' ? 'bg-teka-red text-white border-0' : ''}>
                    {user.role === 'admin' ? 'Administrador' : 'Distribuidor'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
