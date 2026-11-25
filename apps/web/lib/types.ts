export type TaskStatus =
  | 'QUEUED' | 'ASSIGNED' | 'RUNNING' | 'WAITING' | 'BLOCKED' | 'REVIEW' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  objective: string;
  status: TaskStatus;
  priority: string;
  retryCount: number;
  assignedAgentId: string | null;
  updatedAt: string;
  dependsOn?: { taskId: string; dependsOnTaskId: string }[];
}
