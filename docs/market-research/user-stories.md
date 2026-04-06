# User Stories: Dynamic Form Builder

**Date:** 2026-04-06
**Source:** Competitive analysis of Typeform, Tally, JotForm, Google Forms, Microsoft Forms, SurveyMonkey, Airtable Forms, Cognito Forms

---

## Competitive Analysis Summary

| Product | Builder UX | Field Types | Logic | Analytics | Best For |
|---------|-----------|-------------|-------|-----------|----------|
| Typeform | Sidebar + one-at-a-time | 20+ | Strong | Strong | Beautiful conversational forms |
| Tally | Inline block editing | 25+ | Strong | Basic | Fast, free, developer-friendly |
| JotForm | Drag-and-drop canvas | 30+ | Strong | Good | Feature-complete enterprise forms |
| Google Forms | Inline WYSIWYG | 11 | Basic (skip only) | Basic | Quick, free, collaborative |
| Microsoft Forms | Inline WYSIWYG | 12 | Moderate | Moderate | Enterprise M365 environments |
| SurveyMonkey | Step-by-step wizard | 20+ | Moderate | Excellent | Research surveys and analytics |
| Airtable Forms | Field-to-column mapping | 15+ | None | Via Airtable views | Data collection into databases |
| Cognito Forms | Drag-and-drop + sections | 25+ | Strong | Good | Calculations, payments, compliance |

---

## Best Practices Identified

### From Typeform
- One-question-at-a-time reduces cognitive load and increases completion rates
- Smooth animations between questions create a premium feel
- Keyboard navigation (Enter to advance) speeds up form filling
- Progress bar with percentage gives respondents confidence

### From Tally
- Block-based editing (like Notion) lowers the learning curve dramatically
- Slash commands (`/`) for adding fields feel natural to modern users
- WYSIWYG editing means what you build is what respondents see
- Generous free tier drives adoption (monetize on advanced features)

### From JotForm
- Drag-and-drop with visual placeholders is intuitive for complex layouts
- Exhaustive field type library means users rarely hit limitations
- Template gallery with 10,000+ options gets users started fast
- Conditional logic visual editor makes complex branching manageable

### From Google Forms
- Zero-friction start (no signup for basic use) maximizes adoption
- Direct integration with spreadsheet (Google Sheets) is killer for data management
- Real-time collaboration lets teams build forms together
- Summary charts auto-generated from responses save time

### From Microsoft Forms
- Branching logic UI is clean and approachable
- Enterprise compliance features (data residency, audit logs) matter for B2B
- Integration with Power Automate enables complex workflows without code

### From SurveyMonkey
- AI-powered question suggestions reduce blank-page paralysis
- Analytics depth (cross-tabs, benchmarks, statistical significance) is unmatched
- Drop-off analysis helps form creators optimize completion rates

### From Airtable Forms
- Mapping form fields directly to database columns ensures data integrity
- Rich views (grid, kanban, calendar) on collected data add value beyond the form
- Linked records enable relational data collection

### From Cognito Forms
- Calculated fields with formula support enable complex business forms
- Repeating sections let respondents add multiple entries (e.g., line items)
- Built-in payment processing simplifies order and registration forms
- HIPAA compliance opens healthcare and regulated industry markets

---

## User Stories by Epic

---

## Epic 1: Form Builder (Creating/Editing Forms)

### US-1.1: Create a New Blank Form

As a **form creator**,
I want to create a new blank form with a title and optional description,
so that I can start building a form from scratch.

**Acceptance Criteria:**
- [ ] User can click a "Create Form" button from the forms dashboard
- [ ] A new form is created with default title "Untitled Form"
- [ ] User can edit the form title inline
- [ ] User can add an optional form description below the title
- [ ] The form is saved in "Draft" status by default
- [ ] User is redirected to the form builder view after creation

**Priority:** Must-have
**Inspired by:** Google Forms, Tally (instant form creation with zero friction)

---

### US-1.2: Add Fields to a Form

As a **form creator**,
I want to add fields to my form by clicking an "Add Field" button and selecting a field type,
so that I can build the structure of my form.

**Acceptance Criteria:**
- [ ] An "Add Field" button or "+" icon is visible at the bottom of the form and between existing fields
- [ ] Clicking it opens a field type picker (dropdown, modal, or sidebar panel)
- [ ] Field types are organized by category (Text, Choice, Date/Time, Advanced)
- [ ] Selected field is added to the form immediately with a default label
- [ ] New field receives focus so the user can start editing the label immediately
- [ ] Fields can be added at any position in the form (not just at the end)

**Priority:** Must-have
**Inspired by:** Tally (inline "+" button), Google Forms (add field toolbar)

---

### US-1.3: Reorder Fields via Drag and Drop

As a **form creator**,
I want to reorder form fields by dragging and dropping them,
so that I can arrange my form layout intuitively.

**Acceptance Criteria:**
- [ ] Each field has a visible drag handle on hover
- [ ] Dragging a field shows a visual placeholder at the drop target
- [ ] Dropping a field updates the form order immediately
- [ ] Drag and drop works for all field types
- [ ] Order change is persisted (auto-saved or on explicit save)
- [ ] Keyboard-based reordering is supported as an accessible alternative

