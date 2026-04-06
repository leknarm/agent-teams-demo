import { apiGet, apiPost, apiPut, apiDelete, apiDownload } from './client';
import type { Form, FormSummary } from '@/types/form';
import type {
  PageResponse,
  CreateFormRequest,
  UpdateFormRequest,
  ListFormsParams,
} from '@/types/api';

export const formsApi = {
  list: (params?: ListFormsParams) =>
    apiGet<PageResponse<FormSummary>>('/api/v1/forms', params as Record<string, unknown>),

  get: (id: string) => apiGet<Form>(`/api/v1/forms/${id}`),

  create: (data: CreateFormRequest) =>
    apiPost<Form>('/api/v1/forms', {
      ...data,
      fields: [{ type: 'TEXT', label: 'Untitled Field', name: 'untitled_field', fieldOrder: 0, required: false }],
    }),

  update: (id: string, data: UpdateFormRequest) => apiPut<Form>(`/api/v1/forms/${id}`, data),

  delete: (id: string) => apiDelete<void>(`/api/v1/forms/${id}`),

  publish: (id: string) => apiPost<Form>(`/api/v1/forms/${id}/publish`),

  close: (id: string) => apiPost<Form>(`/api/v1/forms/${id}/close`),

  duplicate: (id: string) => apiPost<Form>(`/api/v1/forms/${id}/duplicate`),

  getPublic: (id: string) => apiGet<Form>(`/api/v1/public/forms/${id}`),

  exportSubmissions: (id: string) => apiDownload(`/api/v1/forms/${id}/submissions/export`),
};
