---
name: Playwright E2E Setup
description: Playwright is installed at @playwright/test v1.59.1 in frontend/; tests in frontend/e2e/; run via `npm run test:e2e`
type: project
---

Playwright 1.59.1 is installed as a devDependency in `frontend/package.json`. Tests live in `frontend/e2e/`. The npm script `test:e2e` runs `playwright test --reporter=list`. Config at `frontend/playwright.config.ts` (baseURL: http://localhost:3000, chromium only, screenshot on failure).

**Why:** Added during initial QA E2E testing setup on 2026-04-06.
**How to apply:** Use `npm run test:e2e` from `frontend/` to run all E2E tests. Failure artifacts go to `frontend/test-results/`. Screenshots go to `frontend/e2e/screenshots/`.
