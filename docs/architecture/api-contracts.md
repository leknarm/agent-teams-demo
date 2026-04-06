# API Contracts -- Dynamic Form Builder

**Date:** 2026-04-06
**Status:** Accepted
**Base URL:** `/api/v1`

---

## General Conventions

### Authentication
Phase 1: No authentication. All endpoints are open.

### Content Type
All requests and responses use `Content-Type: application/json`.

### Pagination
All list endpoints accept:
```
?page=0&size=20&sort=createdAt,desc
```

Paginated response envelope:
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

### Error Response Format
All errors follow this structure:
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [
    { "field": "name", "message": "must not be blank" }
  ],
  "timestamp": "2026-04-06T10:00:00Z",
  "path": "/api/v1/forms"
}
```

### Standard Status Codes
| Code | Meaning |
|------|---------|
| 200 | Success (GET, PUT, PATCH) |
| 201 | Created (POST) |
| 204 | No Content (DELETE) |
| 400 | Validation error / malformed request |
| 404 | Resource not found |
| 409 | Conflict (e.g., duplicate) |
| 422 | Unprocessable (valid JSON, invalid business logic) |
| 500 | Internal server error |

---

## 1. Forms API

### 1.1 List Forms

```
GET /api/v1/forms
```

**Description:** List all forms with summary info for the dashboard. Excludes soft-deleted forms.

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 0 | Page number (0-based) |
| size | integer | 20 | Page size (max 100) |
| sort | string | createdAt,desc | Sort field and direction |
| status | string | (all) | Filter by status: DRAFT, PUBLISHED, CLOSED, ARCHIVED |
| search | string | (none) | Search by form name (case-insensitive contains) |

**Response: 200 OK**
```json
{
  "content": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Contact Form",
      "description": "A simple contact form",
      "status": "PUBLISHED",
      "version": 2,
      "submissionCount": 142,
      "createdAt": "2026-04-01T08:00:00Z",
      "updatedAt": "2026-04-05T14:30:00Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "Feedback Survey",
      "description": null,
      "status": "DRAFT",
      "version": 1,
      "submissionCount": 0,
      "createdAt": "2026-04-06T09:00:00Z",
      "updatedAt": "2026-04-06T09:00:00Z"
    }
  ],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 2,
    "totalPages": 1
  }
}
```

---

### 1.2 Create Form

```
POST /api/v1/forms
```

**Description:** Create a new blank form in DRAFT status.

**Request Body:**
```json
{
  "name": "Customer Feedback",
  "description": "Collect feedback after support interactions"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| name | string | yes | 1-255 chars, not blank |
| description | string | no | max 5000 chars |

**Response: 201 Created**

Headers: `Location: /api/v1/forms/770e8400-e29b-41d4-a716-446655440002`

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "name": "Customer Feedback",
  "description": "Collect feedback after support interactions",
  "status": "DRAFT",
  "version": 1,
  "settings": {
    "submitButtonText": "Submit",
    "successMessage": "Thank you for your submission!",
    "redirectUrl": null,
    "showAnotherResponseLink": false,
    "notificationEmails": [],
    "webhookUrl": null,
    "webhookHeaders": {},
    "closedMessage": "This form is no longer accepting responses.",
    "submissionLimit": null
  },
  "theme": {
    "primaryColor": "#2563eb",
    "backgroundColor": "#ffffff",
    "textColor": "#0f172a",
    "fontFamily": "Inter",
    "logoUrl": null,
    "backgroundImageUrl": null,
    "borderRadius": "md",
    "preset": null
  },
  "fields": [],
  "createdAt": "2026-04-06T10:00:00Z",
  "updatedAt": "2026-04-06T10:00:00Z"
}
```

**Errors:**
- 400: `name` is blank or too long

---

### 1.3 Get Form

```
GET /api/v1/forms/{formId}
```

**Description:** Get a form with all its fields. Used by the form builder to load a form for editing.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| formId | UUID | Form ID |

**Response: 200 OK**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Contact Form",
  "description": "A simple contact form",
  "status": "PUBLISHED",
  "version": 2,
  "settings": {
    "submitButtonText": "Send Message",
    "successMessage": "Thanks! We will get back to you within 24 hours.",
    "redirectUrl": null,
    "showAnotherResponseLink": false,
    "notificationEmails": ["admin@example.com"],
    "webhookUrl": null,
    "webhookHeaders": {},
    "closedMessage": "This form is no longer accepting responses.",
    "submissionLimit": null
  },
  "theme": {
    "primaryColor": "#2563eb",
    "backgroundColor": "#ffffff",
    "textColor": "#0f172a",
    "fontFamily": "Inter",
    "logoUrl": null,
    "backgroundImageUrl": null,
    "borderRadius": "md",
    "preset": null
  },
  "fields": [
    {
      "id": "aaa00000-0000-0000-0000-000000000001",
      "type": "TEXT",
      "name": "full_name",
      "label": "Full Name",
      "placeholder": "Enter your full name",
      "helpText": null,
      "fieldOrder": 0,
      "page": 0,
      "required": true,
      "defaultValue": null,
      "validationRules": [
        { "type": "minLength", "value": 2, "message": "Name must be at least 2 characters" },
        { "type": "maxLength", "value": 100, "message": "Name must be 100 characters or fewer" }
      ],
      "options": null,
      "config": {},
      "visibilityRules": null
    },
    {
      "id": "aaa00000-0000-0000-0000-000000000002",
      "type": "EMAIL",
      "name": "email",
      "label": "Email Address",
      "placeholder": "you@example.com",
      "helpText": "We will never share your email.",
      "fieldOrder": 1,
      "page": 0,
      "required": true,
      "defaultValue": null,
      "validationRules": [],
      "options": null,
      "config": {},
      "visibilityRules": null
    },
    {
      "id": "aaa00000-0000-0000-0000-000000000003",
      "type": "SELECT",
      "name": "subject",
      "label": "Subject",
      "placeholder": "Select a subject",
      "helpText": null,
      "fieldOrder": 2,
      "page": 0,
      "required": true,
      "defaultValue": null,
      "validationRules": [],
      "options": [
        { "label": "General Inquiry", "value": "general" },
        { "label": "Support", "value": "support" },
        { "label": "Billing", "value": "billing" },
        { "label": "Other", "value": "__other__", "allowCustom": true }
      ],
      "config": {},
      "visibilityRules": null
    },
    {
      "id": "aaa00000-0000-0000-0000-000000000004",
      "type": "TEXTAREA",
      "name": "message",
      "label": "Message",
      "placeholder": "How can we help you?",
      "helpText": null,
      "fieldOrder": 3,
      "page": 0,
      "required": true,
      "defaultValue": null,
      "validationRules": [
        { "type": "minLength", "value": 10, "message": "Please write at least 10 characters" },
        { "type": "maxLength", "value": 2000, "message": "Maximum 2000 characters" }
      ],
      "options": null,
      "config": { "rows": 5 },
      "visibilityRules": null
    }
  ],
  "createdAt": "2026-04-01T08:00:00Z",
  "updatedAt": "2026-04-05T14:30:00Z"
}
```

