import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import { isAgentId } from '../agents/roster';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/task.dto';
import { canTransition, MAX_RETRIES } from './task-state';

/** A task cannot be assigned or started until everything it depends on is COMPLETED. */
const DEPENDENCY_GATED: TaskStatus[] = [TaskStatus.ASSIGNED, TaskStatus.RUNNING];

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  private async assertProject(userId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({ where: { id: projectId, ownerId: userId }, select: { id: true } });
    if (!project) throw new NotFoundException('Project not found');
  }

  async create(userId: string, projectId: string, dto: CreateTaskDto) {
    await this.assertProject(userId, projectId);
    const deps = [...new Set(dto.dependsOn ?? [])];
    if (deps.length > 0) {
      const found = await this.prisma.task.count({ where: { id: { in: deps }, projectId } });
      if (found !== deps.length) {
        throw new BadRequestException('Dependencies must be existing tasks in the same project');
      }
    }
    const task = await this.prisma.task.create({
      data: {
        projectId,
        title: dto.title,
        objective: dto.objective,
        priority: dto.priority,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
        dependsOn: { create: deps.map((dependsOnTaskId) => ({ dependsOnTaskId })) },
      },
      include: { dependsOn: true },
    });
    await this.audit.record({ actorId: userId, action: 'task.created', resourceType: 'task', resourceId: task.id });
    return task;
  }

  async listForProject(userId: string, projectId: string, take: number, skip: number) {
    await this.assertProject(userId, projectId);
    return this.prisma.task.findMany({
      where: { projectId },
      orderBy: { createdAt: 'asc' },
      take,
      skip,
      include: { dependsOn: true },
    });
  }

  listAll(userId: string, take: number, skip: number, status?: TaskStatus) {
    return this.prisma.task.findMany({
      where: { project: { ownerId: userId }, ...(status ? { status } : {}) },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });
  }

  async get(userId: string, id: string) {
    const task = await this.prisma.task.findFirst({
      where: { id, project: { ownerId: userId } },
      include: { dependsOn: true },
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async transition(userId: string, id: string, to: TaskStatus) {
    const task = await this.prisma.task.findFirst({
      where: { id, project: { ownerId: userId } },
      include: { dependsOn: { include: { dependsOn: { select: { status: true } } } } },
    });
    if (!task) throw new NotFoundException('Task not found');

    if (!canTransition(task.status, to)) {
      throw new BadRequestException(`Cannot move a task from ${task.status} to ${to}`);
    }
    if (DEPENDENCY_GATED.includes(to) && task.dependsOn.some((d) => d.dependsOn.status !== TaskStatus.COMPLETED)) {
      throw new BadRequestException('Task has unfinished dependencies');
    }
    const isRetry = task.status === TaskStatus.FAILED && to === TaskStatus.QUEUED;
    if (isRetry && task.retryCount >= MAX_RETRIES) {
      throw new BadRequestException(`Maximum retries (${MAX_RETRIES}) reached; escalate to a human`);
    }

    // Compare-and-set on the current status so concurrent transitions cannot both win.
    const result = await this.prisma.task.updateMany({
      where: { id, status: task.status },
      data: { status: to, ...(isRetry ? { retryCount: { increment: 1 } } : {}) },
    });
    if (result.count === 0) throw new ConflictException('Task changed concurrently; reload and try again');

    await this.audit.record({
      actorId: userId,
      action: `task.${task.status.toLowerCase()}_to_${to.toLowerCase()}`,
      resourceType: 'task',
      resourceId: id,
    });
    return this.prisma.task.findUniqueOrThrow({ where: { id } });
  }

  async assign(userId: string, id: string, agentId: string | null) {
    const task = await this.get(userId, id);
    if (agentId !== null && !isAgentId(agentId)) throw new BadRequestException('Unknown agent');
    if (task.status === TaskStatus.COMPLETED || task.status === TaskStatus.CANCELLED) {
      throw new BadRequestException('Finished tasks cannot be reassigned');
    }
    const updated = await this.prisma.task.update({
      where: { id },
      data: { assignedAgentId: agentId },
      include: { dependsOn: true },
    });
    await this.audit.record({
      actorId: userId,
      action: agentId ? 'task.assigned_to_agent' : 'task.unassigned',
      resourceType: 'task',
      resourceId: id,
    });
    return updated;
  }

  cancel(userId: string, id: string) {
    return this.transition(userId, id, TaskStatus.CANCELLED);
  }

  async retry(userId: string, id: string) {
    const task = await this.get(userId, id);
    if (task.status !== TaskStatus.FAILED) throw new BadRequestException('Only failed tasks can be retried');
    return this.transition(userId, id, TaskStatus.QUEUED);
  }
}
