// src/types/schema.ts
export type FieldType = 'text' | 'textarea' | 'select' | 'code';

export interface Field {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { label: string; value: string }[]; // For selects
  placeholder?: string;
}

export interface Step {
  id: string;
  title: string;
  description: string;
  fields: Field[];
}

export interface InvestigationSchema {
  id: string;
  title: string;
  steps: Step[];
}