**Errors:**
- 404: Form not found or soft-deleted

---

### 1.4 Update Form

```
PUT /api/v1/forms/{formId}
```

**Description:** Full update of form metadata and fields. Used by the auto-save feature in the form builder. Replaces all fields -- any field IDs not included are deleted (orphan removal).

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| formId | UUID | Form ID |

**Request Body:**
```json
{
  "name": "Contact Form v2",
  "description": "Updated contact form",
  "settings": {
    "submitButtonText": "Send Message",
    "successMessage": "Thanks! We will get back to you.",
    "redirectUrl": null,
    "showAnotherResponseLink": true,
    "notificationEmails": ["admin@example.com", "support@example.com"],
    "webhookUrl": null,
    "webhookHeaders": {},
    "closedMessage": "This form is no longer accepting responses.",
    "submissionLimit": null
  },
  "theme": {
    "primaryColor": "#10b981",
    "backgroundColor": "#ffffff",
    "textColor": "#0f172a",
    "fontFamily": "Inter",
    "logoUrl": null,
    "backgroundImageUrl": null,
    "borderRadius": "md",
    "preset": null
  },
  "fields": [
    {
      "id": "aaa00000-0000-0000-0000-000000000001",
      "type": "TEXT",
      "name": "full_name",
      "label": "Your Name",
      "placeholder": "Enter your name",
      "helpText": null,
      "fieldOrder": 0,
      "page": 0,
      "required": true,
      "defaultValue": null,
      "validationRules": [
        { "type": "minLength", "value": 2, "message": "Name must be at least 2 characters" }
      ],
      "options": null,
      "config": {},
      "visibilityRules": null
    },
    {
      "type": "PHONE",
      "name": "phone",
      "label": "Phone Number",
      "placeholder": "+66 XX XXX XXXX",
      "helpText": "Optional",
      "fieldOrder": 1,
      "page": 0,
      "required": false,
      "defaultValue": null,
      "validationRules": [],
      "options": null,
      "config": {},
      "visibilityRules": null
    }
  ]
}
```

