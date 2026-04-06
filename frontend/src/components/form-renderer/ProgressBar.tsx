import { cn } from '@/lib/utils';

interface ProgressBarProps {
  currentPage: number;
  totalPages: number;
  className?: string;
}

export function ProgressBar({ currentPage, totalPages, className }: ProgressBarProps) {
  const percent = ((currentPage + 1) / totalPages) * 100;

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Step {currentPage + 1} of {totalPages}</span>
        <span>{Math.round(percent)}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 rounded-full"
          style={{ width: `${percent}%` }}
          role="progressbar"
          aria-valuenow={currentPage + 1}
          aria-valuemin={1}
          aria-valuemax={totalPages}
        />
      </div>
    </div>
  );
}