**Priority:** Must-have
**Inspired by:** JotForm (polished drag-and-drop), Cognito Forms (drag-and-drop with sections)

---

### US-1.4: Edit Field Properties

As a **form creator**,
I want to configure field properties (label, placeholder, help text, required status),
so that I can customize each field's behavior and appearance.

**Acceptance Criteria:**
- [ ] Clicking a field selects it and shows its configuration panel
- [ ] Editable properties include: label, placeholder text, help text, required toggle
- [ ] Changes to properties are reflected in real-time on the form preview
- [ ] Each field type shows relevant properties only (e.g., "options" for dropdowns, "min/max" for numbers)
- [ ] Label supports basic formatting or at minimum plain text
- [ ] Required toggle is prominently placed and defaults to "not required"

**Priority:** Must-have
**Inspired by:** JotForm (sidebar property panel), Typeform (inline editing with detail panel)

---

### US-1.5: Delete a Field

As a **form creator**,
I want to delete a field from my form,
so that I can remove fields I no longer need.

**Acceptance Criteria:**
- [ ] Each field has a delete button (trash icon) visible on hover or selection
- [ ] Deleting a field shows a confirmation dialog (or supports undo)
- [ ] Deleting a field removes it from the form immediately
- [ ] If the field is referenced in conditional logic, the user is warned before deletion
- [ ] Undo is available for at least 10 seconds after deletion (preferred over confirmation dialog)

**Priority:** Must-have
**Inspired by:** Tally (undo-based deletion), Google Forms (immediate delete with undo toast)

---

### US-1.6: Duplicate a Field

As a **form creator**,
I want to duplicate an existing field with all its configuration,
so that I can quickly create similar fields without reconfiguring from scratch.

**Acceptance Criteria:**
- [ ] Each field has a "Duplicate" action (icon or menu option)
- [ ] Duplicated field is inserted immediately below the original
- [ ] All properties are copied (label appended with "Copy", placeholder, help text, validation rules, options)
- [ ] Duplicated field receives focus for immediate editing

**Priority:** Should-have
**Inspired by:** Google Forms, JotForm (one-click duplicate)

---

### US-1.7: Auto-Save Form Changes

As a **form creator**,
I want my form changes to be saved automatically,
so that I do not lose work if I close the browser or navigate away.

**Acceptance Criteria:**
- [ ] Form changes are auto-saved within 2 seconds of the last edit (debounced)
- [ ] A save status indicator shows "Saving...", "Saved", or "Error saving"
- [ ] If auto-save fails, the user is notified and can retry manually
- [ ] Navigating away from an unsaved form triggers a browser confirmation dialog
- [ ] Auto-save does not interfere with the editing experience (no freezing or lag)

**Priority:** Must-have
**Inspired by:** Google Forms (seamless auto-save), Tally (auto-save with status indicator)

---

### US-1.8: Preview Form Before Publishing

As a **form creator**,
I want to preview how my form will look to respondents before publishing,
so that I can verify the form experience and catch issues.

**Acceptance Criteria:**
- [ ] A "Preview" button is available in the builder toolbar
- [ ] Preview shows the form exactly as a respondent would see it
- [ ] Preview supports both desktop and mobile viewport simulation
- [ ] Conditional logic and validation work in preview mode
- [ ] User can easily switch back to the builder from preview
- [ ] Preview does not submit real data to the submissions store

**Priority:** Must-have
**Inspired by:** JotForm (split-view preview), Typeform (full preview with device simulation)

---

### US-1.9: Publish and Unpublish a Form

As a **form creator**,
I want to publish my form to make it available for respondents, and unpublish it to stop accepting responses,
so that I can control when my form is active.

**Acceptance Criteria:**
- [ ] A "Publish" button changes the form status from "Draft" to "Published"
- [ ] Published forms generate a shareable link
- [ ] An "Unpublish" or "Close" action changes the status to "Closed"
- [ ] Closed forms display a "This form is no longer accepting responses" message
- [ ] Republishing a closed form makes it active again
- [ ] Form status is clearly visible in the builder and on the forms dashboard

**Priority:** Must-have
**Inspired by:** Google Forms (accepting responses toggle), Tally (publish/unpublish)

---

### US-1.10: Form Templates

As a **form creator**,
I want to start from a pre-built template instead of a blank form,
so that I can save time on common form types (contact, feedback, registration).

**Acceptance Criteria:**
- [ ] A template gallery is accessible from the "Create Form" flow
- [ ] Templates are categorized (e.g., Contact, Feedback, Registration, Survey, Order)
- [ ] At least 5-10 templates are available at launch
- [ ] Selecting a template creates a copy that the user can fully customize
- [ ] Templates include appropriate field types, validation, and example content
- [ ] User can preview a template before selecting it

**Priority:** Should-have
**Inspired by:** JotForm (10,000+ templates), Typeform (curated template gallery)

---

## Epic 2: Field Types & Configuration

