# Frontend Tasks -- Dynamic Form Builder

**Date:** 2026-04-06
**Tech:** Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, TanStack Query, React Hook Form, @dnd-kit

Tasks are ordered by dependency. Earlier tasks must be completed before later ones that depend on them.

---

## Phase 1: Foundation (No backend dependency)

### FE-1: Project Setup & Configuration

**Description:** Initialize the Next.js project with all required dependencies, tooling, and base configuration.

**Work Items:**
- Initialize Next.js with App Router, TypeScript, Tailwind CSS, ESLint
- Install and configure shadcn/ui (run `npx shadcn-ui@latest init`)
- Install dependencies: `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `zod`, `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `lucide-react`, `date-fns`
- Set up folder structure per architecture doc (app/, components/, lib/, types/)
- Create `lib/api/client.ts` -- base fetch wrapper with error handling
- Set up TanStack Query provider in root layout
- Configure environment variables (`NEXT_PUBLIC_API_BASE_URL`)
- Add `.env.local` with `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080`

**Acceptance Criteria:**
- `npm run dev` starts without errors
- shadcn/ui components can be imported and rendered
- TanStack Query provider wraps the app
- API client can make requests (tested with a mock or placeholder endpoint)
- ESLint and TypeScript compilation pass

---

### FE-2: TypeScript Type Definitions

**Description:** Define all shared TypeScript types matching the API contracts exactly.

**Work Items:**
- Create `types/form.ts` -- `Form`, `FormSummary`, `FormField`, `FormSettings`, `FormTheme`, `FormStatus`, `FieldType`, `ValidationRule`, `FieldOption`, `VisibilityRules`, `VisibilityCondition`
- Create `types/submission.ts` -- `Submission`, `SubmissionSummary`, `FormAnalytics`, `DailyCount`, `FieldAnalytics`
- Create `types/api.ts` -- `PageResponse`, `PageInfo`, `PageParams`, `CreateFormRequest`, `UpdateFormRequest`, `FormFieldRequest`, `SubmitFormRequest`, `ApiError`, `FieldError`

**Acceptance Criteria:**
- All types match the API contracts document exactly
- Types compile with no errors
- Types are exported and importable from other files

---

### FE-3: API Client Layer

**Description:** Implement the API client functions that wrap fetch calls for all endpoints.

**Work Items:**
- Implement `lib/api/client.ts` -- generic `apiGet`, `apiPost`, `apiPut`, `apiDelete`, `apiDownload` functions with error handling, JSON parsing, and `ApiError` throwing
- Implement `lib/api/forms.ts` -- all form API functions matching `formsApi` from API contracts
- Implement `lib/api/submissions.ts` -- all submission API functions matching `submissionsApi` from API contracts

**Dependencies:** FE-2

**Acceptance Criteria:**
- All API functions typed correctly with request/response types
- Error responses are parsed into `ApiError` objects
- Download function handles blob/file responses for CSV export
- Functions work when backend is running (integration-testable)

---

### FE-4: React Query Hooks

**Description:** Create TanStack Query hooks for all API operations so components use declarative data fetching.

**Work Items:**
- Create `lib/hooks/useForms.ts`:
  - `useFormsList(params)` -- paginated query for dashboard
  - `useForm(id)` -- single form query
  - `useCreateForm()` -- mutation
  - `useUpdateForm(id)` -- mutation with debounce support
  - `useDeleteForm()` -- mutation with cache invalidation
  - `usePublishForm()` -- mutation
  - `useCloseForm()` -- mutation
  - `useDuplicateForm()` -- mutation
- Create `lib/hooks/useSubmissions.ts`:
  - `useSubmissionsList(formId, params)` -- paginated query
  - `useSubmission(id)` -- single submission query
  - `useSubmitForm(formId)` -- mutation (public)
  - `useDeleteSubmission()` -- mutation
  - `useBulkDeleteSubmissions(formId)` -- mutation
  - `useExportCsv(formId)` -- mutation that triggers download
  - `useFormAnalytics(formId, params)` -- query
- Create `lib/hooks/usePublicForm.ts`:
  - `usePublicForm(formId)` -- query for public form rendering

**Dependencies:** FE-3

