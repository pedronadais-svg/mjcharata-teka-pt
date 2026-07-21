import { cookies } from 'next/headers';
import { authenticateUser } from '@/lib/auth/users';

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return Response.json({ error: 'Email e palavra-passe são obrigatórios.' }, { status: 400 });
  }

  const user = await authenticateUser(email, password);
  if (!user) {
    return Response.json({ error: 'Email ou palavra-passe incorretos.' }, { status: 401 });
  }

  // Set session cookie (httpOnly for security)
  const sessionData = JSON.stringify(user);
  const cookieStore = await cookies();
  cookieStore.set('teka_session', sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return Response.json({ user });
}
