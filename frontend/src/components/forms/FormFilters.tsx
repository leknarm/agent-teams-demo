'use client';

import { useCallback, useRef } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { ListFormsParams } from '@/types/api';
import type { FormStatus } from '@/types/form';

const STATUS_TABS: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'CLOSED', label: 'Closed' },
];

interface FormFiltersProps {
  filters: ListFormsParams;
  onChange: (updates: Partial<ListFormsParams>) => void;
}

export function FormFilters({ filters, onChange }: FormFiltersProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onChange({ search: e.target.value || undefined });
      }, 300);
    },
    [onChange]
  );

  const handleStatusChange = useCallback(
    (value: string) => {
      onChange({ status: value === 'all' ? undefined : (value as FormStatus) });
    },
    [onChange]
  );

  const activeStatus = filters.status ?? 'all';

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      {/* Custom tab-style filter */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleStatusChange(tab.value)}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150',
              activeStatus === tab.value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative flex-1 max-w-xs ml-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search forms..."
          className="pl-9 h-9 text-sm bg-background"
          defaultValue={filters.search ?? ''}
          onChange={handleSearch}
        />
      </div>
    </div>
  );
}
