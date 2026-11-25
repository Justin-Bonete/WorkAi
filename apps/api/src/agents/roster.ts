export interface AgentInfo {
  id: string;
  name: string;
  role: string;
  department: 'planning' | 'design' | 'engineering' | 'quality';
}

/** Phase 1 roster (static). Becomes database-backed AgentDefinition records in Phase 3. */
export const AGENT_ROSTER: AgentInfo[] = [
  { id: 'project-manager', name: 'Project Manager', role: 'Breaks work into tasks and tracks blockers', department: 'planning' },
  { id: 'software-architect', name: 'Software Architect', role: 'Designs system boundaries and API contracts', department: 'planning' },
  { id: 'ui-ux-designer', name: 'UI/UX Designer', role: 'Defines user flows and interface specs', department: 'design' },
  { id: 'frontend-developer', name: 'Frontend Developer', role: 'Builds the browser UI', department: 'engineering' },
  { id: 'backend-developer', name: 'Backend Developer', role: 'Builds APIs, auth and business logic', department: 'engineering' },
  { id: 'database-engineer', name: 'Database Engineer', role: 'Designs schemas and migrations', department: 'engineering' },
  { id: 'qa-engineer', name: 'QA Engineer', role: 'Writes and runs tests', department: 'quality' },
  { id: 'security-reviewer', name: 'Security Reviewer', role: 'Reviews access control and risky behavior', department: 'quality' },
];

export const isAgentId = (id: string): boolean => AGENT_ROSTER.some((a) => a.id === id);
