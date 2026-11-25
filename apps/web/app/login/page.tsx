'use client';

import { FormEvent, useState } from 'react';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/bff/auth/${mode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const msg = data?.message;
        throw new Error(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Something went wrong');
      }
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setBusy(false);
    }
  }

  return (
    <main className="narrow">
      <h1>WorkAI</h1>
      <p className="sub">{mode === 'login' ? 'Sign in to your workspace.' : 'Create the owner account (only possible once).'}</p>
      <form className="card stack" onSubmit={submit}>
        <label>
          Email
          <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Password {mode === 'register' && <span className="muted">(12+ characters)</span>}
          <input
            type="password"
            required
            minLength={mode === 'register' ? 12 : 1}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
        <button type="button" className="link" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}>
          {mode === 'login' ? 'First time? Create the owner account' : 'Already have an account? Sign in'}
        </button>
      </form>
    </main>
  );
}
