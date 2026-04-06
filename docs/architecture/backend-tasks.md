# Backend Tasks -- Dynamic Form Builder

**Date:** 2026-04-06
**Tech:** Java 21, Spring Boot 3.x, Spring Data JPA, PostgreSQL, Flyway

Tasks are ordered by dependency. Earlier tasks must be completed before later ones that depend on them.

---

## Phase 1: Foundation

### BE-1: Project Setup & Configuration

**Description:** Initialize the Spring Boot project with all required dependencies and base configuration.

**Work Items:**
- Initialize Spring Boot project via Spring Initializr (or build.gradle/pom.xml manually):
  - spring-boot-starter-web
  - spring-boot-starter-data-jpa
  - spring-boot-starter-validation
  - flyway-core
  - postgresql driver
  - lombok (optional but recommended)
  - spring-boot-starter-test
  - h2 (for testing)
- Configure `application.yml`:
  - DataSource: PostgreSQL connection (via env vars)
  - JPA: `ddl-auto: validate`, PostgreSQL dialect
  - Flyway: enabled, migration locations
  - Server: port 8080
  - Jackson: configure date serialization (ISO 8601), snake_case vs camelCase (use camelCase for JSON)
- Configure `application-test.yml`: H2 in-memory database for tests
- Create `WebConfig.java`: CORS configuration allowing `http://localhost:3000`
- Create `JpaConfig.java`: enable JPA auditing (`@EnableJpaAuditing`)
- Set up package structure per architecture doc
- Create Docker Compose file for local PostgreSQL (port 5432, database `formbuilder`)

**Acceptance Criteria:**
- Application starts with `./gradlew bootRun` (or `mvn spring-boot:run`)
- PostgreSQL connection works (local or Docker)
- Flyway runs migrations on startup
- CORS allows requests from `http://localhost:3000`
- Tests run with H2 in-memory database
- Jackson serializes dates as ISO 8601 strings

---

### BE-2: Database Migrations (Flyway)

**Description:** Create all Flyway migration scripts for the initial database schema.

**Work Items:**
- `V1__create_forms_table.sql`:
  ```sql
  CREATE TABLE forms (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
      version INTEGER NOT NULL DEFAULT 1,
      settings JSONB DEFAULT '{}',
      theme JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
  );
  CREATE INDEX idx_forms_status ON forms(status) WHERE deleted_at IS NULL;
  CREATE INDEX idx_forms_created_at ON forms(created_at DESC);
  ```
- `V2__create_form_fields_table.sql`:
  ```sql
  CREATE TABLE form_fields (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,
      name VARCHAR(255) NOT NULL,
      label VARCHAR(500) NOT NULL,
      placeholder VARCHAR(500),
      help_text VARCHAR(1000),
      field_order INTEGER NOT NULL,
      page INTEGER NOT NULL DEFAULT 0,
      required BOOLEAN NOT NULL DEFAULT false,
      default_value TEXT,
      validation_rules JSONB DEFAULT '[]',
      options JSONB,
      config JSONB DEFAULT '{}',
      visibility_rules JSONB,
      CONSTRAINT uq_form_fields_form_name UNIQUE (form_id, name)
  );
  CREATE INDEX idx_form_fields_form_id ON form_fields(form_id);
  CREATE INDEX idx_form_fields_form_order ON form_fields(form_id, field_order);
  ```
- `V3__create_submissions_table.sql`:
  ```sql
  CREATE TABLE submissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      form_id UUID NOT NULL REFERENCES forms(id),
      form_version INTEGER NOT NULL,
      data JSONB NOT NULL,
      submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE INDEX idx_submissions_form_id ON submissions(form_id);
  CREATE INDEX idx_submissions_submitted_at ON submissions(form_id, submitted_at DESC);
  CREATE INDEX idx_submissions_data ON submissions USING GIN (data);
  ```
- `V4__create_submission_values_table.sql`:
  ```sql
  CREATE TABLE submission_values (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
      field_id UUID REFERENCES form_fields(id),
      field_name VARCHAR(255) NOT NULL,
      value TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE INDEX idx_submission_values_submission_id ON submission_values(submission_id);
  CREATE INDEX idx_submission_values_field_id ON submission_values(field_id);
  CREATE INDEX idx_submission_values_field_name ON submission_values(field_name, value);
  ```

