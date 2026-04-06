import type { FormSettings, FormTheme, FieldType, ValidationRule, FieldOption, VisibilityRules } from './form';

// --- Pagination ---

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PageParams {
  page?: number;
  size?: number;
  sort?: string; // e.g. "createdAt,desc"
}

// --- Requests ---

export interface CreateFormRequest {
  name: string;
  description?: string;
}

export interface UpdateFormRequest {
  name: string;
  description?: string;
  settings?: FormSettings;
  theme?: FormTheme;
  fields?: FormFieldRequest[];
}

export interface FormFieldRequest {
  id?: string; // present for existing fields, absent for new
  type: FieldType;
  name: string;
  label: string;
  placeholder?: string;
  helpText?: string;
  fieldOrder: number;
  page?: number;
  required?: boolean;
  defaultValue?: string;
  validationRules?: ValidationRule[];
  options?: FieldOption[];
  config?: Record<string, unknown>;
  visibilityRules?: VisibilityRules;
}

export interface SubmitFormRequest {
  data: Record<string, unknown>;
}

// --- Error ---

export interface ApiError {
  status: number;
  error: string;
  message: string;
  details: FieldError[];
  timestamp: string;
  path: string;
}

export interface FieldError {
  field: string;
  message: string;
}

// --- Query params ---

export interface ListFormsParams extends PageParams {
  status?: string;
  search?: string;
}

export interface AnalyticsParams {
  from?: string;
  to?: string;
}
