# ADR 0001 — Backend framework: NestJS (TypeScript)

- Status: Accepted (founder decision, 25 Nov 2026)
- Context: The blueprint proposed Python + FastAPI. The founder prefers a single-language stack (TypeScript) across web and API.
- Decision: Use NestJS 10 with Prisma and PostgreSQL. Shared types between web and API become possible later via `packages/shared-types`.
- Consequences: Python-only AI libraries are not available in-process. Model access goes through a provider adapter (Anthropic + OpenAI SDKs both have first-class TypeScript support), so this is acceptable. Agent orchestration will start as a small custom state machine rather than LangGraph (Python-first).
