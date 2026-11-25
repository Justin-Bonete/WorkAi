import { TaskStatus } from '@prisma/client';
import { canTransition, TRANSITIONS } from './task-state';

describe('task state machine', () => {
  it('allows the normal happy path', () => {
    const path: TaskStatus[] = ['QUEUED', 'ASSIGNED', 'RUNNING', 'REVIEW', 'COMPLETED'];
    for (let i = 0; i < path.length - 1; i++) expect(canTransition(path[i], path[i + 1])).toBe(true);
  });

  it('does not allow skipping straight to COMPLETED', () => {
    expect(canTransition('QUEUED', 'COMPLETED')).toBe(false);
    expect(canTransition('RUNNING', 'COMPLETED')).toBe(false);
  });

  it('treats COMPLETED and CANCELLED as terminal', () => {
    expect(TRANSITIONS.COMPLETED).toHaveLength(0);
    expect(TRANSITIONS.CANCELLED).toHaveLength(0);
  });

  it('only allows FAILED -> QUEUED (retry)', () => {
    expect(TRANSITIONS.FAILED).toEqual(['QUEUED']);
  });
});