**Acceptance Criteria:**
- Hooks handle loading, error, and success states
- Mutations invalidate relevant queries on success (e.g., after create/delete, refetch the list)
- `useUpdateForm` supports debounced auto-save (configurable delay)

---

### FE-5: Shared UI Components

**Description:** Build reusable shared components used across multiple pages.

**Work Items:**
- Install shadcn/ui components: Button, Input, Textarea, Select, Checkbox, Label, Card, Dialog, DropdownMenu, Table, Badge, Tabs, Skeleton, Toast (Sonner), Tooltip, Switch, Separator
- Build `components/shared/PageHeader.tsx` -- page title, description, action buttons
- Build `components/shared/EmptyState.tsx` -- icon, heading, description, CTA button
- Build `components/shared/LoadingState.tsx` -- skeleton loader with configurable layout
- Build `components/shared/ErrorState.tsx` -- error message with retry button
- Build `components/shared/StatusBadge.tsx` -- colored badge for DRAFT/PUBLISHED/CLOSED/ARCHIVED
- Build `components/shared/ConfirmDialog.tsx` -- reusable confirmation modal
- Build `components/shared/SaveIndicator.tsx` -- "Saving...", "Saved", "Error" status display

**Dependencies:** FE-1

**Acceptance Criteria:**
- All components accept appropriate props with TypeScript
- Components use shadcn/ui primitives and Tailwind for styling
- Components are responsive
- Empty, loading, and error states look polished

---

## Phase 2: Dashboard & Form Management

### FE-6: App Layout (Dashboard Shell)

**Description:** Build the root and dashboard layouts with navigation.

**Work Items:**
- Build `app/layout.tsx` -- root layout with TanStack Query provider, Toaster, font loading
- Build `app/(dashboard)/layout.tsx` -- dashboard shell with sidebar navigation and top header
  - Sidebar: logo, navigation links (Forms, possibly future items), collapse toggle
  - Header: breadcrumbs (optional), user avatar placeholder
- Build `app/(dashboard)/page.tsx` -- redirect to forms list or render dashboard home

**Dependencies:** FE-5

**Acceptance Criteria:**
- Dashboard layout renders with sidebar and content area
- Sidebar highlights active route
- Layout is responsive -- sidebar collapses to hamburger on mobile
- Breadcrumbs update based on current route

---

### FE-7: Forms Dashboard Page

**Description:** Build the main forms listing page with search, filter, sort, and CRUD actions.

**Components:**
- `app/(dashboard)/page.tsx` -- forms dashboard page
- `components/forms/FormCard.tsx` -- card displaying form summary (name, status, submission count, dates)
- `components/forms/FormFilters.tsx` -- status filter tabs + search input
- `components/forms/CreateFormDialog.tsx` -- modal to enter form name and create

**API Endpoints Consumed:**
- `GET /api/v1/forms` -- list forms
- `POST /api/v1/forms` -- create form
- `DELETE /api/v1/forms/{id}` -- delete form
- `POST /api/v1/forms/{id}/duplicate` -- duplicate form

**Dependencies:** FE-4, FE-5, FE-6

**Acceptance Criteria:**
- Forms display in a grid or list layout with status badges and submission counts
- Search filters forms by name (client-side debounced, server-side query)
- Status filter tabs: All, Draft, Published, Closed
- Sort by: newest, oldest, name, most submissions
- "Create Form" button opens dialog, creates form, redirects to builder
- Each form card has actions: Edit, Duplicate, Delete (with confirmation)
- Empty state shown when no forms exist with "Create your first form" CTA
- Loading skeleton shown while fetching
- Pagination controls at the bottom

**User Stories:** US-5.1, US-1.1, US-1.6

---

### FE-8: Form Detail / Overview Page

**Description:** Build the form detail page showing form info, status, sharing link, and navigation to builder/submissions.

**Components:**
- `app/(dashboard)/forms/[formId]/page.tsx` -- form overview page
- Tab/section navigation: Overview, Builder (edit), Submissions, Analytics (later)

**API Endpoints Consumed:**
- `GET /api/v1/forms/{id}`
- `POST /api/v1/forms/{id}/publish`
- `POST /api/v1/forms/{id}/close`

