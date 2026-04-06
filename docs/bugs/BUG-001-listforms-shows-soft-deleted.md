# BUG-001: List Forms Endpoint May Return Soft-Deleted Forms

**Severity:** major
**Component:** backend
**Status:** open
**Assigned to:** backend-builder

## Steps to Reproduce
1. Create a form via `POST /api/v1/forms`
2. Delete the form via `DELETE /api/v1/forms/{id}` (sets `deleted_at`)
3. Call `GET /api/v1/forms` — confirm the deleted form does NOT appear
4. Call `GET /api/v1/forms?status=DRAFT` or `GET /api/v1/forms?search=name` — check whether the deleted form appears

## Expected Behavior
Soft-deleted forms must never appear in any `GET /api/v1/forms` response, regardless of filter parameters.

## Actual Behavior
The `@SQLRestriction("deleted_at IS NULL")` annotation on the `Form` entity should automatically filter deleted records for all JPA-derived queries. However, the derived query methods `findByStatus`, `findByNameContainingIgnoreCase`, and `findByStatusAndNameContainingIgnoreCase` in `FormRepository` rely on Hibernate applying `@SQLRestriction` correctly to native-SQL queries generated from method names. This is Hibernate-version-dependent behavior.

The comment in `FormRepository.java` (line 27) itself warns: *"Explicit null check needed because `@SQLRestriction` only applies to JPQL entity queries, but `findById` bypasses the filter for some Hibernate versions."* The same risk applies to the three derived queries used in `listForms`. These are NOT explicitly filtered with `AND deletedAt IS NULL`, creating a potential data leak.

## Evidence

`FormRepository.java:21-25`:
```java
Page<Form> findByStatus(FormStatus status, Pageable pageable);
Page<Form> findByNameContainingIgnoreCase(String search, Pageable pageable);
Page<Form> findByStatusAndNameContainingIgnoreCase(FormStatus status, String search, Pageable pageable);
```

There are no explicit `deletedAt IS NULL` conditions on these methods. If `@SQLRestriction` fails to apply (e.g., under certain Hibernate versions), soft-deleted forms will leak into list results.

The existing `FormControllerIntegrationTest` does NOT test that deleted forms are excluded from filtered list results (only from the direct `GET /id` endpoint).

## Suggested Fix
Add explicit `deletedAt IS NULL` conditions to the three derived query methods, or add `@Query` annotations that include this condition explicitly:

```java
@Query("SELECT f FROM Form f WHERE f.status = :status AND f.deletedAt IS NULL")
Page<Form> findByStatusAndNotDeleted(@Param("status") FormStatus status, Pageable pageable);

@Query("SELECT f FROM Form f WHERE LOWER(f.name) LIKE LOWER(CONCAT('%', :search, '%')) AND f.deletedAt IS NULL")
Page<Form> findByNameContainingIgnoreCaseAndNotDeleted(@Param("search") String search, Pageable pageable);

@Query("SELECT f FROM Form f WHERE f.status = :status AND LOWER(f.name) LIKE LOWER(CONCAT('%', :search, '%')) AND f.deletedAt IS NULL")
Page<Form> findByStatusAndNameContainingIgnoreCaseAndNotDeleted(@Param("status") FormStatus status, @Param("search") String search, Pageable pageable);
```
