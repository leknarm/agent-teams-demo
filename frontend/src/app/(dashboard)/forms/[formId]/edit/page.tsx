import { Metadata } from 'next';
import { FormBuilderPage } from '@/components/form-builder/FormBuilderPage';

export const metadata: Metadata = {
  title: 'Edit Form',
};

export default function EditFormRoute({ params }: { params: { formId: string } }) {
  return <FormBuilderPage formId={params.formId} />;
}
