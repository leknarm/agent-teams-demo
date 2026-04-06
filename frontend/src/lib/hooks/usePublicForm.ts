'use client';

import { useQuery } from '@tanstack/react-query';
import { formsApi } from '@/lib/api/forms';

export const publicFormKeys = {
  all: ['public-forms'] as const,
  detail: (id: string) => [...publicFormKeys.all, id] as const,
};

export function usePublicForm(formId: string) {
  return useQuery({
    queryKey: publicFormKeys.detail(formId),
    queryFn: () => formsApi.get(formId),
    enabled: !!formId,
    retry: false, // Don't retry on 404/410
  });
}
