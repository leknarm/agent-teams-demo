# Data Models -- Dynamic Form Builder

**Date:** 2026-04-06
**Status:** Accepted
**Covers:** All database tables, entity relationships, JPA entities, TypeScript interfaces

---

## 1. Entity Relationship Diagram

```
┌──────────────────────┐
│        forms         │
├──────────────────────┤
│ id          UUID  PK │──────────────────────────────────────────┐
│ name        VARCHAR  │                                          │
│ description TEXT     │       ┌──────────────────────┐           │
│ status      VARCHAR  │       │     form_fields      │           │
│ version     INTEGER  │       ├──────────────────────┤           │
│ settings    JSONB    │       │ id          UUID  PK │           │
│ theme       JSONB    │       │ form_id     UUID  FK │───────────┤
│ created_at  TIMESTAMP│       │ type        VARCHAR  │           │
│ updated_at  TIMESTAMP│       │ name        VARCHAR  │           │
│ deleted_at  TIMESTAMP│       │ label       VARCHAR  │           │
└──────────────────────┘       │ placeholder VARCHAR  │           │
                               │ help_text   VARCHAR  │           │
                               │ field_order INTEGER  │           │
                               │ page        INTEGER  │           │
                               │ required    BOOLEAN  │           │
                               │ default_val TEXT     │           │
                               │ validation  JSONB    │           │
                               │ options     JSONB    │           │
                               │ config      JSONB    │           │
                               │ visibility  JSONB    │           │
                               └──────────────────────┘           │
                                                                  │
┌──────────────────────┐       ┌──────────────────────┐           │
│  submission_values   │       │    submissions       │           │
├──────────────────────┤       ├──────────────────────┤           │
│ id          UUID  PK │       │ id          UUID  PK │           │
│ submission_id UUID FK│──────>│ form_id     UUID  FK │───────────┘
│ field_id    UUID  FK │──┐    │ data        JSONB    │
│ field_name  VARCHAR  │  │    │ submitted_at TIMESTAMP│
│ value       TEXT     │  │    │ created_at  TIMESTAMP│
│ created_at  TIMESTAMP│  │    │ updated_at  TIMESTAMP│
└──────────────────────┘  │    └──────────────────────┘
                          │
                          └───> (references form_fields.id)
```

### Relationships

```
[forms] 1 ───* [form_fields]        (one form has many fields)
[forms] 1 ───* [submissions]        (one form has many submissions)
[submissions] 1 ───* [submission_values]  (one submission has many values)
[form_fields] 1 ───* [submission_values]  (one field has many values across submissions)
```

---

## 2. Database Schema

### 2.1 Table: `forms`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| name | VARCHAR(255) | NOT NULL | Form title |
| description | TEXT | nullable | Form description |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'DRAFT' | DRAFT, PUBLISHED, CLOSED, ARCHIVED |
| version | INTEGER | NOT NULL, DEFAULT 1 | Schema version, incremented on publish |
| settings | JSONB | nullable, DEFAULT '{}' | Form-level settings (see Settings JSON below) |
| theme | JSONB | nullable, DEFAULT '{}' | Theme customization (see Theme JSON below) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update timestamp |
| deleted_at | TIMESTAMPTZ | nullable | Soft delete timestamp |

**Indexes:**
- `idx_forms_status` (status) WHERE deleted_at IS NULL
- `idx_forms_created_at` (created_at DESC)
- `idx_forms_deleted_at` (deleted_at) -- partial index for active forms

**Settings JSON structure:**
```json
{
  "submitButtonText": "Submit",
  "successMessage": "Thank you for your submission!",
  "redirectUrl": null,
  "showAnotherResponseLink": false,
  "notificationEmails": [],
  "webhookUrl": null,
  "webhookHeaders": {},
  "closedMessage": "This form is no longer accepting responses.",
  "submissionLimit": null
}
```

**Theme JSON structure:**
```json
{
  "primaryColor": "#2563eb",
  "backgroundColor": "#ffffff",
  "textColor": "#0f172a",
  "fontFamily": "Inter",
  "logoUrl": null,
  "backgroundImageUrl": null,
  "borderRadius": "md",
  "preset": null
}
```

---

