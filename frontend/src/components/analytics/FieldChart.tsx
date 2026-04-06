'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { FieldAnalytics } from '@/types/submission';

interface FieldChartProps {
  analytics: FieldAnalytics;
}

export function FieldChart({ analytics }: FieldChartProps) {
  const entries = Object.entries(analytics.valueCounts).sort((a, b) => b[1] - a[1]);
  const total = analytics.responseCount || 1;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{analytics.fieldName}</CardTitle>
        <p className="text-xs text-muted-foreground">
          {analytics.responseCount} responses
          {analytics.average !== null && ` · Avg: ${analytics.average?.toFixed(1)}`}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {entries.slice(0, 8).map(([value, count]) => {
            const pct = Math.round((count / total) * 100);
            return (
              <div key={value} className="space-y-0.5">
                <div className="flex justify-between text-xs">
                  <span className="truncate max-w-[70%]">{value}</span>
                  <span className="text-muted-foreground">{count} ({pct}%)</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/60 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
