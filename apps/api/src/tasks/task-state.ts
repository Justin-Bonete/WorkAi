import { TaskStatus } from '@prisma/client';

/** Allowed task status transitions. COMPLETED and CANCELLED are terminal. */
export const TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  QUEUED: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['RUNNING', 'QUEUED', 'CANCELLED'],
  RUNNING: ['WAITING', 'BLOCKED', 'REVIEW', 'FAILED', 'CANCELLED'],
  WAITING: ['RUNNING', 'FAILED', 'CANCELLED'],
  BLOCKED: ['RUNNING', 'QUEUED', 'FAILED', 'CANCELLED'],
  REVIEW: ['COMPLETED', 'RUNNING', 'FAILED', 'CANCELLED'],
  FAILED: ['QUEUED'], // retry
  COMPLETED: [],
  CANCELLED: [],
};

export const MAX_RETRIES = 3;

export function canTransition(from: TaskStatus, to: TaskStatus): boolean {
  return TRANSITIONS[from].includes(to);
}
