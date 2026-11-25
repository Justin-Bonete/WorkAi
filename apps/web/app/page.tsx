import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AppShell from '@/components/AppShell';
import Dashboard from '@/components/Dashboard';
import { TOKEN_COOKIE } from '@/lib/server-api';

export const dynamic = 'force-dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

async function getHealth(): Promise<{ status: string; database: string } | null> {
  try {
    const res = await fetch(`${API_URL}/health`, { cache: 'no-store' });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

export default async function Home() {
  if (!cookies().get(TOKEN_COOKIE)) redirect('/login');
  const health = await getHealth();
  return (
    <AppShell>
      <Dashboard health={health} />
    </AppShell>
  );
}
