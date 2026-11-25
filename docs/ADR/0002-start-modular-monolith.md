# ADR 0002 — Start as a modular monolith

- Status: Accepted
- Decision: One NestJS API app with feature modules (auth, projects, tasks, later jarvis, orchestrator, agent-runtime, tool-gateway). Split into services only when scale or reliability requires it.
- Redis/queue is deliberately NOT added until Phase 3, when background workers are needed.
