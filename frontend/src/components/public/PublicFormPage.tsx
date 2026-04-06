'use client';

import { useSearchParams } from 'next/navigation';
import { AlertCircle, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { FormRenderer } from '@/components/form-renderer/FormRenderer';
import { usePublicForm } from '@/lib/hooks/usePublicForm';
import { useSubmitForm } from '@/lib/hooks/useSubmissions';
import { ApiClientError } from '@/lib/api/client';
import { LoadingState } from '@/components/shared/LoadingState';

interface PublicFormPageProps {
  formId: string;
}

export function PublicFormPage({ formId }: PublicFormPageProps) {
  const searchParams = useSearchParams();
  const { data: form, isLoading, isError, error } = usePublicForm(formId);
  const submitForm = useSubmitForm(formId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 p-8">
        <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-100 shadow-lg p-8">
          <LoadingState layout="form" count={4} />
        </div>
      </div>
    );
  }

  if (isError) {
    const apiError = error instanceof ApiClientError ? error.apiError : null;

    if (apiError?.status === 410) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-orange-50/30 p-8">
          <div className="max-w-sm w-full bg-white rounded-2xl border border-gray-100 shadow-lg p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-5">
              <Lock className="h-6 w-6 text-orange-500" />
            </div>
            <h1 className="text-xl font-bold mb-2">Form Closed</h1>
            <p className="text-sm text-gray-500">
              This form is no longer accepting responses.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-red-50/20 p-8">
        <div className="max-w-sm w-full bg-white rounded-2xl border border-gray-100 shadow-lg p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <h1 className="text-xl font-bold mb-2">Form Not Found</h1>
          <p className="text-sm text-gray-500">
            This form does not exist or is not currently available.
          </p>
        </div>
      </div>
    );
  }

  if (!form) return null;

  // Build initial values from hidden fields + URL params
  const initialValues: Record<string, unknown> = {};
  form.fields
    .filter((f) => f.type === 'HIDDEN')
    .forEach((f) => {
      const urlValue = searchParams.get(f.name);
      initialValues[f.name] = urlValue ?? f.defaultValue ?? '';
    });

  const handleSubmit = async (data: Record<string, unknown>) => {
    try {
      await submitForm.mutateAsync({ data });
    } catch (err) {
      if (err instanceof ApiClientError && err.apiError.details.length > 0) {
        throw err;
      }
      toast.error('Submission failed. Please try again.');
      throw err;
    }
  };

  const bgColor = form.theme?.backgroundColor ?? '#f8fafc';
  const primaryColor = form.theme?.primaryColor ?? '#2563eb';

  return (
    <div
      className="min-h-screen py-12 px-4"
      style={{ backgroundColor: bgColor }}
    >
      <div className="max-w-xl mx-auto">
        {/* Logo */}
        {form.theme?.logoUrl && (
          <img src={form.theme.logoUrl} alt="Logo" className="h-12 mb-8 mx-auto object-contain" />
        )}

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xl overflow-hidden">
          {/* Header accent */}
          <div className="h-1.5 w-full" style={{ backgroundColor: primaryColor }} />

          {/* Form header */}
          <div className="px-8 pt-8 pb-6 border-b border-gray-100">
            <h1
              className="text-2xl font-bold tracking-tight"
              style={{ color: form.theme?.textColor ?? undefined }}
            >
              {form.name}
            </h1>
            {form.description && (
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">{form.description}</p>
            )}
          </div>

          {/* Form body */}
          <div className="px-8 py-8">
            <FormRenderer
              form={form}
              onSubmit={handleSubmit}
              initialValues={initialValues}
            />
          </div>
        </div>

        {/* Footer branding */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Powered by <span className="font-semibold text-gray-500">FormCraft</span>
        </p>
      </div>
    </div>
  );
}
