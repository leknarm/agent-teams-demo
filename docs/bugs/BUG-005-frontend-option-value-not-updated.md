# BUG-005: Field Configurator Does Not Update Option Value When Editing Option Label

**Severity:** major
**Component:** frontend
**Status:** open
**Assigned to:** frontend-builder

## Steps to Reproduce
1. Open the form builder and add a SELECT, MULTI_SELECT, or RADIO field
2. Go to the "Options" tab in the Field Configurator
3. Edit the label of "Option 1" to "Yes"
4. Save the form
5. Submit the form — note what value is stored in the submission

## Expected Behavior
When a user edits an option label in the UI, the option `value` should be updated to match (slugified). The `data` stored in submissions should use a meaningful value, e.g., `"yes"` not `"option_1"`.

## Actual Behavior
`FieldConfigurator.tsx:53-57` only updates the `label` of the option, never the `value`:

```tsx
const updateOption = (index: number, updates: Partial<FieldOption>) => {
  const opts = [...(field.options ?? [])];
  opts[index] = { ...opts[index], ...updates };
  handleChange({ options: opts });
};
```

In the options tab, only `label` is bound to the input:
```tsx
<Input
  value={opt.label}
  onChange={(e) => updateOption(i, { label: e.target.value })}
  placeholder="Label"
  ...
/>
```

The `value` field is never exposed to the user or auto-derived from the label. So an option initially created as `{ label: "Option 1", value: "option_1" }` will retain `value: "option_1"` even after the label is changed to "Yes". Submissions will store `"option_1"` rather than what the user sees.

## Evidence

`FieldConfigurator.tsx:165-183` — only label is editable:
```tsx
{(field.options ?? []).map((opt, i) => (
  <div key={i} className="flex gap-1.5 items-center">
    <Input
      value={opt.label}
      onChange={(e) => updateOption(i, { label: e.target.value })}
      placeholder="Label"
      ...
    />
```

`FormBuilderPage.tsx:44-50` — new options are created with auto-generated values:
```tsx
options: needsOptions(type) ? [{ label: 'Option 1', value: 'option_1' }] : null,
```

## Suggested Fix
Either:
1. Auto-derive the `value` from the `label` when label is edited (slugify), or
2. Add a separate editable "Value" input field in the options tab so users can explicitly control submission values.

Option 1 example in `updateOption`:
```tsx
const updateOption = (index: number, updates: Partial<FieldOption>) => {
  const opts = [...(field.options ?? [])];
  const updated = { ...opts[index], ...updates };
  if (updates.label !== undefined) {
    updated.value = slugify(updates.label) || `option_${index + 1}`;
  }
  opts[index] = updated;
  handleChange({ options: opts });
};
```