**Notes:**
- Fields with an `id` are updated in place.
- Fields without an `id` are created as new.
- Existing fields whose `id` does not appear in the request are deleted.
- Only allowed on DRAFT forms. Returns 422 if form is PUBLISHED.

**Response: 200 OK**
Same as GET /api/v1/forms/{formId} (returns the updated form).

**Errors:**
- 400: Validation failed (blank name, duplicate field names, etc.)
- 404: Form not found
- 422: Form is published (must unpublish first to edit structure)

---

### 1.5 Delete Form (Soft Delete)

```
DELETE /api/v1/forms/{formId}
```

**Description:** Soft-delete a form by setting `deleted_at`. The form and its submissions are preserved in the database but excluded from all queries.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| formId | UUID | Form ID |

**Response: 204 No Content**

**Errors:**
- 404: Form not found or already deleted

---

### 1.6 Publish Form

```
POST /api/v1/forms/{formId}/publish
```

**Description:** Transition a DRAFT or CLOSED form to PUBLISHED status. Increments the form version. The form must have at least one non-display field.

**Request Body:** None

**Response: 200 OK**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Contact Form",
  "status": "PUBLISHED",
  "version": 2,
  "...": "full FormResponse"
}
```

**Errors:**
- 404: Form not found
- 422: Form has no fields, or form is already published

---

### 1.7 Close Form

```
POST /api/v1/forms/{formId}/close
```

**Description:** Transition a PUBLISHED form to CLOSED status. Stops accepting new submissions.

**Request Body:** None

**Response: 200 OK**
Returns full FormResponse with status CLOSED.

**Errors:**
- 404: Form not found
- 422: Form is not in PUBLISHED status

---

### 1.8 Duplicate Form

```
POST /api/v1/forms/{formId}/duplicate
```

**Description:** Create a copy of a form with all its fields. The copy is always in DRAFT status with name appended "(Copy)".

**Request Body:** None

**Response: 201 Created**
Returns the new FormResponse (the duplicate).

**Errors:**
- 404: Original form not found

---

### 1.9 Get Public Form (for respondents)

```
GET /api/v1/public/forms/{formId}
```

**Description:** Get a published form for rendering to respondents. Returns only PUBLISHED forms. Strips out internal settings (notification emails, webhook config). This endpoint will remain unauthenticated even after auth is added.

**Response: 200 OK**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Contact Form",
  "description": "A simple contact form",
  "status": "PUBLISHED",
  "version": 2,
  "settings": {
    "submitButtonText": "Send Message",
    "successMessage": "Thanks! We will get back to you within 24 hours.",
    "showAnotherResponseLink": false
  },
  "theme": {
    "primaryColor": "#2563eb",
    "backgroundColor": "#ffffff",
    "textColor": "#0f172a",
    "fontFamily": "Inter",
    "logoUrl": null,
    "backgroundImageUrl": null,
    "borderRadius": "md"
  },
  "fields": [
    "... same as FormFieldResponse ..."
  ]
}
```

