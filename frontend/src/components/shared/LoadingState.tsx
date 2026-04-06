import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type LayoutType = 'cards' | 'table' | 'form' | 'detail';

interface LoadingStateProps {
  layout?: LayoutType;
  count?: number;
  className?: string;
}

export function LoadingState({ layout = 'cards', count = 6, className }: LoadingStateProps) {
  if (layout === 'cards') {
    return (
      <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded-lg border p-6 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (layout === 'table') {
    return (
      <div className={cn('space-y-2', className)}>
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (layout === 'form') {
    return (
      <div className={cn('space-y-6', className)}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  // detail layout
  return (
    <div className={cn('space-y-4', className)}>
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
