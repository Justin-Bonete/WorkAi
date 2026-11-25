'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { api } from '@/lib/api';
import { Agent, BotState, BotView, deriveView, hueFor, ROOMS, STATE_LABEL } from '@/lib/agents';
import type { Task } from '@/lib/types';
import Bot from './Bot';

const DEMO_STATES: BotState[] = ['idle', 'running', 'running', 'running', 'waiting', 'review', 'blocked', 'completed', 'assigned'];
const DEMO_TITLES = [
  'Draft API contract', 'Build login form', 'Write migrations', 'Review pull request',
  'Run regression tests', 'Audit auth flow', 'Design task board', 'Plan milestones',
];
const pick = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)];

export default function OfficeScene() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [mode, setMode] = useState<'live' | 'demo'>('live');
  const [demo, setDemo] = useState<Record<string, BotView>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Agent[]>('agents').then(setAgents).catch((e: Error) => setError(e.message));
  }, []);

  // Live mode: poll real task records. (Push events via WebSocket arrive in a later phase.)
  useEffect(() => {
    if (mode !== 'live') return;
    let alive = true;
    const load = () =>
      api<Task[]>('tasks?take=100')
        .then((t) => { if (alive) { setTasks(t); setError(null); } })
        .catch((e: Error) => { if (alive) setError(e.message); });
    void load();
    const id = setInterval(load, 5000);
    return () => { alive = false; clearInterval(id); };
  }, [mode]);

  // Demo mode: purely simulated activity, clearly labelled as such.
  useEffect(() => {
    if (mode !== 'demo' || agents.length === 0) return;
    const tick = () =>
      setDemo((prev) => {
        const next = { ...prev };
        for (const a of agents) {
          if (!next[a.id] || Math.random() < 0.35) next[a.id] = { state: pick(DEMO_STATES), title: pick(DEMO_TITLES) };
        }
        return next;
      });
    tick();
    const id = setInterval(tick, 2500);
    return () => clearInterval(id);
  }, [mode, agents]);

  const now = Date.now();
  const view = (id: string): BotView => (mode === 'demo' ? demo[id] ?? { state: 'idle' } : deriveView(id, tasks, now));
  const anyAssigned = tasks.some((t) => t.assignedAgentId && !['COMPLETED', 'CANCELLED'].includes(t.status));
  const sel = agents.find((a) => a.id === selected) ?? null;
  const selTasks = sel && mode === 'live' ? tasks.filter((t) => t.assignedAgentId === sel.id) : [];

  return (
    <div className="page">
      <header className="office-head">
        <div>
          <p className="eyebrow">Virtual office</p>
          <h1>The floor</h1>
        </div>
        <div className="seg" role="group" aria-label="Data source">
          <button className={mode === 'live' ? 'on' : ''} onClick={() => setMode('live')}>Live</button>
          <button className={mode === 'demo' ? 'on' : ''} onClick={() => setMode('demo')}>Demo</button>
        </div>
      </header>

      {mode === 'demo' ? (
        <div className="banner demo" role="status">
          DEMO SIMULATION: the bots are playing back random activity. No real work is happening.
        </div>
      ) : (
        <div className="banner live" role="status">
          <span className="dot" /> LIVE: showing real task assignments from your projects (refreshes every 5 seconds).
          {!anyAssigned && ' No bot has an active task yet. Assign one from a project board, or try Demo.'}
        </div>
      )}
      {error && <p className="error" role="alert">{error}</p>}

      <div className="office">
        {ROOMS.map((room) => (
          <section key={room.key} className="room" style={{ '--span': room.span } as CSSProperties} aria-label={room.label}>
            <h3>{room.label}</h3>
            <div className="desks">
              {room.key === 'command' && (
                <div className="desk static" title="Jarvis arrives in Phase 2">
                  <div className="bubble">Arrives in Phase 2</div>
                  <Bot state="idle" hue={225} />
                  <div className="surface"><span /><span /><span /></div>
                  <div className="plate"><strong>Jarvis</strong><span className="chip">Offline</span></div>
                </div>
              )}
              {agents.filter((a) => a.department === room.key).map((a) => {
                const v = view(a.id);
                return (
                  <button
                    key={a.id}
                    className={`desk st-${v.state}`}
                    aria-pressed={selected === a.id}
                    aria-label={`${a.name}: ${STATE_LABEL[v.state]}${v.title ? `, ${v.title}` : ''}`}
                    onClick={() => setSelected(selected === a.id ? null : a.id)}
                  >
                    <div className="bubble">{v.title ?? STATE_LABEL[v.state]}</div>
                    <Bot state={v.state} hue={hueFor(a.id)} />
                    <div className="surface"><span /><span /><span /></div>
                    <div className="plate"><strong>{a.name}</strong><span className={`chip ${v.state}`}>{STATE_LABEL[v.state]}</span></div>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {sel && (
        <section className="card stack" aria-live="polite">
          <h2>{sel.name}</h2>
          <p className="muted">{sel.role}</p>
          <p>
            Status: <span className={`chip ${view(sel.id).state}`}>{STATE_LABEL[view(sel.id).state]}</span>
            {view(sel.id).title && <> · {view(sel.id).title}</>}
          </p>
          {mode === 'demo' && <p className="muted">Demo data, not real tasks.</p>}
          {mode === 'live' && (selTasks.length === 0
            ? <p className="muted">No tasks assigned. Assign one from a project board.</p>
            : <ul className="plain">{selTasks.map((t) => <li key={t.id}>{t.title} <span className={`chip ${t.status.toLowerCase()}`}>{t.status}</span></li>)}</ul>)}
        </section>
      )}

      <section>
        <h2>Team status</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Agent</th><th>Role</th><th>Status</th><th>Task</th></tr></thead>
            <tbody>
              {agents.map((a) => {
                const v = view(a.id);
                return (
                  <tr key={a.id}>
                    <td>{a.name}</td>
                    <td className="muted">{a.role}</td>
                    <td><span className={`chip ${v.state}`}>{STATE_LABEL[v.state]}</span></td>
                    <td>{v.title ?? '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
