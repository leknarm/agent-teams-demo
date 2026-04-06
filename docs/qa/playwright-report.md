# Playwright E2E Test Report

**Date:** 2026-04-06
**Tester:** qa-tester
**Playwright Version:** 1.59.1
**Browser:** Chromium (Desktop)
**Frontend URL:** http://localhost:3000
**Backend URL:** http://localhost:8080

---

## Test Execution Summary

| # | Test File | Test Name | Status | Duration | Notes |
|---|-----------|-----------|--------|----------|-------|
| 1 | dashboard.spec.ts | Dashboard loads and shows forms list | FAIL | 12.3s | Form cards never render |
| 2 | create-form.spec.ts | Opens dialog and creates a new form | FAIL | 5.8s | Dialog never appears after button click |
| 3 | create-form.spec.ts | Shows validation error when name is empty | FAIL | 5.3s | Dialog never appears |
| 4 | form-builder.spec.ts | 3-panel layout loads correctly | FAIL | 0ms | beforeAll failed — server error on edit page |
| 5 | form-builder.spec.ts | Can add a field from palette to canvas | SKIP | — | Blocked by test 4 failure |
| 6 | form-builder.spec.ts | Selecting a field shows configurator | SKIP | — | Blocked by test 4 failure |
| 7 | form-submit.spec.ts | Public form renders and accepts submission | FAIL | 12.0s | Form content never loads |
| 8 | form-submit.spec.ts | Shows required field errors when submitting empty | FAIL | 11.1s | Form content never loads |
| 9 | form-submit.spec.ts | Shows Form Not Found for non-existent form | FAIL | 11.1s | Error page never renders |
| 10 | navigation.spec.ts | Navigates from dashboard to form detail and back | FAIL | 12.4s | No form cards to click on dashboard |
| 11 | navigation.spec.ts | Root URL redirects to /forms | **PASS** | 0.5s | Root redirect works correctly |
| 12 | navigation.spec.ts | Form edit page accessible via /forms/[id]/edit | FAIL | 11.4s | Server error on edit page |

**Result: 1 PASS / 9 FAIL / 2 SKIP out of 12 tests**

---

## Screenshots Location

Screenshots are saved to: `frontend/e2e/screenshots/`
Failure screenshots are saved to: `frontend/test-results/{test-name-chromium}/test-failed-1.png`

---

## Bugs Found

### BUG-010 (Critical) — Next.js Build Cache Missing @tanstack Vendor Chunk
**File:** `docs/bugs/BUG-010-next-build-cache-missing-tanstack-vendor-chunk.md`
**Assigned to:** frontend-builder

The `.next/server/vendor-chunks/` directory is missing the `@tanstack.js` chunk. The form edit page (`/forms/{id}/edit`) crashes with:
```
Error: Cannot find module './vendor-chunks/@tanstack.js'
```
This prevents the entire form builder from loading.

**Root cause:** Stale/corrupted `.next` build cache after `npm install` added new packages.
**Fix:** `rm -rf .next && npm run dev`

---

### BUG-011 (Critical) — Dashboard Form Cards Not Rendering
**File:** `docs/bugs/BUG-011-dashboard-form-cards-not-rendering.md`
**Assigned to:** frontend-builder

The `/forms` dashboard shows the page header and filter tabs but renders zero form cards, even though the backend API returns 38 forms. The page appears stuck in a state where `isLoading=false`, `isError=false`, and `data=undefined`.

**Likely cause:** Downstream effect of BUG-010 — `@tanstack/react-query` fails to initialize, so `useFormsList()` never fetches data.

---

### BUG-012 (Major) — "New Form" Button Does Not Open Create Dialog
**File:** `docs/bugs/BUG-012-create-form-dialog-not-opening.md`
**Assigned to:** frontend-builder

Clicking the "New Form" button does not open the Radix UI Dialog for creating a new form. The button registers as clicked (`[active]` state) but no dialog element appears in the DOM.

**Likely cause:** React component hydration failure due to BUG-010.

---

### BUG-013 (Critical) — Public Form Page (/f/[formId]) Does Not Load
**File:** `docs/bugs/BUG-013-public-form-page-not-loading.md`
**Assigned to:** frontend-builder

Public form pages at `/f/{formId}` fail to display any form content (title, fields, submit button) even when the form is successfully created and published via API. Additionally, navigating to a non-existent form ID doesn't show the "Form Not Found" error page.

**Likely cause:** `@tanstack/react-query` initialization failure (BUG-010) prevents `usePublicForm()` from executing.

---

## Analysis

All failures trace back to a **single root cause**: the Next.js build cache is corrupted and missing the `@tanstack.js` vendor chunk. The only test that passed (`root URL redirects to /forms`) is a simple redirect that requires no data fetching and no complex client-side JavaScript.

**Priority:** Fix BUG-010 first by clearing the `.next` cache. The other bugs (011, 012, 013) are likely cascading failures that will resolve once the build cache is regenerated.

### What Works
- Root URL redirect (`/` → `/forms`): PASS
- Backend API: All endpoints healthy, 38 forms in database
- API response format: Correct
- CSP headers: Correctly configured to allow `http://localhost:8080`
- React Query setup (`providers.tsx`): Code looks correct
- API client (`lib/api/client.ts`): Code looks correct

### What Needs Fixing (frontend-builder)
1. Clear `.next` build cache and restart dev server
2. Re-run E2E tests to confirm all features work
3. If any tests still fail after cache clear, investigate component-specific issues

---

## Re-test Instructions

After frontend-builder clears the `.next` cache:

```bash
cd /Users/x10/projects/agent-teams-demo/frontend
npm run test:e2e
```

Expected: 11+ tests should pass after fixing BUG-010.
