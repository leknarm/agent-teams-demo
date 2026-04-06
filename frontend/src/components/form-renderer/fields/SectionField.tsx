import type { FieldProps } from './TextField';

export function SectionField({ field }: FieldProps) {
  return (
    <div className="pt-4">
      <h3 className="text-lg font-semibold">{field.label}</h3>
      {field.helpText && <p className="text-sm text-muted-foreground mt-1">{field.helpText}</p>}
      <hr className="mt-3 border-border" />
    </div>
  );
}
