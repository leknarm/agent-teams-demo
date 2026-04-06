'use client';

import { useState, useEffect } from 'react';
import type { FieldProps } from './TextField';

/**
 * Allowed HTML tags and attributes for content fields.
 * Enforced by DOMPurify (SEC-01 / CRIT-01 fix).
 *
 * IMPORTANT: run `npm install dompurify @types/dompurify` in the frontend
 * directory before building. The dynamic import below loads DOMPurify only
 * in the browser, which avoids SSR issues (DOMPurify requires a DOM).
 */
const ALLOWED_TAGS = [
  'b', 'i', 'em', 'strong', 'a', 'p', 'br',
  'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4',
  'blockquote', 'code', 'pre',
];
const ALLOWED_ATTR = ['href', 'target', 'rel'];

export function ContentField({ field }: FieldProps) {
  const rawHtml = field.config?.html as string | undefined;
  const [sanitized, setSanitized] = useState<string | null>(null);

  useEffect(() => {
    if (!rawHtml) {
      setSanitized(null);
      return;
    }

    // Dynamically import DOMPurify so it only runs in the browser.
    import('dompurify').then(({ default: DOMPurify }) => {
      setSanitized(
        DOMPurify.sanitize(rawHtml, { ALLOWED_TAGS, ALLOWED_ATTR })
      );
    });
  }, [rawHtml]);

  if (!rawHtml) {
    return (
      <div className="text-sm text-muted-foreground">
        <p>{field.label}</p>
      </div>
    );
  }

  // While DOMPurify is loading, render nothing rather than unsanitized HTML.
  if (sanitized === null) {
    return null;
  }

  return (
    <div
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
}