**Errors:**
- 404: Form not found, not published, or soft-deleted
- 410: Form is CLOSED (response includes `closedMessage`)

Response for 410:
```json
{
  "status": 410,
  "error": "Gone",
  "message": "This form is no longer accepting responses.",
  "details": [],
  "timestamp": "2026-04-06T10:00:00Z",
  "path": "/api/v1/public/forms/550e8400-..."
}
```

---

## 2. Submissions API

### 2.1 Submit Form (Public)

```
POST /api/v1/public/forms/{formId}/submissions
```

**Description:** Submit a response to a published form. Validates all field values against the form's validation rules server-side. This endpoint remains unauthenticated.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| formId | UUID | Form ID |

**Request Body:**
```json
{
  "data": {
    "full_name": "John Doe",
    "email": "john@example.com",
    "subject": "support",
    "message": "I need help with my account settings."
  }
}
```

**Notes:**
- Keys in `data` must match field `name` values from the form definition.
- Hidden field values can be passed here (set from URL params by the frontend).
- SECTION and CONTENT field types should not appear in `data` (display-only).

**Response: 201 Created**
```json
{
  "id": "bbb00000-0000-0000-0000-000000000001",
  "formId": "550e8400-e29b-41d4-a716-446655440000",
  "formVersion": 2,
  "data": {
    "full_name": "John Doe",
    "email": "john@example.com",
    "subject": "support",
    "message": "I need help with my account settings."
  },
  "submittedAt": "2026-04-06T10:30:00Z",
  "createdAt": "2026-04-06T10:30:00Z"
}
```

