import { Priority, TaskStatus } from '@prisma/client';
import { IsArray, IsDateString, IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
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
