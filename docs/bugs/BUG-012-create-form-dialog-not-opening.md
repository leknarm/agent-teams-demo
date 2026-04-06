# BUG-012: "New Form" Button Does Not Open Create Dialog

**Severity:** major
**Component:** frontend
**Status:** open
**Assigned to:** frontend-builder

## Steps to Reproduce
1. Navigate to http://localhost:3000/forms
2. Wait for page to load
3. Click the "New Form" button
4. Observe what happens

## Expected Behavior
A modal dialog should appear with:
- Title: "Create New Form"
- A "Form Name" input field
- An optional "Description" textarea
- "Cancel" and "Create Form" buttons

## Actual Behavior
After clicking "New Form", no dialog appears. The page snapshot shows the button is clicked (`[active]` state) but `getByRole('dialog')` finds no element.

## Evidence

### Playwright error:
```
Error: expect(locator).toBeVisible() failed
Locator: getByRole('dialog')
Expected: visible
Timeout: 5000ms
Error: element(s) not found
```

### Page snapshot after button click:
```yaml
- button "New Form" [active]
- (no dialog element present in DOM)
```

## Likely Root Cause

The dialog is implemented using Radix UI `Dialog` component, which renders into a portal. If the `@tanstack/react-query` initialization fails (BUG-010), the `FormsDashboard` component may not fully hydrate, breaking the React state management (`useState` for `createOpen`). The button click handler `onClick={() => setCreateOpen(true)}` may fail silently because the component failed to mount correctly.

## Related Bugs
- BUG-010: Missing @tanstack vendor chunk
- BUG-011: Dashboard form cards not rendering

## Suggested Fix
Fix BUG-010 first. If the dialog still doesn't open after that, investigate:
- `src/components/forms/FormsDashboard.tsx` — `setCreateOpen(true)` onClick handler
- `src/components/forms/CreateFormDialog.tsx` — Radix UI Dialog `open` prop binding
- Ensure React hydration is completing successfully (no hydration mismatch errors in console)
