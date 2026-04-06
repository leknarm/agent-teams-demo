'use client';

import { useRef } from 'react';
import { Upload } from 'lucide-react';
import { FieldWrapper } from './FieldWrapper';
import { cn } from '@/lib/utils';
import type { FieldProps } from './TextField';

export function FileField({ field, value, onChange, error, disabled }: FieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const accept = field.config?.accept as string | undefined;

  return (
    <FieldWrapper field={field} error={error}>
      <div
        className={cn(
          'border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && !disabled && inputRef.current?.click()}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-invalid={!!error}
      >
        <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
        {value ? (
          <p className="text-sm">{(value as File).name}</p>
        ) : (
          <>
            <p className="text-sm font-medium">Click to upload</p>
            <p className="text-xs text-muted-foreground mt-1">
              {accept ?? 'Any file type'}
            </p>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        id={field.name}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </FieldWrapper>
  );
}
