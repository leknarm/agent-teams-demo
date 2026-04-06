'use client';

import { Textarea } from '@/components/ui/textarea';
import { FieldWrapper } from './FieldWrapper';
import type { FieldProps } from './TextField';

export function TextareaField({ field, value, onChange, error, disabled }: FieldProps) {
  const rows = (field.config?.rows as number) ?? 4;

  return (
    <FieldWrapper field={field} error={error}>
      <Textarea
        id={field.name}
        placeholder={field.placeholder ?? undefined}
        value={(value as string) ?? ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={rows}
        aria-invalid={!!error}
      />
    </FieldWrapper>
  );
}