### 2.2 Table: `form_fields`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| form_id | UUID | FK -> forms.id, NOT NULL, ON DELETE CASCADE | Parent form |
| type | VARCHAR(50) | NOT NULL | Field type enum value |
| name | VARCHAR(255) | NOT NULL | Machine-readable name (unique within form) |
| label | VARCHAR(500) | NOT NULL | Display label |
| placeholder | VARCHAR(500) | nullable | Placeholder text |
| help_text | VARCHAR(1000) | nullable | Help/description text below the field |
| field_order | INTEGER | NOT NULL | Display order (0-based) |
| page | INTEGER | NOT NULL, DEFAULT 0 | Page index for multi-page forms (0-based) |
| required | BOOLEAN | NOT NULL, DEFAULT false | Whether field is required |
| default_value | TEXT | nullable | Default value (serialized as text) |
| validation_rules | JSONB | nullable, DEFAULT '[]' | Array of validation rule objects |
| options | JSONB | nullable | Array of option objects for select/radio/checkbox |
| config | JSONB | nullable, DEFAULT '{}' | Extensible field-specific configuration |
| visibility_rules | JSONB | nullable | Conditional visibility rules |

**Indexes:**
- `idx_form_fields_form_id` (form_id)
- `idx_form_fields_form_order` (form_id, field_order)
- `uq_form_fields_form_name` UNIQUE (form_id, name)

**Field Type Enum Values:**
```
TEXT, TEXTAREA, NUMBER, EMAIL, URL, PHONE, DATE, TIME, DATETIME,
SELECT, MULTI_SELECT, RADIO, CHECKBOX,
FILE, RATING, SCALE,
SECTION, CONTENT,
HIDDEN
```

**Validation Rules JSON structure (array):**
```json
[
  { "type": "minLength", "value": 3, "message": "Minimum 3 characters" },
  { "type": "maxLength", "value": 100, "message": "Maximum 100 characters" },
  { "type": "pattern", "value": "^[A-Z].*", "message": "Must start with uppercase" },
  { "type": "min", "value": 0, "message": "Must be non-negative" },
  { "type": "max", "value": 100, "message": "Must be 100 or less" },
  { "type": "fileTypes", "value": ["pdf", "jpg", "png"], "message": "Only PDF, JPG, PNG allowed" },
  { "type": "maxFileSize", "value": 5242880, "message": "Max file size 5MB" }
]
```

**Options JSON structure (array):**
```json
[
  { "label": "Option A", "value": "option_a" },
  { "label": "Option B", "value": "option_b" },
  { "label": "Other", "value": "__other__", "allowCustom": true }
]
```

**Config JSON structure (varies by field type):**
```json
// NUMBER
{ "step": 1, "decimalPlaces": 0, "prefix": "$", "suffix": null }

// DATE
{ "format": "yyyy-MM-dd", "disablePastDates": false, "disableWeekends": false }

// RATING
{ "maxRating": 5, "icon": "star" }

// SCALE
{ "min": 1, "max": 10, "minLabel": "Not likely", "maxLabel": "Very likely" }

// FILE
{ "maxFiles": 1, "accept": ".pdf,.jpg,.png" }

// TEXTAREA
{ "rows": 4 }

// CONTENT (display-only rich text)
{ "html": "<p>Please read the following...</p>" }
```

**Visibility Rules JSON structure:**
```json
{
  "operator": "AND",
  "conditions": [
    { "fieldName": "role", "op": "equals", "value": "Manager" },
    { "fieldName": "department", "op": "not_empty", "value": null }
  ]
}
```

---

### 2.3 Table: `submissions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| form_id | UUID | FK -> forms.id, NOT NULL | Which form was submitted |
| form_version | INTEGER | NOT NULL | Version of the form at submission time |
| data | JSONB | NOT NULL | Complete submission as { fieldName: value } |
| submitted_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | When the user clicked Submit |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation time |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update time |

**Indexes:**
- `idx_submissions_form_id` (form_id)
- `idx_submissions_submitted_at` (form_id, submitted_at DESC)
- `idx_submissions_data` USING GIN (data) -- for JSONB queries on field values

---

### 2.4 Table: `submission_values`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Primary key |
| submission_id | UUID | FK -> submissions.id, NOT NULL, ON DELETE CASCADE | Parent submission |
| field_id | UUID | FK -> form_fields.id, nullable | Field reference (null if field was deleted) |
| field_name | VARCHAR(255) | NOT NULL | Field name at time of submission (denormalized) |
| value | TEXT | nullable | The submitted value (serialized as text) |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Record creation time |

**Indexes:**
- `idx_submission_values_submission_id` (submission_id)
- `idx_submission_values_field_id` (field_id)
- `idx_submission_values_field_name` (field_name, value) -- for analytics queries

---

