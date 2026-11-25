import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';
import ProjectList from '@/components/ProjectList';
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
    <main>
      <header className="topbar">
        <div>
          <h1>WorkAI</h1>
          <p className="sub">
            API <span className={health ? 'ok' : 'bad'}>{health?.status ?? 'unreachable'}</span> · Database{' '}
            <span className={health?.database === 'ok' ? 'ok' : 'bad'}>{health?.database ?? 'unknown'}</span>
          </p>
        </div>
        <LogoutButton />
      </header>
      <ProjectList />
    </main>
  );
}
