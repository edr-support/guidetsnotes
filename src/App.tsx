import { useEffect } from 'react';
import { useInvestigationStore } from './store/useInvestigationStore';
import { FormRenderer } from './components/FormRenderer';
import { InvestigationSchema } from './types/schema';
// @ts-ignore
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

  useEffect(() => {
    setSchema(resourceUsageSchema as InvestigationSchema);
  }, [setSchema]);

  if (!activeSchema) return <div className="flex justify-center p-10">Loading...</div>;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-bold tracking-tight text-blue-600">SupportGuide</h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">Investigation Wizard</p>
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
                className={`w-full text-left p-3 rounded-xl text-sm transition-all flex items-center gap-4 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                    : isAccessible 
                      ? 'text-slate-600 hover:bg-slate-50' 
                      : 'text-slate-300 cursor-not-allowed'
                }`}
              >
                <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${
                  isActive ? 'border-blue-300 bg-blue-500' : 'border-slate-200'
                }`}>
                  {idx + 1}
                </span>
                <span className="font-medium truncate">{step.title}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full flex flex-col items-center justify-start p-8 md:p-12">
          {/* Form Card */}
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
            <div className="p-8 md:p-10">
              <FormRenderer />
            </div>

            {/* Sticky Footer */}
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center rounded-b-2xl">
              <button 
                onClick={prevStep}
                disabled={currentStepIndex === 0}
                className="px-6 py-2 text-slate-500 font-semibold disabled:opacity-0 hover:text-slate-800 transition-all"
              >
                Back
              </button>
              
              <div className="flex gap-4">
                {currentStepIndex < activeSchema.steps.length - 1 ? (
                  <button 
                    onClick={nextStep}
                    disabled={!isStepComplete(currentStepIndex)}
                    className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-md shadow-blue-100 disabled:bg-slate-200 disabled:shadow-none hover:bg-blue-700 transition-all active:scale-95"
                  >
                    Next Step
                  </button>
                ) : (
                  <button 
                    disabled={!isStepComplete(currentStepIndex)}
                    className="px-8 py-2.5 bg-green-600 text-white font-bold rounded-xl shadow-md shadow-green-100 disabled:bg-slate-200 disabled:shadow-none hover:bg-green-700 transition-all active:scale-95"
                  >
                    Finish & Export
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <p className="mt-8 text-slate-400 text-xs font-medium">
            All data remains client-side in your browser.
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
