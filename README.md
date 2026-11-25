# WorkAI

Multi-agent AI workforce platform with a live 3D virtual office. Canonical reference: [docs/WORKAI_MASTER_BLUEPRINT.md](docs/WORKAI_MASTER_BLUEPRINT.md).

**Current status:** Phase 0 (foundation) + the Phase 1 API slice (auth, projects, tasks). No agents or Jarvis yet.

## Run it (Windows PowerShell, Docker Desktop running)

```powershell
npm install
copy apps\api\.env.example apps\api\.env
copy apps\web\.env.example apps\web\.env.local
# put a random secret in apps\api\.env  (JWT_SECRET):
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

npm run db:up          # starts PostgreSQL in Docker (host port 5433)
npm run db:migrate     # first run: name the migration "init"
npm run dev:api        # http://localhost:4000/api/health
npm run dev:web        # http://localhost:3000
npm test               # unit tests
```

## API (Phase 1)

| Method | Path | Notes |
| --- | --- | --- |
| POST | /api/auth/register | Only works while no user exists; first user becomes OWNER |
| POST | /api/auth/login | Returns `{ accessToken }` |
| GET | /api/auth/me | Bearer token |
| POST/GET | /api/projects, GET/PATCH /api/projects/:id | Owner-scoped |
| POST/GET | /api/projects/:id/tasks | Tasks may declare `dependsOn` task ids |
| GET | /api/tasks, /api/tasks/:id | `?status=`, `?take=`, `?skip=` |
| POST | /api/tasks/:id/transition, /cancel, /retry | State machine enforced; max 3 retries |

## Verification status
This scaffold was written without running `npm install`. First thing to do after install: run `npm run typecheck` and `npm test` and fix anything they report.
