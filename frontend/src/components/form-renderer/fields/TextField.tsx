'use client';

import { Input } from '@/components/ui/input';
import { FieldWrapper } from './FieldWrapper';
import type { FormField } from '@/types/form';

export interface FieldProps {
  field: FormField;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  disabled?: boolean;
}

export function TextField({ field, value, onChange, error, disabled }: FieldProps) {
  const typeMap: Record<string, string> = {
    EMAIL: 'email',
    URL: 'url',
    PHONE: 'tel',
    TEXT: 'text',
  };

  return (
    <FieldWrapper field={field} error={error}>
      <Input
        id={field.name}
        type={typeMap[field.type] ?? 'text'}
        placeholder={field.placeholder ?? undefined}
        value={(value as string) ?? ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${field.name}-error` : undefined}
      />
    </FieldWrapper>
  );
}
