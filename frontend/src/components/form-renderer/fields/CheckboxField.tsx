'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { FieldProps } from './TextField';

export function CheckboxField({ field, value, onChange, error, disabled }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Checkbox
          id={field.name}
          checked={!!value}
          onCheckedChange={(checked) => onChange(!!checked)}
          disabled={disabled}
          aria-invalid={!!error}
        />
        <Label htmlFor={field.name} className="font-normal cursor-pointer">
          {field.label}
          {field.required && <span className="text-destructive ml-1">*</span>}
        </Label>
      </div>
      {field.helpText && <p className="text-xs text-muted-foreground pl-6">{field.helpText}</p>}
      {error && <p className="text-xs text-destructive pl-6">{error}</p>}
    </div>
  );
}
