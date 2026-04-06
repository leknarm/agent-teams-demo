import { cn } from '@/lib/utils';
import type { FormField } from '@/types/form';

interface FieldWrapperProps {
  field: FormField;
  error?: string;
  children: React.ReactNode;
}

export function FieldWrapper({ field, error, children }: FieldWrapperProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={field.name}
        className="block text-sm font-medium leading-none"
      >
        {field.label}
        {field.required && <span className="text-destructive ml-1">*</span>}
      </label>
      {children}
      {field.helpText && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
