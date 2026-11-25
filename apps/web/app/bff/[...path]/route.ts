import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { API_URL, TOKEN_COOKIE } from '@/lib/server-api';

export const dynamic = 'force-dynamic';

// Only these API areas may be reached through the browser proxy.
const ALLOWED = [/^projects(\/|$)/, /^tasks(\/|$)/, /^auth\/me$/];

async function handle(req: NextRequest, ctx: { params: { path: string[] } }) {
  const path = ctx.params.path.join('/');
  if (!ALLOWED.some((r) => r.test(path))) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  const token = cookies().get(TOKEN_COOKIE)?.value;
  if (!token) return NextResponse.json({ message: 'Not signed in' }, { status: 401 });

  const hasBody = req.method !== 'GET';
  try {
    const upstream = await fetch(`${API_URL}/${path}${req.nextUrl.search}`, {
      method: req.method,
      headers: { Authorization: `Bearer ${token}`, ...(hasBody ? { 'Content-Type': 'application/json' } : {}) },
      body: hasBody ? await req.text() : undefined,
      cache: 'no-store',
    });
    return new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers: { 'Content-Type': upstream.headers.get('content-type') ?? 'application/json' },
    });
  } catch {
    return NextResponse.json({ message: 'The API is unreachable.' }, { status: 502 });
  }
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
