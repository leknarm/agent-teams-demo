'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ProgressBar } from './ProgressBar';
import { ThankYouPage } from './ThankYouPage';
import { getFieldComponent } from './fields';
import { validateField } from '@/lib/utils/validation';
import type { Form, VisibilityRules } from '@/types/form';

interface FormRendererProps {
  form: Form;
  onSubmit?: (data: Record<string, unknown>) => Promise<void>;
  initialValues?: Record<string, unknown>;
  previewMode?: boolean;
}

function evaluateVisibility(rules: VisibilityRules | null, values: Record<string, unknown>): boolean {
  // Guard against null/malformed rules coming from the server (BUG-006).
  if (!rules || !Array.isArray(rules.conditions) || rules.conditions.length === 0) return true;

  const results = rules.conditions.map((condition) => {
    const fieldValue = values[condition.fieldName];
    switch (condition.op) {
      case 'equals': return fieldValue === condition.value;
      case 'not_equals': return fieldValue !== condition.value;
      case 'contains': return String(fieldValue ?? '').includes(String(condition.value ?? ''));
      case 'is_empty': return !fieldValue || fieldValue === '';
      case 'is_not_empty': return !!fieldValue && fieldValue !== '';
      case 'greater_than': return Number(fieldValue) > Number(condition.value);
      case 'less_than': return Number(fieldValue) < Number(condition.value);
      default: return true;
    }
  });

  return rules.operator === 'AND' ? results.every(Boolean) : results.some(Boolean);
}

export function FormRenderer({ form, onSubmit, initialValues = {}, previewMode = false }: FormRendererProps) {
  const maxPage = Math.max(...form.fields.map((f) => f.page ?? 0), 0);
  const [currentPage, setCurrentPage] = useState(0);
  const [values, setValues] = useState<Record<string, unknown>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const visibleFieldsOnPage = useCallback(
    (page: number) =>
      form.fields.filter(
        (f) => (f.page ?? 0) === page && evaluateVisibility(f.visibilityRules, values)
      ),
    [form.fields, values]
  );

  const validatePage = (page: number): boolean => {
    const fields = visibleFieldsOnPage(page);
    const newErrors: Record<string, string> = {};

    for (const field of fields) {
      if (field.type === 'SECTION' || field.type === 'CONTENT' || field.type === 'HIDDEN') {
        continue;
      }
      const error = validateField(field, values[field.name]);
      if (error) newErrors[field.name] = error;
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validatePage(currentPage)) {
      setCurrentPage((p) => p + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setCurrentPage((p) => p - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (previewMode) return;
    if (!validatePage(currentPage)) return;

    setIsSubmitting(true);
    try {
      await onSubmit?.(values);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = useCallback((name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[name];
      return updated;
    });
  }, []);

  if (submitted) {
    return (
      <ThankYouPage
        message={form.settings.successMessage}
        showAnotherResponseLink={form.settings.showAnotherResponseLink}
        onReset={() => {
          setValues(initialValues);
          setSubmitted(false);
          setCurrentPage(0);
        }}
      />
    );
  }

  const pageFields = visibleFieldsOnPage(currentPage);

  return (
    <form onSubmit={handleSubmit} noValidate>
      {maxPage > 0 && (
        <ProgressBar currentPage={currentPage} totalPages={maxPage + 1} className="mb-6" />
      )}

      <div className="space-y-6">
        {pageFields.map((field) => {
          const FieldComponent = getFieldComponent(field.type);
          return (
            <FieldComponent
              key={field.id}
              field={field}
              value={values[field.name]}
              onChange={(v) => handleChange(field.name, v)}
              error={errors[field.name]}
              disabled={previewMode || isSubmitting}
            />
          );
        })}
      </div>

      <div className="flex justify-between mt-8">
        {currentPage > 0 ? (
          <Button type="button" variant="outline" onClick={handlePrev} disabled={isSubmitting}>
            Previous
          </Button>
        ) : (
          <span />
        )}

        {currentPage < maxPage ? (
          <Button type="button" onClick={handleNext}>
            Next
          </Button>
        ) : (
          <Button type="submit" disabled={isSubmitting || previewMode}>
            {isSubmitting ? 'Submitting...' : form.settings.submitButtonText || 'Submit'}
          </Button>
        )}
      </div>
    </form>
  );
}
