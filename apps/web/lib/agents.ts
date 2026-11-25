import type { Task, TaskStatus } from './types';

export interface Agent {
  id: string;
  name: string;
  role: string;
  department: 'planning' | 'design' | 'engineering' | 'quality';
}

export type BotState =
  | 'idle' | 'queued' | 'assigned' | 'running' | 'waiting' | 'blocked' | 'review' | 'completed' | 'failed';

export interface BotView {
  state: BotState;
  title?: string;
}

/** Office layout is presentation only; rooms group agents by their department. */
export const ROOMS: { key: Agent['department'] | 'command'; label: string; span: number }[] = [
  { key: 'command', label: 'Command center', span: 2 },
  { key: 'planning', label: 'Planning room', span: 2 },
  { key: 'design', label: 'Design studio', span: 2 },
  { key: 'engineering', label: 'Software development floor', span: 4 },
  { key: 'quality', label: 'QA & security lab', span: 2 },
];

export const STATE_LABEL: Record<BotState, string> = {
  idle: 'Idle',
  queued: 'Queued',
  assigned: 'Assigned',
  running: 'Working',
  waiting: 'Waiting',
  blocked: 'Blocked',
  review: 'In review',
  completed: 'Done',
  failed: 'Failed',
};

export const hueFor = (agentId: string): number => {
  let h = 0;
  for (const c of agentId) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
};

// Which task wins when an agent has several: the most "active" one.
const PRIORITY: TaskStatus[] = ['RUNNING', 'REVIEW', 'BLOCKED', 'WAITING', 'ASSIGNED', 'QUEUED'];

/** Derive a bot's visible state from real task records only. */
export function deriveView(agentId: string, tasks: Task[], now: number): BotView {
  const mine = tasks.filter((t) => t.assignedAgentId === agentId);
  for (const s of PRIORITY) {
    const t = mine.find((x) => x.status === s);
    if (t) return { state: s.toLowerCase() as BotState, title: t.title };
  }
  const failed = mine.find((x) => x.status === 'FAILED');
  if (failed) return { state: 'failed', title: failed.title };
  const done = mine.find((x) => x.status === 'COMPLETED' && now - new Date(x.updatedAt).getTime() < 60_000);
  if (done) return { state: 'completed', title: done.title };
  return { state: 'idle' };
}
