---
name: Next.js Build Cache Corruption Pattern
description: The .next build cache can become corrupted after npm install, causing missing vendor chunks and breaking the app
type: project
---

On 2026-04-06, all E2E tests except the root redirect failed because `.next/server/vendor-chunks/` was missing `@tanstack.js`. This caused a server error on the form builder page and cascade failures on all pages using @tanstack/react-query.

**Why:** The `.next` cache was generated before `@playwright/test` was installed via `npm install`. The cache was not invalidated.
**How to apply:** If tests show server errors referencing `vendor-chunks` or module-not-found for a known dependency, suspect stale `.next` cache. Recommend `rm -rf .next` and restart dev server. Filed as BUG-010.
