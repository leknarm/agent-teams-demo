# BUG-013: Public Form Page (/f/[formId]) Does Not Load Form Content

**Severity:** critical
**Component:** frontend
**Status:** open
**Assigned to:** frontend-builder

## Steps to Reproduce
1. Via API, create and publish a form with fields
2. Navigate to http://localhost:3000/f/{formId}
3. Wait for page to load (15 seconds)
4. Observe the page content

## Expected Behavior
The public form page should display:
- Form title
- Form description
- All form fields as input controls
- A "Submit" button

## Actual Behavior
The page loads (does not show an error), but the form content (title, fields, submit button) is never rendered. The page appears stuck in a loading or blank state — `getByText('FormName')` finds nothing after 10 seconds.

## Evidence

### Playwright error:
```
Error: expect(locator).toBeVisible() failed
Locator: getByText('Playwright Submit Test')
Expected: visible
Timeout: 10000ms
Error: element(s) not found
```

### API verification:
- `POST http://localhost:8080/api/v1/forms` with fields → returns 201 with form ID
- `PATCH http://localhost:8080/api/v1/forms/{id}/status` → publishes form
- `GET http://localhost:8080/api/v1/public/forms/{id}` (called by `formsApi.getPublic`) → should return the form

## Likely Root Cause

The `PublicFormPage` component uses `usePublicForm(formId)` which calls `formsApi.getPublic(formId)` → `GET /api/v1/public/forms/{id}`. If `@tanstack/react-query` fails to initialize (BUG-010), the `useQuery` hook never executes, leaving `isLoading: true` indefinitely or the component stuck before rendering.

Additionally, the public form page is under `/app/f/[formId]/` which uses `'use client'` via `PublicFormPage`. The same chunk loading issue may affect this route.

## Additional Issue: "Form Not Found" Page Not Shown for Non-Existent Forms

When navigating to `/f/00000000-0000-0000-0000-000000000000`, the "Form Not Found" message never appears. This could be because:
1. The loading state never resolves (stuck in `isLoading: true`)
2. The error handler in `PublicFormPage` doesn't execute because `isError` never becomes `true`

## Related Bugs
- BUG-010: Missing @tanstack vendor chunk
- BUG-011: Dashboard form cards not rendering

## Suggested Fix
Fix BUG-010 first. After clearing the `.next` cache and restarting the dev server, re-test:
1. Navigate to `/f/{publishedFormId}`
2. Verify the form title and fields render
3. Verify `/f/00000000-0000-0000-0000-000000000000` shows "Form Not Found"