### US-2.1: Text Input Fields

As a **form creator**,
I want to add text input fields (short text, long text/paragraph, email, URL, phone number),
so that I can collect various types of textual information.

**Acceptance Criteria:**
- [ ] Short text field renders as a single-line `<input type="text">`
- [ ] Long text/paragraph renders as a multi-line `<textarea>` with configurable rows
- [ ] Email field validates email format automatically
- [ ] URL field validates URL format automatically
- [ ] Phone field accepts phone numbers with optional country code format
- [ ] Each text field supports: placeholder, help text, min/max length, required toggle
- [ ] All fields have appropriate `inputmode` and `type` attributes for mobile keyboards

**Priority:** Must-have
**Inspired by:** All products (universal text fields), JotForm (dedicated email/phone/URL types)

---

### US-2.2: Number Input Field

As a **form creator**,
I want to add a number input field with configurable min/max values and step increments,
so that I can collect numeric data with appropriate constraints.

**Acceptance Criteria:**
- [ ] Number field renders with numeric keyboard on mobile devices
- [ ] Configurable properties: min value, max value, step/increment, decimal places
- [ ] Non-numeric input is prevented or immediately flagged
- [ ] Error message shown when value is out of range
- [ ] Supports integer and decimal configurations
- [ ] Optional prefix/suffix display (e.g., "$", "%", "kg")

**Priority:** Must-have
**Inspired by:** Cognito Forms (advanced number config), JotForm (number with prefix/suffix)

---

### US-2.3: Selection Fields (Dropdown, Radio, Checkbox)

As a **form creator**,
I want to add single-select (dropdown, radio buttons) and multi-select (checkboxes) fields with configurable options,
so that I can let respondents choose from predefined answers.

**Acceptance Criteria:**
- [ ] Dropdown renders as a `<select>` or custom searchable dropdown
- [ ] Radio buttons render as a vertical list of options (single select)
- [ ] Checkboxes render as a vertical list of options (multi select)
- [ ] Creator can add, edit, reorder, and remove options
- [ ] Each option has a label and an optional value (for data export)
- [ ] Options support "Other" with a free-text input field
- [ ] Dropdown supports search/filter when there are more than 7 options
- [ ] Checkbox field supports min/max selections configuration

**Priority:** Must-have
**Inspired by:** Google Forms (add "Other" option), JotForm (searchable dropdown), Typeform (picture choice variant)

---

### US-2.4: Date and Time Fields

As a **form creator**,
I want to add date and time picker fields with configurable formats and ranges,
so that I can collect temporal data from respondents.

**Acceptance Criteria:**
- [ ] Date field shows a calendar picker on click
- [ ] Time field shows a time picker (or input with format mask)
- [ ] Date-time combined field is available as a variant
- [ ] Configurable properties: date format display, min/max date, disabled dates (weekends, past dates)
- [ ] Date picker is accessible and works on mobile (native or custom)
- [ ] Default value can be set to "today" or a specific date

**Priority:** Must-have
**Inspired by:** JotForm (rich date picker), Cognito Forms (date range validation)

---

### US-2.5: File Upload Field

As a **form creator**,
I want to add a file upload field with configurable file type and size restrictions,
so that respondents can attach documents, images, or other files.

**Acceptance Criteria:**
- [ ] File upload field supports drag-and-drop and click-to-browse
- [ ] Configurable allowed file types (e.g., .pdf, .jpg, .png, .docx)
- [ ] Configurable maximum file size (e.g., 5MB, 10MB)
- [ ] Configurable maximum number of files (single or multiple)
- [ ] Upload progress indicator is shown during upload
- [ ] Uploaded file name and size are displayed with a remove option
- [ ] Error messages shown for invalid file type or size

**Priority:** Must-have
**Inspired by:** JotForm (multi-file upload with preview), Tally (clean drag-and-drop upload)

---

### US-2.6: Rating and Scale Fields

As a **form creator**,
I want to add rating (stars/emoji) and linear scale fields,
so that I can collect quantitative feedback and satisfaction scores.

**Acceptance Criteria:**
- [ ] Rating field displays interactive stars (default 5, configurable 1-10)
- [ ] Rating supports custom icons (stars, hearts, thumbs up) or emoji
- [ ] Linear scale field displays a numbered scale with configurable range (e.g., 1-5, 0-10)
- [ ] Scale field supports custom labels for start and end points (e.g., "Not satisfied" to "Very satisfied")
- [ ] Both fields are touch-friendly for mobile devices
- [ ] NPS (0-10 scale) variant available as a preset

**Priority:** Should-have
**Inspired by:** Typeform (beautiful animated ratings), SurveyMonkey (NPS preset), Microsoft Forms (Likert scale)

---

### US-2.7: Section Headings and Content Blocks

As a **form creator**,
I want to add section headings, descriptions, and rich text content blocks,
so that I can organize my form and provide context to respondents.

**Acceptance Criteria:**
- [ ] Section heading field displays styled heading text (not an input field)
- [ ] Description/content block supports rich text (bold, italic, links, lists)
- [ ] Content blocks do not collect data -- they are display-only
- [ ] Sections can visually separate groups of related fields
- [ ] Section headings appear in the form's table of contents or progress indicator

