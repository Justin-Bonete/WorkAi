'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Project } from '@/lib/types';

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<Project[]>('projects?take=100')
      .then(setProjects)
      .catch((e: Error) => setError(e.message));
  }, []);

  async function create(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body: { name: string; description?: string } = { name };
      if (description.trim()) body.description = description;
      const project = await api<Project>('projects', { method: 'POST', body });
      setProjects((prev) => [project, ...(prev ?? [])]);
      setName('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create project');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <h2>Projects</h2>
      <form className="card stack" onSubmit={create}>
        <label>
          Project name
          <input required maxLength={200} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Description <span className="muted">(optional)</span>
          <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
        <button className="btn" disabled={busy || !name.trim()}>{busy ? 'Creating…' : 'Create project'}</button>
      </form>

      {error && <p className="error" role="alert">{error}</p>}
      {projects === null && !error && <p className="muted">Loading…</p>}
      {projects?.length === 0 && <p className="muted">No projects yet. Create your first one above.</p>}
      <ul className="list">
        {projects?.map((p) => (
          <li key={p.id} className="card">
            <Link href={`/projects/${p.id}`}>
              <strong>{p.name}</strong>
            </Link>
            <span className="badge">{p.status}</span>
            {p.description && <p className="muted">{p.description}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
