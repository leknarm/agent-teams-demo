'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Monitor, Smartphone, Globe, Pencil, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SaveIndicator } from '@/components/shared/SaveIndicator';
import { usePublishForm } from '@/lib/hooks/useForms';
import { cn } from '@/lib/utils';
import type { FormStatus } from '@/types/form';
import type { SaveStatus } from './FormBuilderPage';

interface BuilderToolbarProps {
  formId: string;
  formName: string;
  formStatus: FormStatus;
  saveStatus: SaveStatus;
  isPreview: boolean;
  previewWidth: 'mobile' | 'desktop';
  onNameChange: (name: string) => void;
  onTogglePreview: () => void;
  onPreviewWidthChange: (w: 'mobile' | 'desktop') => void;
}

export function BuilderToolbar({
  formId,
  formName,
  formStatus,
  saveStatus,
  isPreview,
  previewWidth,
  onNameChange,
  onTogglePreview,
  onPreviewWidthChange,
}: BuilderToolbarProps) {
  const [editing, setEditing] = useState(false);
  const [localName, setLocalName] = useState(formName);
  const publishForm = usePublishForm();

  const handleNameBlur = () => {
    setEditing(false);
    if (localName.trim() && localName !== formName) {
      onNameChange(localName.trim());
    }
  };

  const handlePublish = async () => {
    try {
      await publishForm.mutateAsync(formId);
      toast.success('Form published!');
    } catch {
      toast.error('Failed to publish form. Make sure the form has at least one field.');
    }
  };

  return (
    <div className="h-14 border-b bg-card flex items-center px-4 gap-3 shrink-0 shadow-sm">
      {/* Back button */}
      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" asChild>
        <Link href={`/forms/${formId}`}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back to form</span>
        </Link>
      </Button>

      <div className="w-px h-5 bg-border" />

      {/* Form name editor */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex items-center gap-2">
            <Input
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameBlur();
                if (e.key === 'Escape') {
                  setLocalName(formName);
                  setEditing(false);
                }
              }}
              className="h-8 max-w-xs text-sm font-medium"
              autoFocus
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={handleNameBlur}
            >
              <Check className="h-3.5 w-3.5 text-green-600" />
            </Button>
          </div>
        ) : (
          <button
            onClick={() => {
              setLocalName(formName);
              setEditing(true);
            }}
            className="flex items-center gap-1.5 group max-w-xs"
            title="Click to rename"
          >
            <span className="text-sm font-semibold truncate">{formName}</span>
            <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </button>
        )}
      </div>

      {/* Save indicator */}
      <SaveIndicator status={saveStatus} />

      {/* Preview width toggle (visible only in preview mode) */}
      {isPreview && (
        <div className="flex border border-border rounded-lg overflow-hidden bg-muted/40">
          <button
            onClick={() => onPreviewWidthChange('desktop')}
            className={cn(
              'p-2 transition-colors',
              previewWidth === 'desktop'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
            aria-label="Desktop preview"
          >
            <Monitor className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onPreviewWidthChange('mobile')}
            className={cn(
              'p-2 transition-colors',
              previewWidth === 'mobile'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
            aria-label="Mobile preview"
          >
            <Smartphone className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Preview toggle */}
      <Button
        variant={isPreview ? 'default' : 'outline'}
        size="sm"
        onClick={onTogglePreview}
        className="gap-1.5 h-8"
      >
        {isPreview ? (
          <>
            <EyeOff className="h-3.5 w-3.5" />
            Edit
          </>
        ) : (
          <>
            <Eye className="h-3.5 w-3.5" />
            Preview
          </>
        )}
      </Button>

      {/* Publish button */}
      {formStatus === 'DRAFT' && (
        <Button
          size="sm"
          onClick={handlePublish}
          disabled={publishForm.isPending}
          className="gap-1.5 h-8 bg-green-600 hover:bg-green-700 text-white"
        >
          <Globe className="h-3.5 w-3.5" />
          Publish
        </Button>
      )}

      {formStatus === 'PUBLISHED' && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Live
        </div>
      )}
    </div>
  );
}
