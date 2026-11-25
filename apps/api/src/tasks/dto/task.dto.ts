import { Priority, TaskStatus } from '@prisma/client';
import { IsArray, IsDateString, IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { PageQueryDto } from '../../common-page.dto';

export class CreateTaskDto {
  @IsString() @MinLength(1) @MaxLength(200) title!: string;
  @IsString() @MinLength(1) @MaxLength(10_000) objective!: string;
  @IsOptional() @IsEnum(Priority) priority?: Priority;
  @IsOptional() @IsDateString() dueAt?: string;
  @IsOptional() @IsArray() @IsUUID('all', { each: true }) dependsOn?: string[];
}

export class TransitionDto {
  @IsEnum(TaskStatus) to!: TaskStatus;
}

export class TaskListQueryDto extends PageQueryDto {
  @IsOptional() @IsEnum(TaskStatus) status?: TaskStatus;
}

export class AssignDto {
  /** An agent id from the roster, or null to unassign. */
  @ValidateIf((o: AssignDto) => o.agentId !== null)
  @IsString()
  @MaxLength(100)
  agentId!: string | null;
}
