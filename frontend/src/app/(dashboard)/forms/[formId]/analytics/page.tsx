import { Metadata } from 'next';
import { AnalyticsPage } from '@/components/analytics/AnalyticsPage';

export const metadata: Metadata = {
  title: 'Analytics',
};

export default function AnalyticsRoute({ params }: { params: { formId: string } }) {
  return <AnalyticsPage formId={params.formId} />;
}