**Priority:** Must-have
**Inspired by:** Google Forms (section headers), Tally (rich text blocks between fields)

---

### US-2.8: Hidden Fields

As a **form creator**,
I want to add hidden fields that are not visible to respondents but capture metadata,
so that I can track UTM parameters, referral sources, or pre-populated identifiers.

**Acceptance Criteria:**
- [ ] Hidden fields are not rendered in the form for respondents
- [ ] Hidden field values can be set via URL query parameters
- [ ] Hidden field values can be set to static default values
- [ ] Hidden field values are included in submission data and exports
- [ ] Builder clearly distinguishes hidden fields from visible fields

**Priority:** Should-have
**Inspired by:** Typeform (hidden fields for tracking), Tally (hidden fields via URL params)

---

## Epic 3: Validation & Logic

### US-3.1: Required Field Validation

As a **form creator**,
I want to mark fields as required and have the form prevent submission if required fields are empty,
so that I receive complete submissions.

**Acceptance Criteria:**
- [ ] Each field has a "Required" toggle in its configuration
- [ ] Required fields display a visual indicator (asterisk or "Required" label)
- [ ] Submitting a form with empty required fields shows inline error messages
- [ ] Error messages appear next to the specific field, not just at the top of the form
- [ ] The form scrolls to the first error field on submission attempt
- [ ] Required validation runs on both client and server side

**Priority:** Must-have
**Inspired by:** All products (universal pattern)

---

### US-3.2: Format Validation Rules

As a **form creator**,
I want to configure format validation rules for text fields (email, URL, phone, custom pattern),
so that I receive properly formatted data.

**Acceptance Criteria:**
- [ ] Email fields automatically validate email format (RFC 5322 basic)
- [ ] URL fields validate URL format
- [ ] Phone fields validate phone number format (configurable strictness)
- [ ] Text fields support min/max character length validation
- [ ] Number fields support min/max value range validation
- [ ] Custom regex pattern validation is available for advanced users
- [ ] Each validation rule supports a custom error message
- [ ] Validation runs in real-time as the user types or on field blur (configurable)

**Priority:** Must-have
**Inspired by:** Cognito Forms (custom error messages), JotForm (regex support), Google Forms (response validation)

---

### US-3.3: Conditional Field Visibility

As a **form creator**,
I want to show or hide fields based on the respondent's answers to other fields,
so that the form adapts dynamically and only shows relevant questions.

**Acceptance Criteria:**
- [ ] Any field can have one or more visibility conditions
- [ ] Conditions reference another field's value (e.g., "Show this field if Question 3 = 'Yes'")
- [ ] Supported operators: equals, not equals, contains, is empty, is not empty, greater than, less than
- [ ] Multiple conditions can be combined with AND / OR logic
- [ ] Hidden fields are not validated and their values are excluded from submission
- [ ] Conditional logic is configurable through a visual UI (not code)
- [ ] Changes to conditions are reflected in real-time in the builder preview

**Priority:** Should-have
**Inspired by:** Typeform (Logic Jump), JotForm (conditional logic builder), Tally (conditional blocks)

---

### US-3.4: Page/Section Skip Logic

As a **form creator**,
I want to configure skip logic that directs respondents to different pages or sections based on their answers,
so that I can create branching form experiences.

**Acceptance Criteria:**
- [ ] In multi-page forms, each page can have navigation rules
- [ ] Rules specify "If [field] [operator] [value], go to [page/section]"
- [ ] Default behavior (go to next page) applies when no rules match
- [ ] A "Submit form" destination is available for early completion paths
- [ ] Skip logic is visualized in the builder (which page leads where)
- [ ] Circular logic is detected and prevented

**Priority:** Should-have
**Inspired by:** Google Forms (go-to-section logic), Typeform (Logic Jump), SurveyMonkey (skip logic)

---

### US-3.5: Client-Side and Server-Side Validation

As a **form creator**,
I want validation to run both in the browser and on the server,
so that I get a good user experience with real-time feedback and reliable data integrity.

**Acceptance Criteria:**
- [ ] Client-side validation runs on field blur and form submission attempt
- [ ] Server-side validation runs on every submission regardless of client-side results
- [ ] Validation rules are defined once and applied consistently on both sides
- [ ] Server-side validation returns clear error messages mapped to specific fields
- [ ] Client-side validation does not block submission for progressive enhancement (form works without JS)
- [ ] Server-side validation rejects submissions with invalid data and returns 400 with field-level errors

**Priority:** Must-have
**Inspired by:** Cognito Forms (robust server validation), JotForm (dual validation approach)

---

## Epic 4: Form Rendering & Submission

### US-4.1: Render a Published Form

As a **form respondent**,
I want to view and interact with a published form via its shared link,
so that I can fill out and submit the form.

