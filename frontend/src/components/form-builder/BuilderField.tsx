'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFieldComponent } from '@/components/form-renderer/fields';
import { cn } from '@/lib/utils';
import type { FormField } from '@/types/form';

interface BuilderFieldProps {
  field: FormField;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

export function BuilderField({ field, isSelected, onSelect, onDelete }: BuilderFieldProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const FieldComponent = getFieldComponent(field.type);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-xl border bg-background cursor-pointer transition-all duration-150',
        isSelected
          ? 'border-primary ring-2 ring-primary/20 shadow-sm'
          : 'border-border hover:border-primary/40 hover:shadow-sm',
        isDragging && 'opacity-50 shadow-xl rotate-1'
      )}
      onClick={onSelect}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-primary rounded-full" />
      )}

      <div className="flex items-start gap-2 p-4">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          onClick={(e) => e.stopPropagation()}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Field preview */}
        <div className="flex-1 pointer-events-none min-w-0">
          <FieldComponent
            field={field}
            value={field.defaultValue}
            onChange={() => {}}
            disabled
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            aria-label="Configure field"
          >
            <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleDelete}
            aria-label="Delete field"
          >
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      </div>
    </div>
  );
}