**Acceptance Criteria:**
- All migrations run cleanly on a fresh database
- Migrations are idempotent (Flyway tracks versions)
- Indexes are created correctly
- Foreign key constraints are in place
- JSONB columns accept valid JSON

---

### BE-3: Entity Layer

**Description:** Create all JPA entity classes matching the database schema.

**Work Items:**
- Create `enums/FormStatus.java`: DRAFT, PUBLISHED, CLOSED, ARCHIVED
- Create `enums/FieldType.java`: TEXT, TEXTAREA, NUMBER, EMAIL, URL, PHONE, DATE, TIME, DATETIME, SELECT, MULTI_SELECT, RADIO, CHECKBOX, FILE, RATING, SCALE, SECTION, CONTENT, HIDDEN
- Create `entity/Form.java` with all fields, relationships, and helper methods (see data-models.md section 4.3)
- Create `entity/FormField.java` (see data-models.md section 4.4)
- Create `entity/Submission.java` (see data-models.md section 4.5)
- Create `entity/SubmissionValue.java` (see data-models.md section 4.6)

**Dependencies:** BE-2

**Acceptance Criteria:**
- Entities map correctly to database tables (Hibernate validation passes)
- JSONB columns correctly serialize/deserialize with `@JdbcTypeCode(SqlTypes.JSON)`
- `@CreationTimestamp` and `@UpdateTimestamp` work
- Soft delete filter on Form entity (`@SQLRestriction("deleted_at IS NULL")`)
- `Form.fields` ordered by `page ASC, fieldOrder ASC`
- Cascade and orphan removal configured on Form -> FormField
- Cascade and orphan removal configured on Submission -> SubmissionValue

---

### BE-4: DTO Layer

**Description:** Create all request and response DTOs with Bean Validation annotations.

**Work Items:**
- Create `dto/request/CreateFormRequest.java` (record)
- Create `dto/request/UpdateFormRequest.java` (record) with `@Valid` on nested field list
- Create `dto/request/FormFieldRequest.java` (record)
- Create `dto/request/SubmitFormRequest.java` (record)
- Create `dto/request/BulkDeleteRequest.java` (record with `List<UUID> ids`)
- Create `dto/response/FormResponse.java` (record)
- Create `dto/response/FormSummaryResponse.java` (record)
- Create `dto/response/FormFieldResponse.java` (record)
- Create `dto/response/SubmissionResponse.java` (record)
- Create `dto/response/SubmissionSummaryResponse.java` (record)
- Create `dto/response/FormAnalyticsResponse.java` (record)
- Create `dto/response/DailyCount.java` (record)
- Create `dto/response/FieldAnalytics.java` (record)
- Create `dto/response/PageResponse.java` (generic wrapper for paginated results)

**Dependencies:** BE-3

**Acceptance Criteria:**
- Request DTOs have `@NotBlank`, `@NotNull`, `@Size`, `@Valid` annotations as appropriate
- Response DTOs use Java records for immutability
- `PageResponse<T>` wraps Spring Data's `Page` into the documented format:
  ```json
  { "content": [...], "page": { "number": 0, "size": 20, "totalElements": 42, "totalPages": 3 } }
  ```
- All DTOs serialize/deserialize correctly with Jackson

---

### BE-5: Mapper Layer

**Description:** Create mapper classes for converting between entities and DTOs.

**Work Items:**
- Create `mapper/FormMapper.java`:
  - `toResponse(Form)` -> `FormResponse`
  - `toSummaryResponse(Form, Long submissionCount)` -> `FormSummaryResponse`
  - `toFieldResponse(FormField)` -> `FormFieldResponse`
  - `updateFromRequest(Form, UpdateFormRequest)` -- applies request data to existing entity
  - `toFields(Form, List<FormFieldRequest>)` -- syncs field list (create new, update existing, remove missing)
- Create `mapper/SubmissionMapper.java`:
  - `toResponse(Submission)` -> `SubmissionResponse`
  - `toSummaryResponse(Submission)` -> `SubmissionSummaryResponse`

**Dependencies:** BE-3, BE-4

**Acceptance Criteria:**
- Mappers handle null values gracefully
- `FormMapper.toFields` correctly handles the three cases: new fields (no id), updated fields (matching id), deleted fields (id not in request)
- Mappers are unit-tested

---

### BE-6: Error Handling

**Description:** Set up global exception handling with consistent error response format.

