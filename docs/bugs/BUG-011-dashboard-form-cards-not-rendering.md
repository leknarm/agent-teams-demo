# BUG-011: Dashboard Form Cards Not Rendering — Forms List Appears Empty

**Severity:** critical
**Component:** frontend
**Status:** open
**Assigned to:** frontend-builder

## Steps to Reproduce
1. Navigate to http://localhost:3000/forms
2. Wait for the page to fully load (10+ seconds)
3. Observe that no form cards are rendered

## Expected Behavior
The dashboard should display a grid of form cards, one for each form returned by the API (`GET http://localhost:8080/api/v1/forms`). The API confirms there are 38 forms in the database.

## Actual Behavior
The page renders:
- "My Forms" heading
- Filter tabs (All, Draft, Published, Closed)
- "New Form" button
- Search input

But **no form cards appear at all**, even after waiting 10+ seconds. Neither the loading skeleton, error state, nor actual form cards are rendered.

## Evidence

### Playwright page snapshot (after 12 second timeout):
```yaml
- main:
  - heading "My Forms" [level=1]
  - paragraph: Build forms, collect responses...
  - button "New Form"
  - (filter tabs: All, Draft, Published, Closed)
  - (search input)
  - [NO FORM CARDS]
```

### Backend API is healthy:
`GET http://localhost:8080/api/v1/forms` returns 38 forms with `totalElements: 38`.

### Impact Chain:
- No form cards means users cannot click to edit/view any form
- "New Form" button click does not open dialog (dependent on page being in proper state)
- Navigation to form detail pages is impossible from the dashboard

## Likely Root Cause

The missing `@tanstack.js` vendor chunk (BUG-010) likely means `@tanstack/react-query` fails to initialize client-side. This causes `useFormsList()` to never execute or return data, leaving the page in a state where `isLoading` is false, `isError` is false, and `data` is undefined — which renders nothing.

## Related Bug
- BUG-010: Missing @tanstack vendor chunk in Next.js build

## Suggested Fix
Fix BUG-010 first (clear `.next` cache), then re-test this bug. If it persists after the rebuild, investigate the React Query provider initialization in `src/app/providers.tsx` and the data fetching in `src/lib/hooks/useForms.ts`.