**Dependencies:** FE-6, FE-4

**Acceptance Criteria:**
- Shows form name, description, status, version, dates
- Publish/Close buttons based on current status with state transitions
- Shows shareable link when published (copy to clipboard)
- Shows embed code snippet (iframe)
- Navigation to Edit and Submissions sub-pages

**User Stories:** US-1.9, US-4.6

---

## Phase 3: Form Builder (Core Feature)

### FE-9: Field Components (Renderer)

**Description:** Build individual field components that render each field type. These are used in both the form builder preview and the public form renderer.

**Components (in `components/form-renderer/fields/`):**
- `TextField.tsx` -- for TEXT, EMAIL, URL, PHONE
- `TextareaField.tsx` -- for TEXTAREA
- `NumberField.tsx` -- for NUMBER
- `SelectField.tsx` -- for SELECT (searchable dropdown)
- `MultiSelectField.tsx` -- for MULTI_SELECT (checkbox group)
- `RadioField.tsx` -- for RADIO
- `CheckboxField.tsx` -- for CHECKBOX (single boolean)
- `DateField.tsx` -- for DATE, TIME, DATETIME
- `FileField.tsx` -- for FILE (drag-and-drop upload area)
- `RatingField.tsx` -- for RATING (star icons)
- `ScaleField.tsx` -- for SCALE (numbered buttons)
- `SectionField.tsx` -- for SECTION (heading, display-only)
- `ContentField.tsx` -- for CONTENT (rich text display)
- `HiddenField.tsx` -- for HIDDEN (not rendered in form, just holds value)
- `index.ts` -- field registry mapping `FieldType` to component

**Shared Props Interface:**
```typescript
interface FieldProps {
  field: FormField;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  disabled?: boolean;
}
```

**Dependencies:** FE-2, FE-5

**Acceptance Criteria:**
- Each field renders correctly with label, placeholder, help text, and required indicator
- Each field calls `onChange` with the appropriate value type
- Error messages display below the field when `error` prop is set
- Fields are accessible: proper labels, aria attributes, keyboard navigation
- Fields are responsive (full-width on mobile, appropriate sizing on desktop)
- All fields use shadcn/ui primitives where possible (Input, Textarea, Select, Checkbox, etc.)
- Field registry returns the correct component for each FieldType

**User Stories:** US-2.1 through US-2.8, US-6.3, US-6.4

---

### FE-10: Form Renderer Component

**Description:** Build the FormRenderer component that takes a form definition (JSON) and renders a complete, fillable form using the field components.

**Components:**
- `components/form-renderer/FormRenderer.tsx` -- main renderer
- `components/form-renderer/FormPage.tsx` -- renders one page of fields
- `components/form-renderer/ProgressBar.tsx` -- multi-page progress indicator
- `components/form-renderer/ThankYouPage.tsx` -- post-submission confirmation

**Dependencies:** FE-9

**Acceptance Criteria:**
- Renders all fields in order, grouped by page
- Multi-page forms show one page at a time with Next/Previous buttons
- Progress indicator shows current page / total pages
- Page-level validation runs on "Next" (validates current page fields only)
- Full form validation runs on "Submit"
- Client-side validation uses rules from the form schema (required, minLength, maxLength, pattern, min, max, email, etc.)
- Submit button shows loading state during submission
- Thank-you page displayed on success with custom message
- Conditional visibility rules show/hide fields dynamically based on other field values
- Handles closed forms (shows closed message)
- Prevents double-submission (disable button after click)
- Mobile-responsive layout

**User Stories:** US-4.1 through US-4.5, US-3.1, US-3.2, US-3.5, US-6.2, US-6.4

---

### FE-11: Form Builder -- Canvas & Field Palette

**Description:** Build the main form builder interface with a field palette, a builder canvas, and drag-and-drop reordering.