**Acceptance Criteria:**
- [ ] Published forms are accessible via a unique URL (e.g., `/forms/{formId}`)
- [ ] The form renders all configured fields with proper labels, placeholders, and help text
- [ ] Required fields are visually indicated
- [ ] Form styling matches the creator's theme/customization settings
- [ ] The form is fully responsive (works on desktop, tablet, and mobile)
- [ ] Loading state is shown while the form data is fetched
- [ ] Closed or non-existent forms show an appropriate message

**Priority:** Must-have
**Inspired by:** All products (core functionality)

---

### US-4.2: Submit a Form

As a **form respondent**,
I want to fill out all fields and submit the form with a single click,
so that my response is recorded.

**Acceptance Criteria:**
- [ ] A "Submit" button is visible at the end of the form
- [ ] Clicking Submit validates all fields (client-side) before sending
- [ ] If validation fails, errors are displayed inline and the form scrolls to the first error
- [ ] If validation passes, the submission is sent to the server
- [ ] A loading/spinner state is shown during submission
- [ ] On success, a thank-you/confirmation page is displayed
- [ ] On failure (network or server error), an error message is shown with a retry option
- [ ] Double-click / duplicate submission is prevented

**Priority:** Must-have
**Inspired by:** All products (core functionality)

---

### US-4.3: Multi-Page Form Navigation

As a **form respondent**,
I want to navigate between pages/sections of a multi-page form with Next/Previous buttons,
so that I can complete long forms in manageable steps.

**Acceptance Criteria:**
- [ ] Multi-page forms display one page at a time
- [ ] "Next" and "Previous" buttons are displayed at the bottom of each page
- [ ] "Next" validates the current page before advancing (page-level validation)
- [ ] A progress indicator (bar or step indicator) shows current position
- [ ] The first page has no "Previous" button; the last page shows "Submit" instead of "Next"
- [ ] Navigation state is preserved if the user goes back and forth
- [ ] Page transitions are smooth (optional animation)

**Priority:** Must-have
**Inspired by:** Typeform (smooth transitions), JotForm (step progress bar), Google Forms (section navigation)

---

### US-4.4: Form Confirmation/Thank-You Page

As a **form creator**,
I want to configure a custom thank-you message shown after successful submission,
so that I can acknowledge the respondent and provide next steps.

**Acceptance Criteria:**
- [ ] Default thank-you message is "Thank you for your submission"
- [ ] Creator can customize the thank-you message text
- [ ] Creator can optionally add a redirect URL (redirect after N seconds)
- [ ] Creator can choose to show a "Submit another response" link
- [ ] Thank-you page prevents re-submission via browser back button
- [ ] Thank-you page is styled consistently with the form theme

**Priority:** Must-have
**Inspired by:** Google Forms (custom confirmation), Typeform (branded thank-you screen)

---

### US-4.5: Mobile-Responsive Form Rendering

As a **form respondent on a mobile device**,
I want the form to adapt to my screen size with touch-friendly inputs,
so that I can complete the form comfortably on my phone.

**Acceptance Criteria:**
- [ ] Form layout adapts to viewport widths from 320px to 1440px+
- [ ] Input fields are full-width on mobile screens
- [ ] Touch targets (buttons, checkboxes, radio buttons) are at least 44x44px
- [ ] Date pickers and dropdowns use native mobile controls or touch-optimized custom controls
- [ ] File upload supports mobile camera/gallery access
- [ ] Form is scrollable and does not require horizontal scrolling
- [ ] Font sizes are readable without zooming (min 16px for inputs to prevent iOS zoom)

**Priority:** Must-have
**Inspired by:** Typeform (excellent mobile UX), Google Forms (responsive), JotForm (mobile app)

---

### US-4.6: Embed Form in External Website

As a **form creator**,
I want to embed my form in an external website using an iframe or JavaScript embed code,
so that respondents can fill out the form without leaving my site.

**Acceptance Criteria:**
- [ ] An "Embed" option is available in the form sharing settings
- [ ] Embed code is provided as a copyable HTML snippet (iframe)
- [ ] Iframe embed works on any website without CORS issues
- [ ] Embedded form is responsive within its container
- [ ] Optional: JavaScript SDK embed that renders inline without iframe
- [ ] Embed supports passing URL parameters as hidden field values

**Priority:** Should-have
**Inspired by:** Typeform (multiple embed modes), JotForm (iframe + JS embed), Tally (script embed)

---

## Epic 5: Form Management & Analytics

### US-5.1: Forms Dashboard

As a **form creator**,
I want to see a dashboard listing all my forms with their status and submission count,
so that I can manage my forms from one place.

**Acceptance Criteria:**
- [ ] Dashboard displays a list/grid of all forms belonging to the user
- [ ] Each form card/row shows: title, status (Draft/Published/Closed), submission count, last modified date
- [ ] Forms can be sorted by name, date created, date modified, or submission count
- [ ] Forms can be filtered by status (All, Draft, Published, Closed)
- [ ] Search/filter by form title is available
- [ ] Quick actions available: edit, duplicate, delete, view submissions
- [ ] Empty state with "Create your first form" CTA when no forms exist

**Priority:** Must-have
**Inspired by:** JotForm (My Forms dashboard), Tally (workspace view), Google Forms (recent forms grid)

