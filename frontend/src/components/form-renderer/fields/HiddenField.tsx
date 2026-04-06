import type { FieldProps } from './TextField';

// Hidden fields are not rendered visually -- they hold a value from URL params
export function HiddenField(_props: FieldProps) {
  return null;
}