**Work Items:**
- Create `exception/ResourceNotFoundException.java` (extends RuntimeException)
- Create `exception/BusinessException.java` (extends RuntimeException, carries status code)
- Create `exception/ErrorResponse.java` (record matching the documented error format)
- Create `exception/FieldErrorDetail.java` (record for field-level errors)
- Create `exception/GlobalExceptionHandler.java` (`@RestControllerAdvice`):
  - Handle `MethodArgumentNotValidException` -> 400 with field-level details
  - Handle `ResourceNotFoundException` -> 404
  - Handle `BusinessException` -> dynamic status code
  - Handle `HttpMessageNotReadableException` -> 400 (malformed JSON)
  - Handle `Exception` -> 500 (generic, logged)

**Dependencies:** None (can start in parallel with BE-3)

**Acceptance Criteria:**
- All errors return the documented JSON format: `{ status, error, message, details, timestamp, path }`
- Validation errors include field-level detail with the field path and message
- 500 errors log the full stack trace but return a generic message to the client
- Exception handler is tested with integration tests

---

## Phase 2: Core Form CRUD

### BE-7: Repository Layer

**Description:** Create Spring Data JPA repositories with custom queries.

**Work Items:**
- Create `repository/FormRepository.java`:
  ```java
  public interface FormRepository extends JpaRepository<Form, UUID> {
      Page<Form> findByDeletedAtIsNull(Pageable pageable);
      Page<Form> findByStatusAndDeletedAtIsNull(FormStatus status, Pageable pageable);
      Page<Form> findByNameContainingIgnoreCaseAndDeletedAtIsNull(String search, Pageable pageable);
      Page<Form> findByStatusAndNameContainingIgnoreCaseAndDeletedAtIsNull(
          FormStatus status, String search, Pageable pageable);
      Optional<Form> findByIdAndDeletedAtIsNull(UUID id);
  }
  ```
- Create `repository/SubmissionRepository.java`:
  ```java
  public interface SubmissionRepository extends JpaRepository<Submission, UUID> {
      Page<Submission> findByFormId(UUID formId, Pageable pageable);
      long countByFormId(UUID formId);
      List<Submission> findByFormIdOrderBySubmittedAtDesc(UUID formId);
      void deleteByIdIn(List<UUID> ids);

      @Query("SELECT CAST(s.submittedAt AS LocalDate) as date, COUNT(s) as count " +
             "FROM Submission s WHERE s.form.id = :formId " +
             "AND s.submittedAt >= :from AND s.submittedAt <= :to " +
             "GROUP BY CAST(s.submittedAt AS LocalDate) ORDER BY date")
      List<Object[]> countByDay(@Param("formId") UUID formId,
                                @Param("from") Instant from,
                                @Param("to") Instant to);
  }
  ```
- Create `repository/SubmissionValueRepository.java`:
  ```java
  public interface SubmissionValueRepository extends JpaRepository<SubmissionValue, UUID> {
      @Query("SELECT sv.fieldName, sv.value, COUNT(sv) FROM SubmissionValue sv " +
             "WHERE sv.submission.form.id = :formId " +
             "GROUP BY sv.fieldName, sv.value")
      List<Object[]> countValuesByField(@Param("formId") UUID formId);
  }
  ```

**Dependencies:** BE-3

**Acceptance Criteria:**
- Repositories compile and Spring context loads
- Soft-delete filtering works (queries exclude deleted forms)
- Custom queries return expected results (tested with integration tests)
- Pagination and sorting work correctly

---

### BE-8: Form Service Layer

**Description:** Implement business logic for form CRUD operations.

**Work Items:**
- Create `service/FormService.java`:
  - `listForms(status, search, pageable)` -> `Page<FormSummaryResponse>`:
    - Query forms filtered by status and/or search term
    - Include submission count per form
  - `getForm(id)` -> `FormResponse`:
    - Fetch form with fields, throw 404 if not found
  - `getPublicForm(id)` -> `FormResponse`:
    - Fetch published form only, throw 404 if not published, throw 410 if closed
    - Strip internal settings (notification emails, webhook config)
  - `createForm(request)` -> `FormResponse`:
    - Create new form in DRAFT status with default settings and theme
  - `updateForm(id, request)` -> `FormResponse`:
    - Update form metadata and sync fields (create/update/delete)
    - Only allow edits on DRAFT forms (return 422 for published)
  - `deleteForm(id)`:
    - Soft-delete (set deleted_at)
  - `publishForm(id)` -> `FormResponse`:
    - Validate form has at least one non-display field
    - Change status to PUBLISHED, increment version
  - `closeForm(id)` -> `FormResponse`:
    - Change status to CLOSED (only from PUBLISHED)
  - `duplicateForm(id)` -> `FormResponse`:
    - Deep copy form and all fields, set name to "X (Copy)", status DRAFT

