import { Metadata } from 'next';
import { FormsDashboard } from '@/components/forms/FormsDashboard';

export const metadata: Metadata = {
  title: 'Forms',
};

export default function FormsPage() {
  return <FormsDashboard />;
}
