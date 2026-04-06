'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, MousePointer2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BuilderField } from './BuilderField';
import type { FormField } from '@/types/form';

interface BuilderCanvasProps {
  fields: FormField[];
  selectedFieldId: string | null;
  onSelectField: (id: string | null) => void;
  onDeleteField: (id: string) => void;
  onReorderFields: (fields: FormField[]) => void;
  onAddField: (type: FormField['type']) => void;
}

export function BuilderCanvas({
  fields,
  selectedFieldId,
  onSelectField,
  onDeleteField,
  onReorderFields,
  onAddField,
}: BuilderCanvasProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = fields.findIndex((f) => f.id === active.id);
    const newIndex = fields.findIndex((f) => f.id === over.id);
    const reordered = arrayMove(fields, oldIndex, newIndex).map((f, i) => ({
      ...f,
      fieldOrder: i,
    }));
    onReorderFields(reordered);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onSelectField(null);
    }
  };

  return (
    <div
      className="flex-1 overflow-y-auto bg-muted/40 p-6"
      onClick={handleCanvasClick}
    >
      <div
        className="max-w-2xl mx-auto bg-background rounded-xl border border-border shadow-sm min-h-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {fields.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-5">
              <MousePointer2 className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold mb-2 text-foreground">Start building your form</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              Click a field type from the left panel to add it here, or start with a simple text
              field.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAddField('TEXT')}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Text Field
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2.5">
                {fields.map((field) => (
                  <BuilderField
                    key={field.id}
                    field={field}
                    isSelected={selectedFieldId === field.id}
                    onSelect={() => onSelectField(field.id)}
                    onDelete={() => onDeleteField(field.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
