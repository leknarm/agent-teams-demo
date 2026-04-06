'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, Trash2, ArrowLeft, Inbox, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { SubmissionDetailSheet } from './SubmissionDetailSheet';
import {
  useSubmissionsList,
  useBulkDeleteSubmissions,
  useExportCsv,
} from '@/lib/hooks/useSubmissions';
import { useForm } from '@/lib/hooks/useForms';
import { formatDateTime, truncate } from '@/lib/utils';
import type { PageParams } from '@/types/api';

interface SubmissionsPageProps {
  formId: string;
}

export function SubmissionsPage({ formId }: SubmissionsPageProps) {
  const [params, setParams] = useState<PageParams>({ page: 0, size: 20, sort: 'submittedAt,desc' });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openSubmissionId, setOpenSubmissionId] = useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const { data: form } = useForm(formId);
  const { data, isLoading, isError, refetch } = useSubmissionsList(formId, params);
  const bulkDelete = useBulkDeleteSubmissions(formId);
  const exportCsv = useExportCsv(formId);

  const displayFields =
    form?.fields.filter((f) => !['SECTION', 'CONTENT', 'HIDDEN'].includes(f.type)).slice(0, 5) ??
    [];

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === data?.content.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data?.content.map((s) => s.id) ?? []));
    }
  };

  const handleBulkDelete = async () => {
    try {
      await bulkDelete.mutateAsync(Array.from(selectedIds));
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
      toast.success('Submissions deleted');
    } catch {
      toast.error('Failed to delete submissions');
    }
  };

  const handleExport = async () => {
    try {
      await exportCsv.mutateAsync();
    } catch {
      toast.error('Failed to export CSV');
    }
  };

  const submissions = data?.content ?? [];
  const pagination = data
    ? { number: data.page, size: data.size, totalElements: data.totalElements, totalPages: data.totalPages }
    : undefined;
  const isAllSelected = submissions.length > 0 && selectedIds.size === submissions.length;

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <Button variant="ghost" size="sm" asChild className="-ml-2 h-8 text-muted-foreground">
        <Link href={`/forms/${formId}`}>
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
          Back to form
        </Link>
      </Button>

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {form ? form.name : 'Submissions'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {pagination
              ? `${pagination.totalElements} total response${pagination.totalElements !== 1 ? 's' : ''}`
              : 'Manage and review form submissions'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteOpen(true)}
              className="gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete ({selectedIds.size})
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exportCsv.isPending}
            className="gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading && <LoadingState layout="table" />}
      {isError && (
        <ErrorState message="Failed to load submissions." onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && submissions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-5">
            <Inbox className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold mb-2">No submissions yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Responses will appear here once people fill out your form.
          </p>
          {form?.status === 'DRAFT' && (
            <p className="text-xs text-amber-600 mt-3 font-medium">
              Publish your form to start receiving submissions.
            </p>
          )}
        </div>
      )}

      {!isLoading && !isError && submissions.length > 0 && (
        <>
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="h-11 px-4 text-left w-10">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={toggleSelectAll}
                        aria-label="Select all"
                      />
                    </th>
                    <th className="h-11 px-4 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider whitespace-nowrap">
                      Submitted At
                    </th>
                    {displayFields.map((f) => (
                      <th
                        key={f.id}
                        className="h-11 px-4 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider"
                      >
                        {f.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {submissions.map((sub, idx) => (
                    <tr
                      key={sub.id}
                      className="hover:bg-muted/30 cursor-pointer transition-colors duration-100"
                      onClick={() => setOpenSubmissionId(sub.id)}
                      style={{
                        backgroundColor: idx % 2 === 0 ? undefined : 'hsl(var(--muted) / 0.15)',
                      }}
                    >
                      <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(sub.id)}
                          onCheckedChange={() => toggleSelect(sub.id)}
                          aria-label={`Select submission ${sub.id}`}
                        />
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-sm text-muted-foreground">
                        {formatDateTime(sub.submittedAt)}
                      </td>
                      {displayFields.map((f) => (
                        <td key={f.id} className="px-4 py-3.5 max-w-xs">
                          <span
                            className="truncate block text-sm"
                            title={String(sub.data[f.name] ?? '')}
                          >
                            {truncate(String(sub.data[f.name] ?? ''), 50) || (
                              <span className="text-muted-foreground/50 italic text-xs">—</span>
                            )}
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Page {pagination.number + 1} of {pagination.totalPages} —{' '}
                <span className="font-medium">{pagination.totalElements} total</span>
              </p>
              <div className="flex gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.number === 0}
                  onClick={() => setParams((p) => ({ ...p, page: (p.page ?? 0) - 1 }))}
                  className="gap-1 h-8"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.number + 1 >= pagination.totalPages}
                  onClick={() => setParams((p) => ({ ...p, page: (p.page ?? 0) + 1 }))}
                  className="gap-1 h-8"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <SubmissionDetailSheet
        submissionId={openSubmissionId}
        formFields={form?.fields ?? []}
        allSubmissionIds={submissions.map((s) => s.id)}
        onOpenChange={(open) => !open && setOpenSubmissionId(null)}
        onNavigate={setOpenSubmissionId}
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title="Delete Submissions"
        description={`Are you sure you want to delete ${selectedIds.size} submission(s)? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleBulkDelete}
        isLoading={bulkDelete.isPending}
      />
    </div>
  );
}
