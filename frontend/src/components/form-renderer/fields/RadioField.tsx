'use client';

import { FieldWrapper } from './FieldWrapper';
import type { FieldProps } from './TextField';

export function RadioField({ field, value, onChange, error, disabled }: FieldProps) {
  return (
    <FieldWrapper field={field} error={error}>
      <div className="space-y-2">
        {field.options?.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <input
              type="radio"
              id={`${field.name}-${option.value}`}
              name={field.name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              disabled={disabled}
              className="h-4 w-4 text-primary border-input"
            />
            <label
              htmlFor={`${field.name}-${option.value}`}
              className="text-sm font-normal cursor-pointer"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </FieldWrapper>
  );
}
