import 'server-only';
import bcrypt from 'bcryptjs';
import { readStore, updateStoreItem } from '@/lib/db/json-store';

// Utilizadores geridos pelo painel /admin/users, guardados na tabela `users`
// (ver src/lib/db/json-store.ts). Login e gestão de utilizadores partilham
// agora a mesma fonte de dados.

export type UserRole = 'admin' | 'distributor';

export interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
  role: UserRole;
}

export interface UserWithPassword extends User {
  passwordHash: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export type SafeUser = User;

function toSafeUser(user: UserWithPassword): SafeUser {
  return { id: user.id, email: user.email, name: user.name, company: user.company, role: user.role };
}

export async function getSafeUsers(): Promise<SafeUser[]> {
  const users = await readStore<UserWithPassword[]>('users.json');
  return users.map(toSafeUser);
}

export async function authenticateUser(email: string, password: string): Promise<SafeUser | null> {
  const users = await readStore<UserWithPassword[]>('users.json');
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !user.isActive) return null;

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return null;

  await updateStoreItem<UserWithPassword>('users.json', user.id, {
    lastLogin: new Date().toISOString(),
  });

  return toSafeUser(user);
}

export async function getUserById(id: string): Promise<SafeUser | null> {
  const users = await readStore<UserWithPassword[]>('users.json');
  const user = users.find((u) => u.id === id);
  return user ? toSafeUser(user) : null;
}
