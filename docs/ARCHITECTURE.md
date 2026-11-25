# WorkAI architecture (current state: Phase 0/1)

```
Browser -> Next.js web (apps/web) -> NestJS API (apps/api) -> PostgreSQL (Docker)
```

Implemented: health check, owner auth (JWT), projects, tasks with dependencies and a validated status state machine, audit log.
Not implemented yet: Jarvis, orchestrator, agents, tool gateway, events/WebSockets, 3D office.

Rules carried over from the blueprint: backend state is the source of truth; every resource access is authorization-checked
(non-owned resources return 404); task transitions are validated server-side; every mutation writes an audit record.