---

### US-5.2: View Submissions List

As a **form creator**,
I want to view a table of all submissions for a specific form,
so that I can review the responses I have received.

**Acceptance Criteria:**
- [ ] Submissions are displayed in a table/list view with columns matching form fields
- [ ] Table shows submission timestamp and a row per submission
- [ ] Table supports pagination (or infinite scroll) for large datasets
- [ ] Columns are resizable or at minimum show full content on hover/click
- [ ] Clicking a row opens a detailed single-submission view
- [ ] Table supports sorting by submission date (newest/oldest first)
- [ ] Empty state message when no submissions exist

**Priority:** Must-have
**Inspired by:** JotForm (submission inbox table), Airtable Forms (grid view), Google Forms (Responses tab)

---

### US-5.3: View Individual Submission Detail

As a **form creator**,
I want to view a single submission with all field values displayed clearly,
so that I can review a specific response in detail.

**Acceptance Criteria:**
- [ ] Individual submission view shows all fields with their labels and submitted values
- [ ] File upload fields show download links for uploaded files
- [ ] Hidden field values are shown with a "hidden field" indicator
- [ ] Navigation (Previous/Next) between submissions is available
- [ ] Submission metadata is displayed: submission date/time, submission ID
- [ ] Long text values are displayed in full (not truncated)

**Priority:** Must-have
**Inspired by:** Typeform (card-based response view), JotForm (submission detail modal), Google Forms (individual response tab)

---

### US-5.4: Export Submissions to CSV

As a **form creator**,
I want to export all submissions for a form as a CSV file,
so that I can analyze the data in a spreadsheet or import it into other tools.

**Acceptance Criteria:**
- [ ] An "Export" button is available on the submissions page
- [ ] Export generates a CSV file with column headers matching field labels
- [ ] All submissions are included in the export (or a filtered subset)
- [ ] File upload fields export as download URLs
- [ ] Multi-select fields export values as comma-separated within a single column
- [ ] CSV uses UTF-8 encoding with BOM for Excel compatibility
- [ ] Export handles large datasets (1000+ submissions) without timeout

**Priority:** Must-have
**Inspired by:** All products (universal feature), Google Forms (download as CSV)

---

### US-5.5: Email Notification on New Submission

As a **form creator**,
I want to receive an email notification when a new submission is received,
so that I can respond to submissions promptly.

**Acceptance Criteria:**
- [ ] Email notifications are configurable per form (on/off)
- [ ] Notification email includes: form name, submission timestamp, and submitted field values
- [ ] Creator can configure which email address(es) receive notifications
- [ ] Notification emails are sent within 1 minute of submission
- [ ] Email content is formatted readably (not raw JSON)
- [ ] Creator can optionally enable a confirmation email to the respondent (if email field exists)

**Priority:** Should-have
**Inspired by:** JotForm (customizable email notifications), Tally (email alerts), Google Forms (email notification add-on)

---

### US-5.6: Delete a Submission

As a **form creator**,
I want to delete individual submissions,
so that I can remove test entries or irrelevant responses.

**Acceptance Criteria:**
- [ ] A "Delete" action is available on each submission row and in the detail view
- [ ] Deleting a submission requires confirmation
- [ ] Deleted submissions are removed from the list and from export data
- [ ] Bulk delete (select multiple) is supported
- [ ] Submission count is updated after deletion

**Priority:** Should-have
**Inspired by:** JotForm (submission management), Google Forms (delete response)

---

### US-5.7: Basic Submission Analytics

As a **form creator**,
I want to see a summary dashboard with basic analytics for each form (total submissions, completion rate, response charts),
so that I can understand how my form is performing.

**Acceptance Criteria:**
- [ ] Summary view shows: total submissions, submissions over time (chart), completion rate
- [ ] For choice-based fields (dropdown, radio, checkbox), a bar or pie chart shows answer distribution
- [ ] For rating/scale fields, average score and distribution are shown
- [ ] Analytics update in real-time as new submissions arrive
- [ ] Summary view is accessible from the form's submissions page via a tab or toggle

**Priority:** Should-have
**Inspired by:** Google Forms (response summary charts), SurveyMonkey (analytics dashboard), Typeform (Insights tab)

---

### US-5.8: Webhook on Form Submission

As a **form creator (technical user)**,
I want to configure a webhook URL that receives a POST request with submission data on every new submission,
so that I can integrate form submissions with external systems.

**Acceptance Criteria:**
- [ ] Webhook URL is configurable per form in the form settings
- [ ] Webhook sends a POST request with JSON body containing all field values
- [ ] Webhook payload includes form ID, submission ID, and timestamp
- [ ] Webhook supports custom headers (e.g., for authentication)
- [ ] Failed webhooks are retried (at least 3 attempts with exponential backoff)
- [ ] Webhook delivery status/logs are visible in form settings

**Priority:** Should-have
**Inspired by:** Typeform (webhooks), Tally (webhooks), JotForm (webhooks with retry)

---

## Epic 6: User Experience & Design

### US-6.1: Form Theme Customization

