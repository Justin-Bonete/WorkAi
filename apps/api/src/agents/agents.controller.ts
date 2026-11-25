import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AGENT_ROSTER } from './roster';

@UseGuards(JwtAuthGuard)
@Controller('agents')
export class AgentsController {
  @Get()
  list() {
    return AGENT_ROSTER;
  }
}