## 3. Flyway Migration Files

```
db/migration/
├── V1__create_forms_table.sql
├── V2__create_form_fields_table.sql
├── V3__create_submissions_table.sql
├── V4__create_submission_values_table.sql
└── V5__add_theme_and_page_columns.sql
```

---

## 4. JPA Entity Outlines (Backend)

### 4.1 FormStatus Enum

```java
package com.formbuilder.enums;

public enum FormStatus {
    DRAFT,
    PUBLISHED,
    CLOSED,
    ARCHIVED
}
```

### 4.2 FieldType Enum

```java
package com.formbuilder.enums;

public enum FieldType {
    TEXT,
    TEXTAREA,
    NUMBER,
    EMAIL,
    URL,
    PHONE,
    DATE,
    TIME,
    DATETIME,
    SELECT,
    MULTI_SELECT,
    RADIO,
    CHECKBOX,
    FILE,
    RATING,
    SCALE,
    SECTION,
    CONTENT,
    HIDDEN
}
```

### 4.3 Form Entity

```java
package com.formbuilder.entity;

@Entity
@Table(name = "forms")
@SQLRestriction("deleted_at IS NULL")
public class Form {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FormStatus status = FormStatus.DRAFT;

    @Column(nullable = false)
    private Integer version = 1;

    @Column(name = "settings", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> settings = new HashMap<>();

    @Column(name = "theme", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> theme = new HashMap<>();

    @OneToMany(mappedBy = "form", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("page ASC, fieldOrder ASC")
    private List<FormField> fields = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    // --- Helper methods ---

    public void addField(FormField field) {
        fields.add(field);
        field.setForm(this);
    }

    public void removeField(FormField field) {
        fields.remove(field);
        field.setForm(null);
    }

    public void softDelete() {
        this.deletedAt = Instant.now();
    }

    public boolean isDeleted() {
        return deletedAt != null;
    }

    // getters and setters omitted
}
```

### 4.4 FormField Entity

```java
package com.formbuilder.entity;

@Entity
@Table(name = "form_fields",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_form_fields_form_name",
        columnNames = {"form_id", "name"}
    ))
public class FormField {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id", nullable = false)
    private Form form;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private FieldType type;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(nullable = false, length = 500)
    private String label;

    @Column(length = 500)
    private String placeholder;

    @Column(name = "help_text", length = 1000)
    private String helpText;

    @Column(name = "field_order", nullable = false)
    private Integer fieldOrder;

    @Column(nullable = false)
    private Integer page = 0;

    @Column(nullable = false)
    private Boolean required = false;

    @Column(name = "default_value")
    private String defaultValue;

    @Column(name = "validation_rules", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private List<Map<String, Object>> validationRules = new ArrayList<>();

    @Column(name = "options", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private List<Map<String, Object>> options;

    @Column(name = "config", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> config = new HashMap<>();

    @Column(name = "visibility_rules", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> visibilityRules;

    // getters and setters omitted
}
```

### 4.5 Submission Entity

```java
package com.formbuilder.entity;

@Entity
@Table(name = "submissions")
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "form_id", nullable = false)
    private Form form;

    @Column(name = "form_version", nullable = false)
    private Integer formVersion;

    @Column(name = "data", columnDefinition = "jsonb", nullable = false)
    @JdbcTypeCode(SqlTypes.JSON)
    private Map<String, Object> data;

    @OneToMany(mappedBy = "submission", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SubmissionValue> values = new ArrayList<>();

    @Column(name = "submitted_at", nullable = false)
    private Instant submittedAt = Instant.now();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    // --- Helper methods ---

    public void addValue(SubmissionValue value) {
        values.add(value);
        value.setSubmission(this);
    }

    // getters and setters omitted
}
```

### 4.6 SubmissionValue Entity

```java
package com.formbuilder.entity;

@Entity
@Table(name = "submission_values")
public class SubmissionValue {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private Submission submission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "field_id")
    private FormField field;

    @Column(name = "field_name", nullable = false, length = 255)
    private String fieldName;

    @Column(name = "value", columnDefinition = "TEXT")
    private String value;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    // getters and setters omitted
}
```

---

## 5. DTO Classes (Backend)

### 5.1 Request DTOs

