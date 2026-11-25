import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';

function setup() {
  const prisma = {
    project: { findFirst: jest.fn() },
    task: {
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
  };
  const audit = { record: jest.fn() };
  const service = new TasksService(prisma as any, audit as any);
  return { prisma, audit, service };
}

const taskRow = (over: Record<string, unknown> = {}) => ({ id: 't1', status: 'QUEUED', retryCount: 0, dependsOn: [], ...over });

describe('TasksService', () => {
  it('returns 404 for a task the user does not own', async () => {
    const { prisma, service } = setup();
    prisma.task.findFirst.mockResolvedValue(null);
    await expect(service.transition('u1', 't1', 'ASSIGNED' as any)).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.task.findFirst.mock.calls[0][0].where.project).toEqual({ ownerId: 'u1' });
  });

  it('rejects invalid transitions', async () => {
    const { prisma, service } = setup();
    prisma.task.findFirst.mockResolvedValue(taskRow());
    await expect(service.transition('u1', 't1', 'COMPLETED' as any)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('blocks assignment while a dependency is unfinished', async () => {
    const { prisma, service } = setup();
    prisma.task.findFirst.mockResolvedValue(taskRow({ dependsOn: [{ dependsOn: { status: 'RUNNING' } }] }));
    await expect(service.transition('u1', 't1', 'ASSIGNED' as any)).rejects.toThrow('unfinished dependencies');
  });

  it('allows assignment when all dependencies are completed, and audits it', async () => {
    const { prisma, audit, service } = setup();
    prisma.task.findFirst.mockResolvedValue(taskRow({ dependsOn: [{ dependsOn: { status: 'COMPLETED' } }] }));
    prisma.task.updateMany.mockResolvedValue({ count: 1 });
    prisma.task.findUniqueOrThrow.mockResolvedValue({ id: 't1', status: 'ASSIGNED' });
    await expect(service.transition('u1', 't1', 'ASSIGNED' as any)).resolves.toMatchObject({ status: 'ASSIGNED' });
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: 'task.queued_to_assigned' }));
  });

  it('stops retrying after the maximum', async () => {
    const { prisma, service } = setup();
    prisma.task.findFirst.mockResolvedValue(taskRow({ status: 'FAILED', retryCount: 3 }));
    await expect(service.transition('u1', 't1', 'QUEUED' as any)).rejects.toThrow('Maximum retries');
  });

  it('reports a conflict when the status changed underneath us', async () => {
    const { prisma, service } = setup();
    prisma.task.findFirst.mockResolvedValue(taskRow());
    prisma.task.updateMany.mockResolvedValue({ count: 0 });
    await expect(service.transition('u1', 't1', 'ASSIGNED' as any)).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects dependencies from another project', async () => {
    const { prisma, service } = setup();
    prisma.project.findFirst.mockResolvedValue({ id: 'p1' });
    prisma.task.count.mockResolvedValue(0);
    await expect(
      service.create('u1', 'p1', { title: 'x', objective: 'y', dependsOn: ['00000000-0000-4000-8000-000000000000'] }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects assigning to an unknown agent', async () => {
    const { prisma, service } = setup();
    prisma.task.findFirst.mockResolvedValue(taskRow());
    await expect(service.assign('u1', 't1', 'nobody')).rejects.toThrow('Unknown agent');
  });

  it('does not reassign finished tasks', async () => {
    const { prisma, service } = setup();
    prisma.task.findFirst.mockResolvedValue(taskRow({ status: 'COMPLETED' }));
    await expect(service.assign('u1', 't1', 'qa-engineer')).rejects.toThrow('Finished tasks');
  });

  it('assigns a known agent and audits it', async () => {
    const { prisma, audit, service } = setup();
    prisma.task.findFirst.mockResolvedValue(taskRow());
    prisma.task.update.mockResolvedValue({ id: 't1', assignedAgentId: 'qa-engineer' });
    await service.assign('u1', 't1', 'qa-engineer');
    expect(prisma.task.update.mock.calls[0][0].data).toEqual({ assignedAgentId: 'qa-engineer' });
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: 'task.assigned_to_agent' }));
  });
});
