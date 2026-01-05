import { useEffect } from 'react';
import { useInvestigationStore } from './store/useInvestigationStore';
import { FormRenderer } from './components/FormRenderer';
import { InvestigationSchema } from './types/schema';
// @ts-ignore - Importing JSON directly
import resourceUsageSchema from './templates/resource-usage.json';

function App() {
  const { 
    setSchema, 
    currentStepIndex, 
    nextStep, 
    prevStep, 
    isStepComplete, 
    canAccessStep, 
    activeSchema,
    goToStep 
  } = useInvestigationStore();

  // Load the "Resource Usage" schema automatically on startup
  useEffect(() => {
    setSchema(resourceUsageSchema as InvestigationSchema);
  }, [setSchema]);

  if (!activeSchema) return <div className="p-10 text-center">Loading template...</div>;

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar - Navigation Gates */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">SupportGuide</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase font-semibold">Investigation Wizard</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {activeSchema.steps.map((step, idx) => {
            const isAccessible = canAccessStep(idx);
            const isActive = currentStepIndex === idx;
            
            return (
              <button
                key={step.id}
                disabled={!isAccessible}
                onClick={() => goToStep(idx)}
                className={`w-full text-left p-3 rounded-lg text-sm transition-all flex items-center gap-3 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                    : isAccessible 
                      ? 'text-slate-600 hover:bg-slate-50' 
                      : 'text-slate-300 cursor-not-allowed'
                }`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                  isActive ? 'border-blue-400 bg-blue-500' : 'border-slate-200'
                }`}>
                  {idx + 1}
                </span>
                {step.title}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Form Area */}
      <main className="flex-1 overflow-y-auto p-12">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-8">
              <FormRenderer />
            </div>

            {/* Navigation Footer */}
            <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-between items-center">
              <button 
                onClick={prevStep}
                disabled={currentStepIndex === 0}
                className="px-5 py-2 text-slate-600 font-medium disabled:opacity-30 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Back
              </button>
              
              <div className="flex gap-4">
                {currentStepIndex < activeSchema.steps.length - 1 ? (
                  <button 
                    onClick={nextStep}
                    disabled={!isStepComplete(currentStepIndex)}
                    className="px-8 py-2 bg-blue-600 text-white font-bold rounded-lg shadow-lg shadow-blue-100 disabled:bg-slate-300 disabled:shadow-none hover:bg-blue-700 transition-all"
                  >
                    Next Step
                  </button>
                ) : (
                  <button 
                    disabled={!isStepComplete(currentStepIndex)}
                    className="px-8 py-2 bg-green-600 text-white font-bold rounded-lg shadow-lg shadow-green-100 disabled:bg-slate-300 disabled:shadow-none hover:bg-green-700 transition-all"
                  >
                    Finish & Export
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
