import { create } from 'zustand';
import { InvestigationSchema } from '../types/schema';

interface InvestigationState {
  activeSchema: InvestigationSchema | null;
  answers: Record<string, any>;
  currentStepIndex: number;
  setSchema: (schema: InvestigationSchema) => void;
  setAnswer: (fieldId: string, value: any) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
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

  isStepComplete: (stepIndex) => {
    const state = get();
    const step = state.activeSchema?.steps[stepIndex];
    
    // Safety check: if step or fields are missing, it's not complete (and won't crash)
    if (!step || !step.fields) return false;

    // Special logic for Evidence step
    if (step.id === 'evidence') {
      return !!state.answers['screenshot_upload'] || !!state.answers['top_output'];
    }

    return step.fields
      .filter(f => f.required)
      .every(f => !!state.answers[f.id] && state.answers[f.id] !== '');
  },

  canAccessStep: (stepIndex) => {
    const state = get();
    if (stepIndex === 0) return true;
    for (let i = 0; i < stepIndex; i++) {
      if (!state.isStepComplete(i)) return false;
    }
    return true;
  }
}));