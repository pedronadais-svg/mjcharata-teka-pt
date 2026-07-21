import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get('teka_session');

  if (!session?.value) {
    return Response.json({ user: null });
  }

  try {
    const user = JSON.parse(session.value);
    return Response.json({ user });
  } catch {
    return Response.json({ user: null });
  }
}
