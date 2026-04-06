# BUG-009: Newly Added Fields Retain Client-Generated IDs After Auto-Save

**Severity:** critical
**Component:** frontend
**Status:** open
**Assigned to:** frontend-builder

## Steps to Reproduce
1. Open the form builder
2. Add a new field — a client-generated UUID is assigned (`generateId()` in `FormBuilderPage.tsx:91-96`)
3. Wait 2 seconds for auto-save
4. Make any change to the form
5. The next auto-save will send the field with the client-generated UUID as `id`

## Expected Behavior
After the first save, newly added fields receive server-assigned UUIDs. The frontend should use the server response to update local state so that subsequent saves reference the correct server-side IDs.

## Actual Behavior

`FormBuilderPage.tsx:127-137`:
```tsx
const req = buildUpdateRequest(currentForm);
await updateForm.mutateAsync(req);
setSaveStatus('saved');
dispatch({ type: 'SET_FORM', form: currentForm });  // uses LOCAL state, not server response
```

After auto-save, `SET_FORM` is dispatched with `currentForm` (the local state), NOT the server response. The server response from `PUT /api/v1/forms/{id}` contains the actual server-assigned UUIDs for new fields.

On the next auto-save, `buildUpdateRequest` will include the client-generated UUID as the field `id`. The backend's `FormMapper.syncFields()` at line 99 checks `existingById.containsKey(req.id())` — the client UUID will NOT match any existing server field, so it will be treated as a NEW field request, duplicating the field on every save cycle.

This is a critical data corruption bug: each auto-save after the first one for a form with new fields will create additional duplicate fields on the server.

## Evidence

`FormBuilderPage.tsx:91-96` — client generates UUIDs:
```tsx
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => { ... });
}
```

`FormBuilderPage.tsx:130-133`:
```tsx
await updateForm.mutateAsync(req);
setSaveStatus('saved');
dispatch({ type: 'SET_FORM', form: currentForm });  // stale local state, not server response
```

`FormMapper.java:99-107`:
```java
if (req.id() != null && existingById.containsKey(req.id())) {
    // UPDATE existing
} else {
    FormField created = toNewField(form, req);  // CREATES NEW if ID not found
    newFields.add(created);
}
```

## Suggested Fix
Use the server response from `updateForm.mutateAsync` to update local state:

```tsx
const serverForm = await updateForm.mutateAsync(req);
setSaveStatus('saved');
dispatch({ type: 'SET_FORM', form: serverForm });  // server-assigned IDs
```

This ensures field IDs are synchronized with the server after every save.
