# BUG-010: Next.js Build Cache Missing @tanstack Vendor Chunk — Form Builder Page Crashes

**Severity:** critical
**Component:** frontend
**Status:** open
**Assigned to:** frontend-builder

## Steps to Reproduce
1. Navigate to http://localhost:3000/forms
2. Click on any form card link to go to the form edit page (e.g., `/forms/{id}/edit`)
3. Observe a "Server Error" dialog appear

## Expected Behavior
The form builder page loads with the 3-panel layout (field palette on left, canvas in center, configurator on right).

## Actual Behavior
A Next.js "Server Error" dialog is displayed with:
```
Error: Cannot find module './vendor-chunks/@tanstack.js'
Require stack:
- .next/server/webpack-runtime.js
- .next/server/app/(dashboard)/forms/[formId]/edit/page.js
```

The form builder page is completely inaccessible.

## Evidence

### From Playwright test (navigation.spec.ts):
Page snapshot shows a "Server Error" dialog instead of the form builder:
```yaml
- dialog "Server Error":
  - heading "Server Error"
  - paragraph: "Error: Cannot find module './vendor-chunks/@tanstack.js'
    Require stack:
    - .next/server/webpack-runtime.js
    - .next/server/app/(dashboard)/forms/[formId]/edit/page.js"
```

### Root Cause:
The `.next/server/vendor-chunks/` directory only contains:
- `@dnd-kit.js`
- `@radix-ui.js`
- `@swc.js`
- `dompurify.js`
- `lucide-react.js`
- `next.js`

The `@tanstack.js` chunk is **missing**, even though `@tanstack/react-query` is a core dependency used across the entire application. The build cache was corrupted, likely from running `npm install` after the `.next` build artifacts were already generated.

## Suggested Fix

Clear the Next.js build cache and rebuild:
```bash
cd frontend
rm -rf .next
npm run dev
```

Or alternatively, rebuild the production assets:
```bash
cd frontend
rm -rf .next
npm run build
npm start
```

This will regenerate all vendor chunks including `@tanstack.js`.

## Impact
- **Form builder page**: completely broken (crashes with server error)
- **Form data fetching on dashboard**: potentially broken if client-side chunks are also affected
- **All pages that use @tanstack/react-query**: potentially affected