**Dependencies:** BE-5, BE-6, BE-7

**Acceptance Criteria:**
- All methods are `@Transactional` where appropriate
- Service throws `ResourceNotFoundException` for missing forms
- Service throws `BusinessException` for invalid state transitions (e.g., publish a published form)
- Field sync logic handles all three cases (new, update, delete)
- Public form endpoint strips notification/webhook settings
- All methods are unit-tested with mocked repositories
- Business rules are enforced:
  - Cannot update a published form's fields
  - Cannot publish a form with no fields
  - Cannot close a form that is not published

---

### BE-9: Form Controller Layer

**Description:** Create REST controllers for all form endpoints.

**Work Items:**
- Create `controller/FormController.java`:
  - `GET /api/v1/forms` -> listForms
  - `POST /api/v1/forms` -> createForm (returns 201 + Location header)
  - `GET /api/v1/forms/{formId}` -> getForm
  - `PUT /api/v1/forms/{formId}` -> updateForm
  - `DELETE /api/v1/forms/{formId}` -> deleteForm (returns 204)
  - `POST /api/v1/forms/{formId}/publish` -> publishForm
  - `POST /api/v1/forms/{formId}/close` -> closeForm
  - `POST /api/v1/forms/{formId}/duplicate` -> duplicateForm (returns 201)
- Create `controller/PublicFormController.java`:
  - `GET /api/v1/public/forms/{formId}` -> getPublicForm

**Dependencies:** BE-8

**Acceptance Criteria:**
- All endpoints match the API contracts document exactly (methods, paths, status codes)
- Request DTOs validated with `@Valid`
- Response DTOs match documented JSON structure
- `POST` endpoints return 201 with `Location` header
- `DELETE` endpoints return 204 with no body
- Controller methods are thin (delegate to service)
- Integration tests cover all endpoints:
  - Happy path
  - Validation error (400)
  - Not found (404)
  - Invalid state transition (422)

---

## Phase 3: Submissions

### BE-10: Submission Service Layer

**Description:** Implement business logic for form submissions.

**Work Items:**
- Create `service/SubmissionService.java`:
  - `submitForm(formId, request)` -> `SubmissionResponse`:
    - Validate form exists and is PUBLISHED
    - Validate all field values against the form's validation rules (dynamic validation)
    - Check submission limit (if configured)
    - Store submission data in both `submissions.data` (JSONB) and `submission_values` (normalized)
    - Return 410 if form is CLOSED
  - `listSubmissions(formId, pageable)` -> `Page<SubmissionSummaryResponse>`
  - `getSubmission(id)` -> `SubmissionResponse`
  - `deleteSubmission(id)`
  - `bulkDeleteSubmissions(formId, ids)`
  - `exportCsv(formId)` -> streaming CSV content

**Dependencies:** BE-7, BE-8

**Dynamic Validation Logic:**
```
For each field in the form definition:
  1. Check required: if field is required and value is missing/empty -> error
  2. Check type-specific rules:
     - TEXT/TEXTAREA/EMAIL/URL/PHONE: check minLength, maxLength, pattern
     - NUMBER: check min, max, numeric format
     - EMAIL: check email format regex
     - URL: check URL format regex
     - SELECT/RADIO: check value is in the options list
     - MULTI_SELECT: check all values are in options, check min/max selections
     - FILE: check file types, file size (if file upload is implemented)
     - DATE/TIME/DATETIME: check format, min/max date range
  3. Collect all errors and return them with field names
```

**Acceptance Criteria:**
- Submissions are validated against the form schema dynamically
- Validation errors return 400 with field-level details
- Dual storage works: data saved in both JSONB and normalized tables
- `form_version` is captured at submission time
- CSV export generates correct headers (field labels) and values
- CSV uses UTF-8 with BOM for Excel compatibility
- Multi-select values are joined with `;` in CSV
- Service is unit-tested with various validation scenarios
- Closed forms return 410
- Submission limit enforcement works

