'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { FieldWrapper } from './FieldWrapper';
import type { FieldProps } from './TextField';

export function MultiSelectField({ field, value, onChange, error, disabled }: FieldProps) {
  const selected = (value as string[]) ?? [];

  const toggleOption = (optionValue: string) => {
    const updated = selected.includes(optionValue)
      ? selected.filter((v) => v !== optionValue)
      : [...selected, optionValue];
    onChange(updated);
  };

  return (
    <FieldWrapper field={field} error={error}>
      <div className="space-y-2">
        {field.options?.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <Checkbox
              id={`${field.name}-${option.value}`}
              checked={selected.includes(option.value)}
              onCheckedChange={() => toggleOption(option.value)}
              disabled={disabled}
            />
            <Label htmlFor={`${field.name}-${option.value}`} className="font-normal cursor-pointer">
              {option.label}
            </Label>
          </div>
        ))}
      </div>
    </FieldWrapper>
  );
}
