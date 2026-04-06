'use client';

import { Input } from '@/components/ui/input';
import { FieldWrapper } from './FieldWrapper';
import type { FieldProps } from './TextField';

export function DateField({ field, value, onChange, error, disabled }: FieldProps) {
  const typeMap: Record<string, string> = {
    DATE: 'date',
    TIME: 'time',
    DATETIME: 'datetime-local',
  };

  return (
    <FieldWrapper field={field} error={error}>
      <Input
        id={field.name}
        type={typeMap[field.type] ?? 'date'}
        value={(value as string) ?? ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-invalid={!!error}
      />
    </FieldWrapper>
  );
}
