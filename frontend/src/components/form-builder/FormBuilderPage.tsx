'use client';

import { useReducer, useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useForm, useUpdateForm } from '@/lib/hooks/useForms';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { FormBuilder } from './FormBuilder';
import type { Form, FormField } from '@/types/form';
import type { UpdateFormRequest } from '@/types/api';
import { generateFieldName } from '@/lib/utils';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

type BuilderAction =
  | { type: 'SET_FORM'; form: Form }
  | { type: 'SET_NAME'; name: string }
  | { type: 'ADD_FIELD'; field: FormField }
  | { type: 'UPDATE_FIELD'; field: FormField }
  | { type: 'DELETE_FIELD'; fieldId: string }
  | { type: 'REORDER_FIELDS'; fields: FormField[] }
  | { type: 'SELECT_FIELD'; fieldId: string | null };

interface BuilderState {
  form: Form | null;
  selectedFieldId: string | null;
  isDirty: boolean;
}

function builderReducer(state: BuilderState, action: BuilderAction): BuilderState {
  switch (action.type) {
    case 'SET_FORM':
      return { ...state, form: action.form, isDirty: false };

    case 'SET_NAME':
      if (!state.form) return state;
      return { ...state, form: { ...state.form, name: action.name }, isDirty: true };

    case 'ADD_FIELD':
      if (!state.form) return state;
      return {
        ...state,
        form: { ...state.form, fields: [...state.form.fields, action.field] },
        selectedFieldId: action.field.id,
        isDirty: true,
      };

    case 'UPDATE_FIELD':
      if (!state.form) return state;
      return {
        ...state,
        form: {
          ...state.form,
          fields: state.form.fields.map((f) => (f.id === action.field.id ? action.field : f)),
        },
        isDirty: true,
      };

    case 'DELETE_FIELD':
      if (!state.form) return state;
      return {
        ...state,
        form: {
          ...state.form,
          fields: state.form.fields
            .filter((f) => f.id !== action.fieldId)
            .map((f, i) => ({ ...f, fieldOrder: i })),
        },
        selectedFieldId: state.selectedFieldId === action.fieldId ? null : state.selectedFieldId,
        isDirty: true,
      };

    case 'REORDER_FIELDS':
      if (!state.form) return state;
      return {
        ...state,
        form: { ...state.form, fields: action.fields },
        isDirty: true,
      };

    case 'SELECT_FIELD':
      return { ...state, selectedFieldId: action.fieldId };

    default:
      return state;
  }
}

/** Generate a UUID-like ID without external dependency */
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface FormBuilderPageProps {
  formId: string;
}

export function FormBuilderPage({ formId }: FormBuilderPageProps) {
  const { data: form, isLoading, isError, refetch } = useForm(formId);
  const updateForm = useUpdateForm(formId);
  const [state, dispatch] = useReducer(builderReducer, {
    form: null,
    selectedFieldId: null,
    isDirty: false,
  });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (form && !state.form) {
      dispatch({ type: 'SET_FORM', form });
    }
  }, [form, state.form]);

  // Auto-save on dirty changes
  useEffect(() => {
    if (!state.isDirty || !state.form) return;

    clearTimeout(autoSaveTimerRef.current);

    const currentForm = state.form;
    autoSaveTimerRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        const req = buildUpdateRequest(currentForm);
        // Use the server response so that server-assigned field IDs replace
        // the client-generated UUIDs, preventing field duplication on every
        // subsequent save (BUG-009 / BUG-008).
        const savedForm = await updateForm.mutateAsync(req);
        setSaveStatus('saved');
        dispatch({ type: 'SET_FORM', form: savedForm });
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('error');
        toast.error('Failed to save changes');
      }
    }, 2000);

    return () => clearTimeout(autoSaveTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isDirty, state.form, updateForm.mutateAsync]);

  // Warn on unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (state.isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [state.isDirty]);

  if (isLoading || !state.form) return <LoadingState layout="detail" />;
  if (isError) return <ErrorState message="Failed to load form." onRetry={() => refetch()} />;

  const handleAddField = (type: FormField['type']) => {
    const existingNames = state.form!.fields.map((f) => f.name);
    const newField: FormField = {
      id: generateId(),
      type,
      name: generateFieldName(type.toLowerCase(), existingNames),
      label: formatFieldTypeLabel(type),
      placeholder: null,
      helpText: null,
      fieldOrder: state.form!.fields.length,
      page: 0,
      required: false,
      defaultValue: null,
      validationRules: [],
      options: needsOptions(type) ? [{ label: 'Option 1', value: 'option_1' }] : null,
      config: {},
      visibilityRules: null,
    };
    dispatch({ type: 'ADD_FIELD', field: newField });
  };

  return (
    <FormBuilder
      form={state.form}
      selectedFieldId={state.selectedFieldId}
      saveStatus={saveStatus}
      onNameChange={(name) => dispatch({ type: 'SET_NAME', name })}
      onAddField={handleAddField}
      onUpdateField={(field) => dispatch({ type: 'UPDATE_FIELD', field })}
      onDeleteField={(fieldId) => dispatch({ type: 'DELETE_FIELD', fieldId })}
      onReorderFields={(fields) => dispatch({ type: 'REORDER_FIELDS', fields })}
      onSelectField={(fieldId) => dispatch({ type: 'SELECT_FIELD', fieldId })}
    />
  );
}

function buildUpdateRequest(form: Form): UpdateFormRequest {
  return {
    name: form.name,
    description: form.description ?? undefined,
    settings: form.settings,
    theme: form.theme,
    fields: form.fields.map((f) => ({
      id: f.id,
      type: f.type,
      name: f.name,
      label: f.label,
      placeholder: f.placeholder ?? undefined,
      helpText: f.helpText ?? undefined,
      fieldOrder: f.fieldOrder,
      page: f.page,
      required: f.required,
      defaultValue: f.defaultValue ?? undefined,
      validationRules: f.validationRules,
      options: f.options ?? undefined,
      config: f.config,
      visibilityRules: f.visibilityRules ?? undefined,
    })),
  };
}

function formatFieldTypeLabel(type: string): string {
  return type
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

function needsOptions(type: FormField['type']): boolean {
  return ['SELECT', 'MULTI_SELECT', 'RADIO'].includes(type);
}
