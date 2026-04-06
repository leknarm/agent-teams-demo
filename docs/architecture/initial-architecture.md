# Initial Architecture -- Dynamic Form Builder

**Date:** 2026-04-06
**Status:** Draft -- will be refined as user stories arrive

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Next.js Frontend (App Router)             │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │  │
│  │  │ FormBuilder   │  │ FormRenderer │  │ Dashboard  │  │  │
│  │  │ (drag & drop, │  │ (public form │  │ (list,     │  │  │
│  │  │  config UI)   │  │  filling)    │  │  analytics)│  │  │
│  │  └──────────────┘  └──────────────┘  └────────────┘  │  │
│  │                        │                              │  │
│  │              ┌─────────┴─────────┐                    │  │
│  │              │  API Client Layer │                    │  │
│  │              │  (fetch + types)  │                    │  │
│  │              └─────────┬─────────┘                    │  │
│  └────────────────────────┼──────────────────────────────┘  │
└───────────────────────────┼─────────────────────────────────┘
                            │ REST (JSON) /api/v1/*
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Spring Boot Backend                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Controllers ── Services ── Repositories             │   │
│  │       │              │              │                │   │
│  │   DTOs/Validation  Domain Logic   JPA Entities       │   │
│  └──────────────────────────────────────────────────────┘   │
│                            │                                │
└────────────────────────────┼────────────────────────────────┘
                             │ JDBC
                             ▼
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │  ┌───────────┐  │
                    │  │ forms     │  │
                    │  │ fields    │  │
                    │  │ submissions│ │
                    │  │ values    │  │
                    │  └───────────┘  │
                    └─────────────────┘
```

---

## 2. Frontend Architecture

### 2.1 App Router Structure

```
frontend/src/
├── app/
│   ├── layout.tsx                 # Root layout (providers, global nav)
│   ├── page.tsx                   # Landing / redirect to dashboard
│   ├── (dashboard)/
│   │   ├── layout.tsx             # Dashboard shell (sidebar + header)
│   │   ├── page.tsx               # Form list (dashboard home)
│   │   └── forms/
│   │       ├── new/
│   │       │   └── page.tsx       # Create new form
│   │       └── [formId]/
│   │           ├── page.tsx       # Form detail / overview
│   │           ├── edit/
│   │           │   └── page.tsx   # Form builder (drag & drop editor)
│   │           └── submissions/
│   │               └── page.tsx   # View submissions for this form
│   └── f/
│       └── [formId]/
│           └── page.tsx           # Public form renderer (filling)
├── components/
│   ├── ui/                        # shadcn/ui primitives (button, input, etc.)
│   ├── form-builder/
│   │   ├── FormBuilder.tsx        # Main builder canvas + sidebar
│   │   ├── FieldPalette.tsx       # Sidebar: draggable field types
│   │   ├── FieldConfigurator.tsx  # Right panel: selected field settings
│   │   └── BuilderCanvas.tsx      # Central drop zone with field preview
│   ├── form-renderer/
│   │   ├── FormRenderer.tsx       # Renders a form from JSON schema
│   │   └── fields/               # One component per field type
│   │       ├── TextField.tsx
│   │       ├── NumberField.tsx
│   │       ├── SelectField.tsx
│   │       ├── CheckboxField.tsx
│   │       ├── DateField.tsx
│   │       ├── TextareaField.tsx
│   │       └── index.ts          # Field registry (type -> component map)
│   └── shared/
│       ├── PageHeader.tsx
│       ├── EmptyState.tsx
│       └── LoadingState.tsx
├── lib/
│   ├── api/
│   │   ├── client.ts              # Base fetch wrapper (auth, error handling)
│   │   ├── forms.ts               # Form CRUD API functions
│   │   └── submissions.ts         # Submission API functions
│   ├── hooks/
│   │   ├── useForms.ts            # SWR/React Query hook for forms
│   │   └── useSubmissions.ts
│   └── utils/
│       └── validation.ts          # Client-side validation from schema
└── types/
    ├── form.ts                    # Form, FormField, FormStatus types
    ├── submission.ts              # Submission types
    └── api.ts                     # API response wrappers, pagination, errors
```

### 2.2 Key Frontend Components

**FormBuilder** -- The core editing experience. Users drag field types from a palette onto a canvas, reorder them, and configure each field's properties (label, placeholder, validation rules, options).

- State: local React state (useState/useReducer) for the form schema being edited. No global state library needed initially.
- Persistence: auto-save via debounced PUT to `/api/v1/forms/{id}` as the user edits.
- Drag-and-drop: `@dnd-kit/core` for accessible, performant DnD.

**FormRenderer** -- Renders a form from its JSON schema definition. Used in two contexts:
1. Live preview inside the builder (read-only mode)
2. Public form filling page at `/f/{formId}`

- Uses a field registry (`Record<FieldType, React.ComponentType<FieldProps>>`) so new field types are plug-and-play.
- Validation runs client-side using rules from the schema before submission.

**Field Components** -- Each field type is a self-contained component accepting standardized props:

```typescript
interface FieldProps {
  field: FormField;         // schema definition
  value: unknown;           // current value
  onChange: (value: unknown) => void;
  error?: string;           // validation error message
  disabled?: boolean;
}
```

### 2.3 State Management

- **Server state**: React Query (TanStack Query) for all API data -- caching, revalidation, optimistic updates.
- **Form editing state**: `useReducer` within the FormBuilder page for the in-progress form schema.
- **Form filling state**: React Hook Form for the public form renderer -- handles validation, touched state, submission.
- **No global store** (Redux, Zustand) needed at this scale. Re-evaluate if cross-page shared state emerges.

### 2.4 API Client Layer

A thin wrapper around `fetch` in `lib/api/client.ts`:

```typescript
// Base client with error handling and auth headers
async function apiClient<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      // Auth header added here when auth is implemented
    },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json();
    throw new ApiError(error);
  }
  return res.json();
}
```

Resource-specific functions wrap this:

```typescript
// lib/api/forms.ts
export const formsApi = {
  list: (params?: ListParams) => apiClient<PageResponse<Form>>('/api/v1/forms', { ... }),
  get: (id: string) => apiClient<Form>(`/api/v1/forms/${id}`),
  create: (data: CreateFormRequest) => apiClient<Form>('/api/v1/forms', { method: 'POST', body: ... }),
  update: (id: string, data: UpdateFormRequest) => apiClient<Form>(`/api/v1/forms/${id}`, { method: 'PUT', body: ... }),
  delete: (id: string) => apiClient<void>(`/api/v1/forms/${id}`, { method: 'DELETE' }),
};
```

---

## 3. Backend Architecture

### 3.1 Layered Architecture

```
┌─────────────────────────────────────────────┐
│              Controller Layer                │
│  - HTTP request/response handling            │
│  - Input validation (@Valid)                 │
│  - DTO mapping                               │
│  - No business logic                         │
├─────────────────────────────────────────────┤
│              Service Layer                   │
│  - Business logic and orchestration          │
│  - Transaction boundaries (@Transactional)   │
│  - Entity <-> DTO conversion                 │
│  - Domain validation                         │
├─────────────────────────────────────────────┤
│              Repository Layer                │
│  - Spring Data JPA repositories              │
│  - Custom queries where needed               │
│  - No business logic                         │
├─────────────────────────────────────────────┤
│              Entity / Domain Layer           │
│  - JPA entities                              │
│  - Value objects                              │
│  - Enums                                     │
└─────────────────────────────────────────────┘
```

### 3.2 Package Structure

```
backend/src/main/java/com/formbuilder/
├── FormBuilderApplication.java
├── config/
│   ├── WebConfig.java              # CORS, content negotiation
│   ├── JpaConfig.java              # Auditing, custom converters
│   └── SecurityConfig.java         # Spring Security (future)
├── controller/
│   ├── FormController.java
│   └── SubmissionController.java
├── service/
│   ├── FormService.java
│   └── SubmissionService.java
├── repository/
│   ├── FormRepository.java
│   └── SubmissionRepository.java
├── entity/
│   ├── Form.java
│   ├── FormField.java
│   ├── Submission.java
│   └── SubmissionValue.java
├── dto/
│   ├── request/
│   │   ├── CreateFormRequest.java
│   │   ├── UpdateFormRequest.java
│   │   └── SubmitFormRequest.java
│   └── response/
│       ├── FormResponse.java
│       ├── FormSummaryResponse.java
│       └── SubmissionResponse.java
├── enums/
│   ├── FormStatus.java             # DRAFT, PUBLISHED, ARCHIVED
│   └── FieldType.java             # TEXT, NUMBER, EMAIL, SELECT, etc.
├── exception/
│   ├── GlobalExceptionHandler.java # @ControllerAdvice
│   ├── ResourceNotFoundException.java
│   └── ErrorResponse.java
└── mapper/
    ├── FormMapper.java             # Entity <-> DTO conversion
    └── SubmissionMapper.java
```

### 3.3 Key Entities (Java)

```java
@Entity
@Table(name = "forms")
public class Form {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FormStatus status = FormStatus.DRAFT;

    @Column(nullable = false)
    private Integer version = 1;

    @OneToMany(mappedBy = "form", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("fieldOrder ASC")
    private List<FormField> fields = new ArrayList<>();

    @Column(name = "settings", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> settings;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    private Instant deletedAt;  // soft delete
}
```

```java
@Entity
@Table(name = "form_fields")
public class FormField {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id", nullable = false)
    private Form form;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FieldType type;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String label;

    private String placeholder;

    @Column(name = "field_order", nullable = false)
    private Integer fieldOrder;

    @Column(nullable = false)
    private Boolean required = false;

    @Column(name = "validation_rules", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private List<Map<String, Object>> validationRules;

    @Column(name = "options", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private List<Map<String, Object>> options;

    @Column(name = "config", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> config;
}
```

### 3.4 API Versioning

- URL-based versioning: `/api/v1/...`
- All controllers are prefixed with `@RequestMapping("/api/v1")`
- When breaking changes are needed, create a `v2` controller alongside `v1`
- Non-breaking additions (new optional fields) do not require a version bump

---

## 4. Database Design (Preliminary)

### ER Diagram

```
┌──────────────────────┐       ┌──────────────────────┐
│        forms         │       │     form_fields      │
├──────────────────────┤       ├──────────────────────┤
│ id          UUID  PK │──┐    │ id          UUID  PK │
│ name        VARCHAR  │  │    │ form_id     UUID  FK │──┐
│ description TEXT     │  ├───>│ type        VARCHAR  │  │
│ status      VARCHAR  │  │    │ name        VARCHAR  │  │
│ version     INTEGER  │  │    │ label       VARCHAR  │  │
│ settings    JSONB    │  │    │ placeholder VARCHAR  │  │
│ created_at  TIMESTAMP│  │    │ field_order INTEGER  │  │
│ updated_at  TIMESTAMP│  │    │ required    BOOLEAN  │  │
│ deleted_at  TIMESTAMP│  │    │ validation  JSONB    │  │
└──────────────────────┘  │    │ options     JSONB    │  │
                          │    │ config      JSONB    │  │
                          │    └──────────────────────┘  │
                          │                              │
                          │    ┌──────────────────────┐  │
                          │    │    submissions       │  │
                          │    ├──────────────────────┤  │
                          ├───>│ id          UUID  PK │  │
                               │ form_id     UUID  FK │  │
                               │ data        JSONB    │  │
                               │ submitted_at TIMESTAMP│ │
                               │ created_at  TIMESTAMP│  │
                               │ updated_at  TIMESTAMP│  │
                               └──────────────────────┘  │
                                                         │
                               ┌──────────────────────┐  │
                               │  submission_values   │  │
                               ├──────────────────────┤  │
                               │ id          UUID  PK │  │
                               │ submission_id UUID FK │  │
                               │ field_id    UUID  FK │──┘
                               │ value       TEXT     │
                               │ created_at  TIMESTAMP│
                               └──────────────────────┘
```

### Core Tables

#### forms

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Primary key |
| name | VARCHAR(255) | NOT NULL | Form title |
| description | TEXT | nullable | Form description |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'DRAFT' | DRAFT, PUBLISHED, ARCHIVED |
| version | INTEGER | NOT NULL, DEFAULT 1 | Schema version for the form |
| settings | JSONB | nullable | Form-level settings (submit button text, success message, etc.) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |
| deleted_at | TIMESTAMP | nullable | Soft delete timestamp |

**Indexes:**
- `idx_forms_status` (status) -- filter by status on dashboard
- `idx_forms_deleted_at` (deleted_at) -- exclude soft-deleted in queries
- `idx_forms_created_at` (created_at DESC) -- default sort order

#### form_fields

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Primary key |
| form_id | UUID | FK -> forms.id, NOT NULL | Parent form |
| type | VARCHAR(50) | NOT NULL | Field type (TEXT, NUMBER, EMAIL, etc.) |
| name | VARCHAR(255) | NOT NULL | Machine-readable field name |
| label | VARCHAR(255) | NOT NULL | Display label |
| placeholder | VARCHAR(255) | nullable | Placeholder text |
| field_order | INTEGER | NOT NULL | Display order (0-based) |
| required | BOOLEAN | NOT NULL, DEFAULT false | Whether field is required |
| validation_rules | JSONB | nullable | Array of validation rule objects |
| options | JSONB | nullable | Array of option objects (for select, radio, checkbox) |
| config | JSONB | nullable | Extensible field-specific configuration |

**Indexes:**
- `idx_form_fields_form_id` (form_id) -- load fields for a form
- `idx_form_fields_order` (form_id, field_order) -- ordered field retrieval

#### submissions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Primary key |
| form_id | UUID | FK -> forms.id, NOT NULL | Which form was submitted |
| data | JSONB | NOT NULL | Complete submission data as key-value JSON |
| submitted_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | When the user submitted |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_submissions_form_id` (form_id) -- list submissions per form
- `idx_submissions_submitted_at` (submitted_at DESC) -- sort by submission time

#### submission_values

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Primary key |
| submission_id | UUID | FK -> submissions.id, NOT NULL | Parent submission |
| field_id | UUID | FK -> form_fields.id, NOT NULL | Which field this value belongs to |
| value | TEXT | nullable | The submitted value (serialized as text) |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation time |

**Indexes:**
- `idx_submission_values_submission_id` (submission_id) -- load values for a submission
- `idx_submission_values_field_id` (field_id) -- query by field across submissions

**Design note:** Submissions use a dual storage strategy:
1. `submissions.data` (JSONB) stores the complete submission as a denormalized JSON document for fast reads and simple queries.
2. `submission_values` stores individual field values in a normalized table for structured queries, filtering, and reporting.

This gives us the best of both worlds -- fast reads from the JSONB column, and queryable individual values when needed for analytics or export.

---

## 5. API Design Principles

### 5.1 REST Conventions

| Pattern | Convention | Example |
|---------|-----------|---------|
| Base path | `/api/v1/` | `/api/v1/forms` |
| Resource names | Plural nouns | `/forms`, `/submissions` |
| Resource by ID | `/{resource}/{id}` | `/forms/550e8400-...` |
| Nested resources | `/{parent}/{id}/{child}` | `/forms/{id}/submissions` |
| Actions (non-CRUD) | POST with verb | `/forms/{id}/publish` |

### 5.2 HTTP Methods

| Method | Usage | Response Code |
|--------|-------|---------------|
| GET | Retrieve resource(s) | 200 |
| POST | Create resource | 201 + Location header |
| PUT | Full update | 200 |
| PATCH | Partial update | 200 |
| DELETE | Remove resource | 204 (no body) |

### 5.3 Pagination

All list endpoints return paginated responses using Spring Data's `Pageable`:

```
GET /api/v1/forms?page=0&size=20&sort=createdAt,desc
```

Standard page response envelope:

```json
{
  "content": [ ... ],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 42,
    "totalPages": 3
  }
}
```

### 5.4 Error Response Format

All errors follow a consistent structure:

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [
    { "field": "name", "message": "must not be blank" },
    { "field": "fields[0].label", "message": "must not be blank" }
  ],
  "timestamp": "2026-04-06T10:00:00Z",
  "path": "/api/v1/forms"
}
```

Standard error codes used:
- `400` -- Validation errors, malformed request
- `404` -- Resource not found
- `409` -- Conflict (e.g., duplicate name)
- `422` -- Unprocessable entity (valid JSON but invalid business logic)
- `500` -- Unexpected server error (logged, generic message to client)

### 5.5 Filtering

Query parameters for filtering:

```
GET /api/v1/forms?status=PUBLISHED&search=contact
```

### 5.6 Preliminary Endpoint Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/forms` | List forms (paginated, filterable) |
| POST | `/api/v1/forms` | Create a new form |
| GET | `/api/v1/forms/{id}` | Get form with fields |
| PUT | `/api/v1/forms/{id}` | Update form and fields |
| DELETE | `/api/v1/forms/{id}` | Soft-delete a form |
| POST | `/api/v1/forms/{id}/publish` | Publish a draft form |
| GET | `/api/v1/forms/{id}/submissions` | List submissions for a form |
| POST | `/api/v1/forms/{id}/submissions` | Submit a form response |
| GET | `/api/v1/submissions/{id}` | Get a single submission |
| DELETE | `/api/v1/submissions/{id}` | Delete a submission |

---

## 6. Cross-cutting Concerns

### 6.1 Authentication & Authorization

**Initial phase:** No auth. All endpoints are open. This lets us build and test the core form builder functionality without friction.

**Planned approach (phase 2):**
- Spring Security with JWT tokens
- Stateless sessions -- JWT in `Authorization: Bearer <token>` header
- Role-based access: `ADMIN` (full access), `USER` (own forms only)
- Public form filling endpoints (`POST /api/v1/forms/{id}/submissions`) remain unauthenticated
- Form viewing for filling (`GET /api/v1/public/forms/{id}`) is a separate public endpoint

### 6.2 CORS Configuration

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:3000")  // Next.js dev server
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}
```

Production: restrict `allowedOrigins` to the actual frontend domain via environment variable.

### 6.3 Validation Strategy

**Two layers of validation:**

1. **Backend (source of truth):**
   - Bean Validation annotations (`@NotBlank`, `@Size`, `@Valid`) on request DTOs
   - Custom validators for business rules (e.g., published forms must have at least one field)
   - Submission validation against the form schema's validation rules (dynamic validation in the service layer)
   - `@ControllerAdvice` catches `MethodArgumentNotValidException` and returns structured error responses

2. **Frontend (UX optimization):**
   - React Hook Form with schema-driven validation for instant feedback
   - Client validation mirrors backend rules but is never trusted as authoritative
   - FormBuilder validates the form schema itself (e.g., field names must be unique)

### 6.4 Logging

- SLF4J + Logback (Spring Boot default)
- Structured logging format for production (JSON)
- Log levels: ERROR for exceptions, WARN for business rule violations, INFO for API request/response summaries, DEBUG for development
- Request/response logging via a Spring `Filter` or `HandlerInterceptor` (log method, path, status, duration)
- No sensitive data in logs (mask field values in submission logs)

### 6.5 Environment Configuration

```yaml
# application.yml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/formbuilder
    username: ${DB_USERNAME:formbuilder}
    password: ${DB_PASSWORD:formbuilder}
  jpa:
    hibernate:
      ddl-auto: validate  # Flyway manages schema
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect
  flyway:
    enabled: true
    locations: classpath:db/migration
```

### 6.6 Database Migrations

- Flyway for schema migrations
- Migration files: `db/migration/V1__create_forms_table.sql`, `V2__create_form_fields_table.sql`, etc.
- `ddl-auto: validate` in production -- Hibernate validates entities match the schema but never modifies it
- `ddl-auto: create-drop` acceptable in local dev for fast iteration

---

## 7. Considerations & Trade-offs

### JSONB vs Normalized Tables for Field Configuration

**Decision:** Use JSONB columns for `validation_rules`, `options`, and `config` on `form_fields`.

- **Why JSONB:** These are semi-structured, vary per field type, and are always read/written as a unit with their parent field. Normalizing them into separate tables would add complexity (extra joins, more entities) without meaningful query benefit.
- **Trade-off:** Harder to query individual validation rules across all fields. Acceptable because this is not an expected access pattern.

### Dual Submission Storage (JSONB + Normalized)

**Decision:** Store submission data both as a JSONB blob on `submissions` and as individual rows in `submission_values`.

- **Why:** The JSONB column makes it trivial to display a submission (one read, no joins). The normalized table supports future features like filtering submissions by field value, aggregations, and CSV export with proper columns.
- **Trade-off:** Write amplification on submission -- we write data twice. Acceptable because form submissions are a write-once, read-many workload.

### No Auth in Phase 1

**Decision:** Ship without authentication initially.

- **Why:** Reduces initial complexity, lets us validate the form builder UX faster. Auth is a well-understood problem we can add cleanly later via Spring Security.
- **Risk:** Must be added before any production deployment with real user data.

### Server Components vs Client Components

**Decision:** Use Server Components for data-fetching pages (form list, submission list) and Client Components for interactive features (FormBuilder, FormRenderer).

- **Why:** Server Components reduce client bundle size and simplify data fetching for read-heavy pages. The builder and renderer require rich interactivity that demands client-side state.

---

## 8. Open Questions

1. **Multi-tenancy** -- Will this serve multiple organizations? If so, we need tenant isolation (separate schemas, row-level security, or a `tenant_id` column). Currently designed as single-tenant.

2. **File uploads** -- The `file` field type is listed but storage strategy is TBD (local disk, S3, etc.). Will design when this field type is prioritized.

3. **Form versioning** -- Should publishing a form create an immutable snapshot? Important if submissions should reference the exact form version they were filled against. Current design has a `version` integer but no version history table yet.

4. **Rate limiting** -- Public form submission endpoints will need rate limiting to prevent abuse. Not designed yet.

5. **Analytics** -- Submission counts, completion rates, field-level analytics. Will inform whether `submission_values` needs additional indexes or if a separate analytics table is warranted.