**Components:**
- `app/(dashboard)/forms/[formId]/edit/page.tsx` -- builder page
- `components/form-builder/FormBuilder.tsx` -- main builder layout (three columns)
- `components/form-builder/FieldPalette.tsx` -- left sidebar with draggable field types grouped by category
- `components/form-builder/BuilderCanvas.tsx` -- central area showing the form fields, drop zones, and inline editing
- `components/form-builder/BuilderField.tsx` -- single field in the canvas with drag handle, selection, and action buttons (delete, duplicate)
- `components/form-builder/BuilderToolbar.tsx` -- top toolbar with form name (editable), save status, Preview/Publish buttons

**Dependencies:** FE-9, FE-4

**Acceptance Criteria:**
- Field palette shows all field types organized by category (Text, Choice, Date/Time, Layout, Advanced)
- Clicking a field type in the palette adds it to the canvas at the end
- "+" button appears between fields to insert at a specific position
- Fields in the canvas are draggable via @dnd-kit for reordering
- Drag shows a visual placeholder at the drop target
- Selecting a field highlights it and opens the configurator (FE-12)
- Each field shows action icons on hover: drag handle, duplicate, delete
- Delete triggers undo toast (10 seconds) rather than confirmation dialog
- Form name is editable inline in the toolbar
- Save indicator shows auto-save status (Saving/Saved/Error)
- Canvas shows empty state when no fields exist ("Add your first field")

**User Stories:** US-1.2, US-1.3, US-1.5, US-1.6, US-1.7

---

### FE-12: Form Builder -- Field Configurator

**Description:** Build the right-side configuration panel that appears when a field is selected in the builder canvas.

**Components:**
- `components/form-builder/FieldConfigurator.tsx` -- right sidebar panel
- `components/form-builder/config-panels/GeneralConfig.tsx` -- label, placeholder, help text, required
- `components/form-builder/config-panels/ValidationConfig.tsx` -- validation rules editor
- `components/form-builder/config-panels/OptionsEditor.tsx` -- add/edit/reorder/delete options for select/radio/checkbox
- `components/form-builder/config-panels/FieldSpecificConfig.tsx` -- type-specific config (number step/prefix, date format, rating max, textarea rows, etc.)
- `components/form-builder/config-panels/VisibilityConfig.tsx` -- conditional visibility rule builder (should-have, can be deferred)

**Dependencies:** FE-11

**Acceptance Criteria:**
- Panel opens when a field is selected, closes when deselected
- General tab: edit label, name (auto-generated from label), placeholder, help text, required toggle
- Validation tab: add/remove validation rules appropriate to the field type
  - Text: minLength, maxLength, pattern
  - Number: min, max
  - File: fileTypes, maxFileSize
- Options tab (for SELECT, MULTI_SELECT, RADIO only): add options with label/value, reorder via drag, delete, toggle "Allow Other"
- Type-specific config: shows controls relevant to the selected field type
- All changes update the form state immediately (reflected in canvas preview)
- Changes trigger auto-save via debounced PUT

**User Stories:** US-1.4, US-2.1-US-2.8, US-3.1, US-3.2

---

### FE-13: Form Builder -- Auto-Save & Preview

**Description:** Implement auto-save logic and the preview mode for the form builder.

**Work Items:**
- Implement `useAutoSave` hook -- debounces form state changes (2 seconds) and calls `PUT /api/v1/forms/{id}`
- Implement unsaved changes detection -- `beforeunload` event warns if there are unsaved changes
- Implement preview mode -- toggle between builder and preview, preview uses `FormRenderer` in read-only mode
- Preview supports desktop/mobile viewport toggle (resize container width)

**Dependencies:** FE-11, FE-10

**Acceptance Criteria:**
- Form auto-saves within 2 seconds of the last edit
- Save indicator accurately reflects save state
- Failed saves show error and allow manual retry
- Browser warns when navigating away with unsaved changes
- Preview mode renders the form exactly as respondents see it
- Preview mode does not submit data
- Viewport toggle shows mobile (375px) and desktop (1024px+) widths

**User Stories:** US-1.7, US-1.8

---

### FE-14: Form Builder -- Multi-Page Support

**Description:** Add multi-page form editing to the builder.

**Work Items:**
- Add page management UI to builder: add page, delete page, reorder pages
- Show page tabs or page navigation in the builder canvas
- Fields belong to a page (the `page` property)
- Drag-and-drop should work within a page and across pages
- Page break visual indicator in the canvas

