'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, FileText, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { FormCard } from './FormCard';
import { FormFilters } from './FormFilters';
import { CreateFormDialog } from './CreateFormDialog';
import { useFormsList, useDeleteForm, useDuplicateForm } from '@/lib/hooks/useForms';
import type { FormStatus } from '@/types/form';
import type { ListFormsParams } from '@/types/api';

export function FormsDashboard() {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [filters, setFilters] = useState<ListFormsParams>({
    page: 0,
    size: 20,
    sort: 'createdAt,desc',
  });

  const { data, isLoading, isError, refetch } = useFormsList(filters);
  const deleteForm = useDeleteForm();
  const duplicateForm = useDuplicateForm();

  const handleFilterChange = useCallback((updates: Partial<ListFormsParams>) => {
    setFilters((prev) => ({ ...prev, ...updates, page: 0 }));
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteForm.mutateAsync(id);
        toast.success('Form deleted');
      } catch {
        toast.error('Failed to delete form');
      }
    },
    [deleteForm]
  );

  const handleDuplicate = useCallback(
    async (id: string) => {
      try {
        const newForm = await duplicateForm.mutateAsync(id);
        toast.success('Form duplicated');
        router.push(`/forms/${newForm.id}/edit`);
      } catch {
        toast.error('Failed to duplicate form');
      }
    },
    [duplicateForm, router]
  );

  const handleCreated = useCallback(
    (formId: string) => {
      setCreateOpen(false);
      router.push(`/forms/${formId}/edit`);
    },
    [router]
  );

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Forms</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Build forms, collect responses, and analyze results.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="default" className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          New Form
        </Button>
      </div>

      {/* Filters */}
      <FormFilters filters={filters} onChange={handleFilterChange} />

      {/* States */}
      {isLoading && <LoadingState layout="cards" />}

      {isError && (
        <ErrorState
          message="Failed to load forms. Please try again."
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && data?.content.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-20 px-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Create your first form</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            Build beautiful forms to collect responses, run surveys, and gather data from your
            audience.
          </p>
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create a Form
          </Button>
        </div>
      )}

      {!isLoading && !isError && data && data.content.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.content.map((form) => (
            <FormCard
              key={form.id}
              form={form}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      )}

      <CreateFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleCreated}
      />
    </div>
  );
}
