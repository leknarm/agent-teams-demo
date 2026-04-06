# BUG-008: Auto-Save Race Condition — Stale Form State Dispatched After Server Response

**Severity:** minor
**Component:** frontend
**Status:** open
**Assigned to:** frontend-builder

## Steps to Reproduce
1. Open the form builder for any form
2. Rapidly make multiple changes (e.g., add a field, immediately change its label)
3. Wait 2 seconds for auto-save to fire
4. Observe that after auto-save completes, the `SET_FORM` dispatch overwrites the local state

## Expected Behavior
After a successful auto-save, the local builder state should reflect the server-confirmed state AND any changes made after the save was initiated.

## Actual Behavior

`FormBuilderPage.tsx:127-137`:
```tsx
autoSaveTimerRef.current = setTimeout(async () => {
  try {
    const req = buildUpdateRequest(currentForm);
    await updateForm.mutateAsync(req);
    setSaveStatus('saved');
    dispatch({ type: 'SET_FORM', form: currentForm });  // <-- BUG: captures stale closure
    setTimeout(() => setSaveStatus('idle'), 2000);
  } catch {
    setSaveStatus('error');
    toast.error('Failed to save changes');
  }
}, 2000);
```

`currentForm` is captured at the time the `useEffect` fires. If the user makes additional changes during the 2-second debounce, those changes are saved. But after the server responds, `dispatch({ type: 'SET_FORM', form: currentForm })` resets `isDirty` to `false` using the old snapshot of the form, not the server response. This means:

1. Changes made between debounce start and server response will not trigger another auto-save
2. The `isDirty` flag is incorrectly reset even though unsynced changes may exist

## Suggested Fix
Use the server response to update the form, not the captured closure:

```tsx
const serverForm = await updateForm.mutateAsync(req);
setSaveStatus('saved');
dispatch({ type: 'SET_FORM', form: serverForm });  // use server-confirmed data
```

This also ensures the form's fields get server-assigned IDs for any newly created fields, which is necessary for subsequent updates to correctly identify and update them.
