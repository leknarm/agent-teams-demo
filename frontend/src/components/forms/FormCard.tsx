'use client';

import Link from 'next/link';
import { MoreHorizontal, Edit, Copy, Trash2, BarChart2, ExternalLink, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { formatDate } from '@/lib/utils';
import type { FormSummary } from '@/types/form';
import { useState } from 'react';

interface FormCardProps {
  form: FormSummary;
  onDelete: (id: string) => Promise<void>;
  onDuplicate: (id: string) => Promise<void>;
}

export function FormCard({ form, onDelete, onDuplicate }: FormCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(form.id);
    setIsDeleting(false);
    setDeleteOpen(false);
  };

  return (
    <>
      <div className="group relative bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden">
        {/* Card color accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-primary/60 to-primary rounded-t-xl" />

        {/* Card header */}
        <div className="p-5 pb-3 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <FileText className="h-4.5 w-4.5 text-primary" style={{ width: 18, height: 18 }} />
          </div>
          <div className="flex-1 min-w-0">
            <Link
              href={`/forms/${form.id}`}
              className="font-semibold text-sm leading-snug hover:text-primary transition-colors line-clamp-2 block"
            >
              {form.name}
            </Link>
            {form.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{form.description}</p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity -mr-1"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem asChild>
                <Link href={`/forms/${form.id}/edit`} className="cursor-pointer">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit form
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(form.id)} className="cursor-pointer">
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/forms/${form.id}/submissions`} className="cursor-pointer">
                  <BarChart2 className="h-4 w-4 mr-2" />
                  View submissions
                </Link>
              </DropdownMenuItem>
              {form.status === 'PUBLISHED' && (
                <DropdownMenuItem asChild>
                  <a
                    href={`/f/${form.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="cursor-pointer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open public form
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive cursor-pointer"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status row */}
        <div className="px-5 py-2 flex items-center gap-2">
          <StatusBadge status={form.status} />
          <span className="text-xs text-muted-foreground">v{form.version}</span>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 mt-auto flex items-center justify-between border-t border-border bg-muted/30">
          <span className="text-xs text-muted-foreground font-medium">
            {form.submissionCount === 0
              ? 'No responses yet'
              : `${form.submissionCount} response${form.submissionCount !== 1 ? 's' : ''}`}
          </span>
          <span className="text-xs text-muted-foreground">{formatDate(form.updatedAt)}</span>
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Form"
        description={`Are you sure you want to delete "${form.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </>
  );
}