```java
// --- CreateFormRequest ---
public record CreateFormRequest(
    @NotBlank @Size(max = 255) String name,
    String description
) {}

// --- UpdateFormRequest ---
public record UpdateFormRequest(
    @NotBlank @Size(max = 255) String name,
    String description,
    Map<String, Object> settings,
    Map<String, Object> theme,
    @Valid List<FormFieldRequest> fields
) {}

// --- FormFieldRequest ---
public record FormFieldRequest(
    UUID id,                          // null for new fields, present for existing
    @NotNull FieldType type,
    @NotBlank @Size(max = 255) String name,
    @NotBlank @Size(max = 500) String label,
    @Size(max = 500) String placeholder,
    @Size(max = 1000) String helpText,
    @NotNull Integer fieldOrder,
    Integer page,                     // defaults to 0
    Boolean required,                 // defaults to false
    String defaultValue,
    List<Map<String, Object>> validationRules,
    List<Map<String, Object>> options,
    Map<String, Object> config,
    Map<String, Object> visibilityRules
) {}

// --- SubmitFormRequest ---
public record SubmitFormRequest(
    @NotNull Map<String, Object> data  // { fieldName: value }
) {}
```

### 5.2 Response DTOs

```java
// --- FormResponse (full form with fields) ---
public record FormResponse(
    UUID id,
    String name,
    String description,
    FormStatus status,
    Integer version,
    Map<String, Object> settings,
    Map<String, Object> theme,
    List<FormFieldResponse> fields,
    Instant createdAt,
    Instant updatedAt
) {}

// --- FormSummaryResponse (for list/dashboard) ---
public record FormSummaryResponse(
    UUID id,
    String name,
    String description,
    FormStatus status,
    Integer version,
    Long submissionCount,
    Instant createdAt,
    Instant updatedAt
) {}

// --- FormFieldResponse ---
public record FormFieldResponse(
    UUID id,
    FieldType type,
    String name,
    String label,
    String placeholder,
    String helpText,
    Integer fieldOrder,
    Integer page,
    Boolean required,
    String defaultValue,
    List<Map<String, Object>> validationRules,
    List<Map<String, Object>> options,
    Map<String, Object> config,
    Map<String, Object> visibilityRules
) {}

// --- SubmissionResponse ---
public record SubmissionResponse(
    UUID id,
    UUID formId,
    Integer formVersion,
    Map<String, Object> data,
    Instant submittedAt,
    Instant createdAt
) {}

// --- SubmissionSummaryResponse (for table list) ---
public record SubmissionSummaryResponse(
    UUID id,
    Map<String, Object> data,
    Instant submittedAt
) {}

// --- FormAnalyticsResponse ---
public record FormAnalyticsResponse(
    UUID formId,
    Long totalSubmissions,
    List<DailyCount> submissionsOverTime,
    Map<String, FieldAnalytics> fieldAnalytics
) {}

public record DailyCount(
    LocalDate date,
    Long count
) {}

public record FieldAnalytics(
    String fieldName,
    String fieldType,
    Map<String, Long> valueCounts,   // for choice fields
    Double average,                   // for number/rating/scale fields
    Long responseCount
) {}
```

---

## 6. TypeScript Interface Definitions (Frontend)

### 6.1 Core Types (`types/form.ts`)

```typescript
// --- Enums ---

export type FormStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';

export type FieldType =
  | 'TEXT'
  | 'TEXTAREA'
  | 'NUMBER'
  | 'EMAIL'
  | 'URL'
  | 'PHONE'
  | 'DATE'
  | 'TIME'
  | 'DATETIME'
  | 'SELECT'
  | 'MULTI_SELECT'
  | 'RADIO'
  | 'CHECKBOX'
  | 'FILE'
  | 'RATING'
  | 'SCALE'
  | 'SECTION'
  | 'CONTENT'
  | 'HIDDEN';

// --- Form ---

export interface Form {
  id: string;
  name: string;
  description: string | null;
  status: FormStatus;
  version: number;
  settings: FormSettings;
  theme: FormTheme;
  fields: FormField[];
  createdAt: string;   // ISO 8601
  updatedAt: string;   // ISO 8601
}

export interface FormSummary {
  id: string;
  name: string;
  description: string | null;
  status: FormStatus;
  version: number;
  submissionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FormSettings {
  submitButtonText: string;
  successMessage: string;
  redirectUrl: string | null;
  showAnotherResponseLink: boolean;
  notificationEmails: string[];
  webhookUrl: string | null;
  webhookHeaders: Record<string, string>;
  closedMessage: string;
  submissionLimit: number | null;
}

export interface FormTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  logoUrl: string | null;
  backgroundImageUrl: string | null;
  borderRadius: 'sm' | 'md' | 'lg';
  preset: string | null;
}

// --- Fields ---

export interface FormField {
  id: string;
  type: FieldType;
  name: string;
  label: string;
  placeholder: string | null;
  helpText: string | null;
  fieldOrder: number;
  page: number;
  required: boolean;
  defaultValue: string | null;
  validationRules: ValidationRule[];
  options: FieldOption[] | null;
  config: Record<string, unknown>;
  visibilityRules: VisibilityRules | null;
}

export interface ValidationRule {
  type: 'minLength' | 'maxLength' | 'pattern' | 'min' | 'max'
    | 'fileTypes' | 'maxFileSize';
  value: string | number | string[];
  message: string;
}

export interface FieldOption {
  label: string;
  value: string;
  allowCustom?: boolean;
}

export interface VisibilityRules {
  operator: 'AND' | 'OR';
  conditions: VisibilityCondition[];
}

export interface VisibilityCondition {
  fieldName: string;
  op: 'equals' | 'not_equals' | 'contains' | 'is_empty'
    | 'is_not_empty' | 'greater_than' | 'less_than';
  value: string | number | null;
}
```

