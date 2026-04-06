'use client';

import {
  Type,
  AlignLeft,
  Hash,
  Mail,
  Link,
  Phone,
  Calendar,
  Clock,
  CalendarDays,
  ChevronDown,
  CheckSquare,
  Circle,
  Upload,
  Star,
  BarChart,
  Heading,
  FileText,
  EyeOff,
} from 'lucide-react';
import type { FormField } from '@/types/form';

interface FieldType {
  type: FormField['type'];
  label: string;
  icon: React.ElementType;
}

const FIELD_CATEGORIES: { name: string; fields: FieldType[] }[] = [
  {
    name: 'Text Input',
    fields: [
      { type: 'TEXT', label: 'Short Text', icon: Type },
      { type: 'TEXTAREA', label: 'Long Text', icon: AlignLeft },
      { type: 'EMAIL', label: 'Email', icon: Mail },
      { type: 'URL', label: 'URL', icon: Link },
      { type: 'PHONE', label: 'Phone', icon: Phone },
      { type: 'NUMBER', label: 'Number', icon: Hash },
    ],
  },
  {
    name: 'Choice',
    fields: [
      { type: 'SELECT', label: 'Dropdown', icon: ChevronDown },
      { type: 'MULTI_SELECT', label: 'Multi-Select', icon: CheckSquare },
      { type: 'RADIO', label: 'Radio Group', icon: Circle },
      { type: 'CHECKBOX', label: 'Checkbox', icon: CheckSquare },
    ],
  },
  {
    name: 'Date & Time',
    fields: [
      { type: 'DATE', label: 'Date', icon: Calendar },
      { type: 'TIME', label: 'Time', icon: Clock },
      { type: 'DATETIME', label: 'Date & Time', icon: CalendarDays },
    ],
  },
  {
    name: 'Advanced',
    fields: [
      { type: 'FILE', label: 'File Upload', icon: Upload },
      { type: 'RATING', label: 'Star Rating', icon: Star },
      { type: 'SCALE', label: 'Scale', icon: BarChart },
    ],
  },
  {
    name: 'Layout',
    fields: [
      { type: 'SECTION', label: 'Section Break', icon: Heading },
      { type: 'CONTENT', label: 'Content Block', icon: FileText },
      { type: 'HIDDEN', label: 'Hidden Field', icon: EyeOff },
    ],
  },
];

interface FieldPaletteProps {
  onAddField: (type: FormField['type']) => void;
}

export function FieldPalette({ onAddField }: FieldPaletteProps) {
  return (
    <aside className="w-52 border-r bg-card overflow-y-auto shrink-0 shadow-sm">
      <div className="p-3 border-b bg-muted/30">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
          Add Fields
        </p>
      </div>
      <div className="p-2 space-y-1">
        {FIELD_CATEGORIES.map((category) => (
          <div key={category.name}>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1.5 mt-1">
              {category.name}
            </p>
            <div className="space-y-0.5">
              {category.fields.map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => onAddField(type)}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-150 text-left hover:bg-accent group"
                >
                  <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <span className="text-[13px] font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
