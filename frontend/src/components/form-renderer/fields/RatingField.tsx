'use client';

import { Star } from 'lucide-react';
import { FieldWrapper } from './FieldWrapper';
import { cn } from '@/lib/utils';
import type { FieldProps } from './TextField';

export function RatingField({ field, value, onChange, error, disabled }: FieldProps) {
  const maxRating = (field.config?.maxRating as number) ?? 5;
  const current = (value as number) ?? 0;

  return (
    <FieldWrapper field={field} error={error}>
      <div className="flex gap-1" role="radiogroup" aria-label={field.label}>
        {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={current === star}
            aria-label={`${star} star${star !== 1 ? 's' : ''}`}
            onClick={() => !disabled && onChange(current === star ? 0 : star)}
            disabled={disabled}
            className={cn(
              'p-0.5 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            <Star
              className={cn(
                'h-6 w-6 transition-colors',
                star <= current
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground hover:text-yellow-300'
              )}
            />
          </button>
        ))}
      </div>
    </FieldWrapper>
  );
}
