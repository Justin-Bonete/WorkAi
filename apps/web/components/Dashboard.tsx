'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Agent, deriveView, hueFor } from '@/lib/agents';
import type { Project, Task } from '@/lib/types';
import Bot from './Bot';
import ProjectList from './ProjectList';

const ACTIVE = ['ASSIGNED', 'RUNNING', 'WAITING', 'REVIEW'];

export default function Dashboard({ health }: { health: { status: string; database: string } | null }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    void api<Project[]>('projects?take=100').then(setProjects).catch(() => undefined);
    void api<Task[]>('tasks?take=100').then(setTasks).catch(() => undefined);
    void api<Agent[]>('agents').then(setAgents).catch(() => undefined);
  }, []);

  const now = Date.now();
  const count = (pred: (t: Task) => boolean) => tasks.filter(pred).length;
  const recent = [...tasks].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6);
  const working = agents.filter((a) => ['running', 'review'].includes(deriveView(a.id, tasks, now).state)).length;

  return (
    <div className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">Command center</p>
          <h1>Your AI workforce</h1>
          <p className="sub">
            API <span className={health ? 'ok' : 'bad'}>{health?.status ?? 'unreachable'}</span> · Database{' '}
            <span className={health?.database === 'ok' ? 'ok' : 'bad'}>{health?.database ?? 'unknown'}</span>
          </p>
          <Link href="/office" className="btn glow">Enter the office →</Link>
        </div>
        <div className="strip" aria-label="Your team">
          {agents.map((a) => (
            <div key={a.id} className="strip-item" title={`${a.name}: ${deriveView(a.id, tasks, now).state}`}>
              <Bot state={deriveView(a.id, tasks, now).state} hue={hueFor(a.id)} size={44} />
            </div>
          ))}
        </div>
      </section>

      <section className="stats">
        <div className="card stat"><span className="muted">Projects</span><span className="num">{projects.length}</span></div>
        <div className="card stat"><span className="muted">Tasks in progress</span><span className="num">{count((t) => ACTIVE.includes(t.status))}</span></div>
        <div className="card stat"><span className="muted">Blocked or failed</span><span className="num warn">{count((t) => t.status === 'BLOCKED' || t.status === 'FAILED')}</span></div>
        <div className="card stat"><span className="muted">Completed</span><span className="num good">{count((t) => t.status === 'COMPLETED')}</span></div>
        <div className="card stat"><span className="muted">Bots working now</span><span className="num">{working}<small>/{agents.length}</small></span></div>
      </section>

      <section>
        <h2>Latest task activity</h2>
        {recent.length === 0 ? (
          <p className="muted">Nothing yet. Create a project and add a few tasks.</p>
        ) : (
          <ul className="feed">
            {recent.map((t) => (
              <li key={t.id} className="card">
                <Link href={`/projects/${t.projectId}`}>{t.title}</Link>
                <span className={`chip ${t.status.toLowerCase()}`}>{t.status}</span>
                <span className="muted">{new Date(t.updatedAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ProjectList />
    </div>
  );
}
