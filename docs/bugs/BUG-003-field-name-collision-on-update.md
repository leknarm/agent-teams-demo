# BUG-003: Duplicate Field Names on Form Update Cause Database Constraint Error Instead of Clean 400

**Severity:** major
**Component:** backend
**Status:** open
**Assigned to:** backend-builder

## Steps to Reproduce
1. Create a form and add a field with name `email`
2. Call `PUT /api/v1/forms/{id}` with two fields both having `name: "email"`

Request body:
```json
{
  "name": "Test Form",
  "fields": [
    { "type": "EMAIL", "name": "email", "label": "Email", "fieldOrder": 0, "required": true },
    { "type": "TEXT",  "name": "email", "label": "Also Email", "fieldOrder": 1, "required": false }
  ]
}
```

## Expected Behavior
Per `api-contracts.md` section 1.4:
- Status 400 is returned
- Error details indicate duplicate field names

## Actual Behavior
The `FormMapper.syncFields()` does not validate for duplicate field names in the incoming request. The duplicate names will reach `formRepository.save()`, which will trigger a `DataIntegrityViolationException` on the database unique constraint `uq_form_fields_form_name` (defined in `FormField.java:22-24`). This exception is caught by the generic `Exception` handler in `GlobalExceptionHandler.java:75-80`, returning a 500 response instead of a 400.

## Evidence

`FormField.java:22-24`:
```java
@Table(name = "form_fields",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_form_fields_form_name",
                columnNames = {"form_id", "name"}
        ))
```

`GlobalExceptionHandler.java:75-80` — no handler for `DataIntegrityViolationException`:
```java
@ExceptionHandler(Exception.class)
public ResponseEntity<ErrorResponse> handleGeneric(Exception ex, ...) {
    ...
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)...
}
```

No test covers this scenario.

## Suggested Fix
Add a validation check in `FormMapper.syncFields()` or `FormServiceImpl.updateForm()` before saving:

```java
long distinctNames = fieldRequests.stream().map(FormFieldRequest::name).distinct().count();
if (distinctNames < fieldRequests.size()) {
    throw new BusinessException("Field names must be unique within a form.", HttpStatus.BAD_REQUEST);
}
```

Alternatively, add a `DataIntegrityViolationException` handler to `GlobalExceptionHandler` that returns 400 for constraint violations.
