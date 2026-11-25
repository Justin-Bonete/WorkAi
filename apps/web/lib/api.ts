/** Browser-side helper: calls the Next.js proxy (/bff), which attaches the auth cookie. */
export async function api<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const res = await fetch(`/bff/${path}`, {
    method: init?.method ?? 'GET',
    headers: init?.body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: 'no-store',
  });
  if (res.status === 401) {
    window.location.href = '/login';
    throw new Error('Signed out');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.message;
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg ?? `Request failed (${res.status})`);
  }
  return data as T;
}
