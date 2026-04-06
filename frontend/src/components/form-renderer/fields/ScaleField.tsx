'use client';

import { FieldWrapper } from './FieldWrapper';
import { cn } from '@/lib/utils';
import type { FieldProps } from './TextField';

export function ScaleField({ field, value, onChange, error, disabled }: FieldProps) {
  const min = (field.config?.min as number) ?? 1;
  const max = (field.config?.max as number) ?? 10;
  const minLabel = field.config?.minLabel as string | undefined;
  const maxLabel = field.config?.maxLabel as string | undefined;
  const current = value as number | undefined;

  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <FieldWrapper field={field} error={error}>
      <div className="space-y-2">
        <div className="flex gap-1">
          {options.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => !disabled && onChange(current === n ? null : n)}
              disabled={disabled}
              className={cn(
                'flex-1 min-w-[2rem] h-9 rounded border text-sm font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                current === n
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background hover:bg-muted border-input',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              aria-pressed={current === n}
            >
              {n}
            </button>
          ))}
        </div>
        {(minLabel || maxLabel) && (
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{minLabel}</span>
            <span>{maxLabel}</span>
          </div>
        )}
      </div>
    </FieldWrapper>
  );
}
