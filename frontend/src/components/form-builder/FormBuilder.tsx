'use client';

import { useState } from 'react';
import { BuilderToolbar } from './BuilderToolbar';
import { FieldPalette } from './FieldPalette';
import { BuilderCanvas } from './BuilderCanvas';
import { FieldConfigurator } from './FieldConfigurator';
import { FormRenderer } from '@/components/form-renderer/FormRenderer';
import type { Form, FormField } from '@/types/form';
import type { SaveStatus } from './FormBuilderPage';

interface FormBuilderProps {
  form: Form;
  selectedFieldId: string | null;
  saveStatus: SaveStatus;
  onNameChange: (name: string) => void;
  onAddField: (type: FormField['type']) => void;
  onUpdateField: (field: FormField) => void;
  onDeleteField: (fieldId: string) => void;
  onReorderFields: (fields: FormField[]) => void;
  onSelectField: (fieldId: string | null) => void;
}

export function FormBuilder({
  form,
  selectedFieldId,
  saveStatus,
  onNameChange,
  onAddField,
  onUpdateField,
  onDeleteField,
  onReorderFields,
  onSelectField,
}: FormBuilderProps) {
  const [isPreview, setIsPreview] = useState(false);
  const [previewWidth, setPreviewWidth] = useState<'mobile' | 'desktop'>('desktop');

  const selectedField = form.fields.find((f) => f.id === selectedFieldId) ?? null;

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)] -mt-8 -mx-8">
      <BuilderToolbar
        formName={form.name}
        saveStatus={saveStatus}
        isPreview={isPreview}
        previewWidth={previewWidth}
        onNameChange={onNameChange}
        onTogglePreview={() => setIsPreview((p) => !p)}
        onPreviewWidthChange={setPreviewWidth}
        formId={form.id}
        formStatus={form.status}
      />

      {isPreview ? (
        <div className="flex-1 overflow-y-auto bg-muted/40 flex justify-center py-10 px-4">
          <div
            className="bg-background rounded-2xl shadow-md border border-border p-8 transition-all duration-300"
            style={{
              width: previewWidth === 'mobile' ? '390px' : '100%',
              maxWidth: previewWidth === 'desktop' ? '720px' : '390px',
            }}
          >
            <h1 className="text-xl font-bold mb-1">{form.name}</h1>
            {form.description && (
              <p className="text-sm text-muted-foreground mb-6">{form.description}</p>
            )}
            <FormRenderer form={form} previewMode />
          </div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <FieldPalette onAddField={onAddField} />
          <BuilderCanvas
            fields={form.fields}
            selectedFieldId={selectedFieldId}
            onSelectField={onSelectField}
            onDeleteField={onDeleteField}
            onReorderFields={onReorderFields}
            onAddField={onAddField}
          />
          <FieldConfigurator
            field={selectedField}
            allFields={form.fields}
            onUpdateField={onUpdateField}
            onClose={() => onSelectField(null)}
          />
        </div>
      )}
    </div>
  );
}
