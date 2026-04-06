'use client';

import { Input } from '@/components/ui/input';
import { FieldWrapper } from './FieldWrapper';
import type { FieldProps } from './TextField';

export function NumberField({ field, value, onChange, error, disabled }: FieldProps) {
  const prefix = field.config?.prefix as string | undefined;
  const suffix = field.config?.suffix as string | undefined;
  const step = (field.config?.step as number) ?? 1;

  return (
    <FieldWrapper field={field} error={error}>
      <div className="flex items-center gap-1">
        {prefix && <span className="text-sm text-muted-foreground">{prefix}</span>}
        <Input
          id={field.name}
          type="number"
          step={step}
          placeholder={field.placeholder ?? undefined}
          value={value !== undefined && value !== null ? String(value) : ''}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
          disabled={disabled}
          aria-invalid={!!error}
          className="flex-1"
        />
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </div>
    </FieldWrapper>
  );
}
