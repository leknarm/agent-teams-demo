import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ThankYouPageProps {
  message?: string;
  showAnotherResponseLink?: boolean;
  onReset?: () => void;
}

export function ThankYouPage({
  message = 'Thank you for your submission!',
  showAnotherResponseLink = false,
  onReset,
}: ThankYouPageProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 space-y-5">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Submitted!</h2>
        <p className="text-muted-foreground max-w-sm leading-relaxed">{message}</p>
      </div>
      {showAnotherResponseLink && onReset && (
        <Button variant="outline" onClick={onReset} className="mt-2">
          Submit another response
        </Button>
      )}
    </div>
  );
}
