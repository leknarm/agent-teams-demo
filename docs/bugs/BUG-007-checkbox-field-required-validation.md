# BUG-007: CHECKBOX Field Required Validation Has Inconsistent Behavior Between Frontend and Backend

**Severity:** minor
**Component:** integration
**Status:** open
**Assigned to:** backend-builder

## Steps to Reproduce
1. Create and publish a form with a required CHECKBOX field
2. Submit without checking the checkbox (value is `false` or absent)

## Expected Behavior
A required CHECKBOX field should reject a `false` value just as it rejects a missing value. A checkbox that is "required" typically means the user must check it (e.g., "I agree to Terms").

## Actual Behavior

**Backend** `SubmissionServiceImpl.java:254-255`:
```java
String strValue = value != null ? value.toString().trim() : null;
boolean isEmpty = strValue == null || strValue.isEmpty();
```

When a checkbox is submitted with `false`, `strValue` becomes `"false"` and `isEmpty` is `false`. So the required check passes, even though `false` means the user did not check it.

**Frontend** `validation.ts:5-12`:
```typescript
if (field.required) {
  const isEmpty =
    value === undefined || value === null || value === '' ||
    (Array.isArray(value) && value.length === 0);
  if (isEmpty) return 'This field is required';
}
```

The frontend also does not treat `false` as empty for checkbox fields.

Both frontend and backend will accept `false` as a valid value for a "required" checkbox, meaning the "required" constraint has no effect.

## Evidence

`SubmissionServiceImpl.java:253-265` — generic emptiness check that doesn't understand `false` as "unchecked"
`validation.ts:5-12` — same gap in frontend

## Suggested Fix

Backend: Add a special case for CHECKBOX fields:
```java
if (field.getType() == FieldType.CHECKBOX) {
    boolean isChecked = "true".equalsIgnoreCase(strValue);
    isEmpty = !isChecked;
}
```

Frontend: Add a similar case in `validateField`:
```typescript
if (field.type === 'CHECKBOX') {
  if (value === false || value === 'false') return 'This field is required';
}
```
