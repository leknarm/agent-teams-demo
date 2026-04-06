# BUG-002: PUT /api/v1/forms/{id} Returns 422 Instead of Contract-Specified 422 (Correct) but Error Message is Misleading

**Severity:** minor
**Component:** backend
**Status:** open
**Assigned to:** backend-builder

## Steps to Reproduce
1. Create a form: `POST /api/v1/forms`
2. Add a field and publish: `POST /api/v1/forms/{id}/publish`
3. Attempt to update: `PUT /api/v1/forms/{id}` with a valid body

## Expected Behavior
Per `api-contracts.md` section 1.4:
- Status 422 is returned
- Error message indicates the form is published and must be unpublished first

## Actual Behavior
`FormServiceImpl.java:128-130` throws a `BusinessException` with the message: *"Cannot edit a published form. Close it first to make changes."*

The word "Close" is misleading — the contract says *"must unpublish first"* and implies there should be a mechanism to unpublish, but no such endpoint exists (only `close` transitions to CLOSED status, it does not allow re-editing).

Additionally, `BusinessException` without an explicit `HttpStatus` defaults to `UNPROCESSABLE_ENTITY` (422), which is correct per the contract. However, the integration test `FormControllerIntegrationTest.java:104-106` asserts `isUnprocessableEntity()` and passes, so this is a message quality issue rather than a functional defect.

## Evidence

`FormServiceImpl.java:128-130`:
```java
if (form.getStatus() == FormStatus.PUBLISHED) {
    throw new BusinessException("Cannot edit a published form. Close it first to make changes.");
}
```

The API contract for close endpoint (1.7) transitions to CLOSED, not back to DRAFT. There is no "unpublish" endpoint. Users cannot make the form editable again by "closing" it — closing only stops new submissions. The error message suggests a workflow that doesn't exist.

## Suggested Fix
Update the error message to accurately describe the available options:
```java
throw new BusinessException("Cannot edit a published form. Only DRAFT and CLOSED forms can be updated.");
```

Also consider whether a revert-to-draft endpoint should be added as a feature.