As a **form creator**,
I want to customize the visual theme of my form (colors, fonts, logo),
so that the form matches my brand identity.

**Acceptance Criteria:**
- [ ] Form settings include a "Theme" or "Design" section
- [ ] Customizable properties: primary color, background color, text color, font family
- [ ] Logo/image upload for form header
- [ ] At least 3-5 pre-built themes are available as starting points
- [ ] Theme preview updates in real-time as changes are made
- [ ] Theme settings apply consistently across all pages and the thank-you page
- [ ] Default theme is clean and professional (works without customization)

**Priority:** Should-have
**Inspired by:** Typeform (beautiful themes), JotForm (theme designer), Tally (clean defaults)

---

### US-6.2: Progress Indicator for Multi-Page Forms

As a **form respondent**,
I want to see my progress through a multi-page form,
so that I know how much is left and can gauge the time commitment.

**Acceptance Criteria:**
- [ ] Progress indicator is displayed at the top of multi-page forms
- [ ] Indicator shows current page / total pages or a percentage bar
- [ ] Progress updates as the user navigates between pages
- [ ] Progress indicator is not shown on single-page forms
- [ ] Style options: progress bar, step dots, or fraction text (e.g., "Step 2 of 5")
- [ ] Progress indicator is accessible (aria-progressbar or equivalent)

**Priority:** Must-have
**Inspired by:** Typeform (percentage bar), JotForm (step indicator), Google Forms (progress bar option)

---

### US-6.3: Accessible Form Rendering (WCAG)

As a **form respondent with a disability**,
I want the form to be fully accessible via keyboard navigation and screen readers,
so that I can complete the form independently.

**Acceptance Criteria:**
- [ ] All form fields have associated `<label>` elements
- [ ] Tab order follows the visual field order
- [ ] Error messages are announced by screen readers (aria-live or aria-describedby)
- [ ] Required fields are indicated in a non-color-only way (text or icon + aria-required)
- [ ] Focus states are clearly visible on all interactive elements
- [ ] Color contrast meets WCAG AA (4.5:1 for text, 3:1 for large text)
- [ ] Form can be completed entirely via keyboard
- [ ] File upload is accessible (keyboard operable, screen reader labels)

**Priority:** Must-have
**Inspired by:** Cognito Forms (WCAG compliance focus), Google Forms (accessible by default)

---

### US-6.4: Inline Error Messages with Helpful Text

As a **form respondent**,
I want to see clear, inline error messages next to the field that has an issue,
so that I know exactly what to fix.

**Acceptance Criteria:**
- [ ] Error messages appear directly below the invalid field
- [ ] Error messages are specific (e.g., "Please enter a valid email address" not "Invalid input")
- [ ] Error messages appear in a distinct color (red/danger) with an icon
- [ ] The invalid field's border is highlighted
- [ ] Errors are shown on field blur (real-time) or on submit -- not while the user is still typing
- [ ] When the user corrects the input, the error clears immediately
- [ ] Error messages support custom text set by the form creator

**Priority:** Must-have
**Inspired by:** Cognito Forms (real-time with custom messages), JotForm (inline errors), Typeform (contextual error feedback)

---

### US-6.5: Loading and Empty States

As a **form respondent or creator**,
I want to see appropriate loading indicators and empty state messages,
so that I understand the system status at all times.

**Acceptance Criteria:**
- [ ] Form loading shows a skeleton or spinner while data is fetched
- [ ] Form builder shows an empty state with instructions when a form has no fields
- [ ] Submissions page shows an empty state ("No submissions yet") when empty
- [ ] Dashboard shows an empty state with a CTA to create the first form
- [ ] Network error states show a clear message with a retry option
- [ ] Loading states do not flash for fast responses (min 200ms threshold)

**Priority:** Must-have
**Inspired by:** Tally (clean empty states), Linear (minimal loading states)

---

### US-6.6: Dark Mode Support

As a **form creator**,
I want the form builder interface to support dark mode,
so that I can work comfortably in low-light environments.

**Acceptance Criteria:**
- [ ] Form builder supports light and dark color schemes
- [ ] Mode can be set to: system preference, light, or dark
- [ ] All UI elements (buttons, panels, inputs, modals) adapt to the selected mode
- [ ] Dark mode does not affect the respondent-facing form (forms use their own theme)
- [ ] Mode preference is persisted across sessions

**Priority:** Nice-to-have
**Inspired by:** Tally (dark mode builder), Linear (dark mode), Notion (dark mode)

---

### US-6.7: Keyboard Shortcuts in Builder

As a **form creator (power user)**,
I want keyboard shortcuts for common builder actions,
so that I can build forms faster without using the mouse.

**Acceptance Criteria:**
- [ ] Keyboard shortcut for adding a new field (e.g., Ctrl/Cmd + Enter or `/`)
- [ ] Keyboard shortcut for deleting selected field (e.g., Delete/Backspace)
- [ ] Keyboard shortcut for duplicating selected field (e.g., Ctrl/Cmd + D)
- [ ] Keyboard shortcut for undo/redo (Ctrl/Cmd + Z / Ctrl/Cmd + Shift + Z)
- [ ] Keyboard shortcut for preview (Ctrl/Cmd + P)
- [ ] Keyboard shortcut for save/publish
- [ ] Shortcuts are discoverable via a help menu or tooltip
- [ ] Shortcuts do not conflict with browser defaults

