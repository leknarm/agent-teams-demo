'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { submissionsApi } from '@/lib/api/submissions';
import type { SubmitFormRequest, PageParams, AnalyticsParams } from '@/types/api';

export const submissionKeys = {
  all: ['submissions'] as const,
  lists: () => [...submissionKeys.all, 'list'] as const,
  list: (formId: string, params?: PageParams) =>
    [...submissionKeys.lists(), formId, params] as const,
  details: () => [...submissionKeys.all, 'detail'] as const,
  detail: (id: string) => [...submissionKeys.details(), id] as const,
  analytics: (formId: string, params?: AnalyticsParams) =>
    [...submissionKeys.all, 'analytics', formId, params] as const,
};

export function useSubmissionsList(formId: string, params?: PageParams) {
  return useQuery({
    queryKey: submissionKeys.list(formId, params),
    queryFn: () => submissionsApi.list(formId, params),
    enabled: !!formId,
  });
}

export function useSubmission(id: string) {
  return useQuery({
    queryKey: submissionKeys.detail(id),
    queryFn: () => submissionsApi.get(id),
    enabled: !!id,
  });
}

export function useSubmitForm(formId: string) {
  return useMutation({
    mutationFn: (data: SubmitFormRequest) => submissionsApi.submit(formId, data),
  });
}

export function useDeleteSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => submissionsApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: submissionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: submissionKeys.lists() });
    },
  });
}

export function useBulkDeleteSubmissions(formId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => submissionsApi.bulkDelete(formId, ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: submissionKeys.list(formId) });
    },
  });
}

export function useExportCsv(formId: string) {
  return useMutation({
    mutationFn: () => submissionsApi.exportCsv(formId),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `form-${formId}-submissions.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });
}

export function useFormAnalytics(formId: string, params?: AnalyticsParams) {
  return useQuery({
    queryKey: submissionKeys.analytics(formId, params),
    queryFn: () => submissionsApi.analytics(formId, params),
    enabled: !!formId,
  });
}
