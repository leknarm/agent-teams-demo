import { Metadata } from 'next';
import { SubmissionsPage } from '@/components/submissions/SubmissionsPage';

export const metadata: Metadata = {
  title: 'Submissions',
};

export default function SubmissionsRoute({ params }: { params: { formId: string } }) {
  return <SubmissionsPage formId={params.formId} />;
}
