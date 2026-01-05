import { useState, useEffect } from 'react';
import { useInvestigationStore } from './store/useInvestigationStore';
import { FormRenderer } from './components/FormRenderer';
import { InvestigationSchema } from './types/schema';
import { generateMarkdown } from './lib/exportUtils';
// @ts-ignore
import resourceUsageSchema from './templates/resource-usage.json';

function App() {
  const { 
    setSchema, currentStepIndex, nextStep, prevStep, 
    isStepComplete, canAccessStep, activeSchema, answers, goToStep 
  } = useInvestigationStore();

  const [isFinished, setIsFinished] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setSchema(resourceUsageSchema as InvestigationSchema);
  }, [setSchema]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!activeSchema) return null;

  if (isFinished) {
    const markdownReport = generateMarkdown(activeSchema, answers);
    return (
      <div className="flex flex-col items-center min-h-screen bg-slate-100 p-6 sm:p-12">
        {/* Actions Header - Hidden during print */}
        <div className="w-full max-w-4xl mb-6 flex justify-between items-center no-print">
          <button 
            onClick={() => setIsFinished(false)}
            className="text-slate-600 font-semibold hover:text-blue-600 transition-colors"
          >
            ← Back to Editor
          </button>
          <div className="flex gap-3">
            <button 
              onClick={() => handleCopy(markdownReport)}
              className="px-6 py-2 bg-white border border-slate-300 rounded-lg font-medium shadow-sm hover:bg-slate-50 transition-all"
            >
              {copied ? "✓ Copied" : "Copy Markdown"}
            </button>
            <button 
              onClick={() => window.print()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-all"
            >
              Print to PDF
            </button>
          </div>
        </div>

        {/* The Print Report Container */}
        <div className="print-report w-full max-w-4xl bg-white shadow-2xl rounded-2xl border border-slate-200 p-12 overflow-hidden">
          <header className="border-b-4 border-blue-600 pb-6 mb-10">
            <h1 className="text-3xl font-bold text-slate-900">{activeSchema.title}</h1>
            <p className="text-slate-500 mt-2 font-medium">Investigation Summary Report</p>
          </header>

          <div className="space-y-12">
            {activeSchema.steps.map((step) => {
              // Check if any fields in this step have answers
              const hasAnswers = step.fields.some(f => answers[f.id]);
              if (!hasAnswers) return null;

              return (
                <section key={step.id} className="break-inside-avoid">
                  <h2 className="text-xl font-bold text-blue-800 mb-6 bg-blue-50/50 p-2 rounded tracking-tight uppercase text-sm">
                    {step.title}
                  </h2>
                  <div className="grid gap-6 pl-4 border-l-2 border-slate-100">
                    {step.fields.map((field) => {
                      const value = answers[field.id];
                      if (!value) return null;

                      return (
                        <div key={field.id} className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            {field.label}
                          </label>
                          
                          {field.type === 'image' ? (
                            <div className="mt-2 max-w-xl">
                              <img 
                                src={value} 
                                alt="Evidence Screenshot" 
                                className="rounded-lg border border-slate-200 shadow-sm w-full h-auto" 
                              />
                            </div>
                          ) : field.type === 'code' ? (
                            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs font-mono overflow-x-auto">
                              {value}
                            </pre>
                          ) : (
                            <p className="text-slate-800 font-medium whitespace-pre-wrap">{value}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col hidden lg:flex no-print shadow-sm">
         <div className="p-8 border-b border-slate-100">
          <h1 className="text-2xl font-black text-blue-600 tracking-tighter italic">SupportGuide</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">Datto EDR Diagnostic Tool</p>
        </div>
        <nav className="p-4 space-y-1 overflow-y-auto flex-1">
          {activeSchema.steps.map((step, idx) => (
            <button
              key={step.id}
              disabled={!canAccessStep(idx)}
              onClick={() => goToStep(idx)}
              className={`w-full text-left p-4 rounded-xl text-sm transition-all flex items-center gap-4 group ${
                currentStepIndex === idx 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 ring-4 ring-blue-50' 
                  : 'text-slate-500 hover:bg-slate-50'
              } disabled:opacity-20`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition-colors ${
                currentStepIndex === idx ? 'bg-blue-500 border-blue-400 text-white' : 'bg-slate-100 border-slate-200 text-slate-400'
              }`}>
                {idx + 1}
              </span>
              <span className="font-bold truncate">{step.title}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto flex flex-col items-center">
        <div className="w-full max-w-2xl px-4 py-16">
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden transition-all duration-500">
            <div className="p-12">
              <FormRenderer />
            </div>
            
            <div className="px-10 py-8 bg-slate-50/80 border-t border-slate-100 flex justify-between items-center">
              <button 
                onClick={prevStep} 
                disabled={currentStepIndex === 0} 
                className="px-6 py-2 text-slate-400 font-bold hover:text-slate-600 disabled:opacity-0 transition-all"
              >
                Back
              </button>
              
              <div className="flex items-center gap-6">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] hidden sm:inline">
                  Step {currentStepIndex + 1} of {activeSchema.steps.length}
                </span>
                {currentStepIndex < activeSchema.steps.length - 1 ? (
                  <button 
                    onClick={nextStep} 
                    disabled={!isStepComplete(currentStepIndex)} 
                    className="px-10 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 active:translate-y-0 disabled:bg-slate-200 disabled:shadow-none disabled:text-slate-400 transition-all"
                  >
                    Next Step
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsFinished(true)}
                    disabled={!isStepComplete(currentStepIndex)} 
                    className="px-12 py-3 bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-200 hover:bg-green-700 hover:-translate-y-0.5 active:translate-y-0 disabled:bg-slate-200 transition-all"
                  >
                    Generate Report
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Progress Bar under the form */}
          <div className="mt-8 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-500 ease-out"
              style={{ width: `${((currentStepIndex + 1) / activeSchema.steps.length) * 100}%` }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;