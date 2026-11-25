import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PageQueryDto } from '../common-page.dto';
import { CreateTaskDto, TaskListQueryDto, TransitionDto } from './dto/task.dto';
import { TasksService } from './tasks.service';

@UseGuards(JwtAuthGuard)
@Controller()
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Post('projects/:projectId/tasks')
  create(
    @CurrentUser() user: AuthUser,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasks.create(user.id, projectId, dto);
  }

  @Get('projects/:projectId/tasks')
  listForProject(
    @CurrentUser() user: AuthUser,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() q: PageQueryDto,
  ) {
    return this.tasks.listForProject(user.id, projectId, q.take, q.skip);
  }

  @Get('tasks')
  listAll(@CurrentUser() user: AuthUser, @Query() q: TaskListQueryDto) {
    return this.tasks.listAll(user.id, q.take, q.skip, q.status);
  }

  @Get('tasks/:id')
  get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.tasks.get(user.id, id);
  }

  @Post('tasks/:id/transition')
  transition(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: TransitionDto) {
    return this.tasks.transition(user.id, id, dto.to);
  }

  @Post('tasks/:id/cancel')
  cancel(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.tasks.cancel(user.id, id);
  }

  @Post('tasks/:id/retry')
  retry(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.tasks.retry(user.id, id);
  }
}
