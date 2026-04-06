'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { formsApi } from '@/lib/api/forms';
import type { Form } from '@/types/form';
import type {
  CreateFormRequest,
  UpdateFormRequest,
  ListFormsParams,
} from '@/types/api';

export const formKeys = {
  all: ['forms'] as const,
  lists: () => [...formKeys.all, 'list'] as const,
  list: (params?: ListFormsParams) => [...formKeys.lists(), params] as const,
  details: () => [...formKeys.all, 'detail'] as const,
  detail: (id: string) => [...formKeys.details(), id] as const,
};

export function useFormsList(params?: ListFormsParams) {
  return useQuery({
    queryKey: formKeys.list(params),
    queryFn: () => formsApi.list(params),
  });
}

export function useForm(
  id: string,
  options?: Omit<UseQueryOptions<Form>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: formKeys.detail(id),
    queryFn: () => formsApi.get(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreateForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateFormRequest) => formsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: formKeys.lists() });
    },
  });
}

export function useUpdateForm(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateFormRequest) => formsApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData(formKeys.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: formKeys.lists() });
    },
  });
}

export function useDeleteForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => formsApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: formKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: formKeys.lists() });
    },
  });
}

export function usePublishForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => formsApi.publish(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(formKeys.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: formKeys.lists() });
    },
  });
}

export function useCloseForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => formsApi.close(id),
    onSuccess: (updated) => {
      queryClient.setQueryData(formKeys.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: formKeys.lists() });
    },
  });
}

export function useDuplicateForm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => formsApi.duplicate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: formKeys.lists() });
    },
  });
}
