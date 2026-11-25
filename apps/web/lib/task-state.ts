import type { TaskStatus } from './types';

// UI hint only. The API enforces the real rules (same table as apps/api/src/tasks/task-state.ts).
// Move to a shared package once packages/shared-types exists.
export const STATUSES: TaskStatus[] = [
  'QUEUED', 'ASSIGNED', 'RUNNING', 'WAITING', 'BLOCKED', 'REVIEW', 'COMPLETED', 'FAILED', 'CANCELLED',
];

export const TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  QUEUED: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['RUNNING', 'QUEUED', 'CANCELLED'],
  RUNNING: ['WAITING', 'BLOCKED', 'REVIEW', 'FAILED', 'CANCELLED'],
  WAITING: ['RUNNING', 'FAILED', 'CANCELLED'],
  BLOCKED: ['RUNNING', 'QUEUED', 'FAILED', 'CANCELLED'],
  REVIEW: ['COMPLETED', 'RUNNING', 'FAILED', 'CANCELLED'],
  FAILED: ['QUEUED'],
  COMPLETED: [],
  CANCELLED: [],
};
