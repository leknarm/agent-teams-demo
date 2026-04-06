'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FieldWrapper } from './FieldWrapper';
import type { FieldProps } from './TextField';

export function SelectField({ field, value, onChange, error, disabled }: FieldProps) {
  return (
    <FieldWrapper field={field} error={error}>
      <Select
        value={(value as string) ?? ''}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger id={field.name} aria-invalid={!!error}>
          <SelectValue placeholder={field.placeholder ?? 'Select an option'} />
        </SelectTrigger>
        <SelectContent>
          {field.options?.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldWrapper>
  );
}
