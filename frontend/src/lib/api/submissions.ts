import { apiGet, apiPost, apiDelete, apiDownload } from './client';
import type { Submission, SubmissionSummary, FormAnalytics } from '@/types/submission';
import type { PageResponse, PageParams, SubmitFormRequest, AnalyticsParams } from '@/types/api';

export const submissionsApi = {
  list: (formId: string, params?: PageParams) =>
    apiGet<PageResponse<SubmissionSummary>>(
      `/api/v1/forms/${formId}/submissions`,
      params as Record<string, unknown>
    ),

  get: (id: string) => apiGet<Submission>(`/api/v1/submissions/${id}`),

  submit: (formId: string, data: SubmitFormRequest) =>
    apiPost<Submission>(`/api/v1/public/forms/${formId}/submissions`, data),

  delete: (id: string) => apiDelete<void>(`/api/v1/submissions/${id}`),

  bulkDelete: (formId: string, ids: string[]) =>
    apiDelete<void>(`/api/v1/forms/${formId}/submissions`, { ids }),

  exportCsv: (formId: string) =>
    apiDownload(`/api/v1/forms/${formId}/submissions/export`),

  analytics: (formId: string, params?: AnalyticsParams) =>
    apiGet<FormAnalytics>(`/api/v1/forms/${formId}/analytics`, params as Record<string, unknown>),
};
