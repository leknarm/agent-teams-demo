---
name: Running Backend is from Different Project
description: The backend at localhost:8080 is make-it-easy/dynamic-form, not agent-teams-demo — has different API behavior
type: project
---

The backend server running at `http://localhost:8080` (PID 17701) is from `/Users/x10/projects/make-it-easy/dynamic-form/backend/`, NOT from `/Users/x10/projects/agent-teams-demo/backend/`. This matters for all API integration work.

**Why:** The make-it-easy server was already running from a prior project. The agent-teams-demo backend source exists but may not be running.

**Actual behavior of the running backend (make-it-easy):**
- `POST /api/v1/forms` requires `fields` array (non-null, non-empty — at least 1 field required)
- `PATCH /api/v1/forms/{id}/status` with `{ status: 'PUBLISHED' | 'CLOSED' }` works (not in agent-teams-demo API contract)
- `GET /api/v1/public/forms/{id}` → 500 Internal Server Error (broken)
- `POST /api/v1/public/forms/{id}/submissions` → 500 Internal Server Error (broken)
- `GET /api/v1/forms/{id}` (admin) → 200, works correctly
- `DELETE /api/v1/forms/{id}` → 204, works

**How to apply:** When writing E2E tests or frontend API code, use the actual behavior above rather than the API contract in `docs/architecture/api-contracts.md`. The frontend `formsApi.create` includes a default field, `usePublicForm` uses the admin endpoint, and E2E tests mock the public submit API.
