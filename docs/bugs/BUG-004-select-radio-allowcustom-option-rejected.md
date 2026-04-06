# BUG-004: SELECT/RADIO Fields Reject Valid "__other__" Custom Option Submissions

**Severity:** major
**Component:** backend
**Status:** open
**Assigned to:** backend-builder

## Steps to Reproduce
1. Create and publish a form with a SELECT field that has an option `{ "label": "Other", "value": "__other__", "allowCustom": true }` (matching the example in `api-contracts.md` section 1.3)
2. Submit `POST /api/v1/public/forms/{id}/submissions` with:
```json
{
  "data": {
    "subject": "__other__"
  }
}
```

## Expected Behavior
The submission should succeed — `__other__` is a valid option value defined in the field's options list.

## Actual Behavior
This specific case would actually pass since `__other__` is present as a value in `options`. However, the `allowCustom: true` semantic implies that when a user selects "Other", they can type a custom value. If a frontend sends a custom text value like `"subject": "my custom reason"`, the backend validation in `SubmissionServiceImpl.validateFieldValue()` (line 299-305) will reject it with "Invalid option selected" because custom values are not in the options list.

```java
case SELECT, RADIO -> {
    if (field.getOptions() != null) {
        boolean valid = field.getOptions().stream()
                .anyMatch(opt -> strValue.equals(opt.get("value")));
        if (!valid) {
            errors.add(new FieldErrorDetail(fieldName, "Invalid option selected"));
        }
    }
}
```

The backend has no awareness of `allowCustom` in the option definition, so it will reject any custom value even for fields that explicitly declare `allowCustom: true`.

## Evidence

`SubmissionServiceImpl.java:298-305`:
```java
case SELECT, RADIO -> {
    if (field.getOptions() != null) {
        boolean valid = field.getOptions().stream()
                .anyMatch(opt -> strValue.equals(opt.get("value")));
        if (!valid) {
            errors.add(new FieldErrorDetail(fieldName, "Invalid option selected"));
        }
    }
}
```

`api-contracts.md` section 1.3 shows `{ "label": "Other", "value": "__other__", "allowCustom": true }` as a valid option pattern.

## Suggested Fix
Update the validation for SELECT and RADIO fields to check for `allowCustom` flag:

```java
case SELECT, RADIO -> {
    if (field.getOptions() != null) {
        boolean hasAllowCustom = field.getOptions().stream()
                .anyMatch(opt -> Boolean.TRUE.equals(opt.get("allowCustom")));
        boolean valid = hasAllowCustom || field.getOptions().stream()
                .anyMatch(opt -> strValue.equals(opt.get("value")));
        if (!valid) {
            errors.add(new FieldErrorDetail(fieldName, "Invalid option selected"));
        }
    }
}
```