**Dependencies:** FE-11, FE-12

**Acceptance Criteria:**
- Builder shows page tabs when form has multiple pages
- User can add a new page (inserts after current)
- User can delete a page (moves fields to previous page or deletes them with warning)
- Fields display grouped by page
- Drag-and-drop reordering works within a page
- Page navigation in preview mode works correctly

**User Stories:** US-4.3, US-6.2

---

## Phase 4: Public Form & Submissions

### FE-15: Public Form Page

**Description:** Build the public-facing form page at `/f/[formId]` where respondents fill out and submit forms.

**Components:**
- `app/f/[formId]/page.tsx` -- public form page (no dashboard shell)
- Uses `FormRenderer` (FE-10) with the public form data

**API Endpoints Consumed:**
- `GET /api/v1/public/forms/{id}` -- fetch published form
- `POST /api/v1/public/forms/{id}/submissions` -- submit response

**Dependencies:** FE-10, FE-3

**Acceptance Criteria:**
- Page renders the published form with the form's theme applied
- Loading state shows while form data is fetched
- 404 state for non-existent or non-published forms
- 410 state for closed forms (shows closed message)
- Form submission sends data to the public submission endpoint
- Validation errors from the server display inline on the correct fields
- Thank-you page shown on success
- Hidden fields are populated from URL query parameters
- Page has no dashboard navigation -- standalone
- Page is mobile-responsive

**User Stories:** US-4.1, US-4.2, US-4.4, US-4.5

---

### FE-16: Submissions Table Page

**Description:** Build the submissions list view for a form, showing all responses in a data table.

**Components:**
- `app/(dashboard)/forms/[formId]/submissions/page.tsx` -- submissions page
- `components/submissions/SubmissionsTable.tsx` -- data table with dynamic columns from form fields
- `components/submissions/SubmissionDetailSheet.tsx` -- slide-over panel showing full submission detail

**API Endpoints Consumed:**
- `GET /api/v1/forms/{id}/submissions` -- paginated list
- `GET /api/v1/submissions/{id}` -- single submission detail
- `DELETE /api/v1/submissions/{id}` -- delete one
- `DELETE /api/v1/forms/{id}/submissions` -- bulk delete
- `GET /api/v1/forms/{id}/submissions/export` -- CSV download

**Dependencies:** FE-4, FE-5, FE-6

**Acceptance Criteria:**
- Table columns are dynamically generated from the form's field definitions
- First column: submission date. Subsequent columns: field values (truncated with tooltip for long text)
- Pagination controls (page number, page size selector)
- Sorting by submission date (default newest first)
- Row click opens detail sheet/panel showing all field values
- Detail view has Previous/Next navigation between submissions
- Select rows with checkboxes for bulk delete
- "Export CSV" button triggers file download
- Empty state when no submissions
- Loading skeleton while fetching

**User Stories:** US-5.2, US-5.3, US-5.4, US-5.6

---

### FE-17: Analytics Dashboard

**Description:** Build the analytics view for a form showing summary statistics and charts.

**Components:**
- `app/(dashboard)/forms/[formId]/analytics/page.tsx` or a tab within the form detail page
- `components/analytics/SubmissionChart.tsx` -- line/bar chart for submissions over time
- `components/analytics/FieldChart.tsx` -- bar/pie chart for field value distribution
- `components/analytics/StatCard.tsx` -- card displaying a key metric (total submissions, average rating, etc.)

**API Endpoints Consumed:**
- `GET /api/v1/forms/{id}/analytics`

**Dependencies:** FE-4, FE-5

**Acceptance Criteria:**
- Shows total submission count as a prominent metric
- Line chart shows submissions per day for the selected date range
- Date range selector (last 7 days, 30 days, 90 days, custom)
- For choice fields: bar chart showing response distribution
- For rating/scale fields: average score + distribution chart
- Charts are responsive
- Loading state while fetching analytics
- Empty state when no submissions yet

**User Stories:** US-5.7

---

## Phase 5: Polish & Should-Have Features

### FE-18: Form Theming

**Description:** Build the theme customization UI in the form builder and apply themes to the public form renderer.

