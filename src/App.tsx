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

  setSchema: (schema) => set({ activeSchema: schema, answers: {}, currentStepIndex: 0 }),

  setAnswer: (fieldId, value) => 
    set((state) => ({ answers: { ...state.answers, [fieldId]: value } })),

  nextStep: () => set((state) => {
    const totalSteps = state.activeSchema?.steps?.length || 0;
    // PREVENT OUT OF BOUNDS: Only increment if we aren't at the last step
    if (state.currentStepIndex < totalSteps - 1) {
      return { currentStepIndex: state.currentStepIndex + 1 };
    }
    return state;
  }),

  prevStep: () => set((state) => ({ currentStepIndex: Math.max(0, state.currentStepIndex - 1) })),
  
  goToStep: (index) => set((state) => {
    const totalSteps = state.activeSchema?.steps?.length || 0;
    if (index >= 0 && index < totalSteps) {
      return { currentStepIndex: index };
    }
    return state;
  }),

  isStepComplete: (stepIndex) => {
    const state = get();
    const step = state.activeSchema?.steps?.[stepIndex];
    if (!step || !step.fields) return false;

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
    const steps = state.activeSchema?.steps || [];
    if (stepIndex >= steps.length) return false;

    for (let i = 0; i < stepIndex; i++) {
      if (!state.isStepComplete(i)) return false;
    }
    return true;
  }
}));