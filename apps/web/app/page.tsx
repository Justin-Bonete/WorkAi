const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

type Health = { status: string; database: string; time: string };

async function getHealth(): Promise<Health | null> {
  try {
    const res = await fetch(`${API_URL}/health`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as Health;
  } catch {
    return null;
  }
}

export default async function Home() {
  const health = await getHealth();
  const apiUp = health !== null;
  return (
    <main>
      <h1>WorkAI</h1>
      <p className="sub">Foundation shell. Login, projects and the task board arrive in the next step.</p>
      <div className="grid">
        <section className="card">
          <h2>API</h2>
          <span className={`badge ${apiUp ? 'ok' : 'bad'}`}>{apiUp ? health.status : 'unreachable'}</span>
        </section>
        <section className="card">
          <h2>Database</h2>
          <span className={`badge ${health?.database === 'ok' ? 'ok' : 'bad'}`}>{health?.database ?? 'unknown'}</span>
        </section>
      </div>
    </main>
  );
}
