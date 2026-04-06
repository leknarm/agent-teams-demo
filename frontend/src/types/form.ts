// --- Enums ---

export type FormStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';

export type FieldType =
  | 'TEXT'
  | 'TEXTAREA'
  | 'NUMBER'
  | 'EMAIL'
  | 'URL'
  | 'PHONE'
  | 'DATE'
  | 'TIME'
  | 'DATETIME'
  | 'SELECT'
  | 'MULTI_SELECT'
  | 'RADIO'
  | 'CHECKBOX'
  | 'FILE'
  | 'RATING'
  | 'SCALE'
  | 'SECTION'
  | 'CONTENT'
  | 'HIDDEN';

// --- Form ---

export interface Form {
  id: string;
  name: string;
  description: string | null;
  status: FormStatus;
  version: number;
  settings: FormSettings;
  theme: FormTheme;
  fields: FormField[];
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface FormSummary {
  id: string;
  name: string;
  description: string | null;
  status: FormStatus;
  version: number;
  submissionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FormSettings {
  submitButtonText: string;
  successMessage: string;
  redirectUrl: string | null;
  showAnotherResponseLink: boolean;
  notificationEmails: string[];
  webhookUrl: string | null;
  webhookHeaders: Record<string, string>;
  closedMessage: string;
  submissionLimit: number | null;
}

export interface FormTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  logoUrl: string | null;
  backgroundImageUrl: string | null;
  borderRadius: 'sm' | 'md' | 'lg';
  preset: string | null;
}

// --- Fields ---

export interface FormField {
  id: string;
  type: FieldType;
  name: string;
  label: string;
  placeholder: string | null;
  helpText: string | null;
  fieldOrder: number;
  page: number;
  required: boolean;
  defaultValue: string | null;
  validationRules: ValidationRule[];
  options: FieldOption[] | null;
  config: Record<string, unknown>;
  visibilityRules: VisibilityRules | null;
}

export interface ValidationRule {
  type: 'minLength' | 'maxLength' | 'pattern' | 'min' | 'max' | 'fileTypes' | 'maxFileSize';
  value: string | number | string[];
  message: string;
}

export interface FieldOption {
  label: string;
  value: string;
  allowCustom?: boolean;
}

export interface VisibilityRules {
  operator: 'AND' | 'OR';
  conditions: VisibilityCondition[];
}

export interface VisibilityCondition {
  fieldName: string;
  op: 'equals' | 'not_equals' | 'contains' | 'is_empty' | 'is_not_empty' | 'greater_than' | 'less_than';
  value: string | number | null;
}
