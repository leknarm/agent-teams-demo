'use client';

import { X, Plus, Trash2, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { generateFieldName } from '@/lib/utils';
import type { FormField, FieldOption } from '@/types/form';

interface FieldConfiguratorProps {
  field: FormField | null;
  allFields: FormField[];
  onUpdateField: (field: FormField) => void;
  onClose: () => void;
}

export function FieldConfigurator({ field, allFields, onUpdateField, onClose }: FieldConfiguratorProps) {
  if (!field) {
    return (
      <aside className="w-72 border-l bg-card flex flex-col items-center justify-center shrink-0">
        <div className="text-center px-6 py-8">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Settings2 className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Select a field</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Click any field in the canvas to configure it
          </p>
        </div>
      </aside>
    );
  }

  const handleChange = (updates: Partial<FormField>) => {
    const updated = { ...field, ...updates };
    if (updates.label !== undefined) {
      const existingNames = allFields.filter((f) => f.id !== field.id).map((f) => f.name);
      const autoName = generateFieldName(updates.label, existingNames);
      updated.name = autoName;
    }
    onUpdateField(updated);
  };

  const hasOptions = ['SELECT', 'MULTI_SELECT', 'RADIO'].includes(field.type);

  const addOption = () => {
    const opts = field.options ?? [];
    const newOpt: FieldOption = {
      label: `Option ${opts.length + 1}`,
      value: `option_${opts.length + 1}`,
    };
    handleChange({ options: [...opts, newOpt] });
  };

  const updateOption = (index: number, updates: Partial<FieldOption>) => {
    const opts = [...(field.options ?? [])];
    const merged = { ...opts[index], ...updates };
    if (updates.label !== undefined && updates.value === undefined) {
      merged.value =
        updates.label
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_|_$/g, '') || `option_${index + 1}`;
    }
    opts[index] = merged;
    handleChange({ options: opts });
  };

  const deleteOption = (index: number) => {
    const opts = (field.options ?? []).filter((_, i) => i !== index);
    handleChange({ options: opts });
  };

  const fieldTypeLabel = field.type
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');

  return (
    <aside className="w-72 border-l bg-card overflow-y-auto shrink-0 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div>
          <p className="text-sm font-semibold">Field Settings</p>
          <p className="text-xs text-muted-foreground">{fieldTypeLabel}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <Tabs defaultValue="general">
          <TabsList className="w-full h-8">
            <TabsTrigger value="general" className="flex-1 text-xs h-7">General</TabsTrigger>
            <TabsTrigger value="validation" className="flex-1 text-xs h-7">Validation</TabsTrigger>
            {hasOptions && (
              <TabsTrigger value="options" className="flex-1 text-xs h-7">Options</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            {/* Label */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Label</Label>
              <Input
                value={field.label}
                onChange={(e) => handleChange({ label: e.target.value })}
                className="h-8 text-sm"
                placeholder="Field label"
              />
            </div>

            {/* Field Name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Field Name</Label>
              <Input
                value={field.name}
                onChange={(e) => handleChange({ name: e.target.value })}
                className="h-8 text-sm font-mono text-xs"
                placeholder="field_name"
              />
              <p className="text-[11px] text-muted-foreground">
                Used as the key in submission data
              </p>
            </div>

            {/* Placeholder */}
            {!['SECTION', 'CONTENT', 'HIDDEN', 'CHECKBOX', 'RADIO', 'RATING', 'SCALE'].includes(
              field.type
            ) && (
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Placeholder</Label>
                <Input
                  value={field.placeholder ?? ''}
                  onChange={(e) => handleChange({ placeholder: e.target.value || null })}
                  className="h-8 text-sm"
                  placeholder="Optional placeholder..."
                />
              </div>
            )}

            {/* Help Text */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Help Text</Label>
              <Textarea
                value={field.helpText ?? ''}
                onChange={(e) => handleChange({ helpText: e.target.value || null })}
                rows={2}
                className="text-sm resize-none"
                placeholder="Optional helper text..."
              />
            </div>

            <Separator />

            {/* Required toggle */}
            <div className="flex items-center justify-between py-0.5">
              <div>
                <p className="text-xs font-medium">Required</p>
                <p className="text-[11px] text-muted-foreground">Must be filled out</p>
              </div>
              <Switch
                checked={field.required}
                onCheckedChange={(checked) => handleChange({ required: checked })}
              />
            </div>
          </TabsContent>

          <TabsContent value="validation" className="space-y-4 mt-4">
            {['TEXT', 'EMAIL', 'URL', 'PHONE', 'TEXTAREA'].includes(field.type) && (
              <>
                <ValidationRuleInput
                  label="Min Length"
                  description="Minimum number of characters"
                  type="minLength"
                  field={field}
                  onUpdate={handleChange}
                />
                <ValidationRuleInput
                  label="Max Length"
                  description="Maximum number of characters"
                  type="maxLength"
                  field={field}
                  onUpdate={handleChange}
                />
              </>
            )}
            {field.type === 'NUMBER' && (
              <>
                <ValidationRuleInput
                  label="Min Value"
                  description="Minimum allowed value"
                  type="min"
                  field={field}
                  onUpdate={handleChange}
                />
                <ValidationRuleInput
                  label="Max Value"
                  description="Maximum allowed value"
                  type="max"
                  field={field}
                  onUpdate={handleChange}
                />
              </>
            )}
            {!['TEXT', 'EMAIL', 'URL', 'PHONE', 'TEXTAREA', 'NUMBER'].includes(field.type) && (
              <div className="text-center py-8">
                <p className="text-xs text-muted-foreground">
                  No validation rules available for this field type.
                </p>
              </div>
            )}
          </TabsContent>

          {hasOptions && (
            <TabsContent value="options" className="space-y-3 mt-4">
              <div className="space-y-2">
                {(field.options ?? []).map((opt, i) => (
                  <div key={i} className="flex gap-1.5 items-center">
                    <Input
                      value={opt.label}
                      onChange={(e) => updateOption(i, { label: e.target.value })}
                      placeholder={`Option ${i + 1}`}
                      className="h-8 text-sm flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteOption(i)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs gap-1.5"
                onClick={addOption}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Option
              </Button>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </aside>
  );
}

interface ValidationRuleInputProps {
  label: string;
  description?: string;
  type: string;
  field: FormField;
  onUpdate: (updates: Partial<FormField>) => void;
}

function ValidationRuleInput({ label, description, type, field, onUpdate }: ValidationRuleInputProps) {
  const existing = field.validationRules?.find((r) => r.type === type);

  const handleChange = (value: string) => {
    const filtered = (field.validationRules ?? []).filter((r) => r.type !== type);
    if (value) {
      filtered.push({
        type: type as never,
        value: Number(value),
        message: `${label} requirement not met`,
      });
    }
    onUpdate({ validationRules: filtered });
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {description && <p className="text-[11px] text-muted-foreground">{description}</p>}
      <Input
        type="number"
        value={existing ? String(existing.value) : ''}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Not set"
        className="h-8 text-sm"
      />
    </div>
  );
}
