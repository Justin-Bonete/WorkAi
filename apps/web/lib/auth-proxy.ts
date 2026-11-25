import { NextResponse } from 'next/server';
import { API_URL, TOKEN_COOKIE } from '@/lib/server-api';

/** Forwards login/register to the API and stores the returned token in an httpOnly cookie. */
export async function authProxy(req: Request, upstreamPath: string) {
  const body = await req.text();
  let upstream: Response;
  try {
    upstream = await fetch(`${API_URL}/${upstreamPath}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json({ message: 'The API is unreachable. Is it running on port 4000?' }, { status: 502 });
  }
  const data = (await upstream.json().catch(() => ({}))) as { accessToken?: string; message?: string | string[] };
  if (!upstream.ok || !data.accessToken) {
    return NextResponse.json({ message: data.message ?? 'Request failed' }, { status: upstream.status || 500 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(TOKEN_COOKIE, data.accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
  return res;
}
