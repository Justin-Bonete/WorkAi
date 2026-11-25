import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly audit: AuditService,
  ) {}

  /** MVP: a single owner account. Registration closes once any user exists. */
  async register(dto: RegisterDto) {
    if ((await this.prisma.user.count()) > 0) {
      throw new ForbiddenException('Registration is closed: an owner account already exists');
    }
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: { email: dto.email.toLowerCase(), passwordHash, role: Role.OWNER },
    });
    await this.audit.record({ actorId: user.id, action: 'user.registered', resourceType: 'user', resourceId: user.id });
    return this.issue(user.id, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    const ok = !!user && user.active && (await bcrypt.compare(dto.password, user.passwordHash));
    if (!ok || !user) {
      await this.audit.record({
        actorId: user?.id,
        action: 'auth.login',
        resourceType: 'user',
        resourceId: user?.id,
        outcome: 'failure',
      });
      throw new UnauthorizedException('Invalid credentials');
    }
    await this.audit.record({ actorId: user.id, action: 'auth.login', resourceType: 'user', resourceId: user.id });
    return this.issue(user.id, user.role);
  }

  private issue(userId: string, role: Role) {
    return { accessToken: this.jwt.sign({ sub: userId, role }) };
  }
}