---

### BE-11: Submission Controller Layer

**Description:** Create REST controllers for submission endpoints.

**Work Items:**
- Create `controller/SubmissionController.java`:
  - `GET /api/v1/forms/{formId}/submissions` -> listSubmissions
  - `GET /api/v1/submissions/{submissionId}` -> getSubmission
  - `DELETE /api/v1/submissions/{submissionId}` -> deleteSubmission (204)
  - `DELETE /api/v1/forms/{formId}/submissions` -> bulkDeleteSubmissions (204)
  - `GET /api/v1/forms/{formId}/submissions/export` -> exportCsv (streaming response)
- Add to `PublicFormController.java`:
  - `POST /api/v1/public/forms/{formId}/submissions` -> submitForm (201)

**Dependencies:** BE-10

**Acceptance Criteria:**
- All endpoints match the API contracts
- CSV export sets correct headers (`Content-Type: text/csv`, `Content-Disposition`)
- CSV response is streamed (not buffered entirely in memory)
- Public submission endpoint returns 201
- Bulk delete accepts JSON body with `ids` array
- Integration tests cover:
  - Successful submission with valid data
  - Submission with validation errors (400)
  - Submission to non-published form (404)
  - Submission to closed form (410)
  - CSV export with data
  - Delete and bulk delete

---

## Phase 4: Analytics & Advanced Features

### BE-12: Analytics Service

**Description:** Implement analytics aggregation for form submissions.

**Work Items:**
- Create `service/AnalyticsService.java`:
  - `getFormAnalytics(formId, from, to)` -> `FormAnalyticsResponse`:
    - Total submission count
    - Submissions per day in the date range (fill in zeros for days with no submissions)
    - For each choice/rating/scale field: value distribution counts
    - For rating/scale fields: compute average
- Use `SubmissionValueRepository.countValuesByField()` for field-level aggregation
- Use `SubmissionRepository.countByDay()` for time-series data

**Dependencies:** BE-7, BE-8

**Acceptance Criteria:**
- Analytics only computed for relevant field types (SELECT, MULTI_SELECT, RADIO, CHECKBOX, RATING, SCALE)
- Date range defaults to last 30 days
- Days with zero submissions are included in the time series (no gaps)
- Average calculation is correct for numeric fields
- Performance is acceptable for forms with 1000+ submissions
- Unit tested with mock data

---

### BE-13: Analytics Controller

**Description:** Create the analytics REST endpoint.

**Work Items:**
- Add to `controller/FormController.java` or create `controller/AnalyticsController.java`:
  - `GET /api/v1/forms/{formId}/analytics` -> getFormAnalytics

**Dependencies:** BE-12

**Acceptance Criteria:**
- Endpoint matches API contract
- Accepts `from` and `to` query parameters (date format YYYY-MM-DD)
- Defaults: `from` = 30 days ago, `to` = today
- Returns 404 if form not found
- Integration tested

---

### BE-14: Webhook Delivery (Should-Have)

**Description:** Implement async webhook delivery when a form submission is received.

**Work Items:**
- Create `service/WebhookService.java`:
  - `deliverWebhook(form, submission)`:
    - Check if form has a `webhookUrl` configured in settings
    - Send POST request with submission data as JSON body
    - Include custom headers from `webhookHeaders`
    - Retry up to 3 times with exponential backoff on failure
    - Log delivery status
- Use `@Async` with a thread pool for non-blocking delivery
- Call from `SubmissionService.submitForm()` after successful save

**Dependencies:** BE-10

**Acceptance Criteria:**
- Webhook fires asynchronously (does not slow down submission response)
- Payload includes: formId, submissionId, formName, data, submittedAt
- Custom headers are included
- Retries 3 times with 1s, 2s, 4s delays
- Failures are logged but do not affect submission success

**User Stories:** US-5.8

---

### BE-15: Email Notification (Should-Have)

**Description:** Send email notifications when a form submission is received.

**Work Items:**
- Add `spring-boot-starter-mail` dependency
- Configure SMTP settings in `application.yml` (via env vars)
- Create `service/EmailService.java`:
  - `sendSubmissionNotification(form, submission)`:
    - Send to all emails in `form.settings.notificationEmails`
    - Email content: form name, submission timestamp, all field values formatted readably
