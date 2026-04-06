import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ElementType;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function StatCard({ title, value, description, icon: Icon, className }: StatCardProps) {
  return (
    <Card className={cn('shadow-sm hover:shadow-md transition-shadow', className)}>
      <CardContent className="pt-5 pb-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              {title}
            </p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1.5">{description}</p>
            )}
          </div>
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="h-5 w-5 text-primary" style={{ width: 20, height: 20 }} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
