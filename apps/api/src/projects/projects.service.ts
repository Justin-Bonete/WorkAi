import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  async create(userId: string, dto: CreateProjectDto) {
    const project = await this.prisma.project.create({
      data: { ...dto, dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined, ownerId: userId },
    });
    await this.audit.record({ actorId: userId, action: 'project.created', resourceType: 'project', resourceId: project.id });
    return project;
  }

  list(userId: string, take: number, skip: number) {
    return this.prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });
  }

  /** Non-owned projects look identical to missing ones (404), so ids can't be probed. */
  async get(userId: string, id: string) {
    const project = await this.prisma.project.findFirst({ where: { id, ownerId: userId } });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(userId: string, id: string, dto: UpdateProjectDto) {
    await this.get(userId, id);
    const project = await this.prisma.project.update({
      where: { id },
      data: { ...dto, dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined },
    });
    await this.audit.record({ actorId: userId, action: 'project.updated', resourceType: 'project', resourceId: id });
    return project;
  }
}
