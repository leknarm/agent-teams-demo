'use client';

import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useSubmission } from '@/lib/hooks/useSubmissions';
import { formatDateTime } from '@/lib/utils';
import type { FormField } from '@/types/form';

interface SubmissionDetailSheetProps {
  submissionId: string | null;
  formFields: FormField[];
  allSubmissionIds: string[];
  onOpenChange: (open: boolean) => void;
  onNavigate: (id: string) => void;
}

export function SubmissionDetailSheet({
  submissionId,
  formFields,
  allSubmissionIds,
  onOpenChange,
  onNavigate,
}: SubmissionDetailSheetProps) {
  const { data: submission, isLoading } = useSubmission(submissionId ?? '');
  const currentIndex = allSubmissionIds.indexOf(submissionId ?? '');
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allSubmissionIds.length - 1;

  const displayFields = formFields.filter(
    (f) => !['SECTION', 'CONTENT', 'HIDDEN'].includes(f.type)
  );

  return (
    <Sheet open={!!submissionId} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-muted/30">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle className="text-base">Submission</SheetTitle>
              <div className="flex items-center gap-1">
                {currentIndex >= 0 && allSubmissionIds.length > 0 && (
                  <span className="text-xs text-muted-foreground mr-1.5">
                    {currentIndex + 1} of {allSubmissionIds.length}
                  </span>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  disabled={!hasPrev}
                  onClick={() => hasPrev && onNavigate(allSubmissionIds[currentIndex - 1])}
                  aria-label="Previous submission"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  disabled={!hasNext}
                  onClick={() => hasNext && onNavigate(allSubmissionIds[currentIndex + 1])}
                  aria-label="Next submission"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            {submission && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                <Clock className="h-3 w-3" />
                {formatDateTime(submission.submittedAt)}
              </div>
            )}
          </SheetHeader>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-5 w-full" />
              </div>
            ))}

          {!isLoading &&
            submission &&
            displayFields.map((field, i) => {
              const rawValue = submission.data[field.name];
              const displayValue = Array.isArray(rawValue)
                ? rawValue.join(', ')
                : rawValue !== undefined && rawValue !== null
                ? String(rawValue)
                : null;

              return (
                <div key={field.id}>
                  {i > 0 && <Separator className="mb-5" />}
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
                    {field.label}
                  </p>
                  {displayValue ? (
                    <p className="text-sm leading-relaxed break-words">{displayValue}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground/50 italic">No answer</p>
                  )}
                </div>
              );
            })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