**Errors:**
- 400: Validation failed

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Submission validation failed",
  "details": [
    { "field": "full_name", "message": "This field is required" },
    { "field": "email", "message": "Please enter a valid email address" },
    { "field": "message", "message": "Must be at least 10 characters" }
  ],
  "timestamp": "2026-04-06T10:30:00Z",
  "path": "/api/v1/public/forms/550e8400-.../submissions"
}
```

- 404: Form not found or not published
- 410: Form is closed
- 422: Submission limit reached

---

### 2.2 List Submissions

```
GET /api/v1/forms/{formId}/submissions
```

**Description:** List all submissions for a form. Used by the submissions table view.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| formId | UUID | Form ID |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 0 | Page number (0-based) |
| size | integer | 20 | Page size (max 100) |
| sort | string | submittedAt,desc | Sort field and direction |

**Response: 200 OK**
```json
{
  "content": [
    {
      "id": "bbb00000-0000-0000-0000-000000000001",
      "data": {
        "full_name": "John Doe",
        "email": "john@example.com",
        "subject": "support",
        "message": "I need help with my account."
      },
      "submittedAt": "2026-04-06T10:30:00Z"
    },
    {
      "id": "bbb00000-0000-0000-0000-000000000002",
      "data": {
        "full_name": "Jane Smith",
        "email": "jane@example.com",
        "subject": "general",
        "message": "Just wanted to say your product is great!"
      },
      "submittedAt": "2026-04-06T09:15:00Z"
    }
  ],
  "page": {
    "number": 0,
    "size": 20,
    "totalElements": 2,
    "totalPages": 1
  }
}
```

**Errors:**
- 404: Form not found

---

### 2.3 Get Submission Detail

```
GET /api/v1/submissions/{submissionId}
```

**Description:** Get a single submission with all field values.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| submissionId | UUID | Submission ID |

**Response: 200 OK**
```json
{
  "id": "bbb00000-0000-0000-0000-000000000001",
  "formId": "550e8400-e29b-41d4-a716-446655440000",
  "formVersion": 2,
  "data": {
    "full_name": "John Doe",
    "email": "john@example.com",
    "subject": "support",
    "message": "I need help with my account settings."
  },
  "submittedAt": "2026-04-06T10:30:00Z",
  "createdAt": "2026-04-06T10:30:00Z"
}
```

**Errors:**
- 404: Submission not found

---

### 2.4 Delete Submission

```
DELETE /api/v1/submissions/{submissionId}
```

**Description:** Permanently delete a submission and its associated submission_values.

**Response: 204 No Content**

**Errors:**
- 404: Submission not found

---

### 2.5 Bulk Delete Submissions

```
DELETE /api/v1/forms/{formId}/submissions
```

**Description:** Delete multiple submissions for a form by their IDs.

**Request Body:**
```json
{
  "ids": [
    "bbb00000-0000-0000-0000-000000000001",
    "bbb00000-0000-0000-0000-000000000002"
  ]
}
```

**Response: 204 No Content**

**Errors:**
- 400: Empty ids array
- 404: Form not found

---

### 2.6 Export Submissions to CSV

```
GET /api/v1/forms/{formId}/submissions/export
```

**Description:** Download all submissions for a form as a CSV file. Streams the response for large datasets.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| formId | UUID | Form ID |

**Response: 200 OK**

Headers:
```
Content-Type: text/csv; charset=UTF-8
Content-Disposition: attachment; filename="contact-form-submissions-2026-04-06.csv"
```

Body:
```csv
Submission ID,Submitted At,Full Name,Email Address,Subject,Message
bbb00000-...,2026-04-06T10:30:00Z,John Doe,john@example.com,support,"I need help with my account."
bbb00000-...,2026-04-06T09:15:00Z,Jane Smith,jane@example.com,general,"Just wanted to say your product is great!"
```

**Notes:**
- Column headers use field labels (not field names)
- Multi-select values are joined with `;`
- File field values export as download URLs
- UTF-8 with BOM for Excel compatibility
- Streams response -- no pagination needed

**Errors:**
- 404: Form not found

---

## 3. Analytics API

### 3.1 Get Form Analytics

```
GET /api/v1/forms/{formId}/analytics
```

**Description:** Get submission analytics for a form including total count, submissions over time, and per-field breakdowns.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| formId | UUID | Form ID |

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| from | date | 30 days ago | Start date (YYYY-MM-DD) |
| to | date | today | End date (YYYY-MM-DD) |

**Response: 200 OK**
```json
{
  "formId": "550e8400-e29b-41d4-a716-446655440000",
  "totalSubmissions": 142,
  "submissionsOverTime": [
    { "date": "2026-04-01", "count": 12 },
    { "date": "2026-04-02", "count": 18 },
    { "date": "2026-04-03", "count": 15 },
    { "date": "2026-04-04", "count": 22 },
    { "date": "2026-04-05", "count": 31 },
    { "date": "2026-04-06", "count": 8 }
  ],
  "fieldAnalytics": {
    "subject": {
      "fieldName": "subject",
      "fieldType": "SELECT",
      "valueCounts": {
        "general": 45,
        "support": 62,
        "billing": 28,
        "__other__": 7
      },
      "average": null,
      "responseCount": 142
    },
    "rating": {
      "fieldName": "rating",
      "fieldType": "RATING",
      "valueCounts": {
        "1": 3,
        "2": 8,
        "3": 25,
        "4": 52,
        "5": 54
      },
      "average": 4.03,
      "responseCount": 142
    }
  }
}
```

**Notes:**
- `fieldAnalytics` only includes fields where analytics are meaningful: SELECT, MULTI_SELECT, RADIO, CHECKBOX, RATING, SCALE.
- Text/textarea fields are excluded from field analytics (too diverse to aggregate).
- `submissionsOverTime` includes all dates in range, even those with 0 submissions.

**Errors:**
- 404: Form not found

---

## 4. Endpoint Summary Table

| Method | Path | Description | Stories |
|--------|------|-------------|---------|
| GET | `/api/v1/forms` | List forms (dashboard) | US-5.1 |
| POST | `/api/v1/forms` | Create blank form | US-1.1 |
| GET | `/api/v1/forms/{id}` | Get form with fields | US-1.2, US-1.4 |
| PUT | `/api/v1/forms/{id}` | Update form (auto-save) | US-1.2-1.7 |
| DELETE | `/api/v1/forms/{id}` | Soft-delete form | US-5.1 |
| POST | `/api/v1/forms/{id}/publish` | Publish form | US-1.9 |
| POST | `/api/v1/forms/{id}/close` | Close form | US-1.9 |
| POST | `/api/v1/forms/{id}/duplicate` | Duplicate form | US-1.6 |
| GET | `/api/v1/public/forms/{id}` | Get public form (respondents) | US-4.1 |
| POST | `/api/v1/public/forms/{id}/submissions` | Submit form (respondents) | US-4.2 |
| GET | `/api/v1/forms/{id}/submissions` | List submissions | US-5.2 |
| GET | `/api/v1/submissions/{id}` | Get submission detail | US-5.3 |
| DELETE | `/api/v1/submissions/{id}` | Delete submission | US-5.6 |
| DELETE | `/api/v1/forms/{id}/submissions` | Bulk delete submissions | US-5.6 |
| GET | `/api/v1/forms/{id}/submissions/export` | Export CSV | US-5.4 |
| GET | `/api/v1/forms/{id}/analytics` | Get form analytics | US-5.7 |

---

## 5. API Client Functions (Frontend Reference)

These are the functions the frontend team should implement in `lib/api/forms.ts` and `lib/api/submissions.ts`:

```typescript
// lib/api/forms.ts
export const formsApi = {
  list:      (params?: ListFormsParams) => GET<PageResponse<FormSummary>>('/api/v1/forms', params),
  get:       (id: string) => GET<Form>(`/api/v1/forms/${id}`),
  create:    (data: CreateFormRequest) => POST<Form>('/api/v1/forms', data),
  update:    (id: string, data: UpdateFormRequest) => PUT<Form>(`/api/v1/forms/${id}`, data),
  delete:    (id: string) => DELETE<void>(`/api/v1/forms/${id}`),
  publish:   (id: string) => POST<Form>(`/api/v1/forms/${id}/publish`),
  close:     (id: string) => POST<Form>(`/api/v1/forms/${id}/close`),
  duplicate: (id: string) => POST<Form>(`/api/v1/forms/${id}/duplicate`),
  getPublic: (id: string) => GET<Form>(`/api/v1/public/forms/${id}`),
};

// lib/api/submissions.ts
export const submissionsApi = {
  list:       (formId: string, params?: PageParams) =>
                GET<PageResponse<SubmissionSummary>>(`/api/v1/forms/${formId}/submissions`, params),
  get:        (id: string) => GET<Submission>(`/api/v1/submissions/${id}`),
  submit:     (formId: string, data: SubmitFormRequest) =>
                POST<Submission>(`/api/v1/public/forms/${formId}/submissions`, data),
  delete:     (id: string) => DELETE<void>(`/api/v1/submissions/${id}`),
  bulkDelete: (formId: string, ids: string[]) =>
                DELETE<void>(`/api/v1/forms/${formId}/submissions`, { ids }),
  exportCsv:  (formId: string) =>
                DOWNLOAD(`/api/v1/forms/${formId}/submissions/export`),
  analytics:  (formId: string, params?: AnalyticsParams) =>
                GET<FormAnalytics>(`/api/v1/forms/${formId}/analytics`, params),
};
```
