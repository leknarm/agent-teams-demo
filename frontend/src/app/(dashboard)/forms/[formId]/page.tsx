import { Metadata } from 'next';
import { FormDetailPage } from '@/components/forms/FormDetailPage';

export const metadata: Metadata = {
  title: 'Form Detail',
};

export default function FormDetailRoute({ params }: { params: { formId: string } }) {
  return <FormDetailPage formId={params.formId} />;
}
