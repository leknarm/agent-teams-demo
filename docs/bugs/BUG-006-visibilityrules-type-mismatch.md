# BUG-006: visibilityRules Type Mismatch Between Frontend and Backend

**Severity:** major
**Component:** integration
**Status:** open
**Assigned to:** backend-builder

## Steps to Reproduce
1. Create a form with a field that has visibility rules configured
2. Send `PUT /api/v1/forms/{id}` with a field containing `visibilityRules`
3. Fetch the form back with `GET /api/v1/forms/{id}` and observe `visibilityRules` in the response

## Expected Behavior
The frontend type `VisibilityRules` (in `types/form.ts`) has a structured shape:
```typescript
interface VisibilityRules {
  operator: 'AND' | 'OR';
  conditions: VisibilityCondition[];
}
```

This structured object should be returned as-is in `FormFieldResponse`.

## Actual Behavior
On the backend, `FormField.java:86-88` stores `visibilityRules` as `Map<String, Object>`:
```java
@Convert(converter = JsonMapConverter.class)
@Column(name = "visibility_rules", columnDefinition = "CLOB")
private Map<String, Object> visibilityRules;
```

`FormFieldResponse.java:22` also uses `Map<String, Object>`.

The `conditions` array inside `visibilityRules` will be deserialized as `List<Map<String, Object>>` in Java. When the frontend `FormRenderer.tsx:22-36` receives this and tries to use `condition.op` (accessing a typed TypeScript property), it will work at runtime because JavaScript is weakly typed. However, the TypeScript type definitions on the backend `FormFieldRequest.java:43` also uses `Map<String, Object>`:
```java
Map<String, Object> visibilityRules
```

This means no structural validation is applied to `visibilityRules` content on the backend. A malformed `visibilityRules` (e.g., invalid `operator` value, missing `conditions`) will be stored silently and can cause the `evaluateVisibility` function in `FormRenderer.tsx:18-36` to break at runtime (no null check on `conditions` before map/iteration if it's not an array).

## Evidence

`FormField.java:86-88`: backend stores as raw `Map<String, Object>`
`types/form.ts:107-115`: frontend expects structured `VisibilityRules` type
`FormRenderer.tsx:19`: `rules.conditions.length` — will throw if `conditions` is null/not-an-array

```tsx
function evaluateVisibility(rules: VisibilityRules | null, values: Record<string, unknown>): boolean {
  if (!rules || rules.conditions.length === 0) return true;  // no null check on conditions
```

## Suggested Fix

Backend: Add a dedicated `VisibilityRulesRequest` POJO with proper validation.

Frontend: Add a safety check:
```tsx
if (!rules || !rules.conditions || rules.conditions.length === 0) return true;
```
