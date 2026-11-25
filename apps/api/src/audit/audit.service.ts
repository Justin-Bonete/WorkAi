import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditEntry {
  actorId?: string | null;
  actorType?: 'user' | 'agent' | 'system';
  action: string;
  resourceType: string;
  resourceId?: string | null;
  outcome?: 'success' | 'failure';
  correlationId?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  /** Append-only. Never put secrets or raw prompt content in an audit entry. */
  async record(entry: AuditEntry): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        actorType: entry.actorType ?? 'user',
        actorId: entry.actorId ?? null,
        action: entry.action,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId ?? null,
        outcome: entry.outcome ?? 'success',
        correlationId: entry.correlationId,
      },
    });
  }
}
