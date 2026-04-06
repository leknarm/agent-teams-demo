import { cn } from '@/lib/utils';
import type { FormStatus } from '@/types/form';

interface StatusBadgeProps {
  status: FormStatus;
  className?: string;
}

const statusConfig: Record<
  FormStatus,
  { label: string; className: string; dotColor: string }
> = {
  DRAFT: {
    label: 'Draft',
    className: 'bg-gray-100 text-gray-600 border-gray-200',
    dotColor: 'bg-gray-400',
  },
  PUBLISHED: {
    label: 'Published',
    className: 'bg-green-50 text-green-700 border-green-200',
    dotColor: 'bg-green-500',
  },
  CLOSED: {
    label: 'Closed',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
    dotColor: 'bg-amber-500',
  },
  ARCHIVED: {
    label: 'Archived',
    className: 'bg-purple-50 text-purple-700 border-purple-200',
    dotColor: 'bg-purple-400',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dotColor)} />
      {config.label}
    </span>
  );
}
