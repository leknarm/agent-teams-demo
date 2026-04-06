'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DailyCount } from '@/types/submission';

interface SubmissionChartProps {
  data: DailyCount[];
}

export function SubmissionChart({ data }: SubmissionChartProps) {
  if (!data.length) return null;

  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Submissions Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-1 h-32">
          {data.map((day) => (
            <div
              key={day.date}
              className="flex-1 flex flex-col items-center gap-1"
              title={`${day.date}: ${day.count}`}
            >
              <div
                className="w-full bg-primary/70 rounded-t-sm min-h-[2px] transition-all"
                style={{ height: `${(day.count / max) * 100}%` }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>{data[0]?.date}</span>
          <span>{data[data.length - 1]?.date}</span>
        </div>
      </CardContent>
    </Card>
  );
}