### 6.2 Submission Types (`types/submission.ts`)

```typescript
export interface Submission {
  id: string;
  formId: string;
  formVersion: number;
  data: Record<string, unknown>;
  submittedAt: string;
  createdAt: string;
}

export interface SubmissionSummary {
  id: string;
  data: Record<string, unknown>;
  submittedAt: string;
}

export interface FormAnalytics {
  formId: string;
  totalSubmissions: number;
  submissionsOverTime: DailyCount[];
  fieldAnalytics: Record<string, FieldAnalytics>;
}

export interface DailyCount {
  date: string;   // YYYY-MM-DD
  count: number;
}

export interface FieldAnalytics {
  fieldName: string;
  fieldType: string;
  valueCounts: Record<string, number>;
  average: number | null;
  responseCount: number;
}
```

### 6.3 API Types (`types/api.ts`)

```typescript
// --- Pagination ---

export interface PageResponse<T> {
  content: T[];
  page: PageInfo;
}

export interface PageInfo {
  number: number;      // 0-based page number
  size: number;        // page size
  totalElements: number;
  totalPages: number;
}

export interface PageParams {
  page?: number;
  size?: number;
  sort?: string;       // e.g. "createdAt,desc"
}

// --- Requests ---

export interface CreateFormRequest {
  name: string;
  description?: string;
}

export interface UpdateFormRequest {
  name: string;
  description?: string;
  settings?: FormSettings;
  theme?: FormTheme;
  fields?: FormFieldRequest[];
}

export interface FormFieldRequest {
  id?: string;          // present for existing fields, absent for new
  type: FieldType;
  name: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  fieldOrder: number;
  page?: number;
  required?: boolean;
  defaultValue?: string;
  validationRules?: ValidationRule[];
  options?: FieldOption[];
  config?: Record<string, unknown>;
  visibilityRules?: VisibilityRules;
}

export interface SubmitFormRequest {
  data: Record<string, unknown>;
}

// --- Error ---

export interface ApiError {
  status: number;
  error: string;
  message: string;
  details: FieldError[];
  timestamp: string;
  path: string;
}

export interface FieldError {
  field: string;
  message: string;
}
```

---

## 7. Field Type Reference

Quick reference for which config/options/validation apply to each field type:

| Field Type | Has Options | Has Config | Applicable Validation |
|-----------|-------------|------------|----------------------|
| TEXT | No | No | minLength, maxLength, pattern |
| TEXTAREA | No | rows | minLength, maxLength |
| NUMBER | No | step, decimalPlaces, prefix, suffix | min, max |
| EMAIL | No | No | pattern (auto email validation) |
| URL | No | No | pattern (auto URL validation) |
| PHONE | No | No | pattern |
| DATE | No | format, disablePastDates, disableWeekends | min, max |
| TIME | No | No | min, max |
| DATETIME | No | format | min, max |
| SELECT | Yes | No | -- |
| MULTI_SELECT | Yes | No | min (minSelections), max (maxSelections) |
| RADIO | Yes | No | -- |
| CHECKBOX | No (single) | No | -- |
| FILE | No | maxFiles, accept | fileTypes, maxFileSize |
| RATING | No | maxRating, icon | min, max |
| SCALE | No | min, max, minLabel, maxLabel | -- |
| SECTION | No | No | -- (display only) |
| CONTENT | No | html | -- (display only) |
| HIDDEN | No | No | -- (not visible) |
