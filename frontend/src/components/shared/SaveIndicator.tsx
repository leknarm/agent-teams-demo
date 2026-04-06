import { Check, Loader2, AlertCircle, CloudOff } from 'lucide-react';
import { cn } from '@/lib/utils';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface SaveIndicatorProps {
  status: SaveStatus;
  className?: string;
}

export function SaveIndicator({ status, className }: SaveIndicatorProps) {
  if (status === 'idle') return null;

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-all duration-200',
        {
          'bg-muted text-muted-foreground': status === 'saving',
          'bg-green-100 text-green-700': status === 'saved',
          'bg-red-100 text-red-600': status === 'error',
        },
        className
      )}
    >
      {status === 'saving' && (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Saving</span>
        </>
      )}
      {status === 'saved' && (
        <>
          <Check className="h-3 w-3" />
          <span>Saved</span>
        </>
      )}
      {status === 'error' && (
        <>
          <CloudOff className="h-3 w-3" />
          <span>Save failed</span>
        </>
      )}
    </div>
  );
}