- Call from `SubmissionService.submitForm()` after successful save
- Use `@Async` for non-blocking email delivery

**Dependencies:** BE-10

**Acceptance Criteria:**
- Email is sent asynchronously
- Email content is human-readable (not raw JSON)
- Multiple recipients supported
- SMTP failures are logged but do not affect submission
- Email sending can be disabled via configuration

**User Stories:** US-5.5

---

## Phase 5: Testing & Quality

### BE-16: Comprehensive Integration Tests

**Description:** Write integration tests covering all API endpoints end-to-end.

**Work Items:**
- `FormControllerIntegrationTest.java`:
  - Create form, get form, update form, delete form
  - Publish/close lifecycle
  - Duplicate form
  - List with pagination, filtering, search
  - Validation error scenarios
- `SubmissionControllerIntegrationTest.java`:
  - Submit to published form (happy path)
  - Submit with validation errors (required, format, range)
  - Submit to non-published form (404)
  - Submit to closed form (410)
  - List submissions with pagination
  - Get submission detail
  - Delete and bulk delete
  - CSV export
- `PublicFormControllerIntegrationTest.java`:
  - Get public form (published)
  - Get public form (not published -> 404)
  - Get public form (closed -> 410)
  - Submit public form
- `AnalyticsControllerIntegrationTest.java`:
  - Get analytics with data
  - Get analytics empty form
  - Date range filtering

**Dependencies:** BE-9, BE-11, BE-13

**Acceptance Criteria:**
- Tests use `@SpringBootTest` with `@AutoConfigureMockMvc`
- Tests use H2 or Testcontainers for PostgreSQL
- Each test class has a clean database state (per-test cleanup or transactional rollback)
- All documented error scenarios are tested
- Tests are repeatable and fast

---

## Task Dependency Graph

```
BE-1 (Project Setup)
  │
  ├── BE-2 (Flyway Migrations)
  │     │
  │     └── BE-3 (Entities)
  │           │
  │           ├── BE-4 (DTOs) ──── BE-5 (Mappers)
  │           │                       │
  │           │                       └──┐
  │           │                          │
  │           └── BE-7 (Repositories) ───┼──── BE-8 (Form Service) ──── BE-9 (Form Controller)
  │                     │                │              │
  │                     │                │              ├── BE-10 (Submission Service) ── BE-11 (Submission Controller)
  │                     │                │              │         │
  │                     │                │              │         ├── BE-14 (Webhooks)
  │                     │                │              │         └── BE-15 (Email)
  │                     │                │              │
  │                     │                │              └── BE-12 (Analytics Service) ── BE-13 (Analytics Controller)
  │                     │                │
  │                     │                │
  └── BE-6 (Error Handling) ─────────────┘

BE-16 (Integration Tests) -- after BE-9, BE-11, BE-13
```

---

## Parallelization Notes

The following tasks can proceed in parallel:

**Batch 1 (start immediately):**
- BE-1 (project setup)
- BE-6 (error handling -- no entity dependency)

**Batch 2 (after BE-1):**
- BE-2 (migrations)

**Batch 3 (after BE-2):**
- BE-3 (entities) + BE-4 (DTOs) can be developed together

**Batch 4 (after BE-3 + BE-4):**
- BE-5 (mappers), BE-7 (repositories) -- in parallel

**Batch 5 (after BE-5 + BE-7):**
- BE-8 (form service)

**Batch 6 (after BE-8):**
- BE-9 (form controller), BE-10 (submission service), BE-12 (analytics service) -- in parallel

**Batch 7 (after batch 6):**
- BE-11 (submission controller), BE-13 (analytics controller), BE-14 (webhooks), BE-15 (email) -- in parallel

**Batch 8 (after all):**
- BE-16 (integration tests)

---

## Cross-Reference: Backend Tasks to User Stories

| Task | User Stories Covered |
|------|---------------------|
| BE-2, BE-3 | Foundation for all stories |
| BE-8, BE-9 | US-1.1, US-1.2, US-1.3, US-1.4, US-1.5, US-1.6, US-1.7, US-1.9, US-5.1 |
| BE-10, BE-11 | US-3.1, US-3.2, US-3.5, US-4.2, US-5.2, US-5.3, US-5.4, US-5.6 |
| BE-12, BE-13 | US-5.7 |
| BE-14 | US-5.8 |
| BE-15 | US-5.5 |
