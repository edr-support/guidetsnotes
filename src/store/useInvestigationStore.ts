import { create } from 'zustand';
import { InvestigationSchema } from '../types/schema';

interface InvestigationState {
  activeSchema: InvestigationSchema | null;
  answers: Record<string, any>;
  currentStepIndex: number;
  
  // Actions
  setSchema: (schema: InvestigationSchema) => void;
  setAnswer: (fieldId: string, value: any) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  
  // Logic Helpers
  isStepComplete: (stepIndex: number) => boolean;
  canAccessStep: (stepIndex: number) => boolean;
}

export const useInvestigationStore = create<InvestigationState>((set, get) => ({
  activeSchema: null,
  answers: {},
  currentStepIndex: 0,

  setSchema: (schema) => set({ 
    activeSchema: schema, 
    answers: {}, 
    currentStepIndex: 0 
  }),

  setAnswer: (fieldId, value) => 
    set((state) => ({
      answers: { ...state.answers, [fieldId]: value }
    })),

  nextStep: () => set((state) => ({ currentStepIndex: state.currentStepIndex + 1 })),
  prevStep: () => set((state) => ({ currentStepIndex: Math.max(0, state.currentStepIndex - 1) })),
  goToStep: (index) => set({ currentStepIndex: index }),

  // A step is complete if all 'required' fields have a value
  isStepComplete: (stepIndex) => {
    const state = get();
    if (!state.activeSchema) return false;
    const step = state.activeSchema.steps[stepIndex];
    return step.fields
      .filter(f => f.required)
      .every(f => !!state.answers[f.id] && state.answers[f.id] !== '');
  },

  // A user can access a step if ALL previous steps are complete
  canAccessStep: (stepIndex) => {
    const state = get();
    if (stepIndex === 0) return true;
    for (let i = 0; i < stepIndex; i++) {
      if (!state.isStepComplete(i)) return false;
    }
    return true;
  }
}));