**Priority:** Nice-to-have
**Inspired by:** Tally (slash commands), Notion (extensive shortcuts), Linear (keyboard-first design)

---

## Story Priority Summary

### Must-Have (MVP)
| ID | Story | Epic |
|----|-------|------|
| US-1.1 | Create a New Blank Form | Form Builder |
| US-1.2 | Add Fields to a Form | Form Builder |
| US-1.3 | Reorder Fields via Drag and Drop | Form Builder |
| US-1.4 | Edit Field Properties | Form Builder |
| US-1.5 | Delete a Field | Form Builder |
| US-1.7 | Auto-Save Form Changes | Form Builder |
| US-1.8 | Preview Form Before Publishing | Form Builder |
| US-1.9 | Publish and Unpublish a Form | Form Builder |
| US-2.1 | Text Input Fields | Field Types |
| US-2.2 | Number Input Field | Field Types |
| US-2.3 | Selection Fields | Field Types |
| US-2.4 | Date and Time Fields | Field Types |
| US-2.5 | File Upload Field | Field Types |
| US-2.7 | Section Headings and Content Blocks | Field Types |
| US-3.1 | Required Field Validation | Validation & Logic |
| US-3.2 | Format Validation Rules | Validation & Logic |
| US-3.5 | Client-Side and Server-Side Validation | Validation & Logic |
| US-4.1 | Render a Published Form | Rendering & Submission |
| US-4.2 | Submit a Form | Rendering & Submission |
| US-4.3 | Multi-Page Form Navigation | Rendering & Submission |
| US-4.4 | Form Confirmation/Thank-You Page | Rendering & Submission |
| US-4.5 | Mobile-Responsive Form Rendering | Rendering & Submission |
| US-5.1 | Forms Dashboard | Management & Analytics |
| US-5.2 | View Submissions List | Management & Analytics |
| US-5.3 | View Individual Submission Detail | Management & Analytics |
| US-5.4 | Export Submissions to CSV | Management & Analytics |
| US-6.2 | Progress Indicator for Multi-Page Forms | UX & Design |
| US-6.3 | Accessible Form Rendering (WCAG) | UX & Design |
| US-6.4 | Inline Error Messages with Helpful Text | UX & Design |
| US-6.5 | Loading and Empty States | UX & Design |

### Should-Have
| ID | Story | Epic |
|----|-------|------|
| US-1.6 | Duplicate a Field | Form Builder |
| US-1.10 | Form Templates | Form Builder |
| US-2.6 | Rating and Scale Fields | Field Types |
| US-2.8 | Hidden Fields | Field Types |
| US-3.3 | Conditional Field Visibility | Validation & Logic |
| US-3.4 | Page/Section Skip Logic | Validation & Logic |
| US-4.6 | Embed Form in External Website | Rendering & Submission |
| US-5.5 | Email Notification on New Submission | Management & Analytics |
| US-5.6 | Delete a Submission | Management & Analytics |
| US-5.7 | Basic Submission Analytics | Management & Analytics |
| US-5.8 | Webhook on Form Submission | Management & Analytics |
| US-6.1 | Form Theme Customization | UX & Design |

### Nice-to-Have
| ID | Story | Epic |
|----|-------|------|
| US-6.6 | Dark Mode Support | UX & Design |
| US-6.7 | Keyboard Shortcuts in Builder | UX & Design |

---

## Recommendations

### 1. Start with a Tally-like Builder UX
Adopt an inline/block-based editing approach similar to Tally rather than a complex drag-and-drop canvas like JotForm. This reduces development complexity, feels modern and intuitive, and aligns with the Notion-era expectation of WYSIWYG editing. Add drag-and-drop for reordering only.

### 2. Prioritize Validation Excellence
Most form builders treat validation as an afterthought. Make validation a first-class feature: real-time inline feedback, specific error messages, and rock-solid server-side validation. This is a differentiator that directly impacts data quality -- the primary reason people use forms.

### 3. Defer Advanced Features
Conditional logic, templates, analytics, and integrations are important but should come after the core builder, field types, and submission flow are solid. Ship a reliable MVP before expanding horizontally.

### 4. Design for Data from Day One
Follow Airtable's principle: treat submissions as structured data from the start. Design the data model to support filtering, sorting, and export from launch. This prevents costly rewrites later when analytics and integrations are added.

### 5. Accessibility is Non-Negotiable for MVP
Unlike many competitors who bolt on accessibility later, build WCAG AA compliance into the form renderer from day one. This is both the right thing to do and a competitive advantage in enterprise sales.

### 6. Plan for Extensibility
Design the field type system as a pluggable registry so new field types can be added without modifying core code. This is the pattern that JotForm and Cognito Forms use to support 30+ field types without a monolithic codebase.