**Work Items:**
- Add "Design" tab to form builder (alongside Fields, Settings)
- Color pickers for primary, background, text colors
- Font family selector (system fonts + Google Fonts subset)
- Logo upload placeholder (URL input for now)
- Border radius selector (sm/md/lg)
- Pre-built theme presets (3-5 options)
- Apply theme CSS variables to the FormRenderer when rendering public forms

**Dependencies:** FE-11, FE-15

**Acceptance Criteria:**
- Theme changes preview in real-time in the builder
- Theme is saved as part of the form (auto-save)
- Public form page applies the form's theme
- Default theme looks professional without customization

**User Stories:** US-6.1

---

### FE-19: Dark Mode (Builder)

**Description:** Add dark mode support to the form builder/dashboard interface.

**Work Items:**
- Configure Tailwind dark mode (class-based)
- Add theme toggle in the dashboard header (system/light/dark)
- Persist preference in localStorage
- Ensure all components render correctly in dark mode
- Dark mode only applies to the builder UI, not public forms (public forms use their own theme)

**Dependencies:** FE-6

**Acceptance Criteria:**
- Toggle switches between light, dark, and system modes
- All dashboard pages render correctly in dark mode
- Preference persists across browser sessions
- No contrast issues in dark mode

**User Stories:** US-6.6

---

### FE-20: Keyboard Shortcuts

**Description:** Add keyboard shortcuts for power users in the form builder.

**Work Items:**
- Implement keyboard shortcut handler (custom hook or library)
- Shortcuts: Ctrl+Enter (add field), Delete (delete selected), Ctrl+D (duplicate), Ctrl+Z/Ctrl+Shift+Z (undo/redo), Ctrl+P (preview)
- Help dialog showing all shortcuts (triggered by `?` key)
- Ensure shortcuts do not conflict with browser defaults

**Dependencies:** FE-11

**Acceptance Criteria:**
- All listed shortcuts work in the builder
- Shortcuts are discoverable via help menu/dialog
- No conflicts with browser shortcuts
- Shortcuts work on both Mac (Cmd) and Windows/Linux (Ctrl)

**User Stories:** US-6.7

---

## Task Dependency Graph

```
FE-1 (Project Setup)
  │
  ├── FE-2 (Types) ──── FE-3 (API Client) ──── FE-4 (React Query Hooks)
  │                                                │
  │                                                ├── FE-7 (Dashboard)
  │                                                │      │
  │                                                │      └── FE-8 (Form Detail)
  │                                                │
  │                                                ├── FE-16 (Submissions Table)
  │                                                │
  │                                                └── FE-17 (Analytics)
  │
  └── FE-5 (Shared UI)
        │
        ├── FE-6 (Layout) ──── FE-7, FE-8, FE-16, FE-19
        │
        └── FE-9 (Field Components)
              │
              ├── FE-10 (Form Renderer)
              │     │
              │     ├── FE-13 (Auto-Save & Preview)
              │     │
              │     └── FE-15 (Public Form Page)
              │
              └── FE-11 (Builder Canvas & Palette)
                    │
                    ├── FE-12 (Field Configurator)
                    │     │
                    │     └── FE-14 (Multi-Page)
                    │
                    ├── FE-13 (Auto-Save & Preview)
                    │
                    ├── FE-18 (Theming)
                    │
                    └── FE-20 (Keyboard Shortcuts)
```

---

## Parallelization Notes

The following tasks can proceed in parallel (no dependency on each other):

**Batch 1 (start immediately):**
- FE-1, FE-2 (setup and types)

**Batch 2 (after FE-1 + FE-2):**
- FE-3 (API client), FE-5 (shared UI) -- can be done in parallel

**Batch 3 (after FE-3 + FE-5):**
- FE-4 (hooks), FE-6 (layout), FE-9 (field components) -- all in parallel

**Batch 4 (after batch 3):**
- FE-7 (dashboard), FE-10 (form renderer), FE-11 (builder canvas) -- all in parallel

**Batch 5 (after batch 4):**
- FE-8, FE-12, FE-13, FE-15, FE-16, FE-17 -- can be distributed across developers

**Batch 6 (polish):**
- FE-14, FE-18, FE-19, FE-20
