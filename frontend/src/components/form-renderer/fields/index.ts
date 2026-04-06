import type { FieldType } from '@/types/form';
import type { ComponentType } from 'react';
import type { FieldProps } from './TextField';

import { TextField } from './TextField';
import { TextareaField } from './TextareaField';
import { NumberField } from './NumberField';
import { SelectField } from './SelectField';
import { MultiSelectField } from './MultiSelectField';
import { RadioField } from './RadioField';
import { CheckboxField } from './CheckboxField';
import { DateField } from './DateField';
import { FileField } from './FileField';
import { RatingField } from './RatingField';
import { ScaleField } from './ScaleField';
import { SectionField } from './SectionField';
import { ContentField } from './ContentField';
import { HiddenField } from './HiddenField';

export type { FieldProps };

export const fieldRegistry: Record<FieldType, ComponentType<FieldProps>> = {
  TEXT: TextField,
  TEXTAREA: TextareaField,
  NUMBER: NumberField,
  EMAIL: TextField,
  URL: TextField,
  PHONE: TextField,
  DATE: DateField,
  TIME: DateField,
  DATETIME: DateField,
  SELECT: SelectField,
  MULTI_SELECT: MultiSelectField,
  RADIO: RadioField,
  CHECKBOX: CheckboxField,
  FILE: FileField,
  RATING: RatingField,
  SCALE: ScaleField,
  SECTION: SectionField,
  CONTENT: ContentField,
  HIDDEN: HiddenField,
};

export function getFieldComponent(type: FieldType): ComponentType<FieldProps> {
  return fieldRegistry[type] ?? TextField;
}
