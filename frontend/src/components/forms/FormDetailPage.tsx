'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Edit,
  ExternalLink,
  Copy,
  Check,
  BarChart2,
  FileText,
  ArrowLeft,
  Globe,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { useForm, usePublishForm, useCloseForm } from '@/lib/hooks/useForms';
import { formatDateTime, cn } from '@/lib/utils';

interface FormDetailPageProps {
  formId: string;
}

export function FormDetailPage({ formId }: FormDetailPageProps) {
  const { data: form, isLoading, isError, refetch } = useForm(formId);
  const publishForm = usePublishForm();
  const closeForm = useCloseForm();
  const [copied, setCopied] = useState(false);

  if (isLoading) return <LoadingState layout="detail" />;
  if (isError || !form)
    return <ErrorState message="Form not found or failed to load." onRetry={() => refetch()} />;

  const publicUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/f/${form.id}` : `/f/${form.id}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublish = async () => {
    try {
      await publishForm.mutateAsync(formId);
      toast.success('Form published!');
    } catch {
      toast.error('Failed to publish form');
    }
  };

  const handleClose = async () => {
    try {
      await closeForm.mutateAsync(formId);
      toast.success('Form closed');
    } catch {
      toast.error('Failed to close form');
    }
  };

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <Button variant="ghost" size="sm" asChild className="-ml-2 h-8 text-muted-foreground">
        <Link href="/forms">
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
          All forms
        </Link>
      </Button>

      {/* Page header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">{form.name}</h1>
              <StatusBadge status={form.status} />
            </div>
            {form.description && (
              <p className="text-sm text-muted-foreground mt-1">{form.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-4">
          <Button variant="outline" size="sm" asChild className="gap-1.5">
            <Link href={`/forms/${formId}/submissions`}>
              <BarChart2 className="h-3.5 w-3.5" />
              Submissions
            </Link>
          </Button>
          <Button size="sm" asChild className="gap-1.5">
            <Link href={`/forms/${formId}/edit`}>
              <Edit className="h-3.5 w-3.5" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Form info card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Form Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Status">
              <StatusBadge status={form.status} />
            </InfoRow>
            <InfoRow label="Version">
              <span className="font-medium">v{form.version}</span>
            </InfoRow>
            <InfoRow label="Fields">
              <span className="font-medium">{form.fields.length} field{form.fields.length !== 1 ? 's' : ''}</span>
            </InfoRow>
            <InfoRow label="Created">
              <span className="text-muted-foreground text-xs">{formatDateTime(form.createdAt)}</span>
            </InfoRow>
            <InfoRow label="Updated">
              <span className="text-muted-foreground text-xs">{formatDateTime(form.updatedAt)}</span>
            </InfoRow>

            <Separator />

            {/* Action buttons */}
            <div className="pt-1 flex flex-wrap gap-2">
              {form.status === 'DRAFT' && (
                <Button
                  size="sm"
                  onClick={handlePublish}
                  disabled={publishForm.isPending || form.fields.length === 0}
                  className="gap-1.5"
                >
                  <Globe className="h-3.5 w-3.5" />
                  Publish Form
                </Button>
              )}
              {form.status === 'PUBLISHED' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleClose}
                  disabled={closeForm.isPending}
                  className="gap-1.5"
                >
                  <Lock className="h-3.5 w-3.5" />
                  Close Form
                </Button>
              )}
              {form.status === 'CLOSED' && (
                <Button
                  size="sm"
                  onClick={handlePublish}
                  disabled={publishForm.isPending}
                  className="gap-1.5"
                >
                  <Globe className="h-3.5 w-3.5" />
                  Re-publish
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Share card (published only) */}
        {form.status === 'PUBLISHED' && (
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Share
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Public link</p>
                <div className="flex gap-2">
                  <code className="flex-1 bg-muted rounded-lg px-3 py-2 text-xs truncate border border-border">
                    {publicUrl}
                  </code>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-9 w-9 shrink-0"
                    onClick={copyLink}
                    title={copied ? 'Copied!' : 'Copy link'}
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button size="icon" variant="outline" className="h-9 w-9 shrink-0" asChild>
                    <a href={publicUrl} target="_blank" rel="noreferrer" title="Open form">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Embed code</p>
                <code className="block bg-muted rounded-lg px-3 py-3 text-[11px] leading-relaxed border border-border break-all">
                  {`<iframe src="${publicUrl}" width="100%" height="600" frameborder="0"></iframe>`}
                </code>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fields preview card */}
        <Card className={cn('shadow-sm', form.status === 'PUBLISHED' ? 'lg:col-span-1' : 'lg:col-span-2')}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Fields Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {form.fields.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-8 w-8 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground mb-3">No fields added yet.</p>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/forms/${formId}/edit`}>Add fields</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                {form.fields.map((field, i) => (
                  <div
                    key={field.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-xs font-mono text-muted-foreground w-5 text-right shrink-0">
                      {i + 1}
                    </span>
                    <span className="font-medium text-sm flex-1 truncate">{field.label}</span>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md shrink-0">
                      {field.type.toLowerCase().replace('_', ' ')}
                    </span>
                    {field.required && (
                      <span className="text-[10px] text-red-500 font-medium shrink-0">req</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <div className="text-sm text-right">{children}</div>
    </div>
  );
}
