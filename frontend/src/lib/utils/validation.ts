import type { FormField, ValidationRule } from '@/types/form';

export function validateField(field: FormField, value: unknown): string | null {
  // Required check
  if (field.required) {
    const isEmpty =
      value === undefined ||
      value === null ||
      value === '' ||
      (Array.isArray(value) && value.length === 0);
    if (isEmpty) return 'This field is required';
  }

  // Skip further validation if empty and not required
  if (value === undefined || value === null || value === '') return null;

  // Built-in type validation
  if (field.type === 'EMAIL') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(value))) return 'Please enter a valid email address';
  }

  if (field.type === 'URL') {
    try {
      new URL(String(value));
    } catch {
      return 'Please enter a valid URL';
    }
  }

  // Custom validation rules
  for (const rule of field.validationRules ?? []) {
    const err = applyRule(rule, value);
    if (err) return err;
  }

  return null;
}

function applyRule(rule: ValidationRule, value: unknown): string | null {
  switch (rule.type) {
    case 'minLength': {
      if (String(value).length < Number(rule.value)) {
        return rule.message;
      }
      break;
    }
    case 'maxLength': {
      if (String(value).length > Number(rule.value)) {
        return rule.message;
      }
      break;
    }
    case 'pattern': {
      const regex = new RegExp(String(rule.value));
      if (!regex.test(String(value))) {
        return rule.message;
      }
      break;
    }
    case 'min': {
      if (Number(value) < Number(rule.value)) {
        return rule.message;
      }
      break;
    }
    case 'max': {
      if (Number(value) > Number(rule.value)) {
        return rule.message;
      }
      break;
    }
    case 'maxFileSize': {
      if (value instanceof File && value.size > Number(rule.value)) {
        return rule.message;
      }
      break;
    }
    case 'fileTypes': {
      if (value instanceof File && Array.isArray(rule.value)) {
        const ext = value.name.split('.').pop()?.toLowerCase() ?? '';
        if (!rule.value.includes(ext)) {
          return rule.message;
        }
      }
      break;
    }
  }
  return null;
}
