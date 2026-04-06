'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BarChart2, TrendingUp, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { StatCard } from './StatCard';
import { SubmissionChart } from './SubmissionChart';
import { FieldChart } from './FieldChart';
import { useFormAnalytics } from '@/lib/hooks/useSubmissions';
import { useForm } from '@/lib/hooks/useForms';
import { format, subDays } from 'date-fns';

interface AnalyticsPageProps {
  formId: string;
}

type DateRange = '7' | '30' | '90';

export function AnalyticsPage({ formId }: AnalyticsPageProps) {
  const [dateRange, setDateRange] = useState<DateRange>('30');
  const { data: form } = useForm(formId);

  const from = format(subDays(new Date(), parseInt(dateRange)), 'yyyy-MM-dd');
  const to = format(new Date(), 'yyyy-MM-dd');

  const { data: analytics, isLoading, isError, refetch } = useFormAnalytics(formId, { from, to });

  const analyticsFields = Object.values(analytics?.fieldAnalytics ?? {});
  const avgPerDay = analytics?.submissionsOverTime.length
    ? (analytics.totalSubmissions / analytics.submissionsOverTime.length).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <Button variant="ghost" size="sm" asChild className="-ml-2 h-8 text-muted-foreground">
        <Link href={`/forms/${formId}`}>
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
          Back to form
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {form ? form.name : 'Analytics'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Submission metrics and field analysis
          </p>
        </div>
        <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
          <SelectTrigger className="w-40 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && <LoadingState layout="cards" count={4} />}
      {isError && <ErrorState message="Failed to load analytics." onRetry={() => refetch()} />}

      {!isLoading && !isError && analytics && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Submissions"
              value={analytics.totalSubmissions}
              icon={Inbox}
            />
            <StatCard
              title="Avg Per Day"
              value={avgPerDay}
              icon={TrendingUp}
              description={`Over last ${dateRange} days`}
            />
          </div>

          {analytics.totalSubmissions === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-5">
                <BarChart2 className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-base font-semibold mb-2">No data yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Analytics will appear here once people submit your form.
              </p>
            </div>
          ) : (
            <>
              <SubmissionChart data={analytics.submissionsOverTime} />

              {analyticsFields.length > 0 && (
                <div>
                  <h2 className="text-base font-semibold mb-4">Field Analysis</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {analyticsFields.map((fa) => (
                      <FieldChart key={fa.fieldName} analytics={fa} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
