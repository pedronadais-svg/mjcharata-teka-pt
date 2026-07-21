// Sessão baseada em cookies — em produção usar JWT + httpOnly cookies
import type { UserRole } from './users';

export interface Session {
  userId: string;
  email: string;
  name: string;
  company?: string;
  role: UserRole;
}

const SESSION_KEY = 'teka_session';

export function setSession(session: Session): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}
