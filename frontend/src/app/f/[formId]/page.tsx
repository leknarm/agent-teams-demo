import { Metadata } from 'next';
import { PublicFormPage } from '@/components/public/PublicFormPage';

export const metadata: Metadata = {
  title: 'Form',
};

export default function PublicFormRoute({ params }: { params: { formId: string } }) {
  return <PublicFormPage formId={params.formId} />;
}
