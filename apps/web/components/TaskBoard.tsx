'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Agent } from '@/lib/agents';
import { STATUSES, TRANSITIONS } from '@/lib/task-state';
import type { Project, Task, TaskStatus } from '@/lib/types';

export default function TaskBoard({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [objective, setObjective] = useState('');
  const [deps, setDeps] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, t, a] = await Promise.all([
        api<Project>(`projects/${projectId}`),
        api<Task[]>(`projects/${projectId}/tasks?take=100`),
        api<Agent[]>('agents'),
      ]);
      setProject(p);
      setTasks(t);
      setAgents(a);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load project');
    } finally {
      setLoaded(true);
    }
  }, [projectId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function createTask(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body: { title: string; objective: string; dependsOn?: string[] } = { title, objective };
      if (deps.length) body.dependsOn = deps;
      const task = await api<Task>(`projects/${projectId}/tasks`, { method: 'POST', body });
      setTasks((prev) => [...prev, task]);
      setTitle('');
      setObjective('');
      setDeps([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create task');
    } finally {
      setBusy(false);
    }
  }

  async function move(task: Task, to: TaskStatus) {
    setError(null);
    try {
      const updated = await api<Task>(`tasks/${task.id}/transition`, { method: 'POST', body: { to } });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, ...updated } : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update task');
    }
  }

  async function assign(task: Task, agentId: string) {
    setError(null);
    try {
      const updated = await api<Task>(`tasks/${task.id}/assign`, { method: 'POST', body: { agentId: agentId || null } });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, ...updated } : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not assign task');
    }
  }

  if (!loaded) return <p className="muted">Loading…</p>;
  if (!project) return <p className="error" role="alert">{error ?? 'Project not found'}</p>;

  const titleOf = (id: string) => tasks.find((t) => t.id === id)?.title ?? 'unknown task';

  return (
    <section>
      <h1>{project.name}</h1>
      {project.description && <p className="sub">{project.description}</p>}

      <form className="card stack" onSubmit={createTask}>
        <h2>New task</h2>
        <label>
          Title
          <input required maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label>
          Objective
          <textarea required rows={2} value={objective} onChange={(e) => setObjective(e.target.value)} />
        </label>
        {tasks.length > 0 && (
          <fieldset>
            <legend>Depends on</legend>
            {tasks.map((t) => (
              <label key={t.id} className="check">
                <input
                  type="checkbox"
                  checked={deps.includes(t.id)}
                  onChange={(e) => setDeps((prev) => (e.target.checked ? [...prev, t.id] : prev.filter((x) => x !== t.id)))}
                />
                {t.title}
              </label>
            ))}
          </fieldset>
        )}
        <button className="btn" disabled={busy || !title.trim() || !objective.trim()}>{busy ? 'Adding…' : 'Add task'}</button>
      </form>

      {error && <p className="error" role="alert">{error}</p>}

      <div className="board" aria-label="Task board">
        {STATUSES.map((status) => {
          const col = tasks.filter((t) => t.status === status);
          return (
            <section key={status} className="column">
              <h3>{status} <span className="muted">{col.length}</span></h3>
              {col.map((t) => (
                <article key={t.id} className="card task">
                  <strong>{t.title}</strong>
                  <p className="muted">{t.objective}</p>
                  {!!t.dependsOn?.length && (
                    <p className="muted">Waits for: {t.dependsOn.map((d) => titleOf(d.dependsOnTaskId)).join(', ')}</p>
                  )}
                  {t.status === 'FAILED' && <p className="muted">Retries used: {t.retryCount}</p>}
                  <label className="assign">
                    Assigned bot
                    <select
                      value={t.assignedAgentId ?? ''}
                      disabled={t.status === 'COMPLETED' || t.status === 'CANCELLED'}
                      onChange={(e) => void assign(t, e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {agents.map((a) => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </label>
                  <div className="actions">
                    {TRANSITIONS[t.status].map((to) => (
                      <button key={to} className="btn small" onClick={() => void move(t, to)}>
                        {t.status === 'FAILED' && to === 'QUEUED' ? 'Retry' : `→ ${to}`}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </section>
          );
        })}
      </div>
    </section>
  );
}
